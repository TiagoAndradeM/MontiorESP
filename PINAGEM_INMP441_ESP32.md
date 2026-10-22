# Ligações do INMP441 ao ESP32 DEVKIT V1

Este documento explica as seis conexões do **módulo de microfone INMP441** usadas no projeto MontiorESP. O próprio INMP441 contém o sensor de som e converte o áudio em dados digitais; não é preciso ligar outro microfone a ele. A comunicação com o ESP32 usa **I²S**: o ESP32 fornece os sinais de sincronização e recebe os dados do microfone. Consulte o [datasheet do INMP441, especialmente as páginas 8 e 11](https://product.tdk.cn/system/files/dam/doc/product/sw_piezo/mic/mems-mic/data_sheet/inmp441.pdf).

**Esta tabela documenta o sketch V0.1.** Para o experimento posterior com a biblioteca `ESP32Feature28`, a equipe informou outra ligação: SCK→GPIO 18, WS→GPIO 23 e SD→GPIO 5, com L/R→GND. Use sempre os pinos definidos no sketch que for carregar na placa.

## Tabela de ligações

| Pino no módulo INMP441 | Ligar no ESP32 DEVKIT V1 | Direção do sinal | O que faz |
|---|---|---|---|
| **VDD** (ou VCC) | **3V3** | Alimentação do ESP32 para o módulo | Fornece energia ao microfone. Use **3,3 V**, não 5 V. |
| **GND** | **GND** | Referência comum | Fecha o circuito de alimentação e dá a ambos a mesma referência elétrica. |
| **SCK** (ou BCLK) | **GPIO 26** | ESP32 → INMP441 | Relógio de bits: marca o ritmo em que os bits de áudio são transmitidos. |
| **WS** (ou LRCLK) | **GPIO 25** | ESP32 → INMP441 | Seleciona o intervalo do canal esquerdo ou direito e marca o início de cada amostra. |
| **SD** | **GPIO 33** | INMP441 → ESP32 | Saída de dados digitais de áudio do microfone; o ESP32 lê essa linha. **SD aqui não significa cartão SD.** |
| **L/R** | **GND** | Seleção fixa no módulo | Coloca o áudio do microfone no canal **esquerdo** do fluxo I²S, que é o canal configurado no código. |

Use os números **GPIO** impressos na placa. A posição física desses contatos pode variar entre versões da DEVKIT V1 e do módulo; confira as inscrições na sua placa antes de ligar. Faça ou altere as conexões com o USB desconectado.

### Cuidado com o “SCK/CLK — No. 20” do datasheet do ESP32-WROOM-32

Na tabela de pinos do [datasheet oficial do ESP32-WROOM-32, páginas 9–10](https://documentation.espressif.com/esp32-wroom-32_datasheet_en.pdf), a coluna **No.** numera os contatos físicos **do módulo WROOM-32**, não os GPIOs nem os contatos laterais da placa DEVKIT V1. A linha `SCK/CLK — No. 20` corresponde ao **GPIO 6**, usado para o relógio da memória flash integrada. O fabricante informa que os GPIOs 6 a 11 estão ligados à flash e não são recomendados para outras funções. **Não ligue o SCK do INMP441 nesse contato.**

No mesmo datasheet, `IO26 — No. 11` significa **GPIO 26**, `IO25 — No. 10` significa **GPIO 25** e `IO33 — No. 9` significa **GPIO 33**. Para o sketch V0.1, use os contatos laterais da DEVKIT V1 identificados como **D26/26**, **D25/25** e **D33/33**. O nome `SCK` aparece em interfaces diferentes; o relógio I²S do microfone foi configurado no **GPIO 26** pela V0.1 e no **GPIO 18** pelo teste separado com `ESP32Feature28`.

## Por que 26, 25 e 33?

O ESP32 consegue encaminhar sinais I²S por diferentes GPIOs; **26, 25 e 33 não são os únicos pinos possíveis**. Foram escolhidos porque estão disponíveis nesta montagem e podem cumprir as direções necessárias: GPIO 26 e GPIO 25 fornecem os dois sinais de relógio, enquanto GPIO 33 recebe os dados. O que torna a ligação correta é a combinação de **fios físicos** com a **configuração do programa**. A [documentação de GPIO da Espressif](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html) lista esses pinos como GPIOs utilizáveis e explica o encaminhamento de sinais pelo ESP32.

No sketch [Monitor_Poluicao_Sonora_V01.ino](Monitor_Poluicao_Sonora_V01/Monitor_Poluicao_Sonora_V01.ino), a escolha está escrita assim:

```cpp
#define I2S_SCK 26
#define I2S_WS  25
#define I2S_SD  33

microfone.setPins(I2S_SCK, I2S_WS, -1, I2S_SD, -1);
```

Na função `setPins`, a ordem é **relógio de bits, seleção do canal, saída de dados do ESP32, entrada de dados no ESP32, relógio mestre**. Os dois `-1` indicam saídas que não são usadas nesta montagem; por isso, não há fio para elas. Essa ordem consta da [API I²S do Arduino-ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/i2s.html#setpins).

O **GPIO 18 também poderia fornecer SCK**, mas só depois de mover o fio de SCK para o GPIO 18 **e** mudar `#define I2S_SCK 18` no sketch. Enquanto o código indicar `26`, SCK deve ficar no **GPIO 26**. O mesmo princípio vale para WS e SD: qualquer mudança de pino exige alterar a ligação e a definição correspondente.

## O que acontece quando o sistema capta som

1. O INMP441 capta o som e produz internamente palavras digitais de áudio de **24 bits**.
2. O ESP32 envia **SCK** pelo GPIO 26 e **WS** pelo GPIO 25 para sincronizar o microfone.
3. Como **L/R está no GND**, o INMP441 transmite sua amostra no intervalo do canal esquerdo.
4. Os bits saem pelo **SD** do módulo e chegam ao **GPIO 33** do ESP32.
5. O programa lê as amostras e mostra no Monitor Serial o menor valor, o maior valor e a diferença entre eles.

Com a configuração atual de **16.000 amostras por segundo**, WS opera em torno de **16 kHz**. O formato do INMP441 usa **64 pulsos de SCK por quadro** (32 para cada intervalo de canal), então SCK fica em torno de **1,024 MHz**. Embora o microfone envie 24 bits úteis por amostra, o programa usa intervalos de 32 bits para recebê-los. Esses valores seguem o [formato I²S descrito no datasheet](https://product.tdk.cn/system/files/dam/doc/product/sw_piezo/mic/mems-mic/data_sheet/inmp441.pdf).

## Conferência rápida da montagem

- **VDD → 3V3** e **GND → GND** alimentam o módulo; não use 5 V no INMP441.
- **SCK → 26** e **WS → 25** levam os sinais gerados pelo ESP32 ao microfone.
- **SD → 33** leva os dados do microfone ao ESP32.
- **L/R → GND** seleciona o canal esquerdo. Não deixe L/R solto.

Se o Monitor Serial mostrar muitos blocos recebidos, mas `min=0`, `max=0` e `zeros` igual ao número de amostras, isso **ainda não confirma que o microfone está enviando áudio**: o ESP32 pode continuar gerando os relógios e recebendo blocos sem sinal útil em SD. Depois de conferir as seis ligações, compare as leituras em silêncio, durante a fala e após uma palma. O código foi compilado para **ESP32 Dev Module / ESP32 DEVKIT V1** com o pacote Arduino-ESP32 **3.3.12**; a resposta ao som depende do teste na placa.

## Fontes

- [TDK InvenSense — datasheet do INMP441](https://product.tdk.cn/system/files/dam/doc/product/sw_piezo/mic/mems-mic/data_sheet/inmp441.pdf), páginas 8 e 11–12: funções dos pinos, seleção L/R e formato I²S.
- [Espressif — API I²S do Arduino-ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/i2s.html): ordem dos argumentos de `setPins`.
- [Espressif — GPIO do ESP32](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html): capacidades dos GPIOs e encaminhamento de sinais periféricos.
