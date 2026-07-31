import "server-only";

import { getDatabaseUrl } from "@/db/connection";
import { GenerationJobRepository, MemoryGenerationJobRepository } from "@/db/repositories/generation-job-repository";

export function getGenerationJobRepository() {
  return getDatabaseUrl() === "memory://local" ? new MemoryGenerationJobRepository() : new GenerationJobRepository();
}
