export type ColorMode = 'bw' | 'color';
export type PaperSize = 'a4' | 'a3';
export type SideMode = 'single' | 'double';

export interface PrintSettings {
  copies: number;
  colorMode: ColorMode;
  paperSize: PaperSize;
  sideMode: SideMode;
}

export interface PrintFile {
  name: string;
  size: number;
  type: string;
  pages: number;
  previewUrl?: string;
  rawFile?: File;
}

export type UploadStep = 'preparing' | 'uploading' | 'processing' | 'finalizing';

export type TrackingStatus = 'submitted' | 'waiting' | 'accepted' | 'printing' | 'completed' | 'ready' | 'picked_up' | 'cancelled';

export interface OrderState {
  token: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  status: TrackingStatus;
  file: PrintFile | null;
  settings: PrintSettings;
}

export interface ShopInfo {
  name: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
}

// Database & Domain Types for Backend Ready SaaS
export * from './database';
