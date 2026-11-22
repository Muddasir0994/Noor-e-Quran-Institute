import { dataStore } from './dataStore.js';
import { getArticleSeo, getAllArticleSeo, extractFaqs, type ArticleSeoEntry } from './seoCache.js';
import { BLOG_BUNDLE } from './blogBundle.js';
import { INITIAL_FAQS } from '../src/data/academyData.js';

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
  /** Additional JSON-LD blocks (e.g. Article + FAQPage for cached blog posts). */
  extraSchemas?: any[];
}

/**
 * Homepage FAQPage JSON-LD built from the site's real FAQ data
 * (INITIAL_FAQS in src/data/academyData.ts, the same list the homepage FAQ
 * section renders). Question and answer wording is copied faithfully; the
 * only edits are founder-only adjustments where the old copy claimed
 * multiple or female tutors, plus punctuation cleanup.
 */
const FOUNDER_ONLY_FAQ_ANSWERS: Record<string, string> = {
  'faq-3': 'All lessons are taught one-to-one by the institute\u2019s founder, M Muddasir Hameed. Sisters and young girls learn in a private and comfortable setting that respects Islamic etiquette.',
  'faq-4': 'Yes, we specialize in teaching children from 4 years and older. Every lesson is gentle, engaging, and patient, using interactive Noorani Qaida lessons and positive reinforcement.'
};

export const HOMEPAGE_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [...INITIAL_FAQS]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: (FOUNDER_ONLY_FAQ_ANSWERS[f.id] || f.answer).replace(/\u2014/g, ', ')
      }
    }))
};

/** Real course images actually rendered on the site (CoursesSection cards). */
export const COURSE_SCHEMA_IMAGES: Record<string, string> = {
  'noorani-qaida': '/images/unsplash/course-noorani-qaida.webp',
  'quran-reading-nazra': '/images/unsplash/course-quran-reading.webp',
  'quran-with-tajweed': '/images/unsplash/course-tajweed.webp',
  'quran-memorization-hifz': '/images/unsplash/course-hifz.webp',
  'islamic-studies': '/images/unsplash/course-islamic-studies.webp'
};

/**
 * Prerequisites exactly as stated on the site itself: the course comparison
 * matrix on the Courses page and the Nazra course audience line in the
 * course data ("Students who completed Qaida").
 */
export const COURSE_PREREQUISITES: Record<string, string> = {
  'noorani-qaida': 'None (Starts from Alif)',
  'quran-reading-nazra': 'Students who have completed Noorani Qaida (basic Arabic letter recognition)',
  'quran-with-tajweed': 'Fluent Nazra Quran Reading',
  'quran-memorization-hifz': 'Flawless Nazra Quran Reading',
  'islamic-studies': 'None'
};

export const KNOWN_STATIC_ROUTES: Record<string, PageMeta> = {
  '/': {
    title: 'Learn Quran Online | 1-on-1 Online Quran Classes for Kids & Adults',
    description: 'Learn Quran online in 1-on-1 live classes taught personally by the founder, M Muddasir Hameed. Tajweed, Hifz & Noorani Qaida for kids and adults. Book a free 3-day trial today!',
    canonical: `${ACADEMY_BASE_URL}/`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [{ name: 'Home', item: `${ACADEMY_BASE_URL}/` }],
    extraSchemas: [HOMEPAGE_FAQ_SCHEMA]
  },
  '/online-quran-classes': {
    title: 'Online Quran Courses & Curriculum | Noor E Quran Institute',
    description: 'Explore comprehensive online Quran courses: Noorani Qaida for beginners, Nazra Quran reading, Tajweed rules, and Hifz memorization with live 1-on-1 instruction.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Hifz Program', item: `${ACADEMY_BASE_URL}/quran-memorization-hifz` }
    ]
  },
  '/islamic-studies': {
    title: 'Islamic Studies for Kids & Adults Online | Noor E Quran Institute',
    description: 'Learn essential Islamic fundamentals: Daily Masnoon Duas, 6 Kalmas, Step-by-Step Salah (Prayer), Seerah, and Hadith stories.',
    canonical: `${ACADEMY_BASE_URL}/islamic-studies`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Female Faculty', item: `${ACADEMY_BASE_URL}/female-quran-teacher` }
    ]
  },
  '/kids-program': {
    title: 'Kids Quran Program Online | Fun 1-on-1 Quran Classes for Children',
    description: 'Engaging 1-on-1 Quran program for kids ages 4+. Noorani Qaida, Nazra and Hifz with patient, child-friendly certified tutors.',
    canonical: `${ACADEMY_BASE_URL}/kids-program`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Kids Program', item: `${ACADEMY_BASE_URL}/kids-program` }
    ]
  },
  '/female-tutor': {
    title: 'Female Quran Tutor Online | Certified Sisters Teaching 1-on-1',
    description: 'Learn Quran with a certified female tutor in complete privacy. 1-on-1 Noorani Qaida, Tajweed and Hifz lessons for sisters and daughters.',
    canonical: `${ACADEMY_BASE_URL}/female-tutor`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Female Tutor', item: `${ACADEMY_BASE_URL}/female-tutor` }
    ]
  },
  '/slow-learners': {
    title: 'Quran Classes for Slow Learners & Adults | Patient 1-on-1 Guidance',
    description: 'Specialized 1-on-1 Quran learning at a comfortable pace for slow learners and busy adults. Patient tutors, flexible evening and weekend slots.',
    canonical: `${ACADEMY_BASE_URL}/slow-learners`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Slow Learners', item: `${ACADEMY_BASE_URL}/slow-learners` }
    ]
  },
  // International Program Pages
  '/online-quran-classes-uk': {
    title: 'Online Quran Classes UK | 1-on-1 Quran Lessons in London, Birmingham & UK',
    description: 'Dedicated 1-on-1 online Quran classes for UK Muslim students. Certified male and female tutors aligned with UK GMT/BST evening and weekend times.',
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-uk`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
  '/author/m-muddasir-hameed': {
    title: 'M Muddasir Hameed — Founder & Author | Noor E Quran Institute',
    description: 'M Muddasir Hameed is an Islamic scholar, researcher, and founder of Noor E Quran Institute. He holds a Bachelor of Islamic Studies, an M.A.-equivalent (Aalmia) in Islamic & Arabic Studies, and a post-graduate specialization in Islamic Jurisprudence (Takhassus fil Fiqh).',
    canonical: `${ACADEMY_BASE_URL}/author/m-muddasir-hameed`,
    ogType: 'profile',
    ogImage: `${ACADEMY_BASE_URL}/images/author/m-muddasir-hameed.jpg`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` },
      { name: 'M Muddasir Hameed', item: `${ACADEMY_BASE_URL}/author/m-muddasir-hameed` }
    ],
    extraSchema: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${ACADEMY_BASE_URL}/author/m-muddasir-hameed#person`,
      name: 'M Muddasir Hameed',
      alternateName: 'Muhammad Muddasir Hameed',
      url: `${ACADEMY_BASE_URL}/author/m-muddasir-hameed`,
      sameAs: ['https://noorequraninstitute.blogspot.com', 'https://www.linkedin.com/in/m-muddasir-hameed'],
      image: `${ACADEMY_BASE_URL}/images/author/m-muddasir-hameed.jpg`,
      jobTitle: 'Islamic Scholar, Researcher & Founder',
      description: 'M Muddasir Hameed is an Islamic scholar, researcher, and founder of Noor E Quran Institute. He holds a Bachelor of Islamic Studies, an M.A.-equivalent (Aalmia) in Islamic & Arabic Studies, and a post-graduate specialization in Islamic Jurisprudence (Takhassus fil Fiqh).',
      worksFor: {
        '@type': 'EducationalOrganization',
        name: 'Noor E Quran Institute',
        url: `${ACADEMY_BASE_URL}/`
      },
    }
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
  '/hyperbeam-demo': {
    title: 'Shared Browser Demo | Learn Quran Together Online, Hyperbeam | Noor E Quran Institute',
    description: 'Try our Hyperbeam shared browser demo: teacher and student open one cloud browser together to read Quran, hadith and lesson videos in sync during live 1-on-1 classes.',
    canonical: `${ACADEMY_BASE_URL}/hyperbeam-demo`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Shared Browser Demo', item: `${ACADEMY_BASE_URL}/hyperbeam-demo` }
    ]
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Noor E Quran Institute',
    description: 'How Noor E Quran Institute collects, uses and protects student and family information — including child privacy and safe 1-on-1 learning.',
    canonical: `${ACADEMY_BASE_URL}/privacy-policy`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Privacy Policy', item: `${ACADEMY_BASE_URL}/privacy-policy` }
    ]
  },
  '/terms': {
    title: 'Terms & Conditions | Noor E Quran Institute',
    description: 'Terms for using Noor E Quran Institute: 3-day free trial, class attendance and etiquette, tutor assignment, and rescheduling.',
    canonical: `${ACADEMY_BASE_URL}/terms`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Terms & Conditions', item: `${ACADEMY_BASE_URL}/terms` }
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
  '/admin': {
    title: 'Academy Admin Dashboard | Noor E Quran Institute',
    description: 'Secure administration portal for Noor E Quran Institute management.',
    canonical: `${ACADEMY_BASE_URL}/admin`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Admin', item: `${ACADEMY_BASE_URL}/admin` }
    ]
  },
  '/admin-portal': {
    title: 'Academy Admin Dashboard | Noor E Quran Institute',
    description: 'Secure administration portal for Noor E Quran Institute management.',
    canonical: `${ACADEMY_BASE_URL}/admin`,
    ogType: 'website',
    ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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

/**
 * Resolve metadata for any incoming request path
 */
export interface RouteResolution {
  meta: PageMeta | null;
  is404: boolean;
  /** 301 redirect target path (e.g. '/packages'). When set, server issues a 301. */
  redirect?: string;
  /**
   * For unknown blog slugs: serve the SPA with a real 404 status + noindex,
   * so posts published to Firestore (absent from the local store) still render client-side.
   */
  spaFallback404?: boolean;
}

/** Canonical 301 redirects for legacy / duplicate URLs. */
export const CANONICAL_REDIRECTS: Record<string, string> = {
  '/pricing': '/packages',
  '/contact-us': '/contact',
  '/faculty': '/teachers',
  '/tutors': '/teachers',
  '/methodology': '/how-it-works',
  '/about-us': '/about',
  '/blogs': '/blog',
  '/articles': '/blog',
  '/privacy': '/privacy-policy',
  '/terms-and-conditions': '/terms',
  '/blog/the6kalimas': '/blog/6-kalimas',
  '/articles/the6kalimas': '/blog/6-kalimas',
  '/female-tutor': '/teachers',
  '/female-quran-teacher': '/teachers',
  '/female-tutors': '/teachers',
};

export function resolveRouteMetadata(rawPath: string): RouteResolution {
  // Normalize path
  const normalizedPath = rawPath.split('?')[0].replace(/\/+$/, '') || '/';

  // 0. Canonical 301 redirects for legacy / duplicate URLs
  if (CANONICAL_REDIRECTS[normalizedPath]) {
    return { meta: null, is404: false, redirect: CANONICAL_REDIRECTS[normalizedPath] };
  }

  // 1. Check known static routes
  if (KNOWN_STATIC_ROUTES[normalizedPath]) {
    return { meta: KNOWN_STATIC_ROUTES[normalizedPath], is404: false };
  }

  // 2. Dynamic Course route: /courses/:slug
  if (normalizedPath.startsWith('/courses/')) {
    const slug = normalizedPath.replace('/courses/', '').trim();
    const course = dataStore.getCourseBySlug(slug) || dataStore.getCourses().find(c => c.id === slug);
    if (course) {
      const canonical = `${ACADEMY_BASE_URL}/courses/${course.slug || course.id}`;
      const courseKey = course.slug || course.id;
      const rawCourseImage = COURSE_SCHEMA_IMAGES[courseKey] || course.imageUrl;
      const courseImage = rawCourseImage
        ? (rawCourseImage.startsWith('http') ? rawCourseImage : `${ACADEMY_BASE_URL}${rawCourseImage}`)
        : undefined;
      const coursePrerequisites = COURSE_PREREQUISITES[courseKey];
      const meta: PageMeta = {
        title: `${course.name} Online Course with Tajweed | Noor E Quran Institute`,
        description: course.shortDescription || `Learn ${course.name} online with 1-on-1 certified tutors. Flexible timings and 3-day free trial.`,
        canonical,
        ogType: 'article',
        ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
          ...(courseImage ? { image: courseImage } : {}),
          hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'online',
            ...(course.duration ? { courseWorkload: course.duration } : {})
          },
          ...(coursePrerequisites ? { coursePrerequisites } : {}),
          provider: {
            '@type': 'EducationalOrganization',
            name: 'Noor E Quran Institute',
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
  }

  // 3. Dynamic Blog route: /blog/:slug or /articles/:slug
  if (normalizedPath.startsWith('/blog/') || normalizedPath.startsWith('/articles/')) {
    const slug = normalizedPath.replace(/^\/(blog|articles)\//, '').trim();
    const article = dataStore.getArticleBySlug(slug) || dataStore.getArticles().find(a => a.id === slug);
    if (article) {
      const canonical = `${ACADEMY_BASE_URL}/blog/${article.slug || article.id}`;
      const meta: PageMeta = {
        title: `${article.title} | Noor E Quran Institute`,
        description: article.summary || `Read comprehensive educational guide: ${article.title}. Practical advice for Muslim learners and parents.`,
        canonical,
        ogType: 'article',
        ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
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
            '@type': 'Person',
            name: 'M Muddasir Hameed',
            alternateName: 'Muhammad Muddasir Hameed',
            url: `${ACADEMY_BASE_URL}/author/m-muddasir-hameed`
          },
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'Noor E Quran Institute',
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

    // Synced Firestore article cache (BUG-1 fix): articles published to the
    // `blogPosts` collection are mirrored locally by server/seoCache.ts, so
    // crawlers get the real title, description, and Article + FAQPage JSON-LD
    // instead of the generic slug-derived fallback below.
    let cached = getArticleSeo(slug);
    if (!cached) {
      // Repo-bundle fallback: every published article is committed under
      // server/blog-data/, so a crawler must never hit the 404 fallback below
      // just because the Firestore mirror (seoCache) is stale or its sync was
      // blocked by the Firestore free-tier read quota. Build the same SEO
      // entry shape from the bundle copy of the article.
      const bundlePost = BLOG_BUNDLE.find(a => a.slug === slug && a.published !== false);
      if (bundlePost) {
        const entry: ArticleSeoEntry = {
          slug: bundlePost.slug,
          title: bundlePost.title,
          description: bundlePost.metaDescription || '',
          author: bundlePost.author,
          featuredImage: bundlePost.featuredImage
            ? (bundlePost.featuredImage.startsWith('/') ? `${ACADEMY_BASE_URL}${bundlePost.featuredImage}` : bundlePost.featuredImage)
            : undefined,
          createdAt: bundlePost.createdAt,
          updatedAt: bundlePost.updatedAt || bundlePost.createdAt,
          faqs: extractFaqs(bundlePost.content || '')
        };
        cached = entry;
      }
    }
    if (cached) {
      const canonical = `${ACADEMY_BASE_URL}/blog/${cached.slug}`;
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: cached.title,
        description: cached.description,
        image: cached.featuredImage || `${ACADEMY_BASE_URL}/branding/logo.png`,
        author: {
          '@type': 'Person',
          name: 'M Muddasir Hameed',
          alternateName: 'Muhammad Muddasir Hameed',
          url: `${ACADEMY_BASE_URL}/author/m-muddasir-hameed`
        },
        publisher: {
          '@type': 'EducationalOrganization',
          name: 'Noor E Quran Institute',
          logo: {
            '@type': 'ImageObject',
            url: `${ACADEMY_BASE_URL}/branding/logo.webp`
          }
        },
        datePublished: cached.createdAt,
        dateModified: cached.updatedAt || cached.createdAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonical
        }
      };
      const faqSchema = cached.faqs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: cached.faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer
          }
        }))
      } : undefined;
      const meta: PageMeta = {
        // Matches the client title format in src/pages/BlogPostPage.tsx.
        title: `${cached.title} | Noor E Quran Institute`,
        description: cached.description || `Read educational article and Quran learning guide: ${cached.title}.`,
        canonical,
        ogType: 'article',
        ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
        breadcrumbs: [
          { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
          { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` },
          { name: cached.title, item: canonical }
        ],
        extraSchemas: faqSchema ? [articleSchema, faqSchema] : [articleSchema]
      };
      return { meta, is404: false };
    }

    // Dynamic article fallback for Firestore published posts.
    // Real 404 status + SPA fallback + noindex: the client SPA still loads and
    // renders the post from Firestore, but crawlers see a genuine 404 (not a soft-404).
    const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const canonical = `${ACADEMY_BASE_URL}/blog/${slug}`;
    const meta: PageMeta = {
      title: `${formattedTitle} | Noor E Quran Institute`,
      description: `Read educational article and Quran learning guide on ${formattedTitle}.`,
      canonical,
      ogType: 'article',
      ogImage: `${ACADEMY_BASE_URL}/logo.webp`,
      breadcrumbs: [
        { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
        { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` },
        { name: formattedTitle, item: canonical }
      ]
    };
    return { meta, is404: false, spaFallback404: true };
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
    { loc: `${ACADEMY_BASE_URL}/kids-program`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/slow-learners`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/packages`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/how-it-works`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/teachers`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/about`, priority: '0.75', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/faq`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/contact`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${ACADEMY_BASE_URL}/blog`, priority: '0.85', changefreq: 'daily' },
    // International GEO Landing Pages
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-uk`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-usa`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-canada`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-australia`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${ACADEMY_BASE_URL}/author/m-muddasir-hameed`, priority: '0.7', changefreq: 'weekly' }
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

  // 3. Dynamic Blog Articles — local store merged with the synced Firestore
  // article SEO cache (BUG-5 fix). Cache entries win on slug conflicts because
  // they carry the accurate updatedAt from the `blogPosts` source of truth.
  const toDateOnly = (v: string | undefined): string | undefined => {
    if (!v) return undefined;
    const d = v.split('T')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : undefined;
  };
  const articleEntries = new Map<string, { slug: string; lastmod: string }>();
  for (const article of articles) {
    const slug = article.slug || article.id;
    articleEntries.set(slug, { slug, lastmod: article.publishedAt || today });
  }
  for (const cached of getAllArticleSeo()) {
    articleEntries.set(cached.slug, {
      slug: cached.slug,
      lastmod: toDateOnly(cached.updatedAt) || toDateOnly(cached.createdAt) || today
    });
  }
  for (const { slug, lastmod } of articleEntries.values()) {
    xml += `  <url>
    <loc>${ACADEMY_BASE_URL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
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
  return `# Robots.txt for Noor E Quran Institute (${ACADEMY_BASE_URL})
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
Allow: /kids-program
Allow: /female-tutor
Allow: /slow-learners
Allow: /packages
Allow: /how-it-works
Allow: /teachers
Allow: /about
Allow: /faq
Allow: /contact
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
interface CourseDeepDive {
  heading: string;
  intro: string[];
  curriculum: { title: string; text: string }[];
  milestones: string[];
  classRuns: string;
  faqs: { q: string; a: string }[];
}

/**
 * Course-specific depth content for the four core course landing routes.
 * Added 2026-11-22 for the AdSense review: these routes previously carried
 * only a title and a one-line description of course-specific copy on top of
 * the shared generic template. Each entry adds a curriculum outline,
 * learning milestones, how a class runs, and a short FAQ (roughly 750 words).
 */
const COURSE_DEEP_DIVE: Record<string, CourseDeepDive> = {
  '/noorani-qaida': {
    heading: 'Inside the Noorani Qaida Course: Curriculum, Milestones and How Classes Run',
    intro: [
      'Noorani Qaida is the foundation course of Noor E Quran Institute. It takes a student who may not know a single Arabic letter and builds, step by step, the ability to read the Quran correctly. Every lesson is one-to-one and taught personally by the founder, M Muddasir Hameed, so the pace is set by the student, never by a group.',
      'The course follows the classical Qaida sequence used in traditional madrasas, taught with a digital Qaida on screen so parents can see exactly what their child is learning. Children usually start from age four, and the same course is taken by adult beginners and new Muslims who want to begin reading the Quran properly.'
    ],
    curriculum: [
      { title: 'Step 1: The Arabic Alphabet', text: 'Students learn all 29 Arabic letters, their names, their sounds and their written forms: isolated, and joined at the beginning, middle and end of a word. Letter recognition games and repetition drills make the shapes familiar within the first few weeks.' },
      { title: 'Step 2: Makharij, Where Each Sound Comes From', text: 'Correct pronunciation starts here. Students learn the articulation points of the throat, tongue, lips and nasal cavity, and practise each letter from its exact point, so mistakes that are hard to fix later never become habits.' },
      { title: 'Step 3: Harakaat, the Short Vowels', text: 'Fatha, Kasra and Dammah are introduced, and students read every letter with each vowel until the sounds are instant. This is the stage where separate letters begin to turn into real reading.' },
      { title: 'Step 4: Joining Letters and Building Words', text: 'Students learn how letters connect, which letters join only from one side, and how two and three letter combinations are read as one unit. Short words from the Quran begin to appear in the lessons.' },
      { title: 'Step 5: Tanween, Sukoon and Madd', text: 'The double vowels (Tanween), the silent letter (Sukoon) and the basic elongation rules (Madd) are taught with plenty of drill lines, so students can handle the markings they will meet on every page of the Mushaf.' },
      { title: 'Step 6: Reading Practice and the Bridge to Nazra', text: 'The final lessons of the Qaida are read aloud in full, followed by short Surahs such as Al-Fatiha and Al-Ikhlas read directly from the Quran. When a student reads these fluently, the Qaida is complete and Nazra begins.' }
    ],
    milestones: [
      'Recognises every Arabic letter in all of its written forms',
      'Pronounces each letter from its correct articulation point',
      'Reads joined words with Harakaat without spelling them out letter by letter',
      'Completes the full Noorani Qaida book with its rules',
      'Reads short Surahs from the Mushaf independently'
    ],
    classRuns: 'A Qaida lesson lasts about 30 minutes for young children and up to 45 minutes for older students and adults. The teacher shares a high resolution digital Qaida on screen over Zoom or Google Meet. The student reads each line aloud, and every mistake is corrected on the spot, with the correct sound modelled and repeated until it is right. The last few minutes of each class revise the previous lesson, and a small amount of home practice is set. Parents are welcome to sit in at any time, and a written progress report is shared every month covering letters covered, pronunciation accuracy and the next target.',
    faqs: [
      { q: 'How long does Noorani Qaida take to complete?', a: 'Most children finish in three to five months with regular classes and a few minutes of daily practice. Adults who practise daily often finish sooner. The course ends when the reading is correct, not when a fixed number of weeks has passed.' },
      { q: 'My child has never read Arabic. Is that a problem?', a: 'Not at all. The course assumes no background at all. It starts from the very first letter, Alif, and every new idea is built on the one before it.' },
      { q: 'Can adults and new Muslims take this course?', a: 'Yes. Many of our Qaida students are adults, including new Muslims and parents who want to read the Quran themselves instead of relying on transliteration.' },
      { q: 'What does my child need for each class?', a: 'A laptop, tablet or phone with a stable internet connection and a microphone. We share the Qaida pages on screen, although a printed Qaida book is a helpful extra for home practice.' }
    ]
  },
  '/quran-reading-nazra': {
    heading: 'Inside the Nazra Quran Reading Course: Curriculum, Milestones and How Classes Run',
    intro: [
      'Nazra is the course in which a student reads the entire Holy Quran, from the first page to the last, in front of the teacher. It begins after Noorani Qaida, when the student can join letters and read words, and it turns that basic skill into fluent, confident reading of the Mushaf itself.',
      'At Noor E Quran Institute the Nazra course is taught one-to-one by the founder. The student reads aloud in every lesson while the teacher listens to each word, corrects mistakes as they happen, and records exactly how far the student has read.',
      'For most Muslim families abroad, this is the course that changes daily life at home. A child who completes Nazra can open the Mushaf at any page and read, join the family recitation after Maghrib, and follow along in Taraweeh during Ramadan. That independence, reading the words of Allah directly instead of through a transliteration, is the goal every lesson works towards.'
    ],
    curriculum: [
      { title: 'Step 1: From Qaida Rules to the Mushaf', text: 'The first lessons apply everything learned in Qaida, joining, vowels, Sukoon and Madd, to real Quranic text. Students adjust to the script of the Mushaf and the layout of its lines and pages.' },
      { title: 'Step 2: A Structured Juz by Juz Plan', text: 'Reading follows a clear plan with a set portion in every class. The teacher tracks the student\u2019s place in the Mushaf precisely, so no page is skipped and the journey through all 30 Juz stays organised.' },
      { title: 'Step 3: Fluency and Flow', text: 'Students learn to read in phrases instead of word by word, to join verses smoothly, and to manage their breath at the stopping signs, so recitation becomes continuous and pleasant to listen to.' },
      { title: 'Step 4: Live Pronunciation Correction', text: 'Every lesson includes real time correction of Makharij and letter characteristics. Recurring mistakes are noted and deliberately revisited, so the same error is not repeated from one Juz to the next.' },
      { title: 'Step 5: Tajweed Awareness While Reading', text: 'Without turning the course into a theory class, students begin applying the rules they can hear: Ghunnah, the main Madd elongations and Qalqalah, inside their regular reading. Formal Tajweed theory is the next course.' },
      { title: 'Step 6: Khatm, Completing the Whole Quran', text: 'The course ends with the completion of the entire Quran, cover to cover, followed by a revision of the pages the student found hardest. The student is then ready for the Tajweed course or for Hifz.' }
    ],
    milestones: [
      'Reads a page never seen before without spelling out the words',
      'Sustains 15 to 20 minutes of continuous, flowing recitation',
      'Recognises and corrects his or her own common mistakes',
      'Completes all 30 Juz of the Holy Quran with the teacher',
      'Reads confidently enough to join family and mosque recitation'
    ],
    classRuns: 'Nazra lessons run for 30 to 45 minutes. The student reads aloud from a screen shared Mushaf, or from a personal copy of the Quran at home, while the teacher follows the same page and corrects pronunciation, stopping points and pace in real time. Each lesson\u2019s portion is logged, and a short daily reading assignment keeps the fluency growing between classes. Parents receive a monthly progress report showing how many pages and Juz have been completed, the student\u2019s fluency level, and the mistakes currently being worked on.',
    faqs: [
      { q: 'How long does it take to finish the whole Quran?', a: 'At a steady pace of regular classes, most students complete the Nazra Khatm in six to twelve months. The exact time depends on the student\u2019s starting level and how much daily reading is done at home.' },
      { q: 'Should my child learn Tajweed before Nazra?', a: 'No. Nazra comes first. It builds accurate, fluent reading. Tajweed theory is far easier to learn once a student can already read the whole Quran comfortably.' },
      { q: 'Which script of the Mushaf is used?', a: 'The script your family is most comfortable with, whether the 15 line Indo Pak script common in South Asia or the Madani script. Consistency with one script helps fluency.' },
      { q: 'How do parents follow progress?', a: 'Every lesson\u2019s reading is recorded in the student\u2019s progress log, and parents receive a monthly report with pages completed, fluency notes and the next milestone. Parents are also welcome to sit in on any lesson and hear the reading for themselves, which many families do at the start of each new Juz.' }
    ]
  },
  '/quran-with-tajweed': {
    heading: 'Inside the Quran with Tajweed Course: Curriculum, Milestones and How Classes Run',
    intro: [
      'The Tajweed course is for students who can already read the Quran and want to recite it the way it was revealed: every letter from its correct point, every rule applied, and every verse given its proper measure. It combines the theory of the rules with intensive applied practice.',
      'Lessons are one-to-one with the founder, whose teaching focuses on precise recitation and careful correction. Students work from the Mushaf in every class, applying each rule to real verses rather than memorising definitions alone. The course suits older children, teenagers and adults.',
      'Many students come to this course after years of reading with the same uncorrected habits: swallowing the Ghunnah, shortening the Madd, or stopping in the middle of a meaning. Tajweed training replaces those habits one rule at a time, and because every lesson is private, the correction is aimed at the individual student\u2019s own recitation, not at a class average.'
    ],
    curriculum: [
      { title: 'Step 1: Makharij and Sifaat, the Foundations', text: 'The course opens with the 17 articulation points of the letters and their permanent characteristics, such as Hams, Jahr and Shiddah. Existing pronunciation faults are identified and corrected before new rules are layered on top.' },
      { title: 'Step 2: Noon Sakinah and Tanween', text: 'The four rules, Izhar, Idgham, Iqlab and Ikhfa, are taught with their letters, their conditions and extensive drills from the Mushaf, until the student applies the right rule without stopping to think.' },
      { title: 'Step 3: Meem Sakinah and the Laam Rules', text: 'Students master Ikhfa Shafawi, Idgham Shafawi and Izhar Shafawi, together with the rules of the Laam in the name of Allah and the Laam of verbs and particles.' },
      { title: 'Step 4: Madd, the Science of Elongation', text: 'Natural Madd, connected and separated Madd, Madd Lazim and the other branches are taught with their exact counts, so the student\u2019s elongations become measured and consistent instead of guessed.' },
      { title: 'Step 5: Tafkheem, Tarqeeq and the Rules of Waqf', text: 'Heavy and light letters, the rules of the letter Ra, and the science of stopping and starting, where a pause changes or protects the meaning, complete the core theory of the course.' },
      { title: 'Step 6: Applied Recitation and Error Elimination', text: 'The final stage is verse by verse application across longer Surahs. The teacher keeps a personal error log for the student, and earlier mistakes are retested until the recitation stays clean across whole pages.' }
    ],
    milestones: [
      'Applies the four Noon Sakinah rules correctly without prompting',
      'Gives every Madd its correct count, consistently',
      'Distinguishes heavy and light letters reliably in new verses',
      'Recites a full page with the rules observed throughout',
      'Understands where to stop and start without breaking the meaning'
    ],
    classRuns: 'Each Tajweed lesson is split into two halves. In the first, one rule is explained properly, with its evidence and examples located in the Mushaf. In the second, the student recites while the teacher marks every violation of the rules live and corrects it on the spot. A running list of the student\u2019s personal mistakes is maintained from lesson to lesson, and monthly reports show parents or the student exactly which rules have been mastered and which are still in progress. Lessons last 30 to 45 minutes, and students are given a short passage to practise before the next class, chosen to contain the rule most recently learned so the theory is exercised daily.',
    faqs: [
      { q: 'Do I need to complete Nazra before Tajweed?', a: 'Yes. Tajweed assumes fluent reading of the Mushaf. If a student still struggles to read, the Nazra course builds that fluency first, and Tajweed follows naturally.' },
      { q: 'Is the course only theory?', a: 'No. Every rule is taught with its theory and then applied immediately in recitation. Most of each lesson is spent reciting and being corrected, which is where Tajweed is actually learned.' },
      { q: 'How long does the Tajweed course take?', a: 'Most students complete the core rules and applied stage in six to nine months of regular classes. Students preparing for advanced study may continue with further applied recitation.' },
      { q: 'Will this course fix my pronunciation?', a: 'That is one of its main purposes. The opening stage is devoted to Makharij, and persistent pronunciation faults are logged and revisited until they are gone.' }
    ]
  },
  '/quran-memorization-hifz': {
    heading: 'Inside the Hifz Memorisation Course: Curriculum, Milestones and How Classes Run',
    intro: [
      'The Hifz course is a long term, structured programme for memorising the Holy Quran, in full or in part, with retention as its first priority. Memorising quickly is easy; memorising in a way that stays for life is the real work, and the whole course is built around that goal.',
      'Every Hifz student at Noor E Quran Institute follows the classical three part system of Sabaq, Sabqi and Manzil, supervised one-to-one by the founder in every lesson. Targets are personal: some students aim for the complete Quran, others for selected Juz or Surahs. Children, teenagers and adults all follow the same system, with the daily portion and the pace adjusted to each student.'
    ],
    curriculum: [
      { title: 'Step 1: Assessment and a Personal Memorisation Plan', text: 'Before memorisation begins, the student\u2019s recitation and Tajweed are checked, because verses memorised with mistakes are hard to repair. A daily portion is then set according to age, ability and available time.' },
      { title: 'Step 2: Sabaq, the New Daily Lesson', text: 'Each class begins with new verses. The student memorises them with correct Tajweed, then recites them from memory to the teacher until the portion is completely free of errors.' },
      { title: 'Step 3: Sabqi, Revision of the Recent Pages', text: 'The most recent five to ten pages are revised every day. This short cycle catches forgetting at the stage where it is easiest to fix, and welds the new memorisation to what came before.' },
      { title: 'Step 4: Manzil, the Long Revision Cycle', text: 'Alongside new memorisation, the student recites a portion of everything memorised so far, every day, in a continuous cycle. Manzil is the system that keeps the first Juz as fresh as the latest one.' },
      { title: 'Step 5: Testing and Repairing Weak Spots', text: 'Monthly examinations test memorisation and retention together. Surahs or pages that slip are identified, given extra revision cycles, and retested, so weak spots are repaired instead of carried forward.' },
      { title: 'Step 6: Khatm and the Final Revision Rounds', text: 'When the target is complete, the student performs full revision rounds of the entire memorisation before completion is certified. For full Hifz students, this Khatm is the finish of a journey of years.' }
    ],
    milestones: [
      'First Juz memorised and retained through its revision cycles',
      'Five Juz held with a stable daily Manzil routine',
      'Ten Juz memorised, with older Surahs still passing spot checks',
      'Half the Quran memorised, with monthly tests passed',
      'Full memorisation completed and verified in final revision rounds'
    ],
    classRuns: 'A Hifz lesson is divided into three parts. First the student recites the new Sabaq from memory while the teacher follows in the Mushaf and logs every error. Then comes Sabqi, the revision of recent pages, and finally Manzil, the day\u2019s portion from the older memorisation. Nothing is left to memory alone: portions, errors and test results are recorded after every class, and parents receive a monthly report covering new memorisation, retention strength and the plan for the month ahead. Lessons last 30 to 45 minutes. Between lessons, students follow a written daily revision timetable, repeating the same three part structure at home in miniature, so memorisation is strengthened on the days when there is no class as well as on class days.',
    faqs: [
      { q: 'How much does a student memorise each day?', a: 'The portion is set individually. A young beginner may start with a few lines a day, while an older student with strong recitation memorises more. The portion grows only when retention stays perfect.' },
      { q: 'How long does it take to memorise the whole Quran?', a: 'At a steady, sustainable pace, full Hifz usually takes between two and three and a half years. Rushing produces weak memorisation, so the course protects retention first and speed second.' },
      { q: 'What if my child keeps forgetting earlier Surahs?', a: 'That is exactly what the Sabqi and Manzil cycles exist for. Forgetting is expected and planned for: every memorised page stays inside a permanent revision system instead of being left behind.' },
      { q: 'Can adults memorise the Quran in this course?', a: 'Yes. Adult students follow the same system with a portion and schedule fitted to work and family life. Many adults choose a part time target, such as Juz Amma or selected Surahs, first.' }
    ]
  }
};

function renderCourseDeepDive(path: string): string {
  const d = COURSE_DEEP_DIVE[path];
  if (!d) return '';
  return `
      <!-- Section: Course Deep Dive (curriculum, milestones, class format, FAQ) -->
      <section style="background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:40px 30px;margin-bottom:50px;">
        <h2 style="font-size:28px;color:#064E3B;margin-top:0;margin-bottom:16px;">${d.heading}</h2>
        ${d.intro.map(p => `<p style="color:#4B5563;font-size:16px;line-height:1.7;">${p}</p>`).join('')}
        <h3 style="font-size:21px;color:#064E3B;margin-top:28px;margin-bottom:10px;">Curriculum, Step by Step</h3>
        <ol style="padding-left:22px;color:#4B5563;font-size:15px;line-height:1.7;">
          ${d.curriculum.map(s => `<li style="margin-bottom:12px;"><strong style="color:#064E3B;">${s.title}</strong><br/>${s.text}</li>`).join('')}
        </ol>
        <h3 style="font-size:21px;color:#064E3B;margin-top:28px;margin-bottom:10px;">Learning Milestones</h3>
        <ul style="padding-left:22px;color:#4B5563;font-size:15px;line-height:1.7;">
          ${d.milestones.map(m => `<li style="margin-bottom:6px;">${m}</li>`).join('')}
        </ul>
        <h3 style="font-size:21px;color:#064E3B;margin-top:28px;margin-bottom:10px;">How a Class Runs</h3>
        <p style="color:#4B5563;font-size:16px;line-height:1.7;">${d.classRuns}</p>
        <h3 style="font-size:21px;color:#064E3B;margin-top:28px;margin-bottom:10px;">Frequently Asked Questions</h3>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${d.faqs.map(f => `<div><h4 style="font-size:16px;color:#064E3B;margin:0 0 5px;">${f.q}</h4><p style="color:#4B5563;font-size:15px;line-height:1.6;margin:0;">${f.a}</p></div>`).join('')}
        </div>
      </section>
`;
}

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
            <a href="/" style="color:#D4A72C;font-weight:800;font-size:20px;text-decoration:none;">Noor E Quran Institute</a>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a href="/online-quran-classes" style="color:#ffffff;text-decoration:none;">All Courses</a>
              <a href="/noorani-qaida" style="color:#ffffff;text-decoration:none;">Noorani Qaida</a>
              <a href="/quran-with-tajweed" style="color:#ffffff;text-decoration:none;">Tajweed</a>
              <a href="/quran-memorization-hifz" style="color:#ffffff;text-decoration:none;">Hifz</a>
              <a href="/pricing" style="color:#ffffff;text-decoration:none;">Pricing</a>
              <a href="/#trial" style="background:#D4A72C;color:#064E3B;padding:6px 14px;border-radius:6px;font-weight:700;text-decoration:none;">Free Trial</a>
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
                ${(course.highlights || ['1-on-1 Personalized Live Tuition', 'Taught Personally by the Founder', 'Interactive Digital Whiteboard', 'Flexible Timings & Recorded Lessons', 'Monthly Progress Evaluation Reports']).map(f => `<li style="margin-bottom:8px;">${f}</li>`).join('')}
              </ul>
              <div style="margin-top:16px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
                <span style="font-weight:700;color:#064E3B;">Tuition Fee: $${course.feeUSD || 35}/Month</span>
                <span style="color:#6B7280;">• Recommended Audience: ${course.audience || 'All Ages (4+)'}</span>
                <span style="color:#6B7280;">• Duration: ${course.duration || '3 to 6 Months'}</span>
              </div>
            </section>

            <section style="margin-bottom:30px;">
              <h2 style="font-size:22px;color:#064E3B;">Why Enroll in This Course at Noor E Quran Institute?</h2>
              <p>Our online ${course.name} provides students with individual one-on-one attention from the institute's founder, M Muddasir Hameed, who specializes in Makharij, Tajweed rules, and interactive pedagogy. Whether starting from the basics or mastering advanced recitation, each student progresses at their own comfortable pace.</p>
              <p>Classes are held over Zoom or Google Meet with screen sharing of high-resolution digital Quran pages, ensuring clear visual and auditory learning.</p>
            </section>

            <section style="background:#064E3B;color:#ffffff;border-radius:12px;padding:24px;text-align:center;">
              <h2 style="font-size:22px;color:#ffffff;margin-top:0;">Start with a 3-Day 100% Free Trial</h2>
              <p style="color:#E6F4EA;margin-bottom:18px;">No credit card required. Experience our personalized teaching quality firsthand.</p>
              <a href="/#trial" style="display:inline-block;background:#D4A72C;color:#064E3B;font-weight:800;padding:12px 24px;border-radius:8px;text-decoration:none;">Book Free Trial Class</a>
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
            <a href="/" style="color:#D4A72C;font-weight:800;font-size:20px;text-decoration:none;">Noor E Quran Institute</a>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <a href="/blog" style="color:#ffffff;text-decoration:none;">Blog Index</a>
              <a href="/online-quran-classes" style="color:#ffffff;text-decoration:none;">Courses</a>
              <a href="/#trial" style="background:#D4A72C;color:#064E3B;padding:6px 14px;border-radius:6px;font-weight:700;text-decoration:none;">Free Trial</a>
            </div>
          </nav>
        </header>

        <main style="max-width:900px;margin:30px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;color:#17201B;line-height:1.8;">
          <article>
            <span style="color:#6B7280;font-size:14px;">Published by ${article.author || 'Noor E Quran Institute Academic Team'} • ${article.publishedAt || '2026-01-15'}</span>
            <h1 style="font-size:32px;color:#064E3B;margin-top:8px;margin-bottom:16px;">${article.title}</h1>
            <p style="font-size:18px;color:#4B5563;font-weight:500;margin-bottom:24px;">${article.summary}</p>
            <hr style="border:0;border-top:1px solid #E5E7EB;margin:24px 0;" />
            <div style="font-size:16px;color:#374151;">
              ${article.content ? article.content.split('\n\n').map(p => `<p style="margin-bottom:16px;">${p}</p>`).join('') : `<p>${article.summary}</p>`}
            </div>
            <section style="background:#F3F4F6;border-radius:12px;padding:24px;margin-top:36px;text-align:center;">
              <h2 style="font-size:20px;color:#064E3B;margin-top:0;">Learn Quran Online with Certified Scholars</h2>
              <p style="color:#4B5563;margin-bottom:16px;">Register for a 3-day free trial class for kids or adults with flexible timings.</p>
              <a href="/#trial" style="display:inline-block;background:#064E3B;color:#ffffff;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;">Get Started Free</a>
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
          <span>Noor E Quran Institute</span>
        </a>
        <nav style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;font-size:15px;font-weight:500;">
          <a href="/online-quran-classes" style="color:#ffffff;text-decoration:none;">Quran Courses</a>
          <a href="/noorani-qaida" style="color:#ffffff;text-decoration:none;">Noorani Qaida</a>
          <a href="/quran-reading-nazra" style="color:#ffffff;text-decoration:none;">Nazra Quran</a>
          <a href="/quran-with-tajweed" style="color:#ffffff;text-decoration:none;">Tajweed Rules</a>
          <a href="/quran-memorization-hifz" style="color:#ffffff;text-decoration:none;">Hifz Program</a>
          <a href="/islamic-studies" style="color:#ffffff;text-decoration:none;">Islamic Studies</a>
          <a href="/teachers" style="color:#ffffff;text-decoration:none;">Our Teacher</a>
          <a href="/pricing" style="color:#ffffff;text-decoration:none;">Fee Packages</a>
          <a href="/faculty" style="color:#ffffff;text-decoration:none;">Scholars</a>
          <a href="/blog" style="color:#ffffff;text-decoration:none;">Blog</a>
          <a href="/contact-us" style="color:#ffffff;text-decoration:none;">Contact</a>
          <a href="/#trial" style="background:#D4A72C;color:#064E3B;padding:8px 16px;border-radius:6px;font-weight:700;text-decoration:none;">3-Day Free Trial</a>
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
            <a href="/#trial" style="background:#D4A72C;color:#064E3B;font-weight:800;font-size:16px;padding:14px 28px;border-radius:8px;text-decoration:none;">Book 3-Day Free Trial</a>
            <a href="/online-quran-classes" style="background:rgba(255,255,255,0.1);color:#ffffff;border:1px solid rgba(255,255,255,0.3);font-weight:600;font-size:16px;padding:14px 24px;border-radius:8px;text-decoration:none;">Explore All Courses</a>
            <a href="https://wa.me/923274496163" style="color:#D4A72C;font-weight:600;text-decoration:none;margin-left:8px;">WhatsApp: +92 327 4496163</a>
          </div>
        </div>
      </section>
${renderCourseDeepDive(normalizedPath)}
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
            <h3 style="font-size:20px;color:#064E3B;margin-top:0;"><a href="/teachers" style="color:#064E3B;text-decoration:none;">Learn Directly from the Founder</a></h3>
            <p style="color:#4B5563;font-size:15px;line-height:1.6;">Private, comfortable 1-on-1 learning environment. Every lesson is taught personally by the founder, M Muddasir Hameed, for sisters, children and adults worldwide.</p>
            <a href="/teachers" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">Meet Your Teacher →</a>
          </article>
        </div>
      </section>

      <!-- Section: Why Choose Noor E Quran Institute -->
      <section style="background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:40px 30px;margin-bottom:50px;">
        <h2 style="font-size:28px;color:#064E3B;margin-top:0;margin-bottom:16px;">Why Choose Noor E Quran Institute?</h2>
        <p style="color:#4B5563;font-size:16px;line-height:1.7;margin-bottom:24px;">
          Finding a trustworthy, qualified, and patient Quran tutor can be challenging for Muslim families living abroad in the UK, USA, Canada, Australia, Europe, and the Middle East. Noor E Quran Institute bridges this gap by offering live one-on-one virtual classrooms that fit seamlessly into busy modern schedules.
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
          <div>
            <h3 style="font-size:18px;color:#064E3B;margin-bottom:8px;">1. 100% Individual 1-on-1 Attention</h3>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;">Unlike crowded group settings, our teachers dedicate their full 30 to 45-minute lesson solely to your child, rectifying pronunciation mistakes instantly.</p>
          </div>
          <div>
            <h3 style="font-size:18px;color:#064E3B;margin-bottom:8px;">2. A Qualified Scholar as Your Teacher</h3>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;">Every class is taught personally by the founder, M Muddasir Hameed, an Islamic scholar and researcher with a Bachelor of Islamic Studies, an Aalmia (M.A. equivalent) in Islamic &amp; Arabic Studies, and a specialization in Islamic Jurisprudence.</p>
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

      <!-- Section: Meet Your Teacher -->
      <section style="margin-bottom:50px;">
        <div style="text-align:center;max-width:700px;margin:0 auto 30px;">
          <h2 style="font-size:28px;color:#064E3B;margin-bottom:8px;">Meet Your Teacher</h2>
          <p style="color:#4B5563;">Every lesson at Noor E Quran Institute is taught personally by the founder. No substitutes and no rotating tutors.</p>
        </div>

        <div style="max-width:560px;margin:0 auto;">
          <div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;text-align:center;">
            <h3 style="font-size:18px;color:#064E3B;margin-top:0;">M Muddasir Hameed</h3>
            <p style="color:#6B7280;font-size:13px;margin-bottom:8px;">Founder &amp; Lead Tutor, Noor E Quran Institute</p>
            <p style="color:#4B5563;font-size:14px;">Islamic scholar and researcher holding a Bachelor of Islamic Studies, an M.A.-equivalent (Aalmia) in Islamic &amp; Arabic Studies, and a post-graduate specialization in Islamic Jurisprudence (Takhassus fil Fiqh). He teaches Noorani Qaida, Nazra, Tajweed and Hifz to children and adults worldwide.</p>
            <a href="/author/m-muddasir-hameed" style="color:#064E3B;font-weight:700;font-size:14px;text-decoration:none;">About M Muddasir Hameed →</a>
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
            <p style="color:#4B5563;font-size:15px;line-height:1.6;margin:0;">All lessons are taught one-to-one by the institute’s founder, M Muddasir Hameed, in a private and comfortable setting that respects Islamic etiquette for sisters and young girls.</p>
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
          <h3 style="color:#D4A72C;font-size:18px;margin-top:0;">Noor E Quran Institute</h3>
          <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Dedicated to providing authentic Quranic education to Muslim children and adults worldwide through personal one-to-one teaching.</p>
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
            <li><a href="/teachers" style="color:#9CA3AF;text-decoration:none;">Our Teacher</a></li>
            <li><a href="/faculty" style="color:#9CA3AF;text-decoration:none;">Our Islamic Scholars</a></li>
            <li><a href="/pricing" style="color:#9CA3AF;text-decoration:none;">Tuition & Fee Packages</a></li>
          </ul>
        </div>
        <div>
          <h4 style="color:#ffffff;font-size:16px;margin-top:0;margin-bottom:12px;">Academy Information</h4>
          <ul style="list-style:none;padding:0;margin:0;font-size:14px;line-height:2;">
            <li><a href="/about-us" style="color:#9CA3AF;text-decoration:none;">About Noor E Quran Institute</a></li>
            <li><a href="/faq" style="color:#9CA3AF;text-decoration:none;">FAQs & Support</a></li>
            <li><a href="/blog" style="color:#9CA3AF;text-decoration:none;">Islamic Articles & Blog</a></li>
            <li><a href="/contact-us" style="color:#9CA3AF;text-decoration:none;">Contact & Admissions</a></li>
            <li><a href="/#trial" style="color:#D4A72C;font-weight:700;text-decoration:none;">Book Free Trial Class</a></li>
          </ul>
        </div>
      </div>
      <div style="border-top:1px solid #1F2937;padding-top:20px;text-align:center;color:#6B7280;font-size:13px;">
        © 2026 Noor E Quran Institute. All rights reserved. Registered Islamic Education Institution.
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

  // Google Site Name: every served <title> must carry the exact brand name.
  // Titles already containing it are left untouched.
  const SITE_NAME = 'Noor E Quran Institute';
  if (!meta.title.includes(SITE_NAME)) {
    meta = { ...meta, title: `${meta.title} | ${SITE_NAME}` };
  }

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

  const extraSchemaBlocks = [
    ...(meta.extraSchema ? [meta.extraSchema] : []),
    ...(meta.extraSchemas || [])
  ];
  const dynamicHeadInjection = `
  ${HREFLANG_TAGS}
  <script type="application/ld+json" id="ssr-breadcrumb-schema">
  ${JSON.stringify(breadcrumbSchema)}
  </script>
  ${extraSchemaBlocks
    .map(
      (schema, i) =>
        `<script type="application/ld+json" id="ssr-extra-schema-${i}">\n  ${JSON.stringify(schema)}\n  </script>`
    )
    .join('\n  ')}
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
 * Injects (or replaces) a robots noindex meta tag so crawlers do not index
 * SPA-fallback 404 pages (e.g. unknown blog slugs that may still render from Firestore).
 */
export function injectNoindexIntoHtml(html: string): string {
  if (/<meta\s+name="robots"/i.test(html)) {
    return html.replace(
      /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i,
      '<meta name="robots" content="noindex, follow" />'
    );
  }
  return html.replace('</head>', '  <meta name="robots" content="noindex, follow" />\n</head>');
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
    <title>404 - Page Not Found | Noor E Quran Institute</title>
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
