import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Send,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proofContent, setProofContent] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await api.getTaskById(id);
      setTask(res.task);
      if (res.task.userSubmission) {
        setProofContent(res.task.userSubmission.proofContent || '');
        setProofImageUrl(res.task.userSubmission.proofImageUrl || '');
        setIsStarted(true);
      }
    } catch (err) {
      console.error('Failed to load task:', err);
      showToast('Task not found.', 'error');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!proofContent.trim()) {
      showToast('Please enter your completion proof or summary.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitTask(id, { proofContent, proofImageUrl });
      showToast(res.message || 'Proof submitted successfully!', 'success');
      await refreshUser();
      await fetchTask();
    } catch (err) {
      showToast(err.message || 'Failed to submit task proof.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task details..." />;
  }

  if (!task) return null;

  const submission = task.userSubmission;
  const isApproved = submission?.status === 'approved';
  const isPending = submission?.status === 'pending';
  const isRejected = submission?.status === 'rejected';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Back Button */}
      <Link
        to="/tasks"
        className="inline-flex items-center gap-2 text-xs font-bold text-surface-muted hover:text-dark transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Available Tasks</span>
      </Link>

      {/* Main Task Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700">
              {task.category}
            </span>
            <span className="text-xs text-surface-muted flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-surface-muted" />
              {task.estimatedMinutes} minutes estimated
            </span>
          </div>

          <div className="text-right">
            <div className="text-xs text-surface-muted uppercase font-bold tracking-wider">Reward Amount</div>
            <div className="text-3xl font-black text-brand-600">
              ₦{task.rewardAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-4">
          {task.title}
        </h1>

        <p className="text-base text-surface-muted leading-relaxed mb-6">
          {task.description}
        </p>

        {/* Submission Status Banner (if user already submitted) */}
        {submission && (
          <div
            className={`p-4 rounded-2xl border mb-6 flex items-start gap-3.5 text-xs ${
              isApproved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isPending
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : isPending ? (
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                Status:{' '}
                {isApproved
                  ? 'Approved & Reward Credited'
                  : isPending
                  ? 'Pending Compliance Review'
                  : 'Declined / Re-submission Permitted'}
              </div>
              <p className="mt-1 leading-relaxed">
                {isApproved
                  ? `Your evidence was verified. ₦${task.rewardAmount.toFixed(2)} is credited to your available balance.`
                  : isPending
                  ? `Your proof is in the administrative review queue. ₦${task.rewardAmount.toFixed(2)} is held in pending rewards.`
                  : submission.adminNotes || 'Please review requirements and re-submit your proof.'}
              </p>
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="border-t border-surface-border pt-6 mb-8">
          <h2 className="text-base font-bold text-dark uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            Instructions
          </h2>
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-sm text-dark font-mono whitespace-pre-line leading-relaxed">
            {task.instructions}
          </div>
        </div>

        {/* Requirements */}
        <div className="border-t border-surface-border pt-6 mb-8">
          <h2 className="text-base font-bold text-dark uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Requirements & Verification Rules
          </h2>
          <p className="text-sm text-surface-muted leading-relaxed">
            {task.requirements}
          </p>
        </div>

        {/* Action Button: Start Task or Open Submission Form */}
        {!isStarted && !submission && (
          <div className="pt-4 border-t border-surface-border text-center sm:text-left">
            <button
              onClick={() => setIsStarted(true)}
              className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
            >
              Start Task
            </button>
          </div>
        )}
      </div>

      {/* Proof Submission Card (Shown when user clicks Start Task or re-submitting) */}
      {isStarted && (!isApproved && !isPending) && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark">Submit Evidence of Completion</h2>
            <p className="text-xs text-surface-muted mt-1">
              Provide your completion tokens, feedback text, or image proof link to receive your ₦{task.rewardAmount.toFixed(2)} reward.
            </p>
          </div>

          <form onSubmit={handleSubmitProof} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Proof Description / Token / Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                required
                value={proofContent}
                onChange={(e) => setProofContent(e.target.value)}
                placeholder="Paste confirmation code, token, username, or summary of your completed task..."
                className="w-full p-4 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Screenshot / Evidence URL (Optional)
              </label>
              <input
                type="url"
                value={proofImageUrl}
                onChange={(e) => setProofImageUrl(e.target.value)}
                placeholder="https://postimages.org/... or public image link"
                className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
              />
              <span className="text-[11px] text-surface-muted mt-1 block">
                If the task requested a screenshot, paste a link to your uploaded image.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Evidence...</span>
                </>
              ) : (
                <>
                  <span>Submit Task</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
