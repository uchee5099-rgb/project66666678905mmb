import React from 'react';

export default function TermsPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-surface-border shadow-card">
        <h1 className="text-3xl font-extrabold text-dark mb-2">Terms of Service</h1>
        <p className="text-xs text-surface-muted mb-8">Last Updated: September 14, 2026</p>

        <div className="space-y-6 text-sm text-surface-muted leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-dark mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or creating an account on EarnFlow, you agree to abide by these Terms of Service. If you disagree with any portion of these terms, you must refrain from using the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-dark mb-2">2. Eligibility & Registration</h2>
            <p>
              Users must provide accurate and verifiable personal details. Creation of multiple dummy accounts to exploit referral programs or duplicate task rewards constitutes a material breach and will result in immediate suspension and forfeiture of balances.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-dark mb-2">3. Task Submissions & Verification</h2>
            <p>
              Rewards are credited only upon genuine completion and administrative verification. The platform reserves the right to reject submissions that contain copied evidence, forged tokens, or false information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-dark mb-2">4. Withdrawals & Payouts</h2>
            <p>
              Withdrawals require reaching the platform minimum balance threshold (₦1,000.00). Payouts are made solely to verified Nigerian NUBAN bank accounts in the matching name of the account holder.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-dark mb-2">5. Platform Disclaimer</h2>
            <p>
              Demonstration figures displayed on public presentation pages reflect mock data for illustrative purposes until real-time platform metrics accumulate.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
