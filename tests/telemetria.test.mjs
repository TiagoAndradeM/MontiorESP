import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { criarValidador } from '../interface/js/validacao.js';
import { criarMonitor, conectarFonte } from '../interface/js/estado.js';
import { amostraDemo, criarFonteMock, CENARIOS } from '../interface/js/fontes/mock.js';

const schema = JSON.parse(await readFile(new URL('../docs/contratos/telemetria.schema.json', import.meta.url)));
const validar = criarValidador(schema);
function bancada() {
  let tempo = 0;
  const monitor = criarMonitor(validar, { agora: () => tempo });
  return { monitor, tempo: (v) => { tempo = v; } };
}

test('exemplos canônicos passam pelo mesmo validador do navegador', async () => {
  for (const nome of ['exemplo-simulado', 'exemplo-indisponivel']) {
    const exemplo = JSON.parse(await readFile(new URL(`../docs/contratos/${nome}.json`, import.meta.url)));
    assert.equal(validar(exemplo).valido, true);
  }
});

test('contrato rejeita mensagem malformada e campos/tipos/faixas incorretos', () => {
  for (const alteracao of [
    { intensidade_relativa: 101 }, { sequencia: '1' }, { fonte_id: ' ' },
    { versao_contrato: '2.0' }, { rms_normalizado: NaN }, { rms_normalizado: Infinity },
    { janela_ms: 0 }, { extra: 1 }, { modo: 'online' }, { sequencia: true },
    { perfil_intensidade_id: null }, { perfil_regra_id: null }, { perfil_aquisicao_id: null },
    { qualidade: 'degradada' }, { qualidade: 'invalida' },
  ]) assert.equal(validar({ ...amostraDemo(), ...alteracao }).valido, false, JSON.stringify(alteracao));
  assert.equal(validar('{falha').valido, false);
  const semOrigem = amostraDemo(); delete semOrigem.modo;
  assert.equal(validar(semOrigem).valido, false);
});

test('timestamp exige UTC e data de calendário real', () => {
  for (const timestamp of ['2026-02-30T12:00:00Z', '2026-10-30T25:00:00Z', '2026-10-30T12:00:00-03:00', 'amanhã']) {
    assert.equal(validar({ ...amostraDemo(), timestamp }).valido, false);
  }
  assert.equal(validar({ ...amostraDemo(), timestamp: '2026-10-30T12:00:00.123Z' }).valido, true);
});

test('semântica valida Nyquist, soma das bandas e zero no logaritmo', () => {
  assert.equal(validar({ ...amostraDemo(), frequencia_dominante_hz: 9000 }).valido, false);
  assert.equal(validar({ ...amostraDemo(), bandas: { perfil_id: 'teste', graves_pct: 20, medios_pct: 60, agudos_pct: 10 } }).valido, false);
  assert.equal(validar({ ...amostraDemo(), rms_normalizado: 0, rms_dbfs: -100 }).valido, false);
  assert.equal(validar({ ...amostraDemo(), rms_normalizado: 0, rms_dbfs: null }).valido, true);
});

test('roteiros são determinísticos e nunca inventam espectro/classificação', () => {
  for (const cenario of Object.keys(CENARIOS)) {
    const d = amostraDemo({ cenario, indice: 14 });
    assert.deepEqual(d, amostraDemo({ cenario, indice: 14 }));
    assert.equal(validar(d).valido, true, cenario);
    assert.equal(d.modo, 'simulado');
    assert.equal(d.frequencia_dominante_hz, null);
    assert.equal(d.classificacao, null);
    if (d.rms_normalizado) assert.ok(Math.abs(20 * Math.log10(d.rms_normalizado) - d.rms_dbfs) < 0.0001);
  }
});

test('espera, leitura, desatualização, desconexão e retorno usam recepção monotônica', () => {
  const { monitor, tempo } = bancada();
  assert.equal(monitor.snapshot().status, 'aguardando');
  monitor.receber(amostraDemo());
  assert.equal(monitor.snapshot().status, 'conectado');
  tempo(3000); assert.equal(monitor.snapshot().status, 'desatualizado');
  tempo(10000); assert.equal(monitor.snapshot().status, 'desconectado');
  monitor.receber(amostraDemo({ indice: 1 }));
  assert.equal(monitor.snapshot().status, 'conectado');
});

test('duplicatas não renovam frescor nem histórico; conflitos são erros', () => {
  const { monitor, tempo } = bancada();
  const dado = amostraDemo(); monitor.receber(dado);
  tempo(4000); monitor.receber({ ...dado });
  assert.equal(monitor.snapshot().historico.length, 1);
  assert.equal(monitor.snapshot().idadeMs, 4000);
  const conflito = { ...dado, intensidade_relativa: 77 };
  assert.equal(monitor.receber(conflito).aceito, false);
  assert.match(monitor.snapshot().erro, /Conflito/);
});

test('fora de ordem e relógio regressivo não sobrescrevem a última válida', () => {
  const { monitor } = bancada();
  monitor.receber(amostraDemo({ indice: 5 }));
  assert.equal(monitor.receber(amostraDemo({ indice: 3 })).aceito, false);
  assert.equal(monitor.receber({ ...amostraDemo({ indice: 6 }), tempo_ativo_ms: 1000 }).aceito, false);
  assert.equal(monitor.snapshot().ultima.sequencia, 5);
});

test('erro de dados preserva a última válida e ausência nunca vira zero', () => {
  const { monitor } = bancada(); monitor.receber(amostraDemo());
  monitor.receber('invalido');
  assert.equal(monitor.snapshot().status, 'erro');
  assert.equal(monitor.snapshot().ultima.sequencia, 0);
  monitor.receber(amostraDemo({ cenario: 'ausente', indice: 1 }));
  assert.equal(monitor.snapshot().ultima.intensidade_relativa, null);
  assert.equal(monitor.snapshot().confiavel, true);
  assert.equal(monitor.snapshot().historico.at(-1).valor, null);
});

test('contextos diferentes não misturam séries e sessão antiga não retorna', () => {
  for (const mudanca of [{ ambiente: 'oficina' }, { modo: 'replay' }, { perfil_regra_id: 'demo-estados-v2' },
    { perfil_intensidade_id: 'demo-intensidade-v2' }, { perfil_aquisicao_id: 'demo-aquisicao-v2' },
    { fonte_id: 'outra-fonte' }, { sessao_id: 'outra-sessao' }]) {
    const { monitor } = bancada(); monitor.receber(amostraDemo());
    monitor.receber({ ...amostraDemo({ indice: 1 }), ...mudanca });
    assert.equal(monitor.snapshot().historico.length, 1, JSON.stringify(mudanca));
  }
  const { monitor } = bancada(); monitor.receber(amostraDemo());
  monitor.receber(amostraDemo({ sessao: 'nova' }));
  assert.equal(monitor.receber(amostraDemo({ indice: 100 })).aceito, false);
});

test('15 minutos simulados mantêm no máximo 60 pontos e expiram sem dados', () => {
  const { monitor, tempo } = bancada();
  for (let i = 0; i < 900; i += 1) {
    tempo(i * 1000); monitor.receber(amostraDemo({ indice: i }));
    assert.ok(monitor.snapshot().historico.length <= 60);
  }
  assert.equal(monitor.snapshot().historico.length, 60);
  tempo(961000); assert.equal(monitor.snapshot().historico.length, 0);
});

test('fonte alternativa usa o mesmo consumidor, sem acoplamento ao simulador', () => {
  const { monitor } = bancada(); let encerrou = false;
  const fonte = { iniciar(receber) { receber({ ...amostraDemo(), fonte_id: 'teste-alternativo', modo: 'replay' }); }, parar() { encerrou = true; } };
  const desligar = conectarFonte(monitor, fonte);
  assert.equal(monitor.snapshot().ultima.modo, 'replay');
  assert.equal(monitor.snapshot().ultima.fonte_id, 'teste-alternativo');
  desligar(); assert.equal(encerrou, true);
});

test('fonte mock agenda em 1 Hz, pausa, retoma e cancela o timer', () => {
  let tick, cancelado = false; const recebidos = [];
  const fonte = criarFonteMock({ agendar(fn, intervalo) { tick = fn; assert.equal(intervalo, 1000); return 42; },
    cancelar(id) { assert.equal(id, 42); cancelado = true; }, sessaoId: () => 'teste' });
  fonte.iniciar((d) => recebidos.push(d), () => {});
  assert.equal(recebidos.length, 0);
  tick(); fonte.pausar(true); tick(); assert.equal(recebidos.length, 1);
  fonte.pausar(false); tick(); assert.equal(recebidos.length, 2);
  assert.equal(recebidos[1].sequencia, 1);
  fonte.parar(); assert.equal(cancelado, true);
});
