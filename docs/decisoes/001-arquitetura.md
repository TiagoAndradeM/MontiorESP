# ADR-001 — MVP simulado e evolução para backend local

Data: 30/10/2026. Status: adotada para o planejamento; implementação pendente.

**Problema:** desenvolver interface antes do hardware e permitir evolução para histórico e possível ML.

**Alternativas:** A, ESP32 serve interface e indicadores; B, ESP32 envia indicadores a um backend Python; desenvolver mock no navegador antes de qualquer integração.

**Decisão:** começar pelo mock no navegador. Para o MVP acadêmico integrado, recomendar B local; manter A como alternativa se operar sem computador se tornar requisito.

**Justificativa:** menor dependência de bancada no primeiro incremento, separação de responsabilidades e aproveitamento conceitual da ponte Python já existente. Comparação completa em [arquitetura](../arquitetura.md).

**Consequências:** integração B exige host ativo e rede alcançável. Não construir servidor no ESP32, API Python e mock completo hoje. Frontend recebe o mesmo contrato independentemente da fonte.

**Reavaliar quando:** P05 exigir autonomia sem host, houver restrição de rede, ou medições de latência/recursos contradisserem a proposta.
