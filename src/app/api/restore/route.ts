import { NextResponse } from "next/server";

import { ensureDatabaseReady } from "@/db/connection";
import { readJsonRequestWithLimit } from "@/features/import/api";
import { applyBackupRestore } from "@/features/restore/api";
import { MAX_RESTORE_BYTES } from "@/features/restore/restore-contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsedRequest = await readJsonRequestWithLimit(request, MAX_RESTORE_BYTES);

  if (!parsedRequest.ok) {
    return NextResponse.json(
      {
        code: parsedRequest.code,
        message: parsedRequest.message,
        maxBytes: parsedRequest.maxBytes,
        byteLength: parsedRequest.byteLength
      },
      { status: parsedRequest.code === "payload_too_large" ? 413 : 400 }
    );
  }

  try {
    await ensureDatabaseReady();
    const result = await applyBackupRestore(parsedRequest.body);

    if (result.status === "invalid") {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_URL is not configured") {
      return NextResponse.json(
        { code: "database_not_configured", message: "Configure DATABASE_URL para restaurar dados." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { code: "restore_failed", message: "Não foi possível aplicar o restore agora." },
      { status: 500 }
    );
  }
}
