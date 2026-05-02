import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccount } from '../context/AccountContext';
import { useLanguage } from '../context/LanguageContext';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useTimeRangeInsights } from '../hooks/useTimeRangeInsights';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useCashflowForecast } from '../hooks/useCashflowForecast';
import { useHealthScore } from '../hooks/useHealthScore';
import BackgroundLayer from '../components/BackgroundLayer';
import BalanceCard from '../components/BalanceCard';
import ConnectBankButton from '../components/ConnectBankButton';
import TransactionsTable from '../components/TransactionsTable';
import Charts from '../components/Charts';
import InsightsCard from '../components/InsightsCard';
import SubscriptionsCard from '../components/SubscriptionsCard';
import CashflowCard from '../components/CashflowCard';
import HealthScoreCard from '../components/HealthScoreCard';
import Chatbot from '../components/Chatbot';
import {
  Sparkles, LogOut, AlertCircle, User, Settings, Mail, X,
  Building2, Wallet, Check, Globe,
} from 'lucide-react';

// ── Shared modal shell ─────────────────────────────────────────
function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Profile Modal ──────────────────────────────────────────────
function ProfileModal({ onClose, user, accounts, t }) {
  const raw = user.username || user.email || 'User';
  const initials = raw
    .split(/[\s@]/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Modal onClose={onClose} title={t('profile')}>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/30 to-blue-600/30 border border-white/10 flex items-center justify-center mb-3">
          <span className="text-xl font-bold text-white">{initials}</span>
        </div>
        <p className="text-lg font-semibold text-white">{user.username || 'User'}</p>
        <p className="text-sm text-slate-400">{user.email || '-'}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {t('linked_accounts_count', { n: accounts.length })}
        </p>
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">{t('no_linked')}</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div
                key={a.account_id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{a.name}</p>
                  <p className="text-xs text-slate-500">
                    {a.institution_name} · {a.subtype || a.type}
                  </p>
                </div>
                {a.mask && (
                  <span className="text-xs text-slate-500 font-mono">****{a.mask}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Settings Modal ─────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

function SettingsModal({ onClose }) {
  const { language, setLanguage, t } = useLanguage();
  const [localLang, setLocalLang] = useState(language);
  const [alerts, setAlerts] = useState(
    () => localStorage.getItem('guidespend_alerts') !== 'false'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLanguage(localLang);   // updates global context → all text re-renders instantly
    localStorage.setItem('guidespend_alerts', String(alerts));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Modal onClose={onClose} title={t('settings')}>
      <div className="space-y-6">
        {/* Language */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('language')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocalLang(l.code)}
                className={`px-4 py-2.5 text-sm rounded-xl border transition-all cursor-pointer ${
                  localLang === l.code
                    ? 'border-teal-500/60 bg-teal-500/10 text-teal-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('preferences')}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-sm text-slate-300">{t('spending_alerts')}</span>
              <button
                onClick={() => setAlerts((v) => !v)}
                className="relative cursor-pointer"
                style={{ width: '40px', height: '22px' }}
              >
                <div
                  className={`w-full h-full rounded-full transition-colors ${
                    alerts ? 'bg-teal-500' : 'bg-slate-700'
                  }`}
                />
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    alerts ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-sm text-slate-300">{t('dark_mode')}</span>
              <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-lg">
                {t('always_on')}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-teal-500 hover:bg-teal-400 text-white'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              {t('saved')}
            </>
          ) : (
            t('save')
          )}
        </button>
      </div>
    </Modal>
  );
}

// ── Contact Us Modal ───────────────────────────────────────────
function ContactModal({ onClose, t }) {
  return (
    <Modal onClose={onClose} title={t('contact_us')}>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-teal-500/10 to-blue-600/10 border border-white/10 rounded-xl p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-teal-400" />
          </div>
          <p className="text-base font-semibold text-white">GuideSpend AI</p>
          <p className="text-xs text-slate-400 mt-1">Smart Spending. Clear Decisions.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('team_label')}</p>
              <p className="text-sm font-medium text-white">Team 8</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('institution_label')}</p>
              <p className="text-sm font-medium text-white">University of Missouri–Kansas City</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('email_label')}</p>
              <a
                href="mailto:mn6zv@umsystem.edu"
                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                mn6zv@umsystem.edu
              </a>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Nav button ─────────────────────────────────────────────────
function NavBtn({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ── Dashboard ──────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const { selectedAccountId, setSelectedAccount, resetAccount } = useAccount();
  const { t } = useLanguage();

  const { validAccounts, loading: accountsLoading, error: accountsError, fetchAccounts } = useAccounts();
  const { transactions, pagination, loading: txnsLoading, error: txnsError, fetchTransactions, nextPage, prevPage } = useTransactions();
  const {
    data: insightsData, loading: insightsLoading, error: insightsError,
    refresh: refreshInsights, mode: insightsMode, setMode: setInsightsMode,
    prevPeriod, nextPeriod, canGoNext, goToToday,
    rollingDays, setRollingDays, customStart, customEnd, setCustomRange, applyCustomRange,
  } = useTimeRangeInsights();
  const {
    subscriptions, count: subscriptionCount, loading: subsLoading, error: subsError,
    refresh: refreshSubscriptions, recompute: recomputeSubscriptions, recomputing: subsRecomputing,
  } = useSubscriptions();
  const {
    forecast: cashflowForecast, loading: cashflowLoading, error: cashflowError,
    refresh: refreshCashflow, horizonDays, setHorizonDays,
  } = useCashflowForecast(null);

  // Derived values — computed before useHealthScore so they can be passed as context.
  // This ensures the health score's savings calculation uses the same income/spending
  // figures that the summary cards display.
  const totalBalance =
    selectedAccountId === 'all'
      ? validAccounts.reduce((s, a) => s + (a.current_balance || 0), 0)
      : validAccounts
          .filter((a) => a.account_id === selectedAccountId)
          .reduce((s, a) => s + (a.current_balance || 0), 0);

  const totalSpending = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const {
    healthScore: healthScoreData, loading: healthLoading, error: healthError,
    refresh: refreshHealthScore, windowDays: healthWindowDays, setWindowDays: setHealthWindowDays,
  } = useHealthScore(totalBalance, totalIncome, totalSpending);

  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // ── Auto-select: track existing IDs before a connect ──
  // After fetchAccounts returns, any ID not in the snapshot is a new account.
  const autoSelectNext = useRef(false);
  const prevAccountIds = useRef(new Set());

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  useEffect(() => {
    fetchTransactions({ page: 1, account_id: selectedAccountId });
  }, [selectedAccountId, fetchTransactions]);

  // After accounts reload, if a connect was pending, select the first new account
  useEffect(() => {
    if (!autoSelectNext.current) return;
    const newAccounts = validAccounts.filter(
      (a) => !prevAccountIds.current.has(a.account_id)
    );
    if (newAccounts.length > 0) {
      autoSelectNext.current = false;
      setSelectedAccount(newAccounts[0].account_id);
    }
  }, [validAccounts, setSelectedAccount]);

  const refreshAll = useCallback((accountId = 'all') => {
    fetchAccounts();
    fetchTransactions({ page: 1, account_id: accountId });
    refreshInsights();
    refreshSubscriptions();
    refreshCashflow();
    refreshHealthScore();
  }, [fetchAccounts, fetchTransactions, refreshInsights, refreshSubscriptions, refreshCashflow, refreshHealthScore]);

  const handleBankConnected = useCallback(() => {
    // Snapshot current account IDs BEFORE the refresh so we can diff afterwards
    prevAccountIds.current = new Set(validAccounts.map((a) => a.account_id));
    autoSelectNext.current = true;
    refreshAll('all');
  }, [validAccounts, refreshAll]);

  const handleDisconnect = useCallback(() => {
    resetAccount();
    refreshAll('all');
  }, [resetAccount, refreshAll]);

  const handleNextPage = useCallback(() => nextPage(selectedAccountId), [nextPage, selectedAccountId]);
  const handlePrevPage = useCallback(() => prevPage(selectedAccountId), [prevPage, selectedAccountId]);

  const expenseCount = transactions.filter((tx) => tx.amount < 0).length;

  function fmt(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  }

  const balanceSub =
    selectedAccountId === 'all'
      ? t('across_accounts', { n: validAccounts.length, s: validAccounts.length !== 1 ? 's' : '' })
      : validAccounts.find((a) => a.account_id === selectedAccountId)?.name || '';

  const isInitialLoad = accountsLoading && !validAccounts.length;

  return (
    <BackgroundLayer>
      {/* ── Top Navigation Bar ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">GuideSpend AI</h1>
              <p className="text-[10px] text-slate-500 leading-tight">Smart Spending. Clear Decisions.</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NavBtn icon={<User className="w-4 h-4" />} label={t('profile')} onClick={() => setShowProfile(true)} />
            <NavBtn icon={<Settings className="w-4 h-4" />} label={t('settings')} onClick={() => setShowSettings(true)} />
            <NavBtn icon={<Mail className="w-4 h-4" />} label={t('contact_us')} onClick={() => setShowContact(true)} />
            <div className="w-px h-5 bg-white/10 mx-2" />
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('sign_out')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 pb-20">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('dashboard')}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{t('subtitle')}</p>
          </div>
          <ConnectBankButton onSuccess={handleBankConnected} />
        </div>

        {/* Error banner */}
        {(accountsError || txnsError) && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-5 py-3.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-sm text-rose-300">{accountsError || txnsError}</p>
          </div>
        )}

        {isInitialLoad ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-slate-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('loading')}
            </div>
          </div>
        ) : (
          <>
            {/* ── LINKED ACCOUNTS — TOP ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{t('linked_accounts')}</h3>
                {validAccounts.length > 1 && selectedAccountId !== 'all' && (
                  <button
                    onClick={() => resetAccount()}
                    className="text-xs text-slate-400 hover:text-teal-400 border border-white/10 hover:border-teal-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Wallet className="w-3 h-3" />
                    {t('view_all')}
                  </button>
                )}
              </div>

              {validAccounts.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-dashed border-white/10 rounded-2xl p-10 text-center">
                  <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">{t('no_accounts')}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('no_accounts_hint')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {validAccounts.map((account) => (
                    <BalanceCard
                      key={account.account_id}
                      account={account}
                      onDisconnect={handleDisconnect}
                      isSelected={selectedAccountId === account.account_id}
                      onSelect={() => setSelectedAccount(account.account_id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── SUMMARY CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: t('total_balance'), value: fmt(totalBalance), sub: balanceSub, color: 'text-white' },
                { label: t('total_income'), value: fmt(totalIncome), sub: t('from_transactions'), color: 'text-emerald-400' },
                {
                  label: t('total_spending'),
                  value: fmt(totalSpending),
                  sub: t('expense_txns', { n: expenseCount }),
                  color: 'text-rose-400',
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-3xl font-extrabold mt-2 ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-slate-500 mt-2">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* ── HEALTH SCORE ── */}
            <section>
              <HealthScoreCard
                healthScore={healthScoreData}
                loading={healthLoading}
                error={healthError}
                refresh={refreshHealthScore}
                windowDays={healthWindowDays}
                setWindowDays={setHealthWindowDays}
                currentBalance={totalBalance}
                transactionCount={transactions.length}
              />
            </section>

            {/* ── FINANCIAL INSIGHTS ── */}
            <section>
              <InsightsCard
                data={insightsData}
                loading={insightsLoading}
                error={insightsError}
                refresh={refreshInsights}
                mode={insightsMode}
                setMode={setInsightsMode}
                prevPeriod={prevPeriod}
                nextPeriod={nextPeriod}
                canGoNext={canGoNext}
                goToToday={goToToday}
                rollingDays={rollingDays}
                setRollingDays={setRollingDays}
                customStart={customStart}
                customEnd={customEnd}
                setCustomRange={setCustomRange}
                applyCustomRange={applyCustomRange}
              />
            </section>

            {/* ── SUBSCRIPTIONS + CASHFLOW ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubscriptionsCard
                subscriptions={subscriptions}
                count={subscriptionCount}
                loading={subsLoading}
                error={subsError}
                refresh={refreshSubscriptions}
                recompute={recomputeSubscriptions}
                recomputing={subsRecomputing}
              />
              <CashflowCard
                forecast={cashflowForecast}
                loading={cashflowLoading}
                error={cashflowError}
                refresh={refreshCashflow}
                horizonDays={horizonDays}
                setHorizonDays={setHorizonDays}
              />
            </div>

            {/* ── ANALYTICS ── */}
            {transactions.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">{t('analytics')}</h3>
                <Charts transactions={transactions} />
              </section>
            )}

            {/* ── RECENT TRANSACTIONS ── */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">{t('recent_transactions')}</h3>
              <TransactionsTable
                transactions={transactions}
                pagination={pagination}
                loading={txnsLoading}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
              />
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-xs text-slate-600">{t('footer')}</p>
      </footer>

      {/* Modals */}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          user={user}
          accounts={validAccounts}
          t={t}
        />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} t={t} />}

      <Chatbot />
    </BackgroundLayer>
  );
}
