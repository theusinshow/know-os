import { getDatabaseUrl } from "@/db/connection";
import { withHistoryRepository } from "@/db/repositories/history-repository";
import { MemoryHistoryRepository } from "@/db/repositories/memory-store";
import { getServerEnv } from "@/lib/env";

export async function listHistoryEvents() {
  const ownerId = getServerEnv().KNOW_OS_OWNER_ID;

  if (getDatabaseUrl() === "memory://local") {
    return new MemoryHistoryRepository().listEvents();
  }

  return withHistoryRepository((repository) => repository.listEvents(ownerId));
}
