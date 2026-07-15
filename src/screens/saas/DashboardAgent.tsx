import React, { useState } from 'react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { Cpu, Terminal, Copy, CheckCircle, RotateCw, DownloadCloud, HardDrive, PlayCircle, ArrowRight } from 'lucide-react';

export const DashboardAgent: React.FC = () => {
  const { currentShop, updateShopSettings } = useSaaS();
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  if (!currentShop) return null;

  // Generate a random 10-character single-use pairing key
  const generateRandomKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRegenerateKey = async () => {
    try {
      setRegenerating(true);
      const nextKey = generateRandomKey();
      await updateShopSettings(currentShop.id, { pairingKey: nextKey });
    } catch (err) {
      console.error('Failed to regenerate pairing key:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentShop.pairingKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const commands = {
    install: 'npm i -g @printflow/agent',
    pair: `printflow-agent pair ${currentShop.pairingKey || 'KEY_HERE'}`,
    run: 'printflow-agent run'
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Desktop Print Agent</h1>
        <p className="text-slate-500 font-medium text-xs leading-normal">
          Connect physical desktop print servers and tray outputs directly to your cloud-managed print queue.
        </p>
      </div>

      {/* Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-slate-100 flex items-center gap-4 md:col-span-2" id="agent-status-left">
          <div className="p-3 bg-indigo-55 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Cpu className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm">Agent Link Architecture</h3>
            <p className="text-slate-500 font-medium text-xs leading-relaxed">
              The PrintFlow Agent runs as a lightweight, background daemon on your counter desk computer. It polls print jobs via secure long-polling over HTTPS and routes them natively to your system's default paper tray.
            </p>
          </div>
        </Card>

        <Card className="p-6 border border-slate-100 flex flex-col justify-between" id="agent-status-right">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Connection</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-black text-slate-900 text-base capitalize">
                {currentShop.agentStatus === 'connected' ? 'Connected & Ready' : currentShop.agentStatus || 'Ready'}
              </span>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">
            Last ping: Just now
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Pairing Key Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-slate-950 text-white space-y-6 border-none shadow-xl shadow-slate-950/10" id="pairing-panel">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Secure Credentials</p>
              <h2 className="text-lg font-black tracking-tight">Desktop Pairing Key</h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                This is a secure 10-character, single-use token tied explicitly to your active shop UUID. Regenerate to cancel old connections.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
              <code className="text-indigo-300 font-mono font-bold text-base tracking-wider select-all">
                {currentShop.pairingKey || 'GENERATE_KEY'}
              </code>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyKey}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Copy Pairing Key"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleRegenerateKey}
                  disabled={regenerating}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate Pairing Key"
                >
                  <RotateCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs font-semibold text-slate-400 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Single Use Authorization</span>
              </div>
              <p>
                Pairing keys will automatically expire once successfully matched with a desktop daemon process.
              </p>
            </div>
          </Card>
        </div>

        {/* Step-by-Step Installation Console */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 border border-slate-100 space-y-6" id="install-guide">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">CLI Installation Guide</h2>
              <p className="text-slate-500 font-medium text-xs">
                Follow these terminal steps to launch the system agent daemon on your terminal desk PC.
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-extrabold shrink-0">
                  1
                </div>
                <div className="space-y-2.5 w-full">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Download & Install Agent CLI</h4>
                    <p className="text-slate-500 font-medium text-xs">Requires Node.js environment on the target Windows, macOS, or Linux terminal PC.</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3.5 flex items-center justify-between text-slate-200 font-mono text-xs border border-slate-900">
                    <span>{commands.install}</span>
                    <button
                      onClick={() => handleCopyCommand(commands.install, 'inst')}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    >
                      {copiedCmd === 'inst' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-extrabold shrink-0">
                  2
                </div>
                <div className="space-y-2.5 w-full">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Authenticate Daemon Process</h4>
                    <p className="text-slate-500 font-medium text-xs">Pair your hardware using the 10-character key from the left panel.</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3.5 flex items-center justify-between text-slate-200 font-mono text-xs border border-slate-900">
                    <span className="truncate max-w-[280px] md:max-w-none">{commands.pair}</span>
                    <button
                      onClick={() => handleCopyCommand(commands.pair, 'pair')}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors shrink-0"
                    >
                      {copiedCmd === 'pair' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-extrabold shrink-0">
                  3
                </div>
                <div className="space-y-2.5 w-full">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Start Document Trays Poll</h4>
                    <p className="text-slate-500 font-medium text-xs">Run the agent daemon. It will listen for incoming cloud files and feed the local tray.</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3.5 flex items-center justify-between text-slate-200 font-mono text-xs border border-slate-900">
                    <span>{commands.run}</span>
                    <button
                      onClick={() => handleCopyCommand(commands.run, 'run')}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    >
                      {copiedCmd === 'run' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
