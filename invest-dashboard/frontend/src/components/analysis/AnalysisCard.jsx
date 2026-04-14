import { useState } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Badge from '../common/Badge';
import ReasoningPanel from './ReasoningPanel';

const riskVariant = { LOW: 'green', MEDIUM: 'amber', HIGH: 'orange', CRITICAL: 'red' };

export default function AnalysisCard({ analysis }) {
  const [expanded, setExpanded] = useState(false);

  if (!analysis) return null;

  const themes = analysis.key_themes || [];
  const risks = analysis.top_risks || [];

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <Badge variant={riskVariant[analysis.market_risk_level] || 'default'}>
            {analysis.market_risk_level} — {analysis.risk_score}/100
          </Badge>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          {format(new Date(analysis.created_at), 'MMM d, HH:mm')}
        </span>
      </div>

      {themes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {themes.map((t) => (
            <Badge key={t} variant="blue">{t}</Badge>
          ))}
        </div>
      )}

      {risks.length > 0 && (
        <ul className="text-xs text-slate-400 space-y-1 mb-3">
          {risks.map((r) => (
            <li key={r} className="flex items-start gap-1.5">
              <span className="text-risk-high mt-0.5">▲</span>
              {r}
            </li>
          ))}
        </ul>
      )}

      <button
        className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? 'Hide full reasoning ▲' : 'Show full reasoning ▼'}
      </button>

      {expanded && <ReasoningPanel reasoning={analysis.full_reasoning} perPosition={analysis.per_position} />}
    </div>
  );
}
