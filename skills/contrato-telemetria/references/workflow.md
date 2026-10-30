# Workflow — fonte de telemetria

1. Ler a tarefa e a versão do [contrato](../../../docs/contrato-dados.md). Inspecionar produtor real ou exemplo sintético, sem assumir que nomes iguais têm a mesma unidade.
2. Montar mapa campo de origem → campo do contrato → unidade → transformação → evidência. Exemplo local crítico: `latest.rms` do dashboard antigo tem unidade dBFS; só pode alimentar `rms_dbfs`, conforme perfil documentado, não `rms_normalizado` por renomeação.
3. Preencher identificadores de fonte/sessão/sequência no produtor lógico. Sem UTC, emitir timestamp null e preservar tempo monotônico. Identificar simulação/replay explicitamente.
4. Validar estrutura e regras semânticas: presença/tipos/faixas; qualidade/perfis; Nyquist e soma de bandas quando presentes; ordem e duplicatas entre mensagens. Não inferir valores de métricas ausentes.
5. Exercitar válido, ausente, inválido, duplicata, fora de ordem, reinício e perda/retorno. Mock deve permitir esses casos sem placa.
6. Registrar evidências em QA e atualizar contexto/tarefas. Não migrar o dashboard anterior nem firmware fora da tarefa autorizada.

Perfis reais desconhecidos impedem apenas as transformações que dependem deles. Avançar no restante, mantendo null/indeterminado e pendência explícita.
