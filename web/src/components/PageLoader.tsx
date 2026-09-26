import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = "Loading operational workspace..." 
}) => {
  return (
    <div 
      role="status" 
      aria-live="polite"
      className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in duration-300"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing ring */}
        <div className="absolute w-20 h-20 rounded-full bg-slate-500/15 dark:bg-slate-400/10 animate-ping duration-1000" />
        
        {/* Inner glow ring */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-700 to-zinc-900 dark:from-slate-600 dark:to-zinc-800 shadow-lg shadow-slate-700/25 flex items-center justify-center text-white">
          <ShieldCheck className="w-8 h-8 animate-pulse text-white" />
        </div>
      </div>

      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
          INSPECTRA Monitor
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {message}
        </p>
      </div>

      {/* Modern micro-progress bar */}
      <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-slate-700 to-zinc-900 rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

export default PageLoader;
