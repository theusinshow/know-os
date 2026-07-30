import { desc, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { ensureDatabaseReady, getDatabase } from "@/db/connection";
import { studyEvents } from "@/db/schema";
import type * as schema from "@/db/schema";

type HistoryDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

export type HistoryEvent = Readonly<{
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  payload: unknown;
  occurredAt: Date;
}>;

export class HistoryRepository {
  constructor(private readonly db: HistoryDatabase = getDatabase()) {}

  async listEvents(ownerId: string): Promise<HistoryEvent[]> {
    return this.db
      .select({
        id: studyEvents.id,
        type: studyEvents.type,
        entityType: studyEvents.entityType,
        entityId: studyEvents.entityId,
        payload: studyEvents.payload,
        occurredAt: studyEvents.occurredAt
      })
      .from(studyEvents)
      .where(eq(studyEvents.ownerId, ownerId))
      .orderBy(desc(studyEvents.occurredAt));
  }
}

export async function withHistoryRepository<T>(read: (repository: HistoryRepository) => Promise<T>) {
  await ensureDatabaseReady();
  return read(new HistoryRepository());
}
