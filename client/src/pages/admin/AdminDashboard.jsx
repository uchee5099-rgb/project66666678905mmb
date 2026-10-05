import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  CheckSquare,
  FileCheck,
  CreditCard,
  Award,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.getAdminStats();
        setStats(res.stats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading admin platform metrics..." />;
  }

  const statCards = [
    { title: 'Total Registered Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active User Accounts', value: stats?.activeUsers || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Available Tasks', value: stats?.availableTasks || 0, icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    {
      title: 'Pending Submissions',
      value: stats?.pendingSubmissions || 0,
      icon: FileCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      highlight: (stats?.pendingSubmissions || 0) > 0,
      action: { label: 'Review Queue', to: '/admin/submissions' }
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.pendingWithdrawals || 0,
      icon: CreditCard,
      color: 'text-red-600',
      bg: 'bg-red-50',
      highlight: (stats?.pendingWithdrawals || 0) > 0,
      action: { label: 'Process Payouts', to: '/admin/withdrawals' }
    },
    {
      title: 'Total Rewards Earned',
      value: `₦${Number(stats?.totalRewardsEarned || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-brand-600',
      bg: 'bg-brand-50'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Platform-wide operational analytics, moderation queues, and payout management.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white rounded-2xl p-6 border shadow-subtle flex flex-col justify-between ${
                card.highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-surface-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-surface-muted uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-dark tracking-tight">
                  {card.value}
                </div>
              </div>

              {card.action && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-amber-700 font-medium">Requires action</span>
                  <Link
                    to={card.action.to}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    {card.action.label} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        <h2 className="text-lg font-bold text-dark mb-4">Operational Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/submissions"
            className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 hover:bg-amber-100/50 transition flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-amber-950 text-sm">Review Submissions</div>
              <div className="text-xs text-amber-700 mt-0.5">
                {stats?.pendingSubmissions || 0} proofs waiting
              </div>
            </div>
            <FileCheck className="w-5 h-5 text-amber-600" />
          </Link>

          <Link
            to="/admin/withdrawals"
            className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 hover:bg-emerald-100/50 transition flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-emerald-950 text-sm">Disburse Withdrawals</div>
              <div className="text-xs text-emerald-700 mt-0.5">
                {stats?.pendingWithdrawals || 0} payout requests
              </div>
            </div>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </Link>

          <Link
            to="/admin/tasks"
            className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 hover:bg-blue-100/50 transition flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-blue-950 text-sm">Manage Tasks</div>
              <div className="text-xs text-blue-700 mt-0.5">Create & edit tasks</div>
            </div>
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}
