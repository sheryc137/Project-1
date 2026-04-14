import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { newsApi } from '../api/newsApi';
import NewsCard from '../components/news/NewsCard';
import NewsFilters from '../components/news/NewsFilters';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS = { page: 1, limit: 20 };

export default function NewsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['news', filters],
    queryFn: () => newsApi.list(filters),
    keepPreviousData: true,
  });

  const ingest = useMutation({
    mutationFn: newsApi.triggerIngest,
    onSuccess: () => toast.success('News ingestion triggered'),
    onError: () => toast.error('Failed to trigger ingestion'),
  });

  const articles = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">
          News Feed
          {total > 0 && <span className="text-slate-500 text-sm font-normal ml-2">{total} articles</span>}
        </h1>
        <button
          className="btn-primary"
          onClick={() => ingest.mutate()}
          disabled={ingest.isPending}
        >
          {ingest.isPending ? 'Scraping...' : 'Scrape Now'}
        </button>
      </div>

      <NewsFilters filters={filters} onChange={setFilters} />

      {(isLoading || isFetching) && articles.length === 0 && (
        <div className="flex items-center gap-3 py-8">
          <Spinner />
          <span className="text-slate-400">Loading news...</span>
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-400">No articles found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting filters or trigger a scrape.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            className="btn-secondary text-xs"
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {filters.page} of {totalPages}
          </span>
          <button
            className="btn-secondary text-xs"
            disabled={filters.page >= totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
