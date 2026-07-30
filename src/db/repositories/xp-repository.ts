import { desc, eq, sum } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { getDatabase } from "@/db/connection";
import { xpTransactions } from "@/db/schema";
import type * as schema from "@/db/schema";

type XpDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

export type XpTransactionRecord = Readonly<{
  id: string;
  amount: number;
  reason: string;
  sourceType: string;
  sourceId: string;
  createdAt: Date;
}>;

export type XpSummary = Readonly<{
  totalXp: number;
  transactions: XpTransactionRecord[];
}>;

export class XpRepository {
  constructor(private readonly db: XpDatabase = getDatabase()) {}

  async getSummary(ownerId: string): Promise<XpSummary> {
    const [totalRow] = await this.db
      .select({ total: sum(xpTransactions.amount) })
      .from(xpTransactions)
      .where(eq(xpTransactions.ownerId, ownerId));
    const transactions = await this.db
      .select({
        id: xpTransactions.id,
        amount: xpTransactions.amount,
        reason: xpTransactions.reason,
        sourceType: xpTransactions.sourceType,
        sourceId: xpTransactions.sourceId,
        createdAt: xpTransactions.createdAt
      })
      .from(xpTransactions)
      .where(eq(xpTransactions.ownerId, ownerId))
      .orderBy(desc(xpTransactions.createdAt));

    return {
      totalXp: Number(totalRow?.total ?? 0),
      transactions
    };
  }
}
