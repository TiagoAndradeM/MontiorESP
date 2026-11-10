# Monitor de audio com tres LEDs

Abra `Monitor_Poluicao_Sonora_V02_Leds.ino` na Arduino IDE, selecione **DOIT ESP32 DEVKIT V1**, envie o sketch e abra o Monitor ou Plotter Serial em **115200 baud**.

## Ligacoes

O INMP441 permanece como no teste validado: SCK no GPIO26, WS no GPIO25, SD no GPIO33, VDD no 3V3 e GND no GND. O diagnostico mostrou audio no segundo slot I2S, que este sketch le. Confira a ligacao L/R antes de fixar o prototipo: o datasheet especifica canal esquerdo quando L/R esta em GND.

Cada LED precisa de **seu proprio resistor** em serie. Os tres resistores com faixas verde-marrom-marrom informados para este prototipo sao de **510 ohms** (se essa for a sequencia lida no sentido correto) e servem para o teste. Com a alimentacao USB desconectada, ligue o anodo (perna longa) ao GPIO indicado, passando pelo resistor, e o catodo (perna curta) ao GND do ESP32:

| LED | GPIO | Faixa inicial |
| --- | ---: | --- |
| Verde | 18 | RMS ate -35 dBFS: ambiente relativamente silencioso |
| Amarelo | 19 | Acima de -35 dBFS RMS, sem pico extremo: fala e palmas moderadas |
| Vermelho | 23 | Pico a partir de -3 dBFS: muito perto do limite digital; fica aceso por 600 ms |

Os limites sao exemplos ajustados com as leituras deste modulo. O buzzer ainda nao esta ligado nem controlado; primeiro identifique se e ativo ou passivo e a tensao indicada nele.

## Gravar um minuto de dados em CSV

O sketch atual ja envia `RMS_dBFS` e `Pico_dBFS` a 115200 baud. Para registrar os valores sem alterar o codigo do ESP32, **feche o Monitor/Plotter Serial da Arduino IDE** e execute no PowerShell, a partir da pasta `MontiorESP`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Capturar_CSV.ps1 -Porta COM7 -DuracaoSegundos 60 -Cenario silencio
```

Troque `silencio` por `fala` ou `palmas` em outras capturas; confirme se a porta ainda e `COM7` no menu **Ferramentas > Porta** da Arduino IDE. O programa espera a primeira leitura valida, grava por 60 segundos e salva em `MontiorESP\dados\<cenario>_<data>.csv`. O arquivo tem as colunas `horario_local`, `tempo_ms`, `cenario`, `rms_dbfs`, `pico_dbfs`, `rms_filtrado_dbfs` e `led`. As duas ultimas ficam vazias com o firmware V02 e sao preenchidas com a V03. Usa ponto e virgula como separador e virgula decimal para abrir no Excel em portugues. Depois da captura, a porta e liberada para abrir o Monitor Serial novamente.

Ao iniciar, o sketch acende verde, amarelo e vermelho em sequencia por 350 ms cada, independentemente do microfone. Se algum nao acender nessa etapa, confira o GPIO, a fileira da protoboard, a polaridade do LED e o caminho ate o GND antes de avaliar os limites de som.

## Calibracao para dB SPL

Os valores no Monitor Serial sao **dBFS**, relativos ao limite digital. Eles mostram variacao de som, mas nao sao dB SPL do ambiente. Antes da calibracao absoluta, o processamento devera remover eventual componente DC do sinal. Para estimar dB SPL, use uma referencia acustica conhecida, de preferencia um decibelimetro calibrado e uma fonte sonora estavel perto do microfone, ou um calibrador acustico compativel. Anote o dB SPL da referencia e o RMS_dBFS medido pelo algoritmo final na mesma condicao. O deslocamento inicial e `offset = dB_SPL_referencia - RMS_dBFS_referencia`; depois, `dB_SPL_estimado = RMS_dBFS + offset`. Repita em mais de um nivel para verificar se a resposta e consistente. Para uma medida formal de poluicao sonora, ainda faltam ponderacao em frequencia/tempo e validacao do conjunto.

A [ficha do fabricante](https://invensense.tdk.com/wp-content/uploads/2015/02/INMP441.pdf) informa sensibilidade nominal de -26 dBFS a 94 dB SPL em 1 kHz, com tolerancia. Esse valor nao substitui a calibracao do modulo montado e do algoritmo usado aqui.
