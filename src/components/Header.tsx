import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Printer, HelpCircle } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopInfo, resetFlow, file } = usePrintFlow();

  const getCleanPath = (pathname: string) => {
    const match = pathname.match(/\/s\/[^/]+(.*)/);
    if (match) {
      return match[1] || '/';
    }
    return pathname;
  };

  const cleanPath = getCleanPath(location.pathname);

  const isWelcome = cleanPath === '/';
  const isSuccess = cleanPath === '/success';
  const isTracking = cleanPath === '/tracking';
  const isUploading = cleanPath === '/uploading';

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel and start over? All uploaded files and settings will be reset.')) {
      resetFlow();
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(prefix ? `${prefix}` : '/');
    }
  };

  // Determine active step index to show a beautiful minimalist dots progress indicator
  const steps = ['/', '/upload', '/settings', '/preview'];
  const currentStepIndex = steps.indexOf(cleanPath);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between h-20">
      {/* Left side: Back button or Shop logo icon */}
      <div className="w-12 flex items-center justify-start">
        {!isWelcome && !isSuccess && !isTracking && !isUploading ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Go back"
            id="header-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Printer className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Center: Shop info / title */}
      <div className="text-center flex-1 px-2">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate">
          {shopInfo.name}
        </h1>
        {isWelcome ? (
          <p className="text-xs text-slate-450 font-medium truncate">
            {shopInfo.address.split(',')[0]}
          </p>
        ) : currentStepIndex >= 0 ? (
          <div className="flex justify-center items-center gap-1.5 mt-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx <= currentStepIndex
                    ? 'w-4 bg-slate-800'
                    : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Session
          </p>
        )}
      </div>

      {/* Right side: Action menu or help */}
      <div className="w-12 flex items-center justify-end">
        {!isWelcome && !isSuccess && !isTracking && !isUploading && file ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCancel}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
            aria-label="Start over"
            title="Cancel & Reset"
            id="header-reset-btn"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </motion.button>
        ) : (
          <motion.a
            href={`tel:${shopInfo.phone}`}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Get shop support"
            title="Call Support"
            id="header-support-btn"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.a>
        )}
      </div>
    </header>
  );
};
