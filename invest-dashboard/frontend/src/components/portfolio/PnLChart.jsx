import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { portfolioApi } from '../../api/portfolioApi';
import Spinner from '../common/Spinner';

const PERIODS = ['7d', '30d', '90d'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-brand-400 font-semibold">${Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

export default function PnLChart() {
  const [period, setPeriod] = useState('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['pnl-history', period],
    queryFn: () => portfolioApi.pnlHistory(period),
    staleTime: 5 * 60_000,
  });

  const chartData = (data || []).map((pt) => ({
    date: format(parseISO(pt.timestamp), period === '7d' ? 'EEE' : 'MMM d'),
    value: pt.total_value,
  }));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <span className="card-header mb-0">Portfolio Value</span>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                period === p
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <Spinner />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          No history yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
