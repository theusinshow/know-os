"use client";

import { CheckCircle2, Play, Terminal } from "lucide-react";
import { useState, useTransition } from "react";

import { diffSourceLines } from "@/features/attempts/source-diff";
import type { ActivityAttemptFeedback } from "@/features/activities/registry";

type ExecutionPayload = Readonly<{
  status: string;
  stdout: string[];
  stderr: string[];
  runtimeVersion?: string;
  limits?: Readonly<{
    timeoutMs: number;
    outputLimit: number;
  }>;
  capabilities?: Readonly<{
    dom: boolean;
    network: boolean;
    ambientSecrets: boolean;
  }>;
}>;

type TestPayload = Readonly<{
  name: string;
  status: string;
  message: string;
}>;

type CodeActivityPanelProps = Readonly<{
  activityStableId: string;
  activityLabel: string;
  prompt: string;
  starterCode: string;
  initialFeedback: ActivityAttemptFeedback | null;
}>;

export function CodeActivityPanel({
  activityStableId,
  activityLabel,
  prompt,
  starterCode,
  initialFeedback
}: CodeActivityPanelProps) {
  const [source, setSource] = useState(starterCode);
  const [execution, setExecution] = useState<ExecutionPayload | null>(initialFeedback?.execution ?? null);
  const [tests, setTests] = useState<TestPayload[]>(initialFeedback?.tests ?? []);
  const [latestFeedback, setLatestFeedback] = useState<ActivityAttemptFeedback | null>(initialFeedback);
  const [status, setStatus] = useState("Pronto");
  const [isPending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      setStatus("Executando RUN");
      setTests([]);
      const result = await postCode(`/api/activities/${activityStableId}/run`, source);

      if (result.status === "executed") {
        setExecution(result.execution);
        setLatestFeedback(initialFeedback);
        setStatus("RUN concluído sem registrar tentativa");
        return;
      }

      setStatus("Não foi possível executar RUN");
    });
  }

  function submit() {
    startTransition(async () => {
      setStatus("Enviando solução");
      const result = await postCode(`/api/activities/${activityStableId}/submit`, source);

      if (result.status === "submitted") {
        setExecution(result.evaluation.execution);
        setTests(result.evaluation.tests);
        setLatestFeedback({
          attemptNumber: result.submission.attemptNumber,
          outcome: result.submission.outcome,
          execution: result.evaluation.execution,
          tests: result.evaluation.tests,
          sourceDiff: diffSourceLines(starterCode, source),
          submittedAt: new Date().toISOString()
        });
        setStatus(`SUBMIT registrou tentativa ${result.submission.attemptNumber}`);
        return;
      }

      setStatus("Não foi possível registrar SUBMIT");
    });
  }

  return (
    <section className="activity-panel" id={`activity-${activityStableId}`} aria-labelledby={`${activityStableId}-title`}>
      <div>
        <p className="eyebrow">{activityLabel}</p>
        <h3 id={`${activityStableId}-title`}>{prompt}</h3>
      </div>

      <label className="code-editor-label" htmlFor={`${activityStableId}-source`}>
        Código
      </label>
      <textarea
        className="code-editor"
        id={`${activityStableId}-source`}
        spellCheck={false}
        value={source}
        onChange={(event) => setSource(event.target.value)}
      />

      <div className="activity-actions">
        <button type="button" className="secondary-action" onClick={run} disabled={isPending}>
          <Play aria-hidden="true" />
          <span>RUN</span>
        </button>
        <button type="button" className="primary-action" onClick={submit} disabled={isPending}>
          <CheckCircle2 aria-hidden="true" />
          <span>SUBMIT SOLUTION</span>
        </button>
      </div>

      <div className="activity-status" role="status" aria-live="polite">
        {status}
      </div>

      {latestFeedback ? (
        <aside className="attempt-feedback" aria-label="Última tentativa">
          <p className="eyebrow">Última tentativa</p>
          <strong>
            Tentativa {latestFeedback.attemptNumber}: {latestFeedback.outcome}
          </strong>
          <span>{formatSubmittedAt(latestFeedback.submittedAt)}</span>
        </aside>
      ) : null}

      <div className="terminal-panel" aria-label="Saída da execução">
        <div className="terminal-title">
          <Terminal aria-hidden="true" />
          <span>Terminal</span>
        </div>
        <ExecutionOutput execution={execution} />
      </div>

      {tests.length > 0 ? (
        <TestResults tests={tests} />
      ) : null}

      {latestFeedback?.sourceDiff.length ? <AttemptDiff lines={latestFeedback.sourceDiff} /> : null}
    </section>
  );
}

function ExecutionOutput({ execution }: Readonly<{ execution: ExecutionPayload | null }>) {
  if (!execution) {
    return <p>Nenhuma execução nesta sessão.</p>;
  }

  return (
    <div className="execution-output">
      <dl className="execution-meta" aria-label="Contrato da execução">
        <div>
          <dt>Status</dt>
          <dd>{execution.status}</dd>
        </div>
        {execution.runtimeVersion ? (
          <div>
            <dt>Runtime</dt>
            <dd>{execution.runtimeVersion}</dd>
          </div>
        ) : null}
        {execution.limits ? (
          <div>
            <dt>Limites</dt>
            <dd>
              {execution.limits.timeoutMs}ms / {execution.limits.outputLimit} chars
            </dd>
          </div>
        ) : null}
        {execution.capabilities ? (
          <div>
            <dt>Capacidades bloqueadas</dt>
            <dd>{formatBlockedCapabilities(execution.capabilities)}</dd>
          </div>
        ) : null}
      </dl>

      <TerminalStream label="STDOUT" lines={execution.stdout} />
      <TerminalStream label="STDERR" lines={execution.stderr} />
    </div>
  );
}

function TerminalStream({ label, lines }: Readonly<{ label: "STDOUT" | "STDERR"; lines: string[] }>) {
  return (
    <section className="terminal-stream" aria-label={label}>
      <strong>{label}</strong>
      {lines.length > 0 ? <pre>{lines.join("\n")}</pre> : <p>Sem saída.</p>}
    </section>
  );
}

function TestResults({ tests }: Readonly<{ tests: TestPayload[] }>) {
  const passed = tests.filter((test) => test.status === "passed").length;

  return (
    <section className="test-panel" aria-label="Resultados dos testes">
      <div className="test-panel-header">
        <strong>Testes</strong>
        <span>
          {passed}/{tests.length} passed
        </span>
      </div>
      <ol className="test-results">
        {tests.map((test) => (
          <li key={test.name} data-state={test.status}>
            <strong>{test.name}</strong>
            <span>
              {test.status}: {test.message}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AttemptDiff({ lines }: Readonly<{ lines: ActivityAttemptFeedback["sourceDiff"] }>) {
  return (
    <section className="attempt-diff" aria-label="Diff da tentativa">
      <div className="test-panel-header">
        <strong>Diff</strong>
        <span>{lines.filter((line) => line.type !== "unchanged").length} alteração</span>
      </div>
      <ol>
        {lines.map((line, index) => (
          <li key={`${line.type}-${index}`} data-state={line.type}>
            <span>{line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}</span>
            <code>{line.text || " "}</code>
          </li>
        ))}
      </ol>
    </section>
  );
}

async function postCode(url: string, source: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ source })
  });

  return response.json();
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatBlockedCapabilities(capabilities: NonNullable<ExecutionPayload["capabilities"]>) {
  return [
    capabilities.dom ? null : "DOM",
    capabilities.network ? null : "network",
    capabilities.ambientSecrets ? null : "secrets"
  ]
    .filter(Boolean)
    .join(", ");
}
