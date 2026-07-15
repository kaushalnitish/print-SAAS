import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PrintJob } from '../types';
import { mapDbJobToJob } from '../lib/supabaseService';

export const printJobService = {
  /**
   * Submit a new print job to a shop branch
   */
  async createPrintJob(shopUuid: string, job: Omit<PrintJob, 'id' | 'timestamp'> & { id?: string }): Promise<PrintJob> {
    const generatedJobId = job.id || `job-${Math.floor(1000 + Math.random() * 9000)}`;
    const frontendJob: PrintJob = {
      ...job,
      id: generatedJobId,
      timestamp: 'Just now'
    };

    if (!isSupabaseConfigured || !supabase) {
      console.log('[printJobService] Supabase not connected. Submitting job locally.');
      // The state in SaaSContext/PrintFlowContext manages local states, so we just return the object
      return frontendJob;
    }

    try {
      const dbPayload = {
        job_id: generatedJobId,
        token: job.token,
        file_name: job.fileName,
        file_size: job.fileSize,
        pages: job.pages,
        copies: job.copies,
        color_mode: job.colorMode,
        paper_size: job.paperSize,
        side_mode: job.sideMode,
        status: job.status || 'submitted',
        shop_id: shopUuid
      };

      const { data: insertedJob, error } = await supabase
        .from('print_jobs')
        .insert(dbPayload)
        .select('*')
        .single();

      if (error) throw error;
      return mapDbJobToJob(insertedJob);
    } catch (err) {
      console.error('[printJobService] Failed to insert remote print job, returning local mock:', err);
      return frontendJob;
    }
  },

  /**
   * Update the status of a specific job
   */
  async updatePrintJobStatus(jobId: string, status: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      console.log(`[printJobService] Supabase not connected. Job ${jobId} status updated locally to ${status}.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ status })
        .eq('job_id', jobId);

      if (error) throw error;
    } catch (err) {
      console.error('[printJobService] Failed to update remote status:', err);
    }
  },

  /**
   * Clear all jobs for a shop branch
   */
  async clearShopJobs(shopUuid: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[printJobService] Supabase not connected. Clearing jobs locally.');
      return;
    }

    try {
      const { error } = await supabase
        .from('print_jobs')
        .delete()
        .eq('shop_id', shopUuid);

      if (error) throw error;
    } catch (err) {
      console.error('[printJobService] Failed to clear remote jobs:', err);
    }
  },

  /**
   * Delete a single job by id
   */
  async deletePrintJob(jobId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      console.log(`[printJobService] Supabase not connected. Job ${jobId} deleted locally.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('print_jobs')
        .delete()
        .eq('job_id', jobId);

      if (error) throw error;
    } catch (err) {
      console.error('[printJobService] Failed to delete remote job:', err);
    }
  }
};
