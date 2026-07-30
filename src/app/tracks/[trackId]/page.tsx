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

  return (
    <AppShell>
      <section className="foundation-panel content-panel" aria-labelledby="track-title">
        <p className="eyebrow">Trilha</p>
        <h1 id="track-title">{track.title}</h1>
        <p>{track.description}</p>
        <ProgressSummary progress={progress} />

        <div className="module-stack" aria-label="Módulos da trilha">
          {track.modules.map((module) => (
            <section key={module.stableId} className="module-section" aria-labelledby={`module-${module.stableId}`}>
              <h2 id={`module-${module.stableId}`}>{module.title}</h2>
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
            </section>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
