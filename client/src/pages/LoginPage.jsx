import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin && from === '/dashboard' ? '/admin' : from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, from, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      showToast(`Welcome back, ${loggedUser.fullName}!`, 'success');
      navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Helper
  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password, rememberMe: true });
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login({ email, password, rememberMe: true });
      showToast(`Signed in as ${loggedUser.fullName}`, 'success');
      navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-surface-border animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/20">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20" />
                  <path d="m17 7-5-5-5 5" />
                  <path d="M4 14h16" />
                  <circle cx="12" cy="14" r="2.5" fill="currentColor" />
                </svg>
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-surface-muted mt-2">
              Sign in to manage your tasks, referrals, and rewards.
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="mb-6 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200/80">
            <div className="text-[11px] font-bold text-brand-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Quick Demo Sign-In (One-Click)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('chidi@earnflow.ng', 'UserPass123!')}
                className="py-2 px-2.5 rounded-xl bg-white hover:bg-brand-100/60 text-brand-900 border border-brand-200 text-xs font-bold text-left transition flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Regular User</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@earnflow.ng', 'AdminPass123!')}
                className="py-2 px-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold text-left transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin User</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-dark uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo accounts: \nUser: chidi@earnflow.ng / UserPass123!\nAdmin: admin@earnflow.ng / AdminPass123!')}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-muted hover:text-dark p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-brand-600 rounded border-surface-border focus:ring-brand-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-surface-muted select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-glow transition duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-surface-border text-center">
            <p className="text-sm text-surface-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
