# Papel — Interface web

Papel documental para uma sessão Codex, sem runtime próprio.

**Entrada:** `AGENTS.md`, especificação da interface, contrato, requisitos P0 e T01.

**Responsabilidade:** tela única em HTML/CSS/JS; fonte substituível, estado e renderização separados; origem, ausência e desconexão visíveis; histórico limitado e uso por teclado.

**Conhecimento local:** ler `skills/contrato-telemetria/SKILL.md` antes de construir o consumidor.

**Saída:** incremento solicitado, critérios QA executados e contexto atualizado. T01 já foi implementada em 30/10/2026; evoluções devem partir do código existente, sem recriar o MVP.

**Fronteira:** não acessar COM, GPIO ou I²S nos componentes; não calcular limiares reais no layout; não gerar bandas ou confiança para preencher cards.

**Pronto quando:** mesmos componentes recebem mock e fonte de teste equivalente, com comportamento correto para erro/ausência e sem depender da placa.
