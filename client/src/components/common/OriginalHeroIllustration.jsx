import React from 'react';
import { CheckCircle2, TrendingUp, Wallet, Award, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function OriginalHeroIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none aspect-square sm:aspect-[4/3] flex items-center justify-center">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-brand-200/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-emerald-300/30 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="relative w-full h-full max-h-[460px] flex items-center justify-center p-4">
        {/* Main Central Card: Fintech Wallet Balance */}
        <div className="w-[88%] sm:w-[320px] bg-white rounded-2xl p-6 shadow-xl border border-surface-border relative z-20 transform hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-muted">
                Available Balance
              </span>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
          </div>

          <div className="mb-4">
            <div className="text-3xl font-extrabold text-dark tracking-tight">
              ₦24,850<span className="text-xl font-normal text-surface-muted">.00</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-brand-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+₦1,250 earned today</span>
            </div>
          </div>

          {/* Mini Upward Growth Graph */}
          <div className="w-full h-14 bg-slate-50 rounded-xl p-2 flex items-end justify-between gap-1.5 border border-slate-100">
            <div className="w-full bg-brand-100 rounded-t h-[30%]" />
            <div className="w-full bg-brand-200 rounded-t h-[45%]" />
            <div className="w-full bg-brand-300 rounded-t h-[60%]" />
            <div className="w-full bg-brand-400 rounded-t h-[50%]" />
            <div className="w-full bg-brand-500 rounded-t h-[75%]" />
            <div className="w-full bg-brand-600 rounded-t h-[90%]" />
            <div className="w-full bg-brand-700 rounded-t h-[100%]" />
          </div>

          {/* Quick Action Pill */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-surface-muted font-medium">Ready to withdraw</span>
            <span className="text-brand-600 font-bold flex items-center gap-0.5">
              Request <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Floating Element 1: Top Right - Task Completed Badge */}
        <div className="absolute top-4 sm:top-8 right-2 sm:right-6 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg border border-emerald-100 flex items-center gap-3 z-30 transform translate-x-1 hover:scale-105 transition-all">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-surface-muted">Survey Completed</div>
            <div className="text-sm font-bold text-dark flex items-center gap-1">
              +₦600.00 <span className="text-[10px] text-emerald-600 font-semibold">Credited</span>
            </div>
          </div>
        </div>

        {/* Floating Element 2: Bottom Left - Referral Reward Badge */}
        <div className="absolute bottom-6 sm:bottom-10 left-2 sm:left-4 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-100 flex items-center gap-3 z-30 hover:scale-105 transition-all">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-surface-muted">Referral Bonus</div>
            <div className="text-sm font-bold text-dark">
              ₦250.00 <span className="text-[10px] text-amber-600 font-medium">Unlocked</span>
            </div>
          </div>
        </div>

        {/* Floating Element 3: Bottom Right - Bank Transfer Verified */}
        <div className="hidden sm:flex absolute bottom-2 right-8 bg-dark text-white rounded-xl py-2 px-3.5 shadow-xl items-center gap-2 z-30 text-xs">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span className="font-semibold">NUBAN Direct Payouts</span>
        </div>

        {/* Background Geometric Accent Rings */}
        <div className="absolute w-[95%] h-[95%] border border-dashed border-emerald-200/80 rounded-3xl pointer-events-none -z-5" />
      </div>
    </div>
  );
}
