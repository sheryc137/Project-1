import Badge from '../ui/Badge';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/orderStatusHelpers';

export default function OrderStatusBadge({ status }) {
  return (
    <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
