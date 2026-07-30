import { getDatabaseUrl } from "@/db/connection";
import { MemoryXpRepository } from "@/db/repositories/memory-store";
import { XpRepository } from "@/db/repositories/xp-repository";
import { listMistakes } from "@/features/mistakes/api";
import { getDueReviews } from "@/features/review/api";
import { buildGamificationSummary } from "@/features/gamification/gamification-rules";
import { getServerEnv } from "@/lib/env";

type XpStore = Pick<XpRepository, "getSummary">;

export async function getXpSummary(repository: XpStore = createXpRepository()) {
  return repository.getSummary(getServerEnv().KNOW_OS_OWNER_ID);
}

export async function getGamificationSummary() {
  const [xp, dueReviews, mistakes] = await Promise.all([getXpSummary(), getDueReviews(), listMistakes()]);

  return buildGamificationSummary({ xp, dueReviews, mistakes });
}

function createXpRepository(): XpStore {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryXpRepository();
  }

  return new XpRepository();
}
