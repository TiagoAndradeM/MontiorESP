# MontiorESP

Monitor Inteligente de Poluição Sonora — projeto acadêmico de Sinais e Sistemas com ESP32 e INMP441.

**V0.1 — Aquisição I2S**

Esta versão valida exclusivamente o caminho `Som → INMP441 → I²S → ESP32 → amostras digitais`. O firmware recebe blocos continuamente e apresenta diagnósticos numéricos pelo Serial. A próxima etapa depende da validação no hardware real e de uma nova definição do projeto.

## Arquivo e compatibilidade

Abra [Monitor_Poluicao_Sonora_V01.ino](Monitor_Poluicao_Sonora_V01/Monitor_Poluicao_Sonora_V01.ino), mantendo o arquivo dentro da pasta `Monitor_Poluicao_Sonora_V01`.

- Arduino IDE 2.
- Pacote **esp32 by Espressif Systems 3.3.12**.
- Placa **ESP32 Dev Module**; hardware ESP32 DEVKIT V1 / ESP32-D0WD-V3.
- Porta informada: **COM7**.
- Biblioteca `ESP_I2S`, incluída no próprio pacote ESP32. Não é necessário instalar outra biblioteca I²S.

**Validação de compilação em 21/10/2026:** concluída com sucesso usando o Arduino CLI incluído na IDE, o Core instalado **3.3.12**, a placa `esp32:esp32:esp32` (ESP32 Dev Module) e `--warnings all`. Não foram emitidos avisos do compilador. Uso de programa: **295.884 bytes (22%)**; variáveis globais: **23.436 bytes (7%)**. O upload e os testes acústicos no hardware ainda não foram realizados nesta entrega.

A API foi conferida tanto na instalação local 3.3.12 quanto no código-fonte oficial dessa versão. O sketch usa `ESP_I2S.h`, `I2SClass`, `setPins()`, `begin()` e `readBytes()`. Na migração para o Core 3.x, a biblioteca I²S foi reformulada sobre o novo driver do ESP-IDF. Por isso, esta implementação usa a API atual, em vez de exemplos legados com `driver/i2s.h`, `i2s_driver_install()` e `i2s_read()`.

Fontes: [cabeçalho da versão 3.3.12](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/ESP_I2S/src/ESP_I2S.h), [implementação 3.3.12](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/ESP_I2S/src/ESP_I2S.cpp) e [guia de migração oficial](https://docs.espressif.com/projects/arduino-esp32/en/latest/migration_guides/2.x_to_3.0.html#i2s).

## Ligações

Faça ou revise as conexões com o USB desconectado.

| INMP441 | ESP32 |
|---|---|
| VDD | 3V3 |
| GND | GND |
| SCK / BCLK | GPIO 26 |
| WS / LRCLK | GPIO 25 |
| SD | GPIO 33 |
| L/R | GND |

Use os números **GPIO**, e não a posição física dos pinos. O microfone recebe alimentação de 3,3 V. Mantenha o buzzer fora desta montagem de teste.

## Configuração e caminho das amostras

| Parâmetro | Configuração | Motivo |
|---|---|---|
| Interface | I²S padrão Philips | Formato do INMP441, com atraso de um BCLK entre a transição de WS e o primeiro bit |
| Papel do ESP32 | Mestre, somente recepção de dados | Gera BCLK e WS; recebe SD |
| Amostragem | 16.000 Hz | Recebe 16.000 amostras do canal selecionado por segundo |
| Largura | Slots de 32 bits | Acomoda os 24 bits de áudio do microfone |
| Canal no buffer | Mono, esquerdo | L/R em GND faz o microfone transmitir no slot esquerdo |
| DATA OUT / MCLK | Desabilitados, `-1` | Não são necessários nesta ligação |
| Buffer do sketch | 256 palavras `int32_t` | 1.024 bytes, equivalentes a 16 ms de áudio |
| Timeout | 100 ms | Limita a espera de leitura; um bloco corresponde a 16 ms |
| Diagnóstico | Aproximadamente a cada 500 ms | Permite observar mudanças sem sobrecarregar o Serial |

Mesmo recebendo um único canal, o barramento mantém dois slots de 32 bits por quadro: **64 pulsos de BCLK por período de WS**. Assim, WS é nominalmente 16 kHz e BCLK é 16.000 × 64 = **1,024 MHz**. O slot direito não é incorporado ao buffer mono.

O microfone digitaliza o som internamente e envia uma palavra PCM de **24 bits com sinal, em complemento de dois**, começando pelo bit mais significativo. O periférico I²S do ESP32 recebe esses bits e usa DMA para movimentar os dados para a memória. `readBytes()` transfere os dados recebidos para o buffer do sketch, que é reutilizado no bloco seguinte.

Os 24 bits úteis ficam nos bits 31 a 8 da palavra de 32 bits. Para os diagnósticos, `bufferAmostras[i] >> 8` descarta os oito bits inferiores e preserva o sinal no compilador do ESP32. Esses oito bits inferiores não representam áudio válido do INMP441. O intervalo representável após a conversão é de −8.388.608 a +8.388.607; isso não significa que as amostras normais devam chegar a esses limites.

O firmware continua lendo e descarta os primeiros 5.120 valores, equivalentes a 320 ms. Isso cobre a partida do INMP441, que demanda aproximadamente 256 ms de clocks nesta taxa, e também esvazia os dados iniciais do DMA. Depois começa a contabilização para o diagnóstico.

Fonte do formato, canal e temporização: [datasheet oficial TDK do INMP441, páginas 8 e 10–12](https://product.tdk.cn/system/files/dam/doc/product/sw_piezo/mic/mems-mic/data_sheet/inmp441.pdf). Referência da biblioteca: [API I²S da Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/i2s.html).

## O que aparece no Serial

Na partida:

```text
ESP32 iniciado | V0.1 - Aquisicao I2S
I2S inicializado | 16000 Hz | 32 bits | mono esquerdo
Aguardando amostras; descartando os primeiros 320 ms.
```

Em seguida, cerca de duas linhas por segundo. Exemplo **ilustrativo, sem representar uma medição real**:

```text
[512 ms] amostras=8192 | min=-1100 | max=1400 | pico_a_pico=2500 | zeros=0 | falhas=0
```

- `[... ms]`: duração real do intervalo do diagnóstico.
- `amostras`: valores recebidos em blocos completos nesse intervalo; normalmente cerca de 8.000 por meio segundo. O contador reinicia após cada impressão.
- `min` e `max`: menor e maior valor entre **todos os blocos do intervalo**.
- `pico_a_pico`: `max - min`; serve para comparar a variação numérica do sinal entre os testes.
- `zeros`: quantidade de amostras exatamente iguais a zero. Alguns zeros isolados são normais.
- `falhas`: leituras que não entregaram um bloco completo. Havendo falha, também aparece o último erro informado pela biblioteca.

Mínimo e máximo são acumulados continuamente; assim, uma palma ocorrida entre duas impressões ainda pode aparecer nos extremos do intervalo em que foi capturada. Não há pausa de 500 ms na aquisição. Blocos incompletos são descartados, sem interpretar o conteúdo antigo do buffer.

Esses números são contagens digitais. Pico a pico é apenas um diagnóstico de variação; não é intensidade sonora calibrada nem dB SPL. Não são calculados RMS, FFT, frequência dominante ou classificações nesta versão.

## Procedimento de teste

1. **Compilar.** Conecte a placa por USB e abra o `.ino`. No Gerenciador de Placas, confirme **esp32 by Espressif Systems 3.3.12**. Selecione **Ferramentas → Placa → esp32 → ESP32 Dev Module**. Clique em **Verificar** (ícone de confirmação) e aguarde a conclusão sem erros.
2. **Upload.** Selecione **Ferramentas → Porta → COM7** e clique em **Carregar**. Aguarde a mensagem de conclusão. Se a numeração da porta mudar ao reconectar, selecione a nova porta da mesma placa.
3. **Serial.** Abra **Ferramentas → Monitor Serial**, selecione **115200 baud** e pressione **EN/RESET** na placa para acompanhar a inicialização. Aguarde a estabilização e as primeiras linhas de diagnóstico. A configuração de fim de linha não interfere, pois não há comandos de entrada.
4. **Silêncio.** Deixe o microfone parado por aproximadamente 10 segundos. Anote alguns valores de `pico_a_pico`. Espere ruído de fundo variável; silêncio acústico não exige amostras zeradas.
5. **Fala próxima.** Fale normalmente a cerca de 10–20 cm por 5 segundos, sem soprar sobre o microfone. Observe se os extremos se afastam e `pico_a_pico` aumenta em relação ao silêncio. Faça algumas pausas para comparar.
6. **Palma.** Dê uma palma a cerca de 30–50 cm, sem tocar no módulo. Observe o pico no relatório correspondente e a redução nos relatórios seguintes. Repita duas ou três vezes, com pausas de alguns segundos.
7. **Distância.** Repita uma frase em volume semelhante a 20 cm, 50 cm e 1 m, mantendo a orientação do microfone. Compare vários relatórios em cada posição. A tendência é diminuir a variação ao afastar a fonte, mas reflexões, ruído ambiente e diferenças na voz podem alterar uma leitura isolada.

## Critério de sucesso e investigação de falhas

Considere a aquisição validada quando a inicialização concluir, houver blocos completos contínuos, `falhas=0` normalmente, e as mudanças forem **reproduzíveis e relacionadas ao som**: menor variação no ambiente quieto, aumento ao falar, pico transitório com a palma e tendência de redução ao afastar a fonte. Sinais de ambos os sentidos, positivos e negativos, são esperados, embora possa haver um deslocamento de nível.

| Comportamento | Possíveis causas e conferência |
|---|---|
| Nenhuma mensagem ou caracteres ilegíveis | Verifique COM7, 115200 baud, upload e reset. Isso, sozinho, não indica falha do microfone. |
| `ERRO: I2S nao inicializado` | Falha de configuração ou recursos do periférico. Confira a placa/core selecionados e o código do erro. A inicialização do ESP32 não detecta a presença do INMP441. |
| `SEM BLOCO COMPLETO`, `amostras=0` ou falhas recorrentes | O programa não obteve um bloco completo no prazo; confira o erro, a configuração mestre/receptor e se o firmware carregado é o correto. |
| Muitos blocos recebidos, mas todos os valores zero ou constantes | Confira VDD em 3V3, GND comum, SD no GPIO 33, SCK no 26 e WS no 25. Alimentação ausente, SD solto ou clocks que não chegam ao microfone podem produzir esse resultado. |
| Contagem normal, sem resposta ao som; L/R em 3V3 ou solto | O firmware lê o esquerdo, mas o microfone pode estar transmitindo no direito. Para esta montagem, fixe L/R em GND. |
| Números erráticos sem relação com fala/palma | Possível fio solto, falta de GND comum, linha SD flutuante, alimentação instável ou conexão incorreta. Confira os jumpers e mantenha-os curtos. |
| Extremos presos continuamente próximos aos limites de 24 bits | Pode haver dados inválidos ou saturação. Afaste a fonte, repita em silêncio e revise a montagem se o padrão persistir. |

**Receber bytes não prova que o microfone está funcionando.** O ESP32 é mestre e pode continuar gerando clocks e enchendo o DMA mesmo com o microfone desligado ou desconectado. Portanto, erros de pinagem, canal errado e falta de alimentação não necessariamente causam timeout; podem produzir blocos completos com zeros, constantes ou ruído. Os sintomas não identificam uma causa única. A correlação com os testes sonoros é essencial.

Se a montagem permanecer instável depois das conferências básicas, verifique se o módulo já inclui os componentes recomendados pelo fabricante: desacoplamento de 0,1 µF entre VDD e GND e pull-down de 100 kΩ em SD. A saída SD fica em alta impedância fora dos bits transmitidos. Consulte o [circuito de aplicação do datasheet, página 12](https://product.tdk.cn/system/files/dam/doc/product/sw_piezo/mic/mems-mic/data_sheet/inmp441.pdf).

## Limite desta entrega

Somente aquisição I²S e diagnóstico pelo Serial. Não foram implementados filtros, análise de frequência, classificação do ambiente, buzzer, Wi-Fi, servidor web, banco de dados, microSD, OLED, gravação permanente ou calibração em dB SPL. A validação acústica depende da execução dos testes acima no hardware real.
