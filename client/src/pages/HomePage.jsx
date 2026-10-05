import React from 'react';
import { Link } from 'react-router-dom';
import OriginalHeroIllustration from '../components/common/OriginalHeroIllustration';
import {
  CheckCircle,
  Users,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const demoStats = [
    { value: '10K+', label: 'Active Users', icon: Users, note: 'Registered community' },
    { value: '₦5M+', label: 'Rewards Processed', icon: Wallet, note: 'Approved payouts' },
    { value: '50+', label: 'Available Tasks', icon: Zap, note: 'Daily micro-tasks' },
    { value: '24/7', label: 'Support', icon: ShieldCheck, note: 'Assistance available' },
  ];

  const features = [
    {
      icon: CheckCircle,
      title: 'Simple Tasks',
      description: 'Browse available tasks and complete eligible activities from one convenient dashboard.',
      badge: 'Fast Review'
    },
    {
      icon: Users,
      title: 'Referral Rewards',
      description: 'Invite friends using your personal referral link and track eligible referral rewards.',
      badge: '₦250 / Friend'
    },
    {
      icon: Wallet,
      title: 'Easy Withdrawals',
      description: 'Request withdrawals when your available balance meets the configured minimum.',
      badge: 'NUBAN Direct'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Account',
      description: 'Your account information is protected using appropriate security practices.',
      badge: 'Bank Grade'
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Sign Up',
      description: 'Create your account and complete the required information.'
    },
    {
      num: '02',
      title: 'Complete Tasks',
      description: 'Browse available tasks and submit completed work.'
    },
    {
      num: '03',
      title: 'Receive Rewards',
      description: 'Approved rewards are added to your available balance.'
    }
  ];

  const faqs = [
    {
      q: 'How do I start earning on EarnFlow?',
      a: 'Register for a free account, browse available tasks in the marketplace, follow the exact instructions for each task, and submit your completion proof for verification.'
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The platform minimum withdrawal threshold is ₦1,000.00. Once your approved balance meets this requirement, you can request a direct transfer to any verified Nigerian commercial bank.'
    },
    {
      q: 'How does the referral program work?',
      a: 'Every member receives a unique referral code and tracking link. When friends sign up and qualify, you earn ₦250.00 directly in your wallet.'
    },
    {
      q: 'How long does task verification take?',
      a: 'Most tasks are reviewed and verified by our administrative moderation team within 12 to 24 hours.'
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* ============================================================ */}
      {/* SECTION 1 — HERO                                             */}
      {/* ============================================================ */}
      <section className="relative min-h-[72vh] lg:min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>EarnFlow — Your Gateway to Online Rewards</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark tracking-tight leading-[1.12] mb-6">
              Earn Rewards by Completing <span className="text-brand-600">Simple Tasks</span>
            </h1>

            <p className="text-base sm:text-lg text-surface-muted max-w-xl leading-relaxed mb-8">
              Complete available tasks, earn rewards, invite friends, and manage your earnings from one simple platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md hover:shadow-glow transition duration-200"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-dark font-semibold text-base shadow-subtle transition duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Note */}
            <div className="mt-8 pt-6 border-t border-surface-border/60 flex items-center gap-4 text-xs text-surface-muted">
              <div className="flex items-center gap-1.5 text-brand-700 font-semibold">
                <CheckCircle className="w-4 h-4 text-brand-600" />
                <span>Free to join</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-brand-700 font-semibold">
                <CheckCircle className="w-4 h-4 text-brand-600" />
                <span>Daily task drops</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-brand-700 font-semibold">
                <CheckCircle className="w-4 h-4 text-brand-600" />
                <span>NUBAN payouts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Original Abstract Vector Illustration */}
          <div className="lg:col-span-6 w-full flex items-center justify-center">
            <OriginalHeroIllustration />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — STATISTICS                                       */}
      {/* ============================================================ */}
      <section className="bg-white border-y border-surface-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Demo disclaimer badge */}
          <div className="text-center mb-8">
            <span className="text-[11px] font-semibold text-surface-muted bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Demonstration Platform Metrics
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {demoStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-surface-light border border-surface-border rounded-2xl p-6 text-center hover:border-brand-300 hover:shadow-subtle transition duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 mx-auto mb-3 flex items-center justify-center text-brand-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-dark tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-dark mt-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-surface-muted mt-0.5">
                    {stat.note}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — WHY CHOOSE EARNFLOW                              */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
              Why Choose EarnFlow?
            </h2>
            <p className="text-base sm:text-lg text-surface-muted mt-3">
              Everything you need to complete tasks and manage your rewards in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-7 border border-surface-border hover:border-brand-200 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-2">{feature.title}</h3>
                    <p className="text-sm text-surface-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — HOW IT WORKS                                     */}
      {/* ============================================================ */}
      <section className="py-20 bg-white border-y border-surface-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
              Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mt-3">
              How It Works
            </h2>
            <p className="text-base text-surface-muted mt-2">
              Three clear steps between you and your online rewards.
            </p>
          </div>

          {/* Desktop Connected Steps & Mobile Stack */}
          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 left-24 right-24 h-0.5 bg-slate-200 -translate-y-6 z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 relative z-10">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="bg-surface-light lg:bg-white rounded-2xl p-8 border border-surface-border flex flex-col items-center text-center shadow-subtle hover:shadow-card transition duration-200"
                >
                  <div className="w-14 h-14 rounded-full bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-brand-600/20 mb-5 border-4 border-white">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
                  <p className="text-sm text-surface-muted leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ SECTION                                                  */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-surface-muted mt-2">
            Clear answers to common questions about earning and payouts.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-surface-border shadow-subtle"
            >
              <h3 className="text-base font-bold text-dark flex items-start gap-2.5 mb-2">
                <HelpCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-sm text-surface-muted pl-7 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — CTA                                              */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto rounded-3xl bg-dark text-white p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
              Create your account and explore available tasks today. Join thousands of users earning online rewards daily.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-base shadow-lg hover:shadow-glow transition duration-200"
            >
              Create Free Account
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
