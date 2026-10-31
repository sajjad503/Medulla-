// offlineSync.ts - Offline Queue & Auto-Sync Engine for Mentora
import api from './api';

export interface OfflineWorkReport {
  id: string; // client-side uuid
  type: 'work_report';
  student_id?: number;
  report_date: string;
  total_study_time: number;
  total_test_count: number;
  report_items: Record<string, { time: number; tests: number }>;
  student_note: string;
  created_at: string;
  status: 'pending_sync' | 'synced' | 'failed';
}

export interface OfflineTaskCheck {
  id: string;
  type: 'task_toggle';
  day: string;
  taskIndex: number;
  isDone: boolean;
  updated_at: string;
}

export type OfflineQueueItem = OfflineWorkReport | OfflineTaskCheck;

const STORAGE_KEY = 'mentora_offline_outbox';
const SYNC_EVENT_NAME = 'mentora_offline_sync_change';

// Read queue from local storage
export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline queue:', e);
    return [];
  }
}

// Save queue to local storage
function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { count: queue.length } }));
  } catch (e) {
    console.error('Error saving offline queue:', e);
  }
}

// Enqueue an offline work report
export function enqueueOfflineReport(data: {
  report_date: string;
  total_study_time: number;
  total_test_count: number;
  report_items: Record<string, { time: number; tests: number }>;
  student_note: string;
}): OfflineWorkReport {
  const item: OfflineWorkReport = {
    id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    type: 'work_report',
    report_date: data.report_date,
    total_study_time: data.total_study_time,
    total_test_count: data.total_test_count,
    report_items: data.report_items,
    student_note: data.student_note,
    created_at: new Date().toISOString(),
    status: 'pending_sync'
  };

  const queue = getOfflineQueue();
  // If a report for the same date exists in queue, update it
  const existingIdx = queue.findIndex(q => q.type === 'work_report' && (q as OfflineWorkReport).report_date === data.report_date);
  if (existingIdx >= 0) {
    queue[existingIdx] = item;
  } else {
    queue.push(item);
  }
  saveOfflineQueue(queue);
  return item;
}

// Get number of pending offline items
export function getPendingOfflineCount(): number {
  return getOfflineQueue().length;
}

// Perform sync of queued items to server
export async function syncOfflineQueueToServer(): Promise<{
  synced: number;
  failed: number;
  total: number;
  success: boolean;
}> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, total: 0, success: true };
  }

  // Check if actually online
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { synced: 0, failed: queue.length, total: queue.length, success: false };
  }

  try {
    const res = await api.post('/sync/offline-queue', { queue });
    if (res.data && res.data.success) {
      // Clear queue on successful server processing
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { count: 0 } }));
      return {
        synced: res.data.synced_count ?? queue.length,
        failed: 0,
        total: queue.length,
        success: true
      };
    }
  } catch (err) {
    console.warn('Batch offline sync failed, attempting item-by-item fallback:', err);
  }

  // Fallback item-by-item sync if batch endpoint failed
  let synced = 0;
  const remaining: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'work_report') {
        await api.post('/records/daily-report', {
          report_date: item.report_date,
          total_study_time: item.total_study_time,
          total_test_count: item.total_test_count,
          report_items: item.report_items,
          student_note: item.student_note
        });
        synced++;
      } else {
        synced++;
      }
    } catch (e) {
      console.warn('Postponing sync item (will retry when connection is stable):', item, e);
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);
  return {
    synced,
    failed: remaining.length,
    total: queue.length,
    success: remaining.length === 0
  };
}

// Hook or listener initializer for auto-sync on reconnect
export function initAutoOfflineSync(onSyncCompleted?: (info: { synced: number; remaining: number }) => void) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = async () => {
    console.log('[Mentora Offline Engine] Online connection restored. Syncing queue...');
    const result = await syncOfflineQueueToServer();
    if (result.synced > 0 && onSyncCompleted) {
      onSyncCompleted({ synced: result.synced, remaining: result.failed });
    }
  };

  window.addEventListener('online', handleOnline);

  // Periodic check if online and queue is not empty
  const interval = setInterval(() => {
    if (navigator.onLine && getPendingOfflineCount() > 0) {
      handleOnline();
    }
  }, 30000);

  return () => {
    window.removeEventListener('online', handleOnline);
    clearInterval(interval);
  };
}
