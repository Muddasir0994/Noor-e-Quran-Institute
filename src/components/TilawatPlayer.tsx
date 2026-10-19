import { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, MusicNote, SpeakerHigh, SpeakerX } from '@phosphor-icons/react';

// Soft background Quran recitation (Tilawat) player.
// Browsers block autoplay with sound, so we attempt autoplay on load and
// fall back to a gentle "Play Tilawat" prompt that always works on tap.
const PLAYLIST = [
  { surah: 36, name: 'Surah Ya-Sin', nameAr: 'سورة يس' },
];

// Reciter: Mishary Rashid Alafasy (128kbps)
const audioUrl = (surah: number) =>
  `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surah}.mp3`;

export function TilawatPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.2); // soft by default ("dheemi awaaz")
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // ever played successfully
  const startedRef = useRef(false);

  // Attempt playback. The started latch is set ONLY on success, so a blocked
  // autoplay never dead-ends the prompt/toggle buttons.
  const tryPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio
      .play()
      .then(() => {
        setPlaying(true);
        setShowPrompt(false);
        setHasStarted(true);
        startedRef.current = true;
      })
      .catch(() => {
        // Autoplay blocked: invite a tap, but only if we've never played.
        if (!startedRef.current) setShowPrompt(true);
      });
  };
  const tryPlayRef = useRef(tryPlay);
  tryPlayRef.current = tryPlay;

  // Attempt autoplay; browsers will block it → wait for first interaction.
  // Interaction handlers always route through tryPlay, which stays live.
  useEffect(() => {
    const t = setTimeout(() => tryPlayRef.current(), 1200);
    const onFirstInteract = () => tryPlayRef.current();
    window.addEventListener('pointerdown', onFirstInteract, { once: true });
    window.addEventListener('scroll', onFirstInteract, { once: true });
    window.addEventListener('keydown', onFirstInteract, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('scroll', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
    };
  }, []);

  // Auto-advance playlist (loops the single track).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setTrackIdx((i) => (i + 1) % PLAYLIST.length);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && startedRef.current) {
      audio.src = audioUrl(PLAYLIST[trackIdx].surah);
      if (playing) audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      tryPlayRef.current();
    }
  };

  if (dismissed) return null;
  const track = PLAYLIST[trackIdx];

  return (
    <>
      <audio ref={audioRef} src={audioUrl(track.surah)} preload="none" />

      {/* Gentle prompt when autoplay was blocked — only before first play */}
      {showPrompt && !hasStarted && (
        <button
          onClick={() => tryPlayRef.current()}
          className="fixed bottom-24 right-4 z-[70] flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full bg-[#13263D] text-[#F5F0E6] shadow-xl border border-[#A47A46]/40 hover:bg-[#0C1A2E] transition-all animate-pulse"
          aria-label="Play Quran recitation"
        >
          <span className="w-8 h-8 rounded-full bg-[#A47A46] flex items-center justify-center">
            <Play className="w-4 h-4 text-[#13263D]" weight="fill" />
          </span>
          <span className="text-xs font-semibold">🎧 Play Tilawat</span>
        </button>
      )}

      {/* Mini player — persistent so pause never strands the user */}
      <div className="fixed bottom-4 right-4 z-[70] w-[270px] rounded-2xl bg-[#13263D]/95 backdrop-blur border border-[#A47A46]/40 shadow-2xl p-3.5 text-[#F5F0E6]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-full bg-[#A47A46]/20 flex items-center justify-center shrink-0">
              <MusicNote className="w-4 h-4 text-[#A47A46]" weight="fill" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold truncate">{track.name}</p>
              <p className="text-[10px] text-[#A47A46] font-arabic truncate" dir="rtl">{track.nameAr}</p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-white p-1" aria-label="Close player">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Equalizer bars animation */}
        <div className="flex items-end gap-[3px] h-5 mb-2.5 px-1" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-[#A47A46] ${playing ? 'animate-pulse' : 'opacity-40'}`}
              style={{ height: `${40 + ((i * 37) % 60)}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">Mishary Alafasy</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-[#A47A46] hover:bg-[#a68a52] flex items-center justify-center shrink-0"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="w-4 h-4 text-[#13263D]" weight="fill" /> : <Play className="w-4 h-4 text-[#13263D]" weight="fill" />}
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="text-gray-300 hover:text-white p-1"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <SpeakerX className="w-4 h-4" /> : <SpeakerHigh className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
            className="flex-1 accent-[#A47A46] h-1"
            aria-label="Volume"
          />
          {PLAYLIST.length > 1 && (
            <button
              onClick={() => setTrackIdx((i) => (i + 1) % PLAYLIST.length)}
              className="text-[10px] text-[#A47A46] hover:text-white font-semibold px-1"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
