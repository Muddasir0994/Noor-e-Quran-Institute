import React, { useEffect, useRef, useState } from 'react';
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

export const HyperbeamDemoPage: React.FC = () => {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>(PRESET_SITES[0].url);
  const [state, setState] = useState<DemoState>('idle');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

  const startSession = async () => {
    setState('starting');
    setErrorMsg('');
    setCopied(false);
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
      setState('live');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not start the shared browser. Please try again.');
      setState('error');
    }
  };

  const endSession = async () => {
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
              <>
                <button
                  type="button"
                  onClick={endSession}
                  disabled={state === 'ending'}
                  className="inline-flex items-center gap-2 bg-red-800 text-white text-sm font-sans font-semibold px-6 py-3 rounded-lg hover:bg-red-900 transition-colors disabled:opacity-60"
                >
                  <Stop className="w-4 h-4" />
                  {state === 'ending' ? 'Ending...' : 'End Session'}
                </button>
                <button
                  type="button"
                  onClick={copySessionLink}
                  className="inline-flex items-center gap-2 border border-[#A47A46] text-[#13263D] text-sm font-sans font-semibold px-6 py-3 rounded-lg hover:bg-[#F5F0E6] transition-colors"
                >
                  <LinkSimple className="w-4 h-4" />
                  {copied ? 'Link copied' : 'Copy session link to invite a student'}
                </button>
              </>
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
        </div>

        {/* Live browser frame */}
        <div className="bg-[#0C1A2E] rounded-xl border border-[#A47A46]/25 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <span className="inline-flex items-center gap-2 text-xs font-sans text-[#E7DBC2]/80">
              <Monitor className="w-4 h-4 text-[#A47A46]" />
              {state === 'live' ? 'Shared browser is live. Click inside it to take control.' : 'Shared browser will appear here'}
            </span>
            {sessionId && (
              <span className="text-[11px] font-mono text-[#E7DBC2]/50 hidden sm:block">
                Session: {sessionId.slice(0, 8)}...
              </span>
            )}
          </div>
          {state === 'live' && embedUrl ? (
            <iframe
              ref={iframeRef}
              title="Hyperbeam shared browser"
              src={embedUrl}
              className="w-full h-[70vh] bg-black"
              allow="autoplay; microphone; camera; clipboard-read; clipboard-write; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="h-[320px] flex flex-col items-center justify-center gap-3 text-center px-6">
              <Users className="w-10 h-10 text-[#A47A46]" />
              <p className="text-sm font-sans text-[#E7DBC2]/80 max-w-md">
                Teacher and student join the same cloud browser, see the same page at the
                same moment, and can both click, scroll and type.
              </p>
            </div>
          )}
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
