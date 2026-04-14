import clsx from 'clsx';
import Badge from '../common/Badge';

const signalVariant = { BUY: 'green', SELL: 'red', HOLD: 'default', WATCH: 'amber' };
const impactVariant = { HIGH: 'red', MEDIUM: 'amber', LOW: 'green', NONE: 'default' };

export default function ReasoningPanel({ reasoning, perPosition }) {
  const positions = perPosition ? Object.entries(perPosition) : [];

  return (
    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-4">
      {reasoning && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">AI Reasoning</p>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{reasoning}</p>
        </div>
      )}

      {positions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Per-Position Analysis</p>
          <div className="space-y-2">
            {positions.map(([ticker, data]) => (
              <div key={ticker} className="bg-slate-800/60 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-slate-100">{ticker}</span>
                  <Badge variant={signalVariant[data.signal] || 'default'}>{data.signal}</Badge>
                  <Badge variant={impactVariant[data.impact] || 'default'}>
                    {data.impact} impact
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{data.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
