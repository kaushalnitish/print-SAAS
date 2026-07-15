import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Minus, Check, ArrowRight, Eye, Layers, Copy, FileCode, Printer, Sparkles } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ColorMode, PaperSize, SideMode } from '../types';
import { motion } from 'motion/react';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { file, settings, updateSettings } = usePrintFlow();

  // If no file, redirect back to upload screen
  useEffect(() => {
    if (!file) {
      const match = location.pathname.match(/(\/s\/[^/]+)/);
      const prefix = match ? match[1] : '';
      navigate(`${prefix}/upload`);
    }
  }, [file, navigate, location.pathname]);

  if (!file) return null;

  const incrementCopies = () => {
    updateSettings({ copies: Math.min(99, settings.copies + 1) });
  };

  const decrementCopies = () => {
    updateSettings({ copies: Math.max(1, settings.copies - 1) });
  };

  const handleColorChange = (mode: ColorMode) => {
    updateSettings({ colorMode: mode });
  };

  const handleSizeChange = (size: PaperSize) => {
    updateSettings({ paperSize: size });
  };

  const handleSideChange = (side: SideMode) => {
    updateSettings({ sideMode: side });
  };

  return (
    <div className="flex flex-col justify-between flex-1 px-6 py-8 bg-slate-50/50 max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Choose Print Settings</h2>
          <p className="text-slate-500 text-base mt-1 font-medium">Simple options for your print job.</p>
        </div>

        {/* 1. Copies adjustment - Giant tactile buttons */}
        <Card className="space-y-4" id="copies-card" animateEntrance={true} delay={0.05}>
          <div className="flex items-center gap-3 text-slate-500">
            <Copy className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-lg">Number of Copies</h3>
          </div>
          
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={decrementCopies}
              disabled={settings.copies <= 1}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-350"
              id="decrement-copies-btn"
              aria-label="Decrease copies"
            >
              <Minus className="w-6 h-6 stroke-[3]" />
            </motion.button>

            <span className="text-3xl font-extrabold text-slate-900 w-16 text-center select-none font-mono" id="copies-count-display">
              {settings.copies}
            </span>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={incrementCopies}
              disabled={settings.copies >= 99}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-800 disabled:opacity-40 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-350"
              id="increment-copies-btn"
              aria-label="Increase copies"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </motion.button>
          </div>
        </Card>

        {/* 2. Color vs B&W toggle - Big tactile choices */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            animateEntrance={true}
            delay={0.1}
            onClick={() => handleColorChange('bw')}
            className={`cursor-pointer border-2 transition-all p-5 flex flex-col items-center gap-3 rounded-[24px] ${
              settings.colorMode === 'bw'
                ? 'border-slate-950 bg-slate-900 text-white shadow-md'
                : 'border-slate-100 bg-white hover:border-slate-250 text-slate-800'
            }`}
            id="color-mode-bw-card"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings.colorMode === 'bw' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Printer className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-lg">Black & White</p>
              <p className={`text-sm mt-0.5 font-medium ${settings.colorMode === 'bw' ? 'text-slate-300' : 'text-slate-450'}`}>Standard ink</p>
            </div>
          </Card>

          <Card
            animateEntrance={true}
            delay={0.15}
            onClick={() => handleColorChange('color')}
            className={`cursor-pointer border-2 transition-all p-5 flex flex-col items-center gap-3 rounded-[24px] ${
              settings.colorMode === 'color'
                ? 'border-slate-950 bg-slate-900 text-white shadow-md'
                : 'border-slate-100 bg-white hover:border-slate-250 text-slate-800'
            }`}
            id="color-mode-color-card"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings.colorMode === 'color' ? 'bg-amber-400 text-slate-900' : 'bg-amber-50 text-amber-500'}`}>
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-lg">Full Color</p>
              <p className={`text-sm mt-0.5 font-medium ${settings.colorMode === 'color' ? 'text-slate-300' : 'text-slate-450'}`}>Vibrant printing</p>
            </div>
          </Card>
        </div>

        {/* 3. Paper Size Selection */}
        <Card className="space-y-4" animateEntrance={true} delay={0.2} id="paper-size-card">
          <div className="flex items-center gap-3 text-slate-500">
            <FileCode className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-lg">Paper Size</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {(['a4', 'a3'] as PaperSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                className={`h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-between px-5 border ${
                  settings.paperSize === size
                    ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-100 hover:border-slate-250'
                }`}
                id={`paper-size-btn-${size}`}
              >
                <span className="uppercase text-lg">{size} size</span>
                {settings.paperSize === size && <Check className="w-5 h-5 stroke-[3]" />}
              </button>
            ))}
          </div>
        </Card>

        {/* 4. Single vs Double Side Selection */}
        <Card className="space-y-4" animateEntrance={true} delay={0.25} id="side-mode-card">
          <div className="flex items-center gap-3 text-slate-500">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-lg">Print Style</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {(['single', 'double'] as SideMode[]).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => handleSideChange(side)}
                className={`h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-between px-5 border ${
                  settings.sideMode === side
                    ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-100 hover:border-slate-250'
                }`}
                id={`side-mode-btn-${side}`}
              >
                <span className="capitalize text-lg">{side === 'double' ? 'Double Sided' : 'Single Sided'}</span>
                {settings.sideMode === side && <Check className="w-5 h-5 stroke-[3]" />}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Continue Action */}
      <div className="mt-8">
        <Button
          id="review-document-btn"
          variant="primary"
          onClick={() => {
            const match = location.pathname.match(/(\/s\/[^/]+)/);
            const prefix = match ? match[1] : '';
            navigate(`${prefix}/preview`);
          }}
          rightIcon={<Eye className="w-5 h-5" />}
        >
          Review Document
        </Button>
      </div>
    </div>
  );
};
