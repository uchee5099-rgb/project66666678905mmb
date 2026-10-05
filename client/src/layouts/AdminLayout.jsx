import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  FileCheck,
  CreditCard,
  History,
  Settings,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ScrollText
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, isAuthenticated, loading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { name: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Users Management', path: '/admin/users', icon: Users },
    { name: 'Tasks Management', path: '/admin/tasks', icon: CheckSquare },
    { name: 'Submissions Review', path: '/admin/submissions', icon: FileCheck },
    { name: 'Withdrawals Queue', path: '/admin/withdrawals', icon: CreditCard },
    { name: 'Financial Ledger', path: '/admin/transactions', icon: History },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-dark text-slate-300 border-r border-slate-800 flex-shrink-0 h-screen sticky top-0">
        {/* Admin Header */}
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-dark font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-tight">EarnFlow</div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider -mt-1">
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* Back to User Dashboard button */}
        <div className="p-4">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Dashboard</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-amber-500 text-dark shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-dark' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs">
            <div className="text-white font-bold truncate max-w-[130px]">{user?.fullName}</div>
            <div className="text-amber-400 text-[10px]">Super Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-[72px] bg-dark text-white px-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-dark">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white">EarnFlow Admin</span>
          </div>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-dark text-white p-4 border-b border-slate-800 space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 text-xs font-bold text-amber-400 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to User Dashboard
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  location.pathname === item.path ? 'bg-amber-500 text-dark' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
