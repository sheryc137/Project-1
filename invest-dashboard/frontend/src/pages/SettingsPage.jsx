import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { analysisApi } from '../api/analysisApi';
import { portfolioApi } from '../api/portfolioApi';
import { newsApi } from '../api/newsApi';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

function JobRow({ name, lastRun, interval, onTrigger, loading }) {
  return (
    <tr className="table-row">
      <td className="table-cell font-medium text-slate-200">{name}</td>
      <td className="table-cell text-slate-400">{interval}</td>
      <td className="table-cell text-slate-400">
        {lastRun ? new Date(lastRun).toLocaleTimeString() : '—'}
      </td>
      <td className="table-cell text-right">
        <button
          className="text-xs text-brand-400 hover:text-brand-300 disabled:opacity-50"
          onClick={onTrigger}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run Now'}
        </button>
      </td>
    </tr>
  );
}

// Cost calculation helpers
const INPUT_COST_PER_MTOK = 3.0;
const CACHED_COST_PER_MTOK = 0.30;
const OUTPUT_COST_PER_MTOK = 15.0;

function calcCost(tokens_used, cached_tokens) {
  const inputToks = (tokens_used || 0) - (cached_tokens || 0);
  const cachedToks = cached_tokens || 0;
  const inputCost = (inputToks / 1_000_000) * INPUT_COST_PER_MTOK;
  const cachedCost = (cachedToks / 1_000_000) * CACHED_COST_PER_MTOK;
  return inputCost + cachedCost;
}

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get('/health').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/health/jobs').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: costData } = useQuery({
    queryKey: ['analysis-cost'],
    queryFn: analysisApi.cost,
    staleTime: 5 * 60_000,
  });

  const { data: analyses } = useQuery({
    queryKey: ['analysis'],
    queryFn: () => analysisApi.list({ limit: 10 }),
    staleTime: 5 * 60_000,
  });

  const syncPortfolio = useMutation({
    mutationFn: portfolioApi.sync,
    onSuccess: () => {
      toast.success('Portfolio synced');
      qc.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: () => toast.error('Sync failed'),
  });

  const triggerAnalysis = useMutation({
    mutationFn: analysisApi.run,
    onSuccess: () => toast.success('Analysis triggered'),
    onError: (e) => toast.error(e?.response?.data?.detail || 'Analysis failed'),
  });

  const triggerScrape = useMutation({
    mutationFn: newsApi.triggerIngest,
    onSuccess: () => toast.success('News scrape triggered'),
    onError: () => toast.error('Scrape failed'),
  });

  const statusDot = (ok) => (
    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${ok ? 'bg-risk-low' : 'bg-risk-critical'}`} />
  );

  const totalInputToks = costData?.total_input_tokens || 0;
  const totalCachedToks = costData?.total_cached_tokens || 0;
  const totalOutputToks = costData?.total_output_tokens || 0;
  const estimatedCost =
    (totalInputToks / 1_000_000) * INPUT_COST_PER_MTOK +
    (totalCachedToks / 1_000_000) * CACHED_COST_PER_MTOK +
    (totalOutputToks / 1_000_000) * OUTPUT_COST_PER_MTOK;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold text-slate-100">Settings</h1>

      {/* Service Health */}
      <Card title="Service Health">
        {!health ? (
          <Spinner size="sm" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              ['Database', health.database === 'ok'],
              ['Redis', health.redis === 'ok'],
              ['Robinhood', health.robinhood === 'ok'],
            ].map(([label, ok]) => (
              <div key={label} className="flex items-center">
                {statusDot(ok)}
                <span className="text-slate-300">{label}</span>
                <Badge variant={ok ? 'green' : 'red'} className="ml-2">
                  {ok ? 'OK' : 'ERROR'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Robinhood */}
      <Card title="Robinhood Integration">
        <p className="text-sm text-slate-400 mb-3">
          Session is stored in Redis. Credentials are read from environment variables (
          <code className="bg-slate-800 px-1 rounded text-xs">ROBINHOOD_USERNAME</code>,{' '}
          <code className="bg-slate-800 px-1 rounded text-xs">ROBINHOOD_PASSWORD</code>,{' '}
          <code className="bg-slate-800 px-1 rounded text-xs">ROBINHOOD_MFA_SECRET</code>
          ).
        </p>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={() => syncPortfolio.mutate()}
            disabled={syncPortfolio.isPending}
          >
            {syncPortfolio.isPending ? 'Syncing...' : 'Sync Portfolio Now'}
          </button>
        </div>
      </Card>

      {/* Background Jobs */}
      <Card title="Background Jobs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Job', 'Interval', 'Last Run', ''].map((h) => (
                  <th key={h} className="text-xs font-semibold text-slate-400 uppercase tracking-wide py-2 px-4 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <JobRow
                name="Scrape News"
                interval="Every 30 min"
                lastRun={jobs?.scrape_news_job}
                onTrigger={() => triggerScrape.mutate()}
                loading={triggerScrape.isPending}
              />
              <JobRow
                name="Sync Portfolio"
                interval="Every 15 min"
                lastRun={jobs?.sync_portfolio_job}
                onTrigger={() => syncPortfolio.mutate()}
                loading={syncPortfolio.isPending}
              />
              <JobRow
                name="Run Analysis"
                interval="Every 4 hours"
                lastRun={jobs?.run_analysis_job}
                onTrigger={() => triggerAnalysis.mutate()}
                loading={triggerAnalysis.isPending}
              />
              <JobRow
                name="Check Alerts"
                interval="Every 5 min"
                lastRun={jobs?.check_alerts_job}
                onTrigger={() => toast('Alert check runs automatically')}
                loading={false}
              />
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Cost Tracker */}
      <Card title="Claude AI Cost Tracker">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Analyses', value: costData?.total_analyses ?? '—' },
            { label: 'Input Tokens', value: totalInputToks.toLocaleString() },
            { label: 'Cached Tokens', value: totalCachedToks.toLocaleString() },
            { label: 'Est. Cost', value: `$${estimatedCost.toFixed(4)}` },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
              <p className="text-lg font-bold text-slate-100">{s.value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Pricing: Input $3/MTok · Cached $0.30/MTok · Output $15/MTok (claude-sonnet-4-6)
        </p>

        {analyses?.items?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Date', 'Risk Level', 'Tokens Used', 'Cached', 'Est. Cost'].map((h) => (
                    <th key={h} className="text-xs text-slate-400 uppercase py-2 px-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analyses.items.map((a) => (
                  <tr key={a.id} className="table-row">
                    <td className="table-cell text-slate-400">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <Badge variant={
                        { LOW: 'green', MEDIUM: 'amber', HIGH: 'orange', CRITICAL: 'red' }[a.market_risk_level] || 'default'
                      }>
                        {a.market_risk_level}
                      </Badge>
                    </td>
                    <td className="table-cell text-slate-400">{(a.tokens_used || 0).toLocaleString()}</td>
                    <td className="table-cell text-slate-400">{(a.cached_tokens || 0).toLocaleString()}</td>
                    <td className="table-cell text-slate-400">${calcCost(a.tokens_used, a.cached_tokens).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Environment hints */}
      <Card title="Environment Variables">
        <p className="text-xs text-slate-400 mb-2">
          Configure in <code className="bg-slate-800 px-1 rounded">invest-dashboard/backend/.env</code>
        </p>
        <ul className="text-xs text-slate-500 space-y-1 font-mono">
          {[
            'ANTHROPIC_API_KEY',
            'ROBINHOOD_USERNAME',
            'ROBINHOOD_PASSWORD',
            'ROBINHOOD_MFA_SECRET',
            'NEWSAPI_KEY',
            'REDDIT_CLIENT_ID',
            'REDDIT_CLIENT_SECRET',
            'DATABASE_URL',
            'REDIS_URL',
          ].map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
