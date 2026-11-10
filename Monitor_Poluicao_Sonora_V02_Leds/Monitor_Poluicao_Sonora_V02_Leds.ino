#include <Arduino.h>
#include "driver/i2s.h"
#include <math.h>

#define I2S_PORT I2S_NUM_0

#define PIN_SCK  26
#define PIN_WS   25
#define PIN_SD   33

#define LED_VERDE    18
#define LED_AMARELO  19
#define LED_VERMELHO 23

// Limites relativos aos testes deste prototipo; nao representam dB SPL.
#define LIMIAR_SILENCIO_DBFS -35.0
#define LIMIAR_PICO_FORTE_DBFS -3.0
#define DURACAO_VERMELHO_MS 600U

#define SAMPLE_RATE 16000
#define BUFFER_SIZE 512
#define AMOSTRAS_POR_RELATORIO 4096
#define AMOSTRAS_INICIAIS_DESCARTADAS 5120

int32_t samples[BUFFER_SIZE];
uint32_t amostrasDescartadas = 0;
uint32_t amostrasAcumuladas = 0;
int64_t picoAcumulado = 0;
double somaQuadrados = 0;
unsigned long ultimoPicoForteMs = 0;
bool houvePicoForte = false;

void setup() {
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARELO, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_AMARELO, LOW);
  digitalWrite(LED_VERMELHO, LOW);

  Serial.begin(115200);
  delay(1000);

  // Teste de fiação: cada LED acende uma vez, sem depender do microfone.
  digitalWrite(LED_VERDE, HIGH);
  delay(350);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_AMARELO, HIGH);
  delay(350);
  digitalWrite(LED_AMARELO, LOW);
  digitalWrite(LED_VERMELHO, HIGH);
  delay(350);
  digitalWrite(LED_VERMELHO, LOW);

  // O diagnostico mostrou audio no segundo slot (D).
  i2s_config_t config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_RIGHT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = BUFFER_SIZE,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  i2s_pin_config_t pins = {
    .bck_io_num = PIN_SCK,
    .ws_io_num = PIN_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = PIN_SD
  };

  esp_err_t err = i2s_driver_install(I2S_PORT, &config, 0, NULL);

  if (err != ESP_OK) {
    Serial.println("Erro ao instalar I2S!");
    while (true) delay(1000);
  }

  err = i2s_set_pin(I2S_PORT, &pins);

  if (err != ESP_OK) {
    Serial.println("Erro ao configurar pinos I2S!");
    while (true) delay(1000);
  }

  i2s_zero_dma_buffer(I2S_PORT);
}

void loop() {
  size_t bytesRead = 0;

  esp_err_t err = i2s_read(
    I2S_PORT,
    samples,
    sizeof(samples),
    &bytesRead,
    portMAX_DELAY
  );

  if (err != ESP_OK || bytesRead == 0) {
    return;
  }

  const size_t n = bytesRead / sizeof(int32_t);

  for (size_t i = 0; i < n; i++) {
    // O INMP441 envia zeros durante a partida; descarte ~320 ms.
    if (amostrasDescartadas < AMOSTRAS_INICIAIS_DESCARTADAS) {
      ++amostrasDescartadas;
      continue;
    }

    // INMP441: amostra de 24 bits alinhada à esquerda
    const int32_t amostra = samples[i] >> 8;
    const int64_t valor = amostra;
    const int64_t absoluto = valor < 0 ? -valor : valor;
    if (absoluto > picoAcumulado) picoAcumulado = absoluto;
    somaQuadrados += static_cast<double>(valor) * valor;
    ++amostrasAcumuladas;
  }

  if (amostrasAcumuladas < AMOSTRAS_POR_RELATORIO) return;

  const double rms = sqrt(somaQuadrados / amostrasAcumuladas);
  const double escalaCheia = 8388608.0;  // amplitude maxima de 24 bits com sinal
  const double rmsDbfs = rms > 0 ? 20.0 * log10(rms / escalaCheia) : -100.0;
  const double picoDbfs = picoAcumulado > 0
                            ? 20.0 * log10(picoAcumulado / escalaCheia)
                            : -100.0;

  const unsigned long agora = millis();
  if (picoDbfs >= LIMIAR_PICO_FORTE_DBFS) {
    ultimoPicoForteMs = agora;
    houvePicoForte = true;
  }
  const bool vermelho = houvePicoForte &&
                         agora - ultimoPicoForteMs < DURACAO_VERMELHO_MS;
  const bool verde = !vermelho && rmsDbfs <= LIMIAR_SILENCIO_DBFS;
  const bool amarelo = !vermelho && !verde;

  digitalWrite(LED_VERDE, verde ? HIGH : LOW);
  digitalWrite(LED_AMARELO, amarelo ? HIGH : LOW);
  digitalWrite(LED_VERMELHO, vermelho ? HIGH : LOW);

  // Formato aceito tanto pelo Monitor quanto pelo Plotter Serial da Arduino IDE.
  Serial.printf("RMS_dBFS:%.1f\tPico_dBFS:%.1f\n", rmsDbfs, picoDbfs);

  amostrasAcumuladas = 0;
  picoAcumulado = 0;
  somaQuadrados = 0;
}
