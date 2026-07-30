import type { XpSummary } from "@/db/repositories/xp-repository";
import type { DueReview } from "@/db/repositories/review-repository";
import type { MistakeRecord } from "@/db/repositories/mistake-repository";
import type { GamificationPersistenceState } from "@/db/repositories/gamification-repository";

export type RankSummary = Readonly<{
  label: string;
  currentXp: number;
  nextRankAt: number | null;
  explanation: string;
}>;

export type BadgeSummary = Readonly<{
  id: string;
  label: string;
  criteria: string;
  earned: boolean;
  awardedAt: Date | null;
}>;

export type MissionSummary = Readonly<{
  id: string;
  label: string;
  criteria: string;
  status: "available" | "complete";
  href: string;
  completedAt: Date | null;
  persistedAt: Date | null;
}>;

export type GamificationSummary = Readonly<{
  rank: RankSummary;
  badges: BadgeSummary[];
  missions: MissionSummary[];
}>;

const rankThresholds = [
  { label: "Operator I", xp: 0 },
  { label: "Practitioner I", xp: 60 },
  { label: "Builder I", xp: 140 },
  { label: "Architect I", xp: 300 }
] as const;

export function buildGamificationSummary({
  xp,
  dueReviews,
  mistakes
}: Readonly<{
  xp: XpSummary;
  dueReviews: readonly DueReview[];
  mistakes: readonly MistakeRecord[];
}>): GamificationSummary {
  const activeMistakes = mistakes.filter((mistake) => mistake.status === "active");

  return {
    rank: calculateRank(xp.totalXp),
    badges: [
      {
        id: "first-submit",
        label: "First Submit",
        criteria: "Registrar a primeira tentativa aprovada com SUBMIT SOLUTION.",
        earned: xp.transactions.length > 0,
        awardedAt: null
      },
      {
        id: "debugger",
        label: "Debugger",
        criteria: "Aprovar uma atividade de debug.",
        earned: xp.transactions.some((transaction) => transaction.reason === "debug_activity_passed"),
        awardedAt: null
      },
      {
        id: "returned-stronger",
        label: "Returned Stronger",
        criteria: "Concluir uma revisão espaçada.",
        earned: xp.transactions.some((transaction) => transaction.reason === "review_completed"),
        awardedAt: null
      }
    ],
    missions: [
      {
        id: "continue-learning",
        label: "Continuar aprendizagem",
        criteria: "Concluir a próxima atividade recomendada.",
        status: xp.transactions.length > 0 ? "complete" : "available",
        href: "/tracks",
        completedAt: null,
        persistedAt: null
      },
      {
        id: "review-due",
        label: "Revisar conceitos vencidos",
        criteria: "Concluir todos os conceitos atualmente vencidos na fila de review.",
        status: dueReviews.length === 0 ? "complete" : "available",
        href: "/review",
        completedAt: null,
        persistedAt: null
      },
      {
        id: "resolve-mistakes",
        label: "Resolver erros ativos",
        criteria: "Corrigir erros ativos preservados em Mistakes.",
        status: activeMistakes.length === 0 ? "complete" : "available",
        href: "/mistakes",
        completedAt: null,
        persistedAt: null
      }
    ]
  };
}

export function attachGamificationPersistence(
  summary: GamificationSummary,
  persistence: GamificationPersistenceState
): GamificationSummary {
  const awardsByBadgeId = new Map(persistence.badgeAwards.map((award) => [award.badgeId, award]));
  const progressByMissionId = new Map(persistence.missionProgress.map((mission) => [mission.missionId, mission]));

  return {
    ...summary,
    badges: summary.badges.map((badge) => ({
      ...badge,
      awardedAt: awardsByBadgeId.get(badge.id)?.createdAt ?? null
    })),
    missions: summary.missions.map((mission) => {
      const persisted = progressByMissionId.get(mission.id);

      return {
        ...mission,
        completedAt: persisted?.completedAt ?? null,
        persistedAt: persisted?.updatedAt ?? null
      };
    })
  };
}

function calculateRank(totalXp: number): RankSummary {
  const current = [...rankThresholds].reverse().find((rank) => totalXp >= rank.xp) ?? rankThresholds[0];
  const next = rankThresholds.find((rank) => rank.xp > totalXp);

  return {
    label: current.label,
    currentXp: totalXp,
    nextRankAt: next?.xp ?? null,
    explanation: "Rank resume jornada por XP; não é certificação de mastery."
  };
}
