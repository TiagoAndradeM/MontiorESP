# Implementar T01 — interface com dados simulados

Prompt original de T01, implementada antecipadamente em 30/10/2026 por autorização do usuário. Para evoluções, inspecione o código existente e aplique somente a mudança solicitada. Leia AGENTS.md, docs/contexto.md, docs/requisitos.md, docs/interface.md, docs/contrato-dados.md, docs/arquitetura.md, docs/ambiente.md e a linha T01 de docs/tarefas.md. Use o papel agents/interface.md e a skill local skills/contrato-telemetria/SKILL.md.

Implemente em interface/ uma tela em HTML/CSS/JavaScript com módulos ES, sem framework/build/dependência externa. Comece pela fronteira da fonte e validação do contrato; depois mock determinístico, estado, renderização e gráfico simples. Mantenha banner DADOS SIMULADOS e perfis demo explícitos. Não tocar no dashboard serial, firmware ou CSVs existentes.

Cubra ambiente manual, estado, intensidade relativa, indicador, histórico limitado e detalhes técnicos quando disponíveis. Implemente ausência, erro, duplicata, interrupção e retorno conforme requisitos. Não invente regras reais, espectro, ML ou valores de hardware.

Sirva apenas a pasta interface/ em loopback conforme docs/ambiente.md. Verifique QA01–QA10, registre evidências e limitações, atualize contexto e tarefas. Não acrescente backend, banco, Wi-Fi, ML ou deploy a esta entrega.
