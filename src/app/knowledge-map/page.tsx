import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { listKnowledgeMapConcepts } from "@/features/concepts/knowledge-map-api";

export const dynamic = "force-dynamic";

export default async function KnowledgeMapPage() {
  const concepts = await listKnowledgeMapConcepts();

  return (
    <AppShell>
      <section className="foundation-panel content-panel" aria-labelledby="knowledge-map-title">
        <p className="eyebrow">Knowledge Map</p>
        <h1 id="knowledge-map-title">Mapa de conhecimento</h1>
        <p>Lista hierárquica completa dos conceitos importados. Esta versão não depende de canvas.</p>

        {concepts.length === 0 ? (
          <p className="lesson-text">Importe uma trilha para montar o mapa.</p>
        ) : (
          <ol className="record-list" aria-label="Mapa de conceitos">
            {concepts.map((concept) => (
              <li key={concept.stableId}>
                <Link href={`/concepts/${concept.stableId}`}>
                  <strong>{concept.title}</strong>
                  <span>{concept.summary ?? "Sem resumo."}</span>
                  <small>
                    {concept.lessonCount} lição · {concept.trackTitles.join(", ") || "sem trilha"}
                  </small>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppShell>
  );
}
