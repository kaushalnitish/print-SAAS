import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, Settings, Sparkles, Printer, Check, Info } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion, AnimatePresence } from 'motion/react';

export const PreviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { file, settings, startUpload } = usePrintFlow();
  const [activePage, setActivePage] = useState(1);

  // Redirect if no file is present
  useEffect(() => {
    if (!file) {
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(`${prefix}/upload`);
    }
  }, [file, navigate, location.pathname]);

  if (!file) return null;

  const handleNextPage = () => {
    setActivePage((prev) => Math.min(file.pages, prev + 1));
  };

  const handlePrevPage = () => {
    setActivePage((prev) => Math.max(1, prev - 1));
  };

  const handleConfirmPrint = () => {
    const match = location.pathname.match(/(\/s\/[^/]+)/);
    const prefix = match ? match[1] : '';
    // Initiate upload simulation, onComplete will navigate to Success screen
    startUpload(() => {
      navigate(`${prefix}/success`);
    });
    // Navigate immediately to the uploading screen to show progress
    navigate(`${prefix}/uploading`);
  };

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k)) - 1;
    return parseFloat((bytes / Math.pow(k, i + 1)).toFixed(1)) + ' ' + (sizes[i] || 'KB');
  };

  return (
    <div className="flex flex-col justify-between flex-1 px-6 py-8 bg-slate-50/50 max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review and Print</h2>
          <p className="text-slate-500 text-base mt-1 font-medium">Verify your document before printing.</p>
        </div>

        {/* Document Preview Frame */}
        <div className="space-y-3">
          <div className="relative bg-slate-200/50 rounded-[32px] p-6 h-64 flex items-center justify-center border border-slate-200/60 overflow-hidden shadow-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-40 h-52 bg-white rounded-lg shadow-md border border-slate-100 p-4 flex flex-col justify-between relative select-none"
              >
                {/* Simulated content layout based on file type */}
                {file.previewUrl ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={file.previewUrl}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="space-y-3 w-full h-full flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <div className="h-2.5 w-12 bg-slate-200 rounded" />
                        <FileText className="w-4 h-4 text-slate-300" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-100 rounded" />
                        <div className="h-1.5 w-5/6 bg-slate-100 rounded" />
                        <div className="h-1.5 w-full bg-slate-100 rounded" />
                        <div className="h-1.5 w-4/5 bg-slate-100 rounded" />
                        <div className="h-1.5 w-full bg-slate-100 rounded" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-2/3 bg-slate-100 rounded" />
                      <div className="h-1.5 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
                )}

                {/* Page number badge */}
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  Pg {activePage}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Page switching controls if document is multi-page */}
            {file.pages > 1 && (
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={activePage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-100 hover:bg-slate-550 shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 focus:outline-none text-slate-700"
                  aria-label="Previous page"
                  id="preview-prev-page-btn"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <span className="text-slate-600 font-bold font-mono text-sm bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                  {activePage} of {file.pages}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={activePage === file.pages}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-100 hover:bg-slate-550 shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 focus:outline-none text-slate-700"
                  aria-label="Next page"
                  id="preview-next-page-btn"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
          
          <div className="text-center px-4">
            <p className="font-extrabold text-slate-800 text-lg truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              {formatFileSize(file.size)} • {file.pages} {file.pages === 1 ? 'page' : 'pages'} total
            </p>
          </div>
        </div>

        {/* Print Configuration Breakdown Card */}
        <Card className="p-5 border-0 bg-white" animateEntrance={true} delay={0.15} id="preview-summary-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-base">
              <Settings className="w-4.5 h-4.5" />
              <span>Applied Print Settings</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline uppercase tracking-wider"
              id="edit-settings-link"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-base">
            <div className="flex items-center justify-between py-1 border-r border-slate-100 pr-3">
              <span className="text-slate-400 font-medium">Quantity</span>
              <span className="font-extrabold text-slate-800 font-mono text-lg">{settings.copies}x {settings.copies === 1 ? 'copy' : 'copies'}</span>
            </div>
            
            <div className="flex items-center justify-between py-1 pl-3">
              <span className="text-slate-400 font-medium">Color</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                {settings.colorMode === 'color' ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                    <span>Full Color</span>
                  </>
                ) : (
                  <span>Black & White</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-r border-slate-100 pr-3">
              <span className="text-slate-400 font-medium">Paper Size</span>
              <span className="font-extrabold text-slate-800 uppercase font-mono">{settings.paperSize}</span>
            </div>

            <div className="flex items-center justify-between py-1 pl-3">
              <span className="text-slate-400 font-medium">Print Sides</span>
              <span className="font-bold text-slate-800 capitalize">{settings.sideMode === 'double' ? 'Double Sided' : 'Single Sided'}</span>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-3 mt-4 flex items-start gap-2 text-slate-500 text-sm">
            <Info className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">
              Double-check that the paper size ({settings.paperSize.toUpperCase()}) matches your original document formatting for the best print layout.
            </p>
          </div>
        </Card>
      </div>

      {/* Solid Print Action */}
      <div className="mt-8 space-y-3">
        <Button
          id="confirm-print-btn"
          variant="primary"
          onClick={handleConfirmPrint}
          leftIcon={<Printer className="w-5 h-5 shrink-0" />}
          className="shadow-lg shadow-slate-900/15"
        >
          Confirm & Print Now
        </Button>
      </div>
    </div>
  );
};
