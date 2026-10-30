---
name: validacao-acustica
description: Revisar metricas RMS, dBFS, espectro e regras do MontiorESP, distinguindo dados sinteticos, referencia digital, evidencia de bancada e calibracao acustica.
---

# Validação acústica no contexto do projeto

Usar ao especificar ou revisar aquisição, features e interpretações sonoras. Ler [pendências e divergências](../../docs/contexto.md), [ADR de grandezas](../../docs/decisoes/003-grandezas-e-regras.md) e a seção relevante do [contrato](../../docs/contrato-dados.md).

- Antes de calcular, identificar sketch, canal/slot, alinhamento, escala cheia, fs, janela e pré-processamento. V01 e V03 têm escolhas diferentes de I²S; documentação da V01 não prova canal da montagem atual.
- Separar RMS linear normalizado, dBFS e intensidade relativa. Não converter para SPL sem procedimento de calibração. Declarar remoção DC, filtros, referência e pisos numéricos.
- Para FFT, exigir janela, resolução, faixa e critério de pico. Para bandas, exigir perfil e normalização; ausência de energia não gera percentuais artificiais.
- Não transformar limiares experimentais de LED em limites de poluição sonora ou regras por ambiente sem evidência. O mock exercita estados prescritos e não valida esses limiares.
- Classificação de ambiente e estado sonoro são saídas distintas. Confiança de modelo só existe se modelo inferiu; não preencher com um valor decorativo.

No relatório, distinguir: inspeção de código, cálculo sintético, compilação, replay e medição física. Registrar o que foi executado e sob quais condições. Falta de evidência impede a alegação correspondente, não o planejamento nem o desenvolvimento desacoplado.
