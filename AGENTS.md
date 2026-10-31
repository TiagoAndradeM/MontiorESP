# Monitor Inteligente de Poluição Sonora

## Goal

Construir um monitor acadêmico de baixo custo para biblioteca, sala de aula e oficina/laboratório. Fluxo: som → aquisição → processamento → indicadores → comunicação → interface.

## Context

- Falar em português do Brasil, explicando as decisões de forma objetiva.
- Raiz do projeto: esta pasta `MontiorESP`. Preservar esse nome histórico.
- Ler primeiro [estado atual](docs/contexto.md), [requisitos](docs/requisitos.md), [roadmap](docs/roadmap.md) e [tarefas](docs/tarefas.md).
- Ler [arquitetura](docs/arquitetura.md), [contrato](docs/contrato-dados.md) e ADRs relacionados antes de alterar integrações.
- Em 30/10/2026, o planejamento foi concluído e o usuário autorizou antecipar T01: implementar o MVP simulado e integrar Git/GitHub com commits estruturados. A data prevista anteriormente para desenvolvimento não é um bloqueio.
- Em 31/10/2026, o usuário aprovou a revisão MONITOR SONORO no Figma e autorizou aplicá-la ao código original com commits estruturados. T01A foi implementada e validada em `interface/`; a pausa para revisão do design foi encerrada. T02, merge na main, deploy e firmware continuam dependendo de tarefa própria.
- Já existem firmware, dashboard serial e CSVs. Não tratar o repositório como vazio, nem apresentar o novo planejamento como software implementado.

## Constraints

- HTML/CSS/JavaScript sem framework no frontend; C/C++ e Arduino no firmware; Python local quando houver backend.
- Usar fonte simulada antes da integração física. A apresentação consome indicadores processados pelo mesmo contrato.
- Identificar sempre `simulado`, `real` ou `replay`. Exemplo sintético não é evidência de bancada.
- Não usar dB SPL, limites legais, classificação de risco ou alegações de calibração sem evidência apropriada. dBFS é uma referência digital distinta.
- Não transportar áudio bruto no MVP. Sem ML, banco, cloud, deploy ou mudanças no firmware nesta etapa.
- Intensidade 0–100 e estado dependem de perfis documentados; não reaproveitar automaticamente os limiares antigos dos LEDs.
- Respeitar alterações preexistentes. Commits e push do planejamento/MVP estão autorizados em branch própria; incluir somente arquivos/hunks da entrega. Não fazer reset, descarte, merge na main, upload de firmware ou instalação global por iniciativa própria.
- Consultar [pendências](docs/contexto.md#decisoes-abertas) antes de tratar hipóteses como fatos. Confirmar canal I²S e core por sketch antes de qualquer upload futuro.

## Papéis e skills

Papéis documentais, sem agentes de execução criados automaticamente: [arquitetura](agents/arquitetura.md), [interface](agents/interface.md), [integração e qualidade](agents/integracao-qualidade.md).

Skills locais são lidas pelo caminho indicado; não pressupor instalação ou descoberta automática pelo Codex:

- [contrato-telemetria](skills/contrato-telemetria/SKILL.md): projetar/revisar produtores e consumidores.
- [validacao-acustica](skills/validacao-acustica/SKILL.md): distinguir grandezas e evidências de sinais.

Carregar referências apenas quando relevantes. Prompts de retomada e execução estão em [prompts](docs/README.md#prompts).

## Done-when

- Cada tarefa tem escopo, dependências, critério de aceite e evidência de verificação.
- Mudanças de decisão ficam em ADR, com problema → alternativas → decisão → justificativa → consequências.
- A sessão atualiza contexto e tarefas com o que realmente foi concluído, sem marcar teste físico não executado.
- Implementações futuras preservam origem dos dados, campos ausentes, perda de conexão e compatibilidade do contrato.
