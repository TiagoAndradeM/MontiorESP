# Contexto e estado atual

Atualizado em 10/11/2026, America/Sao_Paulo. Planejamento e T01 foram concluídos em 30/10, com MVP simulado, Git/GitHub e commits estruturados. Em 31/10, o usuário aprovou a revisão visual no Figma e autorizou aplicá-la ao código original com novos commits.

Direção mais recente: revisão aprovada aplicada em `interface/`, preservando o mock e o contrato existentes. Arquivo: [MONITOR SONORO — Protótipo](https://www.figma.com/design/p2zKFdU84fims4MYEL7jRv). A página de revisão `13:2` tem três estados por formato (desktop e mobile); as bases originais `2:2` e `5:2` foram preservadas. A aplicação tem base preta/branca, três botões acessíveis e temas `#18844A`, `#2563EB` e `#EA580C`; controles da simulação recolhidos em `<details>` preservam RF09. T01A passou nos 15 testes e na conferência visual/teclado em 360 e 1280 px. Commit de implementação `98de808`, enviado à branch `feat/mvp-interface-simulada`. A fonte da aplicação permanece Segoe UI. Ver [protótipo Figma](prototipo-figma.md), [ADR-006](decisoes/006-interface-por-ambiente.md) e [QA](qa.md#resultado-de-t01a--31102026). Nenhum merge, deploy ou firmware foi executado.

Em 05/11, T01B corrigiu e validou a inicialização: os três botões permanecem habilitados, com seleção de tema no bootstrap clássico separada dos módulos de dados. Contrato: prazo de 6 s para HTTP/JSON; módulos: watchdog de 10 s, alerta e botão de nova tentativa. O lançador `Iniciar_Interface.cmd` inicia um servidor estático local com raiz absoluta em `interface/`, MIME explícito de JS/JSON e `Cache-Control: no-store`. Passaram 30 testes Node e 5 Python; no navegador integrado, foram conferidos os ambientes, falhas/atrasos e recuperação. Ver [QA da correção](qa.md#correcao-de-inicializacao--05112026). Esse servidor estático não implementa T02 nem integração com hardware.

## Objetivo e limites

Monitor de baixo custo para ambientes acadêmicos: biblioteca, sala de aula e oficina/laboratório. Hardware informado: ESP32 DEVKIT V1, INMP441, protoboard, LEDs e Wi-Fi futuro. Interface deve funcionar sem placa, recebendo indicadores já processados. Não é instrumento calibrado de avaliação de exposição sonora.

## Evidência existente

| Elemento | Evidência lida em disco | Limite da conclusão |
|---|---|---|
| Firmware | Sketches V01, V02 LEDs, V03 filtro, diagnósticos e testes | Existência do código não comprova que esta versão está carregada |
| V03 | 16 kHz, blocos de 512, relatório a cada 4096 amostras, RMS/pico dBFS, filtro e histerese | Não calcula FFT ou identificação de ambiente; nenhuma recompilação ou prova física nesta sessão |
| Dashboard | `Dashboard_Tempo_Real/app.py`, `index.html`, README | Ponte serial Python, `/api/state`, CSV e replay já existem; ainda não seguem o novo contrato |
| Histórico | Arquivos CSV em `dados/` | Dados preexistentes; não reinterpretados como novas medições nem usados para inventar perfis |
| Git | Branch `feat/mvp-interface-simulada` a partir de `43343e1`; commits do planejamento/MVP separados | V02 de referência, capturador e guia de coleta foram publicados; V03, dashboard, CSVs e vídeo continuam fora dos commits |
| Novo MVP | `interface/`, módulos JS nativos, mock 1 Hz, histórico 60 s, tratamento de falhas e dados ausentes | Somente simulado; não recebe serial/Wi-Fi nem executa ML |
| Revisão visual aprovada | Figma `13:2` aplicado à interface; 15 testes e QA visual/teclado aprovados | Interface simulada; nenhum teste físico |
| Validação | 15 testes nativos Node, incluindo 15 min de relógio simulado; QA no navegador | Teste lógico/visual não comprova aquisição física |
| Correção de inicialização em 05/11 | 30 testes Node e 5 testes Python aprovados; ambientes, falhas, atrasos e recuperação conferidos no navegador integrado | Interface simulada; sem teste físico ou auditoria de múltiplos navegadores |
| Deploy | CI automático e publicação manual da main preparados para GitHub Pages | Site ainda não publicado; precisa integrar branch e habilitar Pages |

O README descreve V02 como validada em bancada e V03 como proposta de estabilização ainda dependente de teste. Essas são declarações da documentação anterior, não validações feitas hoje.

## Divergências relevantes

- V01 e seu documento de pinagem descrevem canal esquerdo; V03 usa `I2S_CHANNEL_FMT_ONLY_RIGHT`, com comentário sobre diagnóstico no segundo slot. Não alterar L/R nem escolher um canal por dedução. Identificar a montagem e o sketch efetivamente usados antes de integrar.
- O core 3.3.12 está instalado. V01 usa `ESP_I2S.h`; V03 usa `driver/i2s.h`. A compatibilidade deve ser verificada por sketch; o registro antigo de compilação de V01 não se estende a V03.
- Pinos atuais documentados para V02/V03: SCK 26, WS 25, SD 33; LEDs 18/19/23. O teste Feature28 conserva outra pinagem. Não trocar automaticamente.
- O campo `rms` do dashboard antigo é dBFS. O contrato novo diferencia `rms_normalizado` e `rms_dbfs`; renomear sem converter seria incorreto.

## Decisões estabelecidas nesta etapa

- Planejamento primeiro; novo MVP simulado, sem hardware, framework ou instalação global.
- Contrato proposto 0.1.0, com origem explícita, ausência como `null`, sessão/sequência e unidades.
- Rota recomendada: simulador no navegador → backend Python local → integração física; arquitetura A permanece alternativa para demonstração autônoma.
- Ambiente escolhido manualmente no MVP; ML e armazenamento persistente são expansões.
- Revisão visual aprovada: base preta/branca, três botões de ambiente visíveis e cores de gráficos/indicadores por ambiente. Trocar ambiente ou cenário reinicia sessão/histórico; clicar no ambiente já ativo mantém a sessão. Controles de demonstração ficam recolhidos em área secundária.
- Nenhum limiar real novo nem conversão de dBFS para dB SPL foi definido.
- Em 05/11, o usuário confirmou para uma etapa futura a orientação do professor: **nove LEDs, três por faixa de baixas, médias e altas frequências**, com energia por banda calculada via FFT. Ver [ADR-007](decisoes/007-nove-leds-por-faixa.md). Sem alteração de firmware nesta sessão.

## Decisoes abertas

| ID | Questão | Como resolver | Bloqueia |
|---|---|---|---|
| P01 | Intensidade relativa: perfil e referência digital | Documentar normalização, referência e comparabilidade com evidência de aquisição | Indicador real; não o mock |
| P02 | Limiares/histerese por ambiente | Coleta planejada, critérios acadêmicos e avaliação dos resultados | Estados reais; não estados sintéticos |
| P03 | Canal I²S, L/R e versão física em uso | Conferir bancada e sketch carregado; registrar resultado | Integração da placa |
| P04 | Rede acadêmica permite comunicação local? | Testar isolamento entre clientes, credenciais e endereço do host | Wi-Fi real; mock/serial independem |
| P05 | Necessidade de apresentação sem computador | Confirmar requisito de demonstração | Pode mudar recomendação B para A |
| P06 | Frequência, FFT e bandas | Definir janela, resolução, faixas, normalização e orçamento de processamento | Campos espectrais reais |
| P07 | Históricos persistentes e ML | Definir retenção, finalidade, dataset e critério de sucesso | Expansões posteriores |
| P08 | Compatibilidade V03/core instalado | Compilar uma cópia controlada quando houver tarefa de firmware | Alteração/upload futuro |
| P09 | Implementação física dos nove LEDs | Definir GPIOs, resistores, alimentação/corrente e padrão de acionamento dos três LEDs por faixa | Adaptação do hardware |

## Retomada

Em 10/11/2026, para permitir que outra pessoa faça a captura na biblioteca, foram publicados na branch o [guia rápido](guia-coleta-biblioteca.md) e o sketch V02 de referência, junto do capturador CSV já existente. Isso prepara o compartilhamento do repositório, **não comprova nova coleta**, compilação ou upload de firmware nesta sessão. Os CSVs locais não foram publicados.

Em 31/10/2026, foi preparado o [plano de coletas de 3/11](plano-coletas-ambientes-2026-11-03.md): piloto de 10 minutos por ambiente com o capturador serial existente, ficha de campo e repetições independentes propostas. **Nenhuma coleta física foi executada nesta etapa**; os perfis por ambiente, canal I²S da montagem atual e classificação continuam pendentes de evidência.

Ler [tarefas](tarefas.md). Não transformar pendências em fatos. Ao encerrar nova sessão, registrar entrega, arquivos tocados, verificações, limitações e próxima tarefa. Não copiar dados pessoais ou credenciais para documentos.

Para executar o MVP: abrir `Iniciar_Interface.cmd` na raiz ou rodar `python -B scripts/servir-interface.py`; manter a janela aberta e acessar `http://127.0.0.1:8000/`. Porta alternativa: `--port 8001`. Para validar: na raiz do projeto, `node scripts/verificar.mjs` e `python -B -m unittest discover -s tests -p test_servidor_interface.py -v`. T01B foi conferida; T02, backend local com mock e fonte HTTP, continua um incremento separado. O plano de [deploy](deploy.md) pode ser executado como tarefa própria depois de revisar/integrar a branch.
