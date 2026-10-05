import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Wallet,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Copy,
  CheckCircle2,
  CheckSquare,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DashboardPage() {
  const { user, wallet, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [tasksRes, txRes] = await Promise.all([
          api.getTasks({ limit: 4 }),
          api.getTransactions({ limit: 5 }),
          refreshUser()
        ]);
        setTasks(tasksRes.tasks.slice(0, 4));
        setTransactions(txRes.transactions.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [refreshUser]);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    showToast('Referral code copied!', 'success');
  };

  if (loading && !wallet) {
    return <LoadingSpinner text="Loading dashboard overview..." />;
  }

  const balanceCards = [
    {
      title: 'Available Balance',
      amount: wallet?.availableBalance || 0,
      icon: Wallet,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      border: 'border-brand-100',
      action: { label: 'Withdraw', to: '/withdraw' }
    },
    {
      title: 'Total Earned',
      amount: wallet?.totalEarned || 0,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      action: { label: 'History', to: '/earnings' }
    },
    {
      title: 'Pending Rewards',
      amount: wallet?.pendingRewards || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      action: { label: 'Review', to: '/tasks' }
    },
    {
      title: 'Referral Rewards',
      amount: wallet?.referralRewards || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      action: { label: 'Invite', to: '/referrals' }
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Account Activation Warning Banner if not activated */}
      {!user?.isActivated && (
        <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          user?.activationStatus === 'pending_confirmation'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50/70 border-emerald-200 text-dark'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              user?.activationStatus === 'pending_confirmation'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-brand-100 text-brand-700'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {user?.activationStatus === 'pending_confirmation'
                  ? 'Activation Fee Paid — Awaiting Admin Confirmation'
                  : 'Account Not Activated — Withdrawals Restricted'}
              </div>
              <p className="text-xs text-surface-muted mt-0.5">
                {user?.activationStatus === 'pending_confirmation'
                  ? 'Your ₦1,000 payment was verified. An administrator will confirm your account shortly to unlock withdrawals.'
                  : 'A one-time ₦1,000 activation fee via Paystack is required before earnings can be withdrawn to your bank account.'}
              </p>
            </div>
          </div>

          <Link
            to="/withdraw"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition whitespace-nowrap"
          >
            {user?.activationStatus === 'pending_confirmation' ? 'View Status' : 'Activate Account (₦1,000)'}
          </Link>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4 BALANCE CARDS                                              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {balanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white rounded-2xl p-5 sm:p-6 border ${card.border} shadow-subtle hover:shadow-card transition duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-surface-muted uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                  ₦{Number(card.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-surface-muted">From database</span>
                <Link
                  to={card.action.to}
                  className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                >
                  {card.action.label} <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* REFERRAL PROMO BANNER                                        */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-brand-600" />
            <span>Referral Program</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark">
            Earn ₦250 for every friend who joins
          </h2>
          <p className="text-sm text-surface-muted mt-1 leading-relaxed">
            Share your unique invite link with friends. When they register and participate, rewards are automatically added to your wallet.
          </p>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-dark flex items-center justify-between gap-3">
            <span>Code: {user?.referralCode}</span>
            <button
              onClick={handleCopyCode}
              className="text-brand-600 hover:text-brand-800 text-xs font-sans font-bold"
            >
              Copy
            </button>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TWO COLUMNS: AVAILABLE TASKS & RECENT TRANSACTIONS           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Available Tasks */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-dark">Available Tasks</h2>
              <p className="text-xs text-surface-muted">Explore high-value daily reward activities</p>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View Marketplace <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-surface-muted text-center py-6">No tasks are currently available.</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl border border-surface-border hover:border-brand-200 hover:bg-slate-50/50 transition flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {task.category}
                      </span>
                      <span className="text-xs text-surface-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.estimatedMinutes}m
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-dark truncate">{task.title}</h3>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-3">
                    <div className="text-sm font-black text-brand-600">
                      ₦{task.rewardAmount.toFixed(2)}
                    </div>
                    <Link
                      to={`/tasks/${task.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-600 hover:text-white text-dark text-xs font-bold transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-dark">Recent Activity</h2>
              <p className="text-xs text-surface-muted">Recent wallet balance changes</p>
            </div>
            <Link
              to="/earnings"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-sm text-surface-muted text-center py-6">No transactions yet.</p>
            ) : (
              transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl border border-surface-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-dark truncate">{tx.description}</div>
                      <div className="text-[10px] text-surface-muted mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-black ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isPositive ? '+' : ''}₦{Math.abs(tx.amount).toFixed(2)}
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 uppercase ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tx.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
