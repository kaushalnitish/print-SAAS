import { DBPrintQueue } from '../types';

export const queueService = {
  /**
   * Fetch current queue metrics for a shop branch
   */
  async getQueueStatus(shopId: string): Promise<DBPrintQueue> {
    console.log(`[queueService] Fetching queue status for shop ${shopId}`);
    
    // Simulating API response delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Return mock statistics
    return {
      shopId,
      activeJobsCount: 2,
      waitingJobsCount: 4,
      estimatedWaitMinutes: 12,
      queuePosition: 3
    };
  },

  /**
   * Subscribe to real-time changes in a shop's queue.
   * Returns an unsubscribe cleanup function.
   */
  subscribeQueue(shopId: string, onUpdate: (queue: DBPrintQueue) => void): () => void {
    console.log(`[queueService] Subscribing to real-time queue updates for shop ${shopId}`);
    
    let position = 4;
    let waitMinutes = 8;
    
    // Set up simulated updates
    const interval = setInterval(() => {
      if (position > 0) {
        position -= 1;
        waitMinutes = Math.max(0, waitMinutes - 2);
      } else {
        position = 4;
        waitMinutes = 8;
      }
      
      onUpdate({
        shopId,
        activeJobsCount: position > 0 ? 1 : 0,
        waitingJobsCount: Math.max(0, position - 1),
        estimatedWaitMinutes: waitMinutes,
        queuePosition: position
      });
    }, 10000); // Trigger callback every 10 seconds

    // Return the unsubscribe handler
    return () => {
      console.log(`[queueService] Unsubscribed from queue updates for shop ${shopId}`);
      clearInterval(interval);
    };
  }
};
