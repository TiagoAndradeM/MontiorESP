# ADR-004 — Stack simples e entregas pequenas

Data: 30/10/2026. Status: adotada para o MVP.

**Problema:** preparar desenvolvimento sem introduzir infraestrutura que não ajuda a demonstração acadêmica.

**Alternativas:** framework frontend e cloud desde o início; reescrever firmware/dashboard; frontend nativo, mock e backend local gradual.

**Decisão:** HTML/CSS/JavaScript com módulos ES, sem build obrigatório; Python local quando necessário; C/C++ e Arduino preservados. Polling HTTP proposto para a primeira integração. Histórico inicial somente em memória. ML e persistência são opcionais posteriores.

**Justificativa:** ferramentas básicas já estão disponíveis; a primeira entrega valida hierarquia visual, contrato e troca de fonte sem bancada. Não há requisito que justifique React, Next, Vue, nuvem ou mensageria agora.

**Consequências:** manter servidor de desenvolvimento em loopback; avaliar serviço apropriado quando chegar integração LAN. Não instalar pacotes de ML antecipadamente. Hoje criar documentação e contrato, amanhã iniciar T01.

**Reavaliar quando:** houver requisito concreto de distribuição, concorrência, retenção, autenticação ou volume que torne a solução atual insuficiente.
