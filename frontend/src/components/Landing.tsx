import { useState, useRef, useEffect, type FormEvent } from 'react';

/* ============================================
   TYPES
   ============================================ */

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  actualModel?: string;
  isFallback?: boolean;
  timestamp: Date;
}

interface ChatSession {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

/* ============================================
   DECORATIVE FLOATING SHAPES
   ============================================ */

function DecoShapes() {
  return (
    <>
      <div className="deco-float deco-1" />
      <div className="deco-float deco-2" />
      <div className="deco-float deco-3" />
      <div className="deco-float deco-4" />
    </>
  );
}

/* ============================================
   TYPING INDICATOR
   ============================================ */

function TypingIndicator() {
  return (
    <div className="message-row assistant" style={{ animation: 'pop-in 0.3s ease' }}>
      <div className="message-avatar ai-avatar">AI</div>
      <div className="message-bubble ai-bubble">
        <div className="typing-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   SIDEBAR COMPONENT
   ============================================ */

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

function Sidebar({ sessions, activeSessionId, onNewChat, onSelectSession }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo Pill */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-pill">
          <span className="logo-icon">//</span>
          <span className="logo-text">Model Router</span>
        </div>
      </div>

      {/* New Chat Button */}
      <button id="new-chat-btn" className="new-chat-btn" onClick={onNewChat}>
        <span className="plus-icon">+</span>
        New Chat
      </button>

      {/* History */}
      <div className="sidebar-section-title">Recent Chats</div>
      <div className="chat-history">
        {sessions.map((session) => (
          <div
            key={session._id}
            id={`chat-session-${session._id}`}
            className={`chat-history-item ${session._id === activeSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(session._id)}
          >
            {session.title}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-item">
          Settings
        </div>
      </div>
    </aside>
  );
}

/* ============================================
   EMPTY STATE
   ============================================ */

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { text: 'Explain quantum computing', chipColor: 'chip-yellow' },
  { text: 'Write a poem about the ocean', chipColor: 'chip-mint' },
  { text: 'Debug my Python code', chipColor: 'chip-coral' },
  { text: 'Analyse this dataset', chipColor: 'chip-teal' },
];

function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="empty-state">

      <h2>
        I route <span className="highlight">smart</span> prompts to prod.
      </h2>
      <p>
        Full-stack AI routing — real-time model selection, solid cost optimization,
        and a dataset that learns. I take prompts past the "just use GPT-4" stage.
      </p>
      <div className="status-line">Routing automatically, saving you money.</div>
      <div className="suggestion-chips">
        {suggestions.map((s, i) => (
          <button
            key={i}
            id={`suggestion-chip-${i}`}
            className={`suggestion-chip ${s.chipColor}`}
            onClick={() => onSuggestionClick(s.text)}
          >
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   MESSAGE BUBBLE
   ============================================ */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${message.role}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`}>
        {isUser ? 'U' : 'AI'}
      </div>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        {message.content}
        {!isUser && message.model && (
          <div className="message-routing-info">
            <div className="message-model-tag">
              Routed to: {message.model}
            </div>
            {message.isFallback && message.actualModel && (
              <div className="message-fallback-tag">
                Demo mode — responded via: {message.actualModel}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================
   CHAT HEADER
   ============================================ */

function ChatHeader({ currentModel }: { currentModel: string | null }) {
  return (
    <header className="chat-header">
      <div className="chat-header-title">
        <h2>Model Router Chat</h2>
      </div>
      {currentModel && (
        <div className="model-badge">
          <span className="dot"></span>
          {currentModel}
        </div>
      )}
    </header>
  );
}

/* ============================================
   MAIN LANDING COMPONENT
   ============================================ */

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export const Landing = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s._id === activeSessionId);
  const messages = activeSession?.messages ?? [];

  // Fetch all sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/v1/sessions');
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          setActiveSessionId(data[0]._id);
        } else {
          // If no sessions exist, create one automatically
          const createRes = await fetch('http://localhost:3000/api/v1/sessions', { method: 'POST' });
          const newSession = await createRes.json();
          setSessions([newSession]);
          setActiveSessionId(newSession._id);
        }
      } catch (err) {
        console.error("Error fetching sessions", err);
      }
    };
    fetchSessions();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount & session switch
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSessionId]);

  /* ---------- Session Management ---------- */

  const createNewChat = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/sessions', { method: 'POST' });
      const newSession = await res.json();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setCurrentModel(null);
    } catch (err) {
      console.error("Error creating chat", err);
    }
  };

  const updateSessionMessages = (sessionId: string, updater: (msgs: Message[]) => Message[]) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s._id !== sessionId) return s;
        const updatedMessages = updater(s.messages);
        const firstUserMsg = updatedMessages.find((m) => m.role === 'user');
        const title = firstUserMsg
          ? firstUserMsg.content.slice(0, 35) + (firstUserMsg.content.length > 35 ? '…' : '')
          : s.title;
        return { ...s, messages: updatedMessages, title };
      })
    );
  };

  /* ---------- Send Message ---------- */

  const handleSend = async (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || isLoading || !activeSessionId) return;

    setInput('');

    const userMessage: Message = {
      _id: generateId(), // Temporary ID for UI
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    updateSessionMessages(activeSessionId, (msgs) => [...msgs, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: prompt, sessionId: activeSessionId }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      const aiMessage: Message = {
        _id: generateId(),
        role: 'assistant',
        content: data.message ?? 'No response received.',
        model: data.model ?? undefined,
        actualModel: data.actual_model ?? undefined,
        isFallback: data.is_fallback ?? false,
        timestamp: new Date(),
      };

      if (data.model) {
        setCurrentModel(data.model);
      }

      updateSessionMessages(activeSessionId, (msgs) => [...msgs, aiMessage]);
    } catch {
      const errorMsg: Message = {
        _id: generateId(),
        role: 'assistant',
        content: `Oops! Something went wrong. Please make sure the backend server is running on port 3000.`,
        timestamp: new Date(),
      };
      updateSessionMessages(activeSessionId, (msgs) => [...msgs, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={createNewChat}
        onSelectSession={setActiveSessionId}
      />

      <main className="chat-main">
        <DecoShapes />
        <ChatHeader currentModel={currentModel} />

        <div className="messages-area">
          {messages.length === 0 && !isLoading ? (
            <EmptyState onSuggestionClick={(text) => handleSend(text)} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg._id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <form className="input-wrapper" onSubmit={handleSubmit}>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !activeSessionId}
              autoComplete="off"
            />
            <button
              id="send-btn"
              type="submit"
              className={`send-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !input.trim() || !activeSessionId}
            >
              {isLoading ? '...' : '→'}
            </button>
          </form>
          <div className="input-footer">
            Model Router automatically picks the best AI model for your prompt
          </div>
        </div>
      </main>
    </div>
  );
};