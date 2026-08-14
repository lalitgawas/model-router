interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
  metrics: { totalRouted: number, highEndRouted: number, percentage: number } | null;
}

const suggestions = [
  { text: 'Explain quantum computing', chipColor: 'chip-yellow' },
  { text: 'Write a poem about the ocean', chipColor: 'chip-mint' },
  { text: 'Debug my Python code', chipColor: 'chip-coral' },
  { text: 'Analyse this dataset', chipColor: 'chip-teal' },
];

export function EmptyState({ onSuggestionClick, metrics }: EmptyStateProps) {
  return (
    <div className="empty-state">

      <h2>
        Routing <span className="highlight">smart</span> prompts to prod.
      </h2>
      <p>
        Full-stack AI routing — real-time model selection, solid cost optimization,
        and a dataset that learns. I take prompts past the "just use GPT-4" stage.
      </p>

      {metrics && (
        <div className="metrics-dashboard">
          <div className="metric-card">
            <div className="metric-value">{metrics.totalRouted}</div>
            <div className="metric-label">Total Prompts</div>
          </div>
          <div className="metric-card highlight">
            <div className="metric-value">{metrics.percentage}%</div>
            <div className="metric-label">High-End Usage</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.totalRouted > 0 ? (100 - metrics.percentage).toFixed(1) : 0}%</div>
            <div className="metric-label">Optimized Routing</div>
          </div>
        </div>
      )}

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
