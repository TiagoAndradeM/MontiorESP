---
name: contrato-telemetria
description: Projetar e revisar produtores, adaptadores e consumidores da telemetria do MontiorESP, preservando unidades, origem, ausencia de dados e compatibilidade.
---

# Contrato de telemetria do monitor

Skill local de projeto; ler por este caminho quando trabalhar na fronteira de dados. Não pressupor instalação global.

Antes de alterar dados, ler [contrato](../../docs/contrato-dados.md) e seu schema. Identificar versão de entrada/saída e tarefa atual. Se a referência digital estiver desconhecida, manter grandeza derivada indisponível; isso não impede implementar estrutura, mock ou tratamento de erro.

Para criar/adaptar/validar uma fonte, seguir [workflow](references/workflow.md). Exemplos sintéticos e perfis estão no contrato canônico; não manter cópias paralelas.

Invariantes: `modo` sempre visível; `null` não é zero; `rms` legado é dBFS; timestamp de aquisição pode ser desconhecido; frescor depende de nova sequência, não de sucesso HTTP repetido. A apresentação não calcula regras acústicas.

Entregar diferenças de formato, verificação executada e limitações. Mudança de significado/unidade exige atualizar versão, schema, consumidores, contexto e ADR pertinente.
