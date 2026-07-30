import { getLatestActivityAttemptFeedback } from "@/features/activities/api";

import { getActivityDefinition } from "./activity-definitions";
import type { ActivityRecord } from "./types";

export async function ActivityList({ activities }: Readonly<{ activities: ReadonlyArray<ActivityRecord> }>) {
  return (
    <div className="activity-stack">
      {activities.map((activity) => (
        <ActivityRenderer activity={activity} key={activity.stableId} />
      ))}
    </div>
  );
}

async function ActivityRenderer({ activity }: Readonly<{ activity: ActivityRecord }>) {
  const definition = getActivityDefinition(activity.type);

  if (!definition) {
    return (
      <div className="activity-panel">
        <p className="eyebrow">Atividade indisponivel</p>
        <h3>{activity.prompt}</h3>
        <p>Renderer de atividade `{activity.type}` entra em fase posterior.</p>
      </div>
    );
  }

  const config = definition.parseConfig(activity.config);
  const feedback = await getLatestActivityAttemptFeedback(activity.stableId);

  return definition.render({ activity, config, feedback });
}
