import { AppShell } from "@/components/layout/app-shell";
import { listHistoryEvents } from "@/features/history/api";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const events = await safeListEvents();

  return (
    <AppShell>
      <section className="foundation-panel content-panel" aria-labelledby="history-title">
        <p className="eyebrow">Histórico</p>
        <h1 id="history-title">Eventos</h1>
        {events.status === "not_configured" ? (
          <p>Configure `DATABASE_URL` ou use `pglite://memory` em desenvolvimento para ler o histórico.</p>
        ) : events.items.length === 0 ? (
          <p>Nenhum evento registrado. RUN não cria tentativa; SUBMIT registra a primeira entrada oficial.</p>
        ) : (
          <ol className="record-list" aria-label="Eventos de estudo">
            {events.items.map((event) => (
              <li key={event.id}>
                <div>
                  <strong>{event.type}</strong>
                  <span>
                    {event.entityType}: {event.entityId}
                  </span>
                  <small>{new Date(event.occurredAt).toLocaleString("pt-BR")}</small>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppShell>
  );
}

async function safeListEvents() {
  try {
    return { status: "ok" as const, items: await listHistoryEvents() };
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_URL is not configured") {
      return { status: "not_configured" as const, items: [] };
    }

    throw error;
  }
}
