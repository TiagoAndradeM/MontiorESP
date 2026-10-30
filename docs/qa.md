# Verificação incremental

## Planejamento — T00

Conferir existência dos arquivos referenciados, leitura dos JSONs, coerência de nomes/tipos/unidades, validação estrutural de schema/exemplos e metadados das skills. Revisar requisitos contra roadmap e tarefas. Preservar byte a byte os arquivos anteriores, exceto a entrada deliberadamente acrescentada ao README. Não compilar, iniciar serviços ou operar hardware para validar documentação.

## Cenários de aceite de T01

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

Procedimento pontual de T00: [ferramentas temporárias](ambiente.md#ferramentas-de-qa). Dependências isoladas fora do repositório; sem instalação global. Na etapa T00 não houve execução de interface, servidor, compilação ou hardware. T01 foi autorizada e implementada depois, ainda em 30/10/2026, conforme registro abaixo.

## Resultado de T01 — 30/10/2026

Comando reproduzível: `node scripts/verificar.mjs`, a partir da raiz do projeto. Quinze testes aprovados, sem pacotes npm, mais verificação de sintaxe e igualdade do contrato de distribuição. Validação em Node 24.22.1 local; CI configurado para Node 24.

| Cenário | Evidência obtida | Limitação |
|---|---|---|
| QA01/QA02 | HTTP 200 local, banner simulado, indicadores atualizando e cenários determinísticos; console sem erros/avisos no navegador | Sem hardware e sem uso de fontes externas; não foi desligada a conexão do sistema |
| QA03 | Cenário indisponível no navegador: intensidade “—”, RMS/frequência “Indisponível”, estado indeterminado | Sem interpretação de dado real |
| QA04 | Mensagem malformada no navegador produz erro de dados e nenhuma amostra; tipos/faixas/perfis/datas exercitados nos testes | Validador implementa o subconjunto usado no schema atual, bloqueado no CI se esse subconjunto mudar |
| QA05 | Pausa por teclado produziu “Sem conexão” e estado indeterminado; retomada voltou a “Simulador conectado” | Limite exato de 3 s exercitado por relógio controlado; 10 s e retorno também observados na UI |
| QA06 | Testes de duplicata, conflito, fora de ordem e relógio regressivo preservaram último dado e frescor | Testes lógicos; sem pacotes reais de rede |
| QA07 | Troca de ambiente para oficina no navegador reiniciou a janela; testes cobrem fonte/sessão/modo/perfis | Configuração de backend real ainda não existe |
| QA08 | 900 amostras com relógio controlado: no máximo 60 pontos; expiração após interrupção | 15 minutos simulados, não teste de 15 minutos em tempo real no navegador |
| QA09 | Inspeção visual em 360 e 1280 px; sem transbordamento horizontal; sequência de teclado ambiente → cenário → pausa e Space para pausar/retomar | Sem auditoria completa com leitor de tela ou matriz de navegadores |
| QA10 | Fonte alternativa de teste em modo replay conectada ao mesmo consumidor via `conectarFonte`; encerramento verificado | Fronteira exercitada por teste; interface HTTP/hardware não foi implementada |
| Gráfico | Testes verificam quebra por ausência, qualidade inválida e intervalo sem dados, sem conectar lacunas | Não é validação de análise acústica |

Nenhuma calibração, compilação, gravação da placa, captura sonora ou inferência ML foi executada. O GitHub Pages foi preparado por workflow manual; não houve publicação do site nesta entrega. O resultado remoto do CI deve ser conferido na branch após o push; não confundir validação local com execução no GitHub.
