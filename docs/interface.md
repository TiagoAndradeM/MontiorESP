# MVP da interface

Especificação de T01, implementada antecipadamente em 30/10/2026 por pedido explícito do usuário. Código em `interface/`; execução em `interface/README.md`. Esta tela usa apenas dados simulados.

## Uma tela, ordem de leitura

1. Nome do projeto, origem sempre visível e condição de conexão.
2. Ambiente monitorado, com seleção manual no mock: Biblioteca / Sala de aula / Oficina ou laboratório.
3. Estado atual por texto e símbolo, acompanhado de indicador visual; valores possíveis: Baixo, Moderado, Elevado e Indeterminado. São categorias relativas a um perfil, sem diagnóstico legal ou de saúde.
4. Intensidade relativa: valor 0–100 e barra simples, com perfil identificado nos detalhes. Sem perfil real, exibir “Indisponível”.
5. Gráfico da intensidade nos últimos 60 segundos; eixo de tempo e escala relativa rotulados, origem indicada. Até 60 pontos no mock de 1 Hz.
6. Painel expansível “Detalhes técnicos”: RMS normalizado, RMS dBFS quando fornecido, janela, taxa de amostragem, frequência dominante e bandas quando disponíveis. ML ausente não ocupa destaque.
7. Controles de demonstração: cenário, pausar, retomar e reiniciar. Não confundir esses controles com configuração do hardware.

Rascunho textual de hierarquia, sem valores de medição:

```text
Monitor de Poluição Sonora              DADOS SIMULADOS · Aguardando
Ambiente [Biblioteca ▾]
Estado: Indeterminado                  Intensidade relativa: — / 100
[Indicador visual com texto]
[Histórico temporal — sem dados]
[Detalhes técnicos ▸]
[Cenário ▾] [Pausar] [Reiniciar]
```

## Estados de experiência

| Situação | Tela e comportamento |
|---|---|
| Inicial | “Aguardando dados”, sem números, sem gráfico preenchido |
| Simulado | Banner “DADOS SIMULADOS — demonstração”; estados vêm do roteiro, não de medição |
| Real | Origem real explícita; sem prometer calibração; perfil ausente leva a `indeterminado` |
| Replay futuro | “REPRODUÇÃO — dados gravados”; nunca “ao vivo” |
| Sem métrica | Traço/“Indisponível”, sem inserir zero |
| Qualidade degradada | Aviso textual; conservar apenas métricas válidas, sem sugerir classificação confiável |
| Desatualizado | Após 3 s sem nova amostra: “Dados desatualizados”; último valor com idade, sem indicar estado atual confiável |
| Desconectado | Após 10 s: “Sem conexão”; histórico preservado até sair da janela, com lacuna |
| Mensagem inválida | Rejeitar, mostrar erro de dados; última válida permanece identificada como anterior e envelhece normalmente |
| Retorno | Nova sequência válida da mesma sessão retoma dados; não preencher lacuna retroativamente |
| Troca de contexto | Ambiente/fonte/sessão/perfil alterado: limpar histórico e aguardar amostra compatível |

Conexão e estado sonoro são informações independentes. Verde não representa ausência de dados. Alertas sonoros e buzzer não fazem parte deste MVP.

## Aparência e acessibilidade

Fundo claro ou neutro, texto legível, uma cor de destaque, estados distinguíveis por texto e símbolo. Controles com rótulo, foco visível, uso por teclado e painel de status anunciado com moderação; evitar anúncio de cada leitura. Cards empilham em 360 px e se distribuem em 1280 px. Gráfico simples em Canvas ou SVG nativo, sem biblioteca obrigatória; fornecer resumo textual da tendência/último valor, sem depender só do desenho.

## Demonstração sintética

Roteiros determinísticos: estável baixo, moderado, elevado, transição, `null`, qualidade inválida, mensagem malformada, duplicata e interrupção/retorno. Valores declarados sintéticos; não reutilizar CSV real como mock silencioso. Perfil `demo-v1` é exclusivo de demonstração e não define limiares do dispositivo real. Proposta: 10–15 minutos de execução para validar memória limitada e mudanças de estado.

Aceite: [RF01–RF09](requisitos.md) e [cenários QA](qa.md). Não criar telas adicionais, cadastro, login ou configurações de nuvem.
