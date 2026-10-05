import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Users,
  Copy,
  CheckCircle2,
  Share2,
  Award,
  TrendingUp,
  MessageCircle,
  Twitter,
  Send,
  UserCheck
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function ReferralsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await api.getReferrals();
      setData(res);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const referralCode = data?.referralCode || user?.referralCode || '';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast('Referral code copied!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral invite link copied!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareText = encodeURIComponent(
    `Join EarnFlow and start earning real rewards by completing simple micro-tasks and surveys! Sign up using my invite code: ${referralCode}\n${referralLink}`
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Referral Program
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Invite friends to EarnFlow and earn bonus rewards for every active member you introduce.
        </p>
      </div>

      {/* Referral Link & Code Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-subtle">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
            Your Invitation Assets
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-dark mt-2">
            Share Your Link & Earn ₦250.00 Per Friend
          </h2>
          <p className="text-sm text-surface-muted mt-1">
            When friends sign up using your referral code and participate on EarnFlow, you receive ₦250.00 directly credited to your wallet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-surface-border flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-surface-muted font-bold">
                Your Referral Code
              </div>
              <div className="text-xl font-mono font-black text-dark tracking-wider">
                {referralCode}
              </div>
            </div>
            <button
              onClick={copyCode}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-dark border border-surface-border text-xs font-bold shadow-subtle transition flex items-center gap-1.5"
            >
              {copiedCode ? <CheckCircle2 className="w-4 h-4 text-brand-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Referral Link Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-surface-border flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-surface-muted font-bold">
                Unique Invite Link
              </div>
              <div className="text-xs font-mono text-dark truncate">
                {referralLink}
              </div>
            </div>
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Social Sharing Buttons */}
        <div className="pt-4 border-t border-surface-border flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-surface-muted uppercase tracking-wider mr-2">
            Share directly:
          </span>
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-dark text-xs font-bold border border-slate-300 transition flex items-center gap-2"
          >
            <Twitter className="w-4 h-4" />
            <span>X (Twitter)</span>
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-blue-600" />
            <span>Telegram</span>
          </a>
        </div>
      </div>

      {/* Referral Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-surface-muted">Total Referrals</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-dark tracking-tight">
            {data?.stats?.totalReferrals || 0}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-surface-muted">Successful Referrals</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-dark tracking-tight">
            {data?.stats?.successfulReferrals || 0}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-surface-muted">Referral Rewards</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-brand-600 tracking-tight">
            ₦{Number(data?.stats?.referralRewards || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        <h2 className="text-lg font-bold text-dark mb-1">Referral History</h2>
        <p className="text-xs text-surface-muted mb-6">Friends who joined using your code</p>

        {loading ? (
          <LoadingSpinner text="Fetching referral network..." />
        ) : !data?.referrals || data.referrals.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No referrals recorded yet."
            description="Copy your referral link above and share it with friends to begin building your network."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3">Joined Date</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {data.referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-3 font-semibold text-dark">
                      {r.name}
                    </td>
                    <td className="py-4 px-3 text-xs text-surface-muted">
                      {new Date(r.joinedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          r.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right font-black text-brand-600">
                      ₦{r.rewardAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
