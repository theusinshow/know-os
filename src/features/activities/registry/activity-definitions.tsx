import { parseCodeActivityConfig } from "@/features/activities/application/code-activity-config";
import { CodeActivityPanel } from "@/features/activities/components/code-activity-panel";

import type { ActivityDefinition, KnownActivityType } from "./types";

const codeActivityDefinition: ActivityDefinition<"code"> = {
  type: "code",
  label: "Atividade de codigo",
  parseConfig: parseCodeActivityConfig,
  render: ({ activity, config, feedback }) => (
    <CodeActivityPanel
      activityStableId={activity.stableId}
      activityLabel="Atividade de código"
      prompt={activity.prompt}
      starterCode={config.starterCode}
      initialFeedback={feedback}
    />
  )
};

const debugActivityDefinition: ActivityDefinition<"debug"> = {
  type: "debug",
  label: "Atividade de debug",
  parseConfig: parseCodeActivityConfig,
  render: ({ activity, config, feedback }) => (
    <CodeActivityPanel
      activityStableId={activity.stableId}
      activityLabel="Atividade de debug"
      prompt={activity.prompt}
      starterCode={config.starterCode}
      initialFeedback={feedback}
    />
  )
};

const activityDefinitions = {
  code: codeActivityDefinition,
  debug: debugActivityDefinition
} satisfies Record<KnownActivityType, ActivityDefinition>;

export function getActivityDefinition(type: string): ActivityDefinition | null {
  return isKnownActivityType(type) ? activityDefinitions[type] : null;
}

export function parseActivityConfig(type: string, config: unknown) {
  const definition = getActivityDefinition(type);

  if (!definition) {
    throw new Error(`Unsupported activity type: ${type}`);
  }

  return definition.parseConfig(config);
}

function isKnownActivityType(type: string): type is KnownActivityType {
  return type in activityDefinitions;
}

export { activityDefinitions };
