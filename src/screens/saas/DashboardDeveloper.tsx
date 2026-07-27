import React, { useState, useEffect, useRef } from 'react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { developerService } from '../../services/developerService';
import { 
  DeveloperDiagnosticMetrics, 
  DeveloperPrinterDiagnostic, 
  DeveloperRealtimeEvent, 
  DeveloperErrorDiagnostic, 
  DeveloperHealthProbeResult, 
  DeveloperVersionInfo, 
  DeveloperFeatureFlag,
  DiagnosticLogLevel,
  EventCategory
} from '../../types/developer';
import { 
  Terminal, Activity, Cpu, HardDrive, Wifi, Shield, 
  AlertTriangle, CheckCircle2, RotateCw, Copy, Check, 
  Search, Filter, Play, RefreshCw, Trash2, Code2, 
  Sliders, Layers, Server, Bug, FileText, ExternalLink, 
  ArrowUpRight, AlertCircle, Wrench, Download, Zap,
  CheckCircle, ChevronDown, ChevronRight, Info, Printer
} from 'lucide-react';

export const DashboardDeveloper: React.FC = () => {
  const { currentShop, updateShopSettings, updateJobStatus } = useSaaS();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'telemetry' | 'printers' | 'events' | 'queue' | 'errors' | 'tools'>('telemetry');

  // Diagnostic State
  const [metrics, setMetrics] = useState<DeveloperDiagnosticMetrics | null>(null);
  const [printers, setPrinters] = useState<DeveloperPrinterDiagnostic[]>([]);
  const [events, setEvents] = useState<DeveloperRealtimeEvent[]>([]);
  const [errors, setErrors] = useState<DeveloperErrorDiagnostic[]>([]);
  const [versionInfo, setVersionInfo] = useState<DeveloperVersionInfo | null>(null);
  const [featureFlags, setFeatureFlags] = useState<DeveloperFeatureFlag[]>([]);
  const [healthProbe, setHealthProbe] = useState<DeveloperHealthProbeResult | null>(null);

  // Filters & Controls
  const [loading, setLoading] = useState(true);
  const [probeRunning, setProbeRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Test Print simulation state
  const [testJobPending, setTestJobPending] = useState(false);

  // Terminal autoscroll reference
  const terminalLogsEndRef = useRef<HTMLDivElement>(null);

  // Load initial developer diagnostics
  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      if (!currentShop) return;
      try {
        setLoading(true);
        const [m, p, ev, errs, ver, flags] = await Promise.all([
          developerService.getDiagnosticMetrics(currentShop.id),
          developerService.getPrintersDiagnostics(currentShop.id),
          developerService.getRealtimeEvents(currentShop.id, 30),
          developerService.getRecentErrors(currentShop.id),
          developerService.getVersionInfo(),
          developerService.getFeatureFlags(),
        ]);

        if (mounted) {
          setMetrics(m);
          setPrinters(p);
          setEvents(ev);
          setErrors(errs);
          setVersionInfo(ver);
          setFeatureFlags(flags);
        }
      } catch (err) {
        console.error('Failed to load developer diagnostics:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [currentShop?.id]);

  // Periodic heartbeat & metrics polling simulation
  useEffect(() => {
    if (!autoRefresh || !currentShop) return;

    const interval = setInterval(async () => {
      try {
        const nextMetrics = await developerService.getDiagnosticMetrics(currentShop.id);
        setMetrics((prev) => {
          if (!prev) return nextMetrics;
          return {
            ...nextMetrics,
            sequenceCounter: prev.sequenceCounter + 1,
            lastHeartbeatAt: new Date().toISOString(),
            websocketLatencyMs: Math.floor(16 + Math.random() * 15),
            cpuUsagePercent: Number((1.8 + Math.random() * 4).toFixed(1)),
            memoryUsageMb: Math.floor(140 + Math.random() * 18),
          };
        });

        // Push occasional new heartbeat event to real-time events feed
        if (Math.random() < 0.6) {
          const newEvt: DeveloperRealtimeEvent = {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'INFO',
            category: 'system',
            message: `Heartbeat pulse #${metrics ? metrics.sequenceCounter + 1 : 2965} processed (Latency: ${Math.floor(16 + Math.random() * 12)}ms).`,
            code: 'SYS_HEARTBEAT',
          };
          setEvents((prev) => [newEvt, ...prev].slice(0, 100));
        }
      } catch (e) {
        console.error('Error polling telemetry metrics:', e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh, currentShop?.id, metrics?.sequenceCounter]);

  if (!currentShop) return null;

  // Actions
  const handleRunHealthProbe = async () => {
    try {
      setProbeRunning(true);
      const result = await developerService.runHealthProbe();
      setHealthProbe(result);
      showNotice('Interactive Health Probe executed successfully. All systems nominal.');
    } catch (e) {
      console.error(e);
      showNotice('Health probe returned error or warning status.');
    } finally {
      setProbeRunning(false);
    }
  };

  const handleTriggerTestPrint = async () => {
    try {
      setTestJobPending(true);
      const testToken = await developerService.triggerTestPrintJob(currentShop.id);

      // Create a mock job in queue
      const mockDiagJob = {
        id: `diag-job-${Date.now()}`,
        token: testToken,
        fileName: `Developer_Diagnostic_Pattern_${Math.floor(100 + Math.random() * 900)}.pdf`,
        fileSize: '1.4 MB',
        pages: 2,
        copies: 1,
        colorMode: 'color' as const,
        paperSize: 'a4' as const,
        sideMode: 'single' as const,
        status: 'accepted' as const,
        timestamp: 'Just now',
      };

      if (currentShop.printJobs) {
        currentShop.printJobs.unshift(mockDiagJob);
      }

      // Add event log
      const newEvt: DeveloperRealtimeEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        category: 'spool',
        message: `Diagnostic test job [${testToken}] queued to spooler pipeline.`,
        code: 'SPOOL_TEST_JOB',
        details: mockDiagJob,
      };
      setEvents((prev) => [newEvt, ...prev]);

      showNotice(`Diagnostic test job triggered! Token [${testToken}] generated.`);
    } catch (e) {
      console.error(e);
    } finally {
      setTestJobPending(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      const res = await developerService.flushSpoolerBuffer(currentShop.id);
      showNotice(`Spooler cache flushed! Freed ${res.freedMb} MB across ${res.deletedFiles} temp files.`);

      if (metrics) {
        setMetrics({
          ...metrics,
          spoolerLockedFilesCount: 0,
          totalSpoolSizeMb: 0.2,
        });
      }

      const newEvt: DeveloperRealtimeEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'WARN',
        category: 'spool',
        message: `Manual Spooler Cache Flush triggered by developer console. ${res.freedMb}MB freed.`,
        code: 'SPOOL_CACHE_FLUSH',
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateHardwareFault = async (faultType: 'paper_jam' | 'low_toner' | 'offline') => {
    const printerToFault = printers[0];
    if (!printerToFault) return;

    const updatedStatus = faultType === 'paper_jam' ? 'Paper Jam' : faultType === 'low_toner' ? 'Low Toner' : 'Offline';

    setPrinters((prev) =>
      prev.map((p) => (p.id === printerToFault.id ? { ...p, status: updatedStatus as any } : p))
    );

    const newError: DeveloperErrorDiagnostic = {
      id: `err-${Date.now()}`,
      timestamp: new Date().toISOString(),
      code: `ERR_${faultType.toUpperCase()}`,
      title: `Simulated Hardware Fault: ${updatedStatus}`,
      message: `Printer '${printerToFault.name}' reported state change to ${updatedStatus}.`,
      stackTrace: `Simulated Hardware Exception\n    at HardwareManager.simulateFault (${printerToFault.name}:120)\n    at DeveloperConsole.trigger (dev_diagnostics.ts:45)`,
      module: 'HardwareDiagnostics/Simulator',
      resolved: false,
      severity: faultType === 'low_toner' ? 'low' : 'high',
    };

    setErrors((prev) => [newError, ...prev]);

    const newEvt: DeveloperRealtimeEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      category: 'hardware',
      message: `CRITICAL: Printer '${printerToFault.name}' triggered simulated fault: ${updatedStatus}`,
      code: `HW_${faultType.toUpperCase()}`,
      details: newError,
    };
    setEvents((prev) => [newEvt, ...prev]);

    showNotice(`Simulated hardware fault '${updatedStatus}' dispatched to printer diagnostics.`);
  };

  const handleResolveError = (errId: string) => {
    setErrors((prev) =>
      prev.map((e) => (e.id === errId ? { ...e, resolved: true } : e))
    );

    const newEvt: DeveloperRealtimeEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'system',
      message: `Diagnostic Exception [${errId}] marked as RESOLVED by developer.`,
      code: 'ERR_RESOLVED_MANUAL',
    };
    setEvents((prev) => [newEvt, ...prev]);

    showNotice(`Diagnostic exception #${errId} marked as resolved.`);
  };

  const toggleFeatureFlag = (flagKey: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.key === flagKey ? { ...f, enabled: !f.enabled } : f))
    );
    showNotice(`Developer Feature Flag '${flagKey}' toggled.`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (selectedLogLevel !== 'ALL' && e.level !== selectedLogLevel) return false;
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      const matchText = e.message.toLowerCase().includes(q);
      const matchCode = e.code?.toLowerCase().includes(q);
      const matchCategory = e.category.toLowerCase().includes(q);
      return matchText || matchCode || matchCategory;
    }
    return true;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" />
              <span>Developer Console & Diagnostics</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">• Additive Diagnostics Layer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">System Developer Dashboard</h1>
          <p className="text-slate-500 font-medium text-xs leading-normal max-w-2xl mt-0.5">
            Real-time telemetry, WebSocket heartbeat inspection, printer driver diagnostics, event logs, error stack traces, and protocol testing tools.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
              autoRefresh 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="Toggle real-time 4s heartbeat polling"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Live Sync: {autoRefresh ? 'ON (4s)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={handleRunHealthProbe}
            disabled={probeRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${probeRunning ? 'animate-bounce' : ''}`} />
            <span>{probeRunning ? 'Probing...' : 'Run Health Probe'}</span>
          </button>

          <button
            onClick={handleTriggerTestPrint}
            disabled={testJobPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{testJobPending ? 'Queuing Test...' : 'Test Spool Payload'}</span>
          </button>
        </div>
      </div>

      {/* Floating Notification Bar */}
      {actionNotice && (
        <div className="p-3 bg-indigo-900 text-indigo-100 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between border border-indigo-700 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-300 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-indigo-300 hover:text-white font-extrabold text-xs px-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Telemetry KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Agent State */}
        <Card className="p-4 border border-slate-200/80 space-y-2 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Agent Daemon Node</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-base font-black text-slate-900">Connected</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              CLI: {metrics?.agentVersion || '1.2.4'} • Win11 x64
            </p>
          </div>
        </Card>

        {/* KPI 2: WebSocket & Heartbeat Latency */}
        <Card className="p-4 border border-slate-200/80 space-y-2 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">WebSocket Latency</span>
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{metrics?.websocketLatencyMs || 18}</span>
              <span className="text-xs font-bold text-slate-500">ms</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Seq #{metrics?.sequenceCounter || 2964} (0 missed)</span>
            </p>
          </div>
        </Card>

        {/* KPI 3: Hardware Printer Fleet */}
        <Card className="p-4 border border-slate-200/80 space-y-2 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Printers Discovered</span>
            <Printer className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{printers.length}</span>
              <span className="text-xs font-bold text-slate-500">units online</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
              Default: {printers.find(p => p.status === 'Ready')?.name || 'HP LaserJet'}
            </p>
          </div>
        </Card>

        {/* KPI 4: Queue & Spool Buffer */}
        <Card className="p-4 border border-slate-200/80 space-y-2 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Spooler Capacity</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{metrics?.totalSpoolSizeMb || 3.4}</span>
              <span className="text-xs font-bold text-slate-500">MB queued</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Cache: {metrics?.spoolerFreeSpaceMb ? Math.round(metrics.spoolerFreeSpaceMb / 1024) : 48} GB free
            </p>
          </div>
        </Card>

        {/* KPI 5: Error Exception Rate */}
        <Card className="p-4 border border-slate-200/80 space-y-2 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Diagnostic Exceptions</span>
            <Bug className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{errors.filter(e => !e.resolved).length}</span>
              <span className="text-xs font-bold text-slate-500">unresolved</span>
            </div>
            <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
              {errors.length} total logged in 24h
            </p>
          </div>
        </Card>
      </div>

      {/* Developer Navigation Tabs Rail */}
      <div className="flex border-b border-slate-200/80 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'telemetry'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Telemetry & Heartbeat</span>
        </button>

        <button
          onClick={() => setActiveTab('printers')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'printers'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-4 h-4 text-indigo-600" />
          <span>Printer Driver Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>Realtime Event Stream</span>
          <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black">
            {events.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Spool Queue Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'errors'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Exceptions & Debugger</span>
          {errors.filter(e => !e.resolved).length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[9px] font-black">
              {errors.filter(e => !e.resolved).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'tools'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-indigo-600" />
          <span>Tools & Protocol API</span>
        </button>
      </div>

      {/* TABS CONTENT BODY */}

      {/* TAB 1: TELEMETRY & HEARTBEAT */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heartbeat Status Inspector */}
          <Card className="p-6 border border-slate-200/80 space-y-5 lg:col-span-2">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>WebSocket Heartbeat Monitor</span>
                </h3>
                <p className="text-slate-500 text-xs font-semibold">
                  Sub-second heartbeat pulse state, sequence window, and latency metrics.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                ● SOCKET_OPEN
              </span>
            </div>

            {/* Sequence pulse visuals */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Heartbeat Sequence Frames</span>
                <span className="text-indigo-600 font-mono">Interval: 5000ms</span>
              </div>
              <div className="grid grid-cols-12 gap-1.5 p-3 bg-slate-950 rounded-2xl border border-slate-900">
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-8 rounded-md flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                      idx === 23 
                        ? 'bg-emerald-500 text-slate-950 animate-pulse' 
                        : 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-700'
                    }`}
                    title={`Pulse #${(metrics?.sequenceCounter || 2964) - (23 - idx)}`}
                  >
                    {idx === 23 ? 'OK' : '200'}
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>Host OS Platform</span>
                  <span className="font-mono text-indigo-600">{metrics?.osPlatform || 'Windows 11'}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>Client IP Address</span>
                  <span className="font-mono">{metrics?.clientIp || '192.168.1.102'}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>Agent Uptime</span>
                  <span className="font-mono">4 hours, 07 mins</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>CPU Utilization</span>
                  <span className="font-mono text-emerald-600">{metrics?.cpuUsagePercent}%</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>RAM Memory Heap</span>
                  <span className="font-mono text-emerald-600">{metrics?.memoryUsageMb} MB</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>Spool Directory Path</span>
                  <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">{metrics?.spoolerCachePath}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Diagnostics Control Card */}
          <Card className="p-6 border border-slate-200/80 space-y-5">
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Simulated Diagnostics Bench</span>
              </h3>
              <p className="text-slate-500 text-xs font-medium">
                Safely test agent responsiveness without affecting live customers.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleFlushCache}
                className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-between px-4 border border-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-slate-600" />
                  <span>Flush Spool Cache</span>
                </div>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded font-bold text-slate-500 border border-slate-200">
                  3.4 MB
                </span>
              </button>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-amber-900">Simulate Hardware Fault</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleSimulateHardwareFault('paper_jam')}
                    className="py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                  >
                    Paper Jam
                  </button>
                  <button
                    onClick={() => handleSimulateHardwareFault('low_toner')}
                    className="py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                  >
                    Low Toner
                  </button>
                  <button
                    onClick={() => handleSimulateHardwareFault('offline')}
                    className="py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                  >
                    Offline Drop
                  </button>
                </div>
              </div>

              {healthProbe && (
                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1.5 font-mono border border-slate-800">
                  <div className="flex justify-between items-center text-indigo-300 font-bold text-[10px] uppercase">
                    <span>Probe Diagnostic Output</span>
                    <span>{new Date(healthProbe.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Route:</span>
                    <span className="text-emerald-400 font-bold">{healthProbe.apiHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WebSocket:</span>
                    <span className="text-emerald-400 font-bold">{healthProbe.websocketHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Latency:</span>
                    <span className="text-indigo-300 font-bold">{healthProbe.dbLatencyMs}ms</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PRINTER DRIVER DIAGNOSTICS */}
      {activeTab === 'printers' && (
        <div className="space-y-6">
          <Card className="p-6 border border-slate-200/80 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  <span>Hardware Printer Diagnostics</span>
                </h3>
                <p className="text-slate-500 text-xs font-semibold">
                  Driver version strings, PCL/PostScript capabilities, tray capacity meters, and CMYK toner levels.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {printers.length} Printers Managed
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{printer.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{printer.driverVersion}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                        printer.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : printer.status === 'Busy'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {printer.status}
                    </span>
                  </div>

                  {/* Meter: Toner / Ink */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Consumable Cartridges & Toner Levels
                    </p>
                    <div className="space-y-1.5">
                      {printer.tonerLevels.map((toner, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700">
                            <span>{toner.color}</span>
                            <span>{toner.levelPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                toner.levelPercent < 25
                                  ? 'bg-rose-500'
                                  : toner.levelPercent < 50
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-600'
                              }`}
                              style={{ width: `${toner.levelPercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trays */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Paper Trays & Cassette Feeders
                    </p>
                    <div className="space-y-2">
                      {printer.paperTrays.map((tray) => (
                        <div key={tray.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-800">
                            <span>{tray.name} ({tray.paperSize})</span>
                            <span className="text-indigo-600">{tray.levelPercent}% Full</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${tray.levelPercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities Footer */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>DPI: {printer.dpi}</span>
                    <span>Port: {printer.port}</span>
                    <span className="text-indigo-600 font-bold">{printer.jobsProcessedCount} jobs printed</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: REALTIME EVENT STREAM */}
      {activeTab === 'events' && (
        <Card className="p-6 border border-slate-200/80 space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <span>Realtime Diagnostic Event Stream</span>
              </h3>
              <p className="text-slate-500 text-xs font-semibold">
                Live structured logging pipeline capturing WebSocket frames, spool locks, and hardware responses.
              </p>
            </div>

            {/* Event Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Search logs..."
                  className="h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <select
                value={selectedLogLevel}
                onChange={(e) => setSelectedLogLevel(e.target.value)}
                className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Levels</option>
                <option value="DEBUG">DEBUG</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Categories</option>
                <option value="system">System</option>
                <option value="network">Network</option>
                <option value="spool">Spool</option>
                <option value="hardware">Hardware</option>
                <option value="security">Security</option>
              </select>

              <button
                onClick={() => setEvents([])}
                className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                title="Clear terminal event log buffer"
              >
                Clear Stream
              </button>
            </div>
          </div>

          {/* Terminal Console View */}
          <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-200 border border-slate-900 shadow-inner max-h-[500px] overflow-y-auto space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono">
                [NO_EVENTS_FOUND] No telemetry event records matching current filters.
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-850 space-y-1.5 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          evt.level === 'ERROR'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : evt.level === 'WARN'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : evt.level === 'DEBUG'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {evt.level}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-bold uppercase">
                        {evt.category}
                      </span>
                      {evt.code && <span className="text-indigo-400 font-bold">[{evt.code}]</span>}
                    </div>

                    {evt.details && (
                      <button
                        onClick={() => setExpandedEventId(expandedEventId === evt.id ? null : evt.id)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-sans"
                      >
                        {expandedEventId === evt.id ? 'Hide Payload JSON' : 'Inspect Payload'}
                      </button>
                    )}
                  </div>

                  <p className="text-slate-200 font-medium leading-relaxed">{evt.message}</p>

                  {/* Expanded JSON Inspector */}
                  {expandedEventId === evt.id && evt.details && (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 mt-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span>RAW JSON EVENT PAYLOAD</span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(evt.details, null, 2), `evt-${evt.id}`)}
                          className="hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedCode === `evt-${evt.id}` ? 'Copied!' : 'Copy JSON'}</span>
                        </button>
                      </div>
                      <pre className="text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(evt.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={terminalLogsEndRef} />
          </div>
        </Card>
      )}

      {/* TAB 4: SPOOL QUEUE INSPECTOR */}
      {activeTab === 'queue' && (
        <Card className="p-6 border border-slate-200/80 space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Spool Queue File Lock & Payload Inspector</span>
              </h3>
              <p className="text-slate-500 text-xs font-semibold">
                Inspect raw document payloads, file size, lock statuses, and paper target sizes in real-time.
              </p>
            </div>
            <button
              onClick={handleTriggerTestPrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              + Queue Test Spool File
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(currentShop.printJobs || []).map((job) => (
              <div key={job.id} className="py-4 space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl font-mono text-xs font-black">
                      {job.token}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{job.fileName}</h4>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Size: {job.fileSize} • Pages: {job.pages} • Copies: {job.copies} • Color: {job.colorMode.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        job.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : job.status === 'printing'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      ● {job.status}
                    </span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(job, null, 2), `job-${job.id}`)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode === `job-${job.id}` ? 'Copied' : 'JSON'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] border border-slate-900 overflow-x-auto">
                  <pre>{JSON.stringify({
                    jobId: job.id,
                    token: job.token,
                    spoolLockState: 'UNLOCKED',
                    localSpoolPath: `C:\\ProgramData\\PrintFlow\\spool_cache\\spool_${job.token}.pdf`,
                    paperTarget: job.paperSize.toUpperCase(),
                    duplex: job.sideMode === 'double',
                    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                  }, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: EXCEPTIONS & DEBUGGER */}
      {activeTab === 'errors' && (
        <Card className="p-6 border border-slate-200/80 space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Diagnostic Exceptions & Error Debugger</span>
              </h3>
              <p className="text-slate-500 text-xs font-semibold">
                Categorized runtime errors, call stack traces, and fault recovery mechanisms.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSimulateHardwareFault('paper_jam')}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
              >
                + Inject Test Fault
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {errors.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-extrabold text-slate-800 text-sm">No Unresolved Exceptions</p>
                <p className="text-slate-500 text-xs mt-0.5">All system modules are running without runtime errors.</p>
              </div>
            ) : (
              errors.map((err) => (
                <div
                  key={err.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                    err.resolved
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : err.severity === 'high' || err.severity === 'critical'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{err.title}</span>
                        <span className="font-mono text-indigo-600 text-xs font-bold">[{err.code}]</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          err.resolved ? 'bg-slate-200 text-slate-700' : 'bg-rose-600 text-white'
                        }`}>
                          {err.resolved ? 'RESOLVED' : err.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600">{err.message}</p>
                    </div>

                    {!err.resolved && (
                      <button
                        onClick={() => handleResolveError(err.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer shrink-0"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>

                  {err.stackTrace && (
                    <div className="space-y-1">
                      <button
                        onClick={() => setExpandedErrorId(expandedErrorId === err.id ? null : err.id)}
                        className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 underline focus:outline-none"
                      >
                        {expandedErrorId === err.id ? 'Hide Call Stack' : 'View Exception Call Stack'}
                      </button>

                      {expandedErrorId === err.id && (
                        <div className="p-3 bg-slate-950 text-rose-300 rounded-xl font-mono text-[11px] border border-slate-900 overflow-x-auto">
                          <pre>{err.stackTrace}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] font-semibold text-slate-400 flex justify-between pt-1 border-t border-slate-200/50">
                    <span>Module: {err.module}</span>
                    <span>Logged at: {new Date(err.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 6: TOOLS & PROTOCOL API */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Version Info & Feature Flags */}
          <Card className="p-6 border border-slate-200/80 space-y-6">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                <span>Version Matrix & Protocol Flags</span>
              </h3>
              <p className="text-slate-500 text-xs font-semibold">
                Version compatibility constraints and optional runtime feature flags.
              </p>
            </div>

            {versionInfo && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span>Desktop CLI Version:</span>
                  <span className="font-mono text-slate-900 font-extrabold">{versionInfo.agentCliVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>API Protocol Version:</span>
                  <span className="font-mono text-indigo-600 font-extrabold">{versionInfo.apiProtocolVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Build Hash:</span>
                  <span className="font-mono text-slate-600">{versionInfo.buildHash}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-mono text-emerald-600 font-extrabold">{versionInfo.environment}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Additive Developer Feature Flags
              </p>

              <div className="space-y-2">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-900">{flag.label}</p>
                      <p className="text-[11px] font-medium text-slate-500">{flag.description}</p>
                      <span className="font-mono text-[10px] text-indigo-600 block">{flag.key}</span>
                    </div>

                    <button
                      onClick={() => toggleFeatureFlag(flag.key)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        flag.enabled 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* JSON-RPC & REST API Reference */}
          <Card className="p-6 border border-slate-200/80 space-y-5">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <span>Diagnostics API Protocol Reference</span>
              </h3>
              <p className="text-slate-500 text-xs font-semibold">
                Code snippets to programmatically query agent telemetry & health metrics.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>1. cURL Health Endpoint Query</span>
                  <button
                    onClick={() => handleCopy('curl -X GET "https://api.printflow.cloud/v1/agent/diagnostics/health" -H "Authorization: Bearer PRNT-FLW-KEY"', 'curl')}
                    className="text-indigo-600 hover:underline text-[11px]"
                  >
                    {copiedCode === 'curl' ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-indigo-300 rounded-xl font-mono text-[11px] border border-slate-900 overflow-x-auto">
                  {`curl -X GET "https://api.printflow.cloud/v1/agent/diagnostics/health" \\
  -H "Authorization: Bearer ${currentShop.pairingKey || 'PRNT-FLW-KEY'}"`}
                </pre>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>2. Node.js Telemetry Subscription Snippet</span>
                  <button
                    onClick={() => handleCopy(`import { developerService } from './services/developerService';\nconst metrics = await developerService.getDiagnosticMetrics('${currentShop.id}');`, 'node')}
                    className="text-indigo-600 hover:underline text-[11px]"
                  >
                    {copiedCode === 'node' ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] border border-slate-900 overflow-x-auto">
                  {`import { developerService } from './services/developerService';

// Query agent diagnostics programmatically
const metrics = await developerService.getDiagnosticMetrics('${currentShop.id}');
console.log('Active WebSocket Latency:', metrics.websocketLatencyMs);`}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
