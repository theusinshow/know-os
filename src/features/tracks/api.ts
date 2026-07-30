import { getDatabaseUrl } from "@/db/connection";
import { withCatalogRepository } from "@/db/repositories/catalog-repository";
import { MemoryCatalogRepository } from "@/db/repositories/memory-store";

export async function listTracks() {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryCatalogRepository().listTracks();
  }

  return withCatalogRepository((repository) => repository.listTracks());
}

export async function getTrack(stableId: string) {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryCatalogRepository().getTrack(stableId);
  }

  return withCatalogRepository((repository) => repository.getTrack(stableId));
}
