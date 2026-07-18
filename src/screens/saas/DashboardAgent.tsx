import React, { useState, useEffect, useRef } from 'react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { 
  Cpu, Terminal, Copy, CheckCircle, RotateCw, DownloadCloud, 
  HardDrive, PlayCircle, ArrowRight, Printer, Settings, Sliders, 
  AlertTriangle, List, Power, FileText, CheckCircle2, RefreshCw, 
  Layers, Shield, Eye, HelpCircle, Activity, Info, LogIn, ExternalLink,
  ChevronRight, AlertCircle, Trash2, PlusCircle, Check
} from 'lucide-react';

interface MockPrinter {
  id: string;
  name: string;
  type: 'Laser' | 'Inkjet' | 'Label' | 'Thermal';
  status: 'Online' | 'Offline' | 'Paper Jam' | 'Toner Low' | 'Standby';
  ip: string;
  isDefault: boolean;
  supportedSizes: string[];
}

interface TrayMapping {
  trayId: string;
  name: string;
  size: 'A4' | 'A3' | 'Letter' | 'Legal';
  currentLevel: number; // percentage
}

interface TerminalLog {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'incoming';
  timestamp: string;
}

export const DashboardAgent: React.FC = () => {
  const { currentShop, updateShopSettings, updateJobStatus } = useSaaS();
  const [activeTab, setActiveTab] = useState<'overview' | 'printers' | 'settings' | 'simulator'>('overview');
  
  // Tab-specific states
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Persistence/Mock configuration state for Printers
  const [printers, setPrinters] = useState<MockPrinter[]>(() => {
    const saved = localStorage.getItem('printflow_sim_printers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return [
      { id: 'p1', name: 'HP LaserJet Pro MFP M428dw', type: 'Laser', status: 'Online', ip: '192.168.1.15', isDefault: true, supportedSizes: ['A4', 'Letter', 'Legal'] },
      { id: 'p2', name: 'Epson EcoTank L3150 Wi-Fi', type: 'Inkjet', status: 'Online', ip: '192.168.1.18', isDefault: false, supportedSizes: ['A4', 'Letter'] },
      { id: 'p3', name: 'Canon imageRUNNER 2206 A3', type: 'Laser', status: 'Standby', ip: '192.168.1.25', isDefault: false, supportedSizes: ['A4', 'A3', 'Letter'] },
      { id: 'p4', name: 'Dymo LabelWriter 450 Turbo', type: 'Label', status: 'Offline', ip: 'Local USB', isDefault: false, supportedSizes: ['Letter'] }
    ];
  });

  // Tray allocations
  const [trays, setTrays] = useState<TrayMapping[]>(() => {
    const saved = localStorage.getItem('printflow_sim_trays');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      { trayId: 't1', name: 'Tray 1 (Auto-Feed)', size: 'A4', currentLevel: 85 },
      { trayId: 't2', name: 'Tray 2 (Standard)', size: 'Letter', currentLevel: 40 },
      { trayId: 't3', name: 'Tray 3 (Heavy Paper)', size: 'A3', currentLevel: 15 }
    ];
  });

  // Form states for adding printer
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterType, setNewPrinterType] = useState<'Laser' | 'Inkjet' | 'Label' | 'Thermal'>('Laser');
  const [newPrinterIp, setNewPrinterIp] = useState('');
  const [showAddPrinter, setShowAddPrinter] = useState(false);

  // Settings states
  const [pollingInterval, setPollingInterval] = useState('2s');
  const [localCachePath, setLocalCachePath] = useState('C:\\ProgramData\\PrintFlow\\spool_cache');
  const [autoRetry, setAutoRetry] = useState(true);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [logRotationSize, setLogRotationSize] = useState('50MB');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Terminal logging states
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  
  // Simulator internal locks
  const [isProcessingJob, setIsProcessingJob] = useState(false);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  // Save printers & trays whenever changed
  useEffect(() => {
    localStorage.setItem('printflow_sim_printers', JSON.stringify(printers));
  }, [printers]);

  useEffect(() => {
    localStorage.setItem('printflow_sim_trays', JSON.stringify(trays));
  }, [trays]);

  // Terminal autoscroll helper
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  if (!currentShop) return null;

  // Add a initial batch of logs if terminal is empty
  useEffect(() => {
    if (terminalLogs.length === 0) {
      const now = new Date().toLocaleTimeString();
      setTerminalLogs([
        { id: '1', text: 'PrintFlow Agent Daemon v1.2.4 booting up...', type: 'info', timestamp: now },
        { id: '2', text: 'Local configuration loaded from system environment.', type: 'info', timestamp: now },
        { id: '3', text: `Shop Credentials Authenticated. Slug: /s/${currentShop.shopSlug}`, type: 'success', timestamp: now },
        { id: '4', text: `Discovered local printers: ${printers.map(p => p.name).join(', ')}`, type: 'info', timestamp: now },
        { id: '5', text: `Standard Spool Trays mapped: ${trays.map(t => `${t.name} -> ${t.size}`).join(' | ')}`, type: 'info', timestamp: now },
        { id: '6', text: `Agent listener active (Polling rate: ${pollingInterval}). Listening for cloud job submissions...`, type: 'success', timestamp: now },
      ] as TerminalLog[]);
    }
  }, []);

  // background loop simulating agent checking the queue
  useEffect(() => {
    const isConnected = currentShop.agentStatus === 'connected';
    if (!isConnected) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const rand = Math.random();
      
      if (rand < 0.15 && !isProcessingJob) {
        // Randomly simulate a quiet poll event to show liveness in terminal
        setTerminalLogs(prev => [
          ...prev, 
          { 
            id: Date.now().toString(), 
            text: `[POLL] Connected to Cloud Queue API. Checking for pending spool files... (0 pending)`, 
            type: 'info' as const, 
            timestamp 
          }
        ].slice(-80) as TerminalLog[]); // Limit logs count
      } else if (rand < 0.25 && !isProcessingJob) {
        // Randomly simulate a heartbeat
        const cpu = (2 + Math.random() * 5).toFixed(1);
        const mem = Math.floor(120 + Math.random() * 30);
        setTerminalLogs(prev => [
          ...prev, 
          { 
            id: Date.now().toString(), 
            text: `[HEARTBEAT] Ping sent. Agent CPU: ${cpu}%, RAM: ${mem}MB. Connection state: ACTIVE`, 
            type: 'success' as const, 
            timestamp 
          }
        ].slice(-80) as TerminalLog[]);
      }
    }, 15000); // every 15s

    return () => clearInterval(interval);
  }, [currentShop.agentStatus, isProcessingJob, pollingInterval]);

  // Handle generating / copy keys
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
      const nextKey = `PRNT-FLW-${generateRandomKey()}`;
      await updateShopSettings(currentShop.id, { pairingKey: nextKey });
      
      const timestamp = new Date().toLocaleTimeString();
      setTerminalLogs(prev => [
        ...prev,
        { id: Date.now().toString(), text: `[SECURITY] Pairing Key regenerated: ${nextKey}. Previous connections invalidated.`, type: 'warn', timestamp }
      ]);
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

  // Add mock printer
  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName) return;

    const newPrinter: MockPrinter = {
      id: `p-${Date.now()}`,
      name: newPrinterName,
      type: newPrinterType,
      status: 'Online',
      ip: newPrinterIp || '192.168.1.' + Math.floor(100 + Math.random() * 150),
      isDefault: printers.length === 0,
      supportedSizes: newPrinterType === 'Laser' ? ['A4', 'Letter', 'A3'] : ['A4', 'Letter']
    };

    setPrinters(prev => [...prev, newPrinter]);
    setNewPrinterName('');
    setNewPrinterIp('');
    setShowAddPrinter(false);

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [
      ...prev,
      { id: Date.now().toString(), text: `[DEVICE] New local printer discovered: ${newPrinter.name} (${newPrinter.type}) on ${newPrinter.ip}`, type: 'info', timestamp }
    ]);
  };

  const deletePrinter = (id: string) => {
    const target = printers.find(p => p.id === id);
    setPrinters(prev => prev.filter(p => p.id !== id));
    
    const timestamp = new Date().toLocaleTimeString();
    if (target) {
      setTerminalLogs(prev => [
        ...prev,
        { id: Date.now().toString(), text: `[DEVICE] Printer detached or deleted: ${target.name}`, type: 'warn', timestamp }
      ]);
    }
  };

  const setDefaultPrinter = (id: string) => {
    setPrinters(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
    const target = printers.find(p => p.id === id);
    
    const timestamp = new Date().toLocaleTimeString();
    if (target) {
      setTerminalLogs(prev => [
        ...prev,
        { id: Date.now().toString(), text: `[DEVICE] System default routing updated to: ${target.name}`, type: 'info', timestamp }
      ]);
    }
  };

  const togglePrinterStatus = (id: string) => {
    const statuses: MockPrinter['status'][] = ['Online', 'Offline', 'Paper Jam', 'Toner Low', 'Standby'];
    setPrinters(prev => prev.map(p => {
      if (p.id === id) {
        const currentIndex = statuses.indexOf(p.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];
        
        // Push log
        setTimeout(() => {
          const timestamp = new Date().toLocaleTimeString();
          setTerminalLogs(prevLogs => [
            ...prevLogs,
            { id: Date.now().toString(), text: `[DEVICE] Printer '${p.name}' changed status to: ${nextStatus.toUpperCase()}`, type: nextStatus === 'Offline' || nextStatus === 'Paper Jam' ? 'error' : 'info', timestamp }
          ]);
        }, 10);

        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Adjust paper tray paper levels
  const replenishTray = (trayId: string) => {
    setTrays(prev => prev.map(t => t.trayId === trayId ? { ...t, currentLevel: 100 } : t));
    const target = trays.find(t => t.trayId === trayId);
    
    const timestamp = new Date().toLocaleTimeString();
    if (target) {
      setTerminalLogs(prev => [
        ...prev,
        { id: Date.now().toString(), text: `[TRAY] Spooled Paper Tray '${target.name}' refilled to 100%.`, type: 'success', timestamp }
      ]);
    }
  };

  // Save Config
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [
      ...prev,
      { id: Date.now().toString(), text: `[CONFIG] Agent settings updated. Polling rate: ${pollingInterval}, cache directory: ${localCachePath}, auto-retry: ${autoRetry}`, type: 'info', timestamp }
    ]);
  };

  // --- COMPREHENSIVE AGENT LIVE SIMULATOR BENCH ---
  const toggleAgentConnection = async () => {
    const isConnected = currentShop.agentStatus === 'connected';
    const nextStatus = isConnected ? 'disconnected' : 'connected';
    const nextPrinterStatus = isConnected ? 'Not Connected' : 'online';
    
    await updateShopSettings(currentShop.id, { 
      agentStatus: nextStatus as any,
      printerStatus: nextPrinterStatus as any
    });

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [
      ...prev,
      { 
        id: Date.now().toString(), 
        text: nextStatus === 'connected' 
          ? `[DAEMON] Connection established. Registered under shop UUID: ${currentShop.id || 'N/A'}` 
          : `[DAEMON] Connection closed by administrator. Socket disconnected.`, 
        type: nextStatus === 'connected' ? 'success' : 'error', 
        timestamp 
      }
    ]);
  };

  const simulateErrorState = async () => {
    const currentPrinterState = currentShop.printerStatus;
    const nextPrinterState = currentPrinterState === 'online' ? 'offline' : 'online';
    
    await updateShopSettings(currentShop.id, {
      printerStatus: nextPrinterState as any
    });

    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [
      ...prev,
      { 
        id: Date.now().toString(), 
        text: nextPrinterState === 'offline' 
          ? `[HARDWARE] CRITICAL: System Printer returned OFFLINE. Spooler paused.` 
          : `[HARDWARE] Recovery: System Printer resolved, returned ONLINE. Spooler resumed.`, 
        type: nextPrinterState === 'offline' ? 'error' : 'success', 
        timestamp 
      }
    ]);
  };

  // Simulate processing the next print job step-by-step
  const triggerNextJobSimulation = async () => {
    if (currentShop.agentStatus !== 'connected') {
      alert('Cannot process jobs while the agent daemon is disconnected!');
      return;
    }

    if (isProcessingJob) return;

    // Retrieve active print queue jobs
    const activeJobs = currentShop.printJobs || currentShop.jobs || [];
    const pendingJob = activeJobs.find(j => j.status === 'submitted' || j.status === 'waiting' || j.status === 'accepted' || j.status === 'printing');

    if (!pendingJob) {
      // Create a simulated job if queue is completely empty so the user can see the flow!
      const timestampStr = new Date().toLocaleTimeString();
      setTerminalLogs(prev => [
        ...prev,
        { id: Date.now().toString(), text: `[SIMULATOR] Print Queue is currently empty. Simulating a mock client submission...`, type: 'warn', timestamp: timestampStr }
      ]);

      // Mock submitting a job to the shop
      const mockSubmittedJob = {
        id: `mock-job-${Math.floor(1000 + Math.random() * 9000)}`,
        token: `PF-${Math.floor(1000 + Math.random() * 9000)}`,
        fileName: `Client_Tax_Invoice_${Math.floor(100 + Math.random() * 900)}.pdf`,
        fileSize: `${(1.2 + Math.random() * 4).toFixed(1)} MB`,
        pages: Math.floor(1 + Math.random() * 8),
        copies: Math.floor(1 + Math.random() * 3),
        colorMode: (Math.random() > 0.5 ? 'color' : 'bw') as 'bw' | 'color',
        paperSize: 'a4' as 'a4',
        sideMode: 'double' as 'double',
        status: 'submitted' as any,
        timestamp: 'Just now'
      };

      setIsProcessingJob(true);
      
      // Step 1: Submission
      await updateJobStatus(currentShop.id, mockSubmittedJob.id, 'submitted');
      // Create it locally in the list
      currentShop.printJobs.unshift(mockSubmittedJob);

      setTimeout(() => {
        executeMockSpool(mockSubmittedJob);
      }, 1000);
    } else {
      executeMockSpool(pendingJob);
    }
  };

  const executeMockSpool = async (job: any) => {
    setIsProcessingJob(true);
    setProcessingJobId(job.id);

    const defaultPrinter = printers.find(p => p.isDefault) || printers[0] || { name: 'HP LaserJet Default' };
    const timestamp = new Date().toLocaleTimeString();

    // 1. Spooling starts
    setTerminalLogs(prev => [
      ...prev,
      { id: Date.now().toString(), text: `[DAEMON] [INCOMING] New print spool received! File: "${job.fileName}" (${job.fileSize}), ${job.pages} pages, ${job.copies} ${job.copies === 1 ? 'copy' : 'copies'}.`, type: 'incoming', timestamp }
    ]);

    // Update job to accepted
    await updateJobStatus(currentShop.id, job.id, 'accepted');

    // 2. Transferred to printer
    setTimeout(async () => {
      const ts2 = new Date().toLocaleTimeString();
      setTerminalLogs(prev => [
        ...prev,
        { id: Date.now().toString(), text: `[SPOOLER] Fetching raw file payload from Cloud secure storage... DONE`, type: 'info', timestamp: ts2 },
        { id: Date.now().toString(), text: `[SPOOLER] Document processed. Routing to local printer: "${defaultPrinter.name}"`, type: 'info', timestamp: ts2 }
      ]);
      
      // Update job to printing
      await updateJobStatus(currentShop.id, job.id, 'printing');

      // 3. Printing animation
      setTimeout(async () => {
        const ts3 = new Date().toLocaleTimeString();
        setTerminalLogs(prev => [
          ...prev,
          { id: Date.now().toString(), text: `[HARDWARE] "${defaultPrinter.name}" feeding paper... Tray 1 Cycle started.`, type: 'info', timestamp: ts3 },
          { id: Date.now().toString(), text: `[HARDWARE] Printing: [====================] 100% completed. ColorMode: ${job.colorMode.toUpperCase()}`, type: 'success', timestamp: ts3 }
        ]);

        // Consume some paper level
        setTrays(prev => prev.map((t, idx) => idx === 0 ? { ...t, currentLevel: Math.max(0, t.currentLevel - (job.pages * job.copies)) } : t));

        // 4. Print completed
        setTimeout(async () => {
          const ts4 = new Date().toLocaleTimeString();
          setTerminalLogs(prev => [
            ...prev,
            { id: Date.now().toString(), text: `[SUCCESS] Job completed! Token code [${job.token}] is ready at counter desk. Spool cache flushed.`, type: 'success', timestamp: ts4 }
          ]);
          
          // Complete job status
          await updateJobStatus(currentShop.id, job.id, 'completed');
          setIsProcessingJob(false);
          setProcessingJobId(null);
        }, 1500);

      }, 2000);

    }, 2000);
  };

  const commands = {
    install: 'npm i -g @printflow/agent',
    pair: `printflow-agent pair ${currentShop.pairingKey || 'PRNT-FLW-A7B89'}`,
    run: 'printflow-agent run'
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
              <Cpu className="w-4.5 h-4.5" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Desktop Integration Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Desktop Print Agent</h1>
          <p className="text-slate-500 font-medium text-xs leading-normal max-w-2xl">
            Bridge physical desktop printers and paper trays directly to your cloud print queue. Fully manage, configure, and monitor connection handshakes.
          </p>
        </div>

        {/* Real-time sync status pill */}
        <div className="flex items-center gap-2 bg-white border border-slate-150 px-4.5 py-2.5 rounded-2xl shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${currentShop.agentStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-black text-slate-800">
            Agent Status: {currentShop.agentStatus === 'connected' ? 'Connected & Spooling' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Rail */}
      <div className="flex border-b border-slate-150 gap-2 overflow-x-auto pb-px" id="agent-tabs-navigation">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4.5 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Cpu className="w-4.5 h-4.5" />
          <span>Overview & CLI setup</span>
        </button>

        <button
          onClick={() => setActiveTab('printers')}
          className={`flex items-center gap-2 px-4.5 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 ${
            activeTab === 'printers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Printer className="w-4.5 h-4.5" />
          <span>Local Printer Mappings</span>
          <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded-md">
            {printers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4.5 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Sliders className="w-4.5 h-4.5" />
          <span>Daemon Configurations</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4.5 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 ${
            activeTab === 'simulator'
              ? 'border-indigo-600 text-indigo-600 font-black bg-indigo-50/40 rounded-t-xl'
              : 'border-transparent text-indigo-600 hover:text-indigo-800 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <Activity className="w-4.5 h-4.5 animate-pulse text-indigo-600" />
          <span>Live Logs & Simulator Bench</span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
        </button>
      </div>

      {/* TABS CONTENT PANELS */}
      <div className="min-h-[400px]">
        {/* TAB 1: OVERVIEW & CLI */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Pairing Credentials Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-slate-950 text-white space-y-6 border-none shadow-xl shadow-slate-950/15" id="pairing-panel">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure Gateway Credentials</span>
                  </p>
                  <h2 className="text-lg font-black tracking-tight">Desktop Pairing Key</h2>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    This single-use 10-character token binds your physical counter computer securely to this specific shop profile.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <code className="text-indigo-300 font-mono font-black text-base tracking-wider select-all">
                    {currentShop.pairingKey || 'GENERATE_KEY'}
                  </code>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyKey}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Copy Pairing Key"
                    >
                      {copied ? <CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
                    </button>
                    <button
                      onClick={handleRegenerateKey}
                      disabled={regenerating}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      title="Regenerate Pairing Key"
                    >
                      <RotateCw className={`w-4.5 h-4.5 ${regenerating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 text-xs font-semibold text-slate-400 leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>Single Active Authorization Token</span>
                  </div>
                  <p>
                    Once your local daemon pairs successfully with this key, the handshake is permanently registered on Supabase, and this key expires automatically.
                  </p>
                </div>
              </Card>

              {/* Connected Client Telemetry Metadata Card */}
              <Card className="p-6 border border-slate-100 space-y-4" id="telemetry-card">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Active Node Telemetry</h3>
                </div>

                {currentShop.agentStatus === 'connected' ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">OS Platform</span>
                        <span className="text-xs font-extrabold text-slate-800">Windows 11 x64</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Daemon Version</span>
                        <span className="text-xs font-extrabold text-slate-800">v1.2.4 (stable)</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between items-center">
                        <span>Client IP Address</span>
                        <span className="font-mono text-slate-900">192.168.1.102 (Local)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Node.js Engine</span>
                        <span className="font-mono text-slate-900">v18.16.0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Connection Type</span>
                        <span className="text-indigo-600 font-bold">Secure Long-Polling</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Hardware Spooler CPU</span>
                        <span className="font-bold text-emerald-600">2.4% (Idle)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-350 mx-auto" />
                    <p className="font-bold text-slate-700 text-sm">No Agent Telemetry Available</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs mx-auto">
                      Please pair and run the desktop agent daemon on your desk PC first to send active telemetry details here.
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* CLI Installation Step Guide */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="p-6 border border-slate-100 space-y-6" id="install-guide">
                <div className="space-y-1 border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">CLI Installation Guide</h2>
                    <p className="text-slate-500 font-medium text-xs">
                      Run these terminal commands on your desk computer to mount the system print pipeline.
                    </p>
                  </div>
                  <Terminal className="w-5.5 h-5.5 text-slate-400" />
                </div>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 bg-indigo-50 border border-indigo-150 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-black shrink-0">
                      1
                    </div>
                    <div className="space-y-2.5 w-full">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Install Node-based Global CLI</h4>
                        <p className="text-slate-500 font-medium text-[11px] leading-relaxed">
                          Requires a Node.js runtime on your computer. Supports Windows PowerShell, macOS Terminal, and Linux Bash.
                        </p>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3.5 flex items-center justify-between text-slate-200 font-mono text-xs border border-slate-900 shadow-inner">
                        <span>{commands.install}</span>
                        <button
                          onClick={() => handleCopyCommand(commands.install, 'inst')}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        >
                          {copiedCmd === 'inst' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 bg-indigo-50 border border-indigo-155 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-black shrink-0">
                      2
                    </div>
                    <div className="space-y-2.5 w-full">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Pair Hardware with Security Token</h4>
                        <p className="text-slate-500 font-medium text-[11px] leading-relaxed">
                          Authenticates your physical local client against the secure Supabase database node.
                        </p>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3.5 flex items-center justify-between text-slate-200 font-mono text-xs border border-slate-900 shadow-inner">
                        <span className="truncate max-w-[250px] md:max-w-none">{commands.pair}</span>
                        <button
                          onClick={() => handleCopyCommand(commands.pair, 'pair')}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors shrink-0 cursor-pointer"
                        >
                          {copiedCmd === 'pair' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 bg-indigo-50 border border-indigo-160 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-black shrink-0">
                      3
                    </div>
                    <div className="space-y-2.5 w-full">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Launch Document Tray Daemon</h4>
                        <p className="text-slate-500 font-medium text-[11px] leading-relaxed">
                          Starts the polling worker daemon process. It will listen silently, spool incoming customer PDFs, and route them to standard tray default paper sizes.
                        </p>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3.5 flex items-center justify-between text-slate-200 font-mono text-xs border border-slate-900 shadow-inner">
                        <span>{commands.run}</span>
                        <button
                          onClick={() => handleCopyCommand(commands.run, 'run')}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
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
        )}

        {/* TAB 2: PRINTERS & TRYS */}
        {activeTab === 'printers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Discovered Printer Devices List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border border-slate-100 space-y-6" id="printers-list-card">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Printer className="w-5 h-5 text-indigo-600" />
                      <span>Discovered System Printers</span>
                    </h3>
                    <p className="text-slate-450 text-[11px] font-semibold">Local printer units parsed by active desktop agent.</p>
                  </div>

                  <button
                    onClick={() => setShowAddPrinter(!showAddPrinter)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-xs font-extrabold text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Printer</span>
                  </button>
                </div>

                {/* Add Mock Printer Form Inline */}
                {showAddPrinter && (
                  <form onSubmit={handleAddPrinter} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-4 grid grid-cols-1 md:grid-cols-12 items-end animate-fadeIn">
                    <div className="md:col-span-5 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Printer Device Name</label>
                      <input
                        type="text"
                        required
                        value={newPrinterName}
                        onChange={(e) => setNewPrinterName(e.target.value)}
                        placeholder="e.g. Brother HL-L2321D Laser"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Device Type</label>
                      <select
                        value={newPrinterType}
                        onChange={(e) => setNewPrinterType(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-xs font-semibold text-slate-800"
                      >
                        <option value="Laser">Laser Printer</option>
                        <option value="Inkjet">Inkjet Printer</option>
                        <option value="Label">Label Writer</option>
                        <option value="Thermal">Thermal POS</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">IP (Optional)</label>
                      <input
                        type="text"
                        value={newPrinterIp}
                        onChange={(e) => setNewPrinterIp(e.target.value)}
                        placeholder="USB / Network"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button
                        type="submit"
                        className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-sm cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPrinter(false)}
                        className="h-9 px-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-lg cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  </form>
                )}

                {printers.length === 0 ? (
                  <div className="text-center py-10">
                    <Printer className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-450">No Printers Discovered yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {printers.map((p) => (
                      <div key={p.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${p.isDefault ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                            <Printer className="w-5 h-5" />
                          </div>
                          <div className="text-left space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 text-xs">{p.name}</span>
                              {p.isDefault && (
                                <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                  Default Routing
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                              <span>Type: {p.type}</span>
                              <span>•</span>
                              <span>Host: {p.ip}</span>
                              <span>•</span>
                              <span>Sizes: {p.supportedSizes.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between border-t md:border-none pt-2 md:pt-0">
                          {/* Printer status toggler */}
                          <button
                            onClick={() => togglePrinterStatus(p.id)}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                              p.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              p.status === 'Offline' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              p.status === 'Paper Jam' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              p.status === 'Toner Low' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }`}
                            title="Click to cycle status states"
                          >
                            ● {p.status}
                          </button>

                          <div className="flex items-center gap-1.5">
                            {!p.isDefault && (
                              <button
                                onClick={() => setDefaultPrinter(p.id)}
                                className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                                title="Set as default print router"
                              >
                                <CheckCircle className="w-4.5 h-4.5" />
                              </button>
                            )}
                            <button
                              onClick={() => deletePrinter(p.id)}
                              className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                              title="Detach device"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Advanced Router Strategy */}
              <Card className="p-6 border border-slate-100 space-y-4" id="router-strategy-card">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Dynamic File Routing Rules</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-1.5">
                    <span className="font-extrabold text-slate-800 text-xs block">Color Mode Routing</span>
                    <p className="text-[11px] leading-relaxed text-slate-450">
                      If color-mode parameter is <span className="text-slate-800 font-bold">bw</span>, route automatically to Monochromatic Laser Printer (HP LaserJet). If color, route to EcoTank L3150 Inkjet.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-1.5">
                    <span className="font-extrabold text-slate-800 text-xs block">Paper Spool Fallback</span>
                    <p className="text-[11px] leading-relaxed text-slate-450">
                      If default printer goes <span className="text-rose-600 font-bold">Offline</span> or raises a <span className="text-amber-600 font-bold">Paper Jam</span>, automatically redirect queue to standby branch Canon imageRUNNER printer.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Trays Capacity Allocations */}
            <div className="space-y-6">
              <Card className="p-6 border border-slate-100 space-y-4" id="trays-card">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Tray Paper Allocations</h3>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-350" />
                </div>

                <div className="space-y-5">
                  {trays.map((t) => (
                    <div key={t.trayId} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-700">{t.name}</span>
                        <span className="text-slate-400 uppercase font-mono">{t.size} size</span>
                      </div>

                      {/* Progress bar container */}
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-150">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              t.currentLevel > 50 ? 'bg-emerald-500' :
                              t.currentLevel > 15 ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${t.currentLevel}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-black font-mono w-8 text-right ${
                          t.currentLevel > 15 ? 'text-slate-700' : 'text-rose-600 animate-pulse'
                        }`}>
                          {t.currentLevel}%
                        </span>
                      </div>

                      {/* Replenish trigger */}
                      <div className="flex justify-between items-center text-[10px] font-semibold">
                        <span className="text-slate-450">Approx: {Math.round(t.currentLevel * 2.5)} sheets left</span>
                        {t.currentLevel < 100 && (
                          <button
                            onClick={() => replenishTray(t.trayId)}
                            className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-0.5 cursor-pointer"
                          >
                            Refill Paper
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Hardware Spool info block */}
              <Card className="p-6 bg-indigo-950 text-white space-y-4 border-none shadow-lg shadow-indigo-950/10" id="tray-routing-warning">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-indigo-200">How paper levels trigger cloud routing</h4>
                    <p className="text-indigo-200/70 text-[11px] font-medium leading-relaxed">
                      If a paper tray reports <span className="font-bold text-white">0%</span> paper, the active local spooler CLI automatically sends a trigger up to the cloud. Walk-in customers who upload files matching that size will be alerted to wait, or the job will hold automatically.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: DAEMON SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 md:p-8 space-y-6" id="daemon-configs-card">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span>Daemon Engine Parameters</span>
                </h3>

                {settingsSaved && (
                  <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Daemon configurations updated and queued for replication.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Polling Strategy */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-500 block">Queue Sync Protocol</label>
                    <select
                      value={pollingInterval}
                      onChange={(e) => setPollingInterval(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-xs font-semibold text-slate-800"
                    >
                      <option value="1s">Fast Long-Polling (1s interval)</option>
                      <option value="2s">Balanced Long-Polling (2s interval)</option>
                      <option value="5s">Eco Long-Polling (5s interval)</option>
                      <option value="10s">Low-Bandwidth (10s interval)</option>
                      <option value="sse">Server-Sent Events (Instant Handshake)</option>
                      <option value="ws">WebSockets Connection (Bi-directional)</option>
                    </select>
                  </div>

                  {/* Local Spool Caching Directory */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-500 block">Local Temp Spool Cache Directory</label>
                    <input
                      type="text"
                      required
                      value={localCachePath}
                      onChange={(e) => setLocalCachePath(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Log rotation */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-500 block">Maximum Disk Log Spool Size</label>
                    <select
                      value={logRotationSize}
                      onChange={(e) => setLogRotationSize(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 text-xs font-semibold text-slate-800"
                    >
                      <option value="10MB">10 MB Spool rotation</option>
                      <option value="50MB">50 MB Spool rotation</option>
                      <option value="100MB">100 MB Spool rotation</option>
                      <option value="unlimited">Unlimited (Manual purge)</option>
                    </select>
                  </div>

                  {/* Auto-retry toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-extrabold text-slate-800 block">Auto-Retry on paper jams</span>
                      <span className="text-[10px] text-slate-450 font-bold block">Retry prints automatically once jam clear</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoRetry(!autoRetry)}
                      className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${autoRetry ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${autoRetry ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Confirm required print */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-extrabold text-slate-800 block">Manual Counter Confirmation Required</span>
                    <span className="text-[10px] text-slate-450 font-bold block">Agent will prompt on physical PC before spooling any document tray</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmationRequired(!confirmationRequired)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${confirmationRequired ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${confirmationRequired ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-slate-50 border border-slate-150 space-y-4 text-left" id="settings-tip">
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Administrative Sync</span>
                </h4>
                <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                  These settings are securely pushed down to the local daemon config database node on the next heartbeat ping. Changes take effect on the client within <span className="text-slate-800 font-black">10 seconds</span>.
                </p>
              </Card>

              <button
                type="submit"
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4.5 h-4.5" />
                <span>Apply Configurations</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: LIVE TERMINAL & SIMULATOR BENCH */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Interactive Simulator Alert */}
            <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl flex flex-col md:row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3">
                <Activity className="w-5.5 h-5.5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5 text-left">
                  <h4 className="font-extrabold text-xs text-indigo-900">Desktop Print Agent Sandbox & Simulator Bench</h4>
                  <p className="text-indigo-700/80 text-[11px] leading-relaxed font-semibold">
                    Simulate active daemon events in real-time. Toggle agent connectivity, mock error reports, or watch the spool queue automatically print step-by-step.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={toggleAgentConnection}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                    currentShop.agentStatus === 'connected'
                      ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{currentShop.agentStatus === 'connected' ? 'Simulate Disconnect' : 'Simulate Connect'}</span>
                </button>

                <button
                  onClick={simulateErrorState}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                    currentShop.printerStatus === 'online'
                      ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{currentShop.printerStatus === 'online' ? 'Simulate Printer Error' : 'Simulate Printer Recover'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Terminal Panel */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="bg-slate-950 text-slate-100 rounded-t-3xl p-4 border-b border-slate-900 flex justify-between items-center shrink-0 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-mono text-xs font-bold text-slate-450 ml-2">printflow-agent-daemon.log</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setTerminalLogs([])}
                      className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase bg-slate-900 px-2 py-1 rounded-md"
                    >
                      Clear Log
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">Node: v18.16.0</span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-b-3xl p-5 font-mono text-xs text-slate-350 min-h-[350px] max-h-[420px] overflow-y-auto space-y-2 border border-slate-900 shadow-inner flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 flex-1">
                    {terminalLogs.length === 0 ? (
                      <p className="text-slate-650 italic py-10 text-center select-none">Terminal logs empty. Click 'Simulate Connection' or trigger events to view active spool logs.</p>
                    ) : (
                      terminalLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 py-0.5 leading-relaxed break-all">
                          <span className="text-slate-600 select-none font-medium shrink-0">[{log.timestamp}]</span>
                          <span className={`font-semibold ${
                            log.type === 'success' ? 'text-emerald-400' :
                            log.type === 'warn' ? 'text-amber-400' :
                            log.type === 'error' ? 'text-rose-400 font-bold' :
                            log.type === 'incoming' ? 'text-indigo-400 font-extrabold animate-pulse' :
                            'text-slate-300'
                          }`}>
                            {log.text}
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={terminalBottomRef} />
                  </div>
                </div>
              </div>

              {/* Action Simulator Controller panel */}
              <div className="lg:col-span-4 flex">
                <Card className="p-6 border border-slate-100 space-y-6 flex-1 flex flex-col justify-between text-left" id="simulator-controller-card">
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-100 space-y-1">
                      <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <Sliders className="w-5 h-5 text-indigo-600" />
                        <span>Interactive Spool Engine</span>
                      </h3>
                      <p className="text-slate-450 text-[10px] font-bold">Drive and analyze state changes step-by-step.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Telemetry diagnostics stats block */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Status Handshake</span>
                          <span className={`font-black uppercase text-[10px] ${currentShop.agentStatus === 'connected' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {currentShop.agentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Printer Gateway</span>
                          <span className={`font-black uppercase text-[10px] ${currentShop.printerStatus === 'online' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {currentShop.printerStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Default Printer</span>
                          <span className="font-bold text-slate-800 truncate max-w-[120px]">
                            {printers.find(p => p.isDefault)?.name || 'None'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Spool Commands</p>
                        
                        <button
                          onClick={triggerNextJobSimulation}
                          disabled={isProcessingJob || currentShop.agentStatus !== 'connected'}
                          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isProcessingJob ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Printing active spool...</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-4 h-4" />
                              <span>Process/Simulate Next Job</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[10px] font-semibold text-slate-500 leading-relaxed space-y-2">
                    <p className="font-extrabold text-slate-700">💡 Development Integration Tip</p>
                    <p>
                      You can open your <span className="text-indigo-600 font-bold">Customer Portal</span> in a separate browser tab, upload any document, and click the button above to watch your mock printer spool the document in real time!
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
