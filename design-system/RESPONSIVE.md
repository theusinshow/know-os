# KNOW/OS — Responsividade

## Breakpoints canônicos

Consumir os tokens `breakpoint.*`. O layout é desktop-first para programação,
mas todas as funções essenciais precisam de composição mobile equivalente.

## Wide desktop

Sidebar persistente, workspace amplo e painel contextual opcional. Programming
Lab em split. Knowledge Map em grafo + painel.

## Desktop

Sidebar persistente ou recolhível. Painel contextual pode virar drawer. Tabelas
comuns permanecem tabulares quando legíveis.

## Tablet

Sidebar vira drawer. Alvos de toque aumentam. Editor e terminal empilham ou usam
tabs conforme largura disponível. Densidade compacta desativada.

## Mobile

Uma região principal por vez. Navegação recomposta. Ações secundárias vão para
menu/drawer; CTA da etapa pode ficar fixa quando necessário.

Recomposições obrigatórias:

- Knowledge Map → lista hierárquica pesquisável;
- diff lado a lado → blocos empilhados;
- editor + terminal → tabs exclusivas;
- tabelas comuns → cards/blocos por registro;
- painel contextual → drawer;
- command palette → tela/overlay quase integral.

## Exceção técnica

Código, terminal, stack trace, matriz e diff podem preservar largura semântica
com overflow controlado, tabs ou viewport interno. Isso não autoriza tabelas de
dados comuns a rolarem horizontalmente.
