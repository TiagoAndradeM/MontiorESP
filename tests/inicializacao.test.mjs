import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const codigo = await readFile(new URL('../interface/js/inicializacao.js', import.meta.url), 'utf8');

class Elemento extends EventTarget {
  constructor() {
    super();
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.atributos = new Map();
  }
  setAttribute(nome, valor) { this.atributos.set(nome, valor); }
  getAttribute(nome) { return this.atributos.get(nome) ?? null; }
  click() {
    if (!this.disabled) this.dispatchEvent(new Event('click'));
  }
}

function pagina(src = 'http://127.0.0.1:8000/js/inicializacao.js') {
  const document = new EventTarget();
  document.body = new Elemento();
  document.body.dataset = { environment: 'biblioteca', startupState: 'carregando' };
  const ids = new Map(['fatal-alert', 'startup-message', 'retry-button', 'connection-label',
    'connection-dot', 'pause-button', 'reset-button'].map((id) => [id, new Elemento()]));
  ids.get('fatal-alert').hidden = true;
  ids.get('retry-button').hidden = true;
  ids.get('connection-label').textContent = 'Preparando simulação';
  const retryOriginal = () => {};
  ids.get('retry-button').onclick = retryOriginal;
  const ambientes = ['biblioteca', 'sala_aula', 'oficina'].map((ambiente) => {
    const botao = new Elemento();
    botao.dataset.environment = ambiente;
    botao.setAttribute('aria-pressed', String(ambiente === 'biblioteca'));
    return botao;
  });
  const modulos = [];
  const timers = new Map();
  let proximoTimer = 0;
  let cancelamentos = 0;
  const mudancas = [];
  document.currentScript = { src };
  document.getElementById = (id) => ids.get(id) ?? null;
  document.querySelectorAll = (seletor) => {
    assert.equal(seletor, '.environment-button[data-environment]');
    return ambientes;
  };
  document.createElement = (tag) => { assert.equal(tag, 'script'); return new Elemento(); };
  document.head = { appendChild(modulo) { modulos.push(modulo); } };
  document.addEventListener('monitor:cancelar-inicio', () => { cancelamentos += 1; });
  document.addEventListener('monitor:ambiente-alterado', (evento) => mudancas.push({
    ambiente: evento.detail.ambiente,
    body: document.body.dataset.environment,
    selecionados: ambientes.filter((botao) => botao.getAttribute('aria-pressed') === 'true').length,
  }));
  vm.runInNewContext(codigo, {
    document, Event, CustomEvent, URL,
    setTimeout(fn, ms) { const id = ++proximoTimer; timers.set(id, { fn, ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
  }, { filename: 'inicializacao.js' });
  return {
    document, ambientes, modulos, timers, mudancas, retryOriginal,
    el: (id) => ids.get(id),
    pronto: () => document.dispatchEvent(new Event('monitor:pronto')),
    falha: (message) => document.dispatchEvent(new CustomEvent('monitor:falha', { detail: { message } })),
    cancelamentos: () => cancelamentos,
    esgotarTempo() {
      const [id, timer] = [...timers][0];
      assert.equal(timer.ms, 10000);
      timers.delete(id);
      timer.fn();
    },
  };
}

test('bootstrap clássico prepara o módulo relativo e mantém o menu disponível antes de ele executar', () => {
  const p = pagina('https://exemplo.test/projeto/js/inicializacao.js');
  assert.equal(p.modulos.length, 1);
  assert.equal(p.modulos[0].type, 'module');
  assert.equal(p.modulos[0].src, 'https://exemplo.test/projeto/js/app.js');
  assert.equal(p.document.body.dataset.startupState, 'carregando');
  assert.ok(p.ambientes.every((botao) => !botao.disabled));
  p.ambientes[1].click();
  assert.equal(p.document.body.dataset.environment, 'sala_aula');
  assert.deepEqual(p.mudancas, [{ ambiente: 'sala_aula', body: 'sala_aula', selecionados: 1 }]);
  assert.deepEqual(p.ambientes.map((botao) => botao.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  p.ambientes[2].click();
  assert.equal(p.document.body.dataset.environment, 'oficina');
  assert.deepEqual(p.ambientes.map((botao) => botao.getAttribute('aria-pressed')), ['false', 'false', 'true']);
});

test('clicar no ambiente ativo não emite troca nem altera a seleção', () => {
  const p = pagina();
  p.ambientes[0].click();
  assert.equal(p.mudancas.length, 0);
  p.ambientes[1].click();
  p.ambientes[1].click();
  assert.equal(p.mudancas.length, 1);
  assert.equal(p.ambientes[1].getAttribute('aria-pressed'), 'true');
});

test('pronto encerra o watchdog e ignora erros de carregamento posteriores', () => {
  const p = pagina();
  const callbackPendente = [...p.timers.values()][0].fn;
  p.pronto();
  assert.equal(p.document.body.dataset.startupState, 'pronto');
  assert.equal(p.timers.size, 0);
  assert.equal(p.el('fatal-alert').hidden, true);
  assert.equal(p.el('startup-message').hidden, true);
  assert.equal(p.el('retry-button').hidden, true);
  p.modulos[0].dispatchEvent(new Event('error'));
  callbackPendente();
  assert.equal(p.document.body.dataset.startupState, 'pronto');
  assert.equal(p.cancelamentos(), 0);
});

test('erro no grafo de módulos mostra recuperação e cancela o início sem travar o menu', () => {
  const p = pagina();
  p.el('pause-button').disabled = false;
  p.el('reset-button').disabled = false;
  p.modulos[0].dispatchEvent(new Event('error'));
  assert.equal(p.document.body.dataset.startupState, 'erro');
  assert.match(p.el('startup-message').textContent, /carregar os arquivos/);
  assert.equal(p.el('fatal-alert').hidden, false);
  assert.equal(p.el('startup-message').hidden, false);
  assert.equal(p.el('retry-button').hidden, false);
  assert.equal(p.el('retry-button').onclick, p.retryOriginal);
  assert.equal(p.el('connection-label').textContent, 'Falha ao iniciar');
  assert.equal(p.el('connection-dot').dataset.status, 'erro');
  assert.equal(p.el('pause-button').disabled, true);
  assert.equal(p.el('reset-button').disabled, true);
  assert.equal(p.timers.size, 0);
  assert.equal(p.cancelamentos(), 1);
  p.ambientes[2].click();
  assert.equal(p.document.body.dataset.environment, 'oficina');
  assert.equal(p.mudancas.length, 1);
  assert.ok(p.ambientes.every((botao) => !botao.disabled));
});

test('watchdog de dez segundos transforma carregamento indefinido em falha e cancela a operação', () => {
  const p = pagina();
  p.esgotarTempo();
  assert.equal(p.document.body.dataset.startupState, 'erro');
  assert.match(p.el('startup-message').textContent, /tempo esperado/);
  assert.equal(p.el('fatal-alert').hidden, false);
  assert.equal(p.el('retry-button').hidden, false);
  assert.equal(p.cancelamentos(), 1);
  assert.equal(p.timers.size, 0);
});

test('falha do aplicativo usa a mensagem amigável e não é sobrescrita por outra falha', () => {
  const p = pagina();
  p.falha('O contrato de dados não pôde ser carregado.');
  p.falha('Outra falha posterior.');
  p.modulos[0].dispatchEvent(new Event('error'));
  assert.equal(p.el('startup-message').textContent, 'O contrato de dados não pôde ser carregado.');
  assert.equal(p.cancelamentos(), 1);
});

test('sucesso tardio não esconde o erro nem reabre uma inicialização cancelada', () => {
  const p = pagina();
  p.esgotarTempo();
  p.pronto();
  assert.equal(p.document.body.dataset.startupState, 'erro');
  assert.equal(p.el('fatal-alert').hidden, false);
  assert.equal(p.el('retry-button').hidden, false);
  assert.equal(p.el('pause-button').disabled, true);
  assert.equal(p.el('reset-button').disabled, true);
  assert.match(p.el('startup-message').textContent, /tempo esperado/);
});
