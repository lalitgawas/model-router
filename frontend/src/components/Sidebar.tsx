import type { ChatSession } from '../types/chat';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

export function Sidebar({ sessions, activeSessionId, onNewChat, onSelectSession }: SidebarProps) {
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
