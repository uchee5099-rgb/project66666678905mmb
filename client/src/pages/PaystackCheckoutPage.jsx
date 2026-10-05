import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  PhoneCall,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export default function PaystackCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference = searchParams.get('reference') || `EF-ACT-${Date.now()}`;
  const amount = searchParams.get('amount') || '1000.00';
  const email = searchParams.get('email') || 'customer@earnflow.ng';
  const callbackUrl = searchParams.get('callback_url') || '/withdraw?payment=complete';

  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'transfer' | 'ussd'
  const [cardNumber, setCardNumber] = useState('4084 0840 0840 0840');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('408');
  const [cardPin, setCardPin] = useState('3310');
  const [step, setStep] = useState('input'); // 'input' | 'pin' | 'otp' | 'processing' | 'success'
  const [otp, setOtp] = useState('123456');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const formattedAmount = Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('9928371049');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    setStep('pin');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setStep('processing');
    setStatusMessage('Authenticating with bank...');

    setTimeout(() => {
      setStep('otp');
    }, 1200);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setStep('processing');
    setStatusMessage('Securing transaction with Paystack...');

    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        completePayment();
      }, 2000);
    }, 1500);
  };

  const handleTransferSent = () => {
    setStep('processing');
    setStatusMessage('Confirming bank transfer...');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        completePayment();
      }, 2000);
    }, 1800);
  };

  const completePayment = () => {
    // If callbackUrl is relative or full URL
    const targetUrl = new URL(callbackUrl, window.location.origin);
    targetUrl.searchParams.set('reference', reference);
    targetUrl.searchParams.set('trxref', reference);
    targetUrl.searchParams.set('status', 'success');

    window.location.href = targetUrl.toString();
  };

  const handleCancel = () => {
    navigate('/withdraw');
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center p-4 sm:p-6 text-gray-800">
      {/* Top Paystack Banner */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between text-xs text-gray-500">
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 hover:text-gray-900 transition font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Cancel and return to EarnFlow
        </button>
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full text-[11px]">
          Paystack Test / Sandbox Mode
        </span>
      </div>

      {/* Main Checkout Container */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header with Paystack Blue Branding */}
        <div className="bg-[#011B33] text-white p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0BA4DB] flex items-center justify-center font-black text-white text-base tracking-tighter">
                P
              </div>
              <div>
                <div className="text-xs text-gray-300 font-medium tracking-wide">SECURED BY</div>
                <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                  Paystack <Lock className="w-3 h-3 text-[#0BA4DB]" />
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-300 font-medium">Merchant</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                EarnFlow Limited
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-400">Customer</div>
              <div className="text-xs text-gray-200 font-mono truncate max-w-[200px]">{email}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium">Amount to Pay</div>
              <div className="text-2xl font-black text-[#0BA4DB]">₦{formattedAmount}</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 border-4 border-[#0BA4DB]/20 border-t-[#0BA4DB] rounded-full animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-900">{statusMessage}</h3>
              <p className="text-xs text-gray-500 mt-1">Please do not close or refresh this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <h3 className="text-xl font-extrabold text-emerald-800">Payment Successful!</h3>
              <p className="text-xs text-gray-600 mt-1">
                ₦{formattedAmount} was successfully charged to your account.
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-500 border border-gray-100">
                Reference: {reference}
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#0BA4DB]">
                <div className="w-3 h-3 border-2 border-[#0BA4DB]/30 border-t-[#0BA4DB] rounded-full animate-spin" />
                <span>Redirecting back to EarnFlow...</span>
              </div>
            </div>
          )}

          {step === 'pin' && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-base font-bold text-gray-900">Enter Your Card PIN</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Please enter your 4-digit card PIN to authorize payment of ₦{formattedAmount}.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardPin}
                    onChange={(e) => setCardPin(e.target.value)}
                    className="w-full text-center tracking-[1em] text-2xl font-black py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0BA4DB] focus:outline-none"
                    placeholder="••••"
                    required
                  />
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    Sandbox default test PIN is <span className="font-bold text-gray-700">3310</span>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="flex-1 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-2 w-full py-3 rounded-xl bg-[#0BA4DB] hover:bg-[#0991c2] text-white text-xs font-extrabold shadow-sm transition"
                  >
                    Authorize ₦{formattedAmount}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-base font-bold text-gray-900">3D-Secure One-Time Password</h3>
                <p className="text-xs text-gray-500 mt-1">
                  A verification code has been sent to your simulated bank phone number.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0BA4DB] focus:outline-none"
                    placeholder="123456"
                    required
                  />
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    Enter <span className="font-bold text-gray-700">123456</span> or any 6 digits to verify.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
                >
                  Verify & Complete Payment
                </button>
              </form>
            </div>
          )}

          {step === 'input' && (
            <div>
              {/* Payment Channel Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                    activeTab === 'card'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('transfer')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                    activeTab === 'transfer'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ussd')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                    activeTab === 'ussd'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  USSD
                </button>
              </div>

              {/* CARD PAYMENT TAB */}
              {activeTab === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      CARD NUMBER
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4084 0840 0840 0840"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-[#0BA4DB] focus:outline-none"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          TEST CARD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        CARD EXPIRY
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-[#0BA4DB] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="408"
                        maxLength={4}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-[#0BA4DB] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 rounded-xl bg-[#0BA4DB] hover:bg-[#0991c2] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₦{formattedAmount}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* BANK TRANSFER TAB */}
              {activeTab === 'transfer' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <div className="text-xs text-blue-700 font-medium">Transfer ₦{formattedAmount} to:</div>
                    <div className="text-xl font-mono font-bold text-blue-950 mt-1 tracking-wider">
                      9928371049
                    </div>
                    <div className="text-xs font-semibold text-blue-800 mt-1">
                      Titan Paystack Bank
                    </div>
                    <div className="text-[11px] text-blue-600 mt-0.5">
                      Beneficiary: EarnFlow Activation / Paystack
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied Account' : 'Copy Account Number'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTransferSent}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I have sent the ₦{formattedAmount}</span>
                  </button>
                </div>
              )}

              {/* USSD TAB */}
              {activeTab === 'ussd' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-2">Dial the test Paystack USSD code on your mobile phone:</p>
                    <div className="text-lg font-mono font-black text-gray-900 bg-white py-2 px-3 rounded-lg border border-gray-200">
                      *737*000*4928#
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTransferSent}
                    className="w-full py-3.5 rounded-xl bg-[#0BA4DB] hover:bg-[#0991c2] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Confirm USSD Payment</span>
                  </button>
                </div>
              )}

              {/* Security Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted Payment Gateway</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reference note */}
      <div className="w-full max-w-lg mt-3 text-center text-[11px] text-gray-400 font-mono">
        Transaction Reference: {reference}
      </div>
    </div>
  );
}
