// Bootstrap clássico: a navegação permanece disponível mesmo se um módulo falhar.
(() => {
  'use strict';

  const inicio = document.currentScript;
  const body = document.body;
  const ambientes = [...document.querySelectorAll('.environment-button[data-environment]')];
  const el = (id) => document.getElementById(id);
  let watchdog = null;

  for (const botao of ambientes) {
    botao.disabled = false;
    botao.addEventListener('click', () => {
      const ambiente = botao.dataset.environment;
      if (ambiente === body.dataset.environment) return;
      body.dataset.environment = ambiente;
      for (const opcao of ambientes) opcao.setAttribute('aria-pressed', String(opcao === botao));
      document.dispatchEvent(new CustomEvent('monitor:ambiente-alterado', { detail: { ambiente } }));
    });
  }

  function falhar(mensagem) {
    if (body.dataset.startupState !== 'carregando') return;
    body.dataset.startupState = 'erro';
    clearTimeout(watchdog);
    const aviso = el('startup-message');
    aviso.textContent = typeof mensagem === 'string' && mensagem.trim()
      ? mensagem : 'Não foi possível iniciar a simulação. Recarregue a página para tentar novamente.';
    aviso.hidden = false;
    el('fatal-alert').hidden = false;
    el('retry-button').hidden = false;
    el('connection-label').textContent = 'Falha ao iniciar';
    el('connection-dot').dataset.status = 'erro';
    el('pause-button').disabled = true;
    el('reset-button').disabled = true;
    document.dispatchEvent(new Event('monitor:cancelar-inicio'));
  }

  document.addEventListener('monitor:falha', (evento) => falhar(evento.detail?.message));
  document.addEventListener('monitor:pronto', () => {
    if (body.dataset.startupState !== 'carregando') return;
    body.dataset.startupState = 'pronto';
    clearTimeout(watchdog);
    el('fatal-alert').hidden = true;
    el('startup-message').hidden = true;
    el('retry-button').hidden = true;
  });

  watchdog = setTimeout(() => falhar(
    'A simulação não iniciou no tempo esperado. Recarregue a página para tentar novamente.'
  ), 10000);

  const modulo = document.createElement('script');
  modulo.type = 'module';
  modulo.src = new URL('./app.js', inicio.src).href;
  modulo.addEventListener('error', () => falhar(
    'Não foi possível carregar os arquivos da simulação. Recarregue a página para tentar novamente.'
  ));
  document.head.appendChild(modulo);
})();
