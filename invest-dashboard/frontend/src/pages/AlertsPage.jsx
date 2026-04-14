import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/alertsApi';
import AlertList from '../components/alerts/AlertList';
import AlertForm from '../components/alerts/AlertForm';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TABS = ['Notifications', 'Price Alerts'];

export default function AlertsPage() {
  const [tab, setTab] = useState(0);
  const qc = useQueryClient();

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.list({ limit: 50 }),
    refetchInterval: 30_000,
  });

  const { data: priceAlerts = [], isLoading: paLoading } = useQuery({
    queryKey: ['price-alerts'],
    queryFn: alertsApi.priceAlerts,
  });

  const deletePA = useMutation({
    mutationFn: alertsApi.deletePriceAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price-alerts'] });
      toast.success('Price alert removed');
    },
  });

  const togglePA = useMutation({
    mutationFn: ({ id, is_active }) => alertsApi.updatePriceAlert(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['price-alerts'] }),
  });

  const unreadCount = (alertsData?.items || []).filter((a) => !a.is_read).length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-100">Alerts</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-lg w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={clsx(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              tab === i ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-100'
            )}
          >
            {t}
            {i === 0 && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications tab */}
      {tab === 0 && (
        <AlertList alerts={alertsData?.items || []} isLoading={alertsLoading} />
      )}

      {/* Price Alerts tab */}
      {tab === 1 && (
        <div className="space-y-4">
          <AlertForm />

          {paLoading && <p className="text-slate-400 text-sm">Loading price alerts...</p>}

          {!paLoading && priceAlerts.length === 0 && (
            <div className="card text-center py-8 text-slate-500">No price alerts configured</div>
          )}

          {priceAlerts.length > 0 && (
            <div className="space-y-2">
              {priceAlerts.map((pa) => (
                <div key={pa.id} className="card flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{pa.ticker}</span>
                      <Badge variant={pa.is_active ? 'green' : 'default'}>
                        {pa.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {pa.triggered_at && (
                        <Badge variant="amber">Triggered</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {pa.alert_type === 'above' && `Price above $${pa.threshold}`}
                      {pa.alert_type === 'below' && `Price below $${pa.threshold}`}
                      {pa.alert_type === 'pct_change' && `% change ${pa.threshold}%`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs text-slate-400 hover:text-slate-100"
                      onClick={() => togglePA.mutate({ id: pa.id, is_active: !pa.is_active })}
                    >
                      {pa.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="text-xs text-slate-500 hover:text-red-400"
                      onClick={() => deletePA.mutate(pa.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
