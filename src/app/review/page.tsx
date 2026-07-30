import Link from "next/link";
import { revalidatePath } from "next/cache";

import { AppShell } from "@/components/layout/app-shell";
import { completeConceptReview, getDueReviews } from "@/features/review/api";

export const dynamic = "force-dynamic";

async function completeReviewAction(formData: FormData) {
  "use server";

  const conceptId = String(formData.get("conceptId") ?? "");

  if (conceptId) {
    await completeConceptReview(conceptId, 4);
    revalidatePath("/review");
    revalidatePath(`/concepts/${conceptId}`);
  }
}

export default async function ReviewPage() {
  const dueReviews = await getDueReviews();

  return (
    <AppShell>
      <section className="foundation-panel content-panel" aria-labelledby="review-title">
        <p className="eyebrow">Review</p>
        <h1 id="review-title">Revisões de hoje</h1>
        <p>
          A fila usa apenas regras determinísticas. Cada item mostra por que entrou na revisão e atualiza a
          próxima data ao ser concluído.
        </p>

        {dueReviews.length === 0 ? (
          <div className="lesson-callout" role="status">
            <strong>Nenhuma revisão vencida.</strong>
            <span>As próximas revisões aparecem quando a agenda determinística vencer.</span>
          </div>
        ) : (
          <ol className="record-list" aria-label="Revisões vencidas">
            {dueReviews.map((review) => (
              <li key={review.conceptStableId}>
                <div>
                  <Link href={`/concepts/${review.conceptStableId}`}>
                    <strong>{review.conceptTitle}</strong>
                  </Link>
                  <span>{review.reason}</span>
                  <small>
                    {review.currentMasteryState} · {review.reviewCount} revisão registrada
                  </small>
                  <form action={completeReviewAction}>
                    <input type="hidden" name="conceptId" value={review.conceptStableId} />
                    <button className="secondary-action" type="submit">
                      CONCLUIR REVISÃO
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppShell>
  );
}
