import React, { useEffect, useRef, useState } from 'react';
import { ChatsCircle, X, PaperPlaneRight } from '@phosphor-icons/react';

interface ChatMsg {
  id: number;
  name: string;
  text: string;
  ts: number;
  cid?: string;
}

/**
 * Temporary public chat box (no account needed).
 * Opens from the footer "Public Chat" link. A shared 4-digit code
 * gates entry. The chat is session-only: it starts empty on every
 * page load and a reload ends the session. Nothing is stored in
 * the browser; messages live only in server memory.
 */
export const PublicChatBox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [pin, setPin] = useState('');
  const [activePin, setActivePin] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const sessionStartRef = useRef<number>(0);
  const clientIdRef = useRef<string>(Math.random().toString(36).slice(2) + Date.now().toString(36));
  // No name is asked: each session is auto-labelled (Guest AB12) so
  // people can still tell each other apart inside the group chat.
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

  const fetchMessages = async (code: string) => {
    try {
      const r = await fetch(`/api/public-chat/messages?pin=${encodeURIComponent(code)}&since=${sessionStartRef.current}`);
      if (!r.ok) return false;
      const data = await r.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!joined || !open) return;
    const t = setInterval(() => { fetchMessages(activePin); }, 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, open, activePin]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, joined]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPin = pin.trim();
    if (!/^\d{4}$/.test(cleanPin)) { setError('Please enter the 4-digit chat code.'); return; }
    setJoining(true);
    const ok = await fetchMessages(cleanPin);
    setJoining(false);
    if (!ok) { setError('Wrong chat code. Please check and try again.'); return; }
    setActivePin(cleanPin);
    setJoined(true);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const r = await fetch('/api/public-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: activePin, name: guestRef.current, text, cid: clientIdRef.current })
      });
      if (r.ok) {
        const data = await r.json();
        if (data.message) {
          setMessages(prev => (prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]));
        }
        setInput('');
      }
    } catch {
      // Next poll will resync; keep the text out of the box only on success.
    }
    setSending(false);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] w-[min(92vw,380px)] h-[min(72vh,560px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[#A47A46]/50 bg-[#F5F0E6] font-sans">
      {/* Header */}
      <div className="bg-[#13263D] text-[#F5F0E6] px-4 py-3 flex items-center gap-2.5 shrink-0">
        <ChatsCircle className="w-5 h-5 text-[#A47A46]" weight="fill" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Public Chat</p>
          <p className="text-[10px] text-[#F5F0E6]/60 leading-tight">Temporary chat. It clears when you reload the page.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!joined ? (
        <form onSubmit={join} className="flex-1 flex flex-col justify-center px-5 py-6 gap-3">
          <p className="text-xs text-[#13263D]/70 leading-relaxed">
            This is a group chat. Just enter the 4-digit chat code and you are in. No account, no link, nothing else needed.
          </p>
          <input
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="4-digit chat code"
            inputMode="numeric"
            maxLength={4}
            className="w-full rounded-lg border border-[#A47A46]/40 bg-white px-3 py-2.5 text-sm text-[#13263D] outline-none focus:border-[#A47A46] tracking-[0.3em]"
          />
          {error && <p className="text-xs text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={joining}
            className="w-full rounded-lg bg-[#13263D] text-[#F5F0E6] py-2.5 text-sm font-semibold hover:bg-[#1B3555] transition-colors disabled:opacity-60"
          >
            {joining ? 'Joining...' : 'Join Chat'}
          </button>
        </form>
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
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 ${own ? 'bg-[#13263D] text-[#F5F0E6]' : 'bg-white border border-[#A47A46]/25 text-[#13263D]'}`}>
                    {!own && <p className="text-[10px] font-bold text-[#A47A46] mb-0.5">{m.name}</p>}
                    <p className="text-[13px] leading-snug whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`text-[9px] mt-1 text-right ${own ? 'text-[#F5F0E6]/50' : 'text-[#13263D]/40'}`}>
                      {new Date(m.ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={send} className="shrink-0 border-t border-[#A47A46]/25 bg-white px-2.5 py-2.5 flex items-center gap-2">
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
