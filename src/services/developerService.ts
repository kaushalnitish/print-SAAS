import { 
  DeveloperDiagnosticMetrics, 
  DeveloperPrinterDiagnostic, 
  DeveloperRealtimeEvent, 
  DeveloperErrorDiagnostic, 
  DeveloperHealthProbeResult, 
  DeveloperVersionInfo, 
  DeveloperFeatureFlag 
} from '../types/developer';

export const developerService = {
  /**
   * Fetch current developer telemetry & agent metrics
   */
  async getDiagnosticMetrics(shopId: string): Promise<DeveloperDiagnosticMetrics> {
    // Simulated short network delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      shopId,
      agentConnected: true,
      agentVersion: '1.2.4-stable',
      agentUptimeSeconds: 14820,
      osPlatform: 'Windows 11 Enterprise x64 (Build 22631)',
      clientIp: '192.168.1.102',
      websocketState: 'OPEN',
      websocketLatencyMs: Math.floor(18 + Math.random() * 12),
      heartbeatIntervalMs: 5000,
      lastHeartbeatAt: new Date().toISOString(),
      sequenceCounter: 2964,
      missedHeartbeats: 0,
      cpuUsagePercent: Number((2.1 + Math.random() * 3.5).toFixed(1)),
      memoryUsageMb: Math.floor(142 + Math.random() * 20),
      spoolerCachePath: 'C:\\ProgramData\\PrintFlow\\spool_cache',
      spoolerFreeSpaceMb: 48290,
      spoolerLockedFilesCount: 0,
      queueDepth: 1,
      totalSpoolSizeMb: 3.4,
      errorCount24h: 1,
      warningCount24h: 3,
    };
  },

  /**
   * Fetch hardware printer diagnostics for dev console
   */
  async getPrintersDiagnostics(shopId: string): Promise<DeveloperPrinterDiagnostic[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    return [
      {
        id: 'p1',
        name: 'HP LaserJet Pro MFP M428dw',
        driverVersion: 'v4.18.902 (PCL6 Direct)',
        connectionType: 'Network',
        status: 'Ready',
        port: '192.168.1.15:9100',
        dpi: 1200,
        colorSupported: true,
        duplexSupported: true,
        paperTrays: [
          { id: 't1', name: 'Tray 1 (Auto-Feed)', paperSize: 'A4', levelPercent: 85 },
          { id: 't2', name: 'Tray 2 (Main Cassette)', paperSize: 'Letter', levelPercent: 40 },
          { id: 't3', name: 'Tray 3 (Heavy/Glossy)', paperSize: 'A3', levelPercent: 20 },
        ],
        tonerLevels: [
          { color: 'Black (K)', levelPercent: 78 },
          { color: 'Cyan (C)', levelPercent: 62 },
          { color: 'Magenta (M)', levelPercent: 54 },
          { color: 'Yellow (Y)', levelPercent: 81 },
        ],
        jobsProcessedCount: 412,
        bufferUsagePercent: 12,
      },
      {
        id: 'p2',
        name: 'Epson EcoTank L3150 Wi-Fi',
        driverVersion: 'v2.04.00 (ESC/P-R)',
        connectionType: 'Network',
        status: 'Ready',
        port: '192.168.1.18:9100',
        dpi: 5760,
        colorSupported: true,
        duplexSupported: false,
        paperTrays: [
          { id: 't1', name: 'Rear Feeder', paperSize: 'A4', levelPercent: 60 },
        ],
        tonerLevels: [
          { color: 'Black Ink', levelPercent: 90 },
          { color: 'Color Tank', levelPercent: 88 },
        ],
        jobsProcessedCount: 189,
        bufferUsagePercent: 5,
      },
      {
        id: 'p3',
        name: 'Canon imageRUNNER 2206 A3',
        driverVersion: 'v1.10.02 (UFRII LT)',
        connectionType: 'Network',
        status: 'Busy',
        port: '192.168.1.25:9100',
        dpi: 600,
        colorSupported: false,
        duplexSupported: true,
        paperTrays: [
          { id: 't1', name: 'Cassette 1', paperSize: 'A3', levelPercent: 15 },
          { id: 't2', name: 'Cassette 2', paperSize: 'A4', levelPercent: 95 },
        ],
        tonerLevels: [
          { color: 'Black Toner', levelPercent: 32 },
        ],
        jobsProcessedCount: 890,
        bufferUsagePercent: 45,
      },
    ];
  },

  /**
   * Fetch initial realtime developer event logs
   */
  async getRealtimeEvents(shopId: string, limit: number = 20): Promise<DeveloperRealtimeEvent[]> {
    const now = Date.now();
    const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

    const events: DeveloperRealtimeEvent[] = [
      {
        id: 'evt-101',
        timestamp: iso(2000),
        level: 'INFO',
        category: 'network',
        message: 'WebSocket ACK received from Cloud Gateway (latency: 19ms).',
        code: 'NET_WS_ACK',
        details: { sequence: 2964, endpoint: 'wss://api.printflow.cloud/v1/agent/socket' },
      },
      {
        id: 'evt-100',
        timestamp: iso(5000),
        level: 'INFO',
        category: 'system',
        message: 'Heartbeat sequence #2964 sent. CPU: 2.3%, RAM: 145MB.',
        code: 'SYS_HEARTBEAT',
      },
      {
        id: 'evt-099',
        timestamp: iso(18000),
        level: 'INFO',
        category: 'spool',
        message: 'Spooler queue poll completed. 0 pending jobs requiring local lock.',
        code: 'SPOOL_POLL_OK',
      },
      {
        id: 'evt-098',
        timestamp: iso(45000),
        level: 'DEBUG',
        category: 'hardware',
        message: 'HP LaserJet Pro M428dw query SNMP: Status READY, Paper Tray 1 level 85%.',
        code: 'HW_SNMP_QUERY',
      },
      {
        id: 'evt-097',
        timestamp: iso(120000),
        level: 'INFO',
        category: 'spool',
        message: 'Job #PF-1002 spooled to HP LaserJet Pro M428dw successfully (3 pages).',
        code: 'SPOOL_JOB_DONE',
        details: { jobId: 'job-1002', paperSize: 'A4', colorMode: 'bw' },
      },
      {
        id: 'evt-096',
        timestamp: iso(300000),
        level: 'WARN',
        category: 'hardware',
        message: 'Canon imageRUNNER 2206 reported Tray 1 paper level below 20%.',
        code: 'HW_TRAY_LOW',
      },
      {
        id: 'evt-095',
        timestamp: iso(600000),
        level: 'INFO',
        category: 'security',
        message: 'Handshake token validated against shop schema successfully.',
        code: 'SEC_AUTH_OK',
      },
    ];

    return events.slice(0, limit);
  },

  /**
   * Fetch recent error diagnostics and stack traces
   */
  async getRecentErrors(shopId: string): Promise<DeveloperErrorDiagnostic[]> {
    const now = Date.now();
    return [
      {
        id: 'err-501',
        timestamp: new Date(now - 3600000).toISOString(),
        code: 'ERR_PRINTER_OFFLINE',
        title: 'Printer Communication Timeout',
        message: 'Dymo LabelWriter 450 Turbo did not respond to USB query on port COM3.',
        stackTrace: `Error: ERR_PRINTER_OFFLINE\n    at USBTransport.queryPort (C:\\ProgramFiles\\PrintFlow\\agent\\transport\\usb.js:142:18)\n    at async PrinterManager.pollDevice (C:\\ProgramFiles\\PrintFlow\\agent\\managers\\printer.js:89:5)`,
        module: 'HardwareManager/USBTransport',
        resolved: false,
        severity: 'medium',
      },
      {
        id: 'err-500',
        timestamp: new Date(now - 14400000).toISOString(),
        code: 'ERR_SPOOL_TEMP_LOCK',
        title: 'Spool Directory File Lock',
        message: 'Temporary lock file C:\\ProgramData\\PrintFlow\\spool_cache\\tmp_1001.pdf remained locked for 3500ms.',
        stackTrace: `Error: ERR_SPOOL_TEMP_LOCK: EBUSY: resource busy or locked\n    at SpoolCache.writeChunk (C:\\ProgramFiles\\PrintFlow\\agent\\spooler\\cache.js:54:12)\n    at async SpoolerService.processJob (C:\\ProgramFiles\\PrintFlow\\agent\\services\\spooler.js:112:9)`,
        module: 'SpoolerService/Cache',
        resolved: true,
        severity: 'low',
      },
    ];
  },

  /**
   * Fetch system version information
   */
  async getVersionInfo(): Promise<DeveloperVersionInfo> {
    return {
      agentCliVersion: 'v1.2.4-stable',
      minSupportedAgentVersion: 'v1.0.0',
      apiProtocolVersion: 'v2.1-jsonrpc',
      buildHash: 'a7b9c3e2f18',
      environment: 'Production',
      updateAvailable: true,
      latestAgentVersion: 'v1.3.0-rc2',
    };
  },

  /**
   * Fetch optional developer feature flags
   */
  async getFeatureFlags(): Promise<DeveloperFeatureFlag[]> {
    return [
      {
        id: 'ff-1',
        key: 'ENABLE_RAW_POSTSCRIPT_PASS',
        label: 'Raw PostScript Direct Passthrough',
        description: 'Bypasses local PDF renderer and sends raw PS bytes directly to port 9100.',
        enabled: true,
        optional: true,
      },
      {
        id: 'ff-2',
        key: 'ENABLE_WEBSOCKET_COMPRESSION',
        label: 'WebSocket Per-Message Deflate',
        description: 'Compresses payload frames between desktop agent and cloud backend.',
        enabled: true,
        optional: true,
      },
      {
        id: 'ff-3',
        key: 'ENABLE_EXTENDED_SNMP_PROBING',
        label: 'Extended SNMP Hardware Probing',
        description: 'Queries advanced printer MIB OIDs for exact drum unit and fuser health.',
        enabled: false,
        optional: true,
      },
      {
        id: 'ff-4',
        key: 'ENABLE_DIAGNOSTIC_VERBOSITY',
        label: 'Verbose Payload Debug Headers',
        description: 'Includes request tracing headers in all REST and WebSocket telemetry frames.',
        enabled: true,
        optional: true,
      },
    ];
  },

  /**
   * Run live interactive system health probe
   */
  async runHealthProbe(): Promise<DeveloperHealthProbeResult> {
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 600));
    const elapsed = Math.round(performance.now() - start);

    return {
      apiHealth: 'OK',
      websocketHealth: 'OK',
      dbLatencyMs: Math.max(12, elapsed - 450),
      spoolerWriteCheck: 'PASS',
      storageAccess: 'PASS',
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Send test diagnostic print job
   */
  async triggerTestPrintJob(shopId: string, options?: { printerId?: string; paperSize?: string }): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const testToken = `DIAG-${Math.floor(1000 + Math.random() * 9000)}`;
    return testToken;
  },

  /**
   * Flush local spooler cache
   */
  async flushSpoolerBuffer(shopId: string): Promise<{ freedMb: number; deletedFiles: number }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      freedMb: 14.8,
      deletedFiles: 3,
    };
  },
};
