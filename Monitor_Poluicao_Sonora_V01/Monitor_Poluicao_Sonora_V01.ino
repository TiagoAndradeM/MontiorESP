/*
  Monitor Inteligente de Poluicao Sonora
  V0.1 - Aquisicao I2S
  Placa: ESP32 Dev Module / ESP32 DEVKIT V1
  Arduino-ESP32: 3.3.12

  INMP441: VDD=3V3, GND=GND, SCK=26, WS=25, SD=33, L/R=GND.
*/

#include <Arduino.h>
#include <ESP_I2S.h>

// O ESP32 fornece BCLK e WS; o microfone fornece os dados em SD.
constexpr int8_t PINO_BCLK = 26;
constexpr int8_t PINO_WS = 25;
constexpr int8_t PINO_SD = 33;

constexpr uint32_t TAXA_AMOSTRAGEM_HZ = 16000;
constexpr size_t AMOSTRAS_POR_BLOCO = 256;
constexpr uint32_t INTERVALO_DIAGNOSTICO_MS = 500;
constexpr uint32_t TIMEOUT_LEITURA_MS = 100;

I2SClass microfone;
int32_t bufferAmostras[AMOSTRAS_POR_BLOCO];
bool i2sPronto = false;

// A 16 kHz, o INMP441 precisa de aproximadamente 256 ms para iniciar.
// Drenar 5120 amostras (320 ms) evita diagnosticar os dados de partida.
uint32_t amostrasParaDescartar = 5120;

// Apenas diagnosticos dos dados recebidos entre duas impressoes.
uint32_t inicioIntervaloMs = 0;
uint32_t amostrasRecebidas = 0;
uint32_t amostrasZero = 0;
uint32_t falhasLeitura = 0;
int ultimoErro = ESP_OK;
int32_t menorAmostra = INT32_MAX;
int32_t maiorAmostra = INT32_MIN;

void inicializarSerial() {
  Serial.begin(115200);
  delay(1000);  // Pausa apenas na partida, antes de ligar a aquisicao.
  Serial.println();
  Serial.println("ESP32 iniciado | V0.1 - Aquisicao I2S");
}

bool inicializarI2S() {
  // Ordem: BCLK, WS, DATA OUT, DATA IN, MCLK.
  // -1 desabilita a saida de audio e o pino MCLK, que nao sao usados.
  microfone.setPins(PINO_BCLK, PINO_WS, -1, PINO_SD, -1);
  microfone.setTimeout(TIMEOUT_LEITURA_MS);

  // STD usa I2S Philips. L/R em GND seleciona o slot esquerdo.
  // Os slots de 32 bits preservam os 24 bits enviados pelo INMP441.
  return microfone.begin(
    I2S_MODE_STD,
    TAXA_AMOSTRAGEM_HZ,
    I2S_DATA_BIT_WIDTH_32BIT,
    I2S_SLOT_MODE_MONO,
    I2S_STD_SLOT_LEFT,
    I2S_ROLE_MASTER
  );
}

size_t adquirirBloco() {
  const size_t bytesLidos = microfone.readBytes(
    reinterpret_cast<char *>(bufferAmostras), sizeof(bufferAmostras)
  );

  // Nunca analisar dados antigos ou um bloco incompleto como audio valido.
  if (bytesLidos != sizeof(bufferAmostras)) {
    ++falhasLeitura;
    ultimoErro = microfone.lastError();
    return 0;
  }

  return bytesLidos / sizeof(bufferAmostras[0]);
}

void atualizarDiagnostico(size_t quantidade) {
  for (size_t i = 0; i < quantidade; ++i) {
    // Os 24 bits uteis ocupam os bits 31..8 da palavra recebida.
    // No compilador ESP32, o deslocamento de int32_t preserva o sinal.
    // Os 8 bits inferiores nao sao dados de audio do INMP441.
    const int32_t amostra = bufferAmostras[i] >> 8;

    if (amostra < menorAmostra) menorAmostra = amostra;
    if (amostra > maiorAmostra) maiorAmostra = amostra;
    if (amostra == 0) ++amostrasZero;
  }
  amostrasRecebidas += quantidade;
}

void apresentarDiagnostico() {
  const uint32_t agora = millis();
  const uint32_t intervaloMs = agora - inicioIntervaloMs;
  if (intervaloMs < INTERVALO_DIAGNOSTICO_MS) return;

  Serial.printf("[%lu ms] amostras=%lu", (unsigned long)intervaloMs,
                (unsigned long)amostrasRecebidas);

  if (amostrasRecebidas > 0) {
    // Pico a pico apenas mostra a variacao numerica; nao mede dB SPL.
    const int32_t picoAPico = maiorAmostra - menorAmostra;
    Serial.printf(" | min=%ld | max=%ld | pico_a_pico=%ld | zeros=%lu",
                  (long)menorAmostra, (long)maiorAmostra, (long)picoAPico,
                  (unsigned long)amostrasZero);
  } else {
    Serial.print(" | SEM BLOCO COMPLETO: verificar leitura I2S");
  }

  Serial.printf(" | falhas=%lu", (unsigned long)falhasLeitura);
  if (falhasLeitura > 0) {
    Serial.printf(" | erro=%s", esp_err_to_name((esp_err_t)ultimoErro));
  }
  Serial.println();

  inicioIntervaloMs = agora;
  amostrasRecebidas = 0;
  amostrasZero = 0;
  falhasLeitura = 0;
  menorAmostra = INT32_MAX;
  maiorAmostra = INT32_MIN;
}

void setup() {
  inicializarSerial();
  i2sPronto = inicializarI2S();
  if (!i2sPronto) {
    Serial.printf("ERRO: I2S nao inicializado (%s).\n",
                  esp_err_to_name((esp_err_t)microfone.lastError()));
    Serial.println("Confira a configuracao e reinicie pelo botao EN.");
    return;
  }

  Serial.println("I2S inicializado | 16000 Hz | 32 bits | mono esquerdo");
  Serial.println("Aguardando amostras; descartando os primeiros 320 ms.");
  inicioIntervaloMs = millis();
}

void loop() {
  if (!i2sPronto) {
    delay(100);  // A inicializacao falhou; nao tentar ler canal inexistente.
    return;
  }

  const size_t quantidade = adquirirBloco();
  if (quantidade > 0 && amostrasParaDescartar > 0) {
    const uint32_t descarte = (quantidade < amostrasParaDescartar)
                               ? quantidade : amostrasParaDescartar;
    amostrasParaDescartar -= descarte;
    inicioIntervaloMs = millis();
    return;
  }

  atualizarDiagnostico(quantidade);
  apresentarDiagnostico();
  // Sem delay entre blocos: a propria leitura espera os dados do DMA.
}
