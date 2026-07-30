import { index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { activities, concepts, lessons, tracks } from "@/db/schema/content";

export const owners = pgTable("owners", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const trackProgress = pgTable(
  "track_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id),
    completedLessons: integer("completed_lessons").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("track_progress_owner_track_idx").on(table.ownerId, table.trackId)]
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id),
    submittedActivities: integer("submitted_activities").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("lesson_progress_owner_lesson_idx").on(table.ownerId, table.lessonId)]
);

export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => owners.id),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id),
  attemptNumber: integer("attempt_number").notNull(),
  response: jsonb("response").notNull(),
  outcome: text("outcome").notNull(),
  output: jsonb("output").notNull(),
  evaluatorVersion: text("evaluator_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const conceptEvidence = pgTable(
  "concept_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    attemptId: uuid("attempt_id").references(() => attempts.id),
    type: text("type").notNull(),
    strength: integer("strength").notNull(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    conditions: jsonb("conditions").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("concept_evidence_owner_concept_idx").on(table.ownerId, table.conceptId),
    index("concept_evidence_attempt_idx").on(table.attemptId)
  ]
);

export const reviewSchedules = pgTable(
  "review_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    currentMasteryState: text("current_mastery_state").notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }).notNull(),
    reviewCount: integer("review_count").notNull().default(0),
    recentQuality: integer("recent_quality").notNull().default(0),
    policyVersion: text("policy_version").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("review_schedules_owner_concept_idx").on(table.ownerId, table.conceptId),
    index("review_schedules_owner_next_idx").on(table.ownerId, table.nextReviewAt)
  ]
);

export const mistakes = pgTable(
  "mistakes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id),
    category: text("category").notNull(),
    summary: text("summary").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true })
  },
  (table) => [
    index("mistakes_owner_status_idx").on(table.ownerId, table.status),
    index("mistakes_concept_idx").on(table.conceptId)
  ]
);

export const projectContexts = pgTable(
  "project_contexts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    stableId: text("stable_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("project_contexts_owner_stable_idx").on(table.ownerId, table.stableId)]
);

export const projectConcepts = pgTable(
  "project_concepts",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectContexts.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    source: text("source").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.conceptId] }),
    index("project_concepts_concept_idx").on(table.conceptId)
  ]
);

export const projectActivities = pgTable(
  "project_activities",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectContexts.id),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),
    source: text("source").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.activityId] }),
    index("project_activities_activity_idx").on(table.activityId)
  ]
);

export const xpTransactions = pgTable(
  "xp_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owners.id),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("xp_transactions_owner_created_idx").on(table.ownerId, table.createdAt)]
);

export const attemptTestResults = pgTable("attempt_test_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id")
    .notNull()
    .references(() => attempts.id),
  name: text("name").notNull(),
  status: text("status").notNull(),
  message: text("message")
});

export const studyEvents = pgTable("study_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => owners.id),
  type: text("type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  payload: jsonb("payload").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow()
});
