import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import BackgroundLayer from '../components/BackgroundLayer';
import BalanceCard from '../components/BalanceCard';
import ConnectBankButton from '../components/ConnectBankButton';
import TransactionsTable from '../components/TransactionsTable';
import Charts from '../components/Charts';
import { Sparkles, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        API.get('/plaid/accounts'),
        API.get('/transactions'),
      ]);
      setAccounts(accountsRes.data.accounts || []);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const validAccounts = accounts.filter((a) => !a.error);

  const totalBalance = validAccounts.reduce((sum, a) => sum + (a.current_balance || 0), 0);

  const totalSpending = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const summaryCards = [
    {
      label: 'Total Balance',
      value: formatCurrency(totalBalance),
      sub: `Across ${validAccounts.length} account${validAccounts.length !== 1 ? 's' : ''}`,
      color: 'text-white',
    },
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      sub: 'From all transactions',
      color: 'text-emerald-400',
    },
    {
      label: 'Total Spending',
      value: formatCurrency(totalSpending),
      sub: `${transactions.filter((t) => t.amount < 0).length} expense transactions`,
      color: 'text-rose-400',
    },
  ];

  return (
    <BackgroundLayer>
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">
                GuideSpend AI
              </h1>
              <p className="text-[10px] text-slate-500 leading-tight">Smart Spending. Clear Decisions.</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer backdrop-blur-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 pb-16">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-slate-400 text-sm mt-0.5">Your financial overview at a glance</p>
          </div>
          <ConnectBankButton onSuccess={fetchDashboardData} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-slate-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading dashboard...
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className={`text-3xl font-extrabold mt-2 ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Linked Accounts */}
            {validAccounts.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Linked Accounts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {validAccounts.map((account) => (
                    <BalanceCard key={account.account_id} account={account} />
                  ))}
                </div>
              </section>
            )}

            {/* Charts */}
            {transactions.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Analytics</h3>
                <Charts transactions={transactions} />
              </section>
            )}

            {/* Transactions */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
              <TransactionsTable transactions={transactions} />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-8">
        <p className="text-center text-xs text-slate-600">
          GuideSpend AI &mdash; Smart Spending. Clear Decisions.
        </p>
      </footer>
    </BackgroundLayer>
  );
}
