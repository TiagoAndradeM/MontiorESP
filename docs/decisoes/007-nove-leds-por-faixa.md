# ADR-007 — Nove LEDs para intensidade por faixa de frequência

Data: 05/11/2026. Estado: direção futura confirmada pelo usuário após orientação do professor; implementação adiada.

## Problema

O protótipo atual usa três LEDs para indicar o nível geral do sinal, com base em RMS e pico. Ele não distingue se a energia está concentrada em frequências baixas, médias ou altas. O professor sugeriu melhorar a divisão das faixas de alarme e indicar a intensidade de cada uma.

## Alternativas consideradas

- Manter os três LEDs atuais para o nível global: preserva o protótipo, mas não representa as três faixas separadamente.
- Usar um LED para cada faixa: mostra presença ou nível simplificado por banda, mas não três níveis em cada uma.
- Usar **três LEDs por faixa, totalizando nove LEDs**: atende à orientação e deixa visível a intensidade de baixas, médias e altas frequências.

## Decisão

Registrar como evolução planejada a terceira alternativa: três faixas (baixas, médias e altas frequências), cada uma com três LEDs para representar níveis de intensidade. A energia de cada faixa deverá ser extraída de amostras do INMP441 por uma análise espectral com FFT e agregação dos componentes da banda. Manter a medição global de RMS/pico separada dos níveis por faixa.

Esta decisão **não altera agora** o sketch V02/V03, os três LEDs existentes, a pinagem, o contrato de telemetria nem a interface. Nenhuma FFT ou regra de nove LEDs foi implementada ou validada.

## Definições pendentes antes de implementar

- Cortes de frequência e resolução/janela da FFT, respeitando a taxa de amostragem do firmware.
- Normalização e cálculo de energia por banda; tratamento de silêncio e saturação.
- Três níveis por banda, limiares, histerese/tempo de resposta e se os LEDs funcionam como barra cumulativa ou apenas um por nível.
- Pinagem dos seis LEDs adicionais, resistores, corrente disponível e montagem física segura.
- Testes com sinais conhecidos e depois com ambientes reais. Os limiares serão experimentais até haver evidência; não são limites de dB SPL.

## Consequências

O protótipo de três LEDs continua válido como etapa de aquisição e indicação global. A adaptação futura amplia o processamento e o hardware; também pode fornecer recursos espectrais para uma classificação de ambientes posterior, mas não a implementa automaticamente.
