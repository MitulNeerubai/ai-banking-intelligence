import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = [
  '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#10b981', '#f97316', '#6366f1', '#84cc16',
];

function formatCategory(category) {
  if (!category) return 'Other';
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="backdrop-blur-xl bg-slate-800/90 border border-white/10 rounded-xl shadow-2xl px-4 py-2.5 text-sm">
        <p className="font-medium text-white">{payload[0].name}</p>
        <p className="text-teal-400 font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function Charts({ transactions }) {
  // Aggregate spending by category (only expenses, amount < 0)
  const categoryData = useMemo(() => {
    const map = {};
    transactions.forEach((txn) => {
      if (txn.amount < 0) {
        const cat = formatCategory(txn.category);
        map[cat] = (map[cat] || 0) + Math.abs(txn.amount);
      }
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions]);

  // Aggregate spending by month
  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach((txn) => {
      if (txn.amount < 0) {
        const month = txn.date.slice(0, 7);
        map[month] = (map[month] || 0) + Math.abs(txn.amount);
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, value]) => {
        const [year, m] = month.split('-');
        const label = new Date(year, parseInt(m) - 1).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        return { month: label, amount: Math.round(value * 100) / 100 };
      });
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending by Category - Pie Chart */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-5">Spending by Category</h3>
        {categoryData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  animationDuration={800}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {categoryData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-slate-400 truncate flex-1">{entry.name}</span>
                  <span className="text-white font-medium">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No spending data</p>
        )}
      </div>

      {/* Monthly Spending - Bar Chart */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-5">Monthly Spending</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              />
              <Bar
                dataKey="amount"
                name="Spending"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={40}
                animationDuration={800}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No monthly data</p>
        )}
      </div>
    </div>
  );
}
