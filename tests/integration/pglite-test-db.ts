import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "@/db/schema";

export async function createMigratedPgliteTestDatabase() {
  const client = new PGlite();
  const migrationsDirectory = path.join(process.cwd(), "src", "db", "migrations");
  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  for (const migrationFile of migrationFiles) {
    const migrationSql = await readFile(path.join(migrationsDirectory, migrationFile), "utf8");

    for (const statement of migrationSql.split("--> statement-breakpoint")) {
      const trimmed = statement.trim();

      if (trimmed.length > 0) {
        await client.query(trimmed);
      }
    }
  }

  const db = drizzle(client, { schema });

  return {
    db,
    async close() {
      await client.close();
    }
  };
}
