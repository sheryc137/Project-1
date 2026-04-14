import { formatDistanceToNow, parseISO } from 'date-fns';
import Badge from '../common/Badge';
import SentimentBar from './SentimentBar';

const sourceColor = {
  newsapi: 'blue',
  reddit: 'orange',
  rss: 'purple',
  gdelt: 'amber',
};

export default function NewsCard({ article }) {
  const ago = article.published_at
    ? formatDistanceToNow(parseISO(article.published_at), { addSuffix: true })
    : '';

  return (
    <div className="card hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant={sourceColor[article.source] || 'default'}>{article.source}</Badge>
        <span className="text-xs text-slate-500 shrink-0">{ago}</span>
      </div>

      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-slate-100 hover:text-brand-400 leading-snug line-clamp-2 block mb-2 transition-colors"
      >
        {article.title}
      </a>

      {article.body && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{article.body}</p>
      )}

      {article.sentiment_score != null && (
        <SentimentBar score={article.sentiment_score} />
      )}

      {(article.tickers?.length > 0 || article.topics?.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(article.tickers || []).slice(0, 4).map((t) => (
            <Badge key={t} variant="green">{t}</Badge>
          ))}
          {(article.topics || []).slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
