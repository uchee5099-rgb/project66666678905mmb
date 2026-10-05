import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { User, Lock, Save, ShieldCheck, Phone, Mail, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile(profileForm);
      showToast('Profile information updated successfully.', 'success');
      await refreshUser();
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword(passwordForm);
      showToast('Password changed successfully.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Account Profile & Security
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Manage your personal information, contact credentials, and login security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Card & Info */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle text-center">
          <div className="w-20 h-20 rounded-full bg-brand-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-brand-600/20">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <h2 className="text-lg font-bold text-dark">{user?.fullName}</h2>
          <p className="text-xs text-surface-muted mt-0.5">{user?.email}</p>

          <div className="mt-6 pt-6 border-t border-surface-border text-left space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-surface-muted">Referral Code:</span>
              <span className="font-mono font-bold text-dark">{user?.referralCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-muted">Account Status:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
                {user?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-muted">Member Since:</span>
              <span className="text-dark font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Forms Container */}
        <div className="md:col-span-7 space-y-8">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
            <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Edit Profile Information
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Email Address (Read Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
            <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-600" />
              Change Account Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-2.5 rounded-xl bg-dark hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
