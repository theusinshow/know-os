import Link from "next/link";

type FirstRunCalloutProps = Readonly<{
  title?: string;
  description?: string;
}>;

export function FirstRunCallout({
  title = "Nenhuma aula ativa.",
  description = "Ative uma trilha ou importe uma lição para liberar o fluxo de estudo."
}: FirstRunCalloutProps) {
  return (
    <div className="lesson-callout first-run-callout" role="status" aria-label="Primeiro uso">
      <span className="lesson-callout-label">Primeiro uso</span>
      <strong>{title}</strong>
      <p>{description}</p>
      <ol className="first-run-steps" aria-label="Ordem para começar">
        <li>
          <strong>1. Ativar conteúdo</strong>
          <span>Importe o Pack exemplo ou valide uma lição gerada.</span>
        </li>
        <li>
          <strong>2. Abrir a primeira aula</strong>
          <span>Leia a teoria antes de entrar nas atividades.</span>
        </li>
        <li>
          <strong>3. Praticar e registrar evidência</strong>
          <span>RUN testa sem gravar tentativa. SUBMIT SOLUTION registra progresso.</span>
        </li>
      </ol>
      <Link className="primary-action" href="/import">
        Ativar primeira aula
      </Link>
    </div>
  );
}
