import { db } from './database';
import type { SyncQueueItem } from '../types/survey';

/**
 * Enqueues a survey into the persistent syncQueue store.
 */
export async function enqueueSurvey(surveyId: string): Promise<void> {
  // Check if already in queue to prevent duplicate entries
  const existing = await db.syncQueue.where('surveyId').equals(surveyId).first();
  if (existing) {
    await db.syncQueue.update(existing.id!, {
      status: 'QUEUED',
      attempts: existing.attempts
    });
    return;
  }

  await db.syncQueue.add({
    surveyId,
    addedAt: new Date().toISOString(),
    attempts: 0,
    status: 'QUEUED',
    lastError: null
  });
}

/**
 * Retrieves the next item waiting to be synchronized in FIFO order.
 */
export async function getNextQueueItem(): Promise<SyncQueueItem | undefined> {
  return await db.syncQueue
    .where('status')
    .equals('QUEUED')
    .first();
}

/**
 * Returns all active queue items.
 */
export async function getAllQueueItems(): Promise<SyncQueueItem[]> {
  return await db.syncQueue.toArray();
}

/**
 * Removes a queue item once successfully synchronized.
 */
export async function dequeueSurvey(surveyId: string): Promise<void> {
  await db.syncQueue.where('surveyId').equals(surveyId).delete();
}

/**
 * Updates queue item status upon failure, incrementing attempt counter.
 */
export async function recordQueueFailure(
  id: number,
  error: string
): Promise<void> {
  const item = await db.syncQueue.get(id);
  if (!item) return;

  await db.syncQueue.update(id, {
    status: 'FAILED',
    attempts: (item.attempts || 0) + 1,
    lastError: error
  });
}
