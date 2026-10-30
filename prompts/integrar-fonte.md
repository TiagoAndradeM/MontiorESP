# Integrar uma fonte sem mudar a apresentação

Leia AGENTS.md, docs/contexto.md, docs/arquitetura.md, docs/contrato-dados.md, docs/qa.md e a tarefa solicitada em docs/tarefas.md. Identifique explicitamente qual incremento foi pedido: T02 HTTP com mock, T04 serial ou T05 Wi-Fi. Não executar os três automaticamente.

Use agents/integracao-qualidade.md e skills/contrato-telemetria/SKILL.md; para transformações de sinais, consultar também skills/validacao-acustica/SKILL.md. Inspecione os dados de entrada e documente mapeamento de campo/unidade/perfil antes de transformar.

Implemente somente a fonte/adaptador/backend necessários ao incremento escolhido, preservando contrato e componentes. Se referência ou perfil real estiverem ausentes, emitir null/indeterminado e registrar pendência; não inventar conversão. Nenhuma mudança de firmware está incluída em T02/T04.

Verifique payloads, ausência, duplicatas, ordem, reinício e reconexão no nível disponível. Declare o que foi testado com mock, replay ou hardware. Atualize contexto, tarefas e ADR se a arquitetura mudar.
