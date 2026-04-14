import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#f97316', '#ef4444', '#a855f7', '#06b6d4', '#ec4899'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-100 font-semibold">{entry.name}</p>
      <p className="text-slate-400">${Number(entry.value).toLocaleString()}</p>
      <p className="text-slate-400">{entry.payload.pct}%</p>
    </div>
  );
};

export default function AllocationPie({ positions = [] }) {
  const total = positions.reduce((s, p) => s + Number(p.equity || 0), 0);

  const data = positions
    .map((p) => ({
      name: p.symbol,
      value: Number(p.equity || 0),
      pct: total > 0 ? ((Number(p.equity) / total) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="card h-64 flex items-center justify-center text-slate-500 text-sm">
        No positions
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">Allocation</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconSize={8}
            iconType="circle"
            formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
