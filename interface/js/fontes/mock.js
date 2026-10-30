export const CENARIOS = {
  transicao: 'Ciclo de ambientes', baixo: 'Estado baixo', moderado: 'Estado moderado',
  elevado: 'Estado elevado', ausente: 'Métricas indisponíveis',
  qualidade: 'Janela inválida', malformado: 'Mensagem malformada',
  duplicata: 'Amostra duplicada', fora_ordem: 'Amostra fora de ordem',
};
const valores = {
  baixo: [20, 23, 21, 25, 22, 24, 20, 22],
  moderado: [52, 58, 55, 61, 57, 54, 59, 56],
  elevado: [79, 84, 81, 86, 82, 88, 83, 80],
};

export function amostraDemo({ ambiente = 'biblioteca', cenario = 'transicao', indice = 0, sessao = 'demo-1' } = {}) {
  const estado = cenario === 'transicao' ? ['baixo', 'moderado', 'elevado', 'moderado'][Math.floor(indice / 12) % 4]
    : valores[cenario] ? cenario : 'moderado';
  const indisponivel = cenario === 'ausente' || cenario === 'qualidade';
  const rms = indisponivel ? null : Number((0.02 + (indice % 8) * 0.005).toFixed(3));
  return {
    versao_contrato: '0.1.0', fonte_id: 'simulador-demo', sessao_id: sessao,
    sequencia: indice, modo: 'simulado', timestamp: null, tempo_ativo_ms: (indice + 1) * 1000,
    ambiente, estado: indisponivel ? 'indeterminado' : estado,
    perfil_regra_id: indisponivel ? null : 'demo-estados-v1',
    intensidade_relativa: indisponivel ? null : valores[estado][indice % 8],
    perfil_intensidade_id: indisponivel ? null : 'demo-intensidade-v1',
    rms_normalizado: rms, perfil_aquisicao_id: indisponivel ? null : 'demo-aquisicao-v1',
    janela_ms: 1000, fs_hz: 16000, qualidade: cenario === 'qualidade' ? 'invalida' : 'valida',
    rms_dbfs: rms === null ? null : Number((20 * Math.log10(rms)).toFixed(4)),
    frequencia_dominante_hz: null, bandas: null, saturado: null, classificacao: null,
  };
}

export function criarFonteMock({ ambiente = 'biblioteca', cenario = 'transicao', agendar = setInterval,
  cancelar = clearInterval, sessaoId = () => crypto.randomUUID() } = {}) {
  let timer = null, indice = 0, anterior = null, pausado = false;
  const sessao = `demo-${sessaoId()}`;
  function parar() { if (timer !== null) cancelar(timer); timer = null; }
  return {
    iniciar(aoReceber, aoMudarStatus) {
      parar(); aoMudarStatus('aguardando');
      timer = agendar(() => {
        if (pausado) return;
        const dado = amostraDemo({ ambiente, cenario, indice, sessao });
        if (cenario === 'malformado') aoReceber('{"versao_contrato":');
        else if (cenario === 'duplicata' && anterior) aoReceber(structuredClone(anterior));
        else if (cenario === 'fora_ordem' && indice > 1 && indice % 2 === 0) {
          aoReceber(amostraDemo({ ambiente, indice: indice - 2, sessao }));
        } else { anterior = dado; aoReceber(dado); }
        indice += 1;
      }, 1000);
    },
    parar,
    pausar(valor) { pausado = valor; },
  };
}
