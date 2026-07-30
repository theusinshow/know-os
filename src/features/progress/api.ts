import { ProgressRepository } from "@/db/repositories/progress-repository";
import { getDatabaseUrl } from "@/db/connection";
import { MemoryProgressRepository } from "@/db/repositories/memory-store";
import { getServerEnv } from "@/lib/env";

export async function getLessonProgress(lessonStableId: string) {
  const ownerId = getServerEnv().KNOW_OS_OWNER_ID;

  if (getDatabaseUrl() === "memory://local") {
    return new MemoryProgressRepository().getLessonProgress(ownerId, lessonStableId);
  }

  return new ProgressRepository().getLessonProgress(ownerId, lessonStableId);
}

export async function getTrackProgress(trackStableId: string) {
  const ownerId = getServerEnv().KNOW_OS_OWNER_ID;

  if (getDatabaseUrl() === "memory://local") {
    return new MemoryProgressRepository().getTrackProgress(ownerId, trackStableId);
  }

  return new ProgressRepository().getTrackProgress(ownerId, trackStableId);
}
