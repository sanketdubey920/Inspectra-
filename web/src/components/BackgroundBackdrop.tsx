import React from 'react';
import { useLocation } from 'react-router-dom';

export const BackgroundBackdrop: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Select authentic real photographic backdrop based on portal section
  let imagePath = '/images/rashtrapati_bhavan_day.jpg';
  if (path.startsWith('/institutes')) {
    imagePath = '/images/institutional_campus.jpg';
  } else if (path.startsWith('/dashboard') || path.startsWith('/inspections') || path.startsWith('/actions') || path.startsWith('/reports')) {
    imagePath = '/images/gov_secretariat.jpg';
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Real architectural photography matching reference photo visibility (~30-35% visibility) */}
      <div
        className="w-full h-full bg-cover bg-top sm:bg-center bg-no-repeat transition-all duration-700 opacity-35 dark:opacity-20 contrast-105"
        style={{ backgroundImage: `url('${imagePath}')` }}
      />
      {/* Soft translucent wash ensuring high-contrast text legibility while keeping the building clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/75 to-slate-50/90 dark:from-slate-950/75 dark:via-slate-950/85 dark:to-slate-950/95 backdrop-blur-[0.5px]" />
    </div>
  );
};
