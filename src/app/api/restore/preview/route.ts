import { NextResponse } from "next/server";

import { readJsonRequestWithLimit } from "@/features/import/api";
import { MAX_RESTORE_BYTES, previewRestore } from "@/features/restore/restore-contracts";

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

  const preview = previewRestore(parsedRequest.body);

  if (preview.status === "invalid") {
    return NextResponse.json(preview, { status: 400 });
  }

  return NextResponse.json(preview);
}
