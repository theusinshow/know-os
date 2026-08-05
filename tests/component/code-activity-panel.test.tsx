import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CodeActivityPanel } from "@/features/activities/components/code-activity-panel";
import type { ActivityAttemptFeedback } from "@/features/activities/registry";

describe("CodeActivityPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the activity page mounted when RUN returns a non-JSON server error", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => new Response("Internal Server Error", { status: 500 }));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <CodeActivityPanel
        activityStableId="code-1"
        activityLabel="Atividade de código"
        prompt="Resolva com código"
        starterCode="console.log('ok');"
        initialFeedback={null}
      />
    );

    await user.click(screen.getByRole("button", { name: "RUN" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("RUN falhou (500)"));
    expect(screen.getByRole("heading", { name: "Resolva com código" })).toBeInTheDocument();
    expect(screen.getByLabelText("Saída da execução")).toHaveTextContent("request_error");
    expect(screen.getByLabelText("STDERR")).toHaveTextContent("A API recusou a execução");
  });

  it("starts persisted attempt details collapsed while keeping the attempt summary visible", async () => {
    const user = userEvent.setup();
    render(
      <CodeActivityPanel
        activityStableId="code-1"
        activityLabel="Atividade de código"
        prompt="Resolva com código"
        starterCode="console.log('ok');"
        initialFeedback={passedFeedback}
      />
    );

    const details = screen.getByText("Terminal, testes e diff").closest("details");

    expect(screen.getByLabelText("Última tentativa")).toHaveTextContent("Tentativa 1: passed");
    expect(screen.getByLabelText("Próximo passo da atividade")).toHaveTextContent("Evidência registrada");
    expect(details).not.toHaveAttribute("open");

    await user.click(screen.getByText("Terminal, testes e diff"));
    expect(details).toHaveAttribute("open");
  });
});

const passedFeedback: ActivityAttemptFeedback = {
  attemptNumber: 1,
  outcome: "passed",
  submittedAt: "2026-08-05T12:00:00.000Z",
  execution: {
    status: "completed",
    stdout: ["ok"],
    stderr: [],
    result: null,
    runtimeVersion: "quickjs-emscripten@0.32.0",
    limits: {
      timeoutMs: 1000,
      outputLimit: 4000
    },
    capabilities: {
      dom: false,
      network: false,
      ambientSecrets: false
    }
  },
  tests: [{ name: "prints ok", status: "passed", message: "stdout matched." }],
  sourceDiff: [{ type: "added", text: "console.log('ok');" }]
};
