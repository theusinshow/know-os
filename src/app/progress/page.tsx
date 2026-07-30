import { AppShell } from "@/components/layout/app-shell";
import { getXpSummary } from "@/features/gamification/api";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const xp = await getXpSummary();

  return (
    <AppShell>
      <section className="foundation-panel content-panel" aria-labelledby="progress-title">
        <p className="eyebrow">Progress</p>
        <h1 id="progress-title">Progresso</h1>
        <p>XP mede esforço e jornada. Mastery continua separado e baseado em evidência de conceito.</p>

        <section className="module-section" aria-labelledby="xp-title">
          <h2 id="xp-title">XP</h2>
          <div className="mastery-panel" aria-label="XP acumulado">
            <p className="technical-label">XP LEDGER</p>
            <p className="mastery-score">
              {xp.totalXp} <span>XP</span>
            </p>
            <p className="lesson-text">{xp.transactions.length} transação registrada.</p>
          </div>
        </section>

        <section className="module-section" aria-labelledby="xp-events-title">
          <h2 id="xp-events-title">Transações</h2>
          {xp.transactions.length === 0 ? (
            <p className="lesson-text">Nenhuma transação de XP registrada.</p>
          ) : (
            <ol className="record-list" aria-label="Transações de XP">
              {xp.transactions.map((transaction) => (
                <li key={transaction.id}>
                  <div>
                    <strong>+{transaction.amount} XP</strong>
                    <span>{transaction.reason}</span>
                    <small>
                      {transaction.sourceType} · {transaction.sourceId}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </section>
    </AppShell>
  );
}
