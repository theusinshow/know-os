import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { FirstRunCallout } from "@/components/ui/first-run-callout";
import { listKnowledgeMapConcepts } from "@/features/concepts/knowledge-map-api";

export const dynamic = "force-dynamic";

export default async function KnowledgeMapPage() {
  const concepts = await listKnowledgeMapConcepts();

  return (
    <AppShell>
      <section className="foundation-panel content-panel accent-panel accent-learn" aria-labelledby="knowledge-map-title">
        <p className="eyebrow">Knowledge Map</p>
        <h1 id="knowledge-map-title">Mapa de conhecimento</h1>
        <p>Lista hierárquica completa dos conceitos importados. Esta versão não depende de canvas.</p>

        {concepts.length === 0 ? (
          <FirstRunCallout
            title="Mapa ainda vazio."
            description="O mapa é montado a partir dos conceitos das aulas importadas."
          />
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
