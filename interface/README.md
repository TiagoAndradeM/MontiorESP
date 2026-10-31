# MVP simulado — MONITOR SONORO

Tela HTML/CSS/JavaScript, sem dependências de execução, sem build e sem placa. Os indicadores são explicitamente sintéticos. Não há backend, persistência ou ML.

## Executar

Nesta pasta: `python -m http.server 8000 --bind 127.0.0.1`.

Abrir `http://127.0.0.1:8000/`. Encerrar com Ctrl+C. Não abrir `index.html` por `file://`, pois módulos e carregamento do contrato precisam de HTTP.

Escolher outro ambiente pelos três botões visíveis inicia uma sessão nova e limpa o histórico. Clicar no ambiente já ativo mantém a sessão. Biblioteca usa verde `#18844A`, Sala de aula usa azul `#2563EB` e Laboratório / oficina usa laranja `#EA580C`; gráficos e indicadores acompanham a escolha sobre a base preta/branca. Os botões têm indicação acessível de seleção e funcionam por teclado.

Abrir **Controles da simulação**, abaixo do dashboard, para trocar o cenário, pausar ou reiniciar. Trocar o cenário também inicia nova sessão e limpa o histórico. Pausar mantém a última leitura identificada e exercita desatualização em 3 s e desconexão em 10 s. Reiniciar limpa a sessão. Duplicatas não contam como dados novos. O gráfico guarda até 60 pontos em 60 segundos e não conecta lacunas.

A revisão visual aprovada em 31/10/2026 foi aplicada ao código, preservando o mock e o contrato existentes. A validação da adaptação está em [QA](../docs/qa.md#resultado-de-t01a--31102026). A aplicação continua usando Segoe UI; a troca para Noto Sans ocorreu apenas no arquivo de protótipo do Figma. O texto pequeno do botão laranja usa `#C2410C` para contraste, mantendo `#EA580C` nos gráficos e números grandes.

## Verificar

Na raiz do repositório: `node scripts/verificar.mjs` ou `npm run check`. Node é somente ferramenta de desenvolvimento/teste; o navegador não depende dele. Nenhum `npm install` é necessário. Os testes usam relógio controlado para exercitar 15 minutos simulados sem esperar 15 minutos reais.

## Organização

- `js/validacao.js`: valida o subconjunto documentado do schema e regras semânticas.
- `js/fontes/mock.js`: cenários determinísticos a 1 Hz.
- `js/estado.js`: sessão, ordenação, frescor e histórico; interface de fonte substituível.
- `js/componentes.js`: apresentação e gráfico SVG sem biblioteca.
- `js/app.js`: liga controles, fonte e renderização.
- `contratos/telemetria.schema.json`: cópia de distribuição do contrato canônico de `docs/contratos`, conferida pelo CI para evitar divergência. Serve junto da interface, sem expor a raiz do projeto.

Perfis `demo-*` não são limiares acústicos. Frequência/bandas/classificação permanecem indisponíveis. [Contrato completo](../docs/contrato-dados.md), [estratégia de deploy](../docs/deploy.md).
