import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, CheckSquare, Wallet, Award, AlertCircle, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Create Your Free Account',
      desc: 'Register with your name, valid email address, and phone number in under two minutes. You will immediately receive a unique referral link and full access to the task marketplace.',
      icon: UserCheck
    },
    {
      num: '02',
      title: 'Browse Available Tasks',
      desc: 'Filter tasks by category: Surveys, App Reviews, Social Engagement, and Research. Each task states the estimated completion time, requirements, and reward amount in Nigerian Naira (₦).',
      icon: CheckSquare
    },
    {
      num: '03',
      title: 'Submit Required Evidence',
      desc: 'Carefully follow the instructions. When finished, submit your proof—such as a completion token, brief written summary, or screenshot link—into the task submission portal.',
      icon: Award
    },
    {
      num: '04',
      title: 'Receive Wallet Credit & Withdraw',
      desc: 'Once our compliance team verifies your submission, the reward shifts from "Pending" to "Available Balance". When you reach ₦1,000, request a direct payout to your Nigerian bank account.',
      icon: Wallet
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3.5 py-1 rounded-full">
          Step-by-Step Guide
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight mt-4">
          How EarnFlow Works
        </h1>
        <p className="text-base sm:text-lg text-surface-muted mt-3">
          Follow our four simple steps to start earning and managing your online task rewards today.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-8 mb-16">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                  Step {step.num}
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
                <p className="text-sm text-surface-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidelines Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 mb-16 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-base font-bold text-amber-900 mb-1">Verification Guidelines</h3>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            To ensure a fair rewards ecosystem, all submitted proofs are reviewed for originality and completeness. Do not submit duplicate, copied, or fraudulent proof. Accounts found violating community guidelines will be suspended.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
