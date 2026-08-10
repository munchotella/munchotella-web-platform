import React from 'react';

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function LuxuryButton({ 
  variant = 'primary', 
  children, 
  icon,
  className = '',
  ...props 
}: LuxuryButtonProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gold-saffron text-cacao-dark hover:bg-[#C09640] glow-gold-hover border-transparent';
      case 'secondary':
        return 'bg-cacao-dark text-vanilla-porcelain hover:bg-cacao-dark/90 border-transparent';
      case 'outline':
        return 'bg-transparent text-cacao-dark border-warm-border hover:border-gold-saffron hover:bg-gold-saffron/5';
    }
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border
        font-label-caps text-xs tracking-[0.1em] uppercase transition-all duration-300
        ${getVariantClasses()} ${className}
      `}
      {...props}
    >
      {icon && <span className="opacity-90">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
