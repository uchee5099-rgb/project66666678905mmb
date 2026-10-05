import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Wallet,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  ExternalLink,
  Sparkles,
  CreditCard,
  Building
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_ec3ec80f29d09bebab36838824c6ad2e30dae836';

export default function WithdrawPage() {
  const { user, wallet, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [withdrawals, setWithdrawals] = useState([]);
  const [minWithdrawal, setMinWithdrawal] = useState(1000.00);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    bankName: 'Access Bank',
    accountNumber: '',
    accountName: '',
  });

  const [errors, setErrors] = useState({});

  const nigerianBanks = [
    'Access Bank',
    'Zenith Bank',
    'Guaranty Trust Bank (GTBank)',
    'First Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Kuda Microfinance Bank',
    'OPay Digital Services',
    'PalmPay Limited',
    'Moniepoint Microfinance Bank',
    'Stanbic IBTC Bank',
    'Fidelity Bank',
    'First City Monument Bank (FCMB)',
    'Sterling Bank',
    'Union Bank of Nigeria',
    'Wema Bank (ALAT)'
  ];

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.getWithdrawals();
      setWithdrawals(res.withdrawals || []);
      if (res.minWithdrawal) setMinWithdrawal(res.minWithdrawal);
      await refreshUser();
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check URL query parameters for return from Paystack redirect
  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('trxref');
    if (ref) {
      handleVerifyReference(ref);
      // Clean up search params from address bar
      setSearchParams({});
    } else {
      fetchWithdrawals();
    }
  }, []);

  const handleVerifyReference = async (ref) => {
    try {
      setActivating(true);
      const res = await api.verifyActivation(ref);
      showToast(res.message || 'Payment verified. Pending admin confirmation.', 'success');
      await refreshUser();
      await fetchWithdrawals();
    } catch (err) {
      showToast(err.message || 'Payment verification failed.', 'error');
      setActivationError(err.message);
    } finally {
      setActivating(false);
    }
  };

  /**
   * Handle Account Activation with Paystack
   * Directly redirects the user to the Paystack Payment Gateway
   */
  const handleActivateAccount = async () => {
    setActivating(true);
    setActivationError('');

    try {
      showToast('Connecting to Paystack gateway...', 'info');
      
      // Initialize transaction via backend to get the official Paystack authorization URL
      const res = await api.initializeActivation();

      if (res && res.authorizationUrl) {
        showToast('Redirecting to Paystack payment gateway...', 'success');
        // Direct redirect to the Paystack payment gateway
        window.location.href = res.authorizationUrl;
      } else {
        throw new Error('Unable to initialize Paystack gateway session.');
      }
    } catch (err) {
      console.error('Account activation error:', err);
      setActivationError(err.message || 'Failed to launch payment gateway.');
      showToast(err.message || 'Failed to start payment gateway.', 'error');
      setActivating(false);
    }
  };

  const validate = () => {
    const errs = {};

    // Check account activation
    if (!user?.isActivated) {
      errs.activation = 'account not activated';
      showToast('account not activated', 'error');
      setErrors(errs);
      return false;
    }

    const amt = parseFloat(formData.amount);
    const available = Number(wallet?.availableBalance || 0);

    if (isNaN(amt) || amt <= 0) {
      errs.amount = 'Please enter an amount greater than zero.';
    } else if (amt < minWithdrawal) {
      errs.amount = `Minimum withdrawal amount is ₦${minWithdrawal.toFixed(2)}.`;
    } else if (amt > available) {
      errs.amount = `Insufficient funds. Your available balance is ₦${available.toFixed(2)}.`;
    }

    if (!formData.bankName) {
      errs.bankName = 'Please select a bank.';
    }

    const cleanAcc = formData.accountNumber.replace(/\D/g, '');
    if (!cleanAcc || cleanAcc.length !== 10) {
      errs.accountNumber = 'Account number must be exactly 10 digits.';
    }

    if (!formData.accountName.trim()) {
      errs.accountName = 'Account name is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: Account must be confirmed and activated by admin
    if (!user?.isActivated) {
      showToast('account not activated', 'error');
      setErrors({ form: 'account not activated' });
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.requestWithdrawal({
        amount: parseFloat(formData.amount),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber.trim(),
        accountName: formData.accountName.trim(),
      });

      showToast(res.message || 'Withdrawal request submitted successfully.', 'success');
      setFormData({
        amount: '',
        bankName: 'Access Bank',
        accountNumber: '',
        accountName: '',
      });
      await fetchWithdrawals();
    } catch (err) {
      // If error message is "account not activated", show exact prompt message
      showToast(err.message || 'Failed to submit withdrawal request.', 'error');
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const availableBalance = Number(wallet?.availableBalance || 0);
  const isActivated = Boolean(user?.isActivated);
  const isPendingAdmin = user?.activationStatus === 'pending_confirmation';

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Request Withdrawal
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Disburse your approved task earnings directly to your verified Nigerian bank account.
        </p>
      </div>

      {/* ============================================================ */}
      {/* ACCOUNT ACTIVATION STATUS BANNER / GATEWAY                   */}
      {/* ============================================================ */}
      {!isActivated ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 bg-amber-100 text-amber-900">
                {isPendingAdmin ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pending Admin Confirmation</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Account Not Activated</span>
                  </>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-dark">
                {isPendingAdmin
                  ? 'Activation Payment Received — Pending Admin Confirmation'
                  : 'Activate Your Account to Enable Withdrawals'}
              </h2>

              <p className="text-sm text-surface-muted mt-2 leading-relaxed">
                {isPendingAdmin ? (
                  <>
                    Your ₦1,000 activation payment{' '}
                    {user?.activationReference && (
                      <span className="font-mono font-bold text-dark">
                        (Ref: {user.activationReference})
                      </span>
                    )}{' '}
                    was received via Paystack. Your account is currently awaiting administrative compliance review and confirmation before bank payouts are unlocked.
                  </>
                ) : (
                  <>
                    To enable withdrawals on your EarnFlow profile, a one-time account activation fee of{' '}
                    <strong className="text-dark font-bold">₦1,000.00</strong> is required via our verified Paystack gateway. Once paid, an administrator will confirm your account.
                  </>
                )}
              </p>

              {activationError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{activationError}</span>
                </div>
              )}
            </div>

            {/* Action CTA */}
            <div className="flex-shrink-0 w-full md:w-auto">
              {isPendingAdmin ? (
                <div className="flex flex-col items-center gap-2 text-center p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Under Admin Review</span>
                  </div>
                  <span className="text-[11px] text-surface-muted max-w-[200px]">
                    Administrators typically review and confirm activations within 15–30 minutes.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleActivateAccount}
                  disabled={activating}
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-md hover:shadow-glow transition flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  {activating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connecting to Paystack...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Activate Account (₦1,000)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Account Status: Activated & Verified
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                Your account has been confirmed by administration. Bank withdrawals are fully enabled.
              </div>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-600 text-white rounded-full uppercase tracking-wider">
            Verified
          </span>
        </div>
      )}

      {/* Balance Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-surface-muted">Available Balance</div>
            <div className="text-2xl sm:text-3xl font-black text-brand-600 mt-1">
              ₦{availableBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-surface-muted">Minimum Withdrawal</div>
            <div className="text-2xl sm:text-3xl font-black text-dark mt-1">
              ₦{minWithdrawal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-surface-muted">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card relative">
        {!isActivated && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>
              <strong>account not activated:</strong> You must activate your account and obtain administrator confirmation before submitting withdrawals.
            </span>
          </div>
        )}

        <h2 className="text-lg font-bold text-dark mb-1">Bank Account Transfer Details</h2>
        <p className="text-xs text-surface-muted mb-6">
          Transfers are processed in Nigerian Naira via verified NUBAN settlement channels.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Withdrawal Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark font-bold">₦</span>
              <input
                type="number"
                step="0.01"
                disabled={!isActivated}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000.00"
                className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none transition disabled:bg-slate-50 disabled:cursor-not-allowed ${
                  errors.amount
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-surface-border focus:border-brand-500'
                }`}
              />
            </div>
            {errors.amount ? (
              <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
            ) : (
              <span className="text-[11px] text-surface-muted mt-1 block">
                Must be at least ₦{minWithdrawal.toFixed(2)} and cannot exceed ₦{availableBalance.toFixed(2)}.
              </span>
            )}
          </div>

          {/* Bank Name Dropdown */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Select Bank
            </label>
            <select
              disabled={!isActivated}
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500 bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              {nigerianBanks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              NUBAN Account Number
            </label>
            <input
              type="text"
              maxLength={10}
              disabled={!isActivated}
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="10-digit account number"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-wider focus:outline-none transition disabled:bg-slate-50 disabled:cursor-not-allowed ${
                errors.accountNumber
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-surface-border focus:border-brand-500'
              }`}
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.accountNumber}</p>
            )}
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Account Holder Full Name
            </label>
            <input
              type="text"
              disabled={!isActivated}
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              placeholder="Full name as registered with your bank"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition disabled:bg-slate-50 disabled:cursor-not-allowed ${
                errors.accountName
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-surface-border focus:border-brand-500'
              }`}
            />
            {errors.accountName && (
              <p className="text-xs text-red-600 mt-1">{errors.accountName}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !isActivated || availableBalance < minWithdrawal}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Request...</span>
              </>
            ) : !isActivated ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Account Not Activated — Activation Required</span>
              </>
            ) : (
              <>
                <span>Request Withdrawal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Withdrawal Request History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        <h2 className="text-lg font-bold text-dark mb-1">Withdrawal Requests</h2>
        <p className="text-xs text-surface-muted mb-6">Status of your submitted disbursements</p>

        {loading ? (
          <LoadingSpinner text="Fetching withdrawal history..." />
        ) : withdrawals.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No withdrawal requests found."
            description="When you request payouts, their settlement status will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Bank Details</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-3 text-xs text-surface-muted whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-bold text-dark">{w.bankName}</div>
                      <div className="text-xs text-surface-muted font-mono">
                        {w.accountNumber} • {w.accountName}
                      </div>
                      {w.adminNotes && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 p-1 rounded mt-1">
                          Note: {w.adminNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3 text-right font-black text-dark whitespace-nowrap">
                      ₦{w.amount.toFixed(2)}
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
