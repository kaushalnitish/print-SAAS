import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, CheckCircle2, Clock, Printer, ShoppingBag, Phone, Plus, RefreshCw, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { TrackingStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const TrackingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, resetFlow, simulateTracking, setSimulateTracking } = usePrintFlow();

  const [liveJob, setLiveJob] = useState<any>(null);
  const [liveQueuePosition, setLiveQueuePosition] = useState<number>(order?.queuePosition || 1);

  // If no active order, send to home
  useEffect(() => {
    if (!order) {
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(`${prefix}/`);
    }
  }, [order, navigate, location.pathname]);

  useEffect(() => {
    if (!order || !isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    // Helper to calculate queue position
    const calculateQueuePosition = async (shopId: string, createdAtString: string) => {
      try {
        const { data, error } = await supabase
          .from('print_jobs')
          .select('id, created_at')
          .eq('shop_id', shopId)
          .in('status', ['waiting', 'submitted', 'printing', 'accepted'])
          .order('created_at', { ascending: true });
          
        if (error || !data) return;
        
        const index = data.findIndex(job => job.created_at <= createdAtString);
        const position = index !== -1 ? index + 1 : data.length;
        if (isMounted) {
          setLiveQueuePosition(position);
        }
      } catch (err) {
        console.error('Error calculating live queue position:', err);
      }
    };

    // 1. Fetch initial job state
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('print_jobs')
          .select('*')
          .eq('token', order.token)
          .maybeSingle();

        if (error) {
          console.error('Error fetching job:', error);
          return;
        }

        if (data && isMounted) {
          setLiveJob(data);
          // Also sync context state for seamless updates
          order.status = data.status;
          
          if (data.created_at && data.shop_id) {
            await calculateQueuePosition(data.shop_id, data.created_at);
          }
        }
      } catch (err) {
        console.error('Fetch job exception:', err);
      }
    };

    fetchJob();

    // 2. Set up realtime subscription
    const channel = supabase
      .channel(`print-job-tracking-${order.token}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'print_jobs',
          filter: `token=eq.${order.token}`,
        },
        async (payload) => {
          console.log('Realtime print job update:', payload);
          if (payload.new && isMounted) {
            const newJob = payload.new as any;
            setLiveJob(newJob);
            
            // Sync status to context order
            order.status = newJob.status;
            
            if (newJob.created_at && newJob.shop_id) {
              await calculateQueuePosition(newJob.shop_id, newJob.created_at);
            }
          }
        }
      )
      .subscribe();

    // 3. Set up subscription to calculate queue position when other jobs in the shop change
    const shopChannel = supabase
      .channel(`shop-queue-tracking-${order.token}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'print_jobs',
        },
        async () => {
          if (liveJob?.shop_id && liveJob?.created_at) {
            await calculateQueuePosition(liveJob.shop_id, liveJob.created_at);
          } else if (order) {
            const match = window.location.hash.match(/\/s\/([^/]+)/);
            if (match && match[1]) {
              const slug = match[1];
              const { data: shopData } = await supabase
                .from('shops')
                .select('id')
                .eq('shop_slug', slug)
                .maybeSingle();
              if (shopData) {
                const { data: jobData } = await supabase
                  .from('print_jobs')
                  .select('created_at')
                  .eq('token', order.token)
                  .maybeSingle();
                if (jobData?.created_at) {
                  await calculateQueuePosition(shopData.id, jobData.created_at);
                }
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      supabase.removeChannel(shopChannel);
    };
  }, [order?.token, isSupabaseConfigured]);

  if (!order) return null;

  // Timeline stages
  const stages: { status: TrackingStatus; label: string; desc: string; icon: any }[] = [
    {
      status: 'submitted',
      label: 'Submitted',
      desc: 'Document received securely',
      icon: CheckCircle2,
    },
    {
      status: 'waiting',
      label: 'In Queue',
      desc: 'Waiting for prior print jobs',
      icon: Clock,
    },
    {
      status: 'printing',
      label: 'Printing',
      desc: 'Actively processing in tray',
      icon: Printer,
    },
    {
      status: 'ready',
      label: 'Ready for Pickup',
      desc: 'Finished and ready for collection',
      icon: ShoppingBag,
    },
  ];

  // Helper to find index of current status
  const currentStatus = liveJob?.status || order.status;
  const mappedStatus = currentStatus === 'completed' ? 'ready' : currentStatus;
  const currentIdx = stages.findIndex((s) => s.status === mappedStatus);

  // Status message mapping helper
  const getInstructionCard = () => {
    switch (currentStatus) {
      case 'submitted':
        return {
          title: 'Document Transmitted',
          desc: 'We have received your print job. It is safely queued at the counter, and the operator is reviewing the specs.',
          bgColor: 'bg-indigo-50 border-indigo-150',
          textColor: 'text-indigo-950',
        };
      case 'waiting':
        return {
          title: `Position #${liveQueuePosition} in Queue`,
          desc: `Your job is in the active shop queue. Estimated wait is ~${liveQueuePosition * 2} minutes. You can relax; we will notify you on this screen the instant it begins printing.`,
          bgColor: 'bg-amber-50/80 border-amber-200/60',
          textColor: 'text-amber-950',
        };
      case 'printing':
        return {
          title: 'Printing Document Now',
          desc: 'Your file is traveling through the paper rollers at the shop counter! It will take less than 60 seconds to finish. Please step near the counter.',
          bgColor: 'bg-blue-50/80 border-blue-200/60',
          textColor: 'text-blue-950',
        };
      case 'ready':
      case 'completed':
        return {
          title: 'Pick Up at Counter!',
          desc: `Success! Your printed pages are ready. Please approach the service desk and show your receipt token: ${liveJob?.token || order.token} to receive your copies.`,
          bgColor: 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/5',
          textColor: 'text-emerald-950',
        };
      case 'cancelled':
      case 'cancelled' as any:
        return {
          title: 'Order Cancelled',
          desc: 'This print job was cancelled or declined by the shop operator. Please contact the front counter if you believe this was an error.',
          bgColor: 'bg-red-50 border-red-200 shadow-sm',
          textColor: 'text-red-950',
        };
      default:
        return {
          title: 'Order Processing',
          desc: 'Our operators are managing the active printer queue. Stay tuned.',
          bgColor: 'bg-indigo-50 border-indigo-150',
          textColor: 'text-indigo-950',
        };
    }
  };

  const instruction = getInstructionCard();

  const handlePrintAnother = () => {
    resetFlow();
    const match = location.pathname.match(/(\/s\/[^/]+)/);
    const prefix = match ? match[1] : '';
    navigate(`${prefix}/`);
  };

  return (
    <div className="flex flex-col justify-between flex-1 px-6 py-8 bg-slate-50/50 max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      
      <div className="space-y-6">
        {/* Title and Top Header info */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Print Tracker</h2>
            <p className="text-slate-500 text-base mt-1 font-medium">Watch your print status in real-time.</p>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Dynamic Status Notification Alert */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStatus}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-5 rounded-3xl border flex gap-4 ${instruction.bgColor}`}
            id="tracking-instruction-card"
          >
            {currentStatus === 'ready' || currentStatus === 'completed' ? (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
            ) : currentStatus === 'printing' ? (
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shrink-0 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
            ) : currentStatus === 'cancelled' || currentStatus === ('cancelled' as any) ? (
              <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-md shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            <div className="space-y-1.5 flex-1 text-sm md:text-base">
              <p className={`font-black text-lg ${instruction.textColor}`}>{instruction.title}</p>
              <p className="text-slate-600 leading-relaxed font-medium">{instruction.desc}</p>
              {(currentStatus === 'ready' || currentStatus === 'completed') && (
                <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900 text-white font-mono font-extrabold text-lg shadow-sm">
                  <span>Token:</span>
                  <span className="text-amber-400">{liveJob?.token || order.token}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Timeline graphics container */}
        <Card className="p-6 md:p-8" id="tracking-timeline-card" animateEntrance={true} delay={0.1}>
          <div className="space-y-8 relative">
            
            {/* Background line behind steps */}
            <div className="absolute left-6.5 top-3 bottom-3 w-1 bg-slate-100 rounded-full" />
            
            {/* Active filled progress line */}
            <motion.div
              className="absolute left-6.5 top-3 w-1 bg-slate-900 rounded-full origin-top"
              initial={{ height: 0 }}
              animate={{ height: `${(currentIdx / (stages.length - 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {stages.map((stage, idx) => {
              const isPassed = idx < currentIdx;
              const isActive = idx === currentIdx;
              const isUpcoming = idx > currentIdx;
              const StageIcon = stage.icon;

              return (
                <div key={stage.status} className="flex items-start gap-5 relative select-none">
                  {/* Step Indicator Dot */}
                  <div className="relative shrink-0 z-10">
                    {isPassed ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-14 h-14 rounded-full bg-slate-900 border-4 border-white text-white flex items-center justify-center shadow-md"
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 0px rgba(15,23,42,0.1)', '0 0 0 8px rgba(15,23,42,0.06)', '0 0 0 0px rgba(15,23,42,0.1)'] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-14 h-14 rounded-full bg-white border-4 border-slate-900 text-slate-900 flex items-center justify-center shadow-md"
                      >
                        <StageIcon className="w-6 h-6 shrink-0 text-slate-900 animate-pulse" />
                      </motion.div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white border-4 border-slate-100 text-slate-350 flex items-center justify-center shadow-sm">
                        <StageIcon className="w-6 h-6 shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Stage Text Content */}
                  <div className="pt-2">
                    <p className={`font-black text-lg ${
                      isActive 
                        ? 'text-slate-900' 
                        : isPassed 
                          ? 'text-slate-500 font-bold' 
                          : 'text-slate-400 font-medium'
                    }`}>
                      {stage.label}
                    </p>
                    <p className={`text-sm mt-0.5 font-medium ${
                      isActive 
                        ? 'text-slate-500 font-semibold' 
                        : isPassed 
                          ? 'text-slate-450' 
                          : 'text-slate-350'
                    }`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Print Job Specifications Card */}
        <Card className="p-6 space-y-4" id="tracking-specs-card" animateEntrance={true} delay={0.2}>
          <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Job Specifications</h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Receipt Token</span>
              <p className="text-slate-900 font-black font-mono text-sm leading-none">{liveJob?.token || order.token}</p>
            </div>
            
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Print Status</span>
              <p className="text-slate-950 font-extrabold capitalize text-sm leading-none">{liveJob?.status || order.status}</p>
            </div>
            
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Queue Position</span>
              <p className="text-slate-900 font-black text-sm leading-none">
                {currentStatus === 'ready' || currentStatus === 'completed' || currentStatus === 'picked_up' || currentStatus === 'cancelled'
                  ? 'N/A'
                  : `#${liveQueuePosition}`}
              </p>
            </div>
            
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Copies</span>
              <p className="text-slate-900 font-black text-sm leading-none">{liveJob?.copies || order.settings.copies}x</p>
            </div>
            
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pages per Copy</span>
              <p className="text-slate-900 font-black text-sm leading-none">{liveJob?.pages || order.file.pages} pages</p>
            </div>
            
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Paper Size</span>
              <p className="text-slate-900 font-black uppercase text-sm leading-none">{liveJob?.paper_size || liveJob?.paperSize || order.settings.paperSize}</p>
            </div>
            
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Color Mode</span>
              <p className="text-slate-900 font-black capitalize text-sm leading-none">
                {(liveJob?.color_mode || liveJob?.colorMode || order.settings.colorMode) === 'color' ? 'Full Color' : 'Black & White'}
              </p>
            </div>
            
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/60 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Created Time</span>
              <p className="text-slate-900 font-black text-sm truncate leading-none">
                {liveJob?.created_at 
                  ? new Date(liveJob.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : 'Just now'}
              </p>
            </div>
          </div>
          
          {liveJob?.file_url && (
            <div className="pt-2">
              <a
                href={liveJob.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all border border-slate-200/50 cursor-pointer"
              >
                <FileText className="w-4.5 h-4.5" />
                <span>View Uploaded Document</span>
              </a>
            </div>
          )}
        </Card>

        {/* Queue progression simulator toggle (For preview testing) */}
        <Card className="p-4 bg-slate-50/60 border border-slate-100 flex items-center justify-between" id="simulator-toggle-card">
          <div className="flex items-center gap-2.5">
            <RefreshCw className={`w-5 h-5 text-slate-500 ${simulateTracking && currentStatus !== 'ready' ? 'animate-spin' : ''}`} />
            <div>
              <p className="font-bold text-slate-800 text-sm">Demo Auto-Progression</p>
              <p className="text-slate-400 text-xs font-semibold">Simulates order completion steps (8s interval)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulateTracking(!simulateTracking)}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 outline-none ${
              simulateTracking ? 'bg-slate-900' : 'bg-slate-200'
            }`}
            id="simulation-toggle-switch"
            aria-label="Toggle simulation auto progression"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                simulateTracking ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </Card>
      </div>

      {/* Solid Print Another Action */}
      <div className="mt-8">
        <Button
          id="print-another-doc-btn"
          variant="secondary"
          onClick={handlePrintAnother}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Print Another Document
        </Button>
      </div>
    </div>
  );
};
