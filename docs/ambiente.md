# Ambiente de trabalho

Inventário de ferramentas em 30/10/2026. Nenhum serviço ou ferramenta global foi instalado ou atualizado nesta etapa. A aplicação não recebeu dependências.

| Item | Estado observado | Uso |
|---|---|---|
| Windows / PowerShell | Workspace acessível | Ambiente local |
| Python | 3.13.2, comando `python` disponível | Backend local futuro e verificações |
| Git | 2.56.0.windows.2 | Histórico existente; sem commit nesta entrega |
| VS Code | `code.cmd` disponível | Edição futura de HTML/CSS/JS/Python |
| Arduino IDE | Diretório de instalação presente | Versão exata da IDE não conferida |
| Arduino-ESP32 | Pasta de pacote 3.3.12 presente | Não atualizar antes de verificar compatibilidade dos sketches |
| Arduino CLI | Não encontrado no PATH | Pode existir dentro da IDE; não necessário para o mock |
| Node | 24.22.1 disponível no runtime Codex | Não é requisito da aplicação nem motivo para introduzir npm |
| Navegador, placa, COM7, rede | Não testados nesta sessão | Validar somente quando a tarefa exigir |

## Preparação já concluída hoje

- Raiz e repositório identificados; trabalho anterior inventariado.
- Documentação, contrato, papéis e procedimentos locais organizados.
- Dependências do primeiro MVP limitadas a navegador e, para servir os arquivos, Python já instalado.
- Separação definida entre aplicação nova planejada e dashboard serial existente.

## Executar o MVP implementado

1. Ler `AGENTS.md`, contexto, tarefas e prompt do MVP. Conferir `git status --short`.
2. A pasta `interface/` contém T01: módulos ES, HTML e CSS sem ferramentas de build ou dependências externas.
3. Servir **a partir dela**: `python -m http.server 8000 --bind 127.0.0.1`. Abrir `http://127.0.0.1:8000/`. Não executar esse comando na raiz, para não expor documentos/dados desnecessários.
4. Executar critérios de [QA](qa.md). Parar o servidor com Ctrl+C.

`http.server` serve para desenvolvimento local; a documentação Python não o recomenda para produção ([fonte oficial](https://docs.python.org/3.13/library/http.server.html)). Um servidor temporário em loopback foi usado para QA do MVP. Na raiz do projeto, executar `node scripts/verificar.mjs` para conferir o contrato e rodar os testes; não precisa de `npm install`. Node não é dependência de execução do frontend.

Backend do MVP poderá começar com biblioteca padrão Python e bind em loopback. Virtualenv e dependências só serão criados se uma tarefa posterior justificar pacotes externos; registrar e fixar suas versões nessa ocasião. Não há `requirements.txt` vazio ou dependências especulativas nesta entrega.

Na integração Wi-Fi, loopback não é acessível pelo ESP32: definir interface LAN, endereço, porta e restrições de acesso no incremento próprio. Não reutilizar silenciosamente o servidor de desenvolvimento para exposição em rede.

## Segredos e dados

O mock não precisa de credenciais. Antes de adicionar Wi-Fi, definir configuração local não versionada, revisar `.gitignore` sem apagar regras existentes e fornecer somente modelo sem senha. Não mover nem excluir os CSVs históricos. Não abrir serial ou reproduzir CSV nesta fase: o dashboard existente pode gerar arquivos ao receber medições.

## Ferramentas de QA

Para conferir os artefatos desta entrega, PyYAML 6.0.3 e jsonschema 4.26.0 foram instalados somente em `../tmp/planejamento-validacao-deps`, fora do repositório e sem alterar o Python global. O verificador pontual está em `../tmp/verificar-planejamento.py`; da raiz `MontiorESP`, executar `python -X utf8 ../tmp/verificar-planejamento.py` enquanto esses artefatos temporários estiverem disponíveis. Eles não são dependências nem testes da aplicação. Resultado registrado em [QA](qa.md).
