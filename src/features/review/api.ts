import { getDatabaseUrl } from "@/db/connection";
import { MemoryReviewRepository } from "@/db/repositories/memory-store";
import { ReviewRepository } from "@/db/repositories/review-repository";
import { getServerEnv } from "@/lib/env";
import type { ReviewQuality } from "@/features/review/review-policy";

type ReviewStore = Pick<ReviewRepository, "completeReview" | "listDueReviews">;

export async function getDueReviews(repository: ReviewStore = createReviewRepository()) {
  return repository.listDueReviews(getServerEnv().KNOW_OS_OWNER_ID);
}

export async function completeConceptReview(
  conceptStableId: string,
  quality: ReviewQuality,
  repository: ReviewStore = createReviewRepository()
) {
  return repository.completeReview({
    ownerId: getServerEnv().KNOW_OS_OWNER_ID,
    conceptStableId,
    quality
  });
}

function createReviewRepository(): ReviewStore {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryReviewRepository();
  }

  return new ReviewRepository();
}
