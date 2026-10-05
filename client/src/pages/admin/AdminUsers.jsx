import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Search, Users, UserX, UserCheck, ShieldCheck, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activationFilter, setActivationFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers({
        search,
        status: statusFilter,
        activationStatus: activationFilter
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showToast('Failed to load user list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, activationFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to ${newStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE'} ${user.fullName}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setProcessingId(user.id);
      await api.updateUserStatus(user.id, {
        status: newStatus,
        reason: `Administrative action by supervisor`
      });
      showToast(`User ${user.fullName} is now ${newStatus}.`, 'success');
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user status.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmActivation = async (user) => {
    const confirmMsg = `Confirm account activation for ${user.fullName}?\n\nThis will officially unlock bank withdrawals for this member.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setProcessingId(user.id);
      const res = await api.confirmUserActivation(user.id);
      showToast(res.message || `Account activation confirmed for ${user.fullName}.`, 'success');
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to confirm account activation.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          User Account Management
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Inspect registered members, confirm Paystack account activations, and manage account statuses.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500 bg-white"
          />
          <Search className="w-4 h-4 text-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Account Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-surface-muted px-2">Account:</span>
            {['All', 'active', 'suspended'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  statusFilter === st
                    ? 'bg-white text-dark shadow-sm'
                    : 'text-surface-muted hover:text-dark'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Activation Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-surface-muted px-2">Activation:</span>
            {[
              { id: 'All', label: 'All' },
              { id: 'pending_confirmation', label: 'Pending Review' },
              { id: 'activated', label: 'Activated' },
              { id: 'unactivated', label: 'Unactivated' }
            ].map((af) => (
              <button
                key={af.id}
                onClick={() => setActivationFilter(af.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activationFilter === af.id
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-surface-muted hover:text-dark'
                }`}
              >
                {af.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        {loading ? (
          <LoadingSpinner text="Fetching users directory..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">User Details</th>
                  <th className="pb-3 px-3">Phone</th>
                  <th className="pb-3 px-3">Referral Code</th>
                  <th className="pb-3 px-3 text-right">Available Balance</th>
                  <th className="pb-3 px-3 text-center">Account Status</th>
                  <th className="pb-3 px-3 text-center">Activation Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((u) => {
                  const isProcessing = processingId === u.id;
                  const isPending = u.activationStatus === 'pending_confirmation';
                  const isActivated = u.isActivated || u.activationStatus === 'activated';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-3">
                        <div className="font-bold text-dark">{u.fullName}</div>
                        <div className="text-xs text-surface-muted">{u.email}</div>
                        <div className="text-[10px] text-surface-muted mt-0.5">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-3 text-xs text-dark font-medium whitespace-nowrap">
                        {u.phone}
                      </td>

                      <td className="py-4 px-3 font-mono text-xs font-bold text-dark whitespace-nowrap">
                        {u.referralCode}
                      </td>

                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="font-black text-brand-600 text-sm">
                          ₦{u.wallet.availableBalance.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-surface-muted">
                          Earned: ₦{u.wallet.totalEarned.toFixed(2)}
                        </div>
                      </td>

                      {/* Account Status (Active/Suspended) */}
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Activation Status (Paystack & Admin Confirmation) */}
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {isActivated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ACTIVATED</span>
                          </span>
                        ) : isPending ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                              <span>PENDING CONFIRMATION</span>
                            </span>
                            {u.activationReference && (
                              <span className="text-[9px] font-mono text-surface-muted mt-0.5">
                                Ref: {u.activationReference}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            NOT ACTIVATED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Confirm Activation Button */}
                          {!isActivated && (
                            <button
                              onClick={() => handleConfirmActivation(u)}
                              disabled={isProcessing}
                              title="Confirm account activation and enable withdrawals"
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm ${
                                isPending
                                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{isPending ? 'Confirm Activation' : 'Activate (Manual)'}</span>
                            </button>
                          )}

                          {/* Suspend / Activate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isProcessing}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              u.status === 'active'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
