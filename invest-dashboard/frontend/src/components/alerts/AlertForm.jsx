import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../../api/alertsApi';
import toast from 'react-hot-toast';

const defaultForm = { ticker: '', alert_type: 'above', threshold: '' };

export default function AlertForm() {
  const [form, setForm] = useState(defaultForm);
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: alertsApi.createPriceAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price-alerts'] });
      setForm(defaultForm);
      toast.success('Price alert created');
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Failed to create alert'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ticker || !form.threshold) return;
    create.mutate({
      ticker: form.ticker.toUpperCase(),
      alert_type: form.alert_type,
      threshold: parseFloat(form.threshold),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-4">
      <p className="card-header">New Price Alert</p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[100px]">
          <label className="text-xs text-slate-400 block mb-1">Ticker</label>
          <input
            className="input"
            placeholder="AAPL"
            value={form.ticker}
            onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value }))}
            required
          />
        </div>
        <div className="min-w-[130px]">
          <label className="text-xs text-slate-400 block mb-1">Type</label>
          <select
            className="select w-full"
            value={form.alert_type}
            onChange={(e) => setForm((f) => ({ ...f, alert_type: e.target.value }))}
          >
            <option value="above">Price above</option>
            <option value="below">Price below</option>
            <option value="pct_change">% change</option>
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="text-xs text-slate-400 block mb-1">
            {form.alert_type === 'pct_change' ? 'Threshold (%)' : 'Price ($)'}
          </label>
          <input
            type="number"
            step="0.01"
            className="input"
            placeholder="150.00"
            value={form.threshold}
            onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
            required
          />
        </div>
        <button type="submit" className="btn-primary self-end" disabled={create.isPending}>
          {create.isPending ? 'Creating...' : 'Add Alert'}
        </button>
      </div>
    </form>
  );
}
