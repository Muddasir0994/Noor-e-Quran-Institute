import React, { useCallback, useEffect, useRef, useState } from 'react';
import Hyperbeam, { type HyperbeamEmbed } from '@hyperbeam/web';
import {
  Monitor,
  Users,
  Play,
  Stop,
  LinkSimple,
  Globe,
  CheckCircle,
  WarningCircle,
  BookOpen,
  VideoCamera,
  CursorClick,
  ArrowLeft,
  ArrowRight,
  ArrowClockwise,
  Plus,
  CornersOut,
  CornersIn,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  SpeakerHigh,
  Pause,
  ClipboardText,
  Files,
} from '@phosphor-icons/react';

interface PresetSite {
  name: string;
  url: string;
  note: string;
}

const PRESET_SITES: PresetSite[] = [
  { name: 'Quran.com', url: 'https://quran.com', note: 'Read the Quran together, ayah by ayah' },
  { name: 'Sunnah.com', url: 'https://sunnah.com', note: 'Open a hadith collection during the lesson' },
  { name: 'Our Classroom', url: 'https://noorequraninstitute.me/classroom', note: 'Jump into the Classroom Studio library' },
  { name: 'YouTube', url: 'https://www.youtube.com', note: 'Watch a recitation or lesson video in sync' },
];

type DemoState = 'idle' | 'starting' | 'live' | 'ending' | 'not-configured' | 'error';

function normalizeAddress(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export const HyperbeamDemoPage: React.FC = () => {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>(PRESET_SITES[0].url);
  const [state, setState] = useState<DemoState>('idle');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [sdkFailed, setSdkFailed] = useState<boolean>(false);
  const [connState, setConnState] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [paused, setPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [endedNote, setEndedNote] = useState<string>('');

  const stageRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hbRef = useRef<HyperbeamEmbed | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/hyperbeam/status')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setConfigured(!!data?.configured);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    return () => {
      try {
        hbRef.current?.destroy();
      } catch {
        // ignore cleanup errors
      }
      hbRef.current = null;
    };
  }, []);

  const fitResize = useCallback(async () => {
    const hb = hbRef.current;
    const stage = stageRef.current;
    if (!hb || !stage) return;
    try {
      const rect = stage.getBoundingClientRect();
      let w = Math.max(320, Math.floor(rect.width));
      let h = Math.max(240, Math.floor(rect.height));
      const area = w * h;
      if (hb.maxArea && area > hb.maxArea) {
        const scale = Math.sqrt(hb.maxArea / area);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
      }
      if (Math.abs(w - hb.width) > 8 || Math.abs(h - hb.height) > 8) {
        await hb.resize(w, h);
      }
    } catch {
      // Resizing is a nicety, never let it break the session view.
    }
  }, []);

  const initSdk = useCallback(
    async (url: string) => {
      const container = containerRef.current;
      if (!container) return;
      try {
        const hb = await Hyperbeam(container, url, {
          volume: 1,
          onConnectionStateChange: (e) => setConnState(e.state),
          onDisconnect: (e) => {
            setEndedNote(
              e.type === 'inactive'
                ? 'The session ended because nobody used it for a while. Start a new one any time.'
                : 'The shared browser session has ended. Start a new one any time.'
            );
            setState('idle');
            setEmbedUrl('');
            setSessionId('');
            hbRef.current = null;
          },
        });
        hbRef.current = hb;
        setSdkFailed(false);
        try {
          const tabs = await hb.tabs.query({ active: true });
          if (tabs && tabs[0]?.url) setAddress(tabs[0].url);
          const z = await hb.tabs.getZoom();
          if (typeof z === 'number' && z > 0) setZoom(z);
        } catch {
          // Tab info is optional at startup.
        }
        try {
          hb.tabs.onUpdated.addListener((_tabId, changeInfo) => {
            if (changeInfo?.url) setAddress(changeInfo.url);
          });
        } catch {
          // Listener is optional.
        }
        setTimeout(() => {
          void fitResize();
        }, 600);
      } catch {
        // SDK could not load (for example a strict browser setting).
        // Fall back to the plain embed so the demo still works.
        setSdkFailed(true);
      }
    },
    [fitResize]
  );

  useEffect(() => {
    if (state === 'live' && embedUrl && containerRef.current && !hbRef.current && !sdkFailed) {
      void initSdk(embedUrl);
    }
  }, [state, embedUrl, initSdk, sdkFailed]);

  useEffect(() => {
    if (state !== 'live') return;
    const onResize = () => {
      void fitResize();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [state, fitResize]);

  const startSession = async () => {
    setState('starting');
    setErrorMsg('');
    setEndedNote('');
    setCopied(false);
    setSdkFailed(false);
    try {
      const res = await fetch('/api/hyperbeam/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_url: selectedUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503 || data?.configured === false) {
        setConfigured(false);
        setState('not-configured');
        return;
      }
      if (!res.ok || !data?.embed_url) {
        throw new Error(data?.error || 'Could not start the shared browser. Please try again.');
      }
      setEmbedUrl(data.embed_url);
      setSessionId(data.session_id || '');
      setAddress(selectedUrl);
      setState('live');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not start the shared browser. Please try again.');
      setState('error');
    }
  };

  const endSession = async () => {
    try {
      hbRef.current?.destroy();
    } catch {
      // ignore
    }
    hbRef.current = null;
    if (!sessionId) {
      setEmbedUrl('');
      setState('idle');
      return;
    }
    setState('ending');
    try {
      await fetch(`/api/hyperbeam/session/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
    } catch {
      // The session also ends on its own timeout, so a failed stop call is not fatal.
    }
    setEmbedUrl('');
    setSessionId('');
    setConnState('');
    setState('idle');
  };

  const copySessionLink = async () => {
    try {
      await navigator.clipboard.writeText(embedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (wrapperRef.current) {
        await wrapperRef.current.requestFullscreen();
        setTimeout(() => {
          void fitResize();
        }, 500);
      }
    } catch {
      // Fullscreen can be blocked by the browser, the normal view still works.
    }
  };

  const activeTabId = async (): Promise<number | undefined> => {
    const hb = hbRef.current;
    if (!hb) return undefined;
    try {
      const tabs = await hb.tabs.query({ active: true });
      return tabs && tabs[0] ? tabs[0].id : undefined;
    } catch {
      return undefined;
    }
  };

  const goToAddress = async () => {
    const hb = hbRef.current;
    const target = normalizeAddress(address);
    if (!hb || !target) return;
    try {
      const id = await activeTabId();
      if (id) {
        await hb.tabs.update(id, { url: target });
      } else {
        await hb.tabs.create({ url: target, active: true });
      }
      setAddress(target);
    } catch {
      // Navigation errors are shown by the shared browser itself.
    }
  };

  const changeZoom = async (delta: number) => {
    const hb = hbRef.current;
    if (!hb) return;
    try {
      const id = await activeTabId();
      const current = await hb.tabs.getZoom(id);
      const next = Math.min(3, Math.max(0.5, Math.round((current + delta) * 100) / 100));
      await hb.tabs.setZoom(id, next);
      setZoom(next);
    } catch {
      // Zoom is optional.
    }
  };

  const changeVolume = (value: number) => {
    setVolume(value);
    const hb = hbRef.current;
    if (hb) {
      try {
        hb.volume = value;
      } catch {
        // ignore
      }
    }
  };

  const togglePaused = () => {
    const hb = hbRef.current;
    const next = !paused;
    setPaused(next);
    if (hb) {
      try {
        hb.videoPaused = next;
      } catch {
        // ignore
      }
    }
  };

  const toolbarBtn =
    'inline-flex items-center gap-1.5 text-xs font-sans font-semibold px-3 py-2 rounded-md border border-white/15 text-[#E7DBC2] hover:bg-white/10 transition-colors disabled:opacity-50';

  return (
    <div className="bg-[#FAF7F0] min-h-screen">
      {/* Page Header */}
      <div className="bg-[#13263D] text-[#F5F0E6] py-14 px-4 sm:px-6 lg:px-8 border-b border-[#A47A46]/20">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest">
            Classroom Technology Demo
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E6] font-semibold">
            Learn Together in One Shared Browser
          </h1>
          <p className="text-sm sm:text-base text-[#E7DBC2]/80 max-w-2xl mx-auto font-sans">
            This demo uses Hyperbeam to open one cloud browser that a teacher and a student
            can see and control at the same time. No screen sharing, no personal device exposed.
          </p>
          <div className="pt-2">
            {configured === null ? (
              <span className="inline-flex items-center gap-2 text-xs font-sans px-3 py-1.5 rounded-full border border-[#A47A46]/40 text-[#E7DBC2]/80">
                <Globe className="w-4 h-4" /> Checking connection status
              </span>
            ) : configured ? (
              <span className="inline-flex items-center gap-2 text-xs font-sans px-3 py-1.5 rounded-full border border-emerald-400/40 text-emerald-300">
                <CheckCircle className="w-4 h-4" /> Hyperbeam connected, demo is live
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-sans px-3 py-1.5 rounded-full border border-amber-400/40 text-amber-300">
                <WarningCircle className="w-4 h-4" /> Demo page ready, Hyperbeam account connection pending
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Controls */}
        <div className="bg-white rounded-xl border border-[#A47A46]/25 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#A47A46]" />
            <h2 className="font-editorial text-xl text-[#13263D] font-semibold">
              1. Pick a lesson page
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_SITES.map((site) => {
              const active = selectedUrl === site.url;
              return (
                <button
                  key={site.url}
                  type="button"
                  disabled={state === 'live' || state === 'starting'}
                  onClick={() => setSelectedUrl(site.url)}
                  className={`text-left rounded-lg border p-4 transition-colors disabled:opacity-60 ${
                    active
                      ? 'border-[#A47A46] bg-[#F5F0E6]'
                      : 'border-[#13263D]/15 bg-white hover:border-[#A47A46]/60'
                  }`}
                >
                  <span className="block text-sm font-sans font-bold text-[#13263D]">{site.name}</span>
                  <span className="block text-xs font-sans text-[#13263D]/60 mt-1">{site.note}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {state !== 'live' ? (
              <button
                type="button"
                onClick={startSession}
                disabled={state === 'starting'}
                className="inline-flex items-center gap-2 bg-[#13263D] text-[#F5F0E6] text-sm font-sans font-semibold px-6 py-3 rounded-lg hover:bg-[#0C1A2E] transition-colors disabled:opacity-60"
              >
                <Play className="w-4 h-4" />
                {state === 'starting' ? 'Starting shared browser...' : '2. Start Shared Browser'}
              </button>
            ) : (
              <button
                type="button"
                onClick={copySessionLink}
                className="inline-flex items-center gap-2 border border-[#A47A46] text-[#13263D] text-sm font-sans font-semibold px-6 py-3 rounded-lg hover:bg-[#F5F0E6] transition-colors"
              >
                <LinkSimple className="w-4 h-4" />
                {copied ? 'Link copied' : 'Copy session link to invite a student'}
              </button>
            )}
            <p className="text-xs font-sans text-[#13263D]/60">
              Sessions end automatically after 60 minutes, or after 15 minutes with no activity.
            </p>
          </div>

          {state === 'not-configured' && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-sans text-amber-900">
              The demo page is built and ready. One step is left: connect the Hyperbeam account
              by adding the <span className="font-mono font-semibold">HYPERBEAM_API_KEY</span> in
              the Render dashboard. As soon as that key is saved, this button will start a live
              shared browser with no code change.
            </div>
          )}
          {state === 'error' && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-sans text-red-900">
              {errorMsg}
            </div>
          )}
          {endedNote && state === 'idle' && (
            <div className="rounded-lg border border-[#A47A46]/40 bg-[#F5F0E6] p-4 text-sm font-sans text-[#13263D]">
              {endedNote}
            </div>
          )}
        </div>

        {/* Live browser with full toolbar */}
        <div
          ref={wrapperRef}
          className="bg-[#0C1A2E] rounded-xl border border-[#A47A46]/25 shadow-sm overflow-hidden flex flex-col fullscreen:bg-black"
          style={isFullscreen ? { height: '100%', borderRadius: 0 } : undefined}
        >
          {/* Toolbar row 1 */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-white/10">
            <span className="inline-flex items-center gap-2 text-xs font-sans text-[#E7DBC2]/80 mr-1">
              <Monitor className="w-4 h-4 text-[#A47A46]" />
              {state === 'live'
                ? connState === 'playing'
                  ? 'Live, click inside to take control'
                  : connState
                    ? `Connecting: ${connState}`
                    : 'Shared browser is live'
                : 'Shared browser will appear here'}
            </span>
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <button type="button" className={toolbarBtn} disabled={state !== 'live' || sdkFailed} onClick={() => void hbRef.current?.tabs.goBack()}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" className={toolbarBtn} disabled={state !== 'live' || sdkFailed} onClick={() => void hbRef.current?.tabs.goForward()}>
                <ArrowRight className="w-4 h-4" /> Forward
              </button>
              <button type="button" className={toolbarBtn} disabled={state !== 'live' || sdkFailed} onClick={() => void hbRef.current?.tabs.reload()}>
                <ArrowClockwise className="w-4 h-4" /> Reload
              </button>
              <button
                type="button"
                className={toolbarBtn}
                disabled={state !== 'live' || sdkFailed}
                onClick={() => void hbRef.current?.tabs.create({ url: 'https://quran.com', active: true })}
              >
                <Plus className="w-4 h-4" /> New Tab
              </button>
              <button type="button" className={toolbarBtn} disabled={state !== 'live'} onClick={togglePaused}>
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button type="button" className={toolbarBtn} onClick={() => void toggleFullscreen()}>
                {isFullscreen ? <CornersIn className="w-4 h-4" /> : <CornersOut className="w-4 h-4" />}
                {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              </button>
              {state === 'live' && (
                <button
                  type="button"
                  onClick={endSession}
                  disabled={state === 'ending'}
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold px-3 py-2 rounded-md bg-red-800 text-white hover:bg-red-900 transition-colors disabled:opacity-50"
                >
                  <Stop className="w-4 h-4" /> End Session
                </button>
              )}
            </div>
          </div>

          {/* Toolbar row 2: address, zoom, volume */}
          {state === 'live' && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void goToAddress();
                    }
                  }}
                  placeholder="Type any website address and press Enter"
                  className="flex-1 bg-white/10 border border-white/15 rounded-md px-3 py-2 text-xs font-sans text-[#F5F0E6] placeholder:text-[#E7DBC2]/40 outline-none focus:border-[#A47A46]"
                />
                <button type="button" className={toolbarBtn} disabled={sdkFailed} onClick={() => void goToAddress()}>
                  Go
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" className={toolbarBtn} disabled={sdkFailed} onClick={() => void changeZoom(-0.25)} aria-label="Zoom out">
                  <MagnifyingGlassMinus className="w-4 h-4" />
                </button>
                <span className="text-xs font-sans text-[#E7DBC2]/80 w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button type="button" className={toolbarBtn} disabled={sdkFailed} onClick={() => void changeZoom(0.25)} aria-label="Zoom in">
                  <MagnifyingGlassPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <SpeakerHigh className="w-4 h-4 text-[#A47A46]" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-24 accent-[#A47A46]"
                  aria-label="Volume"
                />
              </div>
              <button type="button" className={toolbarBtn} disabled={sdkFailed} onClick={() => hbRef.current?.reconnect()}>
                Reconnect
              </button>
              {sessionId && (
                <span className="text-[11px] font-mono text-[#E7DBC2]/50 hidden lg:block">
                  Session: {sessionId.slice(0, 8)}...
                </span>
              )}
            </div>
          )}

          {/* Stage */}
          <div ref={stageRef} className={`relative bg-black ${isFullscreen ? 'flex-1' : 'h-[70vh]'}`}>
            {state === 'live' && embedUrl ? (
              sdkFailed ? (
                <iframe
                  title="Hyperbeam shared browser"
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full bg-black"
                  allow="autoplay; microphone; camera; clipboard-read; clipboard-write; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div ref={containerRef} className="absolute inset-0 w-full h-full" />
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                <Users className="w-10 h-10 text-[#A47A46]" />
                <p className="text-sm font-sans text-[#E7DBC2]/80 max-w-md">
                  Teacher and student join the same cloud browser, see the same page at the
                  same moment, and can both click, scroll and type.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Copy paste and pro features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#A47A46]/20 p-5 space-y-2">
            <ClipboardText className="w-6 h-6 text-[#A47A46]" />
            <h3 className="font-editorial text-lg text-[#13263D] font-semibold">Copy and paste works both ways</h3>
            <p className="text-sm font-sans text-[#13263D]/70">
              Copy any text inside the shared browser with Ctrl+C and it lands on your own
              device. Paste your own text into the shared browser with Ctrl+V. If the browser
              asks for clipboard permission, choose Allow once and it keeps working.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#A47A46]/20 p-5 space-y-2">
            <CornersOut className="w-6 h-6 text-[#A47A46]" />
            <h3 className="font-editorial text-lg text-[#13263D] font-semibold">Full screen, HD and zoom</h3>
            <p className="text-sm font-sans text-[#13263D]/70">
              Press Full Screen for a cinema size lesson view. The browser runs in HD with
              sharp text mode for Quran pages, and the zoom buttons make small text easy to
              read for young students.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#A47A46]/20 p-5 space-y-2">
            <Files className="w-6 h-6 text-[#A47A46]" />
            <h3 className="font-editorial text-lg text-[#13263D] font-semibold">Files, tabs and every cursor visible</h3>
            <p className="text-sm font-sans text-[#13263D]/70">
              Upload a worksheet into the shared browser, download notes from it, open as
              many tabs as the lesson needs, and see where every participant is pointing
              with live cursors.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#A47A46]/20 p-5 space-y-2">
            <Globe className="w-6 h-6 text-[#A47A46]" />
            <h3 className="font-editorial text-lg text-[#13263D] font-semibold">A browser in the cloud</h3>
            <p className="text-sm font-sans text-[#13263D]/70">
              The browser runs on Hyperbeam servers, not on the teacher device. Personal
              files, tabs and passwords never leave the teacher computer.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#A47A46]/20 p-5 space-y-2">
            <CursorClick className="w-6 h-6 text-[#A47A46]" />
            <h3 className="font-editorial text-lg text-[#13263D] font-semibold">Everyone can take control</h3>
            <p className="text-sm font-sans text-[#13263D]/70">
              A student can point to the exact ayah they are reading, turn the page, or
              type an answer, while the teacher watches the same screen in real time.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#A47A46]/20 p-5 space-y-2">
            <VideoCamera className="w-6 h-6 text-[#A47A46]" />
            <h3 className="font-editorial text-lg text-[#13263D] font-semibold">Made for live lessons</h3>
            <p className="text-sm font-sans text-[#13263D]/70">
              Audio and video stay in sync for every participant, so a recitation video or
              a Tajweed lesson plays at the same second for the whole class.
            </p>
          </div>
        </div>

        <p className="text-xs font-sans text-[#13263D]/50 text-center pb-4">
          Demo powered by the Hyperbeam API. Free plan includes 10,000 participant minutes
          every month, which covers roughly 166 half hour one-to-one lessons.
        </p>
      </div>
    </div>
  );
};

export default HyperbeamDemoPage;
