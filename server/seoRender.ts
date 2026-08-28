import { dataStore } from './dataStore.js';

export const ACADEMY_BASE_URL = 'https://noorequraninstitute.me';

export interface PageMeta {
  title: string;
  h1?: string;
  description: string;
  canonical: string;
  ogType: string;
  ogImage: string;
  breadcrumbs: { name: string; item: string }[];
  extraSchema?: any;
}

export const KNOWN_STATIC_ROUTES: Record<string, PageMeta> = {
  '/': {
    title: 'Noor E Quran Institute | 1-on-1 Online Quran Classes with Certified Tutors',
    description: 'Learn Quran online with qualified male & female teachers at Noor E Quran Institute. 1-on-1 Tajweed classes for kids and adults worldwide with flexible timings and a free trial.',
    canonical: `${ACADEMY_BASE_URL}/`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [{ name: 'Home', item: `${ACADEMY_BASE_URL}/` }]
  },
  '/online-quran-classes': {
    title: 'Online Quran Courses & Curriculum | Noor-e-Quran Institute',
    description: 'Explore comprehensive online Quran courses: Noorani Qaida for beginners, Nazra Quran reading, Tajweed rules, and Hifz memorization with live 1-on-1 instruction.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` }
    ]
  },
  '/noorani-qaida': {
    title: 'Noorani Qaida for Beginners Online | Learn Arabic Letters with Tajweed',
    description: 'Master Arabic alphabet recognition, Makharij articulation points, and phonetic rules with certified 1-on-1 tutors. Ideal for children and beginner adults.',
    canonical: `${ACADEMY_BASE_URL}/noorani-qaida`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Noorani Qaida', item: `${ACADEMY_BASE_URL}/noorani-qaida` }
    ]
  },
  '/quran-reading-nazra': {
    title: 'Nazra Quran Reading Course Online | Fluent Recitation with 1-on-1 Tutors',
    description: 'Learn to read the complete 30 Juz of the Holy Quran fluently. Real-time pronunciation corrections, breath control, and daily progress tracking.',
    canonical: `${ACADEMY_BASE_URL}/quran-reading-nazra`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Nazra Quran', item: `${ACADEMY_BASE_URL}/quran-reading-nazra` }
    ]
  },
  '/quran-with-tajweed': {
    title: 'Quran with Tajweed Online | Theoretical & Practical Tajweed Rules',
    description: 'Master the sacred rules of Tajweed: Noon Sakin, Meem Sakin, Madd, and Stopping Signs (Waqf) taught 1-on-1 by certified Islamic scholars.',
    canonical: `${ACADEMY_BASE_URL}/quran-with-tajweed`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Quran with Tajweed', item: `${ACADEMY_BASE_URL}/quran-with-tajweed` }
    ]
  },
  '/quran-memorization-hifz': {
    title: 'Online Quran Memorization (Hifz) Course | Certified Huffaz & Daily Sabaq',
    description: 'Memorize the Holy Quran at home with structured daily Sabaq, Sabqi revision, and Manzil consolidation under certified male and female Huffaz.',
    canonical: `${ACADEMY_BASE_URL}/quran-memorization-hifz`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Hifz Program', item: `${ACADEMY_BASE_URL}/quran-memorization-hifz` }
    ]
  },
  '/islamic-studies': {
    title: 'Islamic Studies for Kids & Adults Online | Noor-e-Quran Institute',
    description: 'Learn essential Islamic fundamentals: Daily Masnoon Duas, 6 Kalmas, Step-by-Step Salah (Prayer), Seerah, and Hadith stories.',
    canonical: `${ACADEMY_BASE_URL}/islamic-studies`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Islamic Studies', item: `${ACADEMY_BASE_URL}/islamic-studies` }
    ]
  },
  '/quran-classes-for-kids': {
    title: 'Online Quran Classes for Kids | Gentle, Patient Male & Female Tutors',
    description: 'Engaging, interactive 1-on-1 Quran classes for children ages 4 and up. Noorani Qaida basics, fun Islamic manners, and daily progress feedback for parents.',
    canonical: `${ACADEMY_BASE_URL}/quran-classes-for-kids`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Kids Program', item: `${ACADEMY_BASE_URL}/quran-classes-for-kids` }
    ]
  },
  '/quran-classes-for-adults': {
    title: 'Online Quran Classes for Adults & Slow Learners | Patient 1-on-1 Guidance',
    description: 'Specialized 1-on-1 Quran learning tailored for busy working adults and slow learners. Supportive pace, private atmosphere, and flexible evening/weekend slots.',
    canonical: `${ACADEMY_BASE_URL}/quran-classes-for-adults`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Adults Program', item: `${ACADEMY_BASE_URL}/quran-classes-for-adults` }
    ]
  },
  '/female-quran-teacher': {
    title: 'Certified Female Quran Teachers Online | Dedicated for Sisters & Daughters',
    description: 'Learn Quran with certified female Quran tutors in complete privacy and comfort. Tailored 1-on-1 lessons in Noorani Qaida, Tajweed, and Hifz.',
    canonical: `${ACADEMY_BASE_URL}/female-quran-teacher`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Female Faculty', item: `${ACADEMY_BASE_URL}/female-quran-teacher` }
    ]
  },
  // International Program Pages
  '/online-quran-classes-uk': {
    title: 'Online Quran Classes UK | 1-on-1 Quran Lessons in London, Birmingham & UK',
    description: 'Dedicated 1-on-1 online Quran classes for UK Muslim students. Certified male and female tutors aligned with UK GMT/BST evening and weekend times.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-uk`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'UK Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-uk` }
    ]
  },
  '/online-quran-classes-usa': {
    title: 'Online Quran Classes USA | 1-on-1 Quran Tutors in EST, CST & PST Timezones',
    description: 'Learn Quran online across the United States. Personalized 1-on-1 classes for kids & adults with flexible after-school and weekend timings in all US timezones.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-usa`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'USA Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-usa` }
    ]
  },
  '/online-quran-classes-canada': {
    title: 'Online Quran Classes Canada | Toronto, Calgary & Vancouver 1-on-1 Tutors',
    description: 'Dedicated 1-on-1 online Quran classes for Muslim students across Canada. Personalized lessons for children and adults with patient, qualified tutors and flexible schedules.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-canada`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Canada Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-canada` }
    ]
  },
  '/online-quran-classes-australia': {
    title: 'Online Quran Classes Australia | Sydney, Melbourne & Brisbane 1-on-1 Lessons',
    description: 'Live 1-on-1 online Quran classes tailored for students in Australia (AEST/AWST). Certified male and female tutors with 3-day free trial.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-australia`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Australia Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-australia` }
    ]
  },
  '/online-quran-classes-pakistan': {
    title: 'Online Quran Classes Pakistan | Noorani Qaida, Nazra & Tajweed in Urdu/English',
    description: 'Affordable online Quran classes in Pakistan. Flexible scheduling in PKT timezone with certified Qaris and Alim/Alimah faculty.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Pakistan Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan` }
    ]
  },
  '/courses': {
    title: 'Certified 1-on-1 Online Quran Courses | Noor E Quran Institute',
    description: 'Explore comprehensive online Quran courses: Noorani Qaida for beginners, Nazra Quran reading, Tajweed rules, and Hifz memorization with live 1-on-1 instruction.',
    canonical: `${ACADEMY_BASE_URL}/courses`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/courses` }
    ]
  },
  '/teachers': {
    title: 'Certified Male & Female Quran Teachers | Noor E Quran Institute',
    description: 'Verified Ijazah holders and Islamic university graduates dedicated to patient, interactive 1-on-1 Quran education.',
    canonical: `${ACADEMY_BASE_URL}/teachers`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Teachers', item: `${ACADEMY_BASE_URL}/teachers` }
    ]
  },
  '/faculty': {
    title: 'Certified Male & Female Quran Teachers | Noor E Quran Institute',
    description: 'Verified Ijazah holders and Islamic university graduates dedicated to patient, interactive 1-on-1 Quran education.',
    canonical: `${ACADEMY_BASE_URL}/teachers`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Teachers', item: `${ACADEMY_BASE_URL}/teachers` }
    ]
  },
  '/tutors': {
    title: 'Certified Male & Female Quran Teachers | Noor E Quran Institute',
    description: 'Verified Ijazah holders and Islamic university graduates dedicated to patient, interactive 1-on-1 Quran education.',
    canonical: `${ACADEMY_BASE_URL}/teachers`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Teachers', item: `${ACADEMY_BASE_URL}/teachers` }
    ]
  },
  '/packages': {
    title: 'Affordable 1-on-1 Quran Tuition Plans | Noor E Quran Institute',
    description: 'Transparent monthly plans with family discounts and a 3-day free trial. Choose classes 2 to 5 days per week.',
    canonical: `${ACADEMY_BASE_URL}/packages`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Tuition & Plans', item: `${ACADEMY_BASE_URL}/packages` }
    ]
  },
  '/pricing': {
    title: 'Affordable 1-on-1 Quran Tuition Plans | Noor E Quran Institute',
    description: 'Transparent monthly plans with family discounts and a 3-day free trial. Choose classes 2 to 5 days per week.',
    canonical: `${ACADEMY_BASE_URL}/packages`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Tuition & Plans', item: `${ACADEMY_BASE_URL}/packages` }
    ]
  },
  '/how-it-works': {
    title: 'How Online Quran Learning Works | Noor E Quran Institute',
    description: 'A simple, transparent 4-step path from initial trial to fluent Quran recitation.',
    canonical: `${ACADEMY_BASE_URL}/how-it-works`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'How It Works', item: `${ACADEMY_BASE_URL}/how-it-works` }
    ]
  },
  '/methodology': {
    title: 'How Online Quran Learning Works | Noor E Quran Institute',
    description: 'A simple, transparent 4-step path from initial trial to fluent Quran recitation.',
    canonical: `${ACADEMY_BASE_URL}/how-it-works`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'How It Works', item: `${ACADEMY_BASE_URL}/how-it-works` }
    ]
  },
  '/about': {
    title: 'About Noor E Quran Institute | Certified International Quran Academy',
    description: 'Dedicated to providing authentic, certified, and deeply respectful Quranic education to families across the globe.',
    canonical: `${ACADEMY_BASE_URL}/about`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'About Us', item: `${ACADEMY_BASE_URL}/about` }
    ]
  },
  '/about-us': {
    title: 'About Noor E Quran Institute | Certified International Quran Academy',
    description: 'Dedicated to providing authentic, certified, and deeply respectful Quranic education to families across the globe.',
    canonical: `${ACADEMY_BASE_URL}/about`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'About Us', item: `${ACADEMY_BASE_URL}/about` }
    ]
  },
  '/blog': {
    title: 'Islamic Knowledge & Insights Blog | Noor E Quran Institute',
    description: 'Read expert articles on Tajweed rules, Quran memorization methods, kids Islamic education, and online Quran learning guides.',
    canonical: `${ACADEMY_BASE_URL}/blog`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` }
    ]
  },
  '/blogs': {
    title: 'Islamic Knowledge & Insights Blog | Noor E Quran Institute',
    description: 'Read expert articles on Tajweed rules, Quran memorization methods, kids Islamic education, and online Quran learning guides.',
    canonical: `${ACADEMY_BASE_URL}/blog`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` }
    ]
  },
  '/articles': {
    title: 'Islamic Knowledge & Insights Blog | Noor E Quran Institute',
    description: 'Read expert articles on Tajweed rules, Quran memorization methods, kids Islamic education, and online Quran learning guides.',
    canonical: `${ACADEMY_BASE_URL}/blog`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` }
    ]
  },
  '/contact': {
    title: 'Contact Academic Support | Noor E Quran Institute',
    description: 'Reach out via WhatsApp, email, or direct inquiry form for curriculum consultation and trial scheduling.',
    canonical: `${ACADEMY_BASE_URL}/contact`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Contact Us', item: `${ACADEMY_BASE_URL}/contact` }
    ]
  },
  '/contact-us': {
    title: 'Contact Academic Support | Noor E Quran Institute',
    description: 'Reach out via WhatsApp, email, or direct inquiry form for curriculum consultation and trial scheduling.',
    canonical: `${ACADEMY_BASE_URL}/contact`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Contact Us', item: `${ACADEMY_BASE_URL}/contact` }
    ]
  },
  '/faq': {
    title: 'Frequently Asked Questions | Noor E Quran Institute',
    description: 'Clear answers regarding trial lessons, female scholars, tuition schedules, technical requirements, and curriculum structure.',
    canonical: `${ACADEMY_BASE_URL}/faq`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'FAQ', item: `${ACADEMY_BASE_URL}/faq` }
    ]
  },
  '/classroom': {
    title: 'Live Classroom Studio | Noor E Quran Institute',
    description: 'Interactive online Quran classroom studio with live video, Mushaf reader, and Tajweed markers.',
    canonical: `${ACADEMY_BASE_URL}/classroom`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Classroom', item: `${ACADEMY_BASE_URL}/classroom` }
    ]
  },
  '/student': {
    title: 'Student Portal | Noor E Quran Institute',
    description: 'Student learning dashboard for Noor E Quran Institute.',
    canonical: `${ACADEMY_BASE_URL}/student`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Student Portal', item: `${ACADEMY_BASE_URL}/student` }
    ]
  },
  '/student-portal': {
    title: 'Student Portal | Noor E Quran Institute',
    description: 'Student learning dashboard for Noor E Quran Institute.',
    canonical: `${ACADEMY_BASE_URL}/student`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Student Portal', item: `${ACADEMY_BASE_URL}/student` }
    ]
  },
  '/teacher': {
    title: 'Teacher Portal | Noor E Quran Institute',
    description: 'Faculty management dashboard for Noor E Quran Institute.',
    canonical: `${ACADEMY_BASE_URL}/teacher`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Teacher Portal', item: `${ACADEMY_BASE_URL}/teacher` }
    ]
  },
  '/teacher-portal': {
    title: 'Teacher Portal | Noor E Quran Institute',
    description: 'Faculty management dashboard for Noor E Quran Institute.',
    canonical: `${ACADEMY_BASE_URL}/teacher`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Teacher Portal', item: `${ACADEMY_BASE_URL}/teacher` }
    ]
  },
  // Application and Portal Pages
  '/portal': {
    title: 'Student & Tutor Portal | Noor E Quran Institute',
    description: 'Access your online Quran classroom, view class schedules, attendance, assignments, and monthly teacher progress assessments.',
    canonical: `${ACADEMY_BASE_URL}/portal`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Portal', item: `${ACADEMY_BASE_URL}/portal` }
    ]
  },
  '/login': {
    title: 'Sign In | Noor E Quran Institute Portal',
    description: 'Log into your student or teacher account at Noor E Quran Institute.',
    canonical: `${ACADEMY_BASE_URL}/login`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Login', item: `${ACADEMY_BASE_URL}/login` }
    ]
  },
  '/register': {
    title: 'Student Registration & Enrollment | Noor E Quran Institute',
    description: 'Register for 1-on-1 online Quran classes with certified male or female tutors. Fast verification and flexible scheduling.',
    canonical: `${ACADEMY_BASE_URL}/register`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Register', item: `${ACADEMY_BASE_URL}/register` }
    ]
  },
  '/admin': {
    title: 'Academy Admin Dashboard | Noor E Quran Institute',
    description: 'Secure administration portal for Noor-e-Quran Institute management.',
    canonical: `${ACADEMY_BASE_URL}/admin`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Admin', item: `${ACADEMY_BASE_URL}/admin` }
    ]
  },
  '/admin-portal': {
    title: 'Academy Admin Dashboard | Noor-e-Quran Institute',
    description: 'Secure administration portal for Noor-e-Quran Institute management.',
    canonical: `${ACADEMY_BASE_URL}/admin`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Admin', item: `${ACADEMY_BASE_URL}/admin` }
    ]
  },
  '/staff-portal': {
    title: 'Academy Admin Dashboard | Noor-e-Quran Institute',
    description: 'Secure administration portal for Noor-e-Quran Institute management.',
    canonical: `${ACADEMY_BASE_URL}/admin`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Admin', item: `${ACADEMY_BASE_URL}/admin` }
    ]
  }
};

export const HREFLANG_TAGS = `
    <!-- International Hreflang Canonical References -->
    <link rel="alternate" hreflang="en" href="${ACADEMY_BASE_URL}/" />
    <link rel="alternate" hreflang="x-default" href="${ACADEMY_BASE_URL}/" />
    <link rel="alternate" hreflang="en-gb" href="${ACADEMY_BASE_URL}/online-quran-classes-uk" />
    <link rel="alternate" hreflang="en-us" href="${ACADEMY_BASE_URL}/online-quran-classes-usa" />
    <link rel="alternate" hreflang="en-ca" href="${ACADEMY_BASE_URL}/online-quran-classes-canada" />
    <link rel="alternate" hreflang="en-au" href="${ACADEMY_BASE_URL}/online-quran-classes-australia" />
    <link rel="alternate" hreflang="en-pk" href="${ACADEMY_BASE_URL}/online-quran-classes-pakistan" />
    <link rel="alternate" hreflang="ur-pk" href="${ACADEMY_BASE_URL}/online-quran-classes-pakistan" />
`;

function resolveCourseRouteMetadata(normalizedPath: string): { meta: PageMeta | null; is404: boolean } | null {
  const slug = normalizedPath.replace('/courses/', '').trim();
  const course = dataStore.getCourseBySlug(slug) || dataStore.getCourses().find(c => c.id === slug);
  if (course) {
    const canonical = `${ACADEMY_BASE_URL}/courses/${course.slug || course.id}`;
    const meta: PageMeta = {
      title: `${course.name} Online Course with Tajweed | Noor-e-Quran Institute`,
      description: course.shortDescription || `Learn ${course.name} online with 1-on-1 certified tutors. Flexible timings and 3-day free trial.`,
      canonical,
      ogType: 'article',
      ogImage: `${ACADEMY_BASE_URL}/logo.png`,
      breadcrumbs: [
        { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
        { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
        { name: course.name, item: canonical }
      ],
      extraSchema: {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.name,
        description: course.description || course.shortDescription,
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Noor-e-Quran Institute',
          sameAs: ACADEMY_BASE_URL
        },
        timeRequired: course.duration || '3-6 Months',
        offers: {
          '@type': 'Offer',
          category: 'Monthly Quran Tuition',
          priceCurrency: 'USD',
          price: course.feeUSD || 35,
          url: canonical
        }
      }
    };
    return { meta, is404: false };
  }
  return null;
}

function resolveBlogRouteMetadata(normalizedPath: string): { meta: PageMeta | null; is404: boolean } | null {
  const slug = normalizedPath.replace(/^\/(blog|articles)\//, '').trim();
  const article = dataStore.getArticleBySlug(slug) || dataStore.getArticles().find(a => a.id === slug);
  if (article) {
    const canonical = `${ACADEMY_BASE_URL}/blog/${article.slug || article.id}`;
    const meta: PageMeta = {
      title: `${article.title} | Noor-e-Quran Institute Blog`,
      description: article.summary || `Read comprehensive educational guide: ${article.title}. Practical advice for Muslim learners and parents.`,
      canonical,
      ogType: 'article',
      ogImage: `${ACADEMY_BASE_URL}/logo.png`,
      breadcrumbs: [
        { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
        { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` },
        { name: article.title, item: canonical }
      ],
      extraSchema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.summary,
        author: {
          '@type': article.author ? 'Person' : 'EducationalOrganization',
          name: article.author || 'Noor-e-Quran Institute Editorial Team'
        },
        publisher: {
          '@type': 'EducationalOrganization',
          name: 'Noor-e-Quran Institute',
          logo: {
            '@type': 'ImageObject',
            url: `${ACADEMY_BASE_URL}/logo.png`
          }
        },
        datePublished: article.publishedAt || '2026-01-15',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonical
        }
      }
    };
    return { meta, is404: false };
  }

  // Dynamic article fallback for Firestore published posts
  const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const canonical = `${ACADEMY_BASE_URL}/blog/${slug}`;
  const meta: PageMeta = {
    title: `${formattedTitle} | Noor E Quran Institute`,
    description: `Read educational article and Quran learning guide on ${formattedTitle}.`,
    canonical,
    ogType: 'article',
    ogImage: `${ACADEMY_BASE_URL}/logo.png`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` },
      { name: formattedTitle, item: canonical }
    ]
  };
  return { meta, is404: false };
}

/**
 * Resolve metadata for any incoming request path
 */
export function resolveRouteMetadata(rawPath: string): { meta: PageMeta | null; is404: boolean } {
  // Normalize path
  const normalizedPath = rawPath.split('?')[0].replace(/\/+$/, '') || '/';

  // 1. Check known static routes
  if (KNOWN_STATIC_ROUTES[normalizedPath]) {
    return { meta: KNOWN_STATIC_ROUTES[normalizedPath], is404: false };
  }

  // 2. Dynamic Course route: /courses/:slug
  if (normalizedPath.startsWith('/courses/')) {
    const courseMeta = resolveCourseRouteMetadata(normalizedPath);
    if (courseMeta) return courseMeta;
  }

  // 3. Dynamic Blog route: /blog/:slug or /articles/:slug
  if (normalizedPath.startsWith('/blog/') || normalizedPath.startsWith('/articles/')) {
    const blogMeta = resolveBlogRouteMetadata(normalizedPath);
    if (blogMeta) return blogMeta;
  }

  // 4. Portal and Specialized paths are handled by Client SPA Router
  if (
    normalizedPath.startsWith('/classroom') ||
    normalizedPath.startsWith('/student') ||
    normalizedPath.startsWith('/teacher') ||
    normalizedPath.startsWith('/admin')
  ) {
    return { meta: null, is404: false };
  }

  // Path not recognized -> genuine 404
  return { meta: null, is404: true };
}

/**
 * Generates dynamic, compliant XML Sitemap with all static pages, courses, and articles
 */
export function generateDynamicSitemapXml(): string {
  const courses = dataStore.getCourses();
  const articles = dataStore.getArticles();
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${ACADEMY_BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes`, priority: '0.95', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/noorani-qaida`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/quran-reading-nazra`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/quran-with-tajweed`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/quran-memorization-hifz`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/islamic-studies`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/quran-classes-for-kids`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/quran-classes-for-adults`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/female-quran-teacher`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/pricing`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/free-trial`, priority: '0.95', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/faculty`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/about-us`, priority: '0.75', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/faq`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/contact-us`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/blog`, priority: '0.85', changefreq: 'daily' },
    // International GEO Landing Pages
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-uk`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-usa`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-canada`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-australia`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan`, priority: '0.85', changefreq: 'weekly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // 1. Static Pages
  for (const page of staticUrls) {
    xml += `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  }

  // 2. Dynamic Course Deep Links
  for (const course of courses) {
    const slug = course.slug || course.id;
    xml += `  <url>
    <loc>${ACADEMY_BASE_URL}/courses/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
  }

  // 3. Dynamic Blog Articles
  for (const article of articles) {
    const slug = article.slug || article.id;
    const pubDate = article.publishedAt || today;
    xml += `  <url>
    <loc>${ACADEMY_BASE_URL}/blog/${slug}</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Generates search-engine compliant robots.txt with crawling guidelines
 */
export function generateRobotsTxt(): string {
  return `# Robots.txt for Noor-e-Quran Institute (${ACADEMY_BASE_URL})
User-agent: *
Allow: /
Allow: /online-quran-classes
Allow: /noorani-qaida
Allow: /quran-reading-nazra
Allow: /quran-with-tajweed
Allow: /quran-memorization-hifz
Allow: /islamic-studies
Allow: /quran-classes-for-kids
Allow: /quran-classes-for-adults
Allow: /female-quran-teacher
Allow: /pricing
Allow: /free-trial
Allow: /faculty
Allow: /about-us
Allow: /faq
Allow: /contact-us
Allow: /blog
Allow: /courses/
Allow: /blog/
Allow: /online-quran-classes-uk
Allow: /online-quran-classes-usa
Allow: /online-quran-classes-canada
Allow: /online-quran-classes-australia
Allow: /online-quran-classes-pakistan

# Disallow Private & Admin Areas
Disallow: /admin
Disallow: /admin/
Disallow: /admin-portal
Disallow: /staff-portal
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /classroom/

# Googlebot & Bingbot Special Directives
User-agent: Googlebot
Allow: /
User-agent: Googlebot-Image
Allow: /
User-agent: Bingbot
Allow: /

# Sitemap Location
Sitemap: ${ACADEMY_BASE_URL}/sitemap.xml
`;
}

/**
 * Generates rich, semantic, crawlable prerendered HTML content for bots & SEO crawlers.
 * Contains visible H1, descending H2/H3 hierarchy, 1000+ words of authentic copy, and internal links.
 */
export function generateRoutePrerenderHtml(routePath: string, meta: PageMeta): string {
  const normalizedPath = routePath.split('?')[0].replace(/\/$/, '') || '/';
  const courses = dataStore.getCourses();
  const articles = dataStore.getArticles();

  // Dynamic Course Route HTML
  if (normalizedPath.startsWith('/courses/')) {
    const slug = normalizedPath.replace('/courses/', '').trim();
    const course = dataStore.getCourseBySlug(slug) || courses.find(c => c.id === slug);
    if (course) {
      return `
      <div id="ssr-container" class="ssr-content">
        <header style="background:#064E3B;color:#ffffff;padding:24px 20px;text-align:center;">
          <nav style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <a href="/" style="color:#D4A72C;font-weight:800;font-size:20px;text-decoration:none;">Noor-e-Quran Institute</a>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a href="/online-quran-classes" style="color:#ffffff;text-decoration:none;">All Courses</a>
              <a href="/noorani-qaida" style="color:#ffffff;text-decoration:none;">Noorani Qaida</a>
              <a href="/quran-with-tajweed" style="color:#ffffff;text-decoration:none;">Tajweed</a>
              <a href="/quran-memorization-hifz" style="color:#ffffff;text-decoration:none;">Hifz</a>
              <a href="/pricing" style="color:#ffffff;text-decoration:none;">Pricing</a>
              <a href="/free-trial" style="background:#D4A72C;color:#064E3B;padding:6px 14px;border-radius:6px;font-weight:700;text-decoration:none;">Free Trial</a>
            </div>
          </nav>
        </header>

        <main style="max-width:1000px;margin:30px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;color:#17201B;line-height:1.7;">
          <article>
            <span style="display:inline-block;background:#E6F4EA;color:#064E3B;padding:4px 12px;border-radius:12px;font-size:13px;font-weight:700;margin-bottom:12px;">Certified Online Course</span>
            <h1 style="font-size:32px;color:#064E3B;margin-top:0;margin-bottom:16px;">${course.name}</h1>
            <p style="font-size:18px;color:#374151;font-weight:500;margin-bottom:24px;">${course.description || course.shortDescription}</p>

            <section style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:24px;margin-bottom:30px;">
              <h2 style="font-size:22px;color:#064E3B;margin-top:0;">Course Curriculum & Highlights</h2>
              <ul style="padding-left:20px;color:#4B5563;">
                ${(course.highlights || ['1-on-1 Personalized Live Tuition', 'Qualified Male & Female Scholars', 'Interactive Digital Whiteboard', 'Flexible Timings & Recorded Lessons', 'Monthly Progress Evaluation Reports']).map(f => `<li style="margin-bottom:8px;">${f}</li>`).join('')}
              </ul>
              <div style="margin-top:16px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
                <span style="font-weight:700;color:#064E3B;">Tuition Fee: $${course.feeUSD || 35}/Month</span>
                <span style="color:#6B7280;">• Recommended Audience: ${course.audience || 'All Ages (4+)'}</span>
                <span style="color:#6B7280;">• Duration: ${course.duration || '3 to 6 Months'}</span>
              </div>
            </section>

            <section style="margin-bottom:30px;">
              <h2 style="font-size:22px;color:#064E3B;">Why Enroll in This Course at Noor-e-Quran Institute?</h2>
              <p>Our online ${course.name} provides students with individual one-on-one attention from certified tutors who specialize in Makharij, Tajweed rules, and interactive pedagogy. Whether starting from the basics or mastering advanced recitation, each student progresses at their own comfortable pace.</p>
              <p>Classes are held over Zoom or Google Meet with screen sharing of high-resolution digital Quran pages, ensuring clear visual and auditory learning.</p>
            </section>

            <section style="background:#064E3B;color:#ffffff;border-radius:12px;padding:24px;text-align:center;">
              <h2 style="font-size:22px;color:#ffffff;margin-top:0;">Start with a 3-Day 100% Free Trial</h2>
              <p style="color:#E6F4EA;margin-bottom:18px;">No credit card required. Experience our personalized teaching quality firsthand.</p>
              <a href="/free-trial" style="display:inline-block;background:#D4A72C;color:#064E3B;font-weight:800;padding:12px 24px;border-radius:8px;text-decoration:none;">Book Free Trial Class</a>
            </section>
          </article>
        </main>
      </div>`;
    }
  }

  // Dynamic Blog Route HTML
  if (normalizedPath.startsWith('/blog/')) {
    const slug = normalizedPath.replace('/blog/', '').trim();
    const article = dataStore.getArticleBySlug(slug) || articles.find(a => a.id === slug);
    if (article) {
      return `
      <div id="ssr-container" class="ssr-content">
        <header style="background:#064E3B;color:#ffffff;padding:24px 20px;text-align:center;">
          <nav style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <a href="/" style="color:#D4A72C;font-weight:800;font-size:20px;text-decoration:none;">Noor-e-Quran Institute</a>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a href="/blog" style="color:#ffffff;text-decoration:none;">Blog Index</a>
              <a href="/online-quran-classes" style="color:#ffffff;text-decoration:none;">Courses</a>
              <a href="/free-trial" style="background:#D4A72C;color:#064E3B;padding:6px 14px;border-radius:6px;font-weight:700;text-decoration:none;">Free Trial</a>
            </div>
          </nav>
        </header>

        <main style="max-width:900px;margin:30px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;color:#17201B;line-height:1.8;">
          <article>
            <span style="color:#6B7280;font-size:14px;">Published by ${article.author || 'Noor-e-Quran Institute Academic Team'} • ${article.publishedAt || '2026-01-15'}</span>
            <h1 style="font-size:32px;color:#064E3B;margin-top:8px;margin-bottom:16px;">${article.title}</h1>
            <p style="font-size:18px;color:#4B5563;font-weight:500;margin-bottom:24px;">${article.summary}</p>
            <hr style="border:0;border-top:1px solid #E5E7EB;margin:24px 0;" />
            <div style="font-size:16px;color:#374151;">
              ${article.content ? article.content.split('\n\n').map(p => `<p style="margin-bottom:16px;">${p}</p>`).join('') : `<p>${article.summary}</p>`}
            </div>
            <section style="background:#F3F4F6;border-radius:12px;padding:24px;margin-top:36px;text-align:center;">
              <h2 style="font-size:20px;color:#064E3B;margin-top:0;">Learn Quran Online with Certified Scholars</h2>
              <p style="color:#4B5563;margin-bottom:16px;">Register for a 3-day free trial class for kids or adults with flexible timings.</p>
              <a href="/free-trial" style="display:inline-block;background:#064E3B;color:#ffffff;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;">Get Started Free</a>
            </section>
          </article>
        </main>
      </div>`;
    }
  }

  // Universal Static & Homepage HTML Pre-rendering
  return `
  <div id="ssr-container" class="ssr-content" style="font-family:system-ui,-apple-system,sans-serif;color:#17201B;line-height:1.6;background:#FAFAF7;">
    <!-- Navigation Bar -->
    <header style="background:#064E3B;color:#ffffff;padding:16px 20px;border-bottom:3px solid #D4A72C;">
      <div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <a href="/" style="color:#D4A72C;font-weight:800;font-size:22px;text-decoration:none;display:flex;align-items:center;gap:8px;">
          <span>Noor-e-Quran Institute</span>
        </a>
        <nav style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;font-size:15px;font-weight:500;">
          <a href="/online-quran-classes" style="color:#ffffff;text-decoration:none;">Quran Courses</a>
          <a href="/noorani-qaida" style="color:#ffffff;text-decoration:none;">Noorani Qaida</a>
          <a href="/quran-reading-nazra" style="color:#ffffff;text-decoration:none;">Nazra Quran</a>
          <a href="/quran-with-tajweed" style="color:#ffffff;text-decoration:none;">Tajweed Rules</a>
          <a href="/quran-memorization-hifz" style="color:#ffffff;text-decoration:none;">Hifz Program</a>
          <a href="/islamic-studies" style="color:#ffffff;text-decoration:none;">Islamic Studies</a>
          <a href="/female-quran-teacher" style="color:#ffffff;text-decoration:none;">Female Tutors</a>
          <a href="/pricing" style="color:#ffffff;text-decoration:none;">Fee Packages</a>
          <a href="/faculty" style="color:#ffffff;text-decoration:none;">Scholars</a>
          <a href="/blog" style="color:#ffffff;text-decoration:none;">Blog</a>
          <a href="/contact-us" style="color:#ffffff;text-decoration:none;">Contact</a>
          <a href="/free-trial" style="background:#D4A72C;color:#064E3B;padding:8px 16px;border-radius:6px;font-weight:700;text-decoration:none;">3-Day Free Trial</a>
        </nav>
      </div>
    </header>

    <main style="max-width:1200px;margin:0 auto;padding:30px 20px;">
      <!-- Hero Section with Exact Single H1 Matching Route -->
      <section style="background:#064E3B;color:#ffffff;border-radius:16px;padding:40px 30px;margin-bottom:40px;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        <div style="max-width:800px;">
          <span style="display:inline-block;background:rgba(212,167,44,0.2);border:1px solid #D4A72C;color:#D4A72C;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:16px;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • Global Islamic Learning</span>
          <h1 style="font-size:36px;line-height:1.25;font-weight:800;color:#ffffff;margin-top:0;margin-bottom:16px;">
            ${meta.h1 || (meta.title.includes('|') ? meta.title.split('|')[0].trim() : meta.title)}
          </h1>
          <p style="font-size:18px;color:#E6F4EA;line-height:1.7;margin-bottom:24px;">
            ${meta.description}
          </p>
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
            <a href="/free-trial" style="background:#D4A72C;color:#064E3B;font-weight:800;font-size:16px;padding:14px 28px;border-radius:8px;text-decoration:none;">Book 3-Day Free Trial</a>
            <a href="/online-quran-classes" style="background:rgba(255,255,255,0.1);color:#ffffff;border:1px solid rgba(255,255,255,0.3);font-weight:600;font-size:16px;padding:14px 24px;border-radius:8px;text-decoration:none;">Explore All Courses</a>
            <a href="https://wa.me/923274496163" style="color:#D4A72C;font-weight:600;text-decoration:none;margin-left:8px;">WhatsApp: +92 327 4496163</a>
          </div>
        </div>
      </section>

      <!-- Section: Comprehensive Courses Hierarchy (H2 & H3) -->
      <section style="margin-bottom:50px;">
        <div style="text-align:center;max-width:700px;margin:0 auto 36px;">
          <h2 style="font-size:30px;color:#064E3B;margin-bottom:12px;">Our Comprehensive Online Quran Courses</h2>
          <p style="color:#4B5563;font-size:16px;">Structured learning pathways designed by verified Islamic scholars for all age groups, from absolute beginners to advanced reciters.</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
          <!-- Course Card 1 -->
          <article style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="font-size:20px;color:#064E3B;margin-top:0;"><a href="/noorani-qaida" style="color:#064E3B;text-decoration:none;">Noorani Qaida for Beginners</a></h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;">Build a solid foundation with Arabic alphabet recognition, phonetic sounds (Makharij), joint letters, Harakaat, and basic pronunciation principles.</p>
            <a href="/noorani-qaida" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">Course Details & Syllabus →</a>
          </article>

          <!-- Course Card 2 -->
          <article style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="font-size:20px;color:#064E3B;margin-top:0;"><a href="/quran-reading-nazra" style="color:#064E3B;text-decoration:none;">Nazra Quran Reading Course</a></h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;">Recite the complete 30 Juz of the Holy Quran with fluency and rhythm under continuous real-time guidance and breath control techniques.</p>
            <a href="/quran-reading-nazra" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">Course Details & Syllabus →</a>
          </article>

          <!-- Course Card 3 -->
          <article style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="font-size:20px;color:#064E3B;margin-top:0;"><a href="/quran-with-tajweed" style="color:#064E3B;text-decoration:none;">Quran Recitation with Tajweed</a></h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;">Master the classical science of Tajweed: Noon & Meem Sakinah rules, Ghunnah, Qalqalah, Madd elongation types, and proper pausing symbols (Waqf).</p>
            <a href="/quran-with-tajweed" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">Course Details & Syllabus →</a>
          </article>

          <!-- Course Card 4 -->
          <article style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="font-size:20px;color:#064E3B;margin-top:0;"><a href="/quran-memorization-hifz" style="color:#064E3B;text-decoration:none;">Quran Memorization (Hifz) Program</a></h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;">Structured Hifzul Quran track with daily new lessons (Sabaq), short revision (Sabqi), and long revision (Manzil) supervised by certified Huffaz.</p>
            <a href="/quran-memorization-hifz" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">Course Details & Syllabus →</a>
          </article>

          <!-- Course Card 5 -->
          <article style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="font-size:20px;color:#064E3B;margin-top:0;"><a href="/islamic-studies" style="color:#064E3B;text-decoration:none;">Islamic Studies & Daily Duas</a></h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;">Comprehensive fundamentals including the 6 Kalmas, step-by-step Salah and Wudu instructions, 40 Masnoon Duas, and inspirational Seerah stories.</p>
            <a href="/islamic-studies" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">Course Details & Syllabus →</a>
          </article>

          <!-- Course Card 6 -->
          <article style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="font-size:20px;color:#064E3B;margin-top:0;"><a href="/female-quran-teacher" style="color:#064E3B;text-decoration:none;">Female Quran Tutors for Sisters</a></h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;">Private, comfortable 1-on-1 learning environment with qualified female Alimah and Hafiza tutors dedicated to sisters and young girls worldwide.</p>
            <a href="/female-quran-teacher" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">Course Details & Syllabus →</a>
          </article>
        </div>
      </section>

      <!-- Section: Why Choose Noor-e-Quran Institute -->
      <section style="background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:40px 30px;margin-bottom:50px;">
        <h2 style="font-size:28px;color:#064E3B;margin-top:0;margin-bottom:16px;">Why Choose Noor-e-Quran Institute?</h2>
        <p style="color:#4B5563;font-size:16px;line-height:1.7;margin-bottom:24px;">
          Finding a trustworthy, qualified, and patient Quran tutor can be challenging for Muslim families living abroad in the UK, USA, Canada, Australia, Europe, and the Middle East. Noor-e-Quran Institute bridges this gap by offering live one-on-one virtual classrooms that fit seamlessly into busy modern schedules.
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
          <div>
            <h3 style="font-size:18px;color:#064E3B;margin-bottom:8px;">1. 100% Individual 1-on-1 Attention</h3>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;">Unlike crowded group settings, our teachers dedicate their full 30 to 45-minute lesson solely to your child, rectifying pronunciation mistakes instantly.</p>
          </div>
          <div>
            <h3 style="font-size:18px;color:#064E3B;margin-bottom:8px;">2. Verified Male & Female Scholars</h3>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;">Our educators hold Ijazah certificates and degrees from renowned Islamic universities, passing rigorous background checks and pedagogical training.</p>
          </div>
          <div>
            <h3 style="font-size:18px;color:#064E3B;margin-bottom:8px;">3. 24/7 Flexible Timetable</h3>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;">Select class times that suit your family timezone, including morning, after-school, evening, and weekend slots with easy rescheduling options.</p>
          </div>
          <div>
            <h3 style="font-size:18px;color:#064E3B;margin-bottom:8px;">4. Monthly Progress & Performance Reports</h3>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;">Parents receive detailed periodic assessments covering lesson attendance, fluency scores, Tajweed accuracy, and teacher recommendations.</p>
          </div>
        </div>
      </section>

      <!-- Section: Certified Tutors -->
      <section style="margin-bottom:50px;">
        <div style="text-align:center;max-width:700px;margin:0 auto 30px;">
          <h2 style="font-size:28px;color:#064E3B;margin-bottom:8px;">Meet Our Certified Quran Faculty</h2>
          <p style="color:#4B5563;">Experienced Islamic scholars dedicated to nurturing love and understanding of the Holy Quran.</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:20px;">
          <div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;">
            <h3 style="font-size:18px;color:#064E3B;margin-top:0;">Qari Muhammad Usman</h3>
            <p style="color:#6B7280;font-size:13px;margin-bottom:8px;">Senior Tajweed & Qira'at Specialist (Ijazah Holder)</p>
            <p style="color:#4B5563;font-size:14px;">12+ years of international teaching experience specializing in advanced Tajweed rules and Makhaarij correction.</p>
          </div>
          <div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;">
            <h3 style="font-size:18px;color:#064E3B;margin-top:0;">Ustadha Fatima Noor</h3>
            <p style="color:#6B7280;font-size:13px;margin-bottom:8px;">Head of Female Quran & Children's Department</p>
            <p style="color:#4B5563;font-size:14px;">Certified Alimah and Hafiza specializing in child psychology, gentle Noorani Qaida tutoring, and sisters' Tajweed circles.</p>
          </div>
          <div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;">
            <h3 style="font-size:18px;color:#064E3B;margin-top:0;">Hafiz Abdul Rehman</h3>
            <p style="color:#6B7280;font-size:13px;margin-bottom:8px;">Hifz Program Lead Coordinator</p>
            <p style="color:#4B5563;font-size:14px;">Experienced Quran memorization mentor who has guided over 80 students to complete their full Quran Hifz successfully.</p>
          </div>
        </div>
      </section>

      <!-- Section: Frequently Asked Questions -->
      <section style="background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:36px 30px;margin-bottom:50px;">
        <h2 style="font-size:28px;color:#064E3B;margin-top:0;margin-bottom:20px;">Frequently Asked Questions (FAQs)</h2>

        <div style="display:flex;flex-direction:column;gap:18px;">
          <div>
            <h3 style="font-size:17px;color:#064E3B;margin-bottom:6px;">How do 1-on-1 online Quran classes work?</h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;margin:0;">Classes take place live via Zoom or Google Meet. The teacher screen-shares high-definition digital Qaida and Quran pages, listens to the student recitation, and provides real-time pronunciation feedback.</p>
          </div>
          <div>
            <h3 style="font-size:17px;color:#064E3B;margin-bottom:6px;">Can I request a female Quran tutor for my daughter or wife?</h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;margin:0;">Yes, we have certified female Quran teachers available for sisters, young girls, and toddlers to guarantee total comfort and Islamic etiquette.</p>
          </div>
          <div>
            <h3 style="font-size:17px;color:#064E3B;margin-bottom:6px;">How does the 3-day free trial work?</h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;margin:0;">Simply fill out the free trial form. We match you with a teacher based on your preferred schedule and language. You attend 3 full trial classes without entering any credit card details.</p>
          </div>
          <div>
            <h3 style="font-size:17px;color:#064E3B;margin-bottom:6px;">What devices and internet speed are required?</h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;margin:0;">Any laptop, desktop, tablet, iPad, or smartphone with a stable internet connection (at least 2 Mbps) and a working microphone/headset is sufficient.</p>
          </div>
        </div>
      </section>

      <!-- Section: International Geo Links -->
      <section style="background:#E6F4EA;border-radius:12px;padding:24px;margin-bottom:40px;">
        <h2 style="font-size:20px;color:#064E3B;margin-top:0;margin-bottom:12px;">Global Quran Learning by Country & Region</h2>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:14px;font-weight:600;">
          <a href="/online-quran-classes-uk" style="color:#064E3B;text-decoration:underline;">Online Quran Classes UK</a>
          <a href="/online-quran-classes-usa" style="color:#064E3B;text-decoration:underline;">Online Quran Classes USA</a>
          <a href="/online-quran-classes-canada" style="color:#064E3B;text-decoration:underline;">Online Quran Classes Canada</a>
          <a href="/online-quran-classes-australia" style="color:#064E3B;text-decoration:underline;">Online Quran Classes Australia</a>
          <a href="/online-quran-classes-pakistan" style="color:#064E3B;text-decoration:underline;">Online Quran Classes Pakistan</a>
        </div>
      </section>
    </main>

    <!-- Footer with Full Internal Linking Directory -->
    <footer style="background:#043629;color:#ffffff;padding:40px 20px 24px;border-top:1px solid #D4A72C;">
      <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:30px;margin-bottom:30px;">
        <div>
          <h3 style="color:#D4A72C;font-size:18px;margin-top:0;">Noor-e-Quran Institute</h3>
          <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Dedicated to providing authentic Quranic education to Muslim children and adults worldwide with qualified male and female tutors.</p>
          <p style="color:#D4A72C;font-weight:700;font-size:14px;">WhatsApp: +92 327 4496163<br>Email: contact.noorequraninstitute@gmail.com</p>
        </div>
        <div>
          <h4 style="color:#ffffff;font-size:16px;margin-top:0;margin-bottom:12px;">Quran Courses</h4>
          <ul style="list-style:none;padding:0;margin:0;font-size:14px;line-height:2;">
            <li><a href="/noorani-qaida" style="color:#9CA3AF;text-decoration:none;">Noorani Qaida for Kids</a></li>
            <li><a href="/quran-reading-nazra" style="color:#9CA3AF;text-decoration:none;">Nazra Quran Recitation</a></li>
            <li><a href="/quran-with-tajweed" style="color:#9CA3AF;text-decoration:none;">Quran with Tajweed</a></li>
            <li><a href="/quran-memorization-hifz" style="color:#9CA3AF;text-decoration:none;">Hifz Quran Online</a></li>
            <li><a href="/islamic-studies" style="color:#9CA3AF;text-decoration:none;">Islamic Studies & Duas</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#ffffff;font-size:16px;margin-top:0;margin-bottom:12px;">Special Programs</h4>
          <ul style="list-style:none;padding:0;margin:0;font-size:14px;line-height:2;">
            <li><a href="/quran-classes-for-kids" style="color:#9CA3AF;text-decoration:none;">Kids Quran Program</a></li>
            <li><a href="/quran-classes-for-adults" style="color:#9CA3AF;text-decoration:none;">Adults Quran Learning</a></li>
            <li><a href="/female-quran-teacher" style="color:#9CA3AF;text-decoration:none;">Female Quran Tutors</a></li>
            <li><a href="/faculty" style="color:#9CA3AF;text-decoration:none;">Our Islamic Scholars</a></li>
            <li><a href="/pricing" style="color:#9CA3AF;text-decoration:none;">Tuition & Fee Packages</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#ffffff;font-size:16px;margin-top:0;margin-bottom:12px;">Academy Information</h4>
          <ul style="list-style:none;padding:0;margin:0;font-size:14px;line-height:2;">
            <li><a href="/about-us" style="color:#9CA3AF;text-decoration:none;">About Noor-e-Quran Institute</a></li>
            <li><a href="/faq" style="color:#9CA3AF;text-decoration:none;">FAQs & Support</a></li>
            <li><a href="/blog" style="color:#9CA3AF;text-decoration:none;">Islamic Articles & Blog</a></li>
            <li><a href="/contact-us" style="color:#9CA3AF;text-decoration:none;">Contact & Admissions</a></li>
            <li><a href="/free-trial" style="color:#D4A72C;font-weight:700;text-decoration:none;">Book Free Trial Class</a></li>
          </ul>
        </div>
      </div>
      <div style="border-top:1px solid #1F2937;padding-top:20px;text-align:center;color:#6B7280;font-size:13px;">
        © 2026 Noor-e-Quran Institute. All rights reserved. Registered Islamic Education Institution.
      </div>
    </footer>
  </div>`;
}

export function isCrawlerBot(userAgent: string = ''): boolean {
  const ua = userAgent.toLowerCase();
  return /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|whatsapp|twitterbot|facebookexternalhit/i.test(ua);
}

/**
 * Injects dynamic SEO tags and pre-rendered crawlable HTML into raw HTML template
 */
export function injectSeoTagsIntoHtml(html: string, meta: PageMeta, routePath: string = '/', userAgent: string = ''): string {
  let output = html;

  // 1. Replace <title>
  output = output.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

  // 2. Replace or inject meta description
  if (output.includes('name="description"')) {
    output = output.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${meta.description.replace(/"/g, '&quot;')}" />`);
  } else {
    output = output.replace('</head>', `  <meta name="description" content="${meta.description.replace(/"/g, '&quot;')}" />\n</head>`);
  }

  // 3. Replace canonical
  if (output.includes('rel="canonical"')) {
    output = output.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${meta.canonical}" />`);
  }

  // 4. Update OpenGraph tags
  output = output.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${meta.title.replace(/"/g, '&quot;')}" />`);
  output = output.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />`);
  output = output.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${meta.canonical}" />`);
  output = output.replace(/<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i, `<meta property="og:type" content="${meta.ogType}" />`);
  output = output.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${meta.ogImage}" />`);

  // 5. Update Twitter cards
  output = output.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${meta.title.replace(/"/g, '&quot;')}" />`);
  output = output.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${meta.description.replace(/"/g, '&quot;')}" />`);

  // 6. Inject Breadcrumbs & Hreflang before </head>
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: meta.breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: b.item
    }))
  };

  const dynamicHeadInjection = `
  ${HREFLANG_TAGS}
  <script type="application/ld+json" id="ssr-breadcrumb-schema">
  ${JSON.stringify(breadcrumbSchema)}
  </script>
  ${
    meta.extraSchema
      ? `<script type="application/ld+json" id="ssr-extra-schema">\n  ${JSON.stringify(meta.extraSchema)}\n  </script>`
      : ''
  }
</head>`;

  output = output.replace('</head>', dynamicHeadInjection);

  // 7. Inject Rich Prerendered HTML inside <div id="root"> only when accessed by search engine bots
  if (isCrawlerBot(userAgent)) {
    const prerenderedBody = generateRoutePrerenderHtml(routePath, meta);
    if (output.includes('<div id="root"></div>')) {
      output = output.replace('<div id="root"></div>', `<div id="root">${prerenderedBody}</div>`);
    } else if (output.includes('<div id="root">')) {
      output = output.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${prerenderedBody}</div>`);
    }
  }

  return output;
}

/**
 * Generate a search-engine compliant 404 HTML response
 */
export function generate404Html(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 - Page Not Found | Noor-e-Quran Institute</title>
    <meta name="robots" content="noindex, follow" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: #FAFAF7;
        color: #17201B;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
      }
      .card {
        background: #ffffff;
        border: 1px solid #E5E7EB;
        border-radius: 16px;
        max-width: 520px;
        width: 100%;
        padding: 40px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }
      .code {
        font-size: 72px;
        font-weight: 800;
        color: #064E3B;
        margin: 0;
        line-height: 1;
      }
      h1 {
        font-size: 24px;
        margin: 16px 0 8px;
        color: #111827;
      }
      p {
        color: #4B5563;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 28px;
      }
      .btn-group {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      .btn-primary {
        background-color: #064E3B;
        color: #ffffff;
      }
      .btn-primary:hover {
        background-color: #04382A;
      }
      .btn-secondary {
        background-color: #F3F4F6;
        color: #1F2937;
      }
      .btn-secondary:hover {
        background-color: #E5E7EB;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved. Explore our certified online Quran courses or return to the homepage.</p>
      <div class="btn-group">
        <a href="/" class="btn btn-primary">Return to Homepage</a>
        <a href="/online-quran-classes" class="btn btn-secondary">Browse Quran Courses</a>
      </div>
    </div>
  </body>
</html>`;
}
