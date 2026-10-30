# Contrato de telemetria 0.1.0

Status: primeira proposta documentada para o MVP; nenhum produtor atual foi migrado. [Schema JSON](contratos/telemetria.schema.json), [exemplo sintético](contratos/exemplo-simulado.json), [exemplo indisponível](contratos/exemplo-indisponivel.json). Os exemplos não representam medições reais.

## Princípios

Uma mensagem representa o fim de uma janela de análise de uma fonte. Formato JSON UTF-8, sem NaN/Infinity. Campos obrigatórios podem ser explicitamente `null` onde indicado; campos opcionais podem ser omitidos. Ausência não é zero. O consumidor não depende do microfone nem de GPIO, somente do contrato. Identificação da origem é metadado de proveniência, não motivo para mudar componentes.

| Campo | Tipo | Unidade/faixa | Significado e origem | Obrigatório |
|---|---|---|---|---|
| `versao_contrato` | string | `0.1.0` | Versão do formato, definida pelo produtor lógico | Sim |
| `fonte_id` | string | Identificador não vazio | Fonte lógica estável: mock ou dispositivo, sem dado pessoal | Sim |
| `sessao_id` | string | Identificador não vazio | Nova identificação em cada reinício/troca de contexto do produtor | Sim |
| `sequencia` | inteiro | ≥ 0 | Cresce a cada nova janela da sessão, mesmo sem UTC | Sim |
| `modo` | string | `simulado`, `real`, `replay` | Proveniência; replay de dado real continua sendo replay | Sim |
| `timestamp` | string ou null | RFC 3339 UTC terminado em `Z` | Instante do fim da janela, quando relógio estiver sincronizado; nunca horário de chegada disfarçado | Sim |
| `tempo_ativo_ms` | inteiro | ms, ≥ 0 | Tempo monotônico do produtor desde início da sessão | Sim |
| `ambiente` | string | `biblioteca`, `sala_aula`, `oficina`, `nao_definido` | Ambiente selecionado/configurado manualmente; oficina inclui laboratório | Sim |
| `estado` | string | `baixo`, `moderado`, `elevado`, `indeterminado` | Saída de regra identificada, ou roteiro de demonstração | Sim |
| `perfil_regra_id` | string ou null | ID versionado | Método/limiares usados para estado; sem perfil = indeterminado | Sim |
| `intensidade_relativa` | número ou null | Escala relativa 0–100, sem unidade física | Indicador calculado conforme perfil; não é porcentagem de energia, dB ou SPL | Sim |
| `perfil_intensidade_id` | string ou null | ID versionado | Normalização/intervalo usados para produzir o indicador | Sim |
| `rms_normalizado` | número ou null | 0–1, adimensional | RMS de amostras normalizadas à referência digital de amplitude de pico, conforme perfil de aquisição | Sim |
| `perfil_aquisicao_id` | string ou null | ID versionado | Define escala cheia, alinhamento/bit depth, canal, filtragem, remoção DC e janela da feature | Sim |
| `janela_ms` | inteiro | ms, > 0 | Duração nominal da janela descrita pelo produtor | Sim |
| `fs_hz` | inteiro | Hz, > 0 | Taxa de amostragem da aquisição, ou referência sintética do mock | Sim |
| `qualidade` | string | `valida`, `degradada`, `invalida` | Integridade técnica da janela, não probabilidade de classe nem garantia acústica | Sim |
| `rms_dbfs` | número ou null | dBFS ≤ 0 | RMS em referência digital; perfil deve declarar convenção, filtragem e eventual piso | Não |
| `frequencia_dominante_hz` | número ou null | Hz, > 0 e ≤ fs/2 | Pico espectral válido definido no perfil de aquisição; sem FFT = ausente | Não |
| `bandas` | objeto ou null | Definido abaixo | Percentuais relativos de energia espectral, calculados pelo produtor | Não |
| `saturado` | boolean ou null | Sem unidade | Saturação/clipping identificado pelo produtor; null se não avaliado | Não |
| `classificacao` | objeto ou null | Definido abaixo | Inferência opcional futura; não substitui ambiente manual | Não |

Objetos opcionais:

| Campo | Tipo/unidade | Origem e regra | Obrigatório quando objeto existe |
|---|---|---|---|
| `bandas.perfil_id` | string | Define faixas não sobrepostas, janela FFT, remoção DC, normalização e faixa analisada | Sim |
| `bandas.graves_pct` | número, 0–100 % | Energia integrada de graves / total analisado × 100 | Sim |
| `bandas.medios_pct` | número, 0–100 % | Energia integrada de médios / total analisado × 100 | Sim |
| `bandas.agudos_pct` | número, 0–100 % | Energia integrada de agudos / total analisado × 100 | Sim |
| `classificacao.ambiente` | enum de ambiente, exceto `nao_definido` | Classe inferida pelo modelo, independente da seleção manual | Sim |
| `classificacao.confianca` | número, 0–1 | Escore do modelo, sem alegar probabilidade calibrada | Sim |
| `classificacao.modelo_id` | string | Identificação da versão do modelo e pipeline de features | Sim |

## Regras semânticas além do schema

1. `(fonte_id, sessao_id, sequencia)` identifica uma janela. Sequência cresce; `tempo_ativo_ms` não retrocede. Reinício cria sessão diferente. Mesmo pacote repetido não vira leitura nova.
2. Timestamp pode ser `null` no ESP32 sem sincronização. Horário de recebimento e seu relógio monotônico pertencem ao estado do consumidor, fora da telemetria original. Exibir ordem relativa quando UTC for desconhecido. Replay preserva identificação de reprodução e não se apresenta como aquisição atual.
3. Sem perfil de intensidade, o indicador é `null`; sem perfil de regras, estado é `indeterminado`. Estado determinado exige intensidade disponível nesta versão. Perfil registrado não significa que foi validado fisicamente: isso precisa de evidência própria.
4. Qualidade inválida exige estado indeterminado, intensidade/RMS/frequência/bandas/classificação ausentes ou `null`. `saturado` pode permanecer como diagnóstico. O consumidor descarta indicação sonora confiável em qualidade degradada e mostra aviso; estado deve ser indeterminado.
5. Métricas RMS/espectrais requerem perfil de aquisição. O perfil define `x = amostra / escala_cheia` e `RMS = sqrt(média(x²))` depois do pré-processamento declarado. Perfis distintos não são automaticamente comparáveis. Se forem exatamente o mesmo RMS/referência, `dBFS = 20 log10(RMS)`; para RMS zero, dBFS é `null` (log indefinido). Não usar logaritmo sobre valores já em dBFS.
6. Perfil de intensidade real ainda está aberto (P01). Não será adotado um mapeamento arbitrário de dBFS para 0–100. Enquanto isso, produtor real pode emitir RMS digital e manter intensidade/estado indisponíveis. O mock usa `demo-intensidade-v1` e `demo-estados-v1`, exclusivamente sintéticos.
7. Frequência positiva deve respeitar Nyquist e resolução da janela; ausência de pico confiável é `null`. Bandas devem somar 100% com tolerância de arredondamento de 0,5 ponto percentual, cobrindo integralmente a faixa analisada do perfil. Sem energia total, `bandas = null`, sem divisão por zero. Faixas reais permanecem P06; não criar limites de banda por conveniência visual.
8. ID de perfil deve resolver para documentação mantida junto do produtor antes de aceitar dados reais. Consumidor não inventa perfil a partir dos valores.
9. Origem `simulado` exige rótulo persistente. Qualidade “válida” num exemplo só informa integridade do dado sintético. O contrato não comprova que a fonte física está conectada.

O schema cobre tipos, enumerações, presença, intervalos e parte das dependências. Nyquist, soma das bandas, monotonicidade, existência dos perfis e relação matemática entre campos exigem validação semântica adicional. Formato de data deve ser validado com suporte explícito a `date-time`, não somente por expressão regular.

## Perfis de demonstração dos exemplos

- `demo-aquisicao-v1`: sinal puramente sintético, referência de pico 1, sem DC/filtro, fs de referência 16000 Hz, janela nominal 1000 ms. RMS 0,05 gera dBFS aproximadamente −26,0206. Não define um sinal captado nem compromete o firmware com essa janela.
- `demo-intensidade-v1`: escala sintética criada pelo roteiro para exercitar a barra de 0–100; sem conversão de unidades nem interpretação acústica.
- `demo-estados-v1`: estado prescrito pelo cenário, independente de limiares reais. O exemplo “moderado” não define o ponto de corte de nenhuma classe.

## Compatibilidade e migração

0.1.0 é a proposta inicial. Consumidores aceitam somente as versões explicitamente suportadas; versão desconhecida gera erro legível, sem coerção. Mudança de tipo/unidade/significado exige nova versão e ADR; um campo opcional também exige revisar schema e consumidores antes de publicar versão. Campos não declarados são rejeitados nesta proposta para detectar erros de digitação.

O dashboard antigo usa `/api/state`, `latest.rms` em dBFS e cores de LED. Integração futura cria adaptador explícito: não renomear `rms` para normalizado nem mapear cor antiga para classe nova sem perfil. UTC de aquisição não existe nesse fluxo e deve permanecer `null` quando desconhecido. A API proposta está em [arquitetura](arquitetura.md); não altera a API antiga nesta etapa.
