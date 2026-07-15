import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Printer, Shield, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion } from 'motion/react';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopInfo, resetFlow } = usePrintFlow();

  const handleStart = () => {
    resetFlow(); // Reset state just in case of stale cache
    const match = location.pathname.match(/(\/s\/[^/]+)/);
    const prefix = match ? match[1] : '';
    navigate(`${prefix}/upload`);
  };

  return (
    <div className="flex flex-col justify-between flex-1 px-6 py-8 md:py-12 bg-white max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Upper Content */}
      <div className="space-y-10 my-auto">
        {/* Brand/Hero Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-slate-900 text-white shadow-xl shadow-slate-900/10 mx-auto relative"
          >
            <Printer className="w-12 h-12" />
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow">
              <Sparkles className="w-4 h-4 fill-slate-900" />
            </span>
          </motion.div>

          <div className="space-y-3">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              {shopInfo.name}
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-500 max-w-sm mx-auto font-medium leading-relaxed"
            >
              {shopInfo.tagline}
            </motion.p>
          </div>
        </div>

        {/* Feature Highlights card */}
        <Card animateEntrance={true} delay={0.3} className="bg-slate-50 border-0 p-6 rounded-[28px]">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl text-slate-700 shadow-sm shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-850 text-lg">No Login or Account Needed</h3>
                <p className="text-slate-500 text-base leading-normal">
                  Simply upload your file, configure and print immediately. No email or registration.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200/60 my-2" />

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl text-slate-700 shadow-sm shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-850 text-lg">Supported Formats</h3>
                <p className="text-slate-500 text-base leading-normal">
                  Prints PDF, images (JPG, PNG), and Word documents up to 100 MB.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer & CTA Section */}
      <div className="space-y-6 mt-8">
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Button
            id="start-upload-btn"
            variant="primary"
            onClick={handleStart}
            rightIcon={<ArrowRight className="w-6 h-6" />}
            className="shadow-lg shadow-slate-900/15"
          >
            Start Printing
          </Button>

          <p className="text-xs text-center text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
            Privacy Policy: Files are encrypted in transit and permanently deleted from memory after printing.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
