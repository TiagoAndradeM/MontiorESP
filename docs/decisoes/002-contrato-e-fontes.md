# ADR-002 — Contrato versionado e adaptadores

Data: 30/10/2026. Status: adotada como proposta 0.1.0; produtores existentes não migrados.

**Problema:** interface não deve depender de microfone, pinos, serial ou simulador específico.

**Alternativas:** componentes leem formatos brutos de cada fonte; formato único sem metadados; contrato versionado com adaptadores.

**Decisão:** contrato JSON único, modo explícito, sessão/sequência, perfil e unidades; fonte entrega dados e status por uma fronteira independente da renderização. Campos ausentes usam `null`/omissão conforme [contrato](../contrato-dados.md).

**Justificativa:** evitar duplicação da tela e interpretação equivocada de métricas. Timestamp sozinho não resolve reinício, falta de sincronização nem duplicata.

**Consequências:** schema e validação semântica são mantidos em conjunto. API antiga `/api/state` exige adaptação explícita; não mudar consumidores existentes nesta fase. Dados repetidos não renovam frescor.

**Reavaliar quando:** múltiplos dispositivos, novo formato, necessidade de outra cadência ou compatibilidade entre versões.
