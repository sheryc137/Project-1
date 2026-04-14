import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy h:mm a');
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });
