import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const catalogPath = path.join(process.cwd(), "packs", "catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const issues = [];
const seen = new Set();

if (catalog.schema !== "know-os.pack-catalog.v1") {
  issues.push("catalog.schema must be know-os.pack-catalog.v1");
}

if (!Array.isArray(catalog.packs) || catalog.packs.length === 0) {
  issues.push("catalog.packs must contain at least one Pack entry");
}

for (const [index, entry] of (catalog.packs ?? []).entries()) {
  const prefix = `packs.${index}`;
  const key = `${entry.schema}:${entry.packId}:${entry.version}`;

  if (seen.has(key)) {
    issues.push(`${prefix} duplicates ${key}`);
    continue;
  }

  seen.add(key);

  if (entry.schema !== "caderno.track.v1") {
    issues.push(`${prefix}.schema must be caderno.track.v1`);
  }

  if (!/^[a-z0-9][a-z0-9._-]{2,127}$/.test(entry.packId ?? "")) {
    issues.push(`${prefix}.packId is not a stable Pack ID`);
  }

  if (!Number.isInteger(entry.version) || entry.version < 1) {
    issues.push(`${prefix}.version must be a positive integer`);
  }

  const relativePath = entry.path ?? "";

  if (!relativePath.startsWith("packs/") || relativePath.includes("..")) {
    issues.push(`${prefix}.path must stay inside packs/`);
    continue;
  }

  const packPath = path.join(process.cwd(), relativePath);
  const pack = JSON.parse(await readFile(packPath, "utf8"));
  const contentHash = hashCanonicalJson(pack);

  if (pack.schema !== entry.schema) {
    issues.push(`${prefix}.schema does not match the Pack file`);
  }

  if (pack.packId !== entry.packId) {
    issues.push(`${prefix}.packId does not match the Pack file`);
  }

  if (pack.version !== entry.version) {
    issues.push(`${prefix}.version does not match the Pack file`);
  }

  if (entry.contentHash !== contentHash) {
    issues.push(`${prefix}.contentHash expected ${contentHash}`);
  }

  if (!entry.compatibility?.acceptedBy?.includes(pack.schema)) {
    issues.push(`${prefix}.compatibility.acceptedBy must include ${pack.schema}`);
  }
}

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`pack_catalog_validation:error:${issue}`);
  }

  process.exit(1);
}

console.log(`pack_catalog_validation:passed:packs=${catalog.packs.length}`);

function hashCanonicalJson(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}
