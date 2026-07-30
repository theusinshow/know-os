import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const examplePath = path.join(process.cwd(), "packs", "examples", "javascript-fundamentals.track.json");
  const example = await readFile(examplePath, "utf8");

  return new NextResponse(example, {
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}
