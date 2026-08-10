import React from 'react';

interface BentoKpiCardProps {
  title: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function BentoKpiCard({
  title,
  value,
  trend,
  trendPositive,
  subtitle,
  className = '',
  icon
}: BentoKpiCardProps) {
  return (
    <div className={`bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 shadow-sm hover:soft-shadow transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-label-caps text-[11px] uppercase tracking-widest text-cacao-dark/60">{title}</h3>
        {icon && <div className="text-gold-saffron opacity-80">{icon}</div>}
      </div>
      
      <div className="flex items-end gap-3 mb-2">
        <div className="font-headline-lg text-4xl text-cacao-dark">{value}</div>
        {trend && (
          <div className={`font-body-md text-sm mb-1 ${trendPositive ? 'text-soft-olive' : 'text-error'}`}>
            {trend}
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="font-body-md text-sm text-cacao-dark/50">{subtitle}</p>
      )}
    </div>
  );
}
