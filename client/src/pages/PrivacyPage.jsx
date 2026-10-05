import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-surface-border shadow-card">
        <h1 className="text-3xl font-extrabold text-dark mb-2">Privacy Policy</h1>
        <p className="text-xs text-surface-muted mb-8">Effective Date: September 14, 2026</p>

        <div className="space-y-6 text-sm text-surface-muted leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-dark mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide directly during registration and platform usage, including your full name, email address, phone number, and banking details submitted for withdrawals.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-dark mb-2">2. Security of Your Account</h2>
            <p>
              Passwords are encrypted using industry-standard salted bcrypt algorithms. We enforce secure HTTPS transport, token authorization, and rate-limiting safeguards against unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-dark mb-2">3. How Your Data Is Used</h2>
            <p>
              Your personal data is used solely to verify completed tasks, disburse approved financial rewards, prevent fraudulent activity, and notify you regarding account changes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-dark mb-2">4. Third-Party Sharing</h2>
            <p>
              EarnFlow never sells your personal contact details to advertisers or third-party marketers. Information submitted during survey tasks is anonymized unless explicitly requested.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
