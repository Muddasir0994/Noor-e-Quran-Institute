import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QURAN_SURAH_LIST } from '../../data/quranSurahList';
import {
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
  SpeakerHigh,
  BookOpen,
  WarningCircle
} from '@phosphor-icons/react';

interface ReaderAyah {
  numberInSurah: number;
  globalNumber: number;
  arabic: string;
  english: string;
}

// Shared Quran Reader with ayah-by-ayah navigation, used by Teacher & Student portals.
export const QuranReader: React.FC = () => {
  const [surahNum, setSurahNum] = useState(1);
  const [ayahIdx, setAyahIdx] = useState(0); // 0-based index into ayahs
  const [ayahs, setAyahs] = useState<ReaderAyah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const cacheRef = useRef<Map<number, ReaderAyah[]>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const surahMeta = QURAN_SURAH_LIST.find(s => s.number === surahNum) ?? QURAN_SURAH_LIST[0];

  const loadSurah = useCallback(async (n: number) => {
    const cached = cacheRef.current.get(n);
    if (cached) {
      setAyahs(cached);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [arRes, enRes] = await Promise.all([
        fetch(`/api/quran/surah/${n}/quran-uthmani`),
        fetch(`/api/quran/surah/${n}/en.asad`)
      ]);
      if (!arRes.ok || !enRes.ok) throw new Error('fetch failed');
      const ar = await arRes.json();
      const en = await enRes.json();
      const arAyahs: any[] = ar?.data?.ayahs ?? [];
      const enAyahs: any[] = en?.data?.ayahs ?? [];
      const merged: ReaderAyah[] = arAyahs.map((a: any, i: number) => ({
        numberInSurah: a.numberInSurah,
        globalNumber: a.number,
        arabic: a.text,
        english: enAyahs[i]?.text ?? ''
      }));
      if (merged.length === 0) throw new Error('empty');
      cacheRef.current.set(n, merged);
      setAyahs(merged);
    } catch {
      setError('Could not load this Surah. Please check your connection and try again.');
      setAyahs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurah(surahNum);
  }, [surahNum, loadSurah]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
  }, []);

  const goToAyah = useCallback((idx: number) => {
    stopAudio();
    setAyahIdx(idx);
  }, [stopAudio]);

  const nextAyah = useCallback(() => {
    if (ayahIdx < ayahs.length - 1) {
      goToAyah(ayahIdx + 1);
    } else if (surahNum < 114) {
      setSurahNum(surahNum + 1);
      setAyahIdx(0);
      stopAudio();
    }
  }, [ayahIdx, ayahs.length, surahNum, goToAyah, stopAudio]);

  const prevAyah = useCallback(() => {
    if (ayahIdx > 0) {
      goToAyah(ayahIdx - 1);
    } else if (surahNum > 1) {
      const prev = surahNum - 1;
      const prevMeta = QURAN_SURAH_LIST.find(s => s.number === prev);
      setSurahNum(prev);
      setAyahIdx((prevMeta?.numberOfAyahs ?? 7) - 1);
      stopAudio();
    }
  }, [ayahIdx, surahNum, goToAyah, stopAudio]);

  const nextSurah = useCallback(() => {
    if (surahNum < 114) {
      stopAudio();
      setSurahNum(surahNum + 1);
      setAyahIdx(0);
    }
  }, [surahNum, stopAudio]);

  const prevSurah = useCallback(() => {
    if (surahNum > 1) {
      stopAudio();
      setSurahNum(surahNum - 1);
      setAyahIdx(0);
    }
  }, [surahNum, stopAudio]);

  // Keyboard: left/right arrows navigate ayahs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextAyah();
      else if (e.key === 'ArrowLeft') prevAyah();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextAyah, prevAyah]);

  // Stop audio on unmount
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  const [continuousPlay, setContinuousPlay] = useState(true);

  const playAudio = (idx?: number) => {
    const targetIdx = idx ?? ayahIdx;
    const ayah = ayahs[targetIdx];
    if (!ayah) return;
    stopAudio();
    setAyahIdx(targetIdx);
    const audio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.globalNumber}.mp3`);
    audioRef.current = audio;
    setPlaying(true);
    // Auto-advance to next ayah when current finishes (keeps audio + text in sync)
    audio.onended = () => {
      if (continuousPlay) {
        if (targetIdx < ayahs.length - 1) {
          playAudio(targetIdx + 1);
        } else if (surahNum < 114) {
          // Move to next surah, first ayah
          setSurahNum(surahNum + 1);
          // loadSurah will set ayahs; play first ayah once loaded
          setTimeout(() => playAudio(0), 1500);
        } else {
          setPlaying(false);
        }
      } else {
        setPlaying(false);
      }
    };
    audio.onerror = () => setPlaying(false);
    audio.play().catch(() => setPlaying(false));
  };

  const ayah = ayahs[ayahIdx];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[#D4A72C]" weight="duotone" />
          <h3 className="text-lg font-bold text-[#064E3B]">Quran Reader</h3>
        </div>

        {/* Surah selector */}
        <div className="mb-5">
          <label className="text-xs font-bold text-gray-700 block mb-1">Select Surah:</label>
          <select
            value={surahNum}
            onChange={(e) => { stopAudio(); setSurahNum(Number(e.target.value)); setAyahIdx(0); }}
            className="w-full text-sm font-semibold p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
          >
            {QURAN_SURAH_LIST.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishNameTranslation} ({s.name}) — {s.numberOfAyahs} ayahs
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center py-10 text-sm text-gray-500">Loading Surah...</div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center text-xs font-bold text-red-800 flex items-center justify-center gap-2">
            <WarningCircle className="w-4 h-4" weight="bold" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && ayah && (
          <div className="space-y-5">
            {/* Surah header */}
            <div className="text-center pb-4 border-b border-gray-100">
              <p className="text-2xl font-bold text-[#064E3B]" dir="rtl" lang="ar">{surahMeta.arabicName}</p>
              <p className="text-sm font-bold text-gray-700 mt-1">
                Surah {surahMeta.name} — {surahMeta.englishNameTranslation}
              </p>
              <p className="text-xs text-gray-500">
                Ayah {ayah.numberInSurah} of {ayahs.length}
              </p>
            </div>

            {/* Ayah display */}
            <div className="bg-[#F8F5EE] rounded-2xl border border-[#E8E0D1] p-6 space-y-4">
              <p dir="rtl" lang="ar" className="text-3xl leading-[2.2] text-right text-gray-900 font-[Amiri]">
                {ayah.arabic}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed border-t border-[#E8E0D1] pt-4">
                {ayah.english}
              </p>
            </div>

            {/* Audio */}
            <div className="flex justify-center">
              <button
                onClick={playing ? stopAudio : playAudio}
                className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-900 cursor-pointer"
              >
                <SpeakerHigh className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                <span>{playing ? 'Stop Recitation' : 'Play Recitation (Alafasy)'}</span>
              </button>
            </div>
            {/* Continuous play toggle */}
            <div className="flex justify-center">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={continuousPlay}
                  onChange={(e) => setContinuousPlay(e.target.checked)}
                  className="w-4 h-4 accent-[#064E3B]"
                />
                <span>🔄 Auto-play next ayah (continuous Tilawat)</span>
              </label>
            </div>

            {/* Ayah navigation */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={prevAyah}
                disabled={surahNum === 1 && ayahIdx === 0}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#064E3B] text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <CaretLeft className="w-4 h-4" weight="bold" />
                <span>Previous Ayah</span>
              </button>
              <button
                onClick={nextAyah}
                disabled={surahNum === 114 && ayahIdx === ayahs.length - 1}
                className="flex-1 py-3 rounded-xl bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <span>Next Ayah</span>
                <CaretRight className="w-4 h-4" weight="bold" />
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400">
              Tip: use ← → arrow keys to move between ayahs
            </p>

            {/* Surah navigation */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 mt-2">
              <button
                onClick={prevSurah}
                disabled={surahNum === 1}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <CaretDoubleLeft className="w-4 h-4" weight="bold" />
                <span>Previous Surah</span>
              </button>
              <button
                onClick={nextSurah}
                disabled={surahNum === 114}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <span>Next Surah</span>
                <CaretDoubleRight className="w-4 h-4" weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
