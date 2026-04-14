import clsx from 'clsx';

export default function SentimentBar({ score = 0 }) {
  // score is -1.0 to +1.0
  const pct = Math.round(((score + 1) / 2) * 100);
  const isPositive = score >= 0.05;
  const isNegative = score <= -0.05;

  const color = isPositive ? 'bg-risk-low' : isNegative ? 'bg-risk-critical' : 'bg-slate-500';
  const label = isPositive ? 'Positive' : isNegative ? 'Negative' : 'Neutral';
  const textColor = isPositive ? 'text-risk-low' : isNegative ? 'text-risk-critical' : 'text-slate-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={clsx('text-[10px] font-medium w-14 text-right', textColor)}>{label}</span>
    </div>
  );
}
