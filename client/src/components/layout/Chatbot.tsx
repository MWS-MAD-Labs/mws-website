import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import { chatbotApi, type ChatAction } from '@/api/chatbotApi';

type Message = {
  from: 'bot' | 'user';
  text: string;
  actions?: ChatAction[];
  suggestions?: string[];
};

const initialMessages: Message[] = [
  {
    from: 'bot',
    text: "Hi! I'm MWS AI. Ask me about admissions, tours, programs or the school calendar. You can also ask in Bahasa Indonesia.",
  },
];

const errorMessage: Message = {
  from: 'bot',
  text: "Sorry, I can't answer right now. Please reach our admissions team directly. / Maaf, saya belum bisa menjawab sekarang. Silakan hubungi tim admisi kami.",
  actions: [{ label: 'Contact page', href: '/contact' }],
};

const chipClass =
  'border border-[var(--border)] bg-white px-2.5 py-1.5 text-left text-[12px] leading-4 text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)] disabled:opacity-50';
const actionClass =
  'inline-flex items-center bg-[var(--burgundy)] px-2.5 py-1.5 text-[12px] font-semibold leading-4 text-white transition-colors hover:bg-[var(--charcoal)]';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const startersRequested = useRef(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({
      top: panelRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isSending]);

  // Load starter questions from the CMS FAQs the first time the chat opens.
  useEffect(() => {
    if (!isOpen || startersRequested.current) return;
    startersRequested.current = true;

    chatbotApi
      .starters()
      .then((starters) => {
        if (!starters.length) return;
        setMessages((items) =>
          items.map((item, index) => (index === 0 ? { ...item, suggestions: starters } : item)),
        );
      })
      .catch(() => {});
  }, [isOpen]);

  const sendMessage = async (value = input) => {
    const text = value.trim();

    if (!text || isSending) return;

    setMessages((items) => [...items, { from: 'user', text }]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await chatbotApi.send(text);
      setMessages((items) => [
        ...items,
        {
          from: 'bot',
          text: reply.reply,
          actions: reply.actions,
          suggestions: reply.suggestions,
        },
      ]);
    } catch {
      setMessages((items) => [...items, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-[680px]:bottom-4 max-[680px]:right-4">
      {/* Chat Panel */}
      <div
        className={`absolute bottom-[72px] right-0 w-[360px] origin-bottom-right overflow-hidden bg-white shadow-[0_20px_60px_rgba(36,23,24,0.18)] transition-all duration-300 max-[680px]:w-[calc(100vw-32px)] ${
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[var(--burgundy)] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <MessageCircle size={19} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">MWS AI</h3>

              <p className="mt-0.5 text-[11px] text-white/70">How can we help?</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close chatbot"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={panelRef}
          className="flex max-h-[300px] min-h-[180px] flex-col gap-3 overflow-y-auto bg-[var(--warm-white)] p-4"
          role="log"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.from}-${index}`}
              className={`flex max-w-[82%] flex-col gap-2 ${
                message.from === 'user' ? 'items-end self-end' : 'items-start self-start'
              }`}
            >
              <div
                className={`whitespace-pre-line px-3.5 py-2.5 text-[13px] leading-5 ${
                  message.from === 'user'
                    ? 'bg-[var(--burgundy)] text-white'
                    : 'border border-[var(--border)] bg-white text-[var(--charcoal)]'
                }`}
              >
                {message.text}
              </div>

              {message.actions?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {message.actions.map((action) =>
                    action.href.startsWith('/') ? (
                      <Link
                        key={action.href}
                        to={action.href}
                        className={actionClass}
                        onClick={() => setIsOpen(false)}
                      >
                        {action.label}
                      </Link>
                    ) : (
                      <a
                        key={action.href}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={actionClass}
                      >
                        {action.label}
                      </a>
                    ),
                  )}
                </div>
              ) : null}

              {/* Only the latest message offers follow-up questions. */}
              {message.suggestions?.length && index === messages.length - 1 ? (
                <div className="flex flex-col items-start gap-1.5">
                  {message.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isSending}
                      onClick={() => sendMessage(suggestion)}
                      className={chipClass}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {isSending ? (
            <div
              className="text-[var(--charcoal)]/60 self-start border border-[var(--border)] bg-white px-3.5 py-2.5 text-[13px] leading-5"
              aria-label="MWS AI is typing"
            >
              <span className="inline-flex gap-1">
                <span className="animate-pulse">•</span>
                <span className="animate-pulse [animation-delay:150ms]">•</span>
                <span className="animate-pulse [animation-delay:300ms]">•</span>
              </span>
            </div>
          ) : null}
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border)] bg-white p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask something..."
              aria-label="Your question"
              maxLength={500}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  void sendMessage();
                }
              }}
              className="placeholder:text-[var(--charcoal)]/40 min-w-0 flex-1 border border-[var(--border)] bg-white px-3 py-2.5 text-[13px] font-[var(--f-body)] text-[var(--charcoal)] outline-none transition-colors focus:border-[var(--burgundy)]"
            />

            <button
              type="button"
              aria-label="Send message"
              disabled={isSending || !input.trim()}
              onClick={() => void sendMessage()}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-[var(--burgundy)] text-white transition-all duration-200 hover:bg-[var(--charcoal)] disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        type="button"
        aria-label={isOpen ? 'Close MWS AI' : 'Open MWS AI'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--burgundy)] text-white shadow-[0_8px_30px_rgba(126,21,24,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(126,21,24,0.35)] max-[680px]:h-12 max-[680px]:w-12"
      >
        <MessageCircle
          size={24}
          strokeWidth={1.7}
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-12 scale-90' : 'scale-100'
          }`}
        />

        {/* Tooltip */}
        <span className="pointer-events-none absolute right-[68px] top-1/2 -translate-y-1/2 whitespace-nowrap bg-[var(--charcoal)] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          Ask MWS AI
        </span>
      </button>
    </div>
  );
}
