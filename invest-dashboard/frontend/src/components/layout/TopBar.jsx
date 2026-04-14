import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../../api/analysisApi';
import clsx from 'clsx';

const riskColors = {
  LOW: 'text-risk-low',
  MEDIUM: 'text-risk-medium',
  HIGH: 'text-risk-high',
  CRITICAL: 'text-risk-critical',
};

const riskBg = {
  LOW: 'bg-green-900/30 border-green-700/50',
  MEDIUM: 'bg-amber-900/30 border-amber-700/50',
  HIGH: 'bg-orange-900/30 border-orange-700/50',
  CRITICAL: 'bg-red-900/30 border-red-700/50',
};

export default function TopBar() {
  const { data: analysis } = useQuery({
    queryKey: ['analysis', 'latest'],
    queryFn: analysisApi.latest,
    refetchInterval: 5 * 60_000,
    retry: false,
  });

  const level = analysis?.market_risk_level;
  const score = analysis?.risk_score;

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-4 text-sm">
        {level && (
          <div className={clsx('flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold', riskBg[level])}>
            <span className={riskColors[level]}>●</span>
            <span className={riskColors[level]}>MARKET RISK: {level}</span>
            {score != null && <span className="text-slate-400">({score}/100)</span>}
          </div>
        )}
        <span className="text-slate-500 text-xs">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>
    </header>
  );
}
