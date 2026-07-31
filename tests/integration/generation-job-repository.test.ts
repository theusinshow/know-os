import { describe, expect, it, afterEach } from "vitest";

import { GenerationJobRepository, MemoryGenerationJobRepository } from "@/db/repositories/generation-job-repository";
import { owners } from "@/db/schema";
import { compileGenerationPrompt } from "@/features/generation/prompt-compiler";
import type { GenerationSpec } from "@/features/generation/contracts";

import { createMigratedPgliteTestDatabase } from "./pglite-test-db";

type TestDb = Awaited<ReturnType<typeof createMigratedPgliteTestDatabase>>;

const spec: GenerationSpec = {
  targetSchema: "caderno.lesson.v1",
  language: "pt-BR",
  audienceLevel: "beginner",
  lessonTitle: "Loops em JavaScript",
  lessonGoal: "Ensinar repeticao com for.",
  concepts: [{ id: "js-loop", title: "Loop" }],
  activityTypes: ["prediction", "code"],
  constraints: ["Nao importar resposta crua sem validacao."]
};

describe("GenerationJobRepository", () => {
  let testDb: TestDb | undefined;

  afterEach(async () => {
    await testDb?.close();
    testDb = undefined;
  });

  it("persists manual waiting state, prompt and status timeline without secrets", async () => {
    testDb = await createMigratedPgliteTestDatabase();
    await testDb.db.insert(owners).values({ id: "local-owner", displayName: "Local Owner" });
    const repository = new GenerationJobRepository(testDb.db as never);
    const compiledPrompt = compileGenerationPrompt(spec);

    const created = await repository.create({
      ownerId: "local-owner",
      mode: "manual_copy_paste",
      provider: "manual",
      spec,
      compiledPrompt,
      status: "waiting_external_response",
      now: new Date("2026-07-31T12:00:00.000Z")
    });
    const updated = await repository.updateStatus("local-owner", created.id, "validating", {
      note: "User pasted JSON.",
      now: new Date("2026-07-31T12:01:00.000Z")
    });

    expect(updated).toMatchObject({
      ownerId: "local-owner",
      mode: "manual_copy_paste",
      provider: "manual",
      targetSchema: "caderno.lesson.v1",
      status: "validating",
      compiledPrompt
    });
    expect(updated?.statusTimeline).toEqual([
      { status: "waiting_external_response", at: "2026-07-31T12:00:00.000Z" },
      { status: "validating", at: "2026-07-31T12:01:00.000Z", note: "User pasted JSON." }
    ]);
    expect(JSON.stringify(updated)).not.toContain("DEEPSEEK_API_KEY");
  });

  it("keeps the memory repository contract aligned for local flows", async () => {
    const repository = new MemoryGenerationJobRepository();
    const created = await repository.create({
      ownerId: "local-owner",
      mode: "deepseek",
      provider: "deepseek",
      model: "deepseek-v4-flash",
      spec,
      compiledPrompt: compileGenerationPrompt(spec)
    });
    const withUsage = await repository.recordProviderUsage("local-owner", created.id, {
      model: "deepseek-v4-flash",
      inputTokens: 100,
      outputTokens: 200,
      cacheHitTokens: 0,
      estimatedCostUsd: 0.001,
      measuredAt: "2026-07-31T12:00:00.000Z"
    });

    expect(withUsage).toMatchObject({
      status: "compiled",
      providerUsage: {
        model: "deepseek-v4-flash",
        estimatedCostUsd: 0.001
      }
    });
  });
});
