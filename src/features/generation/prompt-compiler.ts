import type { CompiledGenerationPrompt, GenerationSpec } from "@/features/generation/contracts";

const compactLessonExample = {
  schema: "caderno.lesson.v1",
  lesson: {
    id: "stable-lesson-id",
    version: 1,
    title: "Titulo da aula",
    concepts: [{ id: "stable-concept-id", title: "Conceito", summary: "Resumo curto." }],
    blocks: [{ id: "intro", type: "text", text: "Texto curto e direto." }],
    activities: [
      {
        id: "activity-001",
        type: "prediction",
        conceptIds: ["stable-concept-id"],
        prompt: "Pergunta objetiva."
      }
    ]
  }
} as const;

export function compileGenerationPrompt(spec: GenerationSpec): CompiledGenerationPrompt {
  const jsonExample = JSON.stringify(compactLessonExample);
  const concepts = spec.concepts.map((concept) => `- ${concept.id}: ${concept.title}`).join("\n");
  const activityTypes = spec.activityTypes.join(", ");
  const constraints = spec.constraints.length > 0 ? spec.constraints.map((item) => `- ${item}`).join("\n") : "- Sem restricoes adicionais.";

  return {
    targetSchema: spec.targetSchema,
    jsonExample,
    prompt: [
      "Voce esta gerando conteudo para KNOW/OS.",
      `Responda somente com JSON valido no schema ${spec.targetSchema}.`,
      "Nao use Markdown, comentarios, texto antes ou depois do JSON.",
      "Nao inclua scripts, HTML executavel, URLs de rastreamento, segredos ou chaves de API.",
      "Use portugues do Brasil.",
      "",
      `Titulo da aula: ${spec.lessonTitle}`,
      `Objetivo: ${spec.lessonGoal}`,
      `Nivel do publico: ${spec.audienceLevel}`,
      `Tipos de atividade permitidos: ${activityTypes}`,
      "",
      "Conceitos obrigatorios:",
      concepts,
      "",
      "Restricoes:",
      constraints,
      "",
      "Exemplo compacto de formato JSON:",
      jsonExample
    ].join("\n")
  };
}
