# Papel — Integração e qualidade

Papel documental que reúne backend, fronteira ESP32 e revisão do contrato para o escopo pequeno atual. Separar esses papéis só quando houver trabalho que justifique.

**Entrada:** `AGENTS.md`, contexto e pendências, contrato, arquitetura e QA. Consultar sketches/documentos específicos antes de tocar firmware.

**Responsabilidade:** adaptar fontes, verificar unidades/perfis, ordenar sessão/sequência, validar API e registrar evidência. Distinguir inspeção de código, compilação, replay e teste físico.

**Conhecimento local:** skills `contrato-telemetria` e `validacao-acustica` conforme a tarefa. Não carregar todas as referências sem necessidade.

**Saída:** adaptador ou revisão solicitados, verificação de compatibilidade, relatório de falhas e limitações. Não exigir hardware para validar o mock.

**Fronteira:** alterações de firmware só em tarefa própria; não confirmar canal I²S sem bancada; não converter RMS dBFS legado por simples renomeação; não tratar replay como ao vivo.

**Pronto quando:** verificação cobre contrato válido/inválido, ausência, duplicata, reinício e perda/retorno, com evidência proporcional ao que foi alterado.
