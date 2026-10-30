# Contexto e estado atual

Atualizado em 30/10/2026, America/Sao_Paulo. Etapa: planejamento de software ao redor do firmware. Hoje: ambiente, requisitos e arquitetura. Amanhã, 31/10: primeiro incremento de desenvolvimento, conforme tarefa solicitada na sessão.

## Objetivo e limites

Monitor de baixo custo para ambientes acadêmicos: biblioteca, sala de aula e oficina/laboratório. Hardware informado: ESP32 DEVKIT V1, INMP441, protoboard, LEDs e Wi-Fi futuro. Interface deve funcionar sem placa, recebendo indicadores já processados. Não é instrumento calibrado de avaliação de exposição sonora.

## Evidência existente

| Elemento | Evidência lida em disco | Limite da conclusão |
|---|---|---|
| Firmware | Sketches V01, V02 LEDs, V03 filtro, diagnósticos e testes | Existência do código não comprova que esta versão está carregada |
| V03 | 16 kHz, blocos de 512, relatório a cada 4096 amostras, RMS/pico dBFS, filtro e histerese | Não calcula FFT ou identificação de ambiente; nenhuma recompilação ou prova física nesta sessão |
| Dashboard | `Dashboard_Tempo_Real/app.py`, `index.html`, README | Ponte serial Python, `/api/state`, CSV e replay já existem; ainda não seguem o novo contrato |
| Histórico | Arquivos CSV em `dados/` | Dados preexistentes; não reinterpretados como novas medições nem usados para inventar perfis |
| Git | Repositório em `MontiorESP/.git`, com alterações e arquivos não rastreados anteriores | Não descartar, incluir em commit ou reorganizar automaticamente |

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
- Nenhum limiar real novo nem conversão de dBFS para dB SPL foi definido.

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

## Retomada

Ler [tarefas](tarefas.md). Não transformar pendências em fatos. Ao encerrar nova sessão, registrar entrega, arquivos tocados, verificações, limitações e próxima tarefa. Não copiar dados pessoais ou credenciais para documentos.
