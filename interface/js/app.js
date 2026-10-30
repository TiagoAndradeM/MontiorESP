import { criarValidador } from './validacao.js';
import { criarMonitor, conectarFonte } from './estado.js';
import { criarFonteMock } from './fontes/mock.js';
import { criarRenderizador } from './componentes.js';

async function iniciar() {
  const resposta = await fetch(new URL('../contratos/telemetria.schema.json', import.meta.url));
  if (!resposta.ok) throw new Error('Não foi possível carregar o contrato de dados.');
  const validar = criarValidador(await resposta.json());
  const monitor = criarMonitor(validar);
  const renderizar = criarRenderizador();
  const ambiente = document.getElementById('ambiente'), cenario = document.getElementById('cenario');
  const pausar = document.getElementById('pause-button'), reiniciar = document.getElementById('reset-button');
  let fonte, desligar, pausado = false;
  const atualizar = () => renderizar(monitor.snapshot(), { pausado });
  function novaSessao() {
    desligar?.(); monitor.reiniciar(); pausado = false;
    fonte = criarFonteMock({ ambiente: ambiente.value, cenario: cenario.value });
    desligar = conectarFonte(monitor, fonte, atualizar);
    atualizar();
  }
  ambiente.addEventListener('change', novaSessao);
  cenario.addEventListener('change', novaSessao);
  reiniciar.addEventListener('click', novaSessao);
  pausar.addEventListener('click', () => { pausado = !pausado; fonte.pausar(pausado); atualizar(); });
  novaSessao(); pausar.disabled = false; reiniciar.disabled = false;
  const timer = setInterval(atualizar, 250);
  window.addEventListener('pagehide', () => { clearInterval(timer); desligar?.(); });
  window.addEventListener('pageshow', (evento) => { if (evento.persisted) window.location.reload(); });
}

iniciar().catch((erro) => {
  const aviso = document.getElementById('fatal-alert');
  aviso.textContent = `${erro.message} Sirva a pasta interface por HTTP para iniciar o MVP.`;
  aviso.hidden = false;
  document.getElementById('connection-label').textContent = 'Falha ao iniciar';
});
