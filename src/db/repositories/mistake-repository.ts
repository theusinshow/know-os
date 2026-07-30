import { desc, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { getDatabase } from "@/db/connection";
import { concepts, mistakes } from "@/db/schema";
import type * as schema from "@/db/schema";

type MistakeDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

export type MistakeRecord = Readonly<{
  id: string;
  conceptStableId: string;
  conceptTitle: string;
  attemptId: string;
  category: string;
  summary: string;
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
}>;

export class MistakeRepository {
  constructor(private readonly db: MistakeDatabase = getDatabase()) {}

  async listMistakes(ownerId: string): Promise<MistakeRecord[]> {
    const rows = await this.db
      .select({
        id: mistakes.id,
        conceptStableId: concepts.stableId,
        conceptTitle: concepts.title,
        attemptId: mistakes.attemptId,
        category: mistakes.category,
        summary: mistakes.summary,
        status: mistakes.status,
        createdAt: mistakes.createdAt,
        resolvedAt: mistakes.resolvedAt
      })
      .from(mistakes)
      .innerJoin(concepts, eq(concepts.id, mistakes.conceptId))
      .where(eq(mistakes.ownerId, ownerId))
      .orderBy(desc(mistakes.createdAt));

    return rows;
  }
}
