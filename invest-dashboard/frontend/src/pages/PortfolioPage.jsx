import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../api/portfolioApi';
import { analysisApi } from '../api/analysisApi';
import PnLChart from '../components/portfolio/PnLChart';
import PositionRow from '../components/portfolio/PositionRow';
import AllocationPie from '../components/portfolio/AllocationPie';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function PortfolioPage() {
  const qc = useQueryClient();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', 'current'],
    queryFn: portfolioApi.current,
    refetchInterval: 5 * 60_000,
  });

  const { data: analysis } = useQuery({
    queryKey: ['analysis', 'latest'],
    queryFn: analysisApi.latest,
    retry: false,
  });

  const sync = useMutation({
    mutationFn: portfolioApi.sync,
    onSuccess: () => {
      toast.success('Portfolio synced');
      qc.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: () => toast.error('Sync failed — check Robinhood credentials in Settings'),
  });

  const positions = portfolio?.positions || [];
  const watchlist = portfolio?.watchlist || [];
  const signals = analysis?.per_position || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Portfolio</h1>
        <button
          className="btn-secondary"
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
        >
          {sync.isPending ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-8">
          <Spinner />
          <span className="text-slate-400">Loading portfolio...</span>
        </div>
      )}

      {!isLoading && portfolio && (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Value', value: `$${Number(portfolio.total_value || 0).toLocaleString()}` },
              { label: 'Buying Power', value: `$${Number(portfolio.buying_power || 0).toLocaleString()}` },
              { label: 'Total P&L', value: `$${Number(portfolio.total_pnl || 0).toLocaleString()}` },
              { label: 'Positions', value: positions.length },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-label">{s.label}</span>
                <span className="stat-value">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PnLChart />
            </div>
            <AllocationPie positions={positions} />
          </div>

          {/* Positions table */}
          <div className="card overflow-x-auto">
            <div className="card-header mb-0 pb-3">Holdings</div>
            {positions.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No positions found</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['Symbol', 'Qty', 'Avg Cost', 'Current', 'P&L', 'Equity', 'Signal'].map((h) => (
                      <th
                        key={h}
                        className={`text-xs font-semibold text-slate-400 uppercase tracking-wide py-2 px-4 ${h === 'Symbol' ? 'text-left' : 'text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <PositionRow
                      key={p.symbol}
                      position={p}
                      signal={signals[p.symbol]?.signal}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Watchlist */}
          {watchlist.length > 0 && (
            <div className="card">
              <div className="card-header">Watchlist</div>
              <div className="flex flex-wrap gap-2">
                {watchlist.map((item) => (
                  <div key={item.symbol || item} className="bg-slate-800 rounded-lg px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-100">{item.symbol || item}</span>
                    {item.price && (
                      <span className="text-slate-400 ml-2">${Number(item.price).toFixed(2)}</span>
                    )}
                    {signals[item.symbol]?.signal && (
                      <span className="ml-2 text-brand-400 text-xs font-medium">
                        {signals[item.symbol].signal}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && !portfolio && (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-2">No portfolio data</p>
          <p className="text-slate-500 text-sm mb-4">Configure Robinhood credentials in Settings and sync.</p>
          <button className="btn-primary" onClick={() => sync.mutate()}>
            Sync Portfolio
          </button>
        </div>
      )}
    </div>
  );
}
