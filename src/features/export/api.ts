import { ensureDatabaseReady, getDatabaseUrl } from "@/db/connection";
import { ExportRepository } from "@/db/repositories/export-repository";
import { MemoryExportRepository } from "@/db/repositories/memory-store";
import { getServerEnv } from "@/lib/env";

import {
  buildExportPayload,
  buildExportPreview,
  parseExportKind,
  type ExportKind,
  type ExportPayload,
  type ExportPreview
} from "./export-contracts";

export async function getExportPreviews(): Promise<ExportPreview[]> {
  const snapshot = await getExportSnapshot();

  return [
    buildExportPreview("backup", snapshot),
    buildExportPreview("progress", snapshot),
    buildExportPreview("teacher_context", snapshot)
  ];
}

export async function getExportPreview(kindInput: string | null): Promise<ExportPreview> {
  const kind = parseExportKind(kindInput);
  const snapshot = await getExportSnapshot();

  return buildExportPreview(kind, snapshot);
}

export async function getExportPayload({
  kind: kindInput,
  selectedLessonStableId = null
}: Readonly<{
  kind: string | null;
  selectedLessonStableId?: string | null;
}>): Promise<ExportPayload> {
  const kind: ExportKind = parseExportKind(kindInput);
  const snapshot = await getExportSnapshot();

  return buildExportPayload({ kind, snapshot, selectedLessonStableId });
}

async function getExportSnapshot() {
  const ownerId = getServerEnv().KNOW_OS_OWNER_ID;

  if (getDatabaseUrl() === "memory://local") {
    return new MemoryExportRepository().getSnapshot(ownerId);
  }

  await ensureDatabaseReady();
  return new ExportRepository().getSnapshot(ownerId);
}
