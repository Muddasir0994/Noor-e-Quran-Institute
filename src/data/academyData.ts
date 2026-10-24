import {
  Course,
  PackagePlan,
  Tutor,
  Testimonial,
  Article,
  IslamicResource,
  FAQItem,
  SiteSettings,
  MediaAsset,
  MessageTemplate,
  PageSeoConfig,
  FeeInvoice,
  StudentReportCard,
  TutorPayroll,
  ActivityLog
} from '../types';

export const ALL_COURSES: Course[] = [
  {
    id: 'c-1',
    slug: 'noorani-qaida',
    name: 'Noorani Qaida',
    arabicName: 'القاعدة النورانية',
    category: 'kids',
    shortDescription: 'Essential foundation for Arabic phonetics, Makharij articulation points, and beginner reading.',
    description: 'The fundamental beginner course designed to teach letter recognition, correct phonetic articulation (Makharij), joining letters, Harakaat, Tanween, Madd, and Sukoon to build a flawless foundation for Quran recitation.',
    audience: 'Kids (Ages 4+), Beginners & New Muslims',
    duration: '3 - 5 Months',
    classesPerWeek: '4 - 5 Days / Week',
    feePKR: 3500,
    feeUSD: 35,
    featured: true,
    status: 'active',
    imageUrl: '/images/course-noorani-qaida.webp',
    highlights: [
      'Arabic Alphabet & Precise Makharij Articulation',
      'Letter Recognition & Joining Rules',
      'Short Vowels (Harakat), Tanween & Sukoon',
      'Gentle 1-on-1 pacing customized for children'
    ],
    syllabus: [
      'Lesson 1: Individual Letters & Articulation Points (Makharij)',
      'Lesson 2: Compound Letters (Murakkabat)',
      'Lesson 3: Muqatta\'at Letters (Abbreviated Letters)',
      'Lesson 4: Short Vowels (Harakat: Fatha, Kasra, Damma)',
      'Lesson 5: Tanween (Double Vowels)',
      'Lesson 6: Exercises on Harakat & Tanween',
      'Lesson 7: Standing Fatha, Kasra, Damma (Khari Harkat)',
      'Lesson 8: Huroof Maddah & Leen',
      'Lesson 9: Sukoon / Jazm & Qalqalah letters',
      'Lesson 10: Shaddah (Tashdeed) & Practical Quran Words'
    ],
    learningOutcomes: [
      'Accurate pronunciation of all 28 Arabic letters without mixing sounds',
      'Ability to read compound words directly from the Mushaf',
      'Smooth transition into Para 30 (Juz Amma)'
    ]
  },
  {
    id: 'c-2',
    slug: 'quran-reading-nazra',
    name: 'Quran Reading / Nazra',
    arabicName: 'ناظرة القرآن الكريم',
    category: 'recitation',
    shortDescription: 'Fluent reading of the complete 30 Paras (Juz) with rhythm, breath control, and confidence.',
    description: 'Master continuous and fluent reading of the Holy Quran from cover to cover. Students receive 1-on-1 supervision to correct pronunciation errors in real-time and cultivate love for daily Quranic recitation.',
    audience: 'Students who completed Qaida & Adults',
    duration: '6 - 12 Months',
    classesPerWeek: '4 - 5 Days / Week',
    feePKR: 4000,
    feeUSD: 40,
    featured: true,
    status: 'active',
    imageUrl: '/images/course-nazra-tajweed.webp',
    highlights: [
      'Complete 30 Paras recitation under certified Qari supervision',
      'Breathing techniques and stopping sign (Waqf) rules',
      'Continuous daily reading fluency & rhythm',
      'Daily revision and recitation milestones'
    ],
    syllabus: [
      'Phase 1: Juz 30 (Juz Amma) detailed recitation',
      'Phase 2: Juz 1 to Juz 10 (Building stamina and speed)',
      'Phase 3: Juz 11 to Juz 20 (Complex Surahs & rhythm)',
      'Phase 4: Juz 21 to Juz 30 (Final Khatm-ul-Quran)'
    ],
    learningOutcomes: [
      'Flawless reading directly from standard 13/15/16 line Mushaf',
      'Complete Khatm of the Holy Quran',
      'Confidence in reciting in front of family and gatherings'
    ]
  },
  {
    id: 'c-3',
    slug: 'quran-with-tajweed',
    name: 'Quran with Tajweed',
    arabicName: 'أحكام التجويد والإتقان',
    category: 'tajweed',
    shortDescription: 'In-depth theoretical and practical Tajweed rules for beautiful, precise recitation.',
    description: 'Elevate your recitation to the standard of classical Qira\'at. Learn essential rules: Noon Sakin & Tanween, Meem Sakin, Madd, Qalqalah, Ghunnah, Sifaat-ul-Huroof, and stopping marks with verified Ijazah holders.',
    audience: 'Kids (Ages 7+), Teens, Adults & Converts',
    duration: '6 - 9 Months',
    classesPerWeek: '3 - 4 Days / Week',
    feePKR: 4500,
    feeUSD: 45,
    featured: true,
    status: 'active',
    imageUrl: '/images/course-nazra-tajweed.webp',
    highlights: [
      'Comprehensive Makharij & Sifaat rules',
      'Rules of Noon Sakinah, Meem Sakinah & Madd',
      'Practical application directly on Quranic Ayahs',
      'Melodic recitation (Tarteel) training'
    ],
    syllabus: [
      'Module 1: Introduction to Tajweed & Makharij classification',
      'Module 2: Rules of Noon Sakin & Tanween (Izhar, Idgham, Iqlab, Ikhfa)',
      'Module 3: Rules of Meem Sakin (Ikhfa Shafawi, Idgham Shafawi, Izhar Shafawi)',
      'Module 4: Rules of Madd (Asli, Wajib, Ja\'iz, Lazim)',
      'Module 5: Rules of Raa & Laam (Tafkheem & Tarqeeq)',
      'Module 6: Stopping Rules (Ahkam-ul-Waqf wal Ibtida)'
    ],
    learningOutcomes: [
      'Mastery of all fundamental and intermediate Tajweed rules',
      'Recitation free from major (Lahn Jali) and minor (Lahn Khafi) errors',
      'Eligibility for advanced Ijazah certification'
    ]
  },
  {
    id: 'c-4',
    slug: 'quran-memorization-hifz',
    name: 'Quran Memorization / Hifz',
    arabicName: 'حفظ القرآن الكريم وتثبيته',
    category: 'hifz',
    shortDescription: 'Full or partial Quran memorization with a structured daily Sabaq, Sabqi, and Manzil system.',
    description: 'Embark on the sacred journey of becoming a Hafiz-ul-Quran from the comfort of your home. Personalized daily memorization goals with rigorous revision cycles to guarantee long-term retention.',
    audience: 'Dedicated Kids (Ages 6+), Youth & Adults',
    duration: '2 - 3 Years (Customizable)',
    classesPerWeek: '5 - 6 Days / Week',
    feePKR: 6000,
    feeUSD: 55,
    featured: true,
    status: 'active',
    imageUrl: '/images/course-hifz.webp',
    highlights: [
      'Structured 3-tier daily cycle (Sabaq, Sabqi, Manzil)',
      '1-on-1 dedicated Hafiz/Hafiza mentor',
      'Weekly voice notes and memory retention checks',
      'Comprehensive evaluation after every completed Para'
    ],
    syllabus: [
      'Track A: Partial Hifz (Selected Surahs: Yaseen, Mulk, Rahman, Kahf, Waqiah)',
      'Track B: Short Surahs Track (Juz 30 & Juz 29)',
      'Track C: Full 30 Paras Hifz-ul-Quran'
    ],
    learningOutcomes: [
      'Rock-solid retention of memorized Paras with zero doubts',
      'Recitation from memory during daily Salah and Taraweeh',
      'Official Noor E Quran Institute Hifz Certificate & Sanad'
    ]
  },
  {
    id: 'c-5',
    slug: 'islamic-studies',
    name: 'Islamic Studies & Tafseer',
    arabicName: 'الدراسات الإسلامية والتفسير',
    category: 'islamic_studies',
    shortDescription: 'Understand Quranic meaning, essential daily Duas, 6 Kalmas, Hadith stories, and Salah.',
    description: 'A holistic Islamic curriculum covering word-by-word Quran translation, Tafseer of selected Surahs, 40 Masnoon Duas, Step-by-Step Namaz (Salah), basic Fiqh of Taharah, and inspiring Seerah of the Prophets.',
    audience: 'Kids, Teenagers & Adult Converts',
    duration: '4 - 6 Months',
    classesPerWeek: '2 - 3 Days / Week',
    feePKR: 3500,
    feeUSD: 35,
    featured: true,
    status: 'active',
    imageUrl: '/images/adults-program-banner.webp',
    highlights: [
      'Word-by-word translation and contextual Tafseer',
      '40 Daily Masnoon Duas with Arabic transliteration',
      'Practical Salah (Namaz) with word-for-word translation',
      'Islamic morals, manners (Adab), and Seerah stories'
    ],
    syllabus: [
      'Unit 1: Iman, Aqeedah & 6 Kalmas with translation',
      'Unit 2: Perfecting Salah (Namaz), Wudu, Ghusl & Tayammum',
      'Unit 3: Essential Daily Supplications (Eating, Sleeping, Traveling, Mosque)',
      'Unit 4: Stories of the Prophets (Adam, Ibrahim, Musa, Isa, Muhammad SAW)',
      'Unit 5: Tafseer of Short Surahs (Surah Fatiha to Surah Naas)'
    ],
    learningOutcomes: [
      'Deep personal connection to the meaning of Allah\'s message',
      'Correct performance of all daily religious obligations with understanding',
      'Strong moral character rooted in Quran and Sunnah'
    ]
  }
];

export const ALL_PACKAGES: PackagePlan[] = [
  {
    id: 'pkg-2days',
    name: 'Starter Track',
    code: 'pkg-2days',
    daysPerWeek: '2 Days / Week',
    classesPerMonth: 8,
    classDurationMinutes: 30,
    monthlyFeePKR: 3000,
    monthlyFeeUSD: 30,
    monthlyFeeGBP: 24,
    monthlyFeeEUR: 28,
    monthlyFeeAED: 110,
    monthlyFeeCAD: 40,
    monthlyFeeAUD: 45,
    badge: 'Light Schedule',
    description: 'Perfect for busy school children, university students, and beginners easing into Quran study.',
    features: [
      '8 One-on-One Live Classes per month',
      '30 Minutes per private lesson',
      'Choice of Male or Female certified tutor',
      'Noorani Qaida or Quran Reading basics',
      'Monthly attendance & progress report',
      'Free Class Rescheduling with 4-hour notice',
      '3-Day Free Trial included'
    ]
  },
  {
    id: 'pkg-3days',
    name: 'Standard Track',
    code: 'pkg-3days',
    daysPerWeek: '3 Days / Week',
    classesPerMonth: 12,
    classDurationMinutes: 30,
    monthlyFeePKR: 4000,
    monthlyFeeUSD: 40,
    monthlyFeeGBP: 32,
    monthlyFeeEUR: 36,
    monthlyFeeAED: 145,
    monthlyFeeCAD: 52,
    monthlyFeeAUD: 58,
    isPopular: true,
    badge: 'Most Popular Choice',
    description: 'Our most recommended plan for steady, consistent progress in Noorani Qaida, Tajweed, or Nazra.',
    features: [
      '12 One-on-One Live Classes per month',
      '30 Minutes per private lesson',
      'Choice of Male or Female certified tutor',
      'Complete Quran Reading + Tajweed + Islamic Studies',
      'Monthly Progress Assessment & Report Card',
      'Free Class Rescheduling & Makeup support',
      '3-Day Free Trial included'
    ]
  },
  {
    id: 'pkg-5days',
    name: 'Intensive Track',
    code: 'pkg-5days',
    daysPerWeek: '5 Days / Week',
    classesPerMonth: 20,
    classDurationMinutes: 30,
    monthlyFeePKR: 6000,
    monthlyFeeUSD: 55,
    monthlyFeeGBP: 45,
    monthlyFeeEUR: 50,
    monthlyFeeAED: 200,
    monthlyFeeCAD: 72,
    monthlyFeeAUD: 80,
    badge: 'Best for Rapid Fluency & Hifz',
    description: 'Ideal for serious learners, Hifz-ul-Quran students, and kids seeking rapid daily Quranic mastery.',
    features: [
      '20 One-on-One Live Classes per month',
      '30 Minutes daily focused lesson',
      'Daily Sabaq, Sabqi, and Manzil revisions',
      'Dedicated Hafiz / Aalima tutor assigned',
      'Weekly voice notes & audio homework checks',
      'Priority scheduling and make-up slots',
      '3-Day Free Trial included'
    ]
  },
  {
    id: 'pkg-weekend',
    name: 'Weekend Special',
    code: 'pkg-weekend',
    daysPerWeek: 'Saturday & Sunday',
    classesPerMonth: 8,
    classDurationMinutes: 45,
    monthlyFeePKR: 3500,
    monthlyFeeUSD: 35,
    monthlyFeeGBP: 28,
    monthlyFeeEUR: 32,
    monthlyFeeAED: 130,
    monthlyFeeCAD: 46,
    monthlyFeeAUD: 52,
    badge: 'School & Office Friendly',
    description: 'Customized for school children and office workers with busy Monday-to-Friday schedules.',
    features: [
      '8 Weekend Classes per month (Sat & Sun)',
      'Extended 45 Minutes per class for deep learning',
      'Male and Female tutors available on weekends',
      'Noorani Qaida, Nazra, Namaz & Kalmas included',
      'Parent coordination and attendance reports',
      '3-Day Free Trial included'
    ]
  }
];

export const INITIAL_TUTORS: Tutor[] = [
  {
    id: 'tut-muddasir',
    name: 'M Muddasir Hameed',
    gender: 'Male',
    qualification: 'Aalmia (M.A.-equivalent) in Islamic & Arabic Studies, Takhassus fil Fiqh (Specialization in Islamic Jurisprudence)',
    specialization: 'Noorani Qaida, Nazra Quran, Tajweed, Hifz, Islamic Studies',
    languages: ['English', 'Urdu', 'Arabic'],
    experienceYears: 5,
    availableTimings: 'Flexible (Worldwide Timezones)',
    studentsCapacity: 30,
    activeStudentsCount: 5,
    phone: '+92 327 4496163',
    email: 'contact.noorequraninstitute@gmail.com',
    photoUrl: '/images/author/m-muddasir-hameed.jpg',
    rating: 5.0,
    bio: 'Islamic scholar, researcher, and founder of Noor E Quran Institute. He personally teaches every student one-to-one, from Noorani Qaida and Nazra to Tajweed, Hifz and Islamic studies.',
    status: 'Available',
    createdAt: '2025-01-10'
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Dr. Tariq Mahmood',
    studentOrParent: 'Father of Ayaan (7 yrs) & Zoya (9 yrs)',
    location: 'London, United Kingdom',
    countryFlag: '🇬🇧',
    courseName: 'Noorani Qaida & Nazra with Tajweed',
    rating: 5,
    comment: 'Finding genuine teachers who combine deep Tajweed knowledge with child-friendly patience was difficult until we joined. My children look forward to every single class.',
    date: 'February 2026',
    status: 'published'
  },
  {
    id: 't-2',
    name: 'Sister Saima Rehman',
    studentOrParent: 'Mother of Maryam (11 yrs)',
    location: 'Dallas, Texas, USA',
    countryFlag: '🇺🇸',
    courseName: 'Quran for Women & Tajweed',
    rating: 5,
    comment: 'As a working mother, having classes at 9:00 PM local time was a blessing. My daughter\'s female tutor is so patient and corrected pronunciation mistakes with immense care.',
    date: 'January 2026',
    status: 'published'
  },
  {
    id: 't-3',
    name: 'Brother Farhan Malik',
    studentOrParent: 'Adult Tajweed Student',
    location: 'Sydney, Australia',
    countryFlag: '🇦🇺',
    courseName: 'Quran Memorization / Hifz',
    rating: 5,
    comment: 'The 1-on-1 coaching system at Noor E Quran Institute is exceptional. My teacher checks daily recitation and provides practical exercises for Noon Sakinah and Madd.',
    date: 'January 2026',
    status: 'published'
  },
  {
    id: 't-4',
    name: 'Zainab Qureshi',
    studentOrParent: 'Mother of Daniyal (6 yrs)',
    location: 'Toronto, Canada',
    countryFlag: '🇨🇦',
    courseName: 'Quran for Kids & Slow Learners Support',
    rating: 5,
    comment: 'Daniyal used to get anxious during group Islamic classes. Noor E Quran\'s gentle, slow-learner approach gave him real confidence. He loves his lessons now!',
    date: 'December 2025',
    status: 'published'
  },
  {
    id: 't-5',
    name: 'Brother Usman Tariq',
    studentOrParent: 'Father of Ibrahim (8 yrs)',
    location: 'Dubai, UAE',
    countryFlag: '🇦🇪',
    courseName: 'Noorani Qaida & Nazra',
    rating: 5,
    comment: 'The trial class convinced us immediately. Ibrahim reads his daily Sabaq with joy and his Tajweed has improved remarkably in just two months.',
    date: 'February 2026',
    status: 'published'
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    slug: 'how-to-teach-quran-to-kids-at-home',
    title: 'How to Teach Quran to Kids at Home: 5 Proven Pedagogical Tips',
    category: 'Kids',
    author: 'M Muddasir Hameed',
    readTime: '6 min read',
    publishedAt: 'February 2026',
    summary: 'Discover five practical, child-psychology backed strategies to teach Quran to young children at home without stress, frustration, or burnout.',
    content: `# How to Teach Quran to Kids at Home (5 Proven Tips)

Teaching the Holy Quran to young children is one of the most rewarding spiritual responsibilities for Muslim parents. However, busy family routines, short attention spans, and language barriers often make daily practice feel overwhelming.

At **Noor E Quran Institute**, our certified scholars have taught thousands of young students globally. Here are 5 practical, tried-and-tested tips to cultivate a joyful, lifelong relationship with Allah's Book.

---

## 1. Why Early Quran Learning Matters for Children

During the formative years (ages 4 to 9), a child's brain has exceptional neuroplasticity. Introducing Arabic phonetics and **Makharij** (articulation points) early ensures:
- Natural pronunciation without heavy regional accents.
- Effortless auditory memorization of short Surahs (*Juz Amma*).
- Emotional attachment to daily Islamic prayers (*Salah*) and *Duas*.

---

## 2. Step-by-Step Method for Home Learning

### A. Short, Consistent 20-30 Minute Daily Lessons
Children thrive on predictability. Rather than holding long, exhausting weekend sessions, dedicate 25 to 30 minutes 4 to 5 days per week. This reinforces short-term memory into permanent retention.

### B. Master Noorani Qaida Before Rushing into Mushaf
Many parents make the mistake of rushing children into reading full Surahs before foundational letter recognition is solid. Ensure your child thoroughly understands:
- Individual letter shapes (isolated, initial, medial, final).
- Short vowels (*Fatha, Kasra, Damma*).
- Joining rules (*Tashdeed, Sukoon, Tanween*).

If you want structured guidance, explore our **[Certified Noorani Qaida Course](/courses)**.

---

## 3. Common Mistakes Parents Make (And How to Avoid Them)

1. **Using Pressure or Harsh Reprimands**: Quran learning must never be associated with fear or anxiety. Always pair lessons with praise, small rewards, and patience.
2. **Ignoring Pronunciation Inaccuracies**: Overlooking subtle mistakes in letters like **ح (Haa)** vs **هـ (Haa)** or **ق (Qaf)** vs **ك (Kaaf)** makes bad recitation habits difficult to unlearn later.
3. **Inconsistent Schedules**: Skipping lessons for weeks breaks the momentum.

---

## 4. Tips for Busy Working Parents

- **Utilize Daily Car Rides**: Play melodic recitations of Juz Amma by renowned Qaris during the school run to build auditory familiarity.
- **Set Up a Quiet Learning Studio**: Dedicate a clean, peaceful corner in your home for Quran study with their Mushaf, Rehal, and headphones.
- **Partner with an Accredited 1-on-1 Tutor**: If work or time constraints limit your teaching availability, enrolling in dedicated **[Online Quran Classes for Kids](/courses)** provides structured supervision with certified male or female scholars.

---

## Ready to Start Your Child's Quran Journey?
Book a **[3-Day Free Trial Class](/courses)** with our gentle, certified scholars today. No credit card required.`,
    status: 'published'
  },
  {
    id: 'art-2',
    slug: 'tajweed-rules-for-beginners',
    title: 'Complete Guide to Tajweed Rules for Beginners: Makharij, Noon Sakin & Madd',
    category: 'Tajweed',
    author: 'M Muddasir Hameed',
    readTime: '7 min read',
    publishedAt: 'February 2026',
    summary: 'A structured, beginner-friendly breakdown of core Tajweed rules: Makharij points, the 4 rules of Noon Sakinah & Tanween, and common recitation errors.',
    content: `# Essential Rules of Tajweed for Beginners: A Complete Step-by-Step Guide

Reciting the Holy Quran with **Tajweed** is not merely an optional decorative art; it is a sacred obligation to preserve the exact phonetics revealed to the Prophet Muhammad (peace be upon him).

Allah subhanahu wa ta'ala commands in the Quran:
> *“And recite the Quran with measured, rhythmic recitation.”* — (Surah Al-Muzzammil, 73:4)

---

## What is Tajweed?
Linguistically, *Tajweed* means 'proficiency' or 'doing something with excellence'. In Islamic terminology, it is the science of giving every Arabic letter its exact rights from its specific articulation point (*Makhraj*) and respecting its intrinsic characteristics (*Sifaat*).

---

## 1. The 5 Major Articulation Points (Makharij-ul-Huroof)

Every Arabic sound originates from one of 5 primary areas:
1. **Al-Jawf (The Oral Cavity / Chest)**: Produces the long elongation letters (*Alif, Waw, Yaa Maddah*).
2. **Al-Halq (The Throat)**: 6 throat letters divided into lowest throat (**ء , هـ**), middle throat (**ع , ح**), and upper throat (**غ , خ**).
3. **Al-Lisaan (The Tongue)**: Originates 18 letters including **ق , ك , ض , ل , ن , ر**.
4. **Ash-Shafataan (The Lips)**: Produces **ب , م , و , ف**.
5. **Al-Khayshoom (The Nasal Cavity)**: The source of nasal humming (*Ghunnah*).

---

## 2. The 4 Golden Rules of Noon Sakinah & Tanween

Whenever a **Noon Sakin** (نْ) or **Tanween** (ـً ـٍ ـٌ) occurs, one of four rules must be applied:

### A. Izhar (Clear Pronunciation)
Recite the 'N' sound distinctly without extra nasalization when followed by any of the 6 throat letters: **ء , هـ , ع , ح , غ , خ**.
*Example*: مِنْ خَوْفٍ (*Min Khawf*).

### B. Idgham (Merging)
Merge the Noon Sakin into the following letter when it is one of the **YARMALOON** letters: **ي , ر , م , ل , و , ن**.
- **With Ghunnah (Yaa, Noon, Meem, Waw)**
- **Without Ghunnah (Laam, Raa)**

### C. Iqlab (Conversion)
Convert the Noon sound into a gentle **Meem (م)** with Ghunnah when followed by the letter **ب (Baa)**.
*Example*: مِن بَعْدِ (*Mim Ba'di*).

### D. Ikhfa (Concealment with Nasalization)
Conceal the Noon sound with a subtle 2-count nasal Ghunnah when followed by the remaining 15 letters of the Arabic alphabet.

---

## 3. How to Master Tajweed at Home

Learning Tajweed from books alone is insufficient because accurate pronunciation requires auditory modeling and real-time correction by an authorized teacher (*Talaqqi*).

If you want to recite with confidence and beauty, explore our **[Certified Quran with Tajweed Course](/courses)** or schedule a **[Free 1-on-1 Trial Class](/courses)**.`,
    status: 'published'
  },
  {
    id: 'art-3',
    slug: 'how-to-memorize-quran-fast',
    title: 'How to Memorize the Quran Fast: The 3-Pillar Daily Sabaq & Manzil System',
    category: 'Hifz',
    author: 'M Muddasir Hameed',
    readTime: '8 min read',
    publishedAt: 'January 2026',
    summary: 'Learn the proven Ottoman and Subcontinent Hifz methodology: Sabaq, Sabqi, and Manzil daily cycle for permanent Quranic memorization retention.',
    content: `# How to Memorize the Quran Fast (The 3-Pillar Daily System)

Memorizing the Holy Quran (*Hifz-ul-Quran*) is an immense spiritual honor. However, many students struggle not because of memory capacity, but because of an unstructured revision methodology.

Memorizing a new page is relatively easy; retaining 30 Paras without hesitation requires a systematic daily cycle.

---

## The 3-Pillar Hifz Methodology

### Pillar 1: Daily Sabaq (New Lesson)
- **Best Timing**: Immediately after *Fajr* prayer when mental clarity is peak.
- **Pacing**: Memorize 1 to 2 pages daily depending on your personal capacity.
- **Method**: Listen to a certified Qari recite the page 5 times, read the translation to understand the context, then memorize line-by-line repeating each Ayah 10 times.

### Pillar 2: Daily Sabqi (Recent Revision)
- Recite the last 5 to 10 pages memorized directly before submitting your new Sabaq.
- This bridges short-term memory into medium-term retention.

### Pillar 3: Daily Manzil (Long-Term Retention)
- Recite at least 1/2 to 1 full completed Juz on a continuous monthly loop.
- By adhering to this rhythm, every memorized verse is refreshed every 30 days.

---

## 4 Practical Tips for Rapid Quran Memorization

1. **Use One Standard Mushaf**: Stick to one single print edition (such as the 15-line Madani or 16-line South Asian script) so your visual photographic memory locks verse positions.
2. **Recite in Daily Prayers**: Recite newly memorized Surahs during *Sunnah* and *Tahajjud* prayers.
3. **Understand the Meaning**: Memorization speed doubles when you comprehend the narrative themes and stories within each Surah.
4. **Work with a Certified Hafiz Tutor**: Ongoing supervision ensures zero vowel slips (*Harkat* errors) occur during memorization.

Explore our dedicated **[Online Quran Memorization (Hifz) Program](/courses)** to learn with certified male and female Huffaz.`,
    status: 'published'
  },
  {
    id: 'art-4',
    slug: 'best-age-to-start-quran-learning',
    title: 'What Is the Best Age for Kids to Start Learning the Quran?',
    category: 'Kids',
    author: 'M Muddasir Hameed',
    readTime: '5 min read',
    publishedAt: 'January 2026',
    summary: 'A developmental analysis of when children should begin Noorani Qaida, Nazra reading, and Hifz memorization with age-appropriate milestones.',
    content: `# What Is the Best Age for Children to Start Learning the Quran?

One of the most frequent questions Muslim parents ask is: *"At what age should my child begin formal Quran classes?"*

While early exposure through auditory listening can begin in infancy, structured pedagogical learning aligns with natural childhood cognitive milestones.

---

## Developmental Age Milestones for Quran Learning

### 1. Ages 3 to 4: The Auditory Familiarity Phase
- Focus on listening to melodious Quran recitations at home and during car rides.
- Introduce oral repetition of *Bismillah*, *Ta'awwudh*, and short 3-verse Surahs (*Al-Ikhlas, Al-Falaq, An-Naas*).

### 2. Ages 4 to 6: The Noorani Qaida Foundation Phase
- Children are developmentally prepared for visual alphabet recognition and single-letter articulation points (*Makharij*).
- Sessions should be interactive, gamified, and capped at 25 minutes to match attention spans.

### 3. Ages 6 to 9: Fluent Nazra Reading & Intermediate Tajweed
- The ideal age for reading fluently directly from the Mushaf.
- Memory retention is high, making this the prime window for beginning partial or full **Hifz-ul-Quran**.

---

## Is It Ever Too Late to Start?
Never. Adults and revert Muslims frequently begin from Noorani Qaida and achieve fluent Quran recitation within months.

Find the ideal curriculum for your child by scheduling a **[Free 3-Day Trial Class](/courses)** today.`,
    status: 'published'
  },
  {
    id: 'art-5',
    slug: 'benefits-of-learning-quran-online',
    title: '7 Spiritual and Academic Benefits of Learning the Quran Online',
    category: 'Quran Learning',
    author: 'M Muddasir Hameed',
    readTime: '6 min read',
    publishedAt: 'December 2025',
    summary: 'Compare online 1-on-1 Quran classes with traditional crowded madrasas: personalized pace, verified Ijazah scholars, scheduling flexibility, and safety.',
    content: `# 7 Key Benefits of Learning the Quran Online for Muslim Families

Technological advancements have made high-quality Islamic education accessible to Muslim families worldwide, regardless of whether they reside in London, New York, Sydney, or Toronto.

---

## 1. 1-on-1 Dedicated Teacher Attention
Traditional group madrasas often have 15 to 20 students per teacher, meaning each child receives only 3 to 5 minutes of direct recitation time. Online 1-on-1 tuition ensures 100% focused supervision for the entire 30-minute session.

## 2. Access to Certified Male and Female Scholars
Families can choose accredited Ijazah holders and Al-Azhar graduates who speak fluent English and Urdu, providing comfortable instruction for sisters and young children.

## 3. Total Scheduling Flexibility
Classes can be scheduled 24/7 across any international timezone, easily fitting around school and work commitments.

## 4. Safe and Comfortable Learning at Home
Parents can sit beside their children, observe class progress directly, and eliminate stressful daily commutes in traffic.

## 5. Transparent Monthly Progress Reports
Receive monthly evaluation report cards detailing attendance, Tajweed accuracy, and Sabaq progress.

---

Join thousands of families worldwide. Start with our **[Risk-Free 3-Day Trial](/courses)** today.`,
    status: 'published'
  },
  {
    id: 'art-6',
    slug: 'common-tajweed-mistakes-and-how-to-fix-them',
    title: '10 Common Tajweed Mistakes in Quran Recitation & How to Correct Them',
    category: 'Tajweed',
    author: 'M Muddasir Hameed',
    readTime: '7 min read',
    publishedAt: 'December 2025',
    summary: 'An analytical review of the most frequent major (Lahn Jali) and minor (Lahn Khafi) pronunciation errors made during Quran reading and how to fix them.',
    content: `# 10 Common Tajweed Mistakes in Quran Recitation (And How to Fix Them)

In the science of Tajweed, mistakes in Quranic recitation are categorized into two types:
1. **Lahn Jali (Obvious Mistakes)**: Major errors that change Arabic words, grammar, or meanings (e.g. confusing letter sounds or swapping short vowels).
2. **Lahn Khafi (Hidden Mistakes)**: Minor errors that affect the beauty and rhythm of recitation (e.g. incorrect Ghunnah timing or improper Madd length).

---

## The Top 5 Most Frequent Mistakes

### 1. Confusing Similar Sounding Letters
- **ح (Haa - throat)** vs **هـ (Haa - chest)**
- **ع (Ayn - throat)** vs **ء (Hamzah - throat)**
- **ص (Saad - heavy)** vs **س (Seen - light)**
- **ط (Taa - heavy)** vs **ت (Taa - light)**

### 2. Missing Qalqalah (Echoing Bounce)
Failing to produce the distinct bounce on the 5 Qalqalah letters (**ق , ط , ب , ج , د**) when they carry a Sukoon (*Jazm*).

### 3. Stretching Short Vowels (Harakat)
Turning a simple *Fatha* into a prolonged *Alif*, or dropping a required 2-count *Madd Asli*.

### 4. Incorrect Raa (Heavy vs Light)
Reciting the letter **ر (Raa)** with a heavy sound (*Tafkheem*) when it carries a *Kasra* instead of light (*Tarqeeq*).

### 5. Inadequate Ghunnah Timing
Rushing through Noon Sakin and Meem Sakin without holding the 2-count nasal resonance.

---

## How to Fix Recitation Errors
The only verified method to rectify these errors is consistent 1-on-1 practice with a qualified Qari. 

Explore our **[Quran Reading & Tajweed Courses](/courses)** to receive personalized diagnostic assessments.`,
    status: 'published'
  }
];

export const INITIAL_RESOURCES: IslamicResource[] = [
  {
    id: 'res-1',
    title: 'Complete Noorani Qaida Color-Coded Guide',
    category: 'Qaida & Arabic',
    description: 'High-resolution guide of the authentic Noorani Qaida with color-coded Makharij and Tajweed rules for beginners.',
    fileSize: '4.8 MB',
    fileType: 'PDF',
    downloadUrl: '/resources/noorani-qaida-guide.html',
    featured: true
  },
  {
    id: 'res-2',
    title: 'Essential 40 Masnoon Daily Duas (with Meaning)',
    category: 'Daily Duas',
    description: 'Authentic daily supplications from Hisnul Muslim with Arabic text, phonetic transliteration, and English/Urdu translation.',
    fileSize: '2.3 MB',
    fileType: 'PDF',
    downloadUrl: '/resources/daily-masnoon-duas.html',
    featured: true
  },
  {
    id: 'res-3',
    title: 'Step-by-Step Illustrated Salah (Namaz) & Wudu Guide',
    category: 'Salah & Prayer',
    description: 'Clear visual postures for brothers and sisters, method of Wudu, and word-by-word prayer recitation meanings.',
    fileSize: '3.5 MB',
    fileType: 'PDF',
    downloadUrl: '/resources/daily-masnoon-duas.html',
    featured: true
  },
  {
    id: 'res-4',
    title: 'Tajweed Rules Summary & Makharij Chart',
    category: 'Tajweed Rules',
    description: 'A handy quick-reference cheat sheet covering Noon Sakin, Meem Sakin, Madd types, and Waqf stopping symbols.',
    fileSize: '1.9 MB',
    fileType: 'PDF',
    downloadUrl: '/resources/noorani-qaida-guide.html',
    featured: false
  },
  {
    id: 'res-5',
    title: 'Kids Quran Tracing & Arabic Letter Worksheets',
    category: 'Kids Worksheets',
    description: 'Fun printable activity sheets for children to practice Arabic alphabet handwriting and letter connections.',
    fileSize: '5.2 MB',
    fileType: 'Worksheet',
    downloadUrl: '/resources/noorani-qaida-guide.html',
    featured: false
  },
  {
    id: 'res-6',
    title: 'Hifz-ul-Quran Daily Sabaq & Manzil Tracker',
    category: 'Hifz Tracker',
    description: 'Printable monthly planner to log daily memorization verses, mistakes count, Sabqi revisions, and teacher signatures.',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    downloadUrl: '/resources/daily-masnoon-duas.html',
    featured: false
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Do you offer a free trial?',
    answer: 'Yes! We offer a full 3-Day Free Trial with zero payment or advance commitment. This allows parents and students to evaluate our teaching style, meet the tutor, and experience our 1-on-1 learning environment before making any decision.',
    category: 'Admissions',
    order: 1
  },
  {
    id: 'faq-2',
    question: 'Are classes one-to-one?',
    answer: 'Yes, all our classes are 100% one-to-one. The teacher focuses exclusively on one student throughout the session to ensure proper articulation of Makharij, immediate correction of recitation mistakes, and personalized progress.',
    category: 'Classes',
    order: 2
  },
  {
    id: 'faq-3',
    question: 'Are male and female teachers available?',
    answer: 'Yes. We have qualified and certified Male and Female Quran tutors available. Female tutors are dedicated for sisters, young girls, and children, while male teachers are available for boys and adult male students.',
    category: 'Faculty',
    order: 3
  },
  {
    id: 'faq-4',
    question: 'Do you teach children?',
    answer: 'Yes, we specialize in teaching children from 4 years and older. Our instructors are trained to be gentle, engaging, and patient, using interactive Noorani Qaida lessons and positive reinforcement.',
    category: 'Courses',
    order: 4
  },
  {
    id: 'faq-5',
    question: 'Do you teach adults?',
    answer: 'Yes, we have many adult learners—both brothers and sisters. Whether you are starting from zero Arabic or looking to polish your Tajweed, revise your Hifz, or learn Quran translation, we have tailored adult curriculum tracks.',
    category: 'Courses',
    order: 5
  },
  {
    id: 'faq-6',
    question: 'Are classes available internationally?',
    answer: 'Yes, our academy operates globally 24/7. We cater to students across the United Kingdom, United States, Canada, Australia, UAE, Saudi Arabia, Pakistan, and worldwide across all timezones.',
    category: 'Schedules',
    order: 6
  },
  {
    id: 'faq-7',
    question: 'How can I enroll?',
    answer: 'Simply click "Book Free Trial" or "Enroll Now" on the website and submit the short form. Our academy coordinator will reach out to you directly on WhatsApp (+92 327 4496163) to schedule your classes and answer any questions.',
    category: 'Admissions',
    order: 7
  },
  {
    id: 'faq-8',
    question: 'How will I receive my class schedule?',
    answer: 'Once your application or free trial is submitted, our coordinator will message you on WhatsApp to finalize convenient days and times that fit your family\'s routine, and provide your teacher\'s details and live classroom meeting link.',
    category: 'Schedules',
    order: 8
  }
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementBarText: 'Special Ramadan Admissions Open • 3-Day Risk-Free Trial • Flexible Timings for UK, USA, Canada & Global',
  announcementBarEnabled: true,
  announcementBadge: 'ADMISSIONS OPEN',
  heroHeadline: 'Learn Holy Quran Online with Certified Scholars',
  heroSubtitle: '1-on-1 interactive live sessions for kids, sisters, and adults worldwide. Master Tajweed, Noorani Qaida, Nazra, and Hifz from the comfort of home.',
  primaryWhatsApp: '+92 327 4496163',
  officialEmail: 'contact.noorequraninstitute@gmail.com',
  emergencyPhone: '+92 327 4496163',
  address: 'Global Online Operations (UK • USA • Canada • Australia • Gulf • Pakistan)',
  freeTrialDays: 3
};

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  { id: 'med-1', name: 'Hero Quran Learning Banner', category: 'banner', url: '/images/hero-quran-learning.webp', fileSize: '142 KB', uploadedAt: '2026-08-18' },
  { id: 'med-2', name: 'Kids Program Illustration Banner', category: 'banner', url: '/images/kids-program-banner.webp', fileSize: '118 KB', uploadedAt: '2026-08-18' },
  { id: 'med-3', name: 'Female Quran Program Banner', category: 'banner', url: '/images/female-program-banner.webp', fileSize: '124 KB', uploadedAt: '2026-08-18' },
  { id: 'med-4', name: 'Adults Quran Program Banner', category: 'banner', url: '/images/adults-program-banner.webp', fileSize: '136 KB', uploadedAt: '2026-08-18' },
  { id: 'med-5', name: 'Academy Logo & Seal (WebP)', category: 'icon', url: '/logo.webp', fileSize: '28 KB', uploadedAt: '2026-08-18' },
  { id: 'med-6', name: 'Noorani Qaida Course Graphic', category: 'course', url: '/images/course-noorani-qaida.webp', fileSize: '98 KB', uploadedAt: '2026-08-18' },
  { id: 'med-7', name: 'Nazra Quran Course Graphic', category: 'course', url: '/images/course-nazra-tajweed.webp', fileSize: '105 KB', uploadedAt: '2026-08-18' },
  { id: 'med-8', name: 'Hifz Memorization Graphic', category: 'course', url: '/images/course-hifz-memorization.webp', fileSize: '112 KB', uploadedAt: '2026-08-18' },
];

export const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Trial Inquiry Welcome (WhatsApp)',
    channel: 'whatsapp',
    availableVariables: ['{student_name}', '{parent_name}', '{course_name}', '{academy_name}', '{whatsapp}'],
    body: `Assalam-o-Alaikum {parent_name}! 🌙

Welcome to {academy_name}. We have received your request for a 3-Day Free Trial for {student_name} ({course_name}).

Our senior academic coordinator will connect with you shortly to confirm your preferred days and time slot.

If you have any questions, feel free to reply directly to this message.
JazakAllah Khair!`
  },
  {
    id: 'tpl-2',
    title: 'Tutor & Timetable Assigned (WhatsApp / Email)',
    channel: 'both',
    subject: 'Your 1-on-1 Quran Class Schedule & Scholar Assignment - Noor E Quran Institute',
    availableVariables: ['{student_name}', '{tutor_name}', '{course_name}', '{time_slot}', '{preferred_days}', '{meeting_link}'],
    body: `Assalam-o-Alaikum! 🌸

Great news! We have assigned your designated tutor for {student_name}:

🎓 Scholar: {tutor_name}
📖 Course: {course_name}
📅 Timetable: {preferred_days} @ {time_slot}
🔗 Live Classroom Link: {meeting_link}

Please join 2 minutes before class time with a stable internet connection. May Allah bless your Quranic journey!`
  },
  {
    id: 'tpl-3',
    title: 'Class Reminder (15 Mins Before)',
    channel: 'whatsapp',
    availableVariables: ['{student_name}', '{tutor_name}', '{meeting_link}'],
    body: `Assalam-o-Alaikum! ⏰

Reminder: {student_name}'s live 1-on-1 Quran lesson with {tutor_name} starts in 15 minutes!

👉 Click here to enter your Live Classroom: {meeting_link}

Have your Quran/Qaida ready!`
  },
  {
    id: 'tpl-4',
    title: 'Monthly Progress Report Card (WhatsApp / Email)',
    channel: 'both',
    subject: 'Monthly Quran Evaluation & Performance Report - Noor E Quran Institute',
    availableVariables: ['{student_name}', '{tutor_name}', '{current_sabaq}', '{reading_grade}', '{tajweed_grade}', '{teacher_remarks}'],
    body: `Assalam-o-Alaikum Respected Parents! 📜

Here is the monthly academic progress summary for {student_name}:

📖 Current Sabaq Milestone: {current_sabaq}
🌟 Tajweed Accuracy: {tajweed_grade}
🗣️ Reading Fluency: {reading_grade}
💬 Tutor's Remarks: "{teacher_remarks}"

Thank you for trusting Noor E Quran Institute with your child's Islamic education.`
  }
];

export const INITIAL_SEO_CONFIGS: PageSeoConfig[] = [
  {
    pagePath: '/',
    pageName: 'Homepage',
    metaTitle: 'Learn Quran Online | 1-on-1 Online Quran Classes for Kids & Adults',
    metaDescription: 'Learn Quran online with certified male & female tutors. 1-on-1 Tajweed, Hifz & Qaida classes for kids and adults. Book a free 3-day trial today!',
    keywords: ['online quran classes', 'learn quran online', 'female quran tutor', 'noor e quran institute', 'tajweed classes'],
    canonicalUrl: 'https://noorequraninstitute.me/'
  },
  {
    pagePath: '/courses',
    pageName: 'Courses & Curricula',
    metaTitle: 'Online Quran Courses: Qaida, Nazra, Tajweed & Hifz Programs',
    metaDescription: 'Explore online Quran courses: Noorani Qaida, Nazra, Tajweed & Hifz memorization with certified male & female tutors. 1-on-1 classes for kids & adults.',
    keywords: ['quran courses', 'noorani qaida course', 'hifz program online', 'tajweed course online'],
    canonicalUrl: 'https://noorequraninstitute.me/courses'
  },
  {
    pagePath: '/packages',
    pageName: 'Pricing & Packages',
    metaTitle: 'Online Quran Classes Pricing | Affordable Monthly Packages',
    metaDescription: 'Affordable monthly Quran class packages with family discounts, multi-currency support and flexible timings. Book a free 3-day trial today!',
    keywords: ['quran class fees', 'online quran packages', 'quran academy pricing', 'cheap quran tutor'],
    canonicalUrl: 'https://noorequraninstitute.me/packages'
  },
  {
    pagePath: '/teachers',
    pageName: 'Faculty & Tutors',
    metaTitle: 'Certified Online Quran Teachers | Male & Female Tutors',
    metaDescription: 'Meet certified male & female Quran teachers — qualified Huffaz and Ijazah holders with years of online teaching experience. Book a free trial class!',
    keywords: ['female quran teachers', 'certified quran tutor', 'online quran faculty', 'hafiz tutor'],
    canonicalUrl: 'https://noorequraninstitute.me/teachers'
  },
  {
    pagePath: '/blog',
    pageName: 'Blog & Islamic Guides',
    metaTitle: 'Quran Learning Blog | Tajweed, Hifz & Parenting Guides',
    metaDescription: 'Practical guides on Tajweed, Hifz memorization, teaching kids Quran and Islamic parenting — tips from certified Quran tutors for Muslim families.',
    keywords: ['quran blog', 'tajweed guide', 'how to teach quran to kids', 'quran memorization tips'],
    canonicalUrl: 'https://noorequraninstitute.me/blog'
  }
];

export const INITIAL_INVOICES: FeeInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'NQ-2026-081',
    studentId: 'stu-1',
    studentName: 'Zayd Al-Hashmi',
    parentName: 'Muhammad Hashmi',
    phone: '+44 7911 123456',
    courseName: 'Nazra Quran with Tajweed',
    packageName: 'Standard (3 Days / Wk)',
    amount: 35,
    currency: 'USD',
    billingMonth: 'August 2026',
    dueDate: '2026-08-10',
    paidDate: '2026-08-05',
    status: 'Paid',
    paymentMethod: 'Stripe / Card'
  },
  {
    id: 'inv-102',
    invoiceNumber: 'NQ-2026-082',
    studentId: 'stu-2',
    studentName: 'Amina Tariq',
    parentName: 'Tariq Mehmood',
    phone: '+1 416 555 0192',
    courseName: 'Noorani Qaida & Tajweed',
    packageName: 'Intensive (5 Days / Wk)',
    amount: 55,
    currency: 'USD',
    billingMonth: 'August 2026',
    dueDate: '2026-08-15',
    status: 'Pending',
    paymentMethod: 'PayPal'
  },
  {
    id: 'inv-103',
    invoiceNumber: 'NQ-2026-083',
    studentId: 'stu-3',
    studentName: 'Ibrahim Khan',
    parentName: 'Usman Khan',
    phone: '+92 300 1234567',
    courseName: 'Hifz-ul-Quran Memorization',
    packageName: 'Hifz Track (5 Days / Wk)',
    amount: 5500,
    currency: 'PKR',
    billingMonth: 'August 2026',
    dueDate: '2026-08-08',
    paidDate: '2026-08-07',
    status: 'Paid',
    paymentMethod: 'Bank Transfer'
  }
];

export const INITIAL_REPORT_CARDS: StudentReportCard[] = [
  {
    id: 'rep-1',
    studentId: 'stu-1',
    studentName: 'Zayd Al-Hashmi',
    courseName: 'Nazra Quran with Tajweed',
    tutorName: 'M Muddasir Hameed',
    evaluationMonth: 'August 2026',
    currentSabaq: 'Surah Al-Baqarah (Ayah 142)',
    readingGrade: 'A+',
    tajweedGrade: 'A',
    attendancePercentage: 96,
    teacherRemarks: 'MashaAllah, Zayd displays exceptional enthusiasm. Makharij of letters Kha (خ) and Ghayn (غ) have improved significantly this month.',
    generatedDate: '2026-08-18'
  },
  {
    id: 'rep-2',
    studentId: 'stu-2',
    studentName: 'Amina Tariq',
    courseName: 'Noorani Qaida & Tajweed',
    tutorName: 'M Muddasir Hameed',
    evaluationMonth: 'August 2026',
    currentSabaq: 'Lesson 8: Tanween Rules',
    readingGrade: 'A',
    tajweedGrade: 'A+',
    attendancePercentage: 100,
    teacherRemarks: 'Amina is very attentive and polite during lessons. She has mastered Noon Sakinah rules with perfect pronunciation.',
    generatedDate: '2026-08-19'
  }
];

export const INITIAL_PAYROLL: TutorPayroll[] = [];

export const INITIAL_LOGS: ActivityLog[] = [
  { id: 'log-1', timestamp: '2026-08-20 18:45', action: 'Assigned Scholar M Muddasir Hameed to Student Zayd Al-Hashmi', category: 'Student', user: 'Admin' },
  { id: 'log-2', timestamp: '2026-08-20 17:30', action: 'Approved Enrollment Application for Amina Tariq', category: 'Enrollment', user: 'Admin' },
  { id: 'log-3', timestamp: '2026-08-20 16:15', action: 'Generated Monthly Progress Report for Zayd Al-Hashmi', category: 'Student', user: 'Admin' },
  { id: 'log-4', timestamp: '2026-08-20 14:00', action: 'Updated Site Settings: Announcement Ticker text changed', category: 'Settings', user: 'Admin' },
  { id: 'log-5', timestamp: '2026-08-20 11:20', action: 'Generated Fee Invoice #NQ-2026-081 ($35 USD)', category: 'Finance', user: 'Admin' }
];
