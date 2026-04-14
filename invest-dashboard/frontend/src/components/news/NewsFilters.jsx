import { useQuery } from '@tanstack/react-query';
import { newsApi } from '../../api/newsApi';

export default function NewsFilters({ filters, onChange }) {
  const { data: topics = [] } = useQuery({
    queryKey: ['news-topics'],
    queryFn: newsApi.topics,
    staleTime: 10 * 60_000,
  });
  const { data: sources = [] } = useQuery({
    queryKey: ['news-sources'],
    queryFn: newsApi.sources,
    staleTime: 10 * 60_000,
  });

  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="card mb-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-slate-400 block mb-1">Search</label>
          <input
            type="text"
            className="input"
            placeholder="Keywords, ticker..."
            value={filters.q || ''}
            onChange={(e) => set('q', e.target.value)}
          />
        </div>

        {/* Source */}
        <div className="min-w-[130px]">
          <label className="text-xs text-slate-400 block mb-1">Source</label>
          <select className="select w-full" value={filters.source || ''} onChange={(e) => set('source', e.target.value)}>
            <option value="">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Topic */}
        <div className="min-w-[130px]">
          <label className="text-xs text-slate-400 block mb-1">Topic</label>
          <select className="select w-full" value={filters.topic || ''} onChange={(e) => set('topic', e.target.value)}>
            <option value="">All topics</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Sentiment */}
        <div className="min-w-[120px]">
          <label className="text-xs text-slate-400 block mb-1">Sentiment</label>
          <select className="select w-full" value={filters.sentiment || ''} onChange={(e) => set('sentiment', e.target.value)}>
            <option value="">Any</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        {/* Ticker */}
        <div className="min-w-[100px]">
          <label className="text-xs text-slate-400 block mb-1">Ticker</label>
          <input
            type="text"
            className="input"
            placeholder="AAPL..."
            value={filters.ticker || ''}
            onChange={(e) => set('ticker', e.target.value.toUpperCase())}
          />
        </div>

        {/* Reset */}
        <button
          className="btn-secondary self-end"
          onClick={() => onChange({ page: 1, limit: 20 })}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
