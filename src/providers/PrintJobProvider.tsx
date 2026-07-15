import React, { createContext, useContext, useState, useEffect } from 'react';
import { PrintJob, JobStatus } from '../types';
import { printJobService } from '../services/printJobService';

interface PrintJobContextType {
  jobs: PrintJob[];
  loading: boolean;
  createJob: (shopUuid: string, job: Omit<PrintJob, 'id' | 'timestamp'>) => Promise<PrintJob>;
  updateStatus: (jobId: string, status: JobStatus) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  refreshJobs: (shopUuid: string) => Promise<void>;
}

const PrintJobContext = createContext<PrintJobContextType | undefined>(undefined);

export const PrintJobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(false);

  // Start with clean empty state
  useEffect(() => {
    setJobs([]);
  }, []);

  const createJob = async (shopUuid: string, newJob: Omit<PrintJob, 'id' | 'timestamp'>): Promise<PrintJob> => {
    setLoading(true);
    try {
      const created = await printJobService.createPrintJob(shopUuid, newJob);
      setJobs((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId: string, status: JobStatus): Promise<void> => {
    // Optimistic UI update
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status } : job))
    );
    await printJobService.updatePrintJobStatus(jobId, status);
  };

  const deleteJob = async (jobId: string): Promise<void> => {
    // Optimistic UI delete
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    await printJobService.deletePrintJob(jobId);
  };

  const refreshJobs = async (shopUuid: string): Promise<void> => {
    setLoading(true);
    // Simulating query refresh
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
  };

  return (
    <PrintJobContext.Provider
      value={{
        jobs,
        loading,
        createJob,
        updateStatus,
        deleteJob,
        refreshJobs
      }}
    >
      {children}
    </PrintJobContext.Provider>
  );
};

export const usePrintJob = () => {
  const context = useContext(PrintJobContext);
  if (!context) {
    throw new Error('usePrintJob must be used within a PrintJobProvider');
  }
  return context;
};
