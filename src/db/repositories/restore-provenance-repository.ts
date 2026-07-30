import { and, asc, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { getDatabase } from "@/db/connection";
import { restoreProvenance } from "@/db/schema";
import type * as schema from "@/db/schema";

type RestoreProvenanceDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

export type RestoreProvenanceRecord = Readonly<{
  sourceExportFingerprint: string;
  sourceRecordKind: string;
  sourceRecordId: string;
  sourceContentKey: string;
  localRecordKind: string;
  localRecordId: string;
  payloadHash: string;
  appliedAt: Date;
}>;

export class RestoreProvenanceRepository {
  constructor(private readonly db: RestoreProvenanceDatabase = getDatabase()) {}

  async listForSource(ownerId: string, sourceExportFingerprint: string): Promise<RestoreProvenanceRecord[]> {
    const rows = await this.db
      .select({
        sourceExportFingerprint: restoreProvenance.sourceExportFingerprint,
        sourceRecordKind: restoreProvenance.sourceRecordKind,
        sourceRecordId: restoreProvenance.sourceRecordId,
        sourceContentKey: restoreProvenance.sourceContentKey,
        localRecordKind: restoreProvenance.localRecordKind,
        localRecordId: restoreProvenance.localRecordId,
        payloadHash: restoreProvenance.payloadHash,
        appliedAt: restoreProvenance.appliedAt
      })
      .from(restoreProvenance)
      .where(
        and(
          eq(restoreProvenance.ownerId, ownerId),
          eq(restoreProvenance.sourceExportFingerprint, sourceExportFingerprint)
        )
      )
      .orderBy(asc(restoreProvenance.appliedAt));

    return rows;
  }
}
