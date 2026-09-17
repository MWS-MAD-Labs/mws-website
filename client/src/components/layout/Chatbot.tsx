import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

type Message = {
  from: 'bot' | 'user';
  text: string;
};

const initialMessages: Message[] = [
  {
    from: 'bot',
    text: "Hi! I'm MWS AI. How can I help you today?",
  },
];

function getBotReply(text: string) {
  const lowText = text.toLowerCase();

  if (lowText.includes('admission') || lowText.includes('daftar') || lowText.includes('apply')) {
    return 'You can view detailed steps, timelines, and tuition fees on our Admissions page. Booking a school tour is also available there!';
  }

  if (lowText.includes('kindergarten') || lowText.includes('tk')) {
    return 'Our Kindergarten program accepts children ages 2 to 6. We focus on play-based learning and inquiry!';
  }

  if (lowText.includes('fee') || lowText.includes('biaya') || lowText.includes('tuition')) {
    return 'Tuition and enrollment fees vary by level (Kindergarten, Elementary, High School). Full details are listed on the Admissions page table.';
  }

  if (lowText.includes('contact') || lowText.includes('lokasi') || lowText.includes('map')) {
    return 'We are located at Jl. Merpati Raya No. 103, Sawah Lama, Ciputat. Visit our Contact page to find our interactive map and phone details!';
  }

  if (lowText.includes('curriculum') || lowText.includes('kurikulum')) {
    return 'We combine the Cambridge International Curriculum with the Indonesian National Curriculum, taught using an inquiry-based model.';
  }

  return 'Thank you for asking. Our admissions team is happy to guide you! Please check our Admissions page or email info@millennia21.id for direct support.';
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({
      top: panelRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();

    if (!text) return;

    setMessages((items) => [
      ...items,
      {
        from: 'user',
        text,
      },
    ]);

    setInput('');

    window.setTimeout(() => {
      setMessages((items) => [
        ...items,
        {
          from: 'bot',
          text: getBotReply(text),
        },
      ]);
    }, 500);
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
        >
          {messages.map((message, index) => (
            <div
              key={`${message.from}-${index}`}
              className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-5 ${
                message.from === 'user'
                  ? 'self-end bg-[var(--burgundy)] text-white'
                  : 'self-start border border-[var(--border)] bg-white text-[var(--charcoal)]'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border)] bg-white p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  sendMessage();
                }
              }}
              className="placeholder:text-[var(--charcoal)]/40 min-w-0 flex-1 border border-[var(--border)] bg-white px-3 py-2.5 text-[13px] font-[var(--f-body)] text-[var(--charcoal)] outline-none transition-colors focus:border-[var(--burgundy)]"
            />

            <button
              type="button"
              aria-label="Send message"
              onClick={sendMessage}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-[var(--burgundy)] text-white transition-all duration-200 hover:bg-[var(--charcoal)]"
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
