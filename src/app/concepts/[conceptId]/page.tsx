import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getConcept } from "@/features/concepts/api";

type ConceptPageProps = Readonly<{
  params: Promise<{ conceptId: string }>;
}>;

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { conceptId } = await params;
  const concept = await getConcept(conceptId);

  if (!concept) {
    notFound();
  }

  return (
    <AppShell>
      <article className="foundation-panel content-panel accent-panel accent-learn" aria-labelledby="concept-title">
        <p className="eyebrow">Conceito</p>
        <h1 id="concept-title">{concept.title}</h1>
        <p>{concept.summary ?? "Sem resumo importado."}</p>

        <section className="module-section" aria-labelledby="concept-lessons-title">
          <h2 id="concept-lessons-title">Onde aparece</h2>
          <ol className="record-list">
            {concept.lessons.map((lesson) => (
              <li key={lesson.stableId}>
                <Link href={`/lessons/${lesson.stableId}`}>
                  <strong>{lesson.title}</strong>
                  <span>{lesson.trackTitle}</span>
                  <small>{lesson.activityCount} atividade relacionada</small>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="module-section" aria-labelledby="concept-mastery-title">
          <h2 id="concept-mastery-title">Mastery</h2>
          <div className="mastery-panel" aria-label="Mastery do conceito">
            <p className="technical-label">POLICY {concept.mastery.policyVersion}</p>
            <p className="mastery-score">
              {concept.mastery.label} <span>{concept.mastery.level}/5</span>
            </p>
            <p className="lesson-text">
              {concept.mastery.evidenceCount} evidência registrada. Força total: {concept.mastery.totalStrength}.
            </p>
            <ul>
              {concept.mastery.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    </AppShell>
  );
}
