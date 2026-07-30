import { asc, eq, inArray } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { getDatabase } from "@/db/connection";
import { activities, concepts, owners, projectActivities, projectConcepts, projectContexts } from "@/db/schema";
import type * as schema from "@/db/schema";

type ProjectDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

export type ProjectSummary = Readonly<{
  stableId: string;
  title: string;
  description: string | null;
  status: string;
  conceptCount: number;
  activityCount: number;
}>;

export type CreatedProject = Readonly<{
  stableId: string;
  linkedConcepts: number;
  linkedActivities: number;
}>;

export class ProjectRepository {
  constructor(private readonly db: ProjectDatabase = getDatabase()) {}

  async createProject({
    ownerId,
    stableId,
    title,
    description = null,
    conceptStableIds = [],
    activityStableIds = []
  }: Readonly<{
    ownerId: string;
    stableId: string;
    title: string;
    description?: string | null;
    conceptStableIds?: readonly string[];
    activityStableIds?: readonly string[];
  }>): Promise<CreatedProject> {
    return this.db.transaction(async (tx) => {
      await tx
        .insert(owners)
        .values({ id: ownerId, displayName: "Local owner" })
        .onConflictDoNothing({ target: owners.id });

      const [project] = await tx
        .insert(projectContexts)
        .values({
          ownerId,
          stableId,
          title,
          description
        })
        .onConflictDoUpdate({
          target: [projectContexts.ownerId, projectContexts.stableId],
          set: {
            title,
            description
          }
        })
        .returning({ id: projectContexts.id, stableId: projectContexts.stableId });

      if (!project) {
        throw new Error("Failed to create project context");
      }

      const conceptRows =
        conceptStableIds.length > 0
          ? await tx
              .select({ id: concepts.id })
              .from(concepts)
              .where(inArray(concepts.stableId, [...conceptStableIds]))
          : [];

      for (const concept of conceptRows) {
        await tx
          .insert(projectConcepts)
          .values({
            projectId: project.id,
            conceptId: concept.id
          })
          .onConflictDoNothing({ target: [projectConcepts.projectId, projectConcepts.conceptId] });
      }

      const activityRows =
        activityStableIds.length > 0
          ? await tx
              .select({ id: activities.id })
              .from(activities)
              .where(inArray(activities.stableId, [...activityStableIds]))
          : [];

      for (const activity of activityRows) {
        await tx
          .insert(projectActivities)
          .values({
            projectId: project.id,
            activityId: activity.id
          })
          .onConflictDoNothing({ target: [projectActivities.projectId, projectActivities.activityId] });
      }

      return {
        stableId: project.stableId,
        linkedConcepts: conceptRows.length,
        linkedActivities: activityRows.length
      };
    });
  }

  async listProjects(ownerId: string): Promise<ProjectSummary[]> {
    const rows = await this.db
      .select({
        stableId: projectContexts.stableId,
        title: projectContexts.title,
        description: projectContexts.description,
        status: projectContexts.status,
        conceptStableId: concepts.stableId,
        activityStableId: activities.stableId
      })
      .from(projectContexts)
      .leftJoin(projectConcepts, eq(projectConcepts.projectId, projectContexts.id))
      .leftJoin(concepts, eq(concepts.id, projectConcepts.conceptId))
      .leftJoin(projectActivities, eq(projectActivities.projectId, projectContexts.id))
      .leftJoin(activities, eq(activities.id, projectActivities.activityId))
      .where(eq(projectContexts.ownerId, ownerId))
      .orderBy(asc(projectContexts.title));

    const projects = new Map<
      string,
      {
        stableId: string;
        title: string;
        description: string | null;
        status: string;
        conceptCount: number;
        activityCount: number;
        conceptIds: Set<string>;
        activityIds: Set<string>;
      }
    >();

    for (const row of rows) {
      const existing =
        projects.get(row.stableId) ??
        ({
          stableId: row.stableId,
          title: row.title,
          description: row.description,
          status: row.status,
          conceptCount: 0,
          activityCount: 0,
          conceptIds: new Set<string>(),
          activityIds: new Set<string>()
        });

      if (row.conceptStableId) {
        existing.conceptIds.add(row.conceptStableId);
        existing.conceptCount = existing.conceptIds.size;
      }

      if (row.activityStableId) {
        existing.activityIds.add(row.activityStableId);
        existing.activityCount = existing.activityIds.size;
      }

      projects.set(row.stableId, existing);
    }

    return Array.from(projects.values()).map((project) => ({
      stableId: project.stableId,
      title: project.title,
      description: project.description,
      status: project.status,
      conceptCount: project.conceptCount,
      activityCount: project.activityCount
    }));
  }
}
