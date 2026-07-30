import { z } from "zod";

export const MAX_RESTORE_BYTES = 1024 * 1024;

const exportPayloadSchema = z.object({
  schema: z.literal("know-os.export.v1"),
  kind: z.enum(["backup", "progress", "teacher_context"]),
  exportedAt: z.string(),
  privacy: z.object({
    warnings: z.array(z.string()),
    includesPrivateSourceCode: z.boolean(),
    includesProjectContext: z.boolean()
  }),
  payload: z.unknown()
});

const backupPayloadSchema = z.object({
  packManifests: z.array(z.unknown()),
  tracks: z.array(z.unknown()),
  knowledgeMap: z.array(z.unknown()),
  masteryEvidence: z.array(z.unknown()),
  recentAttempts: z.array(z.unknown()),
  dueReviews: z.array(z.unknown()),
  mistakes: z.array(z.unknown()),
  projects: z.array(z.unknown()),
  xpSummary: z.object({
    totalXp: z.number(),
    transactions: z.array(z.unknown())
  }),
  events: z.array(z.unknown())
});

export type RestoreBackupPayload = z.infer<typeof backupPayloadSchema>;

export type RestorePreviewResult =
  | Readonly<{
      status: "ready";
      schema: "know-os.restore-preview.v1";
      sourceExportedAt: string;
      categories: readonly RestoreCategory[];
      warnings: readonly string[];
      applicationMode: "non_destructive_plan";
    }>
  | Readonly<{
      status: "invalid";
      code: "invalid_restore_payload" | "unsupported_restore_kind";
      message: string;
      issues?: readonly string[];
    }>;

export type RestoreCategory = Readonly<{
  id: string;
  label: string;
  count: number;
  private: boolean;
}>;

export function previewRestore(input: unknown): RestorePreviewResult {
  const parsed = exportPayloadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "invalid",
      code: "invalid_restore_payload",
      message: "O arquivo não segue o contrato know-os.export.v1.",
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    };
  }

  if (parsed.data.kind !== "backup") {
    return {
      status: "invalid",
      code: "unsupported_restore_kind",
      message: "Somente exports Backup podem ser usados para restore."
    };
  }

  const backup = backupPayloadSchema.safeParse(parsed.data.payload);

  if (!backup.success) {
    return {
      status: "invalid",
      code: "invalid_restore_payload",
      message: "O Backup não contém as categorias esperadas.",
      issues: backup.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    };
  }

  const categories: RestoreCategory[] = [
    { id: "pack_manifests", label: "Manifestos de Pack", count: backup.data.packManifests.length, private: false },
    { id: "content_references", label: "Referências de conteúdo", count: backup.data.tracks.length, private: false },
    { id: "knowledge_map", label: "Mapa de conhecimento", count: backup.data.knowledgeMap.length, private: false },
    {
      id: "mastery_evidence",
      label: "Evidência de mastery",
      count: backup.data.masteryEvidence.length,
      private: true
    },
    { id: "attempts", label: "Tentativas", count: backup.data.recentAttempts.length, private: true },
    { id: "review_queue", label: "Fila de review", count: backup.data.dueReviews.length, private: true },
    { id: "mistakes", label: "Erros", count: backup.data.mistakes.length, private: true },
    { id: "projects", label: "Projetos", count: backup.data.projects.length, private: true },
    { id: "xp", label: "XP", count: backup.data.xpSummary.transactions.length, private: false },
    { id: "history", label: "Histórico", count: backup.data.events.length, private: true }
  ];

  return {
    status: "ready",
    schema: "know-os.restore-preview.v1",
    sourceExportedAt: parsed.data.exportedAt,
    categories,
    warnings: [
      "Restore deve ser revisado antes de aplicar porque pode incluir código-fonte, projetos e histórico privado.",
      "O plano V1 é não destrutivo: não apaga dados locais existentes."
    ],
    applicationMode: "non_destructive_plan"
  };
}

export function parseRestoreBackupPayload(input: unknown):
  | Readonly<{ ok: true; exportedAt: string; payload: RestoreBackupPayload }>
  | Readonly<{ ok: false; preview: RestorePreviewResult }> {
  const parsed = exportPayloadSchema.safeParse(input);

  if (!parsed.success || parsed.data.kind !== "backup") {
    return { ok: false, preview: previewRestore(input) };
  }

  const backup = backupPayloadSchema.safeParse(parsed.data.payload);

  if (!backup.success) {
    return { ok: false, preview: previewRestore(input) };
  }

  return { ok: true, exportedAt: parsed.data.exportedAt, payload: backup.data };
}
