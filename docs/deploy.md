# Git, GitHub e estratégia de deploy

Decisão de 30/10/2026, após o usuário autorizar iniciar o MVP e pedir integração com Git/GitHub. Publicação do site não foi solicitada nesta etapa; o fluxo fica pronto para uso manual. [ADR-005](decisoes/005-deploy-e-versionamento.md).

## Caminho por etapa

| Etapa | Execução/publicação | O que é disponibilizado |
|---|---|---|
| Desenvolvimento | Python servindo somente `interface/` em loopback | MVP simulado no navegador, sem rede externa |
| Revisão | Branch de feature no GitHub + CI | Código e evidências; sem alterar a main |
| Demonstração estática | GitHub Pages, workflow manual depois da integração na main | Somente arquivos de `interface/`, com banner DADOS SIMULADOS |
| ESP32 + Python | Host local na mesma rede da placa, servindo interface e API na mesma origem | Indicadores reais quando a integração for implementada |
| Hospedagem futura do backend | Decisão própria, após requisitos de rede, operação e armazenamento | Não definida/contratada neste MVP |

GitHub Pages publica arquivos estáticos e não executa Python ([documentação oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)). A demonstração publicada não passa a ler a placa por estar na internet. Para o hardware, inicialmente usar host local e mesma origem; não apontar a página HTTPS pública para um backend HTTP privado como solução improvisada.

## Commits estruturados

Branch desta entrega: `feat/mvp-interface-simulada`, a partir da main existente. Mensagens `docs:`, `feat:`, `test:` e `ci:` descrevem entregas coesas. Adicionar caminhos explicitamente; README com alterações anteriores exige seleção de trecho. Não usar `git add .` nem incorporar firmware, CSVs e vídeo preexistentes ao MVP. Não fazer force-push ou merge automático na main.

Sequência adotada: planejamento/contrato → núcleo com testes → interface → CI/deploy e fechamento documental. O estado sujo anterior permanece disponível no mesmo checkout; não é erro de entrega nem justificativa para descarte.

## CI

`.github/workflows/ci.yml`: em push/PR que altere o MVP/contrato/workflows, executar `node scripts/verificar.mjs`, sem instalação de pacotes. Confere cópia do contrato, palavras-chave suportadas, sintaxe, assets locais e testes nativos Node. Os testes incluem perda/retorno, duplicata, contexto, fonte alternativa, lacunas do gráfico e 15 minutos de relógio simulado.

Isso verifica comportamento lógico; não simula calibração ou teste físico. QA visual continua registrado separadamente.

## Primeiro deploy do mock

Consulta autenticada nesta sessão: `TiagoAndradeM/MontiorESP` é privado, usa main como padrão e está com Pages desativado. O plano da conta não foi consultado. Antes de habilitar a publicação, conferir elegibilidade e audiência: repositório privado não implica que o site Pages seja privado; controle de acesso ao site depende do plano/contexto ([visibilidade do Pages](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)). Se for necessário acesso privado, decidir uma hospedagem que preserve esse requisito antes do primeiro deploy. Esta entrega não muda a visibilidade nem ativa Pages.

1. Revisar a branch e integrar os commits na main quando aprovado para publicação.
2. Nas configurações do repositório, selecionar **Pages → Source → GitHub Actions**. Conferir disponibilidade conforme plano/visibilidade do repositório; não mudar sua visibilidade só para habilitar hospedagem. O workflow não altera essas configurações automaticamente.
3. Em **Actions → Publicar MVP no GitHub Pages → Run workflow**, escolher **main**. O workflow somente publica essa branch e valida novamente exatamente a revisão que será enviada.
4. O artefato contém somente `interface/`; não inclui firmware, CSVs, `.git`, documentação de bancada ou segredos. CSS, módulos, favicon e contrato usam caminhos relativos, compatíveis com o subdiretório do projeto no Pages.
5. Confirmar a URL retornada pelo job e fazer smoke test: banner, seleção, gráfico, pausa/retorno. Não anunciar uma URL como publicada antes do job concluir.

Fluxo baseado nas [instruções oficiais de workflows do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Permissões de publicação ficam somente no job de deploy: `pages: write` e `id-token: write`, com ambiente `github-pages`. Usa token efêmero do Actions, sem PAT no código.

## Atualizações e reversão

Inicialmente o deploy é manual e reproduzível pela revisão selecionada na main. Se surgir falha, usar `git revert` do commit responsável em uma nova alteração revisável e executar novamente o workflow. Não reescrever histórico com reset/force-push. Deploy automático a cada merge na main pode ser habilitado depois, por decisão explícita; branches de feature não publicam produção.

Não há conta de hospedagem, banco, domínio, container, serviço pago ou credenciais de Wi-Fi criados por esta entrega.
