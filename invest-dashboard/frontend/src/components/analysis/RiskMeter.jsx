import clsx from 'clsx';

const levels = [
  { label: 'LOW', range: '0–25', color: 'bg-risk-low', text: 'text-risk-low', min: 0, max: 25 },
  { label: 'MEDIUM', range: '26–50', color: 'bg-risk-medium', text: 'text-risk-medium', min: 26, max: 50 },
  { label: 'HIGH', range: '51–75', color: 'bg-risk-high', text: 'text-risk-high', min: 51, max: 75 },
  { label: 'CRITICAL', range: '76–100', color: 'bg-risk-critical', text: 'text-risk-critical', min: 76, max: 100 },
];

function getColor(score) {
  if (score <= 25) return { bar: 'bg-risk-low', text: 'text-risk-low' };
  if (score <= 50) return { bar: 'bg-risk-medium', text: 'text-risk-medium' };
  if (score <= 75) return { bar: 'bg-risk-high', text: 'text-risk-high' };
  return { bar: 'bg-risk-critical', text: 'text-risk-critical' };
}

export default function RiskMeter({ score = 0, level = 'LOW', updatedAt }) {
  const pct = Math.min(100, Math.max(0, score));
  const { bar, text } = getColor(pct);

  return (
    <div className="card">
      <div className="card-header">Market Risk</div>
      <div className="flex items-end justify-between mb-2">
        <span className={clsx('text-4xl font-bold', text)}>{pct}</span>
        <span className={clsx('text-sm font-semibold px-2 py-0.5 rounded', text, 'bg-slate-800')}>{level}</span>
      </div>
      {/* Bar */}
      <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Legend */}
      <div className="flex gap-1">
        {levels.map((l) => (
          <div
            key={l.label}
            className={clsx(
              'flex-1 h-1 rounded-full',
              score >= l.min ? l.color : 'bg-slate-700'
            )}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {levels.map((l) => (
          <span key={l.label} className={clsx('text-[10px]', l.text)}>
            {l.label}
          </span>
        ))}
      </div>
      {updatedAt && (
        <p className="text-slate-600 text-xs mt-3">
          Updated {new Date(updatedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
