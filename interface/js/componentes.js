const NOMES = { baixo: 'Baixo', moderado: 'Moderado', elevado: 'Elevado', indeterminado: 'Indeterminado' };
const SIMBOLOS = { baixo: '○', moderado: '◐', elevado: '●', indeterminado: '○' };
const STATUS = { aguardando: 'Aguardando dados', conectado: 'Simulador conectado', erro: 'Erro nos dados',
  desatualizado: 'Dados desatualizados', desconectado: 'Sem conexão' };
const DESCRICOES = { baixo: 'Cenário de baixa intensidade relativa.', moderado: 'Cenário de intensidade relativa moderada.',
  elevado: 'Cenário de intensidade relativa elevada.', indeterminado: 'Sem indicador disponível nesta janela.' };
const ORIGENS = { simulado: ['SIMULAÇÃO', 'dados simulados'], real: ['DADOS REAIS', 'dados reais'], replay: ['REPRODUÇÃO', 'dados gravados'] };
const fmt = (v, casas = 0) => v == null ? 'Indisponível' : v.toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: casas });

export function segmentosHistorico(historico, agora) {
  const segmentos = []; let atual = [], anterior = null;
  for (const ponto of historico) {
    const valido = ponto.valor !== null && ponto.qualidade === 'valida';
    if (!valido || (anterior !== null && ponto.recebidaEm - anterior > 1700)) {
      if (atual.length) segmentos.push(atual);
      atual = [];
    }
    if (valido) atual.push([Math.max(0, Math.min(1000, 1000 - (agora - ponto.recebidaEm) / 60)), 240 - ponto.valor * 2.4]);
    anterior = ponto.recebidaEm;
  }
  if (atual.length) segmentos.push(atual);
  return segmentos;
}

export function criarRenderizador(doc = document) {
  const el = (id) => doc.getElementById(id);
  const texto = (id, valor) => { if (el(id).textContent !== valor) el(id).textContent = valor; };
  let desenhoAnterior = '';
  return (s, { pausado = false } = {}) => {
    const d = s.ultima;
    const estado = s.confiavel ? d?.estado ?? 'indeterminado' : 'indeterminado';
    const origem = d?.modo ?? 'simulado';
    const descr = s.idadeMs === null ? 'Aguardando a primeira amostra.' : s.confiavel ? DESCRICOES[estado]
      : s.status === 'erro' ? 'A última amostra válida foi preservada.' : 'Sem uma leitura atual confiável.';
    texto('connection-label', s.status === 'conectado' && origem !== 'simulado'
      ? origem === 'real' ? 'Fonte conectada' : 'Reprodução conectada' : STATUS[s.status]);
    el('connection-dot').dataset.status = s.status;
    texto('state-label', NOMES[estado]); texto('state-symbol', SIMBOLOS[estado]);
    el('state-indicator').dataset.state = estado; texto('state-description', descr);
    texto('intensity-value', d?.intensidade_relativa == null ? '—' : fmt(d.intensidade_relativa));
    el('intensity-fill').style.width = `${d?.intensidade_relativa ?? 0}%`;
    const meter = el('intensity-meter');
    if (d?.intensidade_relativa != null) meter.setAttribute('aria-valuenow', d.intensidade_relativa);
    else meter.removeAttribute('aria-valuenow');
    meter.setAttribute('aria-valuetext', d?.intensidade_relativa == null ? 'Indisponível'
      : `${fmt(d.intensidade_relativa)} de 100${s.confiavel ? '' : ', última leitura, sem atualização'}`);
    texto('update-age', s.idadeMs === null ? 'Nenhuma amostra recebida' : `${s.confiavel ? 'Atualizado' : 'Última leitura'} há ${Math.floor(s.idadeMs / 1000)} s`);
    texto('origin-label', ORIGENS[origem][0]); texto('history-origin', ORIGENS[origem][1]);
    texto('chart-title', `Histórico de intensidade relativa — ${ORIGENS[origem][1]}`);
    texto('pause-label', pausado ? 'Retomar' : 'Pausar'); texto('pause-icon', pausado ? '▷' : 'Ⅱ');
    el('pause-button').setAttribute('aria-pressed', String(pausado));
    const aviso = s.erro ? `Mensagem rejeitada: ${s.erro}. Aguardando novos dados válidos.`
      : d?.qualidade === 'invalida' ? 'Janela inválida: os indicadores estão indisponíveis.'
        : d?.qualidade === 'degradada' ? 'Qualidade degradada: o estado do ambiente está indeterminado.'
          : s.status === 'desconectado' ? 'A fonte parou de enviar dados. Retome a simulação para continuar.'
            : s.status === 'desatualizado' ? 'Sem nova amostra há mais de 3 segundos. Os valores exibidos são da última leitura.' : '';
    el('data-alert').hidden = !aviso; texto('data-alert', aviso);
    texto('rms-value', fmt(d?.rms_normalizado, 3));
    texto('dbfs-value', d?.rms_dbfs == null ? 'Indisponível' : `${fmt(d.rms_dbfs, 2)} dBFS`);
    texto('frequency-value', d?.frequencia_dominante_hz == null ? 'Indisponível' : `${fmt(d.frequencia_dominante_hz)} Hz`);
    texto('window-value', d ? `${fmt(d.janela_ms)} ms / ${fmt(d.fs_hz)} Hz` : 'Indisponível');
    texto('intensity-profile', d?.perfil_intensidade_id ?? 'Indisponível');
    texto('state-profile', d?.perfil_regra_id ?? 'Indisponível');
    texto('acquisition-profile', d?.perfil_aquisicao_id ?? 'Indisponível');
    texto('quality-label', `Qualidade da janela: ${d ? { valida: 'válida (integridade do dado)', degradada: 'degradada', invalida: 'inválida' }[d.qualidade] : 'indisponível'}.`);
    texto('sample-count', String(s.historico.length));
    const valores = s.historico.filter((p) => p.valor !== null && p.qualidade === 'valida').map((p) => p.valor);
    const resumo = valores.length ? `Nesta janela: mínimo ${fmt(Math.min(...valores))} · máximo ${fmt(Math.max(...valores))}. Escala relativa.` : 'Sem indicadores disponíveis nesta janela.';
    texto('history-summary', resumo); texto('chart-description', `${resumo} Origem: ${ORIGENS[origem][1]}. Intervalos sem dados não são conectados.`);
    const segmentos = segmentosHistorico(s.historico, s.agora);
    el('chart-empty').hidden = segmentos.length > 0;
    const desenho = JSON.stringify(segmentos);
    if (desenho !== desenhoAnterior) {
      desenhoAnterior = desenho;
      el('chart-lines').replaceChildren(); el('chart-areas').replaceChildren();
      for (const pontos of segmentos) {
        const caminho = pontos.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
        const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', caminho); path.setAttribute('class', 'chart-line'); el('chart-lines').append(path);
        if (pontos.length === 1) {
          const bolinha = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
          bolinha.setAttribute('cx', pontos[0][0]); bolinha.setAttribute('cy', pontos[0][1]);
          bolinha.setAttribute('r', '3'); bolinha.setAttribute('class', 'chart-point'); el('chart-lines').append(bolinha);
        } else {
          const area = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
          area.setAttribute('d', `${caminho} L${pontos.at(-1)[0]} 240 L${pontos[0][0]} 240 Z`);
          area.setAttribute('class', 'chart-area'); el('chart-areas').append(area);
        }
      }
    }
  };
}
