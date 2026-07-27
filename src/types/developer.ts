// =====================================================================
// PRINTFLOW DEVELOPER MODE & DIAGNOSTICS TYPES
// =====================================================================
// Additive types for developer console, agent telemetry, and hardware diagnostics.

export type DiagnosticLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
export type EventCategory = 'system' | 'network' | 'spool' | 'hardware' | 'security' | 'api';

export interface DeveloperDiagnosticMetrics {
  shopId: string;
  agentConnected: boolean;
  agentVersion: string;
  agentUptimeSeconds: number;
  osPlatform: string;
  clientIp: string;
  websocketState: 'OPEN' | 'CONNECTING' | 'CLOSED' | 'RECONNECTING';
  websocketLatencyMs: number;
  heartbeatIntervalMs: number;
  lastHeartbeatAt: string;
  sequenceCounter: number;
  missedHeartbeats: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  spoolerCachePath: string;
  spoolerFreeSpaceMb: number;
  spoolerLockedFilesCount: number;
  queueDepth: number;
  totalSpoolSizeMb: number;
  errorCount24h: number;
  warningCount24h: number;
}

export interface DeveloperPaperTray {
  id: string;
  name: string;
  paperSize: string;
  levelPercent: number;
}

export interface DeveloperTonerLevel {
  color: string; // e.g. 'Cyan', 'Magenta', 'Yellow', 'Black'
  levelPercent: number;
}

export interface DeveloperPrinterDiagnostic {
  id: string;
  name: string;
  driverVersion: string;
  connectionType: 'USB' | 'Network' | 'Virtual Spool';
  status: 'Ready' | 'Busy' | 'Paper Jam' | 'Low Toner' | 'Offline';
  port: string;
  dpi: number;
  colorSupported: boolean;
  duplexSupported: boolean;
  paperTrays: DeveloperPaperTray[];
  tonerLevels: DeveloperTonerLevel[];
  jobsProcessedCount: number;
  bufferUsagePercent: number;
}

export interface DeveloperRealtimeEvent {
  id: string;
  timestamp: string;
  level: DiagnosticLogLevel;
  category: EventCategory;
  message: string;
  details?: Record<string, any>;
  code?: string;
}

export interface DeveloperErrorDiagnostic {
  id: string;
  timestamp: string;
  code: string;
  title: string;
  message: string;
  stackTrace?: string;
  module: string;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeveloperHealthProbeResult {
  apiHealth: 'OK' | 'DEGRADED' | 'FAILED';
  websocketHealth: 'OK' | 'DEGRADED' | 'FAILED';
  dbLatencyMs: number;
  spoolerWriteCheck: 'PASS' | 'FAIL';
  storageAccess: 'PASS' | 'FAIL';
  timestamp: string;
}

export interface DeveloperVersionInfo {
  agentCliVersion: string;
  minSupportedAgentVersion: string;
  apiProtocolVersion: string;
  buildHash: string;
  environment: 'Production' | 'Staging' | 'Development';
  updateAvailable: boolean;
  latestAgentVersion: string;
}

export interface DeveloperFeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  optional: boolean;
}
