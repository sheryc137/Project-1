import { STATUS_ORDER, STATUS_LABELS } from '../../utils/orderStatusHelpers';
import clsx from 'clsx';

export default function OrderTimeline({ currentStatus }) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        Order Cancelled
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-3">
      {STATUS_ORDER.map((status, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={status} className="flex items-center gap-3">
            <div className={clsx(
              'w-3 h-3 rounded-full shrink-0 transition-colors',
              done ? 'bg-wave' : 'bg-gray-200',
              active && 'ring-2 ring-wave ring-offset-2'
            )} />
            <span className={clsx('text-sm', done ? 'text-gray-900 font-medium' : 'text-gray-400')}>
              {STATUS_LABELS[status]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
