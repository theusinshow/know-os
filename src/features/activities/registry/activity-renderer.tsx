import { getLatestActivityAttemptFeedback } from "@/features/activities/api";

import { getActivityDefinition, isExecutableActivityType } from "./activity-definitions";
import type { ActivityAttemptFeedback, ActivityRecord, KnownActivityType } from "./types";

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
  switch (activity.type) {
    case "code":
    case "debug":
    case "prediction":
    case "multiple-choice":
      return renderKnownActivity(activity, activity.type);
    default:
      return (
        <div className="activity-panel">
          <p className="eyebrow">Atividade indisponível</p>
          <h3>{activity.prompt}</h3>
          <p>Este tipo de atividade ainda não tem renderer seguro nesta versão.</p>
        </div>
      );
  }
}

async function renderKnownActivity<Type extends KnownActivityType>(activity: ActivityRecord, type: Type) {
  const definition = getActivityDefinition(type);
  const config = definition.parseConfig(activity.config);
  const feedback: ActivityAttemptFeedback | null = isExecutableActivityType(type)
    ? await getLatestActivityAttemptFeedback(activity.stableId)
    : null;

  return definition.render({ activity, config, feedback });
}
