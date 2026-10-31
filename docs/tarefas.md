# Tarefas e retomada

Estados: concluída, pronta, planejada, bloqueada por evidência. “Pronta” significa especificada; a execução depende do escopo pedido na sessão.

| ID | Estado em 30/10 | Tarefa e papel | Depende de | Critério de conclusão |
|---|---|---|---|---|
| T00 | Concluída | Planejamento e estrutura — arquitetura | Analisar referência antes de criar | Inventário, requisitos, comparação A/B, contrato e plano registrados; sem aplicação nova |
| T01 | Concluída em 30/10, antecipada pelo usuário | MVP com mock — interface | T00, prompt de implementação | RF01–RF09 cobertos; 15 testes aprovados e QA visual/teclado, com limitações registradas |
| T01A | Concluída em 31/10 | Aplicar revisão visual aprovada — interface | Aprovação do protótipo MONITOR SONORO | Marca, base preta/branca, três botões/temas, controles secundários; 15 testes e QA em 360/1280 px; commit `98de808` enviado à branch |
| T02 | Planejada | Backend mínimo + fonte HTTP — integração | T01 | Endpoints de arquitetura, validação, ausência e polling funcionam; mesma renderização |
| T03 | Bloqueada por evidência | Confirmar bancada e perfis — integração/qualidade | P01/P02/P03/P08 | Identificação de sketch/core/canal, procedimento e evidência reais registrados |
| T04 | Planejada | Adaptador serial compatível — integração | T02, T03 para uso físico | Metadados corretos, unidades, sessão e ausência preservados |
| T05 | Planejada | Wi-Fi — integração | T02, P04, tarefa explícita de firmware | Placa e host comunicam, perda/retorno validados, credenciais fora do versionamento |
| T06 | Planejada | Espectro e regras reais — integração/qualidade | P01/P02/P06, aquisição validada | Janelas, faixas e regras reproduzíveis, sem métrica inventada |
| T07 | Planejada, opcional | Persistência — arquitetura/integração | P07 | Retenção e exportação definidas antes do desenvolvimento |
| T08 | Planejada, opcional | ML — arquitetura/integração | P07, dataset | Separação treino/teste por sessões, modelo e avaliação documentados |

## Próxima tarefa recomendada

T01A foi entregue após aprovação em 31/10, com o visual aplicado ao MVP original. T02, backend local com mock e fonte HTTP, continua planejada e não deve ser iniciada automaticamente. Merge e deploy também aguardam pedido próprio.

## Evidência da entrega T00

- Referência e repositório existente analisados em leitura.
- Inventário de ferramentas documentado; sem execução de hardware ou instalação global.
- Estrutura documental e artefatos de contrato criados. Schema e exemplos validados, casos inválidos rejeitados, links e skills conferidos; evidência detalhada em [QA](qa.md).
- Firmware, dashboard serial, CSVs, lançador e alterações preexistentes preservados.

## Fechamento das próximas sessões

Registrar aqui a tarefa, status real, arquivos tocados, evidência, pendência e próximo passo. Atualizar contexto e ADRs se decisões mudarem. Não marcar uma etapa concluída apenas porque seu documento existe.

## Revisão visual em 31/10/2026

Figma: página duplicada com três estados por formato (desktop e mobile) MONITOR SONORO, base em preto/branco, menos cartões e barra de três ambientes. Verde para Biblioteca, azul para Sala de aula e laranja para Laboratório/oficina, incluindo gráficos e indicadores. Doze ligações de clique executadas e destinos conferidos; temas revisados visualmente. [Registro e links](prototipo-figma.md). Nessa etapa de prototipação, não houve alterações de aplicação, firmware ou deploy.

Depois de revisar a demonstração, o usuário aprovou o visual e pediu commits no código original. T01A foi aplicada ao MVP, com cenário, pausa e reinício em um `<details>` secundário para preservar RF09. Outro ambiente/cenário reinicia a sessão; o botão já ativo mantém o histórico. Quinze testes aprovados; temas, teclado, ausência, pausa/perda/retorno e reinício conferidos no navegador. Commit `98de808` enviado à branch original de feature. [QA detalhado](qa.md#resultado-de-t01a--31102026). Sem backend novo, deploy ou alterações de firmware.

## Evidência de T01

30/10/2026: `interface/`, `tests/`, `scripts/verificar.mjs`, `package.json` e workflows adicionados. Fonte mock e estado separados da renderização; contrato de distribuição conferido contra o canônico. Ambiente/cenário reiniciam sessão. Layout verificado em 360 e 1280 px; ausência, rejeição de JSON, pausa/desconexão e retorno observados. Histórico de 15 min e substituição de fonte verificados com relógio/fonte de teste, não com hardware. [QA detalhado](qa.md).

Commits separados em branch própria. README preparado com staging seletivo para preservar alterações anteriores. Publicação Pages preparada, não executada; firmware, dashboard serial e dados históricos não foram incorporados aos commits do MVP.
