import { NextResponse } from "next/server";

import { checkDatabaseHealth } from "@/db/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkDatabaseHealth();
  const status = health.status === "ok" ? 200 : 503;

  return NextResponse.json(health, { status });
}
