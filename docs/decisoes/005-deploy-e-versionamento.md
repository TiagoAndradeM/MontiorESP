# ADR-005 — Git por incremento e deploy estático manual

Data: 30/10/2026. Status: adotada para o MVP; publicação ainda não executada.

**Problema:** tornar o desenvolvimento revisável no GitHub e preparar deploy sem misturar a simulação com a futura integração física.

**Alternativas:** enviar tudo para main e publicar a cada push; publicar o MVP estático por workflow manual; introduzir hospedagem de backend e cloud agora.

**Decisão:** branch de feature, commits coesos e CI automático. Preparar GitHub Pages para publicar somente `interface/` a partir da main por execução manual. Python/hardware permanecem em host local na etapa de integração. Não habilitar hospedagem nem executar deploy nesta entrega.

**Justificativa:** o MVP é estático, independente de hardware e sem dependências externas. Pages atende à demonstração; não executa backend Python. Separar o job de validação e o de publicação mantém revisão e rastreabilidade.

**Consequências:** primeiro deploy requer integrar a branch, configurar Pages conforme elegibilidade do repositório e executar workflow. Nenhum backend/ESP32 fica acessível por publicar o mock. Fonte de dados, rede e hospedagem do backend exigirão nova decisão.

**Reavaliar quando:** houver requisito de deploy automático, integração real remota, autenticação, retenção ou operação contínua. Procedimento em [deploy](../deploy.md).
