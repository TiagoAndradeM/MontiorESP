/*
  Diagnostico I2S do INMP441 para a ligacao atual:
  SCK=GPIO26, WS=GPIO25, SD=GPIO33, L/R=GND, VDD=3V3, GND=GND.
  Monitor Serial: 115200 baud. Placa: DOIT ESP32 DEVKIT V1.

  Le os dois slots de 32 bits para distinguir canal errado,
  amostras alinhadas de forma inesperada e ausencia de dados em SD.
*/

#include <Arduino.h>
#include <ESP_I2S.h>

#define I2S_SCK 26
#define I2S_WS  25
#define I2S_SD  33
#define TAXA_HZ 16000U
#define QUADROS_POR_BLOCO 256U
#define BLOCOS_POR_RELATORIO 32U

I2SClass microfone;
int32_t dados[QUADROS_POR_BLOCO * 2];  // esquerdo, direito
bool i2sPronto = false;

uint32_t blocos = 0;
uint32_t brutoOuEsquerdo = 0;
uint32_t brutoOuDireito = 0;
int32_t minEsquerdo = INT32_MAX;
int32_t maxEsquerdo = INT32_MIN;
int32_t minDireito = INT32_MAX;
int32_t maxDireito = INT32_MIN;
uint32_t zerosEsquerdo = 0;
uint32_t zerosDireito = 0;

bool lerBloco() {
  const size_t lidos = microfone.readBytes(
    reinterpret_cast<char *>(dados), sizeof(dados)
  );
  if (lidos == sizeof(dados)) return true;
  Serial.printf("Leitura incompleta: %u/%u bytes, erro=%d\n",
                (unsigned int)lidos, (unsigned int)sizeof(dados),
                microfone.lastError());
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\nDiagnostico INMP441 | SCK=26 WS=25 SD=33 L/R=GND");
  microfone.setPins(I2S_SCK, I2S_WS, -1, I2S_SD, -1);
  microfone.setTimeout(100);
  i2sPronto = microfone.begin(
    I2S_MODE_STD, TAXA_HZ, I2S_DATA_BIT_WIDTH_32BIT,
    I2S_SLOT_MODE_STEREO, I2S_STD_SLOT_BOTH, I2S_ROLE_MASTER
  );
  if (!i2sPronto) {
    Serial.printf("Falha ao iniciar I2S: erro=%d\n", microfone.lastError());
    return;
  }

  // Esvazia os dados da partida do microfone antes das medidas.
  for (uint32_t i = 0; i < 24; ++i) {
    if (!lerBloco()) return;
  }
  Serial.println("I2S pronto. Compare silencio, fala e palma.");
}

void loop() {
  if (!i2sPronto) {
    delay(1000);
    return;
  }
  if (!lerBloco()) return;

  for (size_t i = 0; i < QUADROS_POR_BLOCO; ++i) {
    const int32_t esquerdo = dados[2 * i];
    const int32_t direito = dados[2 * i + 1];
    brutoOuEsquerdo |= static_cast<uint32_t>(esquerdo);
    brutoOuDireito |= static_cast<uint32_t>(direito);
    if (esquerdo == 0) ++zerosEsquerdo;
    if (direito == 0) ++zerosDireito;
    const int32_t audioEsquerdo = esquerdo >> 8;
    const int32_t audioDireito = direito >> 8;
    if (audioEsquerdo < minEsquerdo) minEsquerdo = audioEsquerdo;
    if (audioEsquerdo > maxEsquerdo) maxEsquerdo = audioEsquerdo;
    if (audioDireito < minDireito) minDireito = audioDireito;
    if (audioDireito > maxDireito) maxDireito = audioDireito;
  }

  if (++blocos < BLOCOS_POR_RELATORIO) return;
  const unsigned long total = (unsigned long)(blocos * QUADROS_POR_BLOCO);
  Serial.printf("E: min=%ld max=%ld zeros=%lu/%lu OR=0x%08lX | ",
                (long)minEsquerdo, (long)maxEsquerdo,
                (unsigned long)zerosEsquerdo, total,
                (unsigned long)brutoOuEsquerdo);
  Serial.printf("D: min=%ld max=%ld zeros=%lu/%lu OR=0x%08lX\n",
                (long)minDireito, (long)maxDireito,
                (unsigned long)zerosDireito, total,
                (unsigned long)brutoOuDireito);

  blocos = 0;
  brutoOuEsquerdo = 0;
  brutoOuDireito = 0;
  minEsquerdo = minDireito = INT32_MAX;
  maxEsquerdo = maxDireito = INT32_MIN;
  zerosEsquerdo = zerosDireito = 0;
}
