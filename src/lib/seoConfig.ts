export interface SEORouteMeta {
  path: string;
  title: string;
  description: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  canonical: string;
  ogType?: string;
  breadcrumbs: { name: string; item: string }[];
  schemaType?: string;
}

export const ACADEMY_BASE_URL = 'https://noorequraninstitute.me';

export const SEO_PAGE_MAP: Record<string, SEORouteMeta> = {
  home: {
    path: '/',
    title: 'Learn Quran Online | 1-on-1 Online Quran Classes for Kids & Adults',
    description: 'Learn Quran online in 1-on-1 live classes taught personally by the founder, M Muddasir Hameed. Tajweed, Hifz & Noorani Qaida for kids and adults. Book a free 3-day trial today!',
    h1: 'Learn Holy Quran with Tajweed From Certified Tutors',
    primaryKeyword: 'Online Quran Classes',
    secondaryKeywords: [
      'Learn Quran Online',
      'Online Quran Institute',
      'Quran with Tajweed',
      'Online Quran Tutor',
      'Quran Classes for Kids',
      'Female Quran Teacher'
    ],
    canonical: `${ACADEMY_BASE_URL}/`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` }
    ]
  },
  courses: {
    path: '/online-quran-classes',
    title: 'Online Quran Courses: Qaida, Nazra, Tajweed & Hifz Programs',
    description: 'Explore online Quran courses: Noorani Qaida, Nazra, Tajweed & Hifz memorization. 1-on-1 live classes for kids & adults, taught personally by the founder.',
    h1: 'Comprehensive Online Quran Learning Programs',
    primaryKeyword: 'Online Quran Courses',
    secondaryKeywords: [
      'Quran Classes Online',
      'Learn Quran with Tajweed',
      'Noorani Qaida Course',
      'Hifz Quran Online',
      'Islamic Studies Classes'
    ],
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` }
    ]
  },
  'noorani-qaida': {
    path: '/noorani-qaida',
    title: 'Noorani Qaida for Beginners Online | Learn Arabic Letters with Tajweed',
    description: 'Master Arabic alphabet recognition, Makharij articulation points, and phonetic rules with certified 1-on-1 tutors. Ideal for children and beginner adults.',
    h1: 'Noorani Qaida Online for Beginners & Kids',
    primaryKeyword: 'Noorani Qaida Online',
    secondaryKeywords: [
      'Learn Noorani Qaida',
      'Arabic Alphabet for Kids',
      'Makharij Pronunciation Rules',
      'Beginner Quran Reading'
    ],
    canonical: `${ACADEMY_BASE_URL}/noorani-qaida`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Noorani Qaida', item: `${ACADEMY_BASE_URL}/noorani-qaida` }
    ]
  },
  'quran-reading-nazra': {
    path: '/quran-reading-nazra',
    title: 'Nazra Quran Reading Course Online | Fluent Recitation with 1-on-1 Tutors',
    description: 'Learn to read the complete 30 Juz of the Holy Quran fluently. Real-time pronunciation corrections, breath control, and daily progress tracking.',
    h1: 'Nazra Quran Reading & Fluent Recitation',
    primaryKeyword: 'Nazra Quran Online',
    secondaryKeywords: [
      'Quran Reading Online',
      'Learn to Read Quran',
      'Quran Recitation Classes',
      'Online Quran Reading Tutor'
    ],
    canonical: `${ACADEMY_BASE_URL}/quran-reading-nazra`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Nazra Quran', item: `${ACADEMY_BASE_URL}/quran-reading-nazra` }
    ]
  },
  'quran-with-tajweed': {
    path: '/quran-with-tajweed',
    title: 'Quran with Tajweed Online | Theoretical & Practical Tajweed Rules',
    description: 'Master the sacred rules of Tajweed: Noon Sakin, Meem Sakin, Madd, and Stopping Signs (Waqf) taught 1-on-1 by certified Islamic scholars.',
    h1: 'Learn Holy Quran with Tajweed Rules Online',
    primaryKeyword: 'Quran with Tajweed Online',
    secondaryKeywords: [
      'Learn Tajweed Online',
      'Tajweed Rules Course',
      'Makharij and Sifaat',
      'Online Tajweed Classes'
    ],
    canonical: `${ACADEMY_BASE_URL}/quran-with-tajweed`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Quran with Tajweed', item: `${ACADEMY_BASE_URL}/quran-with-tajweed` }
    ]
  },
  'quran-memorization-hifz': {
    path: '/quran-memorization-hifz',
    title: 'Online Quran Memorization (Hifz) Course | Certified Huffaz & Daily Sabaq',
    description: 'Memorize the Holy Quran at home with structured daily Sabaq, Sabqi revision, and Manzil consolidation under certified male and female Huffaz.',
    h1: 'Online Quran Memorization & Hifz Program',
    primaryKeyword: 'Hifz Quran Online',
    secondaryKeywords: [
      'Quran Memorization Online',
      'Online Hifz Classes',
      'Hifz Quran for Kids',
      'Quran Memorization for Adults'
    ],
    canonical: `${ACADEMY_BASE_URL}/quran-memorization-hifz`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Courses', item: `${ACADEMY_BASE_URL}/online-quran-classes` },
      { name: 'Hifz Program', item: `${ACADEMY_BASE_URL}/quran-memorization-hifz` }
    ]
  },
  'kids-program': {
    path: '/quran-classes-for-kids',
    title: 'Online Quran Classes for Kids | Gentle, Patient Male & Female Tutors',
    description: 'Engaging, interactive 1-on-1 Quran classes for children ages 4 and up. Noorani Qaida basics, fun Islamic manners, and daily progress feedback for parents.',
    h1: 'Online Quran Lessons & Classes for Children',
    primaryKeyword: 'Quran Classes for Kids',
    secondaryKeywords: [
      'Online Quran for Children',
      'Kids Quran Teacher Online',
      'Noorani Qaida for Kids',
      'Child-Friendly Quran Academy'
    ],
    canonical: `${ACADEMY_BASE_URL}/quran-classes-for-kids`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Kids Program', item: `${ACADEMY_BASE_URL}/quran-classes-for-kids` }
    ]
  },
  'slow-learners': {
    path: '/quran-classes-for-adults',
    title: 'Online Quran Classes for Adults & Slow Learners | Patient 1-on-1 Guidance',
    description: 'Specialized 1-on-1 Quran learning tailored for busy working adults and slow learners. Supportive pace, private atmosphere, and flexible evening/weekend slots.',
    h1: 'Personalized Quran Learning for Adults & Slow Learners',
    primaryKeyword: 'Quran Classes for Adults',
    secondaryKeywords: [
      'Learn Quran as an Adult',
      'Adult Quran Reading Course',
      'Patient Quran Tutor',
      'Flexible Quran Classes'
    ],
    canonical: `${ACADEMY_BASE_URL}/quran-classes-for-adults`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Adults Program', item: `${ACADEMY_BASE_URL}/quran-classes-for-adults` }
    ]
  },
  'female-tutor': {
    path: '/female-quran-teacher',
    title: 'Certified Female Quran Teachers Online | Dedicated for Sisters & Daughters',
    description: 'Learn Quran with certified female Quran tutors in complete privacy and comfort. Tailored 1-on-1 lessons in Noorani Qaida, Tajweed, and Hifz.',
    h1: 'Online Quran Classes with Qualified Female Tutors',
    primaryKeyword: 'Female Quran Teacher Online',
    secondaryKeywords: [
      'Female Quran Tutor',
      'Online Quran Classes for Sisters',
      'Female Quran Teacher for Kids',
      'Lady Quran Teacher'
    ],
    canonical: `${ACADEMY_BASE_URL}/female-quran-teacher`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Female Faculty', item: `${ACADEMY_BASE_URL}/female-quran-teacher` }
    ]
  },
  packages: {
    path: '/pricing',
    title: 'Online Quran Classes Pricing | Affordable Monthly Packages',
    description: 'Affordable monthly Quran class packages with family discounts, multi-currency support and flexible timings. Book a free 3-day trial today!',
    h1: 'Transparent Tuition & Class Packages',
    primaryKeyword: 'Affordable Online Quran Classes',
    secondaryKeywords: [
      'Online Quran Fee Structure',
      'Cheap Quran Classes Online',
      'Quran Tuition Rates',
      'Online Quran Class Pricing'
    ],
    canonical: `${ACADEMY_BASE_URL}/pricing`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Pricing', item: `${ACADEMY_BASE_URL}/pricing` }
    ]
  },
  tutors: {
    path: '/faculty',
    title: 'Meet Your Quran Teacher | M Muddasir Hameed',
    description: 'Meet M Muddasir Hameed, founder of Noor E Quran Institute and your personal teacher for every 1-on-1 Quran class. Book a free trial class!',
    h1: 'Meet Your Quran Teacher',
    primaryKeyword: 'Online Quran Teacher',
    secondaryKeywords: [
      'Certified Quran Tutors',
      'Ijazah Quran Teachers',
      'Male Quran Tutor',
      'Qualified Quran Faculty'
    ],
    canonical: `${ACADEMY_BASE_URL}/faculty`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Faculty', item: `${ACADEMY_BASE_URL}/faculty` }
    ]
  },
  about: {
    path: '/about-us',
    title: 'About Noor E Quran Institute | Mission, Values & Global Education',
    description: 'Learn about Noor E Quran Institute\'s educational mission, verified teaching methodology, and commitment to authentic 1-on-1 online Quran learning.',
    h1: 'About Noor E Quran Institute',
    primaryKeyword: 'Online Quran Institute',
    secondaryKeywords: [
      'About Noor E Quran Institute',
      'Quran Teaching Methodology',
      'Islamic Online Education',
      'Trusted Quran Institution'
    ],
    canonical: `${ACADEMY_BASE_URL}/about-us`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'About Us', item: `${ACADEMY_BASE_URL}/about-us` }
    ]
  },
  faq: {
    path: '/faq',
    title: 'Frequently Asked Questions | Online Quran Classes & Admission',
    description: 'Find answers to common questions about 1-on-1 Quran classes, trial scheduling, male and female tutors, technical requirements, and monthly fees.',
    h1: 'Frequently Asked Questions (FAQs)',
    primaryKeyword: 'Online Quran FAQ',
    secondaryKeywords: [
      'How Online Quran Classes Work',
      'Online Quran Trial Questions',
      'Quran Tutor Selection FAQs',
      'Quran Class Timings'
    ],
    canonical: `${ACADEMY_BASE_URL}/faq`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'FAQ', item: `${ACADEMY_BASE_URL}/faq` }
    ]
  },
  articles: {
    path: '/blog',
    title: 'Islamic Educational Blog & Quran Learning Guides | Noor E Quran Institute',
    description: 'Helpful articles and practical guides on Tajweed rules, Quran memorization routines, Arabic phonetics, and Islamic parenting for Muslim families.',
    h1: 'Quran Learning Guides & Islamic Articles',
    primaryKeyword: 'Quran Learning Blog',
    secondaryKeywords: [
      'Tajweed Guides',
      'Hifz Tips and Tricks',
      'Teaching Kids Quran',
      'Islamic Parenting Advice'
    ],
    canonical: `${ACADEMY_BASE_URL}/blog`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` }
    ]
  },
  blogs: {
    path: '/blog',
    title: 'Quran Learning Blog | Tajweed, Hifz & Parenting Guides',
    description: 'Practical guides on Tajweed, Hifz memorization, teaching kids Quran and Islamic parenting — tips from certified Quran tutors for Muslim families.',
    h1: 'Quran Learning Guides & Islamic Articles',
    primaryKeyword: 'Quran Learning Blog',
    secondaryKeywords: [
      'Tajweed Guides',
      'Hifz Tips and Tricks',
      'Teaching Kids Quran',
      'Islamic Parenting Advice'
    ],
    canonical: `${ACADEMY_BASE_URL}/blog`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Blog', item: `${ACADEMY_BASE_URL}/blog` }
    ]
  },
  contact: {
    path: '/contact-us',
    title: 'Contact Noor E Quran Institute | 24/7 WhatsApp & Admission Support',
    description: 'Get in touch with our academic coordinators for course inquiries, tutor matching, and class scheduling via WhatsApp (+92 327 4496163) or email.',
    h1: 'Contact Our Academic Coordinators',
    primaryKeyword: 'Contact Quran Academy',
    secondaryKeywords: [
      'Quran Academy WhatsApp',
      'Book Free Quran Trial',
      'Admissions Helpline',
      'Quran Tutor Support'
    ],
    canonical: `${ACADEMY_BASE_URL}/contact-us`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Contact Us', item: `${ACADEMY_BASE_URL}/contact-us` }
    ]
  },
  // International SEO Pages
  'uk-program': {
    path: '/online-quran-classes-uk',
    title: 'Online Quran Classes UK | 1-on-1 Quran Lessons in London, Birmingham & UK',
    description: 'Dedicated 1-on-1 online Quran classes for UK Muslim students. Certified male and female tutors aligned with UK GMT/BST evening and weekend times.',
    h1: 'Online Quran Classes for Students in the United Kingdom (UK)',
    primaryKeyword: 'Online Quran Classes UK',
    secondaryKeywords: [
      'Quran Teacher UK',
      'Learn Quran Online London',
      'Online Quran Classes Birmingham',
      'Quran with Tajweed UK'
    ],
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-uk`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'UK Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-uk` }
    ]
  },
  'usa-program': {
    path: '/online-quran-classes-usa',
    title: 'Online Quran Classes USA | 1-on-1 Quran Tutors in EST, CST & PST Timezones',
    description: 'Learn Quran online across the United States. Personalized 1-on-1 classes for kids & adults with flexible after-school and weekend timings in all US timezones.',
    h1: 'Online Quran Classes for Students in the United States (USA)',
    primaryKeyword: 'Online Quran Classes USA',
    secondaryKeywords: [
      'Quran Teacher USA',
      'Learn Quran Online USA',
      'Quran Classes for Kids USA',
      'Female Quran Teacher USA'
    ],
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-usa`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'USA Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-usa` }
    ]
  },
  'canada-program': {
    path: '/online-quran-classes-canada',
    title: 'Online Quran Classes Canada | Toronto, Calgary & Vancouver 1-on-1 Tutors',
    description: 'Dedicated 1-on-1 online Quran classes for Muslim students across Canada. Personalized lessons for children and adults with patient, qualified tutors and flexible schedules.',
    h1: 'Online Quran Classes for Students in Canada',
    primaryKeyword: 'Online Quran Classes Canada',
    secondaryKeywords: [
      'Quran Teacher Canada',
      'Learn Quran Online Toronto',
      'Quran Classes for Kids Canada',
      'Tajweed Classes Canada'
    ],
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-canada`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Canada Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-canada` }
    ]
  },
  'australia-program': {
    path: '/online-quran-classes-australia',
    title: 'Online Quran Classes Australia | Sydney, Melbourne & Brisbane 1-on-1 Lessons',
    description: 'Live 1-on-1 online Quran classes tailored for students in Australia (AEST/AWST). Certified male and female tutors with 3-day free trial.',
    h1: 'Online Quran Classes for Students in Australia',
    primaryKeyword: 'Online Quran Classes Australia',
    secondaryKeywords: [
      'Quran Teacher Australia',
      'Learn Quran Online Sydney',
      'Quran Classes Melbourne',
      'Kids Quran Classes Australia'
    ],
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-australia`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Australia Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-australia` }
    ]
  },
  'pakistan-program': {
    path: '/online-quran-classes-pakistan',
    title: 'Online Quran Classes Pakistan | Noorani Qaida, Nazra & Tajweed in Urdu/English',
    description: 'Affordable online Quran classes in Pakistan. Flexible scheduling in PKT timezone with certified Qaris and Alim/Alimah faculty.',
    h1: 'Online Quran Classes in Pakistan',
    primaryKeyword: 'Online Quran Classes Pakistan',
    secondaryKeywords: [
      'Online Quran Academy Pakistan',
      'Quran Teacher Online Lahore',
      'Learn Quran Online Karachi',
      'Noorani Qaida Classes Pakistan'
    ],
    canonical: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan`,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: `${ACADEMY_BASE_URL}/` },
      { name: 'Pakistan Program', item: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan` }
    ]
  }
};

export const HREFLANG_ALTERNATES = [
  { hreflang: 'en', href: `${ACADEMY_BASE_URL}/` },
  { hreflang: 'x-default', href: `${ACADEMY_BASE_URL}/` },
  { hreflang: 'en-gb', href: `${ACADEMY_BASE_URL}/online-quran-classes-uk` },
  { hreflang: 'en-us', href: `${ACADEMY_BASE_URL}/online-quran-classes-usa` },
  { hreflang: 'en-ca', href: `${ACADEMY_BASE_URL}/online-quran-classes-canada` },
  { hreflang: 'en-au', href: `${ACADEMY_BASE_URL}/online-quran-classes-australia` },
  { hreflang: 'en-pk', href: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan` },
  { hreflang: 'ur-pk', href: `${ACADEMY_BASE_URL}/online-quran-classes-pakistan` }
];

