import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { dataStore } from './server/dataStore.js';
import {
  isFirestoreEnabled,
  getFirestoreDb,
  loadCollectionFromFirestore,
  syncDocToFirestore,
  deleteDocFromFirestore,
} from './server/firestore.js';
import { startArticleSeoCache } from './server/seoCache.js';
import { getBlogSnapshot } from './server/blogSnapshot.js';
import { BLOG_BUNDLE } from './server/blogBundle.js';
import { 
  resolveRouteMetadata, 
  injectSeoTagsIntoHtml, 
  injectNoindexIntoHtml,
  generate404Html,
  generateDynamicSitemapXml,
  generateRobotsTxt,
  isCrawlerBot
} from './server/seoRender.js';

// PROMPT-3: requireAdmin attaches the session's admin email here so audit
// trails (invoice history, fee reminders) record the real admin.
declare global {
  namespace Express {
    interface Request {
      adminEmail?: string;
    }
  }
}

dotenv.config();

// HTML-escape user input to prevent HTML injection in emails
function escapeHtml(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Helper to send email alerts to Admin if SMTP is configured
async function sendAdminNotificationEmail(subject: string, htmlContent: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@alnoorquranacademy.com';
    const emailPassRaw = process.env.EMAIL_PASS || '';
    const emailPass = emailPassRaw.replace(/\s+/g, ''); // strip spaces if app password

    if (!emailPass || emailPass === 'optional' || emailPass === 'none') {
      return; // SMTP not configured yet, skip silently
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmail,
        pass: emailPass
      }
    });

    await transporter.sendMail({
      from: `"Noor-e-Quran Institute" <${adminEmail}>`,
      to: adminEmail,
      subject: `[Noor-e-Quran Alert] ${subject}`,
      html: htmlContent
    });
    console.log(`Notification email sent to ${adminEmail}: ${subject}`);
  } catch (err: any) {
    console.warn('Could not send notification email:', err.message);
  }
}

// Helper to send OTP directly to Student's Email
async function sendStudentOtpEmail(toEmail: string, studentName: string, otpCode: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'contact.noorequraninstitute@gmail.com';
    const emailPassRaw = process.env.EMAIL_PASS || '';
    const emailPass = emailPassRaw.replace(/\s+/g, '');

    if (!emailPass || emailPass === 'optional' || emailPass === 'none') {
      console.log(`[SMTP Not configured] Simulated Student OTP Email to ${toEmail}: ${otpCode}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmail,
        pass: emailPass
      }
    });

    await transporter.sendMail({
      from: `"Noor-e-Quran Institute" <${adminEmail}>`,
      to: toEmail,
      subject: `Your Noor-e-Quran Institute Verification OTP Code: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #064E3B; margin: 0; font-size: 24px;">Noor-e-Quran Institute</h2>
            <p style="color: #666; font-size: 13px; margin-top: 4px;">Online Quran Learning & Islamic Education</p>
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <p style="color: #166534; font-size: 15px; margin: 0 0 10px 0;">Assalam-o-Alaikum <strong>${studentName || 'Student'}</strong>,</p>
            <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">Your verification OTP code for creating your student account is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #064E3B; background: #ffffff; padding: 12px 24px; border-radius: 8px; display: inline-block; border: 2px dashed #059669;">
              ${otpCode}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 15px;">This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
          </div>
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">
            If you did not request this OTP, please ignore this email.<br/>
            Noor-e-Quran Institute • Helpline: +92 327 4496163
          </p>
        </div>
      `
    });
    console.log(`Student OTP email dispatched directly to ${toEmail} for ${studentName}`);
  } catch (err: any) {
    console.warn('Could not send student OTP email:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Hardening: Disable Express technology fingerprinting header
app.disable('x-powered-by');

// 301 Permanent Redirect to canonical custom domain (Noor-e-Quran Institute)
const CUSTOM_CANONICAL_DOMAIN = process.env.CUSTOM_DOMAIN || process.env.CANONICAL_HOST || 'noorequraninstitute.me';

app.use((req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host') || '';
  if (host.includes('onrender.com') || (CUSTOM_CANONICAL_DOMAIN && host !== CUSTOM_CANONICAL_DOMAIN && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('0.0.0.0'))) {
    return res.redirect(301, `https://${CUSTOM_CANONICAL_DOMAIN}${req.originalUrl}`);
  }
  next();
});

// Canonical URLs: 301-strip trailing slashes on page routes (e.g. /blog/<slug>/, /packages/)
// so slash variants don't serve duplicate 200 content. API routes, the root path,
// and file URLs (with an extension, e.g. /sitemap.xml) are left untouched.
app.use((req: Request, res: Response, next: NextFunction) => {
  const p = req.path;
  if (req.method === 'GET' && p.length > 1 && p.endsWith('/') && !p.startsWith('/api') && !/\.[a-zA-Z0-9]+$/.test(p)) {
    const qi = req.url.indexOf('?');
    const qs = qi >= 0 ? req.url.slice(qi) : '';
    return res.redirect(301, p.replace(/\/+$/, '') + qs);
  }
  next();
});

// Comprehensive Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // 1. Content Security Policy (Hardened for Production with Clarity, Jitsi, Google Auth, and IndexNow support)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://*.clarity.ms https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com https://meet.jit.si https://*.jitsi.net https://8x8.vc https://*.8x8.vc",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: https://*.googleusercontent.com https://images.unsplash.com https://*.jitsi.net https://res.cloudinary.com https://c.bing.com https://*.clarity.ms",
    "connect-src 'self' https://*.clarity.ms https://c.bing.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://meet.jit.si https://*.jitsi.net wss://meet.jit.si wss://*.jitsi.net https://8x8.vc https://*.8x8.vc wss://8x8.vc wss://*.8x8.vc https://api.ipify.org https://api.cloudinary.com https://api.indexnow.org",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://meet.jit.si https://*.jitsi.net https://8x8.vc https://*.8x8.vc",
    "media-src 'self' blob: data: https: https://meet.jit.si https://*.jitsi.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // 2. Strict-Transport-Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // 3. Cross-Origin-Opener-Policy (COOP)
  // NOTE: Set to 'same-origin-allow-popups' so Firebase Google Auth popup & WhatsApp window triggers function smoothly without window.opener isolation errors.
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // 4. Additional Hardening Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self "https://meet.jit.si" "https://8x8.vc"), microphone=(self "https://meet.jit.si" "https://8x8.vc"), display-capture=(self), geolocation=()');

  next();
});

// High-Performance Compression (Gzip / Brotli)
app.use(compression());

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// -------------------------------------------------------------
// Admin login brute-force protection (in-memory rate limiter)
// Counts FAILED attempts only: 10 failures per IP within 15 min
// triggers a 429. No new dependency required.
// -------------------------------------------------------------
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 10;
const loginFailures = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  const socketIp = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
  // Only trust Cloudflare's client-IP header when the direct peer is actually
  // Cloudflare's network. This prevents attackers bypassing Cloudflare and
  // hitting the origin directly from spoofing cf-connecting-ip to evade
  // rate limits.
  if (isCloudflareIp(socketIp)) {
    const cf = (req.headers['cf-connecting-ip'] as string) || '';
    if (cf) return cf.split(',')[0].trim();
  }
  // Otherwise use the direct peer IP (or X-Forwarded-For only as a hint
  // when we know we're behind a trusted proxy — here we do NOT trust it
  // from untrusted peers).
  return socketIp;
}

// Cloudflare's published IPv4 ranges (https://www.cloudflare.com/ips/).
// Used to validate that cf-connecting-ip comes from Cloudflare itself.
const CLOUDFLARE_IPV4_RANGES = [
  '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '104.16.0.0/13',
  '104.24.0.0/14', '108.162.192.0/18', '131.0.72.0/22', '141.101.64.0/18',
  '162.158.0.0/15', '172.64.0.0/13', '173.245.48.0/20', '188.114.96.0/20',
  '190.93.240.0/20', '197.234.240.0/22', '198.41.128.0/17',
];

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let num = 0;
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (isNaN(n) || n < 0 || n > 255) return null;
    num = (num << 8) + n;
  }
  return num >>> 0;
}

function isCloudflareIp(ip: string): boolean {
  // Strip IPv6-mapped IPv4 prefix (::ffff:1.2.3.4)
  const clean = ip.replace(/^::ffff:/, '');
  const ipNum = ipToInt(clean);
  if (ipNum === null) return false;
  for (const range of CLOUDFLARE_IPV4_RANGES) {
    const [base, bits] = range.split('/');
    const baseNum = ipToInt(base);
    if (baseNum === null) continue;
    const mask = bits === '0' ? 0 : (~((1 << (32 - parseInt(bits, 10))) - 1) >>> 0);
    if ((ipNum & mask) === (baseNum & mask)) return true;
  }
  return false;
}

function getLoginFailureRecord(ip: string) {
  const now = Date.now();
  let rec = loginFailures.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + LOGIN_WINDOW_MS };
    loginFailures.set(ip, rec);
  }
  return rec;
}

function checkAdminLoginRateLimit(req: Request, res: Response, next: NextFunction) {
  const rec = getLoginFailureRecord(clientIp(req));
  if (rec.count >= LOGIN_MAX_FAILURES) {
    const retryAfter = Math.max(1, Math.ceil((rec.resetAt - Date.now()) / 1000));
    res.setHeader('Retry-After', retryAfter.toString());
    return res.status(429).json({ error: 'Too many failed login attempts. Please try again in a few minutes.' });
  }
  next();
}

// General rate limiter for public endpoints (spam/abuse prevention)
const publicRateLimits = new Map<string, { count: number; resetAt: number }>();
const PUBLIC_RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const PUBLIC_RATE_MAX = 20; // 20 requests per IP per 15 min
function checkPublicRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = clientIp(req);
  const now = Date.now();
  let rec = publicRateLimits.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + PUBLIC_RATE_WINDOW_MS };
    publicRateLimits.set(ip, rec);
  }
  rec.count += 1;
  if (rec.count > PUBLIC_RATE_MAX) {
    const retryAfter = Math.max(1, Math.ceil((rec.resetAt - now) / 1000));
    res.setHeader('Retry-After', retryAfter.toString());
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  next();
}

function recordAdminLoginFailure(req: Request) {
  getLoginFailureRecord(clientIp(req)).count += 1;
}

// Static uploads folder for uploaded blog media
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
}
app.use('/uploads', express.static(uploadsDir));

// Search Engine SEO & Agentic Browsing files
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(200).json({
    status: 'ok',
    message: 'Noor-e-Quran Institute server is healthy and active.',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/healthz', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(200).send('OK');
});

app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(robotsPath);
  }
  const txt = generateRobotsTxt();
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(txt);
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.sendFile(sitemapPath);
  }
  const xml = generateDynamicSitemapXml();
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(xml);
});

app.get('/llms.txt', (req, res) => {
  const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
  if (fs.existsSync(llmsPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(llmsPath);
  }
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.send("# Noor-e-Quran Institute\nOnline 1-on-1 Quran Classes with Tajweed\nWebsite: https://noorequraninstitute.me\n");
});

// RFC 9116 Security.txt for vulnerability reporting
const handleSecurityTxt = (req: Request, res: Response) => {
  const securityPath = path.join(process.cwd(), 'public', '.well-known', 'security.txt');
  if (fs.existsSync(securityPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(securityPath);
  }
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.send("Contact: mailto:info@noorequraninstitute.me\nContact: https://noorequraninstitute.me/contact-us\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: en, ur, ar\nCanonical: https://noorequraninstitute.me/.well-known/security.txt\nPolicy: https://noorequraninstitute.me/about-us\n");
};

app.get('/.well-known/security.txt', handleSecurityTxt);
app.get('/security.txt', handleSecurityTxt);

// Security hardening: Reject dangerous HTTP methods (TRACE, TRACK)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'TRACE' || req.method === 'TRACK') {
    return res.status(405).send('Method Not Allowed');
  }
  next();
});

// Admin Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
  }

  const token = authHeader.substring(7);
  if (!dataStore.isValidToken(token)) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  // PROMPT-3: attach the real admin email from the session for audit trails.
  req.adminEmail = getTokenEmail(req);

  next();
}

/** Email stored on the admin session for this request's bearer token. */
function getTokenEmail(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  return dataStore.getTokenEmail(authHeader.substring(7)) || undefined;
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// In-memory OTP Store with expiration
interface OtpRecord {
  code: string;
  phone: string;
  email?: string;
  studentName?: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpRecord>();

// Helper to normalize phone number
function normalizePhone(p: string): string {
  return p.replace(/[^0-9+]/g, '');
}

// 1. Send OTP to Student Phone / WhatsApp & Email
app.post('/api/auth/send-phone-otp', checkPublicRateLimit, (req, res) => {
  try {
    const { phone, email, studentName } = req.body;
    if (!phone || phone.trim().length < 7) {
      return res.status(400).json({ error: 'Please enter a valid WhatsApp or mobile phone number.' });
    }

    const cleanPhone = normalizePhone(phone);
    // Generate cryptographically secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanPhone, {
      code: otpCode,
      phone: cleanPhone,
      email: email || '',
      studentName: studentName || 'Student',
      expiresAt,
      attempts: 0
    });

    console.log(`[NOOR-E-QURAN OTP] Secure OTP created for student ${studentName || 'Student'} (${cleanPhone}, ${email || 'No email'})`);

    // Prepare direct WhatsApp verification link for the student's number
    const waText = encodeURIComponent(
      `Assalam-o-Alaikum ${studentName || ''}! Your Noor-e-Quran Institute verification OTP code is: *${otpCode}*.\n\nPlease enter this code to verify your phone number and complete your student registration.`
    );
    const whatsappLink = `https://wa.me/${cleanPhone.replace('+', '')}?text=${waText}`;

    // Send OTP email directly to the STUDENT'S entered email address
    if (email && email.includes('@')) {
      sendStudentOtpEmail(email.trim(), studentName || 'Student', otpCode);
    }

    // Security: Do NOT return the OTP code in the client response
    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your email (${email}) and phone (${phone}).`,
      phone: cleanPhone,
      whatsappLink,
      expiresInSeconds: 600
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

// 2. Verify Student Phone OTP
app.post('/api/auth/verify-phone-otp', checkPublicRateLimit, (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and 6-digit OTP are required.' });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanOtp = otp.toString().trim();
    const record = otpStore.get(cleanPhone);

    if (!record) {
      return res.status(400).json({
        error: 'No active OTP request found for this phone number. Please request a new OTP.'
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        error: 'Verification code has expired. Please request a new OTP.'
      });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        error: 'Too many incorrect attempts. Please request a fresh OTP.'
      });
    }

    if (record.code !== cleanOtp) {
      return res.status(400).json({
        error: 'Incorrect 6-digit verification code. Please check and try again.'
      });
    }

    // Success - consume OTP
    otpStore.delete(cleanPhone);

    res.json({
      success: true,
      verified: true,
      message: 'Phone number verified successfully!'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to verify OTP' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', academy: 'Noor-e-Quran Institute', timestamp: new Date().toISOString() });
});

// Courses
app.get('/api/courses', (req, res) => {
  try {
    const courses = dataStore.getCourses();
    res.json({ success: true, courses });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/:slug', (req, res) => {
  try {
    const course = dataStore.getCourseBySlug(req.params.slug);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Packages
app.get('/api/packages', (req, res) => {
  try {
    const packages = dataStore.getPackages();
    res.json({ success: true, packages });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Tutors (Public directory)
app.get('/api/tutors', (req, res) => {
  try {
    const tutors = dataStore.getTutors();
    res.json({ success: true, tutors });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// Testimonials
app.get('/api/testimonials', (req, res) => {
  try {
    const testimonials = dataStore.getTestimonials();
    res.json({ success: true, testimonials });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Articles
app.get('/api/articles', (req, res) => {
  try {
    const articles = dataStore.getArticles();
    res.json({ success: true, articles });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Public blog posts — served via the Admin SDK because the Firestore security
// rules on the named database deny unauthenticated client reads (403), which
// used to make the public /blog page silently fall back to 6 local articles.
// Blog payload diet (2026-10-20): the list endpoint used to ship every
// article's full content + full-size base64 cover (5.6 MB, ~6 s). List
// responses now drop the body and point covers at the resizing
// /api/blog-image/:slug endpoint. Reading time is normalized to 2–5 minutes
// (user request: long read times discourage readers).
function blogReadTime(content: string): string {
  const words = String(content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_>`~|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.min(5, Math.max(2, Math.round(words / 200)));
  return `${mins} min read`;
}

const blogImageCache = new Map<string, Buffer>();

// Self-heal (2026-10-20): three published posts vanished from the Firestore
// collection without the owner deleting them. Any snapshot post missing from
// the live collection is served immediately AND written back to Firestore
// (once per process per slug), so the public blog is always complete.
// GitHub resilience (2026-10-20, user directive): repo-bundled articles
// (server/blog-data/<slug>.ts via BLOG_BUNDLE) are merged in as a final
// read-only layer — served when missing from both Firestore and the
// snapshot, never written back (a bundle file is the source of truth).
const blogRestoredSlugs = new Set<string>();
// Repair guard (2026-10-22): Firestore docs restored from content-less
// snapshots (written from the list-view API response) are missing their
// bodies. The repo bundle is the source of truth for their content.
const blogRepairedSlugs = new Set<string>();
const bundleBySlug = new Map<string, any>(BLOG_BUNDLE.map((b: any) => [b.slug, b]));
function mergeBlogDocsWithSnapshot(liveDocs: any[]): any[] {
  const seen = new Set(liveDocs.map((d: any) => d.slug));
  const merged = [...liveDocs];
  // Repair pass: a Firestore doc that lost its content (restored from a
  // content-less snapshot) gets its body back from the repo bundle, and the
  // repaired doc is written back to Firestore (once per process per slug).
  // Author sync (2026-10-24): the bundle is also the source of truth for the
  // author byline — every article is by M Muddasir Hameed, so a stale
  // Firestore author is corrected the same way and written back once.
  for (const d of merged) {
    const b = d.slug ? bundleBySlug.get(d.slug) : undefined;
    if (!b) continue;
    let dirty = false;
    if (b.content && !d.content) {
      d.content = b.content;
      dirty = true;
    }
    if (b.author && d.author !== b.author) {
      d.author = b.author;
      dirty = true;
    }
    if (dirty && d.id && !blogRepairedSlugs.has(d.slug)) {
      blogRepairedSlugs.add(d.slug);
      syncDocToFirestore('blogPosts', String(d.id), d).catch(() => {});
    }
  }
  const snap = getBlogSnapshot();
  for (const p of snap) {
    if (p.slug && !seen.has(p.slug)) {
      seen.add(p.slug);
      merged.push(p);
      if (p.id && !blogRestoredSlugs.has(p.slug)) {
        blogRestoredSlugs.add(p.slug);
        syncDocToFirestore('blogPosts', String(p.id), p).catch(() => {});
      }
    }
  }
  for (const b of BLOG_BUNDLE) {
    if (b.slug && !seen.has(b.slug)) {
      seen.add(b.slug);
      merged.push(b);
    }
  }
  return merged;
}

app.get('/api/blog-image/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '');
    const cached = blogImageCache.get(slug);
    if (cached) {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cached);
    }
    const docs = await loadCollectionFromFirestore('blogPosts');
    const allDocs = mergeBlogDocsWithSnapshot(docs);
    const post: any = allDocs.find((d: any) => d.slug === slug);
    const img = post?.featuredImage;
    if (!img || typeof img !== 'string') {
      return res.status(404).json({ error: 'Image not found' });
    }
    if (img.startsWith('data:')) {
      const base64 = img.split(',')[1] || '';
      const input = Buffer.from(base64, 'base64');
      const sharp = (await import('sharp')).default;
      const out = await sharp(input)
        .resize({ width: 900, withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer();
      blogImageCache.set(slug, out);
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(out);
    }
    // URL / path image: hand the browser the original (it caches it itself)
    return res.redirect(302, img);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load image' });
  }
});

app.get('/api/blog-posts', async (req, res) => {
  try {
    const liveDocs = await loadCollectionFromFirestore('blogPosts');
    // Never serve an incomplete blog: merge in any snapshot posts missing
    // from the live collection (they are also restored to Firestore).
    const docs = mergeBlogDocsWithSnapshot(liveDocs);
    const slug = typeof req.query.slug === 'string' ? req.query.slug.trim() : '';
    let posts = docs.filter((d: any) => d.published !== false && d.status !== 'draft');
    if (slug) {
      posts = posts
        .filter((d: any) => d.slug === slug)
        .map((p: any) => ({ ...p, readTime: blogReadTime(p.content || '') }));
    } else {
      posts = posts.map((p: any) => {
        const { content, ...rest } = p;
        return {
          ...rest,
          readTime: blogReadTime(content || ''),
          featuredImage:
            typeof rest.featuredImage === 'string' && rest.featuredImage.startsWith('data:')
              ? `/api/blog-image/${encodeURIComponent(rest.slug)}`
              : rest.featuredImage
        };
      });
    }
    posts = posts.sort((a: any, b: any) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    res.json({ success: true, posts });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Resources
app.get('/api/resources', (req, res) => {
  try {
    const resources = dataStore.getResources();
    res.json({ success: true, resources });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Book Free Trial (Lead Creation)
app.post('/api/book-trial', checkPublicRateLimit, (req, res) => {
  try {
    const {
      studentName,
      parentName,
      email,
      phone,
      whatsapp,
      mobile,
      country,
      courseId,
      courseName,
      tutorGender,
      tutorGenderPreference,
      preferredTutorId,
      preferredTutorName,
      timeSlot,
      preferredTimeSlot,
      preferredDays,
      preferredTimeRange,
      learningPace,
      notes
    } = req.body;

    const contactPhone = phone || whatsapp || mobile;
    const selectedTutor = tutorGender || tutorGenderPreference || 'No Preference';
    const selectedSlot = timeSlot || preferredTimeSlot || 'Evening';

    if (!studentName || !contactPhone || !courseName) {
      return res.status(400).json({
        error: 'Please fill in all required fields (Student Name, Phone/WhatsApp, and Course).'
      });
    }

    const lead = dataStore.addLead({
      studentName,
      parentName: parentName || '',
      email: email || '',
      phone: contactPhone,
      country: country || 'Worldwide',
      courseId: courseId || 'c-1',
      courseName,
      tutorGender: selectedTutor,
      preferredTutorId: preferredTutorId || undefined,
      preferredTutorName: preferredTutorName || undefined,
      timeSlot: selectedSlot,
      preferredDays: preferredDays || ['Monday', 'Tuesday', 'Wednesday'],
      preferredTimeRange: preferredTimeRange || '',
      learningPace: learningPace || 'Normal',
      initialNotes: notes
    });

    const waText = encodeURIComponent(
      `Assalam-o-Alaikum Noor-e-Quran Institute. I have registered for a 3-Day Free Trial.\n\n` +
      `*Student Name:* ${lead.studentName}\n` +
      `*Course:* ${lead.courseName}\n` +
      `*Tutor Preference:* ${lead.tutorGender}\n` +
      (preferredTutorName ? `*Preferred Teacher:* ${preferredTutorName}\n` : '') +
      `*Preferred Slot:* ${lead.timeSlot}\n` +
      `*Country:* ${lead.country}`
    );

    const whatsappUrl = `https://wa.me/923274496163?text=${waText}`;

    // Send email alert to admin
    sendAdminNotificationEmail(
      `New 3-Day Free Trial: ${lead.studentName} (${lead.courseName})`,
      `<h2>New Free Trial Request - Noor-e-Quran Institute</h2>
      <p><strong>Student Name:</strong> ${escapeHtml(lead.studentName)}</p>
      <p><strong>Parent/Guardian:</strong> ${escapeHtml(lead.parentName || 'N/A')}</p>
      <p><strong>WhatsApp / Phone:</strong> ${escapeHtml(lead.phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email || 'N/A')}</p>
      <p><strong>Course:</strong> ${escapeHtml(lead.courseName)}</p>
      <p><strong>Tutor Preference:</strong> ${escapeHtml(lead.tutorGender)}</p>
      <p><strong>Preferred Time:</strong> ${escapeHtml(lead.timeSlot)} (${escapeHtml(lead.preferredTimeRange || 'Standard')})</p>
      <p><strong>Preferred Days:</strong> ${escapeHtml((lead.preferredDays || []).join(', '))}</p>
      <p><strong>Learning Pace:</strong> ${escapeHtml(lead.learningPace || 'Normal')}</p>
      <p><strong>Country:</strong> ${escapeHtml(lead.country)}</p>
      <p><strong>Notes:</strong> ${escapeHtml(lead.notes?.[0]?.text || 'None')}</p>
      <hr/>
      <p><a href="${whatsappUrl}">Click here to message student on WhatsApp</a></p>`
    );

    res.status(201).json({
      success: true,
      message: 'Free trial request submitted successfully!',
      lead,
      whatsappUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit free trial request' });
  }
});

// Full Enrollment Application
app.post('/api/enroll', checkPublicRateLimit, (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      phone,
      whatsapp,
      country,
      parentName,
      parentPhone,
      parentEmail,
      courseId,
      courseName,
      packageId,
      packageName,
      tutorPreference,
      timeSlot,
      preferredDays,
      preferredTimeRange,
      learningPace,
      additionalNotes
    } = req.body;

    const contactPhone = phone || whatsapp || parentPhone;

    if (!studentName || !contactPhone || !courseName) {
      return res.status(400).json({
        error: 'Please fill in all required fields (Student Name, Phone, Course).'
      });
    }

    const application = dataStore.addEnrollment({
      studentName,
      studentEmail: studentEmail || '',
      phone: contactPhone,
      country: country || 'Worldwide',
      parentName: parentName || '',
      parentPhone: parentPhone || contactPhone,
      parentEmail: parentEmail || studentEmail || '',
      courseId: courseId || 'c-1',
      courseName,
      packageId: packageId || 'pkg-3days',
      packageName: packageName || 'Standard Learning (3 Days/Week)',
      tutorPreference: tutorPreference || 'No Preference',
      timeSlot: timeSlot || 'Evening',
      preferredDays: preferredDays || ['Monday', 'Wednesday', 'Friday'],
      preferredTimeRange: preferredTimeRange || '',
      learningPace: learningPace || 'Normal',
      additionalNotes: additionalNotes || ''
    });

    const waText = encodeURIComponent(
      `Assalam-o-Alaikum Noor-e-Quran Institute. I have submitted an Enrollment Application.\n\n` +
      `*Student Name:* ${application.studentName}\n` +
      `*Course:* ${application.courseName}\n` +
      `*Package:* ${application.packageName}\n` +
      `*Tutor Preference:* ${application.tutorPreference}\n` +
      `*Country:* ${application.country}`
    );

    const whatsappUrl = `https://wa.me/923274496163?text=${waText}`;

    sendAdminNotificationEmail(
      `New Student Enrollment: ${application.studentName} (${application.courseName})`,
      `<h2>New Enrollment Application - Noor-e-Quran Institute</h2>
      <p><strong>Student Name:</strong> ${escapeHtml(application.studentName)}</p>
      <p><strong>Parent/Guardian:</strong> ${escapeHtml(application.parentName || 'N/A')}</p>
      <p><strong>WhatsApp / Phone:</strong> ${escapeHtml(application.phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(application.studentEmail || application.parentEmail || 'N/A')}</p>
      <p><strong>Course:</strong> ${escapeHtml(application.courseName)}</p>
      <p><strong>Package:</strong> ${escapeHtml(application.packageName)}</p>
      <p><strong>Tutor Preference:</strong> ${escapeHtml(application.tutorPreference)}</p>
      <p><strong>Preferred Time:</strong> ${escapeHtml(application.timeSlot)} (${escapeHtml(application.preferredTimeRange || 'Standard')})</p>
      <p><strong>Days:</strong> ${escapeHtml((application.preferredDays || []).join(', '))}</p>
      <p><strong>Learning Pace:</strong> ${escapeHtml(application.learningPace || 'Normal')}</p>
      <p><strong>Country:</strong> ${escapeHtml(application.country)}</p>
      <p><strong>Additional Notes:</strong> ${escapeHtml(application.additionalNotes || 'None')}</p>
      <hr/>
      <p><a href="${whatsappUrl}">Click here to message student on WhatsApp</a></p>`
    );

    res.status(201).json({
      success: true,
      message: 'Enrollment application submitted successfully!',
      application,
      whatsappUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit enrollment application' });
  }
});

// Contact Form Submission
app.post('/api/contact', checkPublicRateLimit, (req, res) => {
  try {
    const { name, email, phone, country, subject, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required.' });
    }

    const msg = dataStore.addContact({
      name,
      email: email || '',
      phone: phone || '',
      country: country || 'Worldwide',
      subject: subject || 'General Inquiry',
      message
    });

    sendAdminNotificationEmail(
      `New Inquiry: ${msg.name} - ${msg.subject}`,
      `<h2>New Contact Inquiry - Noor-e-Quran Institute</h2>
      <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
      <p><strong>WhatsApp / Phone:</strong> ${escapeHtml(msg.phone) || 'N/A'}</p>
      <p><strong>Country:</strong> ${escapeHtml(msg.country) || 'N/A'}</p>
      <p><strong>Email:</strong> ${escapeHtml(msg.email) || 'N/A'}</p>
      <p><strong>Subject:</strong> ${escapeHtml(msg.subject)}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(msg.message).replace(/\n/g, '<br/>')}</p>`
    );

    res.status(201).json({
      success: true,
      message: 'JazakAllah Khair! Your message has been received. We will get back to you shortly.',
      msg
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send message' });
  }
});

// -------------------------------------------------------------
// PUBLIC CHAT (TEMPORARY) — two rooms, no accounts.
// CODE room: entry needs the shared 4-digit code. Session-only:
//   messages live only in server memory, expire, and clients start
//   empty on every page load, so a reload ends the session.
// OPEN room: fully open, no code at all. Messages PERSIST (memory
//   + Firestore write-through, reloaded on first request after a
//   restart) and stay until someone clears the room.
// -------------------------------------------------------------
const PUBLIC_CHAT_PIN = process.env.PUBLIC_CHAT_PIN || '7860';
interface PublicChatMessage { id: number; name: string; text: string; ts: number; cid: string; }
const codeChatMessages: PublicChatMessage[] = [];
let openChatMessages: PublicChatMessage[] = [];
let publicChatSeq = 0;
let openChatLoaded = false;
const CODE_CHAT_MAX = 100;
const OPEN_CHAT_MAX = 200;
const CODE_CHAT_TTL_MS = 2 * 60 * 60 * 1000;

function pruneCodeChat() {
  const cutoff = Date.now() - CODE_CHAT_TTL_MS;
  while (codeChatMessages.length && codeChatMessages[0].ts < cutoff) codeChatMessages.shift();
  while (codeChatMessages.length > CODE_CHAT_MAX) codeChatMessages.shift();
}

async function ensureOpenChatLoaded() {
  if (openChatLoaded) return;
  openChatLoaded = true;
  try {
    const rows = await loadCollectionFromFirestore('publicChatOpen');
    if (Array.isArray(rows)) {
      openChatMessages = rows
        .filter((r: any) => r && typeof r.ts === 'number' && typeof r.text === 'string')
        .map((r: any) => ({ id: Number(r.id) || 0, name: String(r.name || 'Guest'), text: r.text, ts: r.ts, cid: String(r.cid || '') }))
        .sort((a, b) => a.ts - b.ts)
        .slice(-OPEN_CHAT_MAX);
      for (const m of openChatMessages) if (m.id > publicChatSeq) publicChatSeq = m.id;
    }
  } catch {
    // Firestore unavailable: the open room simply starts empty.
  }
}

app.get('/api/public-chat/messages', async (req, res) => {
  const room = req.query.room === 'open' ? 'open' : 'code';
  if (room === 'code') {
    if (String(req.query.pin || '') !== PUBLIC_CHAT_PIN) {
      return res.status(401).json({ error: 'Invalid chat code.' });
    }
    pruneCodeChat();
    const since = Number(req.query.since || 0);
    return res.json({ messages: codeChatMessages.filter(m => m.ts > since) });
  }
  await ensureOpenChatLoaded();
  const since = Number(req.query.since || 0);
  res.json({ messages: openChatMessages.filter(m => m.ts > since) });
});

app.post('/api/public-chat/messages', checkPublicRateLimit, async (req, res) => {
  const { pin, name, text, cid, room: rawRoom } = req.body || {};
  const room = rawRoom === 'open' ? 'open' : 'code';
  if (room === 'code' && String(pin || '') !== PUBLIC_CHAT_PIN) {
    return res.status(401).json({ error: 'Invalid chat code.' });
  }
  const cleanName = String(name || '').trim().slice(0, 30);
  const cleanText = String(text || '').trim().slice(0, 4000);
  if (!cleanName || !cleanText) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  const msg: PublicChatMessage = {
    id: ++publicChatSeq,
    name: cleanName,
    text: cleanText,
    ts: Date.now(),
    cid: String(cid || '').slice(0, 40)
  };
  if (room === 'code') {
    pruneCodeChat();
    codeChatMessages.push(msg);
  } else {
    await ensureOpenChatLoaded();
    openChatMessages.push(msg);
    while (openChatMessages.length > OPEN_CHAT_MAX) openChatMessages.shift();
    syncDocToFirestore('publicChatOpen', String(msg.id), msg);
  }
  res.status(201).json({ message: msg });
});

app.post('/api/public-chat/clear', checkPublicRateLimit, async (req, res) => {
  const { pin, room: rawRoom } = req.body || {};
  const room = rawRoom === 'open' ? 'open' : 'code';
  if (room === 'code') {
    if (String(pin || '') !== PUBLIC_CHAT_PIN) {
      return res.status(401).json({ error: 'Invalid chat code.' });
    }
    codeChatMessages.length = 0;
    return res.json({ ok: true });
  }
  await ensureOpenChatLoaded();
  const ids = openChatMessages.map(m => String(m.id));
  openChatMessages = [];
  for (const id of ids) deleteDocFromFirestore('publicChatOpen', id);
  res.json({ ok: true });
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION & PORTAL ROUTES
// -------------------------------------------------------------

app.post('/api/admin/login', checkAdminLoginRateLimit, (req, res) => {
  const { email, password } = req.body;
  const configuredEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const configuredPassword = process.env.ADMIN_PASSWORD || '';

  if (!configuredEmail || !configuredPassword) {
    return res.status(500).json({ error: 'Admin credentials not configured on the server.' });
  }

  const inputEmail = (email || '').toLowerCase().trim();
  const inputPassword = (password || '').trim();

  const isAuthorizedEmail = inputEmail === configuredEmail;
  const isAuthorizedPassword = inputPassword === configuredPassword;

  if (isAuthorizedEmail && isAuthorizedPassword) {
    const token = dataStore.createAdminSession(inputEmail);
    return res.json({
      success: true,
      token,
      admin: { email: inputEmail, name: 'Academy Administrator' }
    });
  }

  recordAdminLoginFailure(req);
  res.status(401).json({ error: 'Invalid admin email or password.' });
});

app.get('/api/admin/verify-token', requireAdmin, (req, res) => {
  res.json({
    success: true,
    valid: true,
    admin: { email: process.env.ADMIN_EMAIL || 'admin@alnoorquranacademy.com', name: 'Academy Administrator' }
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.substring(7) || '';
  dataStore.revokeToken(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Dashboard Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({ success: true, stats: dataStore.getStats() });
});

// Notifications
app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  res.json({ success: true, notifications: dataStore.getNotifications() });
});

// Leads
app.get('/api/admin/leads', requireAdmin, (req, res) => {
  res.json({ success: true, leads: dataStore.getLeads() });
});

app.patch('/api/admin/leads/:id', requireAdmin, (req, res) => {
  const lead = dataStore.updateLead(req.params.id, req.body);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true, lead });
});

app.post('/api/admin/leads/:id/note', requireAdmin, (req, res) => {
  const { text, author } = req.body;
  if (!text) return res.status(400).json({ error: 'Note text is required' });
  const lead = dataStore.addLeadNote(req.params.id, text, author || 'Admin');
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true, lead });
});

// PROMPT-4 D1: Convert a lead into an enrollment application in one click.
// Copies the lead's fields into a new enrollment and marks the lead Converted.
// Idempotent on leadId: if an enrollment already exists for this lead, it is
// returned instead of creating a duplicate.
app.post('/api/admin/leads/:id/convert-to-enrollment', requireAdmin, (req, res) => {
  const lead = dataStore.getLeads().find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  type EnrollmentWithLead = Parameters<typeof dataStore.addEnrollment>[0] & { leadId?: string };
  const existing = dataStore.getEnrollments()
    .find(e => (e as EnrollmentWithLead).leadId === lead.id);
  if (existing) {
    return res.json({ success: true, enrollment: existing, deduplicated: true });
  }

  const appData = {
    studentName: lead.studentName,
    studentEmail: lead.email || undefined,
    phone: lead.phone,
    country: lead.country,
    parentName: lead.parentName,
    parentPhone: lead.phone,
    parentEmail: lead.email || '',
    courseId: lead.courseId,
    courseName: lead.courseName,
    tutorPreference: lead.tutorGender,
    timeSlot: lead.timeSlot,
    preferredDays: lead.preferredDays,
    preferredTimeRange: lead.preferredTimeRange,
    learningPace: lead.learningPace,
    assignedTutorId: lead.preferredTutorId,
    assignedTutorName: lead.preferredTutorName,
    additionalNotes: `Converted from lead ${lead.id} by ${req.adminEmail || 'Admin'}`,
    leadId: lead.id,
  } as EnrollmentWithLead;
  const enrollment = dataStore.addEnrollment(appData);
  dataStore.updateLead(lead.id, { status: 'Converted' });
  res.status(201).json({ success: true, enrollment, deduplicated: false });
});

// Enrollments
app.get('/api/admin/enrollments', requireAdmin, (req, res) => {
  res.json({ success: true, enrollments: dataStore.getEnrollments() });
});

app.patch('/api/admin/enrollments/:id', requireAdmin, (req, res) => {
  const enrollment = dataStore.updateEnrollment(req.params.id, req.body);
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
  res.json({ success: true, enrollment });
});

// Students
app.get('/api/admin/students', requireAdmin, (req, res) => {
  res.json({ success: true, students: dataStore.getStudents() });
});

app.post('/api/admin/students', requireAdmin, (req, res) => {
  const { student, deduplicated } = dataStore.addStudent(req.body);
  // addStudent is idempotent on enrollmentId: if a student already exists
  // for the given enrollment, the existing record is returned with
  // deduplicated=true instead of creating a duplicate.
  res.status(201).json({ success: true, student, deduplicated });
});

app.patch('/api/admin/students/:id', requireAdmin, (req, res) => {
  const student = dataStore.updateStudent(req.params.id, req.body);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json({ success: true, student });
});

// Tutors
app.get('/api/admin/tutors', requireAdmin, (req, res) => {
  res.json({ success: true, tutors: dataStore.getTutors() });
});

app.post('/api/admin/tutors', requireAdmin, (req, res) => {
  const tutor = dataStore.addTutor(req.body);
  res.status(201).json({ success: true, tutor });
});

app.patch('/api/admin/tutors/:id', requireAdmin, (req, res) => {
  const tutor = dataStore.updateTutor(req.params.id, req.body);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });
  res.json({ success: true, tutor });
});

// Courses Management
app.get('/api/admin/courses', requireAdmin, (req, res) => {
  res.json({ success: true, courses: dataStore.getCourses() });
});

app.post('/api/admin/courses', requireAdmin, (req, res) => {
  const course = dataStore.addCourse(req.body);
  res.status(201).json({ success: true, course });
});

app.put('/api/admin/courses/:id', requireAdmin, (req, res) => {
  const course = dataStore.updateCourse(req.params.id, req.body);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ success: true, course });
});

app.delete('/api/admin/courses/:id', requireAdmin, (req, res) => {
  const deleted = dataStore.deleteCourse(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Course not found' });
  res.json({ success: true, message: 'Course deleted successfully' });
});

// Classes & Schedules
app.get('/api/admin/classes', requireAdmin, (req, res) => {
  res.json({ success: true, classes: dataStore.getClasses() });
});

// PROMPT-4 D5 + group H: strict validation for class scheduling.
const TIME_24H_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
function isValidTime24h(t: unknown): t is string {
  return typeof t === 'string' && TIME_24H_RE.test(t.trim());
}
/** Find a tutor's existing class on an overlapping day at the same time (409 on conflict). */
function findClassConflict(tutorId: string, days: string[], time: string, excludeId?: string) {
  return dataStore.getClasses().find(c =>
    c.id !== excludeId &&
    c.status !== 'Cancelled' &&
    c.tutorId === tutorId &&
    c.time === time &&
    Array.isArray(c.days) && c.days.some(d => days.includes(d))
  );
}

app.post('/api/admin/classes', requireAdmin, (req, res) => {
  const { tutorId, studentId, days, time } = req.body || {};
  if (!tutorId || !studentId || !Array.isArray(days) || days.length === 0 || !time) {
    return res.status(400).json({ error: 'tutorId, studentId, days and time are required.' });
  }
  if (!isValidTime24h(time)) {
    return res.status(400).json({ error: 'time must be in HH:MM 24-hour format (e.g. 14:30).' });
  }
  const conflict = findClassConflict(tutorId, days, time);
  if (conflict) {
    return res.status(409).json({
      error: 'This tutor already has a class scheduled on an overlapping day at this time.',
      conflict: { id: conflict.id, days: conflict.days, time: conflict.time }
    });
  }
  const newClass = dataStore.addClass(req.body);
  res.status(201).json({ success: true, class: newClass });
});

app.patch('/api/admin/classes/:id', requireAdmin, (req, res) => {
  const body = req.body || {};
  if (body.time !== undefined && !isValidTime24h(body.time)) {
    return res.status(400).json({ error: 'time must be in HH:MM 24-hour format (e.g. 14:30).' });
  }
  const existing = dataStore.getClasses().find(c => c.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Class not found' });
  // Re-check for scheduling conflicts against the merged schedule.
  const tutorId = body.tutorId !== undefined ? body.tutorId : existing.tutorId;
  const days = body.days !== undefined ? body.days : existing.days;
  const time = body.time !== undefined ? body.time : existing.time;
  if (Array.isArray(days) && days.length > 0 && typeof time === 'string') {
    const conflict = findClassConflict(tutorId, days, time, existing.id);
    if (conflict) {
      return res.status(409).json({
        error: 'This tutor already has a class scheduled on an overlapping day at this time.',
        conflict: { id: conflict.id, days: conflict.days, time: conflict.time }
      });
    }
  }
  const updated = dataStore.updateClass(req.params.id, body);
  res.json({ success: true, class: updated });
});

// Progress Reports & Notes
app.get('/api/admin/progress-reports', requireAdmin, (req, res) => {
  res.json({ success: true, reports: dataStore.getProgressReports() });
});

app.post('/api/admin/progress-reports', requireAdmin, (req, res) => {
  const report = dataStore.addProgressReport(req.body);
  res.status(201).json({ success: true, report });
});

// Assessments
app.get('/api/admin/assessments', requireAdmin, (req, res) => {
  res.json({ success: true, assessments: dataStore.getAssessments() });
});

app.post('/api/admin/assessments', requireAdmin, (req, res) => {
  const assessment = dataStore.addAssessment(req.body);
  res.status(201).json({ success: true, assessment });
});

// -------------------------------------------------------------
// Attendance (per-class present/absent/leave marking)
// -------------------------------------------------------------
app.get('/api/admin/attendance', requireAdmin, (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  res.json({ success: true, date, records: dataStore.getAttendanceByDate(date) });
});

app.get('/api/admin/attendance/student/:studentId', requireAdmin, (req, res) => {
  res.json({ success: true, records: dataStore.getAttendanceForStudent(req.params.studentId) });
});

app.post('/api/admin/attendance', requireAdmin, (req, res) => {
  const { date, records, markedBy } = req.body;
  if (!date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'date and a non-empty records array are required.' });
  }
  // PROMPT-4 D6: strict YYYY-MM-DD format, and future dates are rejected.
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(`${date}T00:00:00Z`).getTime())) {
    return res.status(400).json({ error: 'date must be a valid calendar date in YYYY-MM-DD format.' });
  }
  const today = new Date().toISOString().split('T')[0];
  if (date > today) {
    return res.status(400).json({ error: 'Attendance cannot be marked for a future date.' });
  }
  const validStatuses = ['present', 'absent', 'leave'];
  for (const r of records) {
    if (!r.studentId || !validStatuses.includes(r.status)) {
      return res.status(400).json({ error: 'Each record needs studentId and a valid status (present/absent/leave).' });
    }
  }
  const saved = dataStore.markAttendance(date, records, markedBy || 'Admin');
  res.status(201).json({ success: true, date, records: saved });
});

// -------------------------------------------------------------
// Trial Classes (lead -> scheduled trial -> conversion tracking)
// -------------------------------------------------------------
app.get('/api/admin/trials', requireAdmin, (req, res) => {
  res.json({ success: true, trials: dataStore.getTrials() });
});

app.post('/api/admin/trials', requireAdmin, (req, res) => {
  const { studentName, phone, date, time } = req.body;
  if (!studentName || !phone || !date || !time) {
    return res.status(400).json({ error: 'studentName, phone, date and time are required.' });
  }
  const trial = dataStore.addTrial(req.body);
  res.status(201).json({ success: true, trial });
});

app.patch('/api/admin/trials/:id', requireAdmin, (req, res) => {
  const trial = dataStore.updateTrial(req.params.id, req.body);
  if (!trial) return res.status(404).json({ error: 'Trial not found' });
  res.json({ success: true, trial });
});

app.delete('/api/admin/trials/:id', requireAdmin, (req, res) => {
  const deleted = dataStore.deleteTrial(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Trial not found' });
  res.json({ success: true, message: 'Trial deleted successfully' });
});

// -------------------------------------------------------------
// Fee Reminders (log of payment reminders sent for invoices)
// -------------------------------------------------------------
app.get('/api/admin/fee-reminders', requireAdmin, (req, res) => {
  const { invoiceId } = req.query;
  const reminders = invoiceId
    ? dataStore.getFeeRemindersForInvoice(invoiceId as string)
    : dataStore.getFeeReminders();
  res.json({ success: true, reminders });
});

app.post('/api/admin/fee-reminders', requireAdmin, (req, res) => {
  const { invoiceId, studentName, phone, amount, currency, channel } = req.body;
  if (!invoiceId || !studentName || !phone || amount == null) {
    return res.status(400).json({ error: 'invoiceId, studentName, phone and amount are required.' });
  }
  const reminder = dataStore.addFeeReminder({
    invoiceId, studentName, phone, amount,
    currency: currency || 'USD',
    channel: channel === 'email' ? 'email' : 'whatsapp',
    // PROMPT-5 W2: record the real admin, and log (not "send") — the reminder
    // itself is opened in the admin's WhatsApp; the server only logs the click.
    sentBy: req.adminEmail || 'Admin',
    status: 'logged'
  });
  res.status(201).json({ success: true, reminder });
});

// -------------------------------------------------------------
// Hifz Logs (Sabaq/Sabqi/Manzil daily tracking)
// -------------------------------------------------------------
app.get('/api/admin/hifz-logs', requireAdmin, (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ error: 'studentId query param is required.' });
  res.json({ success: true, logs: dataStore.getHifzLogsForStudent(studentId as string) });
});

app.post('/api/admin/hifz-logs', requireAdmin, (req, res) => {
  const { studentId, studentName, date, surahNumber, fromAyah, toAyah, juzNumber } = req.body;
  if (!studentId || !date) {
    return res.status(400).json({ error: 'studentId and date are required.' });
  }
  // PROMPT-4 H2: the student must exist and be Active or On Trial.
  const student = dataStore.getStudents().find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  if (student.status !== 'Active' && student.status !== 'On Trial') {
    return res.status(400).json({ error: 'Hifz logs can only be recorded for Active or On Trial students.' });
  }
  // PROMPT-4 D7: validate ayah/surah/juz ranges when numeric fields are sent.
  const toPositiveInt = (v: unknown): number | null => {
    if (typeof v === 'number') return Number.isInteger(v) && v > 0 ? v : null;
    if (typeof v === 'string' && /^\d+$/.test(v.trim())) {
      const n = parseInt(v.trim(), 10);
      return n > 0 ? n : null;
    }
    return null;
  };
  if (surahNumber !== undefined && surahNumber !== null && surahNumber !== '') {
    const n = toPositiveInt(surahNumber);
    if (n === null || n > 114) {
      return res.status(400).json({ error: 'surahNumber must be an integer between 1 and 114.' });
    }
  }
  let from: number | null = null;
  let to: number | null = null;
  if (fromAyah !== undefined && fromAyah !== null && fromAyah !== '') {
    from = toPositiveInt(fromAyah);
    if (from === null) return res.status(400).json({ error: 'fromAyah must be a positive integer.' });
  }
  if (toAyah !== undefined && toAyah !== null && toAyah !== '') {
    to = toPositiveInt(toAyah);
    if (to === null) return res.status(400).json({ error: 'toAyah must be a positive integer.' });
  }
  if (from !== null && to !== null && from > to) {
    return res.status(400).json({ error: 'fromAyah must be less than or equal to toAyah.' });
  }
  if (juzNumber !== undefined && juzNumber !== null && juzNumber !== '') {
    const n = toPositiveInt(juzNumber);
    if (n === null || n > 30) {
      return res.status(400).json({ error: 'juzNumber must be an integer between 1 and 30.' });
    }
  }
  const log = dataStore.addHifzLog({ ...req.body, studentName: studentName || '', markedBy: req.adminEmail || 'Admin' });
  res.status(201).json({ success: true, log });
});

// -------------------------------------------------------------
// Tutor Availability (weekly slots)
// -------------------------------------------------------------
app.get('/api/admin/availability', requireAdmin, (req, res) => {
  res.json({ success: true, slots: dataStore.getAvailability() });
});

app.post('/api/admin/availability', requireAdmin, (req, res) => {
  const { tutorId, tutorName, dayOfWeek, startTime, endTime } = req.body;
  if (!tutorId || !dayOfWeek || !startTime || !endTime) {
    return res.status(400).json({ error: 'tutorId, dayOfWeek, startTime and endTime are required.' });
  }
  const slot = dataStore.addAvailability({ tutorId, tutorName: tutorName || '', dayOfWeek, startTime, endTime });
  res.status(201).json({ success: true, slot });
});

app.delete('/api/admin/availability/:id', requireAdmin, (req, res) => {
  const deleted = dataStore.deleteAvailability(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Slot not found' });
  res.json({ success: true, message: 'Availability slot deleted' });
});

// -------------------------------------------------------------
// Coupons (discount codes)
// -------------------------------------------------------------
app.get('/api/admin/coupons', requireAdmin, (req, res) => {
  res.json({ success: true, coupons: dataStore.getCoupons() });
});

app.post('/api/admin/coupons', requireAdmin, (req, res) => {
  const { code, discountPercent, maxUses } = req.body;
  if (!code || !discountPercent || discountPercent < 1 || discountPercent > 100) {
    return res.status(400).json({ error: 'code and discountPercent (1-100) are required.' });
  }
  const coupon = dataStore.addCoupon({
    code,
    discountPercent: Number(discountPercent),
    maxUses: Number(maxUses) || 100,
    expiresAt: req.body.expiresAt || undefined,
    status: 'active'
  });
  if (!coupon) return res.status(409).json({ error: 'Coupon code already exists.' });
  res.status(201).json({ success: true, coupon });
});

app.patch('/api/admin/coupons/:id', requireAdmin, (req, res) => {
  // PROMPT-5 C4: surface discount validation as 400 (updateCoupon also guards).
  const dp = req.body?.discountPercent;
  if (dp !== undefined) {
    const n = Number(dp);
    if (!Number.isFinite(n) || n < 1 || n > 100) {
      return res.status(400).json({ error: 'discountPercent must be between 1 and 100.' });
    }
  }
  const coupon = dataStore.updateCoupon(req.params.id, req.body);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found or code already exists.' });
  res.json({ success: true, coupon });
});

// Public coupon validation (for the pricing page) — rate-limited (PROMPT-3).
app.post('/api/coupons/validate', checkPublicRateLimit, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ valid: false, reason: 'Coupon code is required.' });
  const result = dataStore.validateCoupon(code);
  res.json(result);
});

// -------------------------------------------------------------
// Quran API proxy (api.alquran.cloud) — public Quran data.
// Proxied through our server so the Classroom Studio works even
// when a student's network blocks the third-party API domain.
// Strict path whitelist; short server-side cache.
// -------------------------------------------------------------
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const quranCache = new Map<string, { data: any; expires: number }>();

app.get('/api/quran/*', checkPublicRateLimit, async (req, res) => {
  const path = (req.params as any)[0] || '';
  if (!/^(surah\/\d{1,3}\/[a-z.\-]+|juz\/\d{1,2}\/[a-z.\-]+|ayah\/\d{1,4}\/[a-z.\-]+|search\/[^/]{1,60}\/all\/en)$/.test(path)) {
    return res.status(400).json({ error: 'Invalid Quran API path.' });
  }
  const cacheKey = path;
  const cached = quranCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return res.json(cached.data);
  }
  try {
    const r = await fetch(`${QURAN_API_BASE}/${path}`, { signal: AbortSignal.timeout(15000) });
    const data = await r.json();
    if (r.ok) {
      quranCache.set(cacheKey, { data, expires: Date.now() + 60 * 60 * 1000 });
      if (quranCache.size > 500) quranCache.clear();
    }
    res.status(r.status).json(data);
  } catch {
    res.status(502).json({ error: 'Quran service temporarily unavailable.' });
  }
});

// -------------------------------------------------------------
// Referrals (parent referral tracking)
// -------------------------------------------------------------
app.get('/api/admin/referrals', requireAdmin, (req, res) => {
  res.json({ success: true, referrals: dataStore.getReferrals() });
});

app.post('/api/admin/referrals', requireAdmin, (req, res) => {
  const { referrerName, referredStudentName } = req.body;
  if (!referrerName || !referredStudentName) {
    return res.status(400).json({ error: 'referrerName and referredStudentName are required.' });
  }
  const referral = dataStore.addReferral(req.body);
  res.status(201).json({ success: true, referral });
});

app.patch('/api/admin/referrals/:id', requireAdmin, (req, res) => {
  const referral = dataStore.updateReferral(req.params.id, req.body);
  if (!referral) return res.status(404).json({ error: 'Referral not found' });
  res.json({ success: true, referral });
});

// IndexNow Instant Search Engine Indexing Endpoint
app.post('/api/indexnow/submit', requireAdmin, async (req, res) => {
  const DEFAULT_URL_LIST = [
    'https://noorequraninstitute.me/',
    'https://noorequraninstitute.me/courses',
    'https://noorequraninstitute.me/online-quran-classes',
    'https://noorequraninstitute.me/noorani-qaida',
    'https://noorequraninstitute.me/quran-reading-nazra',
    'https://noorequraninstitute.me/quran-with-tajweed',
    'https://noorequraninstitute.me/quran-memorization-hifz',
    'https://noorequraninstitute.me/islamic-studies',
    'https://noorequraninstitute.me/teachers',
    'https://noorequraninstitute.me/faculty',
    'https://noorequraninstitute.me/tutors',
    'https://noorequraninstitute.me/packages',
    'https://noorequraninstitute.me/pricing',
    'https://noorequraninstitute.me/how-it-works',
    'https://noorequraninstitute.me/methodology',
    'https://noorequraninstitute.me/about',
    'https://noorequraninstitute.me/about-us',
    'https://noorequraninstitute.me/blog',
    'https://noorequraninstitute.me/contact',
    'https://noorequraninstitute.me/faq',
    'https://noorequraninstitute.me/kids-program',
    'https://noorequraninstitute.me/quran-classes-for-kids',
    'https://noorequraninstitute.me/adults-program',
    'https://noorequraninstitute.me/quran-classes-for-adults',
    'https://noorequraninstitute.me/online-quran-classes-uk',
    'https://noorequraninstitute.me/online-quran-classes-usa',
    'https://noorequraninstitute.me/online-quran-classes-canada',
    'https://noorequraninstitute.me/online-quran-classes-australia',
    'https://noorequraninstitute.me/online-quran-classes-pakistan'
  ];

  const payload = {
    host: 'noorequraninstitute.me',
    key: '171291dc902c49d0af85b3414442a356',
    keyLocation: 'https://noorequraninstitute.me/171291dc902c49d0af85b3414442a356.txt',
    urlList: req.body.urlList && Array.isArray(req.body.urlList) && req.body.urlList.length > 0 ? req.body.urlList : DEFAULT_URL_LIST
  };

  try {
    const fetchRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    res.json({
      success: fetchRes.ok || fetchRes.status === 200 || fetchRes.status === 202,
      statusCode: fetchRes.status,
      message: fetchRes.status === 200
        ? `Successfully submitted ${payload.urlList.length} URLs to IndexNow.org!`
        : `IndexNow responded with status ${fetchRes.status}`,
      submittedUrlsCount: payload.urlList.length
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch URLs to IndexNow'
    });
  }
});

// Testimonials Admin
app.get('/api/admin/testimonials', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, testimonials: dataStore.getTestimonials() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/admin/testimonials', requireAdmin, (req, res) => {
  const t = req.body;
  if (!t || typeof t !== 'object') return res.status(400).json({ error: 'Invalid testimonial data' });
  if (!t.name || typeof t.name !== 'string' || !t.name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!t.comment || typeof t.comment !== 'string' || !t.comment.trim()) {
    return res.status(400).json({ error: 'Comment is required' });
  }
  const clean = {
    name: String(t.name).slice(0, 100),
    studentOrParent: String(t.studentOrParent || 'Parent').slice(0, 50),
    location: String(t.location || '').slice(0, 100),
    countryFlag: typeof t.countryFlag === 'string' ? t.countryFlag.slice(0, 10) : undefined,
    courseName: String(t.courseName || '').slice(0, 100),
    rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
    comment: String(t.comment).slice(0, 2000),
    status: t.status === 'pending' ? 'pending' : 'published'
  } as const;
  const testimonial = dataStore.addTestimonial(clean);
  res.status(201).json({ success: true, testimonial });
});

app.patch('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
  const updated = dataStore.updateTestimonial(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Testimonial not found' });
  res.json({ success: true, testimonial: updated });
});

app.delete('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteTestimonial(req.params.id);
  res.json({ success: ok });
});

// Packages Admin (Phase 2: admin now manages the same packages the public site reads)
app.get('/api/admin/packages', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, packages: dataStore.getPackages() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

app.post('/api/admin/packages', requireAdmin, (req, res) => {
  const p = req.body;
  if (!p || typeof p !== 'object') return res.status(400).json({ error: 'Invalid package data' });
  if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
    return res.status(400).json({ error: 'Package name is required' });
  }
  const num = (v: any, d: number) => { const n = Number(v); return isNaN(n) || n < 0 ? d : n; };
  const clean = {
    name: String(p.name).slice(0, 100),
    code: ['pkg-2days', 'pkg-3days', 'pkg-5days', 'pkg-weekend'].includes(p.code) ? p.code : 'pkg-3days',
    daysPerWeek: String(p.daysPerWeek || '').slice(0, 50),
    classesPerMonth: num(p.classesPerMonth, 12),
    classDurationMinutes: num(p.classDurationMinutes, 30),
    monthlyFeePKR: num(p.monthlyFeePKR, 0),
    monthlyFeeUSD: num(p.monthlyFeeUSD, 0),
    monthlyFeeGBP: num(p.monthlyFeeGBP, 0),
    monthlyFeeEUR: num(p.monthlyFeeEUR, 0),
    monthlyFeeAED: num(p.monthlyFeeAED, 0),
    monthlyFeeCAD: num(p.monthlyFeeCAD, 0),
    monthlyFeeAUD: num(p.monthlyFeeAUD, 0),
    isPopular: p.isPopular === true,
    badge: typeof p.badge === 'string' ? p.badge.slice(0, 50) : undefined,
    features: Array.isArray(p.features) ? p.features.map(String).slice(0, 15) : [],
    description: String(p.description || '').slice(0, 500)
  } as const;
  const pkg = dataStore.addPackage(clean);
  res.status(201).json({ success: true, package: pkg });
});

app.patch('/api/admin/packages/:id', requireAdmin, (req, res) => {
  const updated = dataStore.updatePackage(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Package not found' });
  res.json({ success: true, package: updated });
});

app.delete('/api/admin/packages/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deletePackage(req.params.id);
  res.json({ success: ok });
});

// FAQs Admin (Phase 2)
app.get('/api/admin/faqs', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, faqs: dataStore.getFaqs() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

app.post('/api/admin/faqs', requireAdmin, (req, res) => {
  const f = req.body;
  if (!f || typeof f !== 'object') return res.status(400).json({ error: 'Invalid FAQ data' });
  if (!f.question || typeof f.question !== 'string' || !f.question.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }
  if (!f.answer || typeof f.answer !== 'string' || !f.answer.trim()) {
    return res.status(400).json({ error: 'Answer is required' });
  }
  const faq = dataStore.addFaq({
    question: String(f.question).slice(0, 500),
    answer: String(f.answer).slice(0, 5000),
    category: typeof f.category === 'string' ? f.category.slice(0, 50) : undefined,
    order: Number(f.order) || 0
  });
  res.status(201).json({ success: true, faq });
});

app.patch('/api/admin/faqs/:id', requireAdmin, (req, res) => {
  const updated = dataStore.updateFaq(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'FAQ not found' });
  res.json({ success: true, faq: updated });
});

app.delete('/api/admin/faqs/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteFaq(req.params.id);
  res.json({ success: ok });
});

// Public FAQs (published content only)
app.get('/api/faqs', (req, res) => {
  try {
    res.json({ success: true, faqs: dataStore.getFaqs() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// Site Settings Admin (Phase 2: singleton)
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, settings: dataStore.getSiteSettings() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/admin/settings', requireAdmin, (req, res) => {
  const s = req.body;
  if (!s || typeof s !== 'object') return res.status(400).json({ error: 'Invalid settings data' });
  const clean: Record<string, any> = {};
  if (typeof s.announcementBarText === 'string') clean.announcementBarText = s.announcementBarText.slice(0, 300);
  if (typeof s.announcementBarEnabled === 'boolean') clean.announcementBarEnabled = s.announcementBarEnabled;
  if (typeof s.announcementBadge === 'string') clean.announcementBadge = s.announcementBadge.slice(0, 50);
  if (typeof s.heroHeadline === 'string') clean.heroHeadline = s.heroHeadline.slice(0, 200);
  if (typeof s.heroSubtitle === 'string') clean.heroSubtitle = s.heroSubtitle.slice(0, 500);
  if (typeof s.primaryWhatsApp === 'string') clean.primaryWhatsApp = s.primaryWhatsApp.slice(0, 30);
  if (typeof s.officialEmail === 'string') clean.officialEmail = s.officialEmail.slice(0, 100);
  if (typeof s.emergencyPhone === 'string') clean.emergencyPhone = s.emergencyPhone.slice(0, 30);
  if (typeof s.address === 'string') clean.address = s.address.slice(0, 200);
  if (typeof s.freeTrialDays === 'number' && s.freeTrialDays >= 0) clean.freeTrialDays = Math.floor(s.freeTrialDays);
  const settings = dataStore.updateSiteSettings(clean);
  res.json({ success: true, settings });
});

// Media Assets Admin (Phase 2: metadata only, no binary upload here)
app.get('/api/admin/media', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, media: dataStore.getMediaAssets() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch media assets' });
  }
});

app.post('/api/admin/media', requireAdmin, (req, res) => {
  const m = req.body;
  if (!m || typeof m !== 'object') return res.status(400).json({ error: 'Invalid media data' });
  if (!m.name || typeof m.name !== 'string' || !m.name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!m.url || typeof m.url !== 'string' || !m.url.trim()) {
    return res.status(400).json({ error: 'URL is required' });
  }
  // URL validation: allow relative paths and http(s) URLs only.
  const url = m.url.trim();
  const urlOk = url.startsWith('/') || /^https?:\/\/[^\s]+$/i.test(url);
  if (!urlOk) return res.status(400).json({ error: 'URL must be a relative path or http(s) URL' });
  const asset = dataStore.addMediaAsset({
    name: String(m.name).slice(0, 150),
    category: ['banner', 'tutor', 'course', 'blog', 'document', 'icon'].includes(m.category) ? m.category : 'banner',
    url: url.slice(0, 500),
    fileSize: typeof m.fileSize === 'string' ? m.fileSize.slice(0, 20) : undefined
  });
  res.status(201).json({ success: true, asset });
});

app.delete('/api/admin/media/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteMediaAsset(req.params.id);
  res.json({ success: ok });
});

// Message Templates Admin (Phase 2)
app.get('/api/admin/templates', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, templates: dataStore.getMessageTemplates() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/admin/templates', requireAdmin, (req, res) => {
  const t = req.body;
  if (!t || typeof t !== 'object') return res.status(400).json({ error: 'Invalid template data' });
  if (!t.title || typeof t.title !== 'string' || !t.title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!t.body || typeof t.body !== 'string' || !t.body.trim()) {
    return res.status(400).json({ error: 'Body is required' });
  }
  const tpl = dataStore.addMessageTemplate({
    title: String(t.title).slice(0, 150),
    channel: ['whatsapp', 'email', 'both'].includes(t.channel) ? t.channel : 'whatsapp',
    subject: typeof t.subject === 'string' ? t.subject.slice(0, 200) : undefined,
    body: String(t.body).slice(0, 10000),
    availableVariables: Array.isArray(t.availableVariables) ? t.availableVariables.map(String).slice(0, 20) : []
  });
  res.status(201).json({ success: true, template: tpl });
});

app.patch('/api/admin/templates/:id', requireAdmin, (req, res) => {
  const updated = dataStore.updateMessageTemplate(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Template not found' });
  res.json({ success: true, template: updated });
});

app.delete('/api/admin/templates/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteMessageTemplate(req.params.id);
  res.json({ success: ok });
});

// Invoices Admin (Phase 2: moved from browser localStorage to server)
app.get('/api/admin/invoices', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, invoices: dataStore.getInvoices() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/api/admin/invoices', requireAdmin, (req, res) => {
  const v = req.body;
  if (!v || typeof v !== 'object') return res.status(400).json({ error: 'Invalid invoice data' });
  if (!v.studentName || typeof v.studentName !== 'string' || !v.studentName.trim()) {
    return res.status(400).json({ error: 'Student name is required' });
  }
  // PROMPT-5 INV-1: ?? semantics — an explicit 0 is a valid zero-fee invoice,
  // but a missing/blank amount is rejected instead of silently becoming 0.
  if (v.amount === undefined || v.amount === null || String(v.amount).trim() === '') {
    return res.status(400).json({ error: 'Amount is required' });
  }
  const amount = Number(v.amount);
  // Explicit handling: amount must be a finite non-negative number. Zero is
  // allowed (explicitly a zero-fee invoice); NaN/negative are rejected.
  if (!isFinite(amount) || amount < 0) {
    return res.status(400).json({ error: 'Amount must be a non-negative number' });
  }
  const currencies = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'CAD', 'AUD'];
  if (!currencies.includes(v.currency)) {
    return res.status(400).json({ error: 'Invalid currency' });
  }
  if (!v.billingMonth || typeof v.billingMonth !== 'string' || !v.billingMonth.trim()) {
    return res.status(400).json({ error: 'Billing month is required' });
  }
  if (!v.dueDate || typeof v.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.dueDate)) {
    return res.status(400).json({ error: 'Due date must be YYYY-MM-DD' });
  }
  const statuses = ['Paid', 'Pending', 'Overdue', 'Waived'];
  const invoice = dataStore.addInvoice({
    studentId: typeof v.studentId === 'string' ? v.studentId : '',
    studentName: String(v.studentName).slice(0, 100),
    parentName: String(v.parentName || '').slice(0, 100),
    phone: String(v.phone || '').slice(0, 30),
    courseName: String(v.courseName || '').slice(0, 100),
    packageName: String(v.packageName || '').slice(0, 100),
    amount,
    currency: v.currency,
    billingMonth: String(v.billingMonth).slice(0, 30),
    dueDate: v.dueDate,
    paidDate: typeof v.paidDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.paidDate) ? v.paidDate : undefined,
    status: statuses.includes(v.status) ? v.status : 'Pending',
    paymentMethod: ['Bank Transfer', 'JazzCash', 'Easypaisa', 'Stripe / Card', 'PayPal'].includes(v.paymentMethod)
      ? v.paymentMethod : undefined
  });
  res.status(201).json({ success: true, invoice });
});

app.patch('/api/admin/invoices/:id', requireAdmin, (req, res) => {
  const body = req.body || {};
  // Validate fields that are being changed.
  if (body.amount !== undefined) {
    if (body.amount === null || String(body.amount).trim() === '') {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const amount = Number(body.amount);
    if (!isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }
    body.amount = amount;
  }
  if (body.currency !== undefined && !['PKR', 'USD', 'GBP', 'EUR', 'AED', 'CAD', 'AUD'].includes(body.currency)) {
    return res.status(400).json({ error: 'Invalid currency' });
  }
  if (body.status !== undefined && !['Paid', 'Pending', 'Overdue', 'Waived'].includes(body.status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  // PROMPT-5 INV-3: pass the real admin email so the status history records who changed it.
  const updated = dataStore.updateInvoice(req.params.id, body, req.adminEmail || 'Admin');
  if (!updated) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ success: true, invoice: updated });
});

app.delete('/api/admin/invoices/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteInvoice(req.params.id);
  res.json({ success: ok });
});

// Student Report Cards Admin (Phase 2)
app.get('/api/admin/reports', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, reports: dataStore.getReportCards() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch report cards' });
  }
});

app.post('/api/admin/reports', requireAdmin, (req, res) => {
  const r = req.body;
  if (!r || typeof r !== 'object') return res.status(400).json({ error: 'Invalid report data' });
  if (!r.studentName || typeof r.studentName !== 'string' || !r.studentName.trim()) {
    return res.status(400).json({ error: 'Student name is required' });
  }
  if (!r.evaluationMonth || typeof r.evaluationMonth !== 'string' || !r.evaluationMonth.trim()) {
    return res.status(400).json({ error: 'Evaluation month is required' });
  }
  const grades = ['A+', 'A', 'B+', 'B', 'Needs Practice'];
  // Explicit missing-data handling: attendancePercentage may be omitted
  // (unknown) but if provided must be 0–100. Zero is a legitimate value.
  let attendancePercentage: number | undefined;
  if (r.attendancePercentage !== undefined && r.attendancePercentage !== null && r.attendancePercentage !== '') {
    const ap = Number(r.attendancePercentage);
    if (!isFinite(ap) || ap < 0 || ap > 100) {
      return res.status(400).json({ error: 'Attendance percentage must be 0–100' });
    }
    attendancePercentage = ap;
  }
  const report = dataStore.addReportCard({
    studentId: typeof r.studentId === 'string' ? r.studentId : '',
    studentName: String(r.studentName).slice(0, 100),
    courseName: String(r.courseName || '').slice(0, 100),
    tutorName: String(r.tutorName || '').slice(0, 100),
    evaluationMonth: String(r.evaluationMonth).slice(0, 30),
    currentSabaq: String(r.currentSabaq || '').slice(0, 200),
    readingGrade: grades.includes(r.readingGrade) ? r.readingGrade : 'Needs Practice',
    tajweedGrade: grades.includes(r.tajweedGrade) ? r.tajweedGrade : 'Needs Practice',
    attendancePercentage: attendancePercentage as number,
    hifzSurahCount: r.hifzSurahCount !== undefined ? Math.max(0, Number(r.hifzSurahCount) || 0) : undefined,
    teacherRemarks: String(r.teacherRemarks || '').slice(0, 2000),
    generatedDate: new Date().toISOString().split('T')[0]
  });
  res.status(201).json({ success: true, report });
});

app.patch('/api/admin/reports/:id', requireAdmin, (req, res) => {
  const updated = dataStore.updateReportCard(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Report not found' });
  res.json({ success: true, report: updated });
});

app.delete('/api/admin/reports/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteReportCard(req.params.id);
  res.json({ success: ok });
});

// Tutor Payroll Admin (Phase 2)
app.get('/api/admin/payroll', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, payroll: dataStore.getPayroll() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

app.post('/api/admin/payroll', requireAdmin, (req, res) => {
  const p = req.body;
  if (!p || typeof p !== 'object') return res.status(400).json({ error: 'Invalid payroll data' });
  if (!p.tutorName || typeof p.tutorName !== 'string' || !p.tutorName.trim()) {
    return res.status(400).json({ error: 'Tutor name is required' });
  }
  if (!p.billingMonth || typeof p.billingMonth !== 'string' || !p.billingMonth.trim()) {
    return res.status(400).json({ error: 'Billing month is required' });
  }
  const classesConducted = Number(p.classesConducted);
  const ratePerClassPKR = Number(p.ratePerClassPKR);
  if (!isFinite(classesConducted) || classesConducted < 0) {
    return res.status(400).json({ error: 'Classes conducted must be a non-negative number' });
  }
  if (!isFinite(ratePerClassPKR) || ratePerClassPKR < 0) {
    return res.status(400).json({ error: 'Rate per class must be a non-negative number' });
  }
  // Server-computed total: never trust a client-supplied total.
  const totalPayoutPKR = Math.round(classesConducted * ratePerClassPKR);
  const record = dataStore.addPayroll({
    tutorId: typeof p.tutorId === 'string' ? p.tutorId : '',
    tutorName: String(p.tutorName).slice(0, 100),
    billingMonth: String(p.billingMonth).slice(0, 30),
    classesConducted,
    ratePerClassPKR,
    totalPayoutPKR,
    status: p.status === 'Paid' ? 'Paid' : 'Pending',
    paidDate: typeof p.paidDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.paidDate) ? p.paidDate : undefined
  });
  res.status(201).json({ success: true, payroll: record });
});

app.patch('/api/admin/payroll/:id', requireAdmin, (req, res) => {
  const body = req.body || {};
  // Recompute total if classes or rate change.
  if (body.classesConducted !== undefined || body.ratePerClassPKR !== undefined) {
    const existing = dataStore.getPayroll().find(x => x.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Payroll record not found' });
    const cc = body.classesConducted !== undefined ? Number(body.classesConducted) : existing.classesConducted;
    const rate = body.ratePerClassPKR !== undefined ? Number(body.ratePerClassPKR) : existing.ratePerClassPKR;
    if (!isFinite(cc) || cc < 0 || !isFinite(rate) || rate < 0) {
      return res.status(400).json({ error: 'Classes and rate must be non-negative numbers' });
    }
    body.classesConducted = cc;
    body.ratePerClassPKR = rate;
    body.totalPayoutPKR = Math.round(cc * rate);
  }
  if (body.status !== undefined && !['Paid', 'Pending'].includes(body.status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const updated = dataStore.updatePayroll(req.params.id, body);
  if (!updated) return res.status(404).json({ error: 'Payroll record not found' });
  res.json({ success: true, payroll: updated });
});

app.delete('/api/admin/payroll/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deletePayroll(req.params.id);
  res.json({ success: ok });
});

// Activity Logs Admin (Phase 2: durable server-side log)
app.get('/api/admin/logs', requireAdmin, (req, res) => {
  try {
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
    res.json({ success: true, logs: dataStore.getActivityLogs(limit) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

app.post('/api/admin/logs', requireAdmin, (req, res) => {
  const l = req.body;
  if (!l || typeof l !== 'object') return res.status(400).json({ error: 'Invalid log data' });
  if (!l.action || typeof l.action !== 'string' || !l.action.trim()) {
    return res.status(400).json({ error: 'Action is required' });
  }
  const categories = ['Student', 'Enrollment', 'Faculty', 'Course', 'Finance', 'Settings', 'System'];
  const log = dataStore.addActivityLog({
    action: String(l.action).slice(0, 500),
    category: categories.includes(l.category) ? l.category : 'System',
    user: String(l.user || 'Admin').slice(0, 100)
  });
  res.status(201).json({ success: true, log });
});

// Articles Admin
app.post('/api/admin/articles', requireAdmin, (req, res) => {
  const article = dataStore.addArticle(req.body);
  res.status(201).json({ success: true, article });
});

app.delete('/api/admin/articles/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteArticle(req.params.id);
  res.json({ success: ok });
});

// Blog Posts Admin (Firestore `blogPosts` collection via Admin SDK).
// The admin panel's custom token (not Firebase Auth) is sufficient here —
// auth is enforced server-side by requireAdmin. This replaces direct
// client-side Firestore writes from BlogEditor, which required a Firebase
// Auth session the admin login never establishes.
const BLOG_POSTS_COL = 'blogPosts';

function blogPostsDb() {
  if (!isFirestoreEnabled()) return null;
  return getFirestoreDb();
}

app.get('/api/admin/blog-posts', requireAdmin, async (req, res) => {
  const db = blogPostsDb();
  if (!db) return res.status(503).json({ error: 'Blog database not available' });
  try {
    const snap = await db.collection(BLOG_POSTS_COL).orderBy('createdAt', 'desc').get();
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, posts });
  } catch (err: any) {
    console.error('[api] GET /api/admin/blog-posts failed:', err.message);
    res.status(500).json({ error: 'Failed to load blog posts' });
  }
});

app.post('/api/admin/blog-posts', requireAdmin, async (req, res) => {
  const db = blogPostsDb();
  if (!db) return res.status(503).json({ error: 'Blog database not available' });
  const post = req.body;
  if (!post || typeof post !== 'object') {
    return res.status(400).json({ error: 'Invalid post data' });
  }
  if (!post.title || typeof post.title !== 'string' || !post.title.trim()) {
    return res.status(400).json({ error: 'Post title is required' });
  }
  if (!post.slug || typeof post.slug !== 'string' || !post.slug.trim()) {
    return res.status(400).json({ error: 'Post slug is required' });
  }
  // Sanitize: only allow known fields, enforce types.
  // NOTE: keeps the full BlogPost shape the admin BlogEditor sends and the
  // public BlogPostPage reads (category, featuredImage, readTime) — dropping
  // them silently broke new articles' category badge + featured image.
  const VALID_CATEGORIES = ['Tajweed', 'Quran Learning', 'Parenting', 'Kids', 'Hifz', 'Duas & Salah', 'Islamic Studies'];
  const clean: Record<string, any> = {
    title: String(post.title).slice(0, 200),
    slug: String(post.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 100),
    excerpt: typeof post.excerpt === 'string' ? post.excerpt.slice(0, 500) : '',
    content: typeof post.content === 'string' ? post.content : '',
    coverImage: typeof post.coverImage === 'string' ? post.coverImage.slice(0, 500) : '',
    featuredImage: typeof post.featuredImage === 'string' ? post.featuredImage.slice(0, 1000000) : '',
    category: VALID_CATEGORIES.includes(post.category) ? post.category : 'Quran Learning',
    readTime: typeof post.readTime === 'string' ? post.readTime.slice(0, 50) : '5 min read',
    tags: Array.isArray(post.tags) ? post.tags.map(String).slice(0, 10) : [],
    published: post.published === true,
    featured: post.featured === true,
    author: typeof post.author === 'string' ? post.author.slice(0, 100) : 'Noor E Quran',
    metaTitle: typeof post.metaTitle === 'string' ? post.metaTitle.slice(0, 200) : '',
    metaDescription: typeof post.metaDescription === 'string' ? post.metaDescription.slice(0, 300) : '',
    updatedAt: new Date().toISOString(),
  };
  try {
    const id = typeof post.id === 'string' && post.id.trim() ? post.id.trim().slice(0, 100) : db.collection(BLOG_POSTS_COL).doc().id;
    const existing = await db.collection(BLOG_POSTS_COL).doc(id).get();
    if (!existing.exists) {
      clean.createdAt = new Date().toISOString();
    }
    await db.collection(BLOG_POSTS_COL).doc(id).set(clean, { merge: true });
    res.status(201).json({ success: true, post: { id, ...clean } });
  } catch (err: any) {
    console.error('[api] POST /api/admin/blog-posts failed:', err.message);
    res.status(500).json({ error: 'Failed to save blog post' });
  }
});

app.delete('/api/admin/blog-posts/:id', requireAdmin, async (req, res) => {
  const db = blogPostsDb();
  if (!db) return res.status(503).json({ error: 'Blog database not available' });
  const id = String(req.params.id).slice(0, 100);
  if (!id) return res.status(400).json({ error: 'Invalid post ID' });
  try {
    await db.collection(BLOG_POSTS_COL).doc(id).delete();
    res.json({ success: true });
  } catch (err: any) {
    console.error('[api] DELETE /api/admin/blog-posts failed:', err.message);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Site SEO Admin (Firestore `siteSeo` collection via Admin SDK).
// Same rationale as blog posts: server-enforced admin auth instead of
// relying on a Firebase Auth session.
const SITE_SEO_COL = 'siteSeo';

app.get('/api/admin/site-seo', requireAdmin, async (req, res) => {
  const db = blogPostsDb();
  if (!db) return res.status(503).json({ error: 'SEO database not available' });
  try {
    const snap = await db.collection(SITE_SEO_COL).get();
    const configs: Record<string, any> = {};
    snap.docs.forEach(d => { configs[d.id] = d.data(); });
    res.json({ success: true, configs });
  } catch (err: any) {
    console.error('[api] GET /api/admin/site-seo failed:', err.message);
    res.status(500).json({ error: 'Failed to load SEO configs' });
  }
});

app.post('/api/admin/site-seo', requireAdmin, async (req, res) => {
  const db = blogPostsDb();
  if (!db) return res.status(503).json({ error: 'SEO database not available' });
  const body = req.body || {};
  // PROMPT-5 regression fix: accept BOTH API contracts —
  //   A) { pageId, config: { title, description, keywords, ... } }
  //   B) PageSeoConfig { pagePath, pageName, metaTitle, metaDescription, keywords, canonicalUrl, ogImage, ... }
  // (the admin panel's SEO tab sends format B).
  let pageId: string | undefined;
  let cfg: Record<string, any> = {};
  if (typeof body.pageId === 'string' && body.config && typeof body.config === 'object') {
    pageId = body.pageId;
    cfg = body.config;
  } else if (typeof body.pagePath === 'string') {
    pageId = body.pagePath;
    cfg = body;
  } else {
    return res.status(400).json({ error: 'pageId+config or pagePath is required' });
  }
  const clean: Record<string, any> = { updatedAt: new Date().toISOString() };
  const setIf = (key: string, v: any, max: number) => {
    // keywords may arrive as a string[] (PageSeoConfig) — join to a string.
    const val = Array.isArray(v) ? v.filter(x => typeof x === 'string').join(', ') : v;
    if (typeof val === 'string' && val.trim()) clean[key] = val.slice(0, max);
  };
  setIf('title', cfg.title ?? cfg.metaTitle, 200);
  setIf('description', cfg.description ?? cfg.metaDescription, 300);
  setIf('keywords', cfg.keywords ?? cfg.metaKeywords, 300);
  // Preserve the extended SEO fields instead of silently dropping them.
  setIf('canonicalUrl', cfg.canonicalUrl, 500);
  setIf('ogTitle', cfg.ogTitle, 200);
  setIf('ogDescription', cfg.ogDescription, 300);
  setIf('ogImage', cfg.ogImage, 500);
  setIf('pageName', cfg.pageName, 200);
  setIf('pagePath', cfg.pagePath ?? pageId, 200);
  try {
    await db.collection(SITE_SEO_COL).doc(pageId.slice(0, 100)).set(clean, { merge: true });
    res.json({ success: true, pageId, config: clean });
  } catch (err: any) {
    console.error('[api] POST /api/admin/site-seo failed:', err.message);
    res.status(500).json({ error: 'Failed to save SEO config' });
  }
});

// Resources Admin
app.post('/api/admin/resources', requireAdmin, (req, res) => {
  const resource = dataStore.addResource(req.body);
  res.status(201).json({ success: true, resource });
});

app.delete('/api/admin/resources/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteResource(req.params.id);
  res.json({ success: ok });
});

// Contacts Admin
app.get('/api/admin/contacts', requireAdmin, (req, res) => {
  res.json({ success: true, contacts: dataStore.getContacts() });
});

// Image Upload API (Cloudinary with Local Disk Fallback)
app.post('/api/upload-image', requireAdmin, async (req: Request, res: Response) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // Check if base64 or JSON payload
    let base64Data: string | null = null;
    let fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (req.body && req.body.imageBase64) {
      base64Data = req.body.imageBase64;
    }

    // If Cloudinary configured and base64 provided, send to Cloudinary API
    if (cloudName && (uploadPreset || (apiKey && apiSecret)) && base64Data) {
      try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign: Record<string, any> = { timestamp, folder: 'alnoor_blog' };
        
        let signature = '';
        if (apiKey && apiSecret) {
          const stringToSign = `folder=alnoor_blog&timestamp=${timestamp}${apiSecret}`;
          signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
        }

        const formData = new URLSearchParams();
        formData.append('file', base64Data);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', 'alnoor_blog');
        if (uploadPreset) formData.append('upload_preset', uploadPreset);
        if (apiKey) formData.append('api_key', apiKey);
        if (signature) formData.append('signature', signature);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          return res.json({ success: true, imageUrl: cloudData.secure_url });
        }
      } catch (cloudErr: any) {
        console.warn('Cloudinary upload fallback to local:', cloudErr.message);
      }
    }

    // Local disk fallback — raster images only (svg rejected: scriptable when
    // opened directly, a stored-XSS vector even for admin-only uploads)
    if (base64Data) {
      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        const rawExt = matches[1].toLowerCase();
        const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
        if (!['jpg', 'png', 'gif', 'webp'].includes(ext)) {
          return res.status(400).json({ error: 'Only JPG, PNG, GIF or WebP images are allowed.' });
        }
        const buffer = Buffer.from(matches[2], 'base64');
        const localFileName = `${fileName}.${ext}`;
        const filePath = path.join(process.cwd(), 'public', 'uploads', localFileName);
        fs.writeFileSync(filePath, buffer);
        return res.json({ success: true, imageUrl: `/uploads/${localFileName}` });
      }
    }

    // Generic fallback response
    res.json({ success: true, imageUrl: req.body.url || `/uploads/${fileName}.jpg` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// -------------------------------------------------------------
// GOOGLE SEARCH CONSOLE VERIFICATION
// -------------------------------------------------------------
app.get('/google:code.html', (req, res) => {
  const code = req.params.code;
  // Validate: only alphanumeric, dash, underscore (prevents XSS)
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return res.status(400).type('text/plain').send('Invalid verification code');
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`google-site-verification: google${code}.html`);
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SSR PRERENDER WITH REAL 404 HANDLING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || (typeof __filename !== 'undefined' && __filename.endsWith('.cjs'));
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');

    // Cache static assets aggressively (JS/CSS with unique content hashes)
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true
    }));

    // Cache WebP and optimized public images
    app.use('/images', express.static(path.join(publicPath, 'images'), {
      maxAge: '30d',
      immutable: true
    }));

    // Smart categorized image resolver (maps legacy flat /images/:file to /images/banners, /images/courses, /images/faculty)
    app.get('/images/:file', (req, res, next) => {
      const filename = req.params.file;

      // 🛡️ Sentinel: Prevent Path Traversal by enforcing strict filename characters
      if (!/^[a-zA-Z0-9_. -]+$/.test(filename)) {
        return res.status(400).send('Invalid filename');
      }

      const subdirs = ['banners', 'courses', 'faculty', 'uploads'];
      for (const sub of subdirs) {
        const candidate = path.join(publicPath, 'images', sub, filename);
        if (fs.existsSync(candidate)) {
          res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
          if (filename.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp');
          else if (filename.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
          else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) res.setHeader('Content-Type', 'image/jpeg');
          return res.sendFile(candidate);
        }
      }
      next();
    });

    // Cache Branding & Icons assets
    app.use('/branding', express.static(path.join(publicPath, 'branding'), {
      maxAge: '30d',
      immutable: true
    }));

    app.use('/icons', express.static(path.join(publicPath, 'icons'), {
      maxAge: '30d',
      immutable: true
    }));

    // Cache root static files from dist and public (manifest, logo.png, logo.webp, robots, etc.)
    app.use(express.static(distPath, {
      maxAge: '7d',
      index: false
    }));

    app.use(express.static(publicPath, {
      maxAge: '7d',
      index: false
    }));

    // Specific handlers for logo routes to prevent case-sensitivity 404s
    app.get(['/Logo.webp', '/logo.webp'], (req, res) => {
      const logoPath = path.join(publicPath, 'logo.webp');
      if (fs.existsSync(logoPath)) {
        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Cache-Control', 'public, max-age=604800');
        return res.sendFile(logoPath);
      }
      res.status(404).send('Logo not found');
    });

    app.get(['/Logo.png', '/logo.png'], (req, res) => {
      const logoPath = path.join(publicPath, 'logo.png');
      if (fs.existsSync(logoPath)) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=604800');
        return res.sendFile(logoPath);
      }
      res.status(404).send('Logo not found');
    });

    // Cache template HTML in memory to eliminate redundant disk I/O and reduce document response latency
    let cachedBaseHtml: string | null = null;

    // Cache fully injected HTML strings to bypass expensive synchronous string replacements
    // TTL is short to avoid serving stale dynamic content (e.g., SEO metadata)
    const ssrCache = new Map<string, { html: string; expiresAt: number; spaFallback404?: boolean }>();
    const SSR_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    app.get('*', async (req, res) => {
      const userAgent = (req.headers['user-agent'] as string) || '';
      // Only differentiate cache by crawler vs human since SEO injection logic only cares about bots
      const isBot = isCrawlerBot(userAgent);
      const cacheKey = `${req.path}_${isBot}`;

      const cached = ssrCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        res.status(cached.spaFallback404 ? 404 : 200).setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.send(cached.html);
      }

      const { meta, is404, redirect, spaFallback404 } = resolveRouteMetadata(req.path);

      // Canonical 301 redirects for legacy / duplicate URLs.
      if (redirect) {
        return res.redirect(301, redirect);
      }

      if (is404) {
        res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(generate404Html());
      }

      const indexPath = path.join(distPath, 'index.html');
      if (!cachedBaseHtml) {
        try {
          cachedBaseHtml = await fs.promises.readFile(indexPath, 'utf-8');
        } catch (error) {
          return res.status(500).send('Application build not found. Please run npm run build.');
        }
      }

      let html = cachedBaseHtml;
      if (meta) {
        html = injectSeoTagsIntoHtml(html, meta, req.path, userAgent);
      }
      // Unknown blog slugs get the SPA shell with 404 status + noindex so
      // crawlers don't index the fallback page.
      if (spaFallback404) {
        html = injectNoindexIntoHtml(html);
      }

      ssrCache.set(cacheKey, {
        html,
        expiresAt: Date.now() + SSR_CACHE_TTL_MS,
        spaFallback404
      });

      // Prevent the cache from growing indefinitely
      if (ssrCache.size > 1000) {
        const oldestKey = ssrCache.keys().next().value;
        if (oldestKey) ssrCache.delete(oldestKey);
      }

      res.status(spaFallback404 ? 404 : 200).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Noor-e-Quran Institute Server running on http://0.0.0.0:${PORT}`);

    // Article SEO synced cache (BUG-1/BUG-5): warm from disk, refresh from
    // Firestore in the background, then re-refresh on the configured interval.
    startArticleSeoCache();

    // Background Keep-Alive Worker (Every 4.5 minutes)
    // Pings live custom domain to keep Render instance awake and ensure 24/7 warm routing
    const PING_INTERVAL_MS = 4.5 * 60 * 1000; // 4.5 minutes (Render sleeps after 15 mins)
    const externalUrl = 'https://noorequraninstitute.me';

    setInterval(async () => {
      try {
        const pingTarget = `${externalUrl}/api/health`;
        const res = await fetch(pingTarget, {
          headers: { 'User-Agent': 'NoorEQuran-KeepAlive-Heartbeat/1.0' }
        });
        if (res.ok) {
          console.log(`[KeepAlive] Heartbeat ping successful to ${pingTarget} at ${new Date().toLocaleTimeString()}`);
        }
      } catch (err: any) {
        // Fallback local ping if outbound DNS is not ready
        try {
          await fetch(`http://127.0.0.1:${PORT}/api/health`);
        } catch (_) {}
      }
    }, PING_INTERVAL_MS);
  });
}

startServer();
