# Verificação incremental

## Planejamento — T00

Conferir existência dos arquivos referenciados, leitura dos JSONs, coerência de nomes/tipos/unidades, validação estrutural de schema/exemplos e metadados das skills. Revisar requisitos contra roadmap e tarefas. Preservar byte a byte os arquivos anteriores, exceto a entrada deliberadamente acrescentada ao README. Não compilar, iniciar serviços ou operar hardware para validar documentação.

## Plano para T01 — ainda não executado

| ID | Ação | Resultado esperado | Requisito |
|---|---|---|---|
| QA01 | Abrir sem placa e sem internet | Banner simulado, seleção manual, nenhuma dependência externa | RF01/RF02/RNF01 |
| QA02 | Iniciar e trocar cenário | Atualiza a 1 Hz com dados sintéticos; estado textual e indicador coerentes | RF03/RF04/RF09 |
| QA03 | Enviar intensidade/RMS/frequência ausentes | “Indisponível”, sem zero e sem números inventados | RF04/RF06 |
| QA04 | Enviar payload malformado, enum/tipo/faixa incorretos | Rejeitar; aviso; última válida não sobrescrita | RNF05 |
| QA05 | Parar fluxo por 3 s e 10 s, depois retomar | Desatualizado → desconectado → retorno; lacuna no gráfico | RF08 |
| QA06 | Repetir sequência e enviar sequência anterior | Sem ponto duplicado e sem regressão; repetição não renova frescor | RNF05 |
| QA07 | Trocar fonte/sessão/ambiente/perfil | Limpar histórico e aguardar nova amostra; sem mistura | RF01/RF05/RF07 |
| QA08 | Rodar 10–15 min e verificar histórico | Janela limitada a 60 s e até 60 pontos no mock; sem crescimento indefinido | RF05 |
| QA09 | Navegar só por teclado em 360 px e 1280 px | Controles acessíveis, foco visível, leitura sem depender de cores, sem rolagem horizontal | RNF04 |
| QA10 | Substituir mock por fonte de teste do mesmo contrato | Componentes continuam iguais; erro/espera independem de hardware | RF07/RNF02 |

## Plano para integração — ainda não executado

- HTTP: 204 sem dados; 200 com contrato; inválido 400; versão não suportada 422; duplicata idêntica 202; conflito/fora de ordem 409; requisição expirada não se acumula.
- Adaptador serial: campo antigo `rms` é dBFS; não vira `rms_normalizado` por renomeação. Registrar origem de referência e janela. Sem confirmação da referência digital, normalizado fica `null`.
- Perda de Wi-Fi e reinício do ESP32: conexão se recupera, sessão muda, histórico não mistura sessões, nenhuma falsa leitura zero.
- Timestamp não sincronizado: `null`, ordenação por sessão/sequência/tempo ativo; não usar horário do PC como horário de aquisição.
- Bandas/FFT: validar resolução, Nyquist, perfil e soma percentual com sinal conhecido antes de mostrar como feature física.
- Regras acústicas: validar evidência e condições de coleta; limiares do protótipo não são limites legais.

## Registro de evidência

Para cada verificação futura registrar data, versão/commit quando houver, cenário, esperado, observado, resultado e limitação. Screenshot comprova aparência, não origem física do sinal. Compilação não comprova medição.

## Resultado desta sessão

Verificação local em 30/10/2026:

- 30 arquivos novos: 27 Markdown e 3 JSON; índice com finalidade de cada um.
- 79 links e âncoras locais conferidos, sem destino ausente.
- Schema validado como Draft 2020-12; dois exemplos aceitos. Quinze variações inválidas rejeitadas (tipos, escala, ausência, versão, perfis, qualidade, IDs, frequência e timestamp). Timestamp UTC válido também aceito. RMS/dBFS sintético conferido matematicamente.
- Duas skills aprovadas pelo `quick_validate.py` da skill-creator: nome, frontmatter e ausência de scaffold inacabado.
- 25 arquivos anteriores, excluindo README, conferidos por SHA-256 e preservados. O README recebeu somente o bloco de entrada do planejamento; conteúdo anterior preservado. A lista exclui metadados `.git` e saídas de compilação.
- `git diff --check` sem erro de espaços. Alterações preexistentes continuam no repositório e não foram incluídas em commit.

Procedimento pontual: [ferramentas temporárias](ambiente.md#ferramentas-de-qa). Dependências isoladas fora do repositório; sem instalação global. A revisão semântica dos documentos não substitui os testes de consumidores futuros. Nenhum cenário de interface, servidor, compilação ou hardware desta tabela foi executado nesta sessão.
