import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getTrackProgress } from "@/features/progress/api";
import { ProgressSummary } from "@/features/progress/progress-summary";
import { getTrack } from "@/features/tracks/api";

type TrackPageProps = Readonly<{
  params: Promise<{ trackId: string }>;
}>;

export default async function TrackPage({ params }: TrackPageProps) {
  const { trackId } = await params;
  const [track, progress] = await Promise.all([getTrack(trackId), getTrackProgress(trackId)]);

  if (!track) {
    notFound();
  }

  const firstLesson = track.modules.flatMap((module) => module.lessons).at(0);

  return (
    <AppShell>
      <section className="foundation-panel content-panel accent-panel accent-learn" aria-labelledby="track-title">
        <p className="eyebrow">Trilha</p>
        <h1 id="track-title">{track.title}</h1>
        <p>{track.description}</p>
        <ProgressSummary progress={progress} />

        {firstLesson ? (
          <Link
            aria-label="Continuar pela primeira aula"
            className="today-action study-next-action"
            href={`/lessons/${firstLesson.stableId}`}
          >
            <strong>Continuar pela primeira aula</strong>
            <span>{firstLesson.title}</span>
          </Link>
        ) : null}

        <div className="module-stack" aria-label="Módulos da trilha">
          {track.modules.map((module, moduleIndex) => (
            <details key={module.stableId} className="module-section module-disclosure" open={moduleIndex === 0}>
              <summary aria-labelledby={`module-${module.stableId}`}>
                <span className="technical-label">Módulo {moduleIndex + 1}</span>
                <h2 id={`module-${module.stableId}`}>{module.title}</h2>
                <span>{module.lessons.length} aulas</span>
              </summary>
              <ol className="record-list">
                {module.lessons.map((lesson) => (
                  <li key={lesson.stableId}>
                    <Link href={`/lessons/${lesson.stableId}`}>
                      <strong>{lesson.title}</strong>
                      <span>{lesson.activityCount} atividade disponível</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
