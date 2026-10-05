import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  CreditCard,
  Users,
  User,
  Bell,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Wallet,
  ChevronDown
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, wallet, unreadCount, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Member';

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Earnings', path: '/earnings', icon: TrendingUp },
    { name: 'Withdraw', path: '/withdraw', icon: CreditCard },
    { name: 'Referrals', path: '/referrals', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-surface-border flex-shrink-0 h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-surface-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        </div>

        {/* User Balance Snippet in Sidebar */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-brand-50 border border-brand-100">
          <div className="text-[11px] font-semibold text-brand-800 uppercase tracking-wider flex items-center justify-between">
            <span>Available Balance</span>
            <Wallet className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-xl font-extrabold text-brand-900 mt-1">
            ₦{Number(wallet?.availableBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
          <Link
            to="/withdraw"
            className="mt-2.5 block text-center py-1.5 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
          >
            Withdraw Funds
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'text-surface-muted hover:text-dark hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-surface-muted'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-brand-600' : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 mt-4 transition"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-surface-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Top Header */}
        <header className="h-[72px] bg-white border-b border-surface-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-lg text-dark hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-dark tracking-tight">
                Welcome back, {firstName}
              </h1>
              <p className="text-xs text-surface-muted hidden sm:block">
                Here's an overview of your account.
              </p>
            </div>
          </div>

          {/* Right Top Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notifications Icon */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-surface-muted hover:text-dark hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-500 rounded-full ring-2 ring-white" />
              )}
            </Link>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-dark leading-tight">{user?.fullName}</div>
                  <div className="text-[10px] text-surface-muted font-mono">{user?.referralCode}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-surface-muted hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-surface-border py-1.5 z-40 animate-fade-in"
                  onMouseLeave={() => setProfileMenuOpen(false)}
                >
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:bg-slate-50"
                  >
                    <User className="w-3.5 h-3.5 text-surface-muted" />
                    My Profile
                  </Link>
                  <Link
                    to="/earnings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:bg-slate-50"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-surface-muted" />
                    Transaction History
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      Admin Control
                    </Link>
                  )}
                  <div className="border-t border-surface-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-b border-surface-border p-4 shadow-lg animate-fade-in">
            <div className="p-3 mb-3 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-brand-800 uppercase">Available Balance</div>
                <div className="text-lg font-bold text-brand-900">
                  ₦{Number(wallet?.availableBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <Link
                to="/withdraw"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg"
              >
                Withdraw
              </Link>
            </div>
            <div className="space-y-1">
              {sidebarLinks.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                      isActive ? 'bg-brand-600 text-white' : 'text-dark hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-800 border border-amber-200 mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
