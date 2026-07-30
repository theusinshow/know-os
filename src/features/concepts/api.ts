import { ConceptEvidenceRepository } from "@/db/repositories/concept-evidence-repository";
import { getDatabaseUrl } from "@/db/connection";
import { withCatalogRepository } from "@/db/repositories/catalog-repository";
import { MemoryCatalogRepository, MemoryConceptEvidenceRepository } from "@/db/repositories/memory-store";
import { calculateConceptMastery } from "@/features/mastery/mastery-policy";
import { getServerEnv } from "@/lib/env";

export async function getConcept(stableId: string) {
  if (getDatabaseUrl() === "memory://local") {
    const concept = await new MemoryCatalogRepository().getConcept(stableId);

    if (!concept) {
      return null;
    }

    const evidence = await new MemoryConceptEvidenceRepository().listForConcept(getServerEnv().KNOW_OS_OWNER_ID, stableId);
    return {
      ...concept,
      mastery: calculateConceptMastery(evidence)
    };
  }

  return withCatalogRepository(async (repository) => {
    const concept = await repository.getConcept(stableId);

    if (!concept) {
      return null;
    }

    const evidence = await new ConceptEvidenceRepository().listForConcept(getServerEnv().KNOW_OS_OWNER_ID, stableId);
    return {
      ...concept,
      mastery: calculateConceptMastery(evidence)
    };
  });
}
