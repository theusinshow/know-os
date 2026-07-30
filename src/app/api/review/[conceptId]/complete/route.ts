import { NextResponse } from "next/server";
import { z } from "zod";

import { completeConceptReview } from "@/features/review/api";

const completeReviewSchema = z.object({
  quality: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
});

type CompleteReviewRouteContext = Readonly<{
  params: Promise<{ conceptId: string }>;
}>;

export async function POST(request: Request, context: CompleteReviewRouteContext) {
  const { conceptId } = await context.params;
  const parsed = completeReviewSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        issues: parsed.error.issues
      },
      { status: 400 }
    );
  }

  const result = await completeConceptReview(conceptId, parsed.data.quality);

  if (!result) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
