import { useEffect, useRef, useState } from "react";

type Message = {
  from: "bot" | "user";
  text: string;
};

const initialMessages: Message[] = [
  {
    from: "bot",
    text: "Ultrices exercitation augue in duis enim curae luctus.!",
  },
];

function getBotReply(text: string) {
  const lowText = text.toLowerCase();

  if (
    lowText.includes("admission") ||
    lowText.includes("daftar") ||
    lowText.includes("apply")
  ) {
    return "You can view detailed steps, timelines, and tuition fees on our Admissions page. Booking a school tour is also available there!";
  }

  if (lowText.includes("kindergarten") || lowText.includes("tk")) {
    return "Our Kindergarten program accepts children ages 2 to 6. We focus on play-based learning and inquiry!";
  }

  if (
    lowText.includes("fee") ||
    lowText.includes("biaya") ||
    lowText.includes("tuition")
  ) {
    return "Tuition and enrollment fees vary by level (Kindergarten, Elementary, High School). Full details are listed on the Admissions page table.";
  }

  if (
    lowText.includes("contact") ||
    lowText.includes("lokasi") ||
    lowText.includes("map")
  ) {
    return "We are located at Jl. Merpati Raya No. 103, Sawah Lama, Ciputat. Visit our Contact page to find our interactive map and phone details!";
  }

  if (lowText.includes("curriculum") || lowText.includes("kurikulum")) {
    return "We combine the Cambridge International Curriculum with the Indonesian National Curriculum, taught using an inquiry-based model.";
  }

  return "Thank you for asking. Our admissions team is happy to guide you! Please check our Admissions page or email info@millennia21.id for direct support.";
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({
      top: panelRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((items) => [...items, { from: "user", text }]);
    setInput("");

    window.setTimeout(() => {
      setMessages((items) => [...items, { from: "bot", text: getBotReply(text) }]);
    }, 500);
  };

  return (
    <div className="chatbot">
      <button
        className="chatbot-toggle"
        type="button"
        aria-label="Open chatbot"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 0 0-9 9 8.9 8.9 0 0 0 2.2 5.9L4 21l3.3-1.2A9 9 0 1 0 12 3z" />
        </svg>
        <span>Ask MWS AI</span>
      </button>
      <div className="chatbot-panel" style={{ display: isOpen ? "block" : "none" }}>
        <div className="chatbot-header">
          <h3>MWS AI</h3>
        </div>
        <div className="chatbot-body">
          <div
            ref={panelRef}
            className="chat-messages"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 12,
              maxHeight: 180,
              overflowY: "auto",
            }}
          >
            {messages.map((message, index) => (
              <p
                key={`${message.from}-${index}`}
                style={{
                  alignSelf: message.from === "user" ? "flex-end" : "flex-start",
                  background:
                    message.from === "user" ? "var(--burgundy)" : "var(--warm-white)",
                  borderRadius: 0,
                  color: message.from === "user" ? "var(--white)" : "var(--charcoal)",
                  fontSize: 14,
                  margin: 0,
                  padding: "8px 12px",
                }}
              >
                {message.text}
              </p>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="chat-input"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 0,
                flex: 1,
                fontFamily: "var(--f-body)",
                fontSize: 14,
                padding: 10,
              }}
            />
            <button
              className="chat-send"
              type="button"
              onClick={sendMessage}
              style={{
                background: "var(--burgundy)",
                border: "none",
                borderRadius: 0,
                color: "var(--white)",
                cursor: "pointer",
                fontFamily: "var(--f-head)",
                fontSize: 13,
                fontWeight: 600,
                padding: "0 16px",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
