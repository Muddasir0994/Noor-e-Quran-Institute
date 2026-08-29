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
  resolveRouteMetadata, 
  injectSeoTagsIntoHtml, 
  generate404Html,
  generateDynamicSitemapXml,
  generateRobotsTxt
} from './server/seoRender.js';

dotenv.config();

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

  next();
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
app.post('/api/auth/send-phone-otp', (req, res) => {
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
app.post('/api/auth/verify-phone-otp', (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and 6-digit OTP are required.' });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanOtp = otp.toString().trim();
    const record = otpStore.get(cleanPhone);

    // Optional development test override (strictly disabled in production)
    if (process.env.ALLOW_TEST_OTP === 'true' && process.env.NODE_ENV !== 'production' && cleanOtp === '123456') {
      return res.json({
        success: true,
        verified: true,
        message: 'Phone number verified successfully (dev override)!'
      });
    }

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
app.post('/api/book-trial', (req, res) => {
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
      `*Preferred Slot:* ${lead.timeSlot}\n` +
      `*Country:* ${lead.country}`
    );

    const whatsappUrl = `https://wa.me/923274496163?text=${waText}`;

    // Send email alert to admin
    sendAdminNotificationEmail(
      `New 3-Day Free Trial: ${lead.studentName} (${lead.courseName})`,
      `<h2>New Free Trial Request - Noor-e-Quran Institute</h2>
      <p><strong>Student Name:</strong> ${lead.studentName}</p>
      <p><strong>Parent/Guardian:</strong> ${lead.parentName || 'N/A'}</p>
      <p><strong>WhatsApp / Phone:</strong> ${lead.phone}</p>
      <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
      <p><strong>Course:</strong> ${lead.courseName}</p>
      <p><strong>Tutor Preference:</strong> ${lead.tutorGender}</p>
      <p><strong>Preferred Time:</strong> ${lead.timeSlot} (${lead.preferredTimeRange || 'Standard'})</p>
      <p><strong>Preferred Days:</strong> ${(lead.preferredDays || []).join(', ')}</p>
      <p><strong>Learning Pace:</strong> ${lead.learningPace || 'Normal'}</p>
      <p><strong>Country:</strong> ${lead.country}</p>
      <p><strong>Notes:</strong> ${lead.notes?.[0]?.text || 'None'}</p>
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
app.post('/api/enroll', (req, res) => {
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
      <p><strong>Student Name:</strong> ${application.studentName}</p>
      <p><strong>Parent/Guardian:</strong> ${application.parentName || 'N/A'}</p>
      <p><strong>WhatsApp / Phone:</strong> ${application.phone}</p>
      <p><strong>Email:</strong> ${application.studentEmail || application.parentEmail || 'N/A'}</p>
      <p><strong>Course:</strong> ${application.courseName}</p>
      <p><strong>Package:</strong> ${application.packageName}</p>
      <p><strong>Tutor Preference:</strong> ${application.tutorPreference}</p>
      <p><strong>Preferred Time:</strong> ${application.timeSlot} (${application.preferredTimeRange || 'Standard'})</p>
      <p><strong>Days:</strong> ${(application.preferredDays || []).join(', ')}</p>
      <p><strong>Learning Pace:</strong> ${application.learningPace || 'Normal'}</p>
      <p><strong>Country:</strong> ${application.country}</p>
      <p><strong>Additional Notes:</strong> ${application.additionalNotes || 'None'}</p>
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
app.post('/api/contact', (req, res) => {
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
      <p><strong>Name:</strong> ${msg.name}</p>
      <p><strong>WhatsApp / Phone:</strong> ${msg.phone || 'N/A'}</p>
      <p><strong>Country:</strong> ${msg.country || 'N/A'}</p>
      <p><strong>Email:</strong> ${msg.email || 'N/A'}</p>
      <p><strong>Subject:</strong> ${msg.subject}</p>
      <p><strong>Message:</strong><br/>${msg.message.replace(/\n/g, '<br/>')}</p>`
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
// ADMIN AUTHENTICATION & PORTAL ROUTES
// -------------------------------------------------------------

app.post('/api/admin/login', (req, res) => {
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
    const token = dataStore.createAdminSession();
    return res.json({
      success: true,
      token,
      admin: { email: inputEmail, name: 'Academy Administrator' }
    });
  }

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
  const student = dataStore.addStudent(req.body);
  res.status(201).json({ success: true, student });
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

app.post('/api/admin/classes', requireAdmin, (req, res) => {
  const newClass = dataStore.addClass(req.body);
  res.status(201).json({ success: true, class: newClass });
});

app.patch('/api/admin/classes/:id', requireAdmin, (req, res) => {
  const updated = dataStore.updateClass(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Class not found' });
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

// IndexNow Instant Search Engine Indexing Endpoint
app.post('/api/indexnow/submit', async (req, res) => {
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
    'https://noorequraninstitute.me/female-tutors',
    'https://noorequraninstitute.me/female-quran-teacher',
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
app.post('/api/admin/testimonials', requireAdmin, (req, res) => {
  const testimonial = dataStore.addTestimonial(req.body);
  res.status(201).json({ success: true, testimonial });
});

app.delete('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
  const ok = dataStore.deleteTestimonial(req.params.id);
  res.json({ success: ok });
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

    // Local disk fallback
    if (base64Data) {
      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
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
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
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
      // Security: Prevent Path Traversal by extracting only the base file name
      const filename = path.basename(req.params.file);
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

    app.get('*', async (req, res) => {
      const { meta, is404 } = resolveRouteMetadata(req.path);

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
        html = injectSeoTagsIntoHtml(html, meta, req.path, (req.headers['user-agent'] as string) || '');
      }

      res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Noor-e-Quran Institute Server running on http://0.0.0.0:${PORT}`);

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
