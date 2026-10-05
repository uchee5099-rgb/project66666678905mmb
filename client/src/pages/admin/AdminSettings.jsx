import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Settings, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    min_withdrawal: '1000.00',
    referral_bonus: '250.00',
    maintenance_mode: 'false'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSettings();
      if (res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAdminSettings({
        minWithdrawal: settings.min_withdrawal,
        referralBonus: settings.referral_bonus,
        maintenanceMode: settings.maintenance_mode
      });
      showToast('System settings updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading system configurations..." />;
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Platform System Settings
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Adjust global withdrawal limits, referral incentives, and maintenance modes.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-subtle">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Minimum Withdrawal Threshold (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark font-bold">₦</span>
              <input
                type="number"
                step="50"
                required
                value={settings.min_withdrawal}
                onChange={(e) => setSettings({ ...settings, min_withdrawal: e.target.value })}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border text-sm font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
            <span className="text-xs text-surface-muted mt-1 block">
              Users cannot request a payout until their available balance reaches this threshold.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Referral Reward Bonus (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark font-bold">₦</span>
              <input
                type="number"
                step="10"
                required
                value={settings.referral_bonus}
                onChange={(e) => setSettings({ ...settings, referral_bonus: e.target.value })}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border text-sm font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
            <span className="text-xs text-surface-muted mt-1 block">
              Credited to a member when their referred friend registers and participates.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Platform Maintenance Mode
            </label>
            <select
              value={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500 bg-white"
            >
              <option value="false">Active / Operational (Default)</option>
              <option value="true">Under Scheduled Maintenance</option>
            </select>
          </div>

          <div className="pt-4 border-t border-surface-border">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
