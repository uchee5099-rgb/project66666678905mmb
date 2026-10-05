import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: EarnFlow Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/20">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="m17 7-5-5-5 5" />
                  <path d="M4 14h16" />
                  <circle cx="12" cy="14" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-dark">
                Earn<span className="text-brand-600">Flow</span>
              </span>
            </Link>
            <p className="text-surface-muted text-sm leading-relaxed">
              Your Gateway to Online Rewards. Complete tasks, participate in verified surveys, invite friends, and manage your payouts securely from one intuitive fintech platform.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-700 bg-brand-50/70 border border-brand-200/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Verified & Compliant System</span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="text-sm font-semibold text-dark uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-surface-muted hover:text-brand-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="text-surface-muted hover:text-brand-600 transition">
                  Browse Tasks
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-surface-muted hover:text-brand-600 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="text-surface-muted hover:text-brand-600 transition">
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-sm font-semibold text-dark uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-surface-muted hover:text-brand-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-surface-muted hover:text-brand-600 transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@earnflow.ng"
                  className="text-surface-muted hover:text-brand-600 transition"
                >
                  support@earnflow.ng
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-dark uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/terms" className="text-surface-muted hover:text-brand-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-surface-muted hover:text-brand-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-xs text-surface-muted block mt-3 leading-relaxed">
                  Demonstration figures on public pages are for display purposes until real-time platform metrics accumulate.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-muted">
          <p>© 2026 EarnFlow. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Nigeria & Global Online Task Rewards
          </p>
        </div>
      </div>
    </footer>
  );
}
