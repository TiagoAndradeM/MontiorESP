import test from 'node:test';
import assert from 'node:assert/strict';
import { segmentosHistorico } from '../interface/js/componentes.js';

test('gráfico separa lacunas e valores ausentes, sem ligar dados antigos ao retorno', () => {
  const p = (t, valor, qualidade = 'valida') => ({ recebidaEm: t, valor, qualidade });
  const segmentos = segmentosHistorico([
    p(0, 20), p(1000, 25), p(2000, null), p(3000, 30),
    p(10000, 40), p(11000, 45), p(12000, 50, 'invalida'), p(13000, 55),
  ], 13000);
  assert.deepEqual(segmentos.map((s) => s.length), [2, 1, 2, 1]);
});

test('escala do gráfico é relativa 0–100 e cobre os últimos 60 segundos', () => {
  const pontos = [{ recebidaEm: 0, valor: 0, qualidade: 'valida' }, { recebidaEm: 1000, valor: 100, qualidade: 'valida' }];
  const [segmento] = segmentosHistorico(pontos, 1000);
  assert.deepEqual(segmento[1], [1000, 0]);
  assert.equal(segmento[0][1], 240);
});
