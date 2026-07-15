import { useEffect, useState } from 'react';
import { queueService } from '../services/queueService';
import { agentService } from '../services/agentService';
import { DBPrintQueue, PrinterStatus, AgentStatus } from '../types';

/**
 * Hook to subscribe to a shop's real-time queue metrics.
 */
export function useRealtimeQueue(shopId: string | undefined) {
  const [queue, setQueue] = useState<DBPrintQueue | null>(null);

  useEffect(() => {
    if (!shopId) return;

    // Load initial queue data
    queueService.getQueueStatus(shopId).then(setQueue);

    // Subscribe to real-time updates
    const unsubscribe = queueService.subscribeQueue(shopId, (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => {
      unsubscribe();
    };
  }, [shopId]);

  return queue;
}

/**
 * Hook to subscribe to real-time physical printer hardware and software agent statuses.
 */
export function useRealtimePrinter(shopId: string | undefined) {
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus>('Not Connected');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('Not Installed');

  useEffect(() => {
    if (!shopId) return;

    // Fetch initial status
    agentService.getAgentStatus(shopId).then((data) => {
      setPrinterStatus(data.status === 'connected' ? 'online' : 'Not Connected');
      setAgentStatus(data.status);
    });

    // Subscribe to real-time printer status
    const unsubscribePrinter = agentService.subscribePrinter(shopId, (status) => {
      setPrinterStatus(status);
    });

    // Subscribe to real-time agent status
    const unsubscribeAgent = agentService.subscribeAgent(shopId, (status) => {
      setAgentStatus(status);
    });

    return () => {
      unsubscribePrinter();
      unsubscribeAgent();
    };
  }, [shopId]);

  return { printerStatus, agentStatus };
}
