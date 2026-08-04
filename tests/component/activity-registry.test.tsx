import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getActivityDefinition, isExecutableActivityType, parseActivityConfig } from "@/features/activities/registry";

describe("activity registry", () => {
  it("parses and renders code activities through the allowlisted definition", () => {
    const definition = getActivityDefinition("code");
    const config = parseActivityConfig("code", {
      starterCode: "const ready = true;",
      tests: [{ name: "uses ready", kind: "source-contains", value: "ready" }]
    });

    expect(definition?.label).toBe("Atividade de codigo");
    expect(config.starterCode).toBe("const ready = true;");

    render(
      definition?.render({
        activity: {
          stableId: "code-1",
          type: "code",
          prompt: "Resolva com código",
          config
        },
        config,
        feedback: {
          attemptNumber: 2,
          outcome: "passed",
          submittedAt: "2026-07-30T12:00:00.000Z",
          execution: {
            status: "completed",
            stdout: ["ok"],
            stderr: ["warn"],
            result: null,
            runtimeVersion: "test",
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
          tests: [{ name: "uses ready", status: "passed", message: "Fonte válida" }],
          sourceDiff: [
            { type: "removed", text: "const ready = true;" },
            { type: "added", text: "const ready = false;" }
          ]
        }
      })
    );

    expect(screen.getByRole("heading", { name: "Resolva com código" })).toBeInTheDocument();
    expect(screen.getByLabelText("Última tentativa")).toHaveTextContent("Tentativa 2: passed");
    expect(screen.getByLabelText("STDOUT")).toHaveTextContent("ok");
    expect(screen.getByLabelText("STDERR")).toHaveTextContent("warn");
    expect(screen.getByLabelText("Contrato da execução")).toHaveTextContent("DOM, network, secrets");
    expect(screen.getByLabelText("Resultados dos testes")).toHaveTextContent("uses ready");
    expect(screen.getByLabelText("Resultados dos testes")).toHaveTextContent("1/1 passed");
    expect(screen.getByLabelText("Diff da tentativa")).toHaveTextContent("const ready = false;");
  });

  it("rejects unsupported activity types before rendering arbitrary payloads", () => {
    expect(getActivityDefinition("debug")?.label).toBe("Atividade de debug");
    expect(isExecutableActivityType("debug")).toBe(true);
    expect(isExecutableActivityType("prediction")).toBe(false);
    expect(getActivityDefinition("diagram")).toBeNull();
    expect(() => parseActivityConfig("diagram", {})).toThrow("Unsupported activity type");
  });

  it("renders static imported activities without exposing them as unavailable", () => {
    const predictionDefinition = getActivityDefinition("prediction");
    const predictionConfig = parseActivityConfig("prediction", {
      answer: "Mostra CronoCAD no terminal.",
      explanation: "console.log envia texto para a saída."
    });

    expect(predictionDefinition?.label).toBe("Atividade de predição");

    render(
      predictionDefinition?.render({
        activity: {
          stableId: "prediction-1",
          type: "prediction",
          prompt: "Antes de executar, preveja a saída.",
          config: predictionConfig
        },
        config: predictionConfig,
        feedback: null
      })
    );

    expect(screen.getByRole("heading", { name: "Antes de executar, preveja a saída." })).toBeInTheDocument();
    expect(screen.getByText("Checagem de leitura. Nenhuma tentativa oficial é registrada nesta atividade.")).toBeInTheDocument();
    expect(screen.queryByText(/Atividade indispon/i)).not.toBeInTheDocument();

    const choiceDefinition = getActivityDefinition("multiple-choice");
    const choiceConfig = parseActivityConfig("multiple-choice", {
      choices: [
        { label: "Node.js", correct: true },
        { label: "CSS" }
      ]
    });

    render(
      choiceDefinition?.render({
        activity: {
          stableId: "choice-1",
          type: "multiple-choice",
          prompt: "Qual runtime executa JavaScript fora do navegador?",
          config: choiceConfig
        },
        config: choiceConfig,
        feedback: null
      })
    );

    expect(screen.getByRole("heading", { name: "Qual runtime executa JavaScript fora do navegador?" })).toBeInTheDocument();
    expect(screen.getByLabelText("Alternativas")).toHaveTextContent("Node.js");
    expect(screen.getAllByText("Ver resposta esperada")).toHaveLength(2);
  });
});
