// Tajweed rules library for the Classroom Studio.
// Concise, student-friendly explanations with examples.

export interface TajweedRule {
  id: string;
  title: string;
  arabicTitle: string;
  category: string;
  summary: string;
  details: string[];
  examples: { arabic: string; note: string }[];
}

export const TAJWEED_CATEGORIES = [
  'Noon Sakinah & Tanween',
  'Meem Sakinah',
  'Madd (Elongation)',
  'Qalqalah',
  'Heavy & Light Letters',
  'Waqf (Stopping)',
] as const;

export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: 'izhar',
    title: 'Izhar (Clear Pronunciation)',
    arabicTitle: 'الإظهار',
    category: 'Noon Sakinah & Tanween',
    summary: 'When Noon Sakinah or Tanween is followed by one of the 6 throat letters, pronounce the Noon clearly without any nasalization.',
    details: [
      'The 6 Izhar letters come from the throat: ء ه ع ح غ خ',
      'No ghunnah (nasal sound) is applied — the Noon is pronounced clearly.',
      'Applies both within a word and between two words.',
    ],
    examples: [
      { arabic: 'مِنْ خَيْرٍ', note: 'Noon before خ — clear, no nasalization' },
      { arabic: 'عَلِيمٌ حَكِيمٌ', note: 'Tanween before ح — clear pronunciation' },
    ],
  },
  {
    id: 'idgham',
    title: 'Idgham (Merging)',
    arabicTitle: 'الإدغام',
    category: 'Noon Sakinah & Tanween',
    summary: 'When Noon Sakinah or Tanween is followed by one of ي ر م ل و ن, the Noon merges into the next letter.',
    details: [
      'With ghunnah (nasalization): ي ن م و — hold the nasal sound for 2 counts.',
      'Without ghunnah: ل ر — merge crisply with no nasal sound.',
      'The Noon sound disappears completely into the following letter.',
    ],
    examples: [
      { arabic: 'مَن يَعْمَلْ', note: 'Noon + Ya — merge with 2-count nasalization' },
      { arabic: 'مِن رَّبِّهِمْ', note: 'Noon + Ra — merge with no nasalization' },
    ],
  },
  {
    id: 'iqlab',
    title: 'Iqlab (Conversion)',
    arabicTitle: 'الإقلاب',
    category: 'Noon Sakinah & Tanween',
    summary: 'When Noon Sakinah or Tanween is followed by ب, the Noon sound changes into a Meem sound with nasalization.',
    details: [
      'Only one letter causes Iqlab: ب',
      'Pronounce a light Meem with 2 counts of ghunnah.',
      'In the Uthmani script a small م is written above the Noon.',
    ],
    examples: [
      { arabic: 'مِن بَعْدِ', note: 'Noon + Ba — pronounced "mim ba‘d" with nasalization' },
      { arabic: 'سَمِيعٌ بَصِيرٌ', note: 'Tanween + Ba — converted to Meem sound' },
    ],
  },
  {
    id: 'ikhfa',
    title: 'Ikhfa (Concealment)',
    arabicTitle: 'الإخفاء',
    category: 'Noon Sakinah & Tanween',
    summary: 'When Noon Sakinah or Tanween is followed by any of the 15 Ikhfa letters, hide the Noon with a 2-count nasal sound.',
    details: [
      'The 15 letters: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
      'The tongue approaches the next letter’s articulation point without touching it.',
      'Keep 2 counts of ghunnah while transitioning smoothly.',
    ],
    examples: [
      { arabic: 'كُنتُمْ', note: 'Noon + Ta — concealed with nasalization' },
      { arabic: 'رِيحًا صَرْصَرًا', note: 'Tanween + Sad — hidden Noon sound' },
    ],
  },
  {
    id: 'meem-sakinah',
    title: 'Meem Sakinah Rules',
    arabicTitle: 'أحكام الميم الساكنة',
    category: 'Meem Sakinah',
    summary: 'A silent Meem has three rules depending on the letter that follows it.',
    details: [
      'Ikhfa Shafawi: Meem + ب — hide with 2-count nasalization (e.g. تَرْمِيهِم بِحِجَارَةٍ).',
      'Idgham Shafawi: Meem + م — merge the two Meems with nasalization (e.g. لَهُم مَّا).',
      'Izhar Shafawi: Meem + any other letter — pronounce clearly (e.g. أَلَمْ نَشْرَحْ).',
    ],
    examples: [
      { arabic: 'تَرْمِيهِم بِحِجَارَةٍ', note: 'Meem + Ba — Ikhfa Shafawi' },
      { arabic: 'أَلَمْ نَشْرَحْ لَكَ', note: 'Meem + Noon — Izhar Shafawi, clear' },
    ],
  },
  {
    id: 'madd-tabi',
    title: 'Madd Tabi‘i (Natural Elongation)',
    arabicTitle: 'المد الطبيعي',
    category: 'Madd (Elongation)',
    summary: 'The natural 2-count stretch on ا و ي when preceded by their matching vowel.',
    details: [
      'Alif after Fatha (بَا), Waw after Dammah (بُو), Ya after Kasrah (بِي).',
      'Always stretched exactly 2 counts (harakah).',
      'This is the foundation — every longer Madd builds on it.',
    ],
    examples: [
      { arabic: 'قَالَ', note: 'Alif after Fatha — 2 counts' },
      { arabic: 'يَقُولُ', note: 'Waw after Dammah — 2 counts' },
    ],
  },
  {
    id: 'madd-muttasil',
    title: 'Madd Wajib Muttasil & Jaiz Munfasil',
    arabicTitle: 'المد الواجب المتصل والجائز المنفصل',
    category: 'Madd (Elongation)',
    summary: 'When a Madd letter is followed by Hamzah: in the same word stretch 4–5 counts (Wajib); in the next word 2–5 counts (Jaiz).',
    details: [
      'Muttasil (connected): Madd + Hamzah in ONE word — e.g. السَّمَاء (4–5 counts).',
      'Munfasil (separated): Madd at end of a word, Hamzah starts the next — e.g. إِنَّا أَعْطَيْنَاكَ (2–5 counts).',
      'Longer than natural Madd to honor the Hamzah.',
    ],
    examples: [
      { arabic: 'السَّمَاءِ', note: 'Muttasil — 4 to 5 counts' },
      { arabic: 'يَا أَيُّهَا', note: 'Munfasil — 2 to 5 counts' },
    ],
  },
  {
    id: 'madd-lazim',
    title: 'Madd Lazim (Required Elongation)',
    arabicTitle: 'المد اللازم',
    category: 'Madd (Elongation)',
    summary: 'When a Madd letter is followed by a permanent sukoon: stretch a full 6 counts, always.',
    details: [
      'Kalimi Muthaqqal: with shaddah — e.g. الضَّالِّينَ (6 counts).',
      'Kalimi Mukhaffaf: with plain sukoon — e.g. آلْآنَ (6 counts).',
      'Harfi: in the disjointed opening letters — e.g. الٓمٓ (6 counts on Lam and Meem).',
    ],
    examples: [
      { arabic: 'وَلَا الضَّالِّينَ', note: 'Madd Lazim Kalimi — 6 counts' },
      { arabic: 'الٓمٓ', note: 'Harfi Madd — 6 counts' },
    ],
  },
  {
    id: 'qalqalah',
    title: 'Qalqalah (Echo Bounce)',
    arabicTitle: 'القلقلة',
    category: 'Qalqalah',
    summary: 'The 5 letters ق ط ب ج د bounce with a slight echo when they carry a sukoon.',
    details: [
      'Qalqalah letters: ق ط ب ج د (gathered in قُطْبُ جَدٍّ).',
      'Qalqalah Sughra: in the middle of a word — light bounce.',
      'Qalqalah Kubra: at a stop — stronger, clearer bounce.',
    ],
    examples: [
      { arabic: 'يَقْطَعُونَ', note: 'Qaf with sukoon mid-word — light bounce' },
      { arabic: 'الْفَلَقِ', note: 'Stopping on Qaf — strong bounce' },
    ],
  },
  {
    id: 'tafkheem-tarqeeq',
    title: 'Tafkheem & Tarqeeq (Heavy & Light)',
    arabicTitle: 'التفخيم والترقيق',
    category: 'Heavy & Light Letters',
    summary: 'Seven letters are always heavy (mouth fills with sound); the rest are light — except Ra, Lam and Alif which follow special rules.',
    details: [
      'Always heavy: خ ص ض غ ط ق ظ (gathered in خُصَّ ضَغْطٍ قِظْ).',
      'Ra is heavy with Fatha/Dammah, light with Kasrah.',
      'Lam in the word Allah is heavy after Fatha/Dammah, light after Kasrah.',
    ],
    examples: [
      { arabic: 'الصِّرَاطَ', note: 'Sad and Taa — full and heavy' },
      { arabic: 'بِسْمِ اللَّهِ', note: 'Lam in Allah after Kasrah — light' },
    ],
  },
  {
    id: 'waqf',
    title: 'Waqf (Rules of Stopping)',
    arabicTitle: 'الوقف والابتداء',
    category: 'Waqf (Stopping)',
    summary: 'Where and how to stop while reciting — and where stopping is forbidden.',
    details: [
      'م (Waqf Lazim): must stop here — continuing changes the meaning.',
      'ج (Waqf Jaiz): stopping is allowed and balanced.',
      'لا: do NOT stop here — the meaning is incomplete.',
      'When stopping on Tanween Fatha, pronounce it as a 2-count Alif (e.g. عَلِيمًا → عَلِيمَا).',
      'Never stop mid-word; always restart from a meaningful point (Ibtida).',
    ],
    examples: [
      { arabic: 'م', note: 'Compulsory stop sign in the mushaf' },
      { arabic: 'لا', note: 'Prohibited stop — keep reciting' },
    ],
  },
];
