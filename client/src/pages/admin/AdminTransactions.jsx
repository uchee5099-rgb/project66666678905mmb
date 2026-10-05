import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { History, Receipt } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('All');

  const fetchTransactions = async (selectedType = type) => {
    try {
      setLoading(true);
      const res = await api.getAdminTransactions({ type: selectedType });
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(type);
  }, [type]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Platform Financial Ledger
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Complete transparent audit trail of all task rewards, referral payouts, and withdrawals.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
        {['All', 'Task Reward', 'Referral Reward', 'Withdrawal', 'Adjustment'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              type === t
                ? 'bg-dark text-white shadow-sm'
                : 'bg-white border border-surface-border text-surface-muted hover:text-dark'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        {loading ? (
          <LoadingSpinner text="Fetching financial ledger..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No ledger entries found"
            description="Transaction records will appear here as users complete tasks and request payouts."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3">Description / Reference</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-3 text-xs text-surface-muted whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="font-bold text-dark">{tx.userName}</div>
                        <div className="text-xs text-surface-muted">{tx.userEmail}</div>
                      </td>
                      <td className="py-4 px-3 max-w-xs">
                        <div className="font-medium text-dark">{tx.description}</div>
                        {tx.reference && (
                          <div className="text-[10px] text-surface-muted font-mono">{tx.reference}</div>
                        )}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right whitespace-nowrap font-black">
                        <span className={isPositive ? 'text-emerald-600' : 'text-slate-900'}>
                          {isPositive ? '+' : ''}₦{Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
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
