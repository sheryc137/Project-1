import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { portfolioApi } from '../api/portfolioApi';
import { analysisApi } from '../api/analysisApi';
import { newsApi } from '../api/newsApi';
import { alertsApi } from '../api/alertsApi';
import RiskMeter from '../components/analysis/RiskMeter';
import AnalysisCard from '../components/analysis/AnalysisCard';
import AllocationPie from '../components/portfolio/AllocationPie';
import NewsCard from '../components/news/NewsCard';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

function StatCard({ label, value, sub, subPositive }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub != null && (
        <span className={clsx('stat-change', subPositive ? 'text-risk-low' : 'text-risk-critical')}>
          {sub}
        </span>
      )}
    </div>
  );
}

function fmtMoney(n) {
  if (n == null) return '—';
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const qc = useQueryClient();

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', 'current'],
    queryFn: portfolioApi.current,
    refetchInterval: 5 * 60_000,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['analysis', 'latest'],
    queryFn: analysisApi.latest,
    refetchInterval: 10 * 60_000,
    retry: false,
  });

  const { data: newsData } = useQuery({
    queryKey: ['news', 'dashboard'],
    queryFn: () => newsApi.list({ limit: 5, page: 1 }),
    staleTime: 5 * 60_000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', 'unread'],
    queryFn: () => alertsApi.list({ is_read: false, limit: 5 }),
  });

  const runAnalysis = useMutation({
    mutationFn: analysisApi.run,
    onSuccess: () => {
      toast.success('Analysis started — results in a moment');
      setTimeout(() => qc.invalidateQueries({ queryKey: ['analysis'] }), 15_000);
    },
    onError: (e) => {
      const msg = e?.response?.data?.detail || 'Failed to run analysis';
      toast.error(msg);
    },
  });

  const syncPortfolio = useMutation({
    mutationFn: portfolioApi.sync,
    onSuccess: () => {
      toast.success('Portfolio synced');
      qc.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: () => toast.error('Portfolio sync failed'),
  });

  const positions = portfolio?.positions || [];
  const totalPnl = portfolio?.total_pnl;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
        <div className="flex gap-2">
          <button
            className="btn-secondary text-xs"
            onClick={() => syncPortfolio.mutate()}
            disabled={syncPortfolio.isPending}
          >
            {syncPortfolio.isPending ? 'Syncing...' : 'Sync Portfolio'}
          </button>
          <button
            className="btn-primary text-xs"
            onClick={() => runAnalysis.mutate()}
            disabled={runAnalysis.isPending}
          >
            {runAnalysis.isPending ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {portfolioLoading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-slate-400 text-sm">Loading portfolio...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Portfolio Value" value={fmtMoney(portfolio?.total_value)} />
          <StatCard
            label="Buying Power"
            value={fmtMoney(portfolio?.buying_power)}
          />
          <StatCard
            label="Total P&L"
            value={fmtMoney(Math.abs(totalPnl || 0))}
            sub={totalPnl != null ? (totalPnl >= 0 ? `+${fmtMoney(totalPnl)}` : fmtMoney(totalPnl)) : null}
            subPositive={totalPnl >= 0}
          />
          <StatCard label="Positions" value={positions.length} />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: risk + analysis */}
        <div className="lg:col-span-2 space-y-4">
          {analysisLoading ? (
            <div className="card flex items-center justify-center h-32">
              <Spinner />
            </div>
          ) : analysis ? (
            <>
              <RiskMeter
                score={analysis.risk_score}
                level={analysis.market_risk_level}
                updatedAt={analysis.created_at}
              />
              <AnalysisCard analysis={analysis} />
            </>
          ) : (
            <div className="card text-center py-10">
              <p className="text-slate-400 mb-3">No AI analysis yet</p>
              <button className="btn-primary" onClick={() => runAnalysis.mutate()}>
                Run First Analysis
              </button>
            </div>
          )}
        </div>

        {/* Right column: allocation + alerts */}
        <div className="space-y-4">
          <AllocationPie positions={positions} />

          {alertsData?.items?.length > 0 && (
            <div className="card">
              <div className="card-header">Unread Alerts</div>
              <ul className="space-y-2">
                {(alertsData.items || []).slice(0, 4).map((a) => (
                  <li key={a.id} className="text-sm text-slate-300 border-l-2 border-brand-500 pl-2">
                    {a.title}
                    <span className="block text-xs text-slate-500">{a.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recent news */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Recent News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(newsData?.items || []).map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
          {!newsData?.items?.length && (
            <p className="text-slate-500 text-sm col-span-3">No news articles yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
