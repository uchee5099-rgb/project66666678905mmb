import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Bell, CheckCircle2, AlertCircle, Info, Check } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function NotificationsPage() {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      await refreshUser();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.', 'success');
      await refreshUser();
    } catch (err) {
      showToast('Failed to mark all as read.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-surface-muted mt-1">
            Updates on your task submissions, referral bonuses, and withdrawals.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-dark text-xs font-bold transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet."
          description="When updates regarding your task submissions or payouts occur, they will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                n.isRead
                  ? 'bg-white border-surface-border opacity-85 hover:opacity-100'
                  : 'bg-brand-50/40 border-brand-200 shadow-subtle'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {n.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : n.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm ${n.isRead ? 'font-bold text-dark' : 'font-extrabold text-brand-950'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-surface-muted whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-xs text-surface-muted mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
