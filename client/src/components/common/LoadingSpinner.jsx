import React from 'react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
      />
      {text && <p className="text-xs font-medium text-surface-muted animate-pulse">{text}</p>}
    </div>
  );
}
