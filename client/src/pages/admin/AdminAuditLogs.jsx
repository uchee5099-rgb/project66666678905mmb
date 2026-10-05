import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ScrollText, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Administrative Audit Trail
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Cryptographically recorded log of administrative approvals, status modifications, and financial actions.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        {loading ? (
          <LoadingSpinner text="Fetching audit logs..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit entries recorded"
            description="Administrative actions will be automatically tracked here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Admin</th>
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Target</th>
                  <th className="pb-3 px-3">Details</th>
                  <th className="pb-3 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="py-4 px-3 text-surface-muted whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-3 font-bold text-dark whitespace-nowrap">
                      {l.adminName}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-mono font-bold uppercase text-[10px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap text-surface-muted font-mono">
                      {l.targetType} #{l.targetId}
                    </td>
                    <td className="py-4 px-3 max-w-xs truncate font-mono text-[11px] text-slate-700">
                      {l.details}
                    </td>
                    <td className="py-4 px-3 font-mono text-surface-muted whitespace-nowrap">
                      {l.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
