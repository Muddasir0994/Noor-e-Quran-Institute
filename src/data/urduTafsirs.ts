// Urdu tafsir library for the Classroom Studio.
// Curated Ahle Sunnat (Sunni) tafsirs; links point to the publishers'
// official pages and the Internet Archive.

export interface UrduTafsir {
  id: string;
  title: string;
  arabicTitle: string;
  author: string;
  authorTitle: string;
  description: string;
  volumes: string;
  language: string;
  link: string;
  linkLabel: string;
  featured?: boolean;
}

export const URDU_TAFSIRS: UrduTafsir[] = [
  {
    id: 'sirat-ul-jinan',
    title: 'Sirat-ul-Jinan fi Tafsir al-Quran',
    arabicTitle: 'صراط الجنان فی تفسیر القرآن',
    author: 'Mufti Muhammad Qasim Attari',
    authorTitle: 'Dawate Islami',
    description:
      'The most detailed modern Sunni tafsir in Urdu — every ayah explained with translation (Kanz-ul-Irfan), background of revelation, word meanings, and practical lessons. Ideal for deep classroom study.',
    volumes: '10 Volumes',
    language: 'Urdu',
    link: 'https://play.google.com/store/apps/details?id=com.dawateislami.AlQuran.Translation',
    linkLabel: 'Official App (Urdu + English)',
    featured: true,
  },
  {
    id: 'khazain-ul-irfan',
    title: 'Khazain-ul-Irfan',
    arabicTitle: 'خزائن العرفان',
    author: 'Sadr-ul-Afazil Syed Naeem-ud-Din Muradabadi',
    authorTitle: 'Student of Imam Ahmed Raza Khan',
    description:
      'The classic concise tafsir written in the margins of Kanz-ul-Iman — trusted by Sunni ulama for over a century. Clear, authentic, and perfect for daily reading alongside the translation.',
    volumes: 'Complete in 1 Volume',
    language: 'Urdu',
    link: 'https://archive.org/details/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan',
    linkLabel: 'Read on Archive.org',
  },
  {
    id: 'noor-ul-irfan',
    title: 'Noor-ul-Irfan',
    arabicTitle: 'نور العرفان',
    author: 'Mufti Ahmed Yar Khan Naeemi',
    authorTitle: 'Renowned Sunni Scholar',
    description:
      'A beloved, easy-to-understand tafsir written in simple Urdu for ordinary readers — explains each ayah with love and clarity. Wonderful for students and new learners.',
    volumes: 'Complete',
    language: 'Urdu',
    link: 'https://archive.org/details/quran-pak-kanz-ul-imaan-tafseer-noor-ul-irfan',
    linkLabel: 'Read on Archive.org',
  },
  {
    id: 'zia-ul-quran',
    title: 'Zia-ul-Quran',
    arabicTitle: 'ضیاء القرآن',
    author: 'Pir Karam Shah Al-Azhari',
    authorTitle: 'Al-Azhar Graduate, Zia-ul-Quran Complex',
    description:
      'A scholarly yet readable 5-volume Sunni tafsir combining classical sources with modern context — respected across the Muslim world for its depth and balance.',
    volumes: '5 Volumes',
    language: 'Urdu',
    link: 'https://archive.org/details/TafsirZia-ul-quranUrdu',
    linkLabel: 'Read on Archive.org',
  },
];
