import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { listMistakes } from "@/features/mistakes/api";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const mistakes = await listMistakes();

  return (
    <AppShell>
      <section className="foundation-panel content-panel" aria-labelledby="mistakes-title">
        <p className="eyebrow">Mistakes</p>
        <h1 id="mistakes-title">Erros registrados</h1>
        <p>
          Erros ficam ligados à tentativa e ao conceito. Quando corrigidos, mudam para resolvido sem
          desaparecer do histórico.
        </p>

        {mistakes.length === 0 ? (
          <div className="lesson-callout" role="status">
            <strong>Nenhum erro categorizado.</strong>
            <span>Falhas em SUBMIT SOLUTION aparecerão aqui com conceito, categoria e estado.</span>
          </div>
        ) : (
          <ol className="record-list" aria-label="Erros categorizados">
            {mistakes.map((mistake) => (
              <li key={mistake.id}>
                <div>
                  <Link href={`/concepts/${mistake.conceptStableId}`}>
                    <strong>{mistake.conceptTitle}</strong>
                  </Link>
                  <span>{mistake.summary}</span>
                  <small>
                    {mistake.category} · {mistake.status}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppShell>
  );
}
