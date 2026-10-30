# ADR-003 — Grandezas digitais, perfis e ausência de calibração

Data: 30/10/2026. Status: adotada; perfis físicos continuam abertos.

**Problema:** dados relativos podem parecer medidas físicas; estados visuais podem parecer limites de poluição sonora.

**Alternativas:** chamar dBFS de dB SPL; converter para 0–100 com extremos arbitrários; exigir perfil explícito e declarar indisponibilidade até haver evidência.

**Decisão:** não usar dB SPL nesta etapa. RMS normalizado e RMS dBFS são distintos e rotulados. Intensidade relativa e estado real dependem de perfis documentados. Mock tem estados prescritos e perfis sintéticos identificados.

**Justificativa:** não há calibração acústica nem critérios reais de classificação definidos. Os limiares existentes no firmware são experimentais e não viram automaticamente requisitos da nova interface.

**Consequências:** métricas e estado reais podem ficar `null`/indeterminado enquanto o fluxo de dados já funciona. Não inventar FFT, bandas, confiança, conversão ou validade física a partir de um LED.

**Reavaliar quando:** houver procedimento de coleta, referências digitais confirmadas e validação documentada. Qualquer etapa de calibração terá especificação própria.
