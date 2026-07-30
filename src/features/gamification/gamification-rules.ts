import type { XpSummary } from "@/db/repositories/xp-repository";
import type { DueReview } from "@/db/repositories/review-repository";
import type { MistakeRecord } from "@/db/repositories/mistake-repository";

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
}>;

export type MissionSummary = Readonly<{
  id: string;
  label: string;
  criteria: string;
  status: "available" | "complete";
  href: string;
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
        earned: xp.transactions.length > 0
      },
      {
        id: "debugger",
        label: "Debugger",
        criteria: "Aprovar uma atividade de debug.",
        earned: xp.transactions.some((transaction) => transaction.reason === "debug_activity_passed")
      },
      {
        id: "returned-stronger",
        label: "Returned Stronger",
        criteria: "Concluir uma revisão espaçada.",
        earned: xp.transactions.some((transaction) => transaction.reason === "review_completed")
      }
    ],
    missions: [
      {
        id: "continue-learning",
        label: "Continuar aprendizagem",
        criteria: "Concluir a próxima atividade recomendada.",
        status: xp.transactions.length > 0 ? "complete" : "available",
        href: "/tracks"
      },
      {
        id: "review-due",
        label: "Revisar conceitos vencidos",
        criteria: "Concluir todos os conceitos atualmente vencidos na fila de review.",
        status: dueReviews.length === 0 ? "complete" : "available",
        href: "/review"
      },
      {
        id: "resolve-mistakes",
        label: "Resolver erros ativos",
        criteria: "Corrigir erros ativos preservados em Mistakes.",
        status: activeMistakes.length === 0 ? "complete" : "available",
        href: "/mistakes"
      }
    ]
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
