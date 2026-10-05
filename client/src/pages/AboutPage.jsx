import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Award, Users, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3.5 py-1 rounded-full">
          About EarnFlow
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight mt-4">
          Empowering Everyday People with Verified Online Rewards
        </h1>
        <p className="text-base sm:text-lg text-surface-muted mt-4 leading-relaxed">
          EarnFlow was built on a simple premise: connecting brands needing genuine user engagement, market feedback, and app testing with individuals looking to monetize their spare time.
        </p>
      </div>

      {/* Grid of Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">Transparency & Integrity</h3>
          <p className="text-sm text-surface-muted leading-relaxed">
            Every task clearly outlines instructions, reward criteria, and verification standards. Real payouts backed by authentic brand partnerships.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">Fair Value Micro-tasks</h3>
          <p className="text-sm text-surface-muted leading-relaxed">
            From consumer surveys to app navigation testing, tasks are priced fairly based on the time and quality required.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-subtle">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">Community Growth</h3>
          <p className="text-sm text-surface-muted leading-relaxed">
            Rewarding our active members with referral incentives and high-performing task contributor bonuses.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-surface-border shadow-card mb-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-dark mb-4">Our Mission</h2>
          <p className="text-sm sm:text-base text-surface-muted leading-relaxed mb-4">
            We bridge the gap between African and global internet users and businesses seeking genuine market intelligence. Our automated workflow verifies completed assignments promptly, depositing earnings directly into member wallets.
          </p>
          <p className="text-sm sm:text-base text-surface-muted leading-relaxed">
            Whether you want to earn supplemental income during your commute or help local fintechs refine their digital customer experience, EarnFlow is designed for you.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
        >
          <span>Join EarnFlow Today</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
