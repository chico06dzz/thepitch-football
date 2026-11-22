import React, { useEffect, useState } from 'react';

interface TeamLogoProps {
  name: string;
  code: string;
  logo?: string;
  accentColor: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<TeamLogoProps['size']>, string> = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-12 h-12 text-sm',
};

export const TeamLogo: React.FC<TeamLogoProps> = ({
  name,
  code,
  logo,
  accentColor,
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logo]);

  const sizeCls = SIZE_CLASSES[size];

  if (logo && !failed) {
    return (
      <span
        className={`${sizeCls} rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-slate-100/90 dark:bg-white/95 p-0.5 ${className}`}
      >
        <img
          src={logo}
          alt={`Logo ${name}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`${sizeCls} rounded-lg flex items-center justify-center font-mono font-bold text-white shrink-0 ${className}`}
      style={{ backgroundColor: accentColor }}
    >
      {code}
    </span>
  );
};
