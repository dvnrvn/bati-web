import { FormEvent, useEffect, useRef, useState } from "react";

/**
 * Minimal conversational agent UI (learning-first)
 * ------------------------------------------------
 * - Full-screen single page with a header and a chat area
 * - Left/right aligned bubbles (user vs agent)
 * - Auto-scrolls to the latest message
 * - Mock agent response so you can test the UX before wiring a backend
 *
 * Next steps (later):
 * - Replace `mockAgentReply` with a real fetch to your API (/chat/turn)
 * - Stream partial tokens via SSE/WebSocket and append to the last agent message
 */

type Role = "user" | "agent";

type Message = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
};

export default function App() {
  // Chat state lives here for now; you can lift this to a store later (e.g., Zustand)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "agent",
      text: "Hi! I'm Bati. Tell me what you want to make and I'll plan a batch job for you. ✨",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");

  // Keep the chat scrolled to the bottom when new messages arrive
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      createdAt: Date.now(),
    };

    // Push user's message
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    sendToBackend(text, setMessages);
  }

  async function sendToBackend(
    text: string,
    setMessages: (updater: (prev: Message[]) => Message[]) => void
  ) {
    try {
      const res = await fetch("http://127.0.0.1:8000/chat/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const agentMsg: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        text: data.reply,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        text: `⚠️ Error: ${err.message || err}`,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  }

  return (
    <div className="min-h-screen bg-[#343541] text-gray-100">
      {/* Header */}
      <header className="h-14 border-b border-gray-700 bg-[#202123]">
        <div className="mx-auto max-w-5xl h-full px-4 flex items-center justify-between">
          <h1 className="text-sm font-medium">Bati — Agent Chat</h1>
          <a
            className="text-xs underline decoration-dashed hover:text-gray-300"
            href="https://nextjs.org/learn/react-foundations"
            target="_blank"
          >
            Right side poop example
          </a>
        </div>
      </header>

      {/* Chat area */}
      <main className="mx-auto max-w-5xl px-4 py-4 flex flex-col gap-3 h-[calc(100vh-3.5rem)]">
        <div className="flex-1 overflow-auto rounded-xl border border-gray-700 bg-[#343541]">
          <ul className="p-4 space-y-3">
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} text={m.text} />
            ))}
            <div ref={endRef} />
          </ul>
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="flex gap-2 shrink-0">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Try: "Type your message here"'
            className="flex-1 resize-none rounded-xl border bg-[#40414f] border-gray-700 text-gray-100 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2f4540] h-20 max-h-24 overflow-auto leading-normal"
          />
          <button
            type="submit"
            className="self-end rounded-xl bg-[#2b333b] text-white px-4 py-2 hover:bg-[#2f4540] h-fit"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

/**
 * ChatBubble
 * ----------
 * Small presentational component for left/right aligned bubbles.
 * Tailwind classes do the heavy lifting; no extra CSS required.
 */
function ChatBubble({ role, text }: { role: Role; text: string }) {
  const isUser = role === "user";
  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "rounded-2xl px-4 py-2 max-w-[75%] whitespace-pre-wrap break-words leading-relaxed",
          isUser
            ? "bg-[#2b333b] text-white"
            : "bg-[#444654] text-gray-100",
        ].join(" ")}
      >
        {text}
      </div>
    </li>
  );
}