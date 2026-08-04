import { notFound } from "next/navigation";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { ActivityList } from "@/features/activities/registry";
import { getLesson } from "@/features/lessons/api";
import { LessonBlockList } from "@/features/lessons/blocks";
import { getLessonProgress } from "@/features/progress/api";
import { ProgressSummary } from "@/features/progress/progress-summary";

type LessonPageProps = Readonly<{
  params: Promise<{ lessonId: string }>;
}>;

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const [lesson, progress] = await Promise.all([getLesson(lessonId), getLessonProgress(lessonId)]);

  if (!lesson) {
    notFound();
  }

  return (
    <AppShell>
      <article className="foundation-panel content-panel accent-panel accent-learn" aria-labelledby="lesson-title">
        <p className="eyebrow">{lesson.trackTitle}</p>
        <h1 id="lesson-title">{lesson.title}</h1>
        <ProgressSummary progress={progress} />

        <section className="module-section lesson-study-section" aria-labelledby="lesson-body-title">
          <p className="technical-label">Ler primeiro</p>
          <h2 id="lesson-body-title">Aula</h2>
          <LessonBlockList blocks={lesson.blocks} />
        </section>

        <section className="module-section" aria-labelledby="concepts-title">
          <p className="technical-label">Entender</p>
          <h2 id="concepts-title">Conceitos desta aula</h2>
          <ul className="concept-list">
            {lesson.concepts.map((concept) => (
              <li key={concept.stableId}>
                <Link href={`/concepts/${concept.stableId}`}>
                  <strong>{concept.title}</strong>
                  <span>{concept.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="module-section" aria-labelledby="activities-title">
          <p className="technical-label">Praticar depois</p>
          <h2 id="activities-title">Prática</h2>
          <ActivityList activities={lesson.activities} />
        </section>
      </article>
    </AppShell>
  );
}
