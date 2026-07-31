import { AppShell } from "@/components/layout/app-shell";
import { TrackPackImporter } from "@/features/import/components/track-pack-importer";
import { getDeepSeekGenerationConfig } from "@/features/generation/infrastructure/deepseek-config.server";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  const deepSeek = getDeepSeekGenerationConfig();

  return (
    <AppShell>
      <section className="foundation-panel content-panel import-panel" aria-labelledby="import-title">
        <p className="eyebrow">Import Pack</p>
        <h1 id="import-title">Ativar catálogo</h1>
        <p>
          Cole, selecione ou carregue o Pack exemplo. O KNOW/OS sempre faz preview e bloqueia aplicação quando
          houver conflito.
        </p>

        <TrackPackImporter deepSeek={deepSeek} />
      </section>
    </AppShell>
  );
}
