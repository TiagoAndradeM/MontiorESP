/*
  Teste separado: INMP441 + ESP32Feature28 1.0.0 no ESP32 DEVKIT V1.
  Ligacoes usadas pela equipe: SCK=18, WS=23, SD=5, L/R=GND,
  VDD=3V3 e GND=GND. Monitor Serial: 115200 baud.
*/

#include <Arduino.h>
#include <ESP_I2S.h>
#include <ESP32Feature28.h>

#define I2S_SCK 18
#define I2S_WS  23
#define I2S_SD   5

#define TAXA_AMOSTRAGEM_HZ 16000U
#define AMOSTRAS_POR_BLOCO 256U
#define AMOSTRAS_POR_TESTE 32000U
#define AMOSTRAS_INICIAIS_DESCARTAR 5120U
#define TIMEOUT_LEITURA_MS 100U

I2SClass microfone;
Feature28Extractor extrator(TAXA_AMOSTRAGEM_HZ);
int32_t blocoI2S[AMOSTRAS_POR_BLOCO];
int16_t bloco16[AMOSTRAS_POR_BLOCO];
bool i2sPronto = false;

bool lerBloco() {
  const size_t bytesLidos = microfone.readBytes(
    reinterpret_cast<char *>(blocoI2S), sizeof(blocoI2S)
  );
  if (bytesLidos == sizeof(blocoI2S)) return true;

  Serial.printf("Leitura I2S incompleta: %u bytes, erro=%d\n",
                (unsigned int)bytesLidos, microfone.lastError());
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\nTeste INMP441 + ESP32Feature28");
  Serial.println("SCK=18 | WS=23 | SD=5 | L/R=GND");

  // Ordem: BCLK, WS, saida do ESP32 (inutilizada), entrada, MCLK.
  microfone.setPins(I2S_SCK, I2S_WS, -1, I2S_SD, -1);
  microfone.setTimeout(TIMEOUT_LEITURA_MS);
  i2sPronto = microfone.begin(
    I2S_MODE_STD,
    TAXA_AMOSTRAGEM_HZ,
    I2S_DATA_BIT_WIDTH_32BIT,
    I2S_SLOT_MODE_MONO,
    I2S_STD_SLOT_LEFT,
    I2S_ROLE_MASTER
  );

  if (!i2sPronto) {
    Serial.printf("Falha ao iniciar I2S: erro=%d\n", microfone.lastError());
    return;
  }

  // O INMP441 envia zeros durante sua partida; 320 ms cobrem esse periodo.
  uint32_t descartadas = 0;
  uint8_t falhasSeguidas = 0;
  while (descartadas < AMOSTRAS_INICIAIS_DESCARTAR) {
    if (!lerBloco()) {
      if (++falhasSeguidas >= 5) {
        Serial.println("Falhas na partida: verifique a configuracao I2S.");
        i2sPronto = false;
        return;
      }
      continue;
    }
    falhasSeguidas = 0;
    descartadas += AMOSTRAS_POR_BLOCO;
  }
  Serial.println("I2S pronto. Capturando janelas de 2 segundos...");
}

void loop() {
  if (!i2sPronto) {
    delay(1000);
    return;
  }

  extrator.reset();
  uint32_t recebidas = 0;
  uint32_t zeros = 0;
  uint8_t falhasSeguidas = 0;
  int16_t menor = INT16_MAX;
  int16_t maior = INT16_MIN;

  while (recebidas < AMOSTRAS_POR_TESTE) {
    if (!lerBloco()) {
      if (++falhasSeguidas >= 5) {
        Serial.println("Teste interrompido apos cinco falhas de leitura.");
        delay(1000);
        return;
      }
      continue;
    }
    falhasSeguidas = 0;

    for (size_t i = 0; i < AMOSTRAS_POR_BLOCO; ++i) {
      // Os 24 bits uteis estao no alto da palavra de 32 bits.
      // A biblioteca recebe int16_t: conservamos os 16 bits mais significativos.
      const int16_t amostra = (int16_t)(blocoI2S[i] >> 16);
      bloco16[i] = amostra;
      if (amostra < menor) menor = amostra;
      if (amostra > maior) maior = amostra;
      if (amostra == 0) ++zeros;
    }

    extrator.feed(bloco16, AMOSTRAS_POR_BLOCO);
    recebidas += AMOSTRAS_POR_BLOCO;
  }

  Serial.printf("amostras=%lu | min=%d | max=%d | zeros=%lu\n",
                (unsigned long)recebidas, (int)menor, (int)maior,
                (unsigned long)zeros);
  if (zeros == recebidas) {
    Serial.println("Somente zeros: nao ha audio util para extrair recursos.");
    delay(1000);
    return;
  }

  float recursos[28];
  if (!extrator.compute(recursos)) {
    Serial.println("Nao foi possivel calcular os 28 recursos.");
    delay(1000);
    return;
  }

  Serial.printf("FFT=%lu | MFCC=%lu\n",
                (unsigned long)extrator.fftBlocksProcessed(),
                (unsigned long)extrator.mfccFramesProcessed());
  Serial.printf("Frequencia de pico: %.2f Hz\n", recursos[0]);
  Serial.printf("Centroide espectral: %.2f Hz\n", recursos[1]);
  for (int i = 0; i < 13; ++i) {
    Serial.printf("MFCC%02d media=%+.6f | desvio=%+.6f\n",
                  i + 1, recursos[2 + i], recursos[15 + i]);
  }
  Serial.println();
  delay(1000);
}
