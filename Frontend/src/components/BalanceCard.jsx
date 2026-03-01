import { Landmark, CreditCard, Building2, TrendingUp } from 'lucide-react';

const typeConfig = {
  depository: { icon: Landmark, color: 'text-teal-400', bg: 'bg-teal-400/10' },
  credit: { icon: CreditCard, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  loan: { icon: Building2, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  investment: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

function formatCurrency(amount) {
  if (amount == null) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function BalanceCard({ account }) {
  const config = typeConfig[account.type] || typeConfig.depository;
  const Icon = config.icon;

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{account.name}</h3>
            <p className="text-xs text-slate-500 capitalize">{account.subtype || account.type}</p>
          </div>
        </div>
        {account.mask && (
          <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            ****{account.mask}
          </span>
        )}
      </div>

      {/* Balances */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">Current</span>
          <span className="text-lg font-bold text-white">
            {formatCurrency(account.current_balance)}
          </span>
        </div>
        {account.available_balance != null && (
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Available</span>
            <span className="text-sm font-medium text-slate-300">
              {formatCurrency(account.available_balance)}
            </span>
          </div>
        )}
      </div>

      {/* Institution */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-xs text-slate-500 truncate">{account.institution_name}</p>
      </div>
    </div>
  );
}
