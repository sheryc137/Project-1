import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import clsx from 'clsx';
import { alertsApi } from '../../api/alertsApi';
import { useAppContext } from '../../context/AppContext';
import Badge from '../common/Badge';
import toast from 'react-hot-toast';

const severityConfig = {
  INFO: { variant: 'blue', dot: 'bg-blue-400' },
  WARNING: { variant: 'amber', dot: 'bg-amber-400' },
  CRITICAL: { variant: 'red', dot: 'bg-red-400' },
};

export default function AlertList({ alerts = [], isLoading }) {
  const qc = useQueryClient();
  const { setUnreadCount } = useAppContext();

  const markRead = useMutation({
    mutationFn: alertsApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      setUnreadCount((c) => Math.max(0, c - 1));
    },
  });

  const markAll = useMutation({
    mutationFn: alertsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      setUnreadCount(0);
      toast.success('All marked as read');
    },
  });

  const deleteAlert = useMutation({
    mutationFn: alertsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });

  if (isLoading) return <p className="text-slate-400 text-sm py-4">Loading...</p>;
  if (!alerts.length) return <p className="text-slate-500 text-sm py-4">No alerts</p>;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button className="btn-secondary text-xs" onClick={() => markAll.mutate()}>
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {alerts.map((a) => {
          const cfg = severityConfig[a.severity] || severityConfig.INFO;
          return (
            <div
              key={a.id}
              className={clsx(
                'card flex items-start gap-3',
                !a.is_read && 'border-brand-600/40 bg-brand-900/10'
              )}
            >
              <span className={clsx('mt-1.5 w-2 h-2 rounded-full shrink-0', cfg.dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-100">{a.title}</span>
                  <Badge variant={cfg.variant}>{a.severity}</Badge>
                  {a.ticker && <Badge variant="green">{a.ticker}</Badge>}
                </div>
                <p className="text-xs text-slate-400">{a.message}</p>
                <span className="text-xs text-slate-600 mt-1 block">
                  {formatDistanceToNow(parseISO(a.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                {!a.is_read && (
                  <button
                    className="text-xs text-brand-400 hover:text-brand-300"
                    onClick={() => markRead.mutate(a.id)}
                  >
                    Read
                  </button>
                )}
                <button
                  className="text-xs text-slate-500 hover:text-red-400"
                  onClick={() => deleteAlert.mutate(a.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
