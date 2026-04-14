import clsx from 'clsx';
import SignalBadge from './SignalBadge';

function fmt(n, decimals = 2) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n) {
  if (n == null) return '—';
  const v = Number(n);
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

export default function PositionRow({ position, signal }) {
  const pnl = position.equity - position.cost_basis;
  const pnlPct = position.cost_basis ? (pnl / position.cost_basis) * 100 : 0;
  const isPositive = pnl >= 0;

  return (
    <tr className="table-row hover:bg-slate-800/40 transition-colors">
      <td className="table-cell">
        <div className="font-semibold text-slate-100">{position.symbol}</div>
        <div className="text-xs text-slate-500">{position.name || ''}</div>
      </td>
      <td className="table-cell text-right text-slate-300">{fmt(position.quantity)}</td>
      <td className="table-cell text-right text-slate-300">${fmt(position.average_buy_price)}</td>
      <td className="table-cell text-right text-slate-300">${fmt(position.current_price)}</td>
      <td className="table-cell text-right">
        <span className={clsx('font-medium', isPositive ? 'text-risk-low' : 'text-risk-critical')}>
          ${fmt(Math.abs(pnl))}
        </span>
        <div className={clsx('text-xs', isPositive ? 'text-risk-low' : 'text-risk-critical')}>
          {fmtPct(pnlPct)}
        </div>
      </td>
      <td className="table-cell text-right text-slate-300">${fmt(position.equity)}</td>
      <td className="table-cell text-right">
        {signal ? <SignalBadge signal={signal} /> : <span className="text-slate-600 text-xs">—</span>}
      </td>
    </tr>
  );
}
