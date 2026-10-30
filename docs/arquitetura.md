# Arquitetura proposta

Status: decisão de planejamento em 30/10/2026, sem implementação nesta entrega. [ADR-001](decisoes/001-arquitetura.md).

## Comparação das alternativas

| Critério | A — servidor no ESP32 | B — ESP32 + backend Python local |
|---|---|---|
| Fluxo | INMP441 → aquisição/processamento ESP32 → HTTP + arquivos web → navegador | INMP441 → aquisição/features ESP32 → Wi-Fi → Python → HTTP → navegador |
| Simplicidade operacional | Depois de embarcado, placa + navegador bastam; alimentação e acesso à rede ainda necessários | Precisa manter um computador e processo Python ativos |
| Desenvolvimento | Poucos componentes, mas interface e firmware disputam ciclo de gravação e recursos | Mais um processo; frontend e regras podem evoluir sem regravar placa |
| Independência de computador | Melhor, inclusive possível modo AP a avaliar | Menor; host local obrigatório |
| Recursos e processamento | Buffers, aquisição, rede e servidor compartilham recursos da placa | Aquisição fica na placa; host tem mais margem para indicadores derivados |
| Histórico | Curto e em memória é simples; persistência exige avaliar flash/capacidade | Histórico, exportação e armazenamento futuro são mais fáceis de evoluir |
| ML | Exige avaliar modelo e memória para inferência embarcada | Ecossistema Python e inferência no host facilitam experimentar depois |
| Manutenção | Mudanças podem exigir novo empacotamento/upload; limitar clientes | Adaptadores e contrato separam hardware, regras e apresentação |
| Rede | Navegador precisa alcançar a placa/AP | ESP32 precisa alcançar o host; redes com isolamento podem impedir |
| Melhor aplicação | Demonstração autônoma de uma placa sem host | Projeto acadêmico com evolução de interface, análise e histórico |

A documentação oficial confirma a disponibilidade de servidor HTTP leve no ESP32 ([Espressif](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/protocols/esp_http_server.html)). A avaliação de esforço e a recomendação acima são decisões de projeto; não são medições de desempenho do nosso hardware.

## Recomendação

**MVP da interface:** simulador JavaScript no navegador e frontend HTML/CSS/JS servido localmente. Nenhum backend de aplicação é necessário para validar layout e contrato.

**MVP acadêmico integrado:** B local, pois já existe uma ponte Python/serial e o foco inclui histórico e evolução dos indicadores. Desenvolver o backend por incremento, sem framework obrigatório e sem depender de ML. Usar serial como etapa de integração opcional antes de Wi-Fi, preservando a mesma representação de telemetria.

**Futuro:** continuar B com persistência justificada, múltiplas fontes e ML opcional. Considerar A se a apresentação exigir operar sem computador. Não construir as duas implementações em paralelo.

## Fluxo por fase

```text
MVP simulado:
cenário sintético → fonte mock → validação → estado em memória → componentes/gráfico

Integração de transição, se útil:
ESP32 → serial → adaptador Python → contrato → API local → fonte HTTP → mesma interface

Arquitetura B integrada:
INMP441 → ESP32 (aquisição + indicadores digitais)
        → Wi-Fi (POST de telemetria)
        → Python (validação, perfis, último registro, histórico em memória)
        → GET de telemetria → fonte HTTP → mesma interface

Futuro:
features → serviço de classificação opcional → metadados de classificação
                     + persistência opcional fora dos componentes visuais
```

## Responsabilidades

| Parte | Responsabilidade | Fronteira |
|---|---|---|
| Firmware | Aquisição I²S, janela e features digitais, contadores de sessão/sequência | Não envia áudio bruto; não conhece layout |
| Adaptador | Converter formato de uma fonte para o contrato | Conhece serial/HTTP; não desenha a tela |
| Regras/perfis | Intensidade relativa, estados e identificação do perfil | Mock usa perfil sintético; fonte real sem perfil mantém derivados indisponíveis |
| Backend futuro | Receber, validar, guardar último registro; ordenar e enriquecer sem perder origem | Não converter dBFS em SPL; não substituir timestamp desconhecido por hora de chegada |
| Estado frontend | Última amostra válida, histórico limitado e condição de conexão | Relógio monotônico de recepção controla frescor |
| Componentes | Exibir dados e ausência, origem, alertas e histórico | Não interpretar I²S, GPIO, COM ou limiar acústico |

Contrato interno da fonte, a implementar: `iniciar(aoReceber, aoMudarStatus)` e `parar()`. `aoReceber` entrega uma amostra conforme [contrato](contrato-dados.md); `aoMudarStatus` informa `aguardando`, `conectado`, `desatualizado`, `desconectado` ou `erro`. Componentes recebem o estado da aplicação, não a fonte. Modo/origem é metadado apresentado igualmente para qualquer fonte.

## Comunicação futura proposta

- Publicação e leitura em 1 Hz para começar; taxa de amostragem acústica é outro parâmetro.
- `POST /api/v1/telemetria`: uma amostra, validada antes de armazenar. Sucesso 202; JSON/esquema/semântica inválidos 400; versão não suportada 422. Duplicata idêntica por fonte/sessão/sequência retorna 202 sem inserir; mesma chave com conteúdo diferente retorna 409. Registro fora de ordem retorna 409 no MVP de uma fonte.
- `GET /api/v1/telemetria/atual`: amostra do mesmo contrato, 200; sem amostra 204, sem corpo. Falha de serviço 503. A recepção HTTP repetida da mesma sequência não renova o frescor dos dados.
- Mesmo host serve interface e API para evitar CORS no MVP B. Polling de 1 s, no máximo uma requisição pendente, timeout de 2 s e novas tentativas no próximo ciclo disponível; sem WebSocket/MQTT até haver requisito.
- Reinício do produtor cria `sessao_id` diferente e sequência reinicia. Histórico não mistura sessões. Proposta de um único dispositivo ativo no MVP; múltiplos dispositivos exigem seleção explícita antes da expansão.
- Ambiente/perfis são configurados no produtor lógico (mock ou backend). Troca manual no MVP mock cria nova sessão. Na futura fonte HTTP, configurar ambiente no backend será uma tarefa própria; a tela não deve apenas rebatizar medições antigas.

Esses endpoints estão **planejados**, não existem hoje. O dashboard anterior usa `/api/state` e não será alterado silenciosamente.

## Organização futura do código

Somente ao iniciar desenvolvimento: `interface/index.html`, `interface/styles.css`, `interface/js/app.js`, `interface/js/fontes/mock.js`, `interface/js/validacao.js`, `interface/js/estado.js`, `interface/js/componentes.js`. Fonte HTTP e `backend/` surgem nas tarefas correspondentes. São responsabilidades lógicas; evitar multiplicar arquivos para funções triviais.

## Expansão para ML

Escolher ambiente manual e prever um resultado independente de classificação. Classificar ambiente e avaliar estado sonoro são problemas diferentes. Treinar/inferir em Python sobre features padronizadas e modelo versionado, sem alterar os componentes de intensidade. Dataset, avaliação com sessões separadas e tratamento de baixa confiança precisam ser definidos antes de desenvolver. NumPy/pandas/scikit-learn são candidatos futuros, não dependências atuais.
