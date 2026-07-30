import { getDatabaseUrl } from "@/db/connection";
import { withCatalogRepository } from "@/db/repositories/catalog-repository";
import { MemoryCatalogRepository } from "@/db/repositories/memory-store";

export async function listKnowledgeMapConcepts() {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryCatalogRepository().listKnowledgeMapConcepts();
  }

  return withCatalogRepository((repository) => repository.listKnowledgeMapConcepts());
}
