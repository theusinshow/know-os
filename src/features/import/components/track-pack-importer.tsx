"use client";

import { Check, Clipboard, FileJson, Upload } from "lucide-react";
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

type DeepSeekReadiness = Readonly<{
  status: "configured" | "unconfigured";
  defaultModel: "deepseek-v4-flash" | "deepseek-v4-pro";
  proModel: "deepseek-v4-flash" | "deepseek-v4-pro";
}>;

type CompiledPrompt = Readonly<{
  targetSchema: "caderno.lesson.v1";
  prompt: string;
  jsonExample: string;
}>;

type GeneratedLessonPreview = Readonly<{
  status: "ready_to_preview";
  operation: "validate_only";
  schema: "caderno.lesson.v1";
  contentHash: string;
  summary: {
    lessonStableId: string;
    lessonTitle: string;
    conceptCount: number;
    blockCount: number;
    activityCount: number;
  };
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

function parseConceptLines(source: string) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id = "", title = "", summary] = line.split("|").map((part) => part.trim());

      return {
        id,
        title: title || id,
        ...(summary ? { summary } : {})
      };
    });
}

export function TrackPackImporter({ deepSeek }: Readonly<{ deepSeek: DeepSeekReadiness }>) {
  const inputId = useId();
  const fileId = useId();
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState("Nenhum Pack carregado.");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [mode, setMode] = useState<"manual" | "deepseek">("manual");

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
      <div className="generation-mode-selector" role="tablist" aria-label="Modo de geração">
        <button
          className={mode === "manual" ? "primary-action" : "secondary-action"}
          type="button"
          role="tab"
          aria-selected={mode === "manual"}
          onClick={() => setMode("manual")}
        >
          Manual / Copy Paste
        </button>
        <button
          className={mode === "deepseek" ? "primary-action" : "secondary-action"}
          type="button"
          role="tab"
          aria-selected={mode === "deepseek"}
          onClick={() => setMode("deepseek")}
        >
          AI / DeepSeek
        </button>
      </div>

      {mode === "manual" ? <ManualGenerationPanel /> : <DeepSeekGenerationPanel deepSeek={deepSeek} />}

      <div className="import-divider" role="separator">
        Importação direta de Track Pack
      </div>

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

function ManualGenerationPanel() {
  const titleId = useId();
  const goalId = useId();
  const conceptsId = useId();
  const promptId = useId();
  const generatedId = useId();
  const [lessonTitle, setLessonTitle] = useState("Funções em JavaScript");
  const [lessonGoal, setLessonGoal] = useState("Ensinar como declarar e chamar funções simples.");
  const [conceptLines, setConceptLines] = useState("js-function | Função | Bloco reutilizável de lógica.");
  const [jobId, setJobId] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState<CompiledPrompt | null>(null);
  const [generatedJson, setGeneratedJson] = useState("");
  const [preview, setPreview] = useState<GeneratedLessonPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState("Configure a lição e compile o prompt.");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const importTarget = useMemo(
    () => ({
      packId: "generated.javascript.manual",
      version: 1,
      trackId: "generated-javascript",
      trackTitle: "JavaScript gerado",
      moduleId: "generated-basics",
      moduleTitle: "Fundamentos gerados"
    }),
    []
  );
  const canImportGenerated = Boolean(preview && generatedJson.trim() && !isBusy);

  function buildSpec() {
    return {
      targetSchema: "caderno.lesson.v1",
      language: "pt-BR",
      audienceLevel: "beginner",
      lessonTitle,
      lessonGoal,
      concepts: parseConceptLines(conceptLines),
      activityTypes: ["prediction", "code"],
      constraints: [
        "Use blocos curtos.",
        "Inclua pelo menos uma atividade de previsao antes da atividade de codigo.",
        "Nao inclua Markdown fora do JSON."
      ],
      importTarget
    };
  }

  async function compilePrompt() {
    setIsBusy(true);
    setError(null);
    setPreview(null);
    setImportResult(null);
    setMessage("Compilando prompt...");

    try {
      const response = await fetch("/api/generation/manual/compile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildSpec())
      });

      if (!response.ok) {
        setError(await readApiError(response));
        setMessage("Compilação bloqueada.");
        return;
      }

      const payload = (await response.json()) as {
        jobId: string;
        status: string;
        compiledPrompt: CompiledPrompt;
      };
      setJobId(payload.jobId);
      setCompiledPrompt(payload.compiledPrompt);
      setMessage("Prompt compilado. Copie e cole a resposta JSON no campo abaixo.");
    } finally {
      setIsBusy(false);
    }
  }

  async function copyPrompt() {
    if (!compiledPrompt) {
      return;
    }

    await navigator.clipboard?.writeText(compiledPrompt.prompt);
    setMessage("Prompt copiado.");
  }

  async function validateGeneratedJson() {
    setIsBusy(true);
    setError(null);
    setPreview(null);
    setImportResult(null);
    setMessage("Validando JSON gerado...");

    try {
      const response = await fetch("/api/generation/lesson/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId, rawJson: generatedJson })
      });

      if (!response.ok) {
        setError(await readApiError(response));
        setMessage("Validação bloqueada.");
        return;
      }

      const payload = (await response.json()) as GeneratedLessonPreview;
      setPreview(payload);
      setMessage("JSON validado. Preview liberado para importação.");
    } finally {
      setIsBusy(false);
    }
  }

  async function importGeneratedLesson() {
    setIsBusy(true);
    setError(null);
    setMessage("Importando lição gerada...");

    try {
      const response = await fetch("/api/generation/lesson/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId, rawJson: generatedJson, importTarget })
      });

      if (!response.ok) {
        setError(await readApiError(response));
        setMessage(response.status === 409 ? "Conflito detectado. Nada foi aplicado." : "Importação bloqueada.");
        return;
      }

      const payload = (await response.json()) as ImportResult;
      setImportResult(payload);
      setMessage(payload.status === "already_imported" ? "Lição gerada já estava importada." : "Lição gerada importada.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="generation-panel" aria-labelledby="manual-generation-title">
      <div className="test-panel-header">
        <strong id="manual-generation-title">Manual / Copy Paste</strong>
        <span>{jobId ? "waiting_external_response" : "draft"}</span>
      </div>

      <div className="generation-form">
        <label>
          <span className="code-editor-label">Título</span>
          <input id={titleId} value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} />
        </label>
        <label>
          <span className="code-editor-label">Objetivo</span>
          <input id={goalId} value={lessonGoal} onChange={(event) => setLessonGoal(event.target.value)} />
        </label>
        <label className="generation-form-wide">
          <span className="code-editor-label">Conceitos</span>
          <textarea
            id={conceptsId}
            value={conceptLines}
            onChange={(event) => setConceptLines(event.target.value)}
            rows={3}
          />
        </label>
      </div>

      <div className="activity-actions">
        <button className="primary-action" type="button" onClick={() => void compilePrompt()} disabled={isBusy}>
          <FileJson aria-hidden="true" />
          Compilar prompt
        </button>
        <button className="secondary-action" type="button" onClick={() => void copyPrompt()} disabled={!compiledPrompt}>
          <Clipboard aria-hidden="true" />
          Copiar prompt
        </button>
      </div>

      {compiledPrompt ? (
        <>
          <label className="code-editor-label" htmlFor={promptId}>
            Prompt compilado
          </label>
          <textarea id={promptId} className="code-editor generation-prompt" readOnly value={compiledPrompt.prompt} />
        </>
      ) : null}

      <label className="code-editor-label" htmlFor={generatedId}>
        JSON gerado
      </label>
      <textarea
        id={generatedId}
        className="code-editor import-source"
        spellCheck={false}
        value={generatedJson}
        onChange={(event) => {
          setGeneratedJson(event.target.value);
          setPreview(null);
          setImportResult(null);
        }}
        placeholder={'{\n  "schema": "caderno.lesson.v1"\n}'}
      />

      <div className="activity-actions">
        <button className="secondary-action" type="button" onClick={() => void validateGeneratedJson()} disabled={isBusy}>
          <Check aria-hidden="true" />
          Validar
        </button>
        <button className="primary-action" type="button" onClick={() => void importGeneratedLesson()} disabled={!canImportGenerated}>
          Importar lição
        </button>
      </div>

      <p className="activity-status" role="status" aria-label="Estado da geração" aria-live="polite">
        {message}
      </p>

      {error ? (
        <div className="lesson-callout" data-variant="invalid" role="alert">
          <strong>Geração bloqueada.</strong>
          <span>{error}</span>
        </div>
      ) : null}
      {preview ? <GeneratedLessonPreviewPanel preview={preview} /> : null}
      {importResult ? <ImportResultPanel result={importResult} /> : null}
    </section>
  );
}

function DeepSeekGenerationPanel({ deepSeek }: Readonly<{ deepSeek: DeepSeekReadiness }>) {
  return (
    <section className="generation-panel" aria-labelledby="deepseek-generation-title">
      <div className="test-panel-header">
        <strong id="deepseek-generation-title">AI / DeepSeek</strong>
        <span>{deepSeek.status === "configured" ? "configured" : "api_not_configured"}</span>
      </div>
      <div className="lesson-callout" data-variant={deepSeek.status === "configured" ? "concept" : "warning"}>
        <strong>{deepSeek.status === "configured" ? "Provedor disponível." : "STATUS API NOT CONFIGURED"}</strong>
        <span>
          Modelo padrão: {deepSeek.defaultModel}. Modelo avançado: {deepSeek.proModel}. A geração direta fica
          desabilitada enquanto a chave server-side não estiver configurada.
        </span>
      </div>
      <button className="primary-action" type="button" disabled>
        Gerar com DeepSeek
      </button>
    </section>
  );
}

function GeneratedLessonPreviewPanel({ preview }: Readonly<{ preview: GeneratedLessonPreview }>) {
  return (
    <section className="import-preview" aria-labelledby="generated-preview-title">
      <div className="test-panel-header">
        <strong id="generated-preview-title">Preview da lição</strong>
        <span>{preview.operation}</span>
      </div>
      <dl className="import-summary" aria-label="Resumo da lição gerada">
        <div>
          <dt>Lição</dt>
          <dd>{preview.summary.lessonTitle}</dd>
        </div>
        <div>
          <dt>Stable ID</dt>
          <dd>{preview.summary.lessonStableId}</dd>
        </div>
        <div>
          <dt>Conteúdo</dt>
          <dd>
            {preview.summary.blockCount} blocos, {preview.summary.activityCount} atividades
          </dd>
        </div>
        <div>
          <dt>Conceitos</dt>
          <dd>{preview.summary.conceptCount}</dd>
        </div>
      </dl>
    </section>
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
