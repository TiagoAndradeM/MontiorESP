// Teste do LED azul da DOIT ESP32 DEVKIT V1 (GPIO 2 / D2).
#define LED_INTERNO 2

void setup() {
  pinMode(LED_INTERNO, OUTPUT);
}

void loop() {
  digitalWrite(LED_INTERNO, HIGH);
  delay(500);
  digitalWrite(LED_INTERNO, LOW);
  delay(500);
}
