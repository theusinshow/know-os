import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureDatabaseReady } from "@/db/connection";
import { runCodeActivity } from "@/features/activities/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  source: z.string().max(20000)
});

type RunRouteProps = Readonly<{
  params: Promise<{ activityId: string }>;
}>;

export async function POST(request: Request, { params }: RunRouteProps) {
  const body = requestSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return NextResponse.json({ code: "invalid_request", message: "Envie o código em `source`." }, { status: 400 });
  }

  await ensureDatabaseReady();
  const { activityId } = await params;
  const result = await runCodeActivity(activityId, body.data.source);

  if (result.status === "not_found") {
    return NextResponse.json({ code: "activity_not_found", message: "Atividade não encontrada." }, { status: 404 });
  }

  return NextResponse.json(result);
}
