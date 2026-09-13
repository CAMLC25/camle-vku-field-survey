import Dexie, { type Table } from 'dexie';
import type { Survey, SyncQueueItem } from '../types/survey';

/**
 * Dexie IndexedDB database instance for VKU Field Survey.
 * Object stores:
 *  - surveys: Primary offline storage for all inspection surveys
 *  - syncQueue: Persistent queue items for sequential synchronization
 */
export class SurveyDatabase extends Dexie {
  surveys!: Table<Survey, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('vku-field-survey');
    this.version(1).stores({
      surveys: 'id, status, building, floor, room, category, condition, createdAt, updatedAt',
      syncQueue: '++id, surveyId, status, addedAt'
    });
  }
}

export const db = new SurveyDatabase();
