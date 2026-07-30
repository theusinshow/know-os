# KNOW/OS — Sistema de Cores

## Política de tema

KNOW/OS possui um tema editorial claro. Não existe dark mode completo.
`dimmedPaper` é uma preferência manual de conforto de leitura e não responde
automaticamente a `prefers-color-scheme`.

## Papéis

- `paper`: superfície principal de leitura;
- `panel`: agrupamento editorial;
- `desk`: fundo estrutural externo;
- `ink`: texto e estrutura principal;
- `dim`: conteúdo secundário quando houver contraste suficiente;
- `machine`: execução e saída técnica;
- `signal`: ação primária e estado atual, com uso contido;
- `success`, `warning`, `error`, `info`: reforço semântico, sempre acompanhados por texto/ícone.

## Contenção do signal

- uma CTA primária por contexto de decisão;
- item atual de navegação;
- foco editorial pontual;
- nunca colorir vários cards para “decorar”;
- não usar como sinônimo universal de sucesso.

## Superfície machine

Usada apenas quando o sistema executa, processa ou apresenta saída técnica:
editor, terminal, testes, code block, preview técnico e tooltip. Não aplicar em
páginas inteiras.

## Contraste

Cada combinação precisa ser testada contra os usos definidos. `dim` e estados
desabilitados não podem reduzir legibilidade abaixo do aceitável.
