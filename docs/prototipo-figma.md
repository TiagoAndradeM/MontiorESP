# Protótipo visual no Figma

Etapa solicitada pelo usuário em 30/10/2026: ajustar o projeto no Figma antes de pedir nova implementação. O código do MVP não foi alterado durante a prototipação. Em 31/10, após a demonstração, o usuário aprovou a revisão e pediu commits no código original; a adaptação da aplicação está em andamento.

Arquivo: [MONITOR SONORO — Protótipo](https://www.figma.com/design/p2zKFdU84fims4MYEL7jRv).

| Tela | Frame | Link |
|---|---|---|
| 01 · Desktop — Monitoramento (1280 px) | `2:2`, 1280 × 1190 px | [Desktop](https://www.figma.com/design/p2zKFdU84fims4MYEL7jRv?node-id=2-2) |
| 02 · Mobile — Monitoramento (360 px) | `5:2`, 360 × 1589 px | [Mobile](https://www.figma.com/design/p2zKFdU84fims4MYEL7jRv?node-id=5-2) |

## O que foi entregue

Base do MVP importada como camadas de design com grupos, textos e gráficos, não como uma imagem única. Frames nomeados e organizados lado a lado. Captura intermediária duplicada removida. A fonte Segoe UI não estava disponível no Figma; os 169 textos que a utilizavam foram substituídos por Noto Sans para permitir edição. Essa mudança vale apenas para o design, não para o CSS do aplicativo.

O caminho de captura foi utilizado porque o plano Starter esgotou a cota do conector para inspeção/montagem via `use_figma`. A captura de UI é uma operação oficialmente isenta dessa cota e concluiu as importações. O resultado foi conferido no editor: dois frames, dimensões, camadas/textos editáveis, fontes resolvidas e composição desktop/mobile.

As telas originais da página `Page 1` são uma base visual de edição, sem navegação conectada. Os indicadores e o gráfico são exemplos sintéticos estáticos no protótipo, sem comunicação com hardware. Ainda não há biblioteca própria de componentes/variantes.

## Revisão desktop e mobile de 31/10/2026

Alterações solicitadas pelo usuário foram realizadas na página duplicada `02 · Revisão — MONITOR SONORO` (`13:2`), preservando a página original. O arquivo foi renomeado para MONITOR SONORO — Protótipo.

| Estado desktop | Frame | Acento |
|---|---|---|
| Biblioteca | `13:3` | Verde `#18844A` |
| Sala de aula | `16:9` | Azul `#2563EB` |
| Laboratório / oficina | `16:258` | Laranja `#EA580C` |

| Estado mobile (360 × 1334 px) | Frame | Acento |
|---|---|---|
| Biblioteca | `13:301` | Verde `#18844A` |
| Sala de aula | `20:524` | Azul `#2563EB` |
| Laboratório / oficina | `20:750` | Laranja `#EA580C` |

[Abrir o protótipo clicável](https://www.figma.com/proto/p2zKFdU84fims4MYEL7jRv/MONITOR-SONORO?node-id=13-3&page-id=13%3A2&scaling=scale-down&content-scaling=fixed).
[Abrir a versão mobile](https://www.figma.com/proto/p2zKFdU84fims4MYEL7jRv/MONITOR-SONORO?node-id=13-301&page-id=13%3A2&scaling=scale-down&content-scaling=fixed).

- Marca visível MONITOR SONORO; fundo branco e navegação lateral preta.
- Indicadores, linha/área do gráfico e barra de intensidade acompanham o ambiente.
- Três botões de ambiente visíveis no mesmo local do seletor anterior, com o ambiente ativo destacado.
- Retirados o painel desktop de controles da simulação e os blocos decorativos/de fonte da lateral; indicadores ampliados e contornos de cartões removidos das áreas principais.
- A versão mobile também tem os três botões visíveis, com larguras de 80/80/128 px, painel de simulação removido, contornos simplificados e altura reduzida após retirar o espaço reservado aos controles antigos.
- Doze ligações de clique conectam todos os pares de ambientes, com transição instantânea: seis por formato. Todas foram executadas na apresentação e conferidas pelos destinos dos frames. Os temas foram conferidos visualmente; imagens em `../../output/figma/monitor-sonoro-{biblioteca,sala,laboratorio}.jpg` e `monitor-sonoro-mobile-{biblioteca,sala,laboratorio}.jpg`. Esses caminhos são evidências locais fora do repositório, não arquivos versionados disponíveis em todo clone.

Esta revisão interativa cobre desktop e mobile. Os dados do Figma continuam estáticos e sintéticos: a troca demonstra navegação e identidade visual por ambiente. A aprovação visual foi concedida pelo usuário em 31/10/2026, após assistir à demonstração dos três ambientes.

## Aplicação ao código — concluída em 31/10/2026

A revisão aprovada foi aplicada ao MVP de [interface/](../interface/README.md), sem substituir o projeto ou iniciar backend, deploy ou firmware. A aplicação mantém a fonte Segoe UI e a fonte mock de dados; Noto Sans permanece uma adaptação do arquivo Figma.

A marca passa a MONITOR SONORO, com base preta/branca e três botões acessíveis de ambiente. Gráficos e indicadores usam verde `#18844A`, azul `#2563EB` e laranja `#EA580C`. Trocar ambiente ou cenário inicia nova sessão e limpa o histórico; clicar no ambiente já ativo mantém a sessão. Os controles de cenário, pausa e reinício ficam em um `<details>` secundário para preservar RF09 sem ocupar o dashboard principal.

O commit de implementação `98de808` foi enviado à branch `feat/mvp-interface-simulada`. Quinze testes passaram, além de QA visual/teclado em desktop e mobile e verificação da troca de sessão. [Evidência e limites](qa.md#resultado-de-t01a--31102026). As doze trocas no Figma documentam o protótipo; a aplicação foi conferida separadamente. O laranja dos gráficos/números permanece `#EA580C`; o rótulo pequeno ativo usa `#C2410C` para contraste.

O conector Figma continuava sem cota para nova extração via MCP; a adaptação reutilizou o HTML/SVG original e as alterações/capturas já verificadas da revisão aprovada. Não foram adicionadas imagens do protótipo como substituto do código executável.

## Continuidade combinada

1. O usuário revisa layout, cores, textos, hierarquia e organização no Figma.
2. A revisão `13:2` foi aprovada em 31/10 e sua implementação no código foi autorizada.
3. Adaptar o MVP existente, conferir o resultado executável e registrar os commits; não substituir o projeto inteiro nem iniciar backend por iniciativa própria.

A aprovação vale para a revisão `13:2` documentada acima. Mudanças posteriores no Figma não devem ser sincronizadas automaticamente para o código sem nova orientação do usuário.
