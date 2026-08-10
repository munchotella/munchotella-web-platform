import React from 'react';

type StatusType = 'success' | 'warning' | 'neutral' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'success':
        return 'bg-soft-olive/10 text-soft-olive border-soft-olive/20';
      case 'warning':
        return 'bg-gold-saffron/10 text-[#B88B2A] border-gold-saffron/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      case 'neutral':
      default:
        return 'bg-cacao-dark/5 text-cacao-dark/70 border-cacao-dark/10';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-label-caps tracking-wider uppercase ${getColors()}`}>
      {label}
    </span>
  );
}
