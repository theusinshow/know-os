import { getDatabaseUrl } from "@/db/connection";
import { MemoryMistakeRepository } from "@/db/repositories/memory-store";
import { MistakeRepository } from "@/db/repositories/mistake-repository";
import { getServerEnv } from "@/lib/env";

type MistakeStore = Pick<MistakeRepository, "listMistakes">;

export async function listMistakes(repository: MistakeStore = createMistakeRepository()) {
  return repository.listMistakes(getServerEnv().KNOW_OS_OWNER_ID);
}

function createMistakeRepository(): MistakeStore {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryMistakeRepository();
  }

  return new MistakeRepository();
}
