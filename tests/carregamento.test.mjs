import test from 'node:test';
import assert from 'node:assert/strict';
import { carregarContrato } from '../interface/js/carregamento.js';

test('carregamento entrega o JSON e evita cache de dados iniciais', async () => {
  const contrato = { versao: 'teste' };
  let opcoes;
  const resultado = await carregarContrato('contrato.json', {
    buscar: async (url, opts) => {
      assert.equal(url, 'contrato.json'); opcoes = opts;
      return { ok: true, json: async () => contrato };
    },
  });
  assert.deepEqual(resultado, contrato);
  assert.equal(opcoes.cache, 'no-store');
  assert.equal(opcoes.signal.aborted, false);
});

test('resposta HTTP inválida mostra erro em vez de iniciar com dados incorretos', async () => {
  await assert.rejects(carregarContrato('contrato.json', {
    buscar: async () => ({ ok: false, status: 404 }),
  }), /erro 404/);
});

test('falha de conexão orienta verificar o servidor local', async () => {
  await assert.rejects(carregarContrato('contrato.json', {
    buscar: async () => { throw new TypeError('Failed to fetch'); },
  }), /servidor local/);
});

test('JSON inválido não deixa a inicialização pendente', async () => {
  await assert.rejects(carregarContrato('contrato.json', {
    buscar: async () => ({ ok: true, json: async () => { throw new SyntaxError('HTML em vez de JSON'); } }),
  }), /não puderam ser lidos/);
});

test('prazo encerra uma requisição travada, mesmo se a fonte ignora cancelamento', async () => {
  let sinal;
  await assert.rejects(carregarContrato('contrato.json', {
    limiteMs: 15,
    buscar: (_, { signal }) => { sinal = signal; return new Promise(() => {}); },
  }), /demorou demais/);
  assert.equal(sinal.aborted, true);
});

test('prazo também cobre corpo JSON que nunca termina de chegar', async () => {
  await assert.rejects(carregarContrato('contrato.json', {
    limiteMs: 15,
    buscar: async () => ({ ok: true, json: () => new Promise(() => {}) }),
  }), /demorou demais/);
});

test('cancelamento externo impede aguardar dados após falha do bootstrap', async () => {
  const controlador = new AbortController();
  let sinal;
  const carregando = carregarContrato('contrato.json', {
    signal: controlador.signal,
    buscar: (_, { signal }) => { sinal = signal; return new Promise(() => {}); },
  });
  controlador.abort();
  await assert.rejects(carregando, /cancelada/);
  assert.equal(sinal.aborted, true);
});

test('cancelamento anterior não dispara nova requisição', async () => {
  const controlador = new AbortController(); controlador.abort();
  let chamadas = 0;
  await assert.rejects(carregarContrato('contrato.json', {
    signal: controlador.signal, buscar: () => { chamadas++; },
  }), /cancelada/);
  assert.equal(chamadas, 0);
});
