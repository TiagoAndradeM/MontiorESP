# Roadmap incremental

As versões abaixo são da nova camada de software, independentes dos sketches V01/V02/V03. Somente as duas primeiras etapas têm referência de dia; não há promessa de concluir toda a integração amanhã.

| Marco | Quando/condição | Entrega | Saída verificável |
|---|---|---|---|
| S0.1 — Base de planejamento | Hoje, 30/10/2026 | Ambiente, requisitos, arquitetura, contrato, papéis, skills e prompts | Documentação coerente, arquivos locais e contrato verificáveis; sem implementação nova |
| S0.2 — MVP simulado | Concluído em 30/10/2026, antecipado pelo usuário | Tela única, fonte mock e estado em memória | 15 testes aprovados; QA no navegador, sem placa |
| S0.3 — Fronteira HTTP | Depois de S0.2 | Backend local com mock pelo mesmo contrato; fonte HTTP | Mesmo layout, endpoints e cadência verificados; nada de banco |
| S0.4 — Integração real de transição | Após confirmar P01/P03/P08 | Adaptador serial opcional para indicadores disponíveis | Nenhum mapeamento de dBFS para RMS linear incorreto; sem inventar métricas |
| S0.5 — Integração Wi-Fi | Após P04 e definição da comunicação | ESP32 → host Python; mesmos contratos e componentes | Reconexão, sessão, duplicatas e perda verificadas no hardware |
| S0.6 — Espectro e perfis | Após protocolo de aquisição e coleta | Frequência/bandas e regras de estado com evidência | Perfis documentados e comparáveis; sem SPL não calibrado |
| S0.7 — Histórico opcional | Se requisito de retenção justificar | Persistência/exportação compatível | Reinício, integridade, retenção e origem verificados |
| S0.8 — Classificação opcional | Se houver dataset e tempo acadêmico | ML separado da seleção manual e do estado | Modelo versionado e avaliação fora das sessões de treino |
| S1.0 — Demonstração integrada | Após marcos obrigatórios | MVP acadêmico integrado e roteiro de demonstração | Aquisição, comunicação, interface e recuperação verificadas; limitações explícitas |

S0.7 e S0.8 são opcionais e não bloqueiam S1.0. Sequência pode ser revista em ADR quando requisitos mudarem. Se regras reais não estiverem validadas, a demonstração pode mostrar indicadores com estado indeterminado, declarando essa limitação; não alegar que a classificação foi concluída.

Git/GitHub: commits por incremento em branch própria, CI automático e deploy estático manual preparados. Publicação da demonstração é uma tarefa separada; não substitui S0.3–S0.6. Ver [deploy](deploy.md).
