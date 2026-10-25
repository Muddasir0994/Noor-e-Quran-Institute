import React, { useEffect, useRef, useState } from 'react';
import { ChatsCircle, X, PaperPlaneRight, Copy, Check, ClipboardText, Trash } from '@phosphor-icons/react';

interface ChatMsg {
  id: number;
  name: string;
  text: string;
  ts: number;
  cid?: string;
}

type Room = 'code' | 'open';

/**
 * Temporary public group chat (no account needed), opened from the
 * footer "Public Chat" link. Two rooms:
 * - Open room: fully open, no code. Messages stay until cleared.
 * - Code room: shared 4-digit code. Session-only, a reload ends it.
 * Nothing is asked from the visitor: no name, no link, no sign-up.
 * Each session is auto-labelled (Guest AB12) so people can tell
 * each other apart.
 */
export const PublicChatBox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [pin, setPin] = useState('');
  const [activePin, setActivePin] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [hint, setHint] = useState('');

  const sessionStartRef = useRef<number>(0);
  const clientIdRef = useRef<string>(Math.random().toString(36).slice(2) + Date.now().toString(36));
  const guestRef = useRef<string>('Guest ' + Math.random().toString(36).slice(2, 6).toUpperCase());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      if (!sessionStartRef.current) sessionStartRef.current = Date.now();
      setOpen(true);
    };
    window.addEventListener('open-public-chat', handler);
    return () => window.removeEventListener('open-public-chat', handler);
  }, []);

  const fetchMessages = async (r: Room, code: string): Promise<ChatMsg[] | null> => {
    try {
      const since = r === 'open' ? 0 : sessionStartRef.current;
      const pinPart = r === 'code' ? `&pin=${encodeURIComponent(code)}` : '';
      const resp = await fetch(`/api/public-chat/messages?room=${r}&since=${since}${pinPart}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      return Array.isArray(data.messages) ? data.messages : [];
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!room || !open) return;
    const t = setInterval(async () => {
      const msgs = await fetchMessages(room, activePin);
      if (msgs) setMessages(msgs);
    }, 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, open, activePin]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, room]);

  const joinOpen = async () => {
    setError('');
    setJoining(true);
    const msgs = await fetchMessages('open', '');
    setJoining(false);
    if (!msgs) { setError('Could not open the chat. Please try again.'); return; }
    setMessages(msgs);
    setRoom('open');
  };

  const joinCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPin = pin.trim();
    if (!/^\d{4}$/.test(cleanPin)) { setError('Please enter the 4-digit chat code.'); return; }
    setJoining(true);
    const msgs = await fetchMessages('code', cleanPin);
    setJoining(false);
    if (!msgs) { setError('Wrong chat code. Please check and try again.'); return; }
    setActivePin(cleanPin);
    setMessages(msgs);
    setRoom('code');
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const r = await fetch('/api/public-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, pin: activePin, name: guestRef.current, text, cid: clientIdRef.current })
      });
      if (r.ok) {
        const data = await r.json();
        if (data.message) {
          setMessages(prev => (prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]));
        }
        setInput('');
      }
    } catch {
      // Next poll will resync.
    }
    setSending(false);
  };

  const clearChat = async () => {
    if (!room) return;
    if (!window.confirm('Clear all messages in this chat for everyone?')) return;
    try {
      await fetch('/api/public-chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, pin: activePin })
      });
      setMessages([]);
    } catch {
      // Poll will resync if the clear did not go through.
    }
  };

  const copyText = async (m: ChatMsg) => {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(cur => (cur === m.id ? null : cur)), 1500);
    } catch {
      setHint('Copy is blocked by the browser.');
      setTimeout(() => setHint(''), 3000);
    }
  };

  const pasteIntoInput = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setInput(prev => (prev + t).slice(0, 500));
    } catch {
      setHint('Paste is blocked here. You can still paste with Ctrl+V or long-press.');
      setTimeout(() => setHint(''), 3500);
    }
  };

  if (!open) return null;

  const subtitle = room === 'open'
    ? 'Open chat. Messages stay here until cleared.'
    : room === 'code'
      ? 'Code chat. It clears when you reload the page.'
      : 'Group chat. No account, no link needed.';

  return (
    <div className="fixed bottom-4 right-4 z-[10000] w-[min(92vw,380px)] h-[min(72vh,560px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[#A47A46]/50 bg-[#F5F0E6] font-sans">
      {/* Header */}
      <div className="bg-[#13263D] text-[#F5F0E6] px-4 py-3 flex items-center gap-2.5 shrink-0">
        <ChatsCircle className="w-5 h-5 text-[#A47A46]" weight="fill" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Public Chat{room ? (room === 'open' ? ' · Open' : ' · Code') : ''}</p>
          <p className="text-[10px] text-[#F5F0E6]/60 leading-tight">{subtitle}</p>
        </div>
        {room && (
          <button
            type="button"
            onClick={clearChat}
            aria-label="Clear chat"
            title="Clear chat for everyone"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!room ? (
        <div className="flex-1 flex flex-col justify-center px-5 py-6 gap-3 overflow-y-auto">
          <p className="text-xs text-[#13263D]/70 leading-relaxed">
            This is a group chat on our website. Choose how to enter. Nothing else is needed.
          </p>
          <button
            type="button"
            onClick={joinOpen}
            disabled={joining}
            className="w-full rounded-lg bg-[#13263D] text-[#F5F0E6] py-2.5 text-sm font-semibold hover:bg-[#1B3555] transition-colors disabled:opacity-60"
          >
            {joining ? 'Opening...' : 'Enter Open Chat'}
          </button>
          <p className="text-[10px] text-[#13263D]/50 text-center -mt-1">Fully open, no code. Messages stay until cleared.</p>
          <div className="flex items-center gap-3 py-1">
            <span className="flex-1 border-t border-[#A47A46]/30" />
            <span className="text-[10px] uppercase tracking-wider text-[#13263D]/40">or</span>
            <span className="flex-1 border-t border-[#A47A46]/30" />
          </div>
          <form onSubmit={joinCode} className="flex flex-col gap-3">
            <input
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4-digit chat code"
              inputMode="numeric"
              maxLength={4}
              className="w-full rounded-lg border border-[#A47A46]/40 bg-white px-3 py-2.5 text-sm text-[#13263D] outline-none focus:border-[#A47A46] tracking-[0.3em]"
            />
            <button
              type="submit"
              disabled={joining}
              className="w-full rounded-lg border-2 border-[#13263D] text-[#13263D] py-2 text-sm font-semibold hover:bg-[#13263D] hover:text-[#F5F0E6] transition-colors disabled:opacity-60"
            >
              Join with Code
            </button>
            <p className="text-[10px] text-[#13263D]/50 text-center -mt-1">Code chat is temporary and clears on reload.</p>
          </form>
          {error && <p className="text-xs text-red-700 text-center">{error}</p>}
        </div>
      ) : (
        <>
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.length === 0 && (
              <p className="text-center text-xs text-[#13263D]/50 pt-8">
                No messages yet. Say salaam and start the chat.
              </p>
            )}
            {messages.map(m => {
              const own = m.cid && m.cid === clientIdRef.current;
              return (
                <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[80%] rounded-xl px-3 py-2 ${own ? 'bg-[#13263D] text-[#F5F0E6]' : 'bg-white border border-[#A47A46]/25 text-[#13263D]'}`}>
                    {!own && <p className="text-[10px] font-bold text-[#A47A46] mb-0.5">{m.name}</p>}
                    <p className="text-[13px] leading-snug whitespace-pre-wrap break-words pr-5">{m.text}</p>
                    <button
                      type="button"
                      onClick={() => copyText(m)}
                      aria-label="Copy message"
                      title="Copy"
                      className={`absolute top-1.5 right-1.5 ${own ? 'text-[#F5F0E6]/60 hover:text-[#F5F0E6]' : 'text-[#13263D]/40 hover:text-[#13263D]'}`}
                    >
                      {copiedId === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <p className={`text-[9px] mt-1 text-right ${own ? 'text-[#F5F0E6]/50' : 'text-[#13263D]/40'}`}>
                      {new Date(m.ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {hint && <p className="px-3 py-1 text-[10px] text-[#8F683A] bg-[#F5F0E6] border-t border-[#A47A46]/20">{hint}</p>}
          <form onSubmit={send} className="shrink-0 border-t border-[#A47A46]/25 bg-white px-2.5 py-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={pasteIntoInput}
              aria-label="Paste from clipboard"
              title="Paste from clipboard"
              className="w-9 h-9 rounded-full border border-[#A47A46]/40 text-[#A47A46] flex items-center justify-center hover:bg-[#F5F0E6] transition-colors shrink-0"
            >
              <ClipboardText className="w-4 h-4" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 rounded-full border border-[#A47A46]/40 px-3.5 py-2 text-sm text-[#13263D] outline-none focus:border-[#A47A46]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-full bg-[#A47A46] text-white flex items-center justify-center hover:bg-[#8F683A] transition-colors disabled:opacity-50 shrink-0"
            >
              <PaperPlaneRight className="w-4 h-4" weight="fill" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
