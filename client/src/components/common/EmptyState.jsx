import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is currently no information to display here.',
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-surface-border my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-surface-muted mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-dark mb-1">{title}</h3>
      <p className="text-sm text-surface-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
