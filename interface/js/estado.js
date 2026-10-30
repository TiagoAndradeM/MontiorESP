const chaveSessao = (d) => JSON.stringify([d.fonte_id, d.sessao_id]);
const contexto = (d) => JSON.stringify([
  d.fonte_id, d.sessao_id, d.modo, d.ambiente,
  d.perfil_intensidade_id, d.perfil_regra_id, d.perfil_aquisicao_id, d.bandas?.perfil_id ?? null,
]);
const canonico = (d) => JSON.stringify(d, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);

export function criarMonitor(validar, { agora = () => performance.now() } = {}) {
  let ultima = null, recebidaEm = null, historico = [], erro = '', contagem = 0;
  let assinatura = '', fonteStatus = 'aguardando';
  const encerradas = new Set();
  const podar = () => { historico = historico.filter((p) => agora() - p.recebidaEm < 60000).slice(-60); };
  function receber(payload) {
    const resultado = validar(payload);
    if (!resultado.valido) { erro = resultado.erros[0]; return { aceito: false, motivo: erro }; }
    const d = resultado.dado;
    if (encerradas.has(chaveSessao(d))) return { aceito: false, motivo: 'Sessão encerrada' };
    if (ultima && chaveSessao(d) === chaveSessao(ultima)) {
      if (d.sequencia === ultima.sequencia) {
        if (canonico(d) !== canonico(ultima)) erro = 'Conflito: sequência repetida com conteúdo diferente';
        return { aceito: false, motivo: erro || 'Duplicata' };
      }
      if (d.sequencia < ultima.sequencia || d.tempo_ativo_ms < ultima.tempo_ativo_ms) {
        erro = 'Amostra fora de ordem'; return { aceito: false, motivo: erro };
      }
    }
    if (ultima && chaveSessao(d) !== chaveSessao(ultima)) {
      encerradas.add(chaveSessao(ultima));
      if (encerradas.size > 32) encerradas.delete(encerradas.values().next().value);
    }
    if (ultima && contexto(d) !== contexto(ultima)) historico = [];
    ultima = d;
    recebidaEm = agora();
    historico.push({ recebidaEm, valor: d.intensidade_relativa, qualidade: d.qualidade });
    assinatura = contexto(d);
    contagem += 1; erro = ''; fonteStatus = 'conectado'; podar();
    return { aceito: true };
  }
  function reiniciar() {
    ultima = null; recebidaEm = null; historico = []; erro = ''; contagem = 0;
    assinatura = ''; fonteStatus = 'aguardando'; encerradas.clear();
  }
  return {
    receber, reiniciar,
    status(valor) {
      fonteStatus = valor;
      if (valor === 'erro') erro = 'A fonte informou um erro de comunicação';
    },
    snapshot() {
      podar();
      const idadeMs = recebidaEm === null ? null : Math.max(0, agora() - recebidaEm);
      const status = idadeMs !== null && idadeMs >= 10000 ? 'desconectado'
        : idadeMs !== null && idadeMs >= 3000 ? 'desatualizado'
          : erro ? 'erro' : ultima ? fonteStatus : fonteStatus === 'erro' ? 'erro' : 'aguardando';
      return {
        ultima: ultima ? structuredClone(ultima) : null, idadeMs, status, erro,
        historico: historico.map((p) => ({ ...p })), contagem, assinatura,
        agora: agora(), confiavel: status === 'conectado' && ultima?.qualidade === 'valida',
      };
    },
  };
}

// Único ponto de ligação entre a aplicação e uma fonte. Componentes não conhecem a fonte.
export function conectarFonte(monitor, fonte, mudou = () => {}) {
  fonte.iniciar((d) => { monitor.receber(d); mudou(); }, (s) => { monitor.status(s); mudou(); });
  return () => fonte.parar();
}
