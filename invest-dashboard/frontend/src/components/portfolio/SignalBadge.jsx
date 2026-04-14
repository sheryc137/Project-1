import clsx from 'clsx';

const config = {
  BUY: { bg: 'bg-green-900/40 border border-green-700/50', text: 'text-green-300', dot: 'bg-green-400' },
  SELL: { bg: 'bg-red-900/40 border border-red-700/50', text: 'text-red-300', dot: 'bg-red-400' },
  HOLD: { bg: 'bg-slate-700/60 border border-slate-600/50', text: 'text-slate-300', dot: 'bg-slate-400' },
  WATCH: { bg: 'bg-amber-900/40 border border-amber-700/50', text: 'text-amber-300', dot: 'bg-amber-400' },
};

export default function SignalBadge({ signal }) {
  const c = config[signal] || config.HOLD;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold', c.bg, c.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {signal}
    </span>
  );
}
