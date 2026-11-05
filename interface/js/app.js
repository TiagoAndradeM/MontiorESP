import { criarValidador } from './validacao.js';
import { criarMonitor, conectarFonte } from './estado.js';
import { criarFonteMock } from './fontes/mock.js';
import { criarRenderizador } from './componentes.js';
import { carregarContrato } from './carregamento.js';

async function iniciar() {
  if (document.body.dataset.startupState !== 'carregando') return;
  const controlador = new AbortController();
  const cancelarInicio = () => controlador.abort();
  document.addEventListener('monitor:cancelar-inicio', cancelarInicio, { once: true });
  let contrato;
  try {
    contrato = await carregarContrato(new URL('../contratos/telemetria.schema.json', import.meta.url), { signal: controlador.signal });
  } finally {
    document.removeEventListener('monitor:cancelar-inicio', cancelarInicio);
  }
  if (controlador.signal.aborted || document.body.dataset.startupState !== 'carregando') return;
  const validar = criarValidador(contrato);
  const monitor = criarMonitor(validar);
  const renderizar = criarRenderizador();
  const cenario = document.getElementById('cenario');
  const pausar = document.getElementById('pause-button'), reiniciar = document.getElementById('reset-button');
  let fonte, desligar, pausado = false;
  const atualizar = () => renderizar(monitor.snapshot(), { pausado });
  function novaSessao() {
    desligar?.(); monitor.reiniciar(); pausado = false;
    fonte = criarFonteMock({ ambiente: document.body.dataset.environment, cenario: cenario.value });
    desligar = conectarFonte(monitor, fonte, atualizar);
    atualizar();
  }
  document.addEventListener('monitor:ambiente-alterado', () => {
    if (document.body.dataset.startupState === 'pronto') novaSessao();
  });
  const reiniciarSePronto = () => {
    if (document.body.dataset.startupState === 'pronto') novaSessao();
  };
  cenario.addEventListener('change', reiniciarSePronto);
  reiniciar.addEventListener('click', reiniciarSePronto);
  pausar.addEventListener('click', () => { pausado = !pausado; fonte.pausar(pausado); atualizar(); });
  try { novaSessao(); } catch (erro) { desligar?.(); throw erro; }
  pausar.disabled = false; reiniciar.disabled = false;
  document.dispatchEvent(new Event('monitor:pronto'));
  const timer = setInterval(atualizar, 250);
  window.addEventListener('pagehide', () => { clearInterval(timer); desligar?.(); });
  window.addEventListener('pageshow', (evento) => { if (evento.persisted) window.location.reload(); });
}

iniciar().catch((erro) => {
  console.error('Falha ao iniciar a simulação:', erro);
  document.dispatchEvent(new CustomEvent('monitor:falha', { detail: { message: erro.message } }));
});
