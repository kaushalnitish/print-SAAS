import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CloudUpload, ShieldAlert, Sparkles, Printer, RefreshCw } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { motion, useMotionValue } from 'motion/react';

export const UploadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { file, uploadProgress, uploadStep, isUploading, uploadError, startUpload, resetFlow } = usePrintFlow();

  // Redirect if no file is present
  useEffect(() => {
    if (!file) {
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(`${prefix}/upload`);
    }
  }, [file, navigate, location.pathname]);

  // If upload completes successfully, context triggers redirect. But just in case, double guard:
  useEffect(() => {
    if (!isUploading && uploadProgress >= 100 && !uploadError) {
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(`${prefix}/success`);
    }
  }, [isUploading, uploadProgress, uploadError, navigate, location.pathname]);

  if (!file) return null;

  if (uploadError) {
    return (
      <div className="flex flex-col justify-center items-center flex-1 px-8 py-12 bg-white max-w-lg mx-auto w-full min-h-[calc(100vh-80px)] animate-fade-in">
        <div className="w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100 text-red-500 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upload Failed</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              There was an issue sending your file to the print queue.
            </p>
          </div>

          <Card className="p-5 border-red-100 bg-red-50/30 text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">Error details</span>
            <p className="text-red-950 text-xs font-medium leading-relaxed font-mono whitespace-pre-wrap break-all bg-white/80 p-3 rounded-xl border border-red-50/50">
              {uploadError}
            </p>
          </Card>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                startUpload(() => {
                  const match = location.pathname.match(/(\/s\/[^/]+)/);
                  const prefix = match ? match[1] : '';
                  navigate(`${prefix}/success`);
                });
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-hover" />
              <span>Retry Upload</span>
            </button>

            <button
              onClick={() => {
                const match = location.pathname.match(/(\/s\/[^/]+)/);
                const prefix = match ? match[1] : '';
                resetFlow();
                navigate(`${prefix}/upload`);
              }}
              className="w-full py-3.5 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-sm transition-all cursor-pointer"
            >
              Cancel and Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Status mapping helper
  const getStepDetails = () => {
    switch (uploadStep) {
      case 'preparing':
        return {
          title: 'Preparing Document',
          desc: 'Reading file specs and formatting layouts...',
          iconColor: 'text-indigo-500 bg-indigo-50',
        };
      case 'uploading':
        return {
          title: 'Uploading Securely',
          desc: 'Sending encrypted file data to local printer node...',
          iconColor: 'text-amber-500 bg-amber-50',
        };
      case 'processing':
        return {
          title: 'Processing File',
          desc: 'Converting document to printer-ready raster vectors...',
          iconColor: 'text-blue-500 bg-blue-50',
        };
      case 'finalizing':
        return {
          title: 'Finalizing Queue Job',
          desc: 'Establishing secure token and scheduling print priority...',
          iconColor: 'text-emerald-500 bg-emerald-50',
        };
    }
  };

  const activeStep = getStepDetails();

  return (
    <div className="flex flex-col justify-center items-center flex-1 px-8 py-12 bg-white max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="w-full space-y-10">
        
        {/* Animated Print Node Visualization */}
        <div className="flex justify-center items-center h-44 relative">
          {/* Animated floating document card */}
          <motion.div
            className="w-20 h-26 bg-white border border-slate-200 rounded-lg shadow-lg flex items-center justify-center p-3 absolute z-10"
            initial={{ y: -30, opacity: 0.5 }}
            animate={{ 
              y: [ -40, -10 ], 
              rotate: [ -5, 5, -5 ],
              scale: [0.95, 1, 0.95]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
          >
            <div className="space-y-1.5 w-full">
              <div className="h-1 bg-slate-200 rounded w-10" />
              <div className="h-1 bg-slate-100 rounded w-12" />
              <div className="h-1 bg-slate-100 rounded w-8" />
              <div className="h-1 bg-slate-100 rounded w-11" />
              <div className="h-4 bg-slate-50 border border-slate-100 rounded flex items-center justify-center">
                <CloudUpload className="w-2.5 h-2.5 text-slate-400 animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Virtual Printer Node base */}
          <div className="absolute bottom-4 w-32 h-14 bg-slate-900 rounded-2xl shadow-lg flex items-center justify-center text-white border-t-2 border-slate-750">
            <Printer className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center space-y-2">
          <motion.h3
            key={activeStep.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-slate-900 tracking-tight"
          >
            {activeStep.title}
          </motion.h3>
          <motion.p
            key={activeStep.desc}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-medium text-base max-w-xs mx-auto"
          >
            {activeStep.desc}
          </motion.p>
        </div>

        {/* Progress Bar Component */}
        <Card className="p-6 border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <ProgressBar
            progress={uploadProgress}
            label="Upload Progress"
            statusMessage={
              uploadProgress < 100 
                ? `Transmitting: ${file.name.slice(0, 18)}${file.name.length > 18 ? '...' : ''}` 
                : 'Upload Complete!'
            }
          />
        </Card>

        {/* Encrypted Note */}
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Secured with end-to-end local node SSL</span>
        </div>
      </div>
    </div>
  );
};
