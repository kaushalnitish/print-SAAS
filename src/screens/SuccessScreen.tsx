import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Ticket, Users, Clock, ArrowRight, Share2, Printer } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion } from 'motion/react';

export const SuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { file, order } = usePrintFlow();

  // Redirect if no order is found in state
  useEffect(() => {
    if (!order) {
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(`${prefix}/`);
    }
  }, [order, navigate, location.pathname]);

  if (!order) return null;

  return (
    <div className="flex flex-col justify-between flex-1 px-6 py-8 bg-slate-50/50 max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      
      {/* Scrollable upper receipts */}
      <div className="space-y-6 my-auto">
        {/* Animated Checkmark and congratulations */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1.2, 1], opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 mx-auto"
          >
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </motion.div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sent to Printer!</h2>
            <p className="text-slate-500 font-medium text-base">Your document is scheduled in the print queue.</p>
          </div>
        </div>

        {/* Premium Receipt Ticket style */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        >
          <Card className="p-0 border-0 shadow-lg bg-white overflow-hidden rounded-[32px]">
            {/* Top brand portion */}
            <div className="bg-slate-900 text-white p-6 text-center space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">Receipt Token</span>
              <div className="text-4xl font-extrabold font-mono tracking-tight text-white flex items-center justify-center gap-2">
                <Ticket className="w-8 h-8 text-amber-400 fill-amber-400/10 shrink-0" />
                <span id="order-token-display">{order.token}</span>
              </div>
            </div>

            {/* Middle statistics breakdown */}
            <div className="p-6 md:p-8 space-y-5 relative">
              {/* Decorative dash line divider */}
              <div className="absolute -top-1 inset-x-0 h-1 flex justify-between select-none overflow-hidden">
                {Array.from({ length: 30 }).map((_, idx) => (
                  <span key={idx} className="w-2.5 h-2.5 rounded-full bg-slate-50 border border-slate-100 flex-shrink-0" />
                ))}
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-4 pt-4 text-base">
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <Users className="w-6 h-6 text-slate-500 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Queue Position</p>
                    <p className="text-lg font-black text-slate-800" id="queue-pos-display">
                      {order.queuePosition === 0 
                        ? 'Next up!' 
                        : `${order.queuePosition}${order.queuePosition === 1 ? 'st' : order.queuePosition === 2 ? 'nd' : order.queuePosition === 3 ? 'rd' : 'th'} spot`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <Clock className="w-6 h-6 text-slate-500 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Wait</p>
                    <p className="text-lg font-black text-slate-800" id="wait-time-display">
                      {order.estimatedWaitMinutes === 0 ? 'Printing...' : `~${order.estimatedWaitMinutes} mins`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Printed File specifications */}
              {order.file && (
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-sm md:text-base">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Document Summary</p>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500 truncate max-w-[200px]">{order.file.name}</span>
                    <span className="text-slate-800 font-bold">{order.file.pages} {order.file.pages === 1 ? 'pg' : 'pgs'}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-slate-200/50 pt-2 text-slate-500">
                    <span>Settings</span>
                    <span className="text-slate-800 font-semibold text-xs bg-slate-200/60 px-2 py-0.5 rounded-full uppercase">
                      {order.settings.copies}x • {order.settings.colorMode} • {order.settings.paperSize} • {order.settings.sideMode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Live tracking redirection */}
      <div className="mt-8 space-y-4">
        <Button
          id="track-status-btn"
          variant="primary"
          onClick={() => {
            const match = location.pathname.match(/(\/s\/[^/]+)/);
            const prefix = match ? match[1] : '';
            navigate(`${prefix}/tracking`);
          }}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          className="shadow-lg shadow-slate-900/15"
        >
          Track Progress Live
        </Button>
        <p className="text-xs text-center text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
          Tip: You can take a screenshot of this page or keep this browser open. The status updates in real-time!
        </p>
      </div>
    </div>
  );
};
