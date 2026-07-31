import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TrackPackImporter } from "@/features/import/components/track-pack-importer";

const configuredDeepSeek = {
  status: "configured" as const,
  defaultModel: "deepseek-v4-flash" as const,
  proModel: "deepseek-v4-pro" as const
};

describe("TrackPackImporter generation recovery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("preserves the compiled prompt and exposes DeepSeek failure recovery actions", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/api/generation/manual/compile")) {
        return Response.json({
          jobId: "manual-fallback-job",
          status: "waiting_external_response",
          compiledPrompt: {
            targetSchema: "caderno.lesson.v1",
            prompt: "PROMPT caderno.lesson.v1 sem segredo",
            jsonExample: "{}"
          }
        });
      }

      if (url.endsWith("/api/generation/deepseek/generate")) {
        return Response.json(
          {
            code: "insufficient_balance",
            message: "Saldo insuficiente na DeepSeek.",
            retryable: false,
            jobId: "deepseek-job",
            status: "insufficient_balance"
          },
          { status: 402 }
        );
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    render(<TrackPackImporter deepSeek={configuredDeepSeek} />);

    await user.click(screen.getByRole("tab", { name: "AI / DeepSeek" }));
    await user.click(screen.getByRole("button", { name: "Gerar com DeepSeek" }));

    await expect(screen.findByRole("alert", { name: "Recuperação da geração DeepSeek" })).resolves.toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Switch to Manual" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Copy Prompt" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "View Technical Details" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "View Technical Details" }));
    const technicalDetails = screen.getByLabelText("Detalhes técnicos da falha DeepSeek") as HTMLTextAreaElement;
    expect(technicalDetails.value).toContain("insufficient_balance");
    expect(technicalDetails.value).not.toContain("test-key");

    await user.click(screen.getByRole("button", { name: "Copy Prompt" }));
    expect(writeText).toHaveBeenCalledWith("PROMPT caderno.lesson.v1 sem segredo");

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

    await user.click(screen.getByRole("button", { name: "Switch to Manual" }));
    expect(screen.getByRole("tab", { name: "Manual / Copy Paste" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Prompt compilado")).toHaveValue("PROMPT caderno.lesson.v1 sem segredo");
    expect(screen.getByRole("status", { name: "Estado da geração" })).toHaveTextContent(
      "Prompt preservado a partir da falha DeepSeek"
    );
  });
});
