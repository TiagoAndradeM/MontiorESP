# Análise da referência e adaptação

Análise em 30/10/2026, antes da criação desta estrutura. Referência local: `C:/Users/tiago/Downloads/Aulas 02 e 03/alura-imersao-dev-agy-main`. A pasta foi somente lida.

## O que foi encontrado

| Arquivo/pasta da referência | Papel observado | Adaptação |
|---|---|---|
| `AGENTS.md` | Goal, Context, Constraints e Done-when orientam a IA antes de gerar código | Entrada central deste repositório, com estado e fronteiras da etapa |
| `README.md` | Sequência de preparação, prompts de criação, testes e evolução | Preservar README técnico existente e adicionar entrada para documentação |
| `skills/plano-de-estudos/SKILL.md` | Frontmatter, ativação e pré-requisitos; recursos lidos sob demanda | Duas skills específicas do monitor |
| `references/workflow.md` | Diagnóstico → decomposição → execução → checkpoints → replanejamento | Planejar → definir contrato → implementar pequeno incremento → verificar → atualizar contexto |
| `references/tecnicas.md` | Conhecimento especializado separado das instruções gerais | Procedimento acústico específico, sem copiar o conteúdo de estudos |
| `references/salvar_agenda.md` | Instruções operacionais e verificação do resultado salvo | Conferência de arquivos, contratos e evidências |
| `assets/plano_template.md`, `assets/exemplo_plano.md` | Modelo de saída e exemplo identificado | Template de ADR e exemplos JSON explicitamente sintéticos |
| `.gitignore` | Separação de segredos, ambiente e saídas | Regra útil; não copiar exclusões específicas de ADK ou ocultar CSVs existentes |

O padrão é desenvolvimento assistido por IA orientado por contexto, skills com divulgação progressiva e critérios explícitos de conclusão. A referência não contém uma arquitetura pronta de aplicação, pasta independente de prompts, ADRs, roadmap versionado ou equipe de múltiplos agentes. Esses elementos são adaptações necessárias ao monitor, e não estruturas alegadamente encontradas nela.

## Como as partes se relacionam

`AGENTS.md` fornece objetivo e restrições; o contexto registra fatos e hipóteses; o planejamento escolhe a entrega; o papel delimita responsabilidade; a skill fornece procedimento; o prompt inicia uma tarefa; contrato e ADRs limitam as escolhas; QA produz evidência; o contexto é atualizado.

Nomes novos: minúsculas, sem acentos, palavras separadas por hífen. Exceções: `AGENTS.md`, `README.md`, `SKILL.md` e nomes históricos preservados. Markdown concentra orientação; JSON descreve o contrato, sem executar a aplicação.

## O que não copiar

Google ADK, Antigravity, Cloud Shell, faturamento Google, Gemini, EnvironmentToolset, `uv`, autenticação e importação de agenda atendem ao agente de estudos. Não atendem ao monitor. A duplicação da skill em duas pastas existe por empacotamento ADK e não será reproduzida. A configuração de permissões do tutorial também não é uma regra para este projeto.

## Estrutura adotada

`AGENTS.md` → entrada; `docs/` → contexto, ambiente, requisitos, arquitetura, interface, contrato, decisões, roteiro e verificação; `agents/` → três papéis documentais; `skills/` → dois procedimentos; `prompts/` → quatro tarefas reutilizáveis. O índice em [README](README.md) explica cada arquivo.

Não criar diretórios vazios de aplicação. A estrutura de código de amanhã é uma proposta em [arquitetura](arquitetura.md), ainda não implementada.
