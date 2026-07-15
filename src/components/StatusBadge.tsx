import React from 'react';
import { TrackingStatus } from '../types';
import { CheckCircle2, Clock, Printer, AlertTriangle, XCircle, Download } from 'lucide-react';

interface StatusBadgeProps {
  status: TrackingStatus | 'failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    submitted: {
      text: 'Pending',
      icon: Clock,
      classes: 'bg-amber-50 text-amber-700 border border-amber-100',
    },
    waiting: {
      text: 'Pending',
      icon: Clock,
      classes: 'bg-amber-50 text-amber-700 border border-amber-100',
    },
    accepted: {
      text: 'Downloading',
      icon: Download,
      classes: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    },
    printing: {
      text: 'Printing',
      icon: Printer,
      classes: 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse',
    },
    completed: {
      text: 'Completed',
      icon: CheckCircle2,
      classes: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    },
    ready: {
      text: 'Ready for Pickup',
      icon: CheckCircle2,
      classes: 'bg-teal-50 text-teal-700 border border-teal-100 shadow-[0_2px_10px_rgba(20,184,166,0.1)]',
    },
    picked_up: {
      text: 'Completed',
      icon: CheckCircle2,
      classes: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    },
    cancelled: {
      text: 'Cancelled',
      icon: XCircle,
      classes: 'bg-rose-50 text-rose-700 border border-rose-100',
    },
    failed: {
      text: 'Failed',
      icon: AlertTriangle,
      classes: 'bg-red-50 text-red-700 border border-red-100',
    }
  };

  const current = configs[status as keyof typeof configs] || configs.submitted;
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold tracking-wide ${current.classes}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span>{current.text}</span>
    </div>
  );
};
