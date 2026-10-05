import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ArrowUpRight, Wallet, User, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, wallet, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={`sticky top-0 z-40 h-[72px] transition-all duration-200 ${
        isScrolled
          ? 'glass-header border-b border-surface-border shadow-subtle'
          : 'bg-white/95 border-b border-surface-border/60'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Icon */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-5 h-5 text-white"
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
          <div>
            <span className="text-xl font-extrabold tracking-tight text-dark flex items-center">
              Earn<span className="text-brand-600">Flow</span>
            </span>
            <span className="hidden sm:block text-[10px] text-surface-muted font-medium -mt-1 tracking-wider uppercase">
              Online Rewards
            </span>
          </div>
        </Link>

        {/* Center/Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-surface-muted hover:text-dark hover:bg-slate-100/70'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold text-dark transition"
              >
                <Wallet className="w-4 h-4 text-brand-600" />
                <span>₦{Number(wallet?.availableBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition duration-150"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-surface-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-dark hover:text-brand-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm hover:shadow-glow transition duration-200"
              >
                Get Started
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold"
            >
              <Wallet className="w-3.5 h-3.5" />
              ₦{Number(wallet?.availableBalance || 0).toFixed(0)}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-dark hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-white px-4 pt-3 pb-6 shadow-xl animate-fade-in">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-dark hover:bg-slate-50 transition"
              >
                {link.name}
                <ChevronRight className="w-4 h-4 text-surface-muted" />
              </Link>
            ))}

            <div className="border-t border-surface-border my-2 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white font-semibold shadow-sm"
                  >
                    Open Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="w-full text-center py-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-sm"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white font-semibold shadow-sm"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl border border-surface-border text-dark font-medium hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
