import { db } from './database';
import type { Survey, SurveyCategory, SurveyStatus } from '../types/survey';
import { generateUUID } from '../utils/uuid';
import { enqueueSurvey, dequeueSurvey } from './syncQueue';

export interface CreateSurveyInput {
  building: string;
  floor: string;
  room: string;
  category: SurveyCategory;
  condition: number;
  defectNotes: string;
  photo: Blob | null;
  inspectorName?: string;
  inspectorId?: string;
  createdByEmail?: string;
}

/**
 * Creates a new field inspection survey, persists it to IndexedDB,
 * marks it PENDING_SYNC, and adds it to the persistent sync queue.
 */
export async function createSurvey(input: CreateSurveyInput): Promise<Survey> {
  const now = new Date().toISOString();
  const id = generateUUID();

  const survey: Survey = {
    id,
    building: input.building.trim(),
    floor: input.floor.trim(),
    room: input.room.trim(),
    category: input.category,
    condition: input.condition,
    defectNotes: input.defectNotes?.trim() || '',
    photo: input.photo,
    inspectorName: input.inspectorName || 'Cán bộ chưa định danh',
    inspectorId: input.inspectorId || '',
    createdByEmail: input.createdByEmail || '',
    createdAt: now,
    updatedAt: now,
    status: 'PENDING_SYNC',
    syncAttempts: 0,
    lastSyncError: null
  };

  await db.transaction('rw', db.surveys, db.syncQueue, async () => {
    await db.surveys.add(survey);
    await enqueueSurvey(id);
  });

  return survey;
}

/**
 * Retrieves all surveys sorted by creation timestamp descending.
 */
export async function getAllSurveys(): Promise<Survey[]> {
  const surveys = await db.surveys.toArray();
  return surveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Upserts surveys fetched from Cloudflare KV into local IndexedDB.
 * Does NOT overwrite locally modified surveys that are pending sync.
 */
export async function upsertServerSurveys(serverList: any[]): Promise<number> {
  if (!Array.isArray(serverList) || serverList.length === 0) return 0;
  let importedCount = 0;

  await db.transaction('rw', db.surveys, async () => {
    for (const item of serverList) {
      if (!item.id) continue;
      const existing = await db.surveys.get(item.id);
      // Skip if locally modified and pending sync
      if (existing && (existing.status === 'PENDING_SYNC' || existing.status === 'SYNCING')) {
        continue;
      }

      const survey: Survey = {
        id: item.id,
        building: item.building || 'Khu V',
        floor: item.floor || 'Tầng 1',
        room: item.room || 'V.101',
        category: item.category || 'Hardware',
        condition: typeof item.condition === 'number' ? item.condition : 3,
        defectNotes: item.defectNotes || '',
        photo: null,
        photoUrl: item.photoUrl || undefined,
        inspectorName: item.inspectorName || 'Cán bộ kiểm định',
        inspectorId: item.inspectorId || '',
        createdByEmail: item.createdByEmail || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.serverSyncedAt || item.createdAt || new Date().toISOString(),
        status: 'SYNCED',
        syncAttempts: 0,
        lastSyncError: null
      };

      await db.surveys.put(survey);
      importedCount++;
    }
  });

  return importedCount;
}

/**
 * Retrieves a single survey by its UUID.
 */
export async function getSurveyById(id: string): Promise<Survey | undefined> {
  return await db.surveys.get(id);
}

/**
 * Retrieves all surveys that are either PENDING_SYNC or FAILED.
 */
export async function getPendingSurveys(): Promise<Survey[]> {
  const pending = await db.surveys
    .where('status')
    .anyOf('PENDING_SYNC', 'FAILED')
    .toArray();
  return pending.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Updates the synchronization state of a survey.
 */
export async function updateSurveyStatus(
  id: string,
  status: SurveyStatus,
  error: string | null = null
): Promise<void> {
  const survey = await db.surveys.get(id);
  if (!survey) return;

  const updates: Partial<Survey> = {
    status,
    updatedAt: new Date().toISOString(),
    lastSyncError: error
  };

  if (status === 'SYNCING') {
    updates.syncAttempts = (survey.syncAttempts || 0) + 1;
  }

  await db.surveys.update(id, updates);

  if (status === 'SYNCED') {
    await dequeueSurvey(id);
  }
}

/**
 * Queues a survey for retry after a previous failure.
 */
export async function retrySurvey(id: string): Promise<void> {
  await db.transaction('rw', db.surveys, db.syncQueue, async () => {
    await db.surveys.update(id, {
      status: 'PENDING_SYNC',
      lastSyncError: null,
      updatedAt: new Date().toISOString()
    });
    await enqueueSurvey(id);
  });
}

/**
 * Deletes a survey from IndexedDB.
 */
export async function deleteSurvey(id: string): Promise<void> {
  await db.transaction('rw', db.surveys, db.syncQueue, async () => {
    await db.surveys.delete(id);
    await dequeueSurvey(id);
  });
}

/**
 * Returns counts of surveys grouped by status.
 */
export async function getSurveyCounts(): Promise<{
  total: number;
  pending: number;
  synced: number;
  failed: number;
}> {
  const surveys = await db.surveys.toArray();
  return {
    total: surveys.length,
    pending: surveys.filter((s) => s.status === 'PENDING_SYNC' || s.status === 'SYNCING').length,
    synced: surveys.filter((s) => s.status === 'SYNCED').length,
    failed: surveys.filter((s) => s.status === 'FAILED').length
  };
}
