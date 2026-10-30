# Tarefas e retomada

Estados: concluída, pronta, planejada, bloqueada por evidência. “Pronta” significa especificada; a execução depende do escopo pedido na sessão.

| ID | Estado em 30/10 | Tarefa e papel | Depende de | Critério de conclusão |
|---|---|---|---|---|
| T00 | Concluída | Planejamento e estrutura — arquitetura | Analisar referência antes de criar | Inventário, requisitos, comparação A/B, contrato e plano registrados; sem aplicação nova |
| T01 | Pronta para amanhã | MVP com mock — interface | T00, prompt de implementação | RF01–RF09 e QA01–QA10 executados; evidências e limitações registradas |
| T02 | Planejada | Backend mínimo + fonte HTTP — integração | T01 | Endpoints de arquitetura, validação, ausência e polling funcionam; mesma renderização |
| T03 | Bloqueada por evidência | Confirmar bancada e perfis — integração/qualidade | P01/P02/P03/P08 | Identificação de sketch/core/canal, procedimento e evidência reais registrados |
| T04 | Planejada | Adaptador serial compatível — integração | T02, T03 para uso físico | Metadados corretos, unidades, sessão e ausência preservados |
| T05 | Planejada | Wi-Fi — integração | T02, P04, tarefa explícita de firmware | Placa e host comunicam, perda/retorno validados, credenciais fora do versionamento |
| T06 | Planejada | Espectro e regras reais — integração/qualidade | P01/P02/P06, aquisição validada | Janelas, faixas e regras reproduzíveis, sem métrica inventada |
| T07 | Planejada, opcional | Persistência — arquitetura/integração | P07 | Retenção e exportação definidas antes do desenvolvimento |
| T08 | Planejada, opcional | ML — arquitetura/integração | P07, dataset | Separação treino/teste por sessões, modelo e avaliação documentados |

## Próxima tarefa recomendada

Em 31/10/2026, iniciar T01 usando [prompt do MVP](../prompts/implementar-mvp.md): contrato e validação → fonte simulada → estado → tela → verificação. Entregar somente o MVP simulado; não acumular T02–T08 no mesmo pedido por iniciativa própria.

## Evidência da entrega T00

- Referência e repositório existente analisados em leitura.
- Inventário de ferramentas documentado; sem execução de hardware ou instalação global.
- Estrutura documental e artefatos de contrato criados. Schema e exemplos validados, casos inválidos rejeitados, links e skills conferidos; evidência detalhada em [QA](qa.md).
- Firmware, dashboard serial, CSVs, lançador e alterações preexistentes preservados.

## Fechamento das próximas sessões

Registrar aqui a tarefa, status real, arquivos tocados, evidência, pendência e próximo passo. Atualizar contexto e ADRs se decisões mudarem. Não marcar uma etapa concluída apenas porque seu documento existe.
