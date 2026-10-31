# ADR-006 — Interface por ambiente e controles secundários

Data: 31/10/2026. Estado: aceita pelo usuário após revisão do protótipo.

## Problema

A interface anterior destacava o nome Falcons, usava fundos verdes e separava dados/controles em cartões. O usuário pediu MONITOR SONORO, base preta/branca, menos caixas e três escolhas visíveis com acentos específicos por ambiente.

## Alternativas

- Manter o dropdown e mudar apenas as cores: não atende à seleção sempre visível.
- Criar três páginas independentes: duplicaria componentes, renderização e tratamento de dados.
- Manter uma tela com botões nativos e variáveis de tema: atende ao design e preserva a arquitetura do MVP.

## Decisão e justificativa

Uma tela com Biblioteca (`biblioteca`, verde `#18844A`), Sala de aula (`sala_aula`, azul `#2563EB`) e Laboratório/oficina (`oficina`, laranja `#EA580C`). O atributo do ambiente no `body` seleciona variáveis CSS, incluindo linha/área do gráfico, número e barra. Botões com `aria-pressed` funcionam por Tab, Enter e Espaço, sem exigir implementação de um widget de abas.

Escolher outro ambiente chama o fluxo existente de nova sessão, cancelando a fonte anterior e limpando o histórico. O tema muda imediatamente, inclusive enquanto a primeira amostra ainda não chegou. Clicar no ambiente já ativo conserva a sessão.

Os controles de demonstração ficam em um `<details>` secundário abaixo dos dados: preservam RF09 e os cenários de QA, sem competir com o dashboard. Estado sonoro e ambiente continuam informações independentes; nomes e símbolos distinguem os estados. O rótulo pequeno laranja usa `#C2410C` para contraste, mantendo o acento aprovado nos gráficos e números grandes.

## Consequências

- Reutiliza HTML, SVG, mock, contrato e renderizador, sem nova dependência de execução.
- Preserva ausência, pausa/perda/retorno, histórico limitado e dados explicitamente simulados.
- Requer conferir os três temas, teclado e transbordamento nos formatos desktop/mobile.
- Aprovação da interface não autoriza backend, firmware, merge na main ou deploy.
- Referência aprovada e evidências em [protótipo Figma](../prototipo-figma.md) e [QA](../qa.md#resultado-de-t01a--31102026).
