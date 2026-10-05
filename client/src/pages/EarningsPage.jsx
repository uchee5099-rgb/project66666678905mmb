import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Wallet, TrendingUp, Clock, CreditCard, ArrowDownRight, ArrowUpRight, Filter, Receipt } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function EarningsPage() {
  const { wallet, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'Task Reward', 'Referral Reward', 'Withdrawal', 'Adjustment'];

  const fetchTransactions = async (type = selectedType) => {
    try {
      setLoading(true);
      const res = await api.getTransactions({ type });
      setTransactions(res.transactions || []);
      await refreshUser();
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedType);
  }, [selectedType]);

  const cards = [
    { title: 'Available Balance', amount: wallet?.availableBalance || 0, icon: Wallet, color: 'text-brand-600', bg: 'bg-brand-50' },
    { title: 'Total Earned', amount: wallet?.totalEarned || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Rewards', amount: wallet?.pendingRewards || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Total Withdrawn', amount: wallet?.totalWithdrawn || 0, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Earnings & Ledger
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Detailed overview of your reward earnings, bonuses, and withdrawal requests.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-surface-muted uppercase tracking-wider">{c.title}</span>
                <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                ₦{Number(c.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-dark">Transaction History</h2>
            <p className="text-xs text-surface-muted">Complete financial audit trail</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedType === t
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-surface-muted hover:text-dark'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet."
            description="Complete available tasks or refer members to start recording reward credits."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Description</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-3 text-xs text-surface-muted whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-3 font-semibold text-dark max-w-xs truncate">
                        {tx.description}
                        {tx.reference && (
                          <span className="block text-[10px] text-surface-muted font-mono">{tx.reference}</span>
                        )}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right whitespace-nowrap font-bold">
                        <span className={isPositive ? 'text-emerald-600' : 'text-slate-900'}>
                          {isPositive ? '+' : ''}₦{Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tx.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
