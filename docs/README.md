# Planejamento — Monitor Inteligente de Poluição Sonora

Em 30/10/2026: planejamento concluído e, por pedido do usuário, desenvolvimento de T01 antecipado. O MVP simulado já funciona em `interface/`, com testes, commits estruturados e workflows GitHub preparados. Backend, hardware e publicação do site continuam em etapas próprias.

## Como começar uma nova sessão

Ler [AGENTS.md](../AGENTS.md), [contexto](contexto.md), [requisitos](requisitos.md), [tarefas](tarefas.md) e [roadmap](roadmap.md). Depois abrir somente os documentos e skills da tarefa. Fonte da adaptação metodológica: [análise da referência](metodologia.md).

Recomendação: mock no navegador primeiro; backend Python local na integração; HTML/CSS/JS sem framework. A alternativa de hospedar a tela no ESP32 foi comparada, mas não é a rota inicial recomendada. Os sketches, CSVs e dashboard serial anteriores continuam preservados.

Para usar o que foi implementado, começar pelo [README da interface](../interface/README.md). Na raiz, `node scripts/verificar.mjs` executa as verificações. [Deploy e GitHub](deploy.md) explicam publicação manual e o CI.

**Etapa atual:** em 31/10/2026, o usuário aprovou o [protótipo MONITOR SONORO](prototipo-figma.md). T01A está implementada em `interface/`, com três temas, botões de ambiente e controles secundários. [QA](qa.md#resultado-de-t01a--31102026) registra a validação local. Backend, merge e deploy continuam em tarefas próprias.

## Estrutura e finalidade de cada arquivo novo

| Arquivo | Finalidade |
|---|---|
| [AGENTS.md](../AGENTS.md) | Entrada de contexto, restrições, papéis, skills e critérios de conclusão |
| [docs/README.md](README.md) | Índice e orientação de retomada |
| [metodologia.md](metodologia.md) | Evidência da referência, práticas reaproveitadas e adaptações |
| [contexto.md](contexto.md) | Estado real, legado, divergências e decisões abertas |
| [ambiente.md](ambiente.md) | Ferramentas observadas e procedimento local de desenvolvimento |
| [requisitos.md](requisitos.md) | Requisitos funcionais/não funcionais com prioridade e aceite |
| [arquitetura.md](arquitetura.md) | Comparação A/B, recomendação, fronteiras e HTTP futuro |
| [interface.md](interface.md) | Hierarquia visual, componentes, estados e roteiro de mock |
| [prototipo-figma.md](prototipo-figma.md) | Histórico do protótipo, frames aprovados e adaptação ao código |
| [ADR-006](decisoes/006-interface-por-ambiente.md) | Temas por ambiente, seleção acessível e controles secundários |
| [contrato-dados.md](contrato-dados.md) | Campos, tipos, unidades, origem, obrigatoriedade e regras semânticas |
| [telemetria.schema.json](contratos/telemetria.schema.json) | Especificação estrutural JSON Schema 2020-12, proposta 0.1.0 |
| [exemplo-simulado.json](contratos/exemplo-simulado.json) | Exemplo sintético com perfis de demonstração; sem medição real |
| [exemplo-indisponivel.json](contratos/exemplo-indisponivel.json) | Exemplo sintético com ausência explícita e estado indeterminado |
| [roadmap.md](roadmap.md) | Incrementos da nova camada, separados das versões de firmware |
| [tarefas.md](tarefas.md) | Fila, dependências, responsáveis e próxima entrega |
| [qa.md](qa.md) | Verificação de planejamento e plano de testes por incremento |
| [ADR-001](decisoes/001-arquitetura.md) | Mock primeiro e evolução para backend local |
| [ADR-002](decisoes/002-contrato-e-fontes.md) | Contrato versionado e adaptadores |
| [ADR-003](decisoes/003-grandezas-e-regras.md) | Grandezas digitais, perfis e ausência de calibração |
| [ADR-004](decisoes/004-stack-e-incrementos.md) | Stack simples e entregas pequenas |
| [template.md](decisoes/template.md) | Modelo reutilizável de decisão técnica |
| [deploy.md](deploy.md) | Versionamento, CI, publicação estática e evolução do backend |
| [ADR-005](decisoes/005-deploy-e-versionamento.md) | Branch por incremento e deploy manual do mock |

## Arquivos implementados em T01

| Arquivo | Finalidade |
|---|---|
| [interface/README.md](../interface/README.md) | Execução, organização e limitações do MVP |
| [interface/index.html](../interface/index.html) | Tela acessível em português, com origem e controles |
| [interface/styles.css](../interface/styles.css) | Visual MONITOR SONORO, temas por ambiente e layouts desktop/mobile |
| [interface/favicon.svg](../interface/favicon.svg) | Identidade visual local, sem asset externo |
| [interface/js/app.js](../interface/js/app.js) | Ligação entre controles, fonte e apresentação |
| [interface/js/validacao.js](../interface/js/validacao.js) | Validação estrutural e semântica da telemetria |
| [interface/js/estado.js](../interface/js/estado.js) | Sessões, ordem, frescor, histórico e fronteira de fonte |
| [interface/js/fontes/mock.js](../interface/js/fontes/mock.js) | Roteiros sintéticos determinísticos a 1 Hz |
| [interface/js/componentes.js](../interface/js/componentes.js) | Renderização e gráfico SVG com lacunas |
| [interface/contratos/telemetria.schema.json](../interface/contratos/telemetria.schema.json) | Cópia de distribuição conferida contra o contrato canônico |
| [package.json](../package.json) | Comandos de desenvolvimento sem dependências npm |
| [tests/telemetria.test.mjs](../tests/telemetria.test.mjs) | Contrato, cenários, frescor, contexto e troca de fonte |
| [tests/grafico.test.mjs](../tests/grafico.test.mjs) | Lacunas e escala do gráfico |
| [scripts/verificar.mjs](../scripts/verificar.mjs) | Verificação única reproduzível local e no CI |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | Validação automática de push/PR |
| [.github/workflows/deploy-pages.yml](../.github/workflows/deploy-pages.yml) | Publicação manual da main, somente interface/ |

## Papéis

| Arquivo | Responsabilidade |
|---|---|
| [agents/arquitetura.md](../agents/arquitetura.md) | Requisitos, incrementos, decisões e fronteiras |
| [agents/interface.md](../agents/interface.md) | Tela e experiência com fonte desacoplada |
| [agents/integracao-qualidade.md](../agents/integracao-qualidade.md) | Backend/adaptadores, sinais e verificação |

São papéis documentais para futuras sessões, não processos autônomos ou agentes já iniciados.

## Skills locais

| Arquivo | Função |
|---|---|
| [contrato-telemetria/SKILL.md](../skills/contrato-telemetria/SKILL.md) | Orientar produtores, adaptadores e consumidores sem perder semântica |
| [references/workflow.md](../skills/contrato-telemetria/references/workflow.md) | Mapear origem, transformar e verificar contratos sob demanda |
| [validacao-acustica/SKILL.md](../skills/validacao-acustica/SKILL.md) | Distinguir RMS, dBFS, espectro e evidência física |

Seguem o padrão `skills/nome/SKILL.md` observado na referência. São recursos deste projeto; leitura explícita pelo caminho indicado em AGENTS.md, sem supor descoberta automática ou instalação global. Não criamos skills genéricas de Python, APIs ou ML sem tarefa concreta.

## Prompts

| Arquivo | Quando usar |
|---|---|
| [retomar-planejamento.md](../prompts/retomar-planejamento.md) | Refinar ambiente, requisitos e arquitetura sem implementar |
| [implementar-mvp.md](../prompts/implementar-mvp.md) | Iniciar T01 com dados simulados e verificar os requisitos P0 |
| [integrar-fonte.md](../prompts/integrar-fonte.md) | Implementar um incremento HTTP/serial/Wi-Fi previamente escolhido |
| [revisar-entrega.md](../prompts/revisar-entrega.md) | Revisar o incremento e suas evidências |

## MVP e sequência

Tela única com ambiente manual, estado, intensidade relativa, indicador visual, histórico de 60 segundos e detalhes técnicos disponíveis. Mock identificado e substituível. Ausência e perda de conexão fazem parte do aceite. Sem dB SPL, ML ou persistência no primeiro incremento.

S0.1 planejamento → S0.2 mock → S0.3 HTTP local → S0.4 serial opcional → S0.5 Wi-Fi → S0.6 espectro/perfis → S1.0 integrado. Persistência S0.7 e ML S0.8 são opcionais.

Pendências: referências e perfis reais, limiares por ambiente, canal/versão da bancada, compatibilidade V03/core, rede, autonomia sem host e definição espectral. Elas estão detalhadas em [contexto](contexto.md#decisoes-abertas) e não bloqueiam o mock.

Próxima tarefa recomendada: T02, backend local e fonte HTTP, conforme [prompt de integração](../prompts/integrar-fonte.md). Revisão/merge da branch e primeiro deploy são tarefas separadas. Para evidência das verificações, consultar [QA](qa.md).

Arquivo existente alterado nesta entrega: [README principal](../README.md), somente para adicionar a entrada desta documentação. Demais mudanças anteriores do repositório não fazem parte deste planejamento.
