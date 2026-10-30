# MVP simulado — Falcons

Tela HTML/CSS/JavaScript, sem dependências de execução, sem build e sem placa. Os indicadores são explicitamente sintéticos. Não há backend, persistência ou ML.

## Executar

Nesta pasta: `python -m http.server 8000 --bind 127.0.0.1`.

Abrir `http://127.0.0.1:8000/`. Encerrar com Ctrl+C. Não abrir `index.html` por `file://`, pois módulos e carregamento do contrato precisam de HTTP.

Selecionar ambiente ou cenário inicia uma sessão nova e limpa o histórico. Pausar mantém a última leitura identificada e exercita desatualização em 3 s e desconexão em 10 s. Reiniciar limpa a sessão. Duplicatas não contam como dados novos. O gráfico guarda até 60 pontos em 60 segundos e não conecta lacunas.

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
