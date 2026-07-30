import { NextResponse } from "next/server";

import { getExportPreview } from "@/features/export/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return NextResponse.json(await getExportPreview(url.searchParams.get("type")));
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_URL is not configured") {
      return NextResponse.json(
        { code: "database_not_configured", message: "Configure DATABASE_URL para pré-visualizar exportação." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { code: "export_preview_failed", message: "Não foi possível pré-visualizar o export agora." },
      { status: 500 }
    );
  }
}
