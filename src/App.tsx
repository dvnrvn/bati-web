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

    // Simulate agent thinking + replying
    mockAgentReply(text, setMessages);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="h-14 border-b bg-white">
        <div className="mx-auto max-w-5xl h-full px-4 flex items-center justify-between">
          <h1 className="text-sm font-medium">Bati — Agent Chat</h1>
          <a
            className="text-xs underline decoration-dashed hover:text-gray-700"
            href="https://nextjs.org/learn/react-foundations"
            target="_blank"
          >
            React Foundations
          </a>
        </div>
      </header>

      {/* Chat area */}
      <main className="mx-auto max-w-5xl px-4 py-4 grid grid-rows-[1fr,auto] gap-3 h-[calc(100vh-3.5rem)]">
        <div className="overflow-auto rounded-xl border bg-white">
          <ul className="p-4 space-y-3">
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} text={m.text} />
            ))}
            <div ref={endRef} />
          </ul>
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Try: "Generate 8 Smudge mage posters, IG + TikTok"'
            className="flex-1 rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button
            type="submit"
            className="rounded-xl bg-gray-900 text-white px-4 py-2 hover:bg-black"
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
          "rounded-2xl px-4 py-2 max-w-[75%] whitespace-pre-wrap leading-relaxed",
          isUser ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900",
        ].join(" ")}
      >
        {text}
      </div>
    </li>
  );
}

/**
 * mockAgentReply
 * --------------
 * For learning and UI work, this simulates an agent.
 * It returns:
 *  - A quick acknowledgement
 *  - If the text looks like a generation request, a short plan
 * Replace this with your real API call later.
 */
function mockAgentReply(text: string, setMessages: (updater: (prev: Message[]) => Message[]) => void) {
  const acknowledgement = `Got it: "${text}". I can create a batch job or answer questions.`;
  const planLines: string[] = [];

  // Very naive "intent" detection—just to make the demo feel alive.
  const looksLikeBatch =
    /generate|make|create/i.test(text) &&
    /(image|poster|promo|batch|gallery|variant|ig|tiktok|facebook)/i.test(text);

  if (looksLikeBatch) {
    planLines.push(
      "Plan:",
      "• Seeds: detect from context or ask you to upload",
      "• Sizes: 1080×1080 (IG), 1080×1920 (TikTok)",
      "• Count: 8",
      "• Overlay: headline + optional quote",
      "Say “create batch” to enqueue a mock job (we’ll wire the backend next)."
    );
  }

  const reply = [acknowledgement, ...(planLines.length ? ["", ...planLines] : [])].join("\n");

  const agentMsg: Message = {
    id: crypto.randomUUID(),
    role: "agent",
    text: reply,
    createdAt: Date.now(),
  };

  // Simulate delay
  setTimeout(() => {
    setMessages((prev) => [...prev, agentMsg]);
  }, 400);
}