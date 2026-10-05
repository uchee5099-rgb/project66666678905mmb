import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, CheckCircle2, XCircle, Clock, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export default function AdminWithdrawals() {
  const { showToast } = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedWd, setSelectedWd] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchWithdrawals = async (status = filter) => {
    try {
      setLoading(true);
      const res = await api.getAdminWithdrawals({ status });
      setWithdrawals(res.withdrawals || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load withdrawals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(filter);
  }, [filter]);

  const openProcessModal = (wd) => {
    setSelectedWd(wd);
    setAdminNotes('');
    setModalOpen(true);
  };

  const handleAction = async (action) => {
    if (!selectedWd) return;
    setProcessing(true);

    try {
      const res = await api.processWithdrawal(selectedWd.id, {
        action,
        adminNotes: adminNotes || (action === 'approve_completed' ? 'Payout disbursed.' : 'Verification issue.')
      });

      showToast(res.message, 'success');
      setModalOpen(false);
      await fetchWithdrawals(filter);
    } catch (err) {
      showToast(err.message || 'Failed to process withdrawal.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Withdrawal Requests Queue
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Review member payout requests, inspect bank details, and execute settlements.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['pending', 'processing', 'completed', 'rejected', 'All'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              filter === st
                ? 'bg-dark text-white shadow-sm'
                : 'bg-white border border-surface-border text-surface-muted hover:text-dark'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        {loading ? (
          <LoadingSpinner text="Fetching withdrawal queue..." />
        ) : withdrawals.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No withdrawal requests in this queue"
            description="When users request bank payouts, they will appear here for settlement processing."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3">Bank Details</th>
                  <th className="pb-3 px-3">Date Requested</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="font-bold text-dark">{w.userName}</div>
                      <div className="text-xs text-surface-muted">{w.userEmail}</div>
                      <div className="text-[10px] text-surface-muted">{w.userPhone}</div>
                    </td>

                    <td className="py-4 px-3 text-right font-black text-dark whitespace-nowrap text-base">
                      ₦{w.amount.toFixed(2)}
                    </td>

                    <td className="py-4 px-3">
                      <div className="font-bold text-dark">{w.bankName}</div>
                      <div className="text-xs font-mono text-slate-600">
                        {w.accountNumber} • {w.accountName}
                      </div>
                      {w.adminNotes && (
                        <div className="text-[10px] text-slate-500 mt-1 italic">
                          Note: {w.adminNotes}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-3 text-xs text-surface-muted whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          w.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : w.status === 'processing'
                            ? 'bg-blue-50 text-blue-700'
                            : w.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      {['pending', 'processing'].includes(w.status) ? (
                        <button
                          onClick={() => openProcessModal(w)}
                          className="px-3.5 py-1.5 rounded-xl bg-dark hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                        >
                          Process Payout
                        </button>
                      ) : (
                        <span className="text-xs text-surface-muted">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Processing Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Execute Bank Payout"
        subtitle={`Disbursement for ${selectedWd?.userName} (₦${selectedWd?.amount.toFixed(2)})`}
      >
        {selectedWd && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-surface-muted">Bank Name:</span>
                <span className="font-bold text-dark">{selectedWd.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-muted">Account Number:</span>
                <span className="font-mono font-bold text-dark">{selectedWd.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-muted">Account Name:</span>
                <span className="font-bold text-dark">{selectedWd.accountName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-dark">Payout Amount:</span>
                <span className="font-black text-brand-600 text-sm">₦{selectedWd.amount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Admin Notes / Reference Token
              </label>
              <textarea
                rows="2"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional transfer reference (e.g. NIBSS Ref #9921) or reason if declining..."
                className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-surface-border flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={processing}
                onClick={() => handleAction('reject')}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Decline & Refund</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleAction('mark_processing')}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>Mark Processing</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleAction('approve_completed')}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Paid Out</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
