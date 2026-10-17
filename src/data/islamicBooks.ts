// Islamic books library for the Classroom Studio.
// Curated for Quran academy students and parents; links point to stable,
// well-known sources.

export interface IslamicBook {
  id: string;
  title: string;
  arabicTitle?: string;
  author: string;
  category: 'Quran' | 'Tajweed' | 'Dua' | 'Hadith' | 'Seerah' | 'Kids';
  description: string;
  language: string;
  link: string;
  linkLabel: string;
}

export const BOOK_CATEGORIES = [
  'Quran',
  'Tajweed',
  'Dua',
  'Hadith',
  'Seerah',
  'Kids',
] as const;

export const ISLAMIC_BOOKS: IslamicBook[] = [
  {
    id: 'noble-quran',
    title: 'The Noble Quran',
    arabicTitle: 'القرآن الكريم',
    author: 'Translation by Dr. Muhsin Khan & Dr. Taqi-ud-Din Al-Hilali',
    category: 'Quran',
    description:
      'The complete English translation of the Holy Quran with Arabic text — ideal for understanding every ayah you memorize.',
    language: 'English + Arabic',
    link: 'https://quran.com',
    linkLabel: 'Read on Quran.com',
  },
  {
    id: 'tajweed-untangled',
    title: 'Tajweed Untangled',
    author: 'Yasmin Mussa',
    category: 'Tajweed',
    description:
      'A clear, beginner-friendly guide to Tajweed rules with diagrams and exercises — perfect companion to classroom lessons.',
    language: 'English',
    link: 'https://archive.org/details/tajweeduntangled',
    linkLabel: 'View on Archive.org',
  },
  {
    id: 'fortress-muslim',
    title: 'Fortress of the Muslim (Hisnul Muslim)',
    arabicTitle: 'حصن المسلم',
    author: "Sa'id bin Ali Al-Qahtani",
    category: 'Dua',
    description:
      'The most beloved collection of authentic daily duas — morning, evening, salah, and everyday situations. A must for every student.',
    language: 'English + Arabic',
    link: 'https://www.islamawareness.net/Dua/Fortress/',
    linkLabel: 'Read the Duas',
  },
  {
    id: 'forty-hadith',
    title: '40 Hadith of Imam An-Nawawi',
    arabicTitle: 'الأربعون النووية',
    author: 'Imam Yahya An-Nawawi',
    category: 'Hadith',
    description:
      'Forty foundational hadith every Muslim should know — short, powerful, and perfect for young learners to memorize.',
    language: 'English + Arabic',
    link: 'https://sunnah.com/nawawi40',
    linkLabel: 'Read on Sunnah.com',
  },
  {
    id: 'sealed-nectar',
    title: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
    arabicTitle: 'الرحيق المختوم',
    author: 'Safi-ur-Rahman Al-Mubarakpuri',
    category: 'Seerah',
    description:
      'The award-winning biography of Prophet Muhammad ﷺ — the story every Quran student should know alongside the revelation.',
    language: 'English',
    link: 'https://archive.org/details/ar-raheeq-al-makhtum-the-sealed-nectar',
    linkLabel: 'View on Archive.org',
  },
  {
    id: 'riyadh-saliheen',
    title: 'Riyadh-us-Saliheen (Gardens of the Righteous)',
    arabicTitle: 'رياض الصالحين',
    author: 'Imam Yahya An-Nawawi',
    category: 'Hadith',
    description:
      'A beautiful collection of hadith on good character, worship, and daily life — wonderful for family reading circles.',
    language: 'English + Arabic',
    link: 'https://sunnah.com/riyadussalihin',
    linkLabel: 'Read on Sunnah.com',
  },
  {
    id: 'bulugh-maram',
    title: 'Bulugh Al-Maram',
    arabicTitle: 'بلوغ المرام',
    author: 'Ibn Hajar Al-Asqalani',
    category: 'Hadith',
    description:
      'Hadith on Islamic jurisprudence and rulings — for advanced students learning the practical side of worship.',
    language: 'English + Arabic',
    link: 'https://sunnah.com/bulugh',
    linkLabel: 'Read on Sunnah.com',
  },
  {
    id: 'quran-kids-stories',
    title: 'Stories of the Prophets for Kids',
    author: 'Various (Darussalam)',
    category: 'Kids',
    description:
      'Illustrated, simple-language stories of the Prophets — a lovely way for young children to love the Quran’s stories.',
    language: 'English',
    link: 'https://archive.org/search?query=stories+of+the+prophets+kids+darussalam',
    linkLabel: 'Browse on Archive.org',
  },
];
