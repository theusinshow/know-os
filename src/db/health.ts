import { sql } from "drizzle-orm";

import { ensureDatabaseReady, getDatabase, getDatabaseUrl } from "@/db/connection";

export type DatabaseHealth =
  | { status: "not_configured"; checkedAt: string }
  | { status: "ok"; checkedAt: string }
  | { status: "unavailable"; checkedAt: string };

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const checkedAt = new Date().toISOString();

  if (!getDatabaseUrl()) {
    return { status: "not_configured", checkedAt };
  }

  if (getDatabaseUrl() === "memory://local") {
    return { status: "ok", checkedAt };
  }

  try {
    await ensureDatabaseReady();
    await getDatabase().execute(sql`select 1`);
    return { status: "ok", checkedAt };
  } catch {
    return { status: "unavailable", checkedAt };
  }
}
