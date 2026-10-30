# Requisitos e critérios de aceite

Versão de planejamento 0.1, 30/10/2026. Prioridades: P0 essencial para o MVP simulado; P1 integração; P2 expansão. Valores de cadência e retenção abaixo são parâmetros de engenharia de software propostos, não limites acústicos.

| ID | Prioridade | Requisito | Critério verificável |
|---|---|---|---|
| RF01 | P0 | Escolher biblioteca, sala de aula ou oficina manualmente | Nome textual visível; troca inicia sessão e limpa histórico para não misturar ambientes |
| RF02 | P0 | Indicar origem e estado de conexão | Banner persistente “DADOS SIMULADOS”; replay e real também identificados |
| RF03 | P0 | Exibir estado do ambiente | Texto e ícone/cor; `indeterminado` quando regra ou dados não estiverem disponíveis |
| RF04 | P0 | Intensidade relativa 0–100 | Valor, escala e indicação “relativa”; `null` aparece como “Indisponível”, nunca zero |
| RF05 | P0 | Histórico temporal simples em memória | Últimos 60 s, até 60 pontos a 1 Hz; sem unir intervalos sem dados; limpeza ao trocar fonte/sessão/ambiente/perfil |
| RF06 | P0 | Mostrar detalhes técnicos secundários | RMS e frequência somente se presentes; unidade explícita; bandas e ML ausentes não geram números |
| RF07 | P0 | Aceitar fonte substituível | Mesmo objeto válido chega ao estado/renderização; substituir fonte não altera componentes |
| RF08 | P0 | Tratar espera, erro, perda e retorno | Sem amostras na partida; após 3 s sem nova amostra marcar desatualizado; 10 s marcar desconectado; não inserir zeros |
| RF09 | P0 | Exercitar cenários simulados repetíveis | Baixo, moderado, elevado, ausência, inválido, pausa/retorno; todos marcados como demonstração |
| RF10 | P1 | Receber indicadores da fonte física | Serial e depois Wi-Fi passam por adaptador e contrato; origem correta |
| RF11 | P1 | Mostrar alerta visual de estado | Evento demonstrativo no mock; no real apenas com perfil de regras validado; sem buzzer/serviço de notificações |
| RF12 | P2 | Histórico persistente opcional | Formato, retenção e finalidade definidos antes de escrever armazenamento |
| RF13 | P2 | Identificação por ML | Modelo versionado, confiança e classe separados do ambiente manual; nunca necessário para operar |

| ID | Requisito não funcional | Critério |
|---|---|---|
| RNF01 | Independência do hardware | T01 executa sem ESP32, serial, Wi-Fi acadêmico ou internet |
| RNF02 | Simplicidade e separação | Fonte → validação → estado → apresentação; nenhuma leitura de hardware nos componentes |
| RNF03 | Atualização previsível | Mock publica a 1 Hz; renderiza em até 1 s após recepção no computador de teste; sem polling concorrente |
| RNF04 | Acessibilidade e responsividade | Funciona por teclado a 360 px e 1280 px, sem rolagem horizontal; estados não dependem só de cor |
| RNF05 | Integridade | Contrato inválido rejeitado; duplicata não duplica ponto; sequência antiga não substitui estado atual |
| RNF06 | Proveniência e honestidade | Simulado/replay visíveis inclusive em histórico; sem dB SPL ou alegações de medição calibrada |
| RNF07 | Continuidade entre sessões | Contexto, ADRs, tarefas e QA atualizados com evidência, sem assumir testes não executados |
| RNF08 | Dados mínimos | Somente indicadores; sem áudio bruto, identificadores pessoais ou cloud no MVP |

## Escopo de hoje e exclusões

Hoje são entregues documentação, ambiente inventariado, comparação de arquiteturas, contrato e preparação de tarefas. Não são entregues interface nova, mock executável, backend novo, testes de hardware, firmware, ML, banco, nuvem ou deploy.

O dashboard serial existente continua sendo um protótipo anterior. A existência dele não torna RF01–RF13 concluídos. Plano de verificação: [QA](qa.md). Dependências e sequência: [tarefas](tarefas.md).
