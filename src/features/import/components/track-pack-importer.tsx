"use client";

import { Upload } from "lucide-react";
import { useId, useMemo, useState } from "react";

type PreviewSummary = Readonly<{
  trackStableId: string;
  trackTitle: string;
  moduleCount: number;
  lessonCount: number;
  activityCount: number;
  conceptCount: number;
}>;

type PreviewResult =
  | Readonly<{
      status: "ready";
      operation: "import";
      packId: string;
      version: number;
      contentHash: string;
      summary: PreviewSummary;
    }>
  | Readonly<{
      status: "already_imported";
      operation: "no_change";
      packId: string;
      version: number;
      contentHash: string;
      summary: PreviewSummary;
    }>
  | Readonly<{
      status: "conflict";
      operation: "blocked_conflict";
      packId: string;
      version: number;
      message: string;
      existingContentHash: string;
      incomingContentHash: string;
      summary: PreviewSummary;
    }>;

type ImportResult =
  | Readonly<{
      status: "imported";
      packId: string;
      version: number;
      summary: {
        trackStableId: string;
        importedLessons: number;
        importedActivities: number;
      };
    }>
  | Readonly<{ status: "already_imported"; packId: string; version: number }>;

type ApiError = Readonly<{
  code?: string;
  message?: string;
  issues?: readonly { path: string; message: string }[];
}>;

function parseJsonSource(source: string) {
  if (!source.trim()) {
    return { ok: false as const, message: "Cole um JSON de Track Pack ou carregue o exemplo." };
  }

  try {
    return { ok: true as const, value: JSON.parse(source) as unknown };
  } catch {
    return { ok: false as const, message: "O conteúdo informado não é um JSON válido." };
  }
}

async function readApiError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as ApiError | null;

  if (!payload) {
    return "A resposta da importação não pôde ser lida.";
  }

  if (payload.issues?.length) {
    return payload.issues.map((issue) => `${issue.path}: ${issue.message}`).join(" ");
  }

  return payload.message ?? payload.code ?? "A importação não foi concluída.";
}

export function TrackPackImporter() {
  const inputId = useId();
  const fileId = useId();
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState("Nenhum Pack carregado.");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const canApply = useMemo(() => preview?.status === "ready" && !isBusy, [isBusy, preview]);

  function resetResult(nextSource: string) {
    setSource(nextSource);
    setPreview(null);
    setImportResult(null);
    setError(null);
    setMessage(nextSource.trim() ? "Pack carregado. Execute o preview antes de aplicar." : "Nenhum Pack carregado.");
  }

  async function previewSource(nextSource = source) {
    setIsBusy(true);
    const parsed = parseJsonSource(nextSource);

    if (!parsed.ok) {
      setPreview(null);
      setImportResult(null);
      setError(parsed.message);
      setMessage("Preview bloqueado.");
      setIsBusy(false);
      return;
    }

    try {
      setError(null);
      setImportResult(null);
      setMessage("Validando Pack...");

      const response = await fetch("/api/import/track/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.value)
      });

      if (!response.ok) {
        setPreview(null);
        setError(await readApiError(response));
        setMessage(response.status === 409 ? "Conflito detectado. Aplicar permanece bloqueado." : "Preview falhou.");
        return;
      }

      const payload = (await response.json()) as PreviewResult;
      setPreview(payload);
      setMessage(
        payload.status === "already_imported"
          ? "Pack já importado. Nenhuma mutação necessária."
          : "Preview válido. Aplicar liberado."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function applySource() {
    setIsBusy(true);
    const parsed = parseJsonSource(source);

    if (!parsed.ok) {
      setError(parsed.message);
      setMessage("Aplicação bloqueada.");
      setIsBusy(false);
      return;
    }

    try {
      setError(null);
      setMessage("Aplicando Pack...");

      const response = await fetch("/api/import/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.value)
      });

      if (!response.ok) {
        setImportResult(null);
        setError(await readApiError(response));
        setMessage(response.status === 409 ? "Conflito detectado. Nada foi aplicado." : "Aplicação falhou.");
        return;
      }

      const payload = (await response.json()) as ImportResult;
      setImportResult(payload);
      setMessage(payload.status === "already_imported" ? "Pack já estava importado." : "Pack aplicado ao catálogo.");
    } finally {
      setIsBusy(false);
    }
  }

  function handlePreview() {
    void previewSource();
  }

  function handleApply() {
    void applySource();
  }

  function handleExampleLoad() {
    void (async () => {
      setIsBusy(true);
      setError(null);
      setMessage("Carregando Pack exemplo...");

      try {
        const response = await fetch("/api/import/track/example");
        if (!response.ok) {
          setError("Não foi possível carregar o Pack exemplo.");
          setMessage("Carregamento falhou.");
          return;
        }

        const payload = await response.json();
        const nextSource = JSON.stringify(payload, null, 2);
        setFileName("javascript-fundamentals.track.json");
        resetResult(nextSource);
        await previewSource(nextSource);
      } finally {
        setIsBusy(false);
      }
    })();
  }

  function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    void (async () => {
      setIsBusy(true);
      const text = await file.text();
      setFileName(file.name);
      resetResult(text);
      setIsBusy(false);
    })();
  }

  return (
    <div className="import-workspace">
      <div className="import-actions" aria-label="Entrada do Pack">
        <button className="primary-action" type="button" onClick={handleExampleLoad} disabled={isBusy}>
          <Upload aria-hidden="true" />
          Carregar exemplo
        </button>
        <label className="secondary-action import-file-action" htmlFor={fileId}>
          Selecionar JSON
        </label>
        <input
          className="visually-hidden-file"
          id={fileId}
          type="file"
          accept="application/json,.json"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
      </div>

      <label className="code-editor-label" htmlFor={inputId}>
        JSON do Track Pack
      </label>
      <textarea
        id={inputId}
        className="code-editor import-source"
        spellCheck={false}
        value={source}
        onChange={(event) => {
          setFileName(null);
          resetResult(event.target.value);
        }}
        placeholder={'{\n  "schema": "caderno.track.v1"\n}'}
      />

      <div className="activity-actions">
        <button className="secondary-action" type="button" onClick={handlePreview} disabled={isBusy}>
          Preview
        </button>
        <button className="primary-action" type="button" onClick={handleApply} disabled={!canApply}>
          Aplicar
        </button>
      </div>

      <p className="activity-status" role="status" aria-label="Estado da importação" aria-live="polite">
        {fileName ? `${fileName}: ` : ""}
        {message}
      </p>

      {error ? (
        <div className="lesson-callout" data-variant="invalid" role="alert">
          <strong>Importação bloqueada.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {preview ? <ImportPreview preview={preview} /> : null}
      {importResult ? <ImportResultPanel result={importResult} /> : null}
    </div>
  );
}

function ImportPreview({ preview }: Readonly<{ preview: PreviewResult }>) {
  const blocked = preview.status === "conflict";

  return (
    <section className="import-preview" aria-labelledby="import-preview-title">
      <div className="test-panel-header">
        <strong id="import-preview-title">Preview</strong>
        <span>{preview.operation}</span>
      </div>
      <dl className="import-summary" aria-label="Resumo do Pack">
        <div>
          <dt>Pack</dt>
          <dd>
            {preview.packId} v{preview.version}
          </dd>
        </div>
        <div>
          <dt>Track</dt>
          <dd>{preview.summary.trackTitle}</dd>
        </div>
        <div>
          <dt>Conteúdo</dt>
          <dd>
            {preview.summary.moduleCount} módulo, {preview.summary.lessonCount} lição, {preview.summary.activityCount} atividades
          </dd>
        </div>
        <div>
          <dt>Conceitos</dt>
          <dd>{preview.summary.conceptCount}</dd>
        </div>
      </dl>
      {blocked ? (
        <div className="lesson-callout" data-variant="warning" role="alert">
          <strong>Conflito de mesma versão.</strong>
          <span>{preview.message}</span>
        </div>
      ) : null}
    </section>
  );
}

function ImportResultPanel({ result }: Readonly<{ result: ImportResult }>) {
  return (
    <section className="lesson-callout" role="status" aria-labelledby="import-result-title">
      <strong id="import-result-title">{result.status === "already_imported" ? "Sem alteração." : "Catálogo ativado."}</strong>
      <span>
        {result.status === "already_imported"
          ? `${result.packId} v${result.version} já estava importado.`
          : `${result.summary.trackStableId}: ${result.summary.importedLessons} lição e ${result.summary.importedActivities} atividades importadas.`}
      </span>
    </section>
  );
}
