import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileCheck, CheckCircle2, XCircle, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export default function AdminSubmissions() {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchSubmissions = async (status = filter) => {
    try {
      setLoading(true);
      const res = await api.getAdminSubmissions({ status });
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load submissions queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(filter);
  }, [filter]);

  const openReview = (sub) => {
    setSelectedSub(sub);
    setAdminNotes('');
    setReviewModalOpen(true);
  };

  const handleReviewAction = async (action) => {
    if (!selectedSub) return;
    setProcessing(true);

    try {
      const res = await api.reviewSubmission(selectedSub.id, {
        action,
        adminNotes: adminNotes || (action === 'approve' ? 'Verified and approved.' : 'Proof did not meet guidelines.')
      });

      showToast(res.message, action === 'approve' ? 'success' : 'info');
      setReviewModalOpen(false);
      await fetchSubmissions(filter);
    } catch (err) {
      showToast(err.message || 'Failed to process submission review.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Submissions Review Queue
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Inspect user evidence, verify tokens/screenshots, and approve reward disbursements.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['pending', 'approved', 'rejected', 'All'].map((st) => (
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

      {/* Submissions List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        {loading ? (
          <LoadingSpinner text="Fetching submissions queue..." />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No submissions in this queue"
            description="When users complete marketplace activities, their proofs will appear here for review."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3">Task Details</th>
                  <th className="pb-3 px-3 text-right">Reward</th>
                  <th className="pb-3 px-3">Submitted Evidence</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="font-bold text-dark">{sub.userName}</div>
                      <div className="text-xs text-surface-muted">{sub.userEmail}</div>
                      <div className="text-[10px] text-surface-muted mt-0.5">
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-3 max-w-xs">
                      <div className="font-bold text-dark">{sub.taskTitle}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {sub.taskCategory}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-right font-black text-brand-600 whitespace-nowrap">
                      ₦{sub.rewardAmount.toFixed(2)}
                    </td>

                    <td className="py-4 px-3 max-w-xs">
                      <p className="text-xs text-dark font-mono line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {sub.proofContent}
                      </p>
                      {sub.proofImageUrl && (
                        <a
                          href={sub.proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-brand-600 font-bold hover:underline flex items-center gap-1 mt-1"
                        >
                          <span>View Attached Proof Image</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>

                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          sub.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : sub.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      {sub.status === 'pending' ? (
                        <button
                          onClick={() => openReview(sub)}
                          className="px-3.5 py-1.5 rounded-xl bg-dark hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                        >
                          Inspect & Review
                        </button>
                      ) : (
                        <span className="text-xs text-surface-muted">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Task Evidence"
        subtitle={`Submitted by ${selectedSub?.userName} for ₦${selectedSub?.rewardAmount.toFixed(2)}`}
      >
        {selectedSub && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1">
                Task Title
              </label>
              <div className="p-3 bg-slate-50 rounded-xl text-sm font-bold text-dark">
                {selectedSub.taskTitle}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1">
                Submitted Proof Content
              </label>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-dark whitespace-pre-wrap">
                {selectedSub.proofContent}
              </div>
            </div>

            {selectedSub.proofImageUrl && (
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1">
                  Attached Screenshot Link
                </label>
                <a
                  href={selectedSub.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-between hover:underline"
                >
                  <span className="truncate">{selectedSub.proofImageUrl}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Review Feedback / Reason
              </label>
              <textarea
                rows="3"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional comments for approval or specific reason if rejecting..."
                className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={processing}
                onClick={() => handleReviewAction('reject')}
                className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Decline Submission</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleReviewAction('approve')}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Credit Wallet (₦{selectedSub.rewardAmount.toFixed(2)})</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
