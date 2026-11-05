// O prazo cobre tanto a resposta HTTP quanto a leitura do JSON.
export async function carregarContrato(url, { buscar = fetch, limiteMs = 6000, signal } = {}) {
  if (signal?.aborted) throw new Error('Inicialização cancelada.');
  const controlador = new AbortController();
  let rejeitar;
  const cancelamento = new Promise((_, rejeitarPromessa) => { rejeitar = rejeitarPromessa; });
  function cancelar(erro) {
    rejeitar(erro);
    controlador.abort(erro);
  }
  const aoCancelar = () => cancelar(new Error('Inicialização cancelada.'));
  signal?.addEventListener('abort', aoCancelar, { once: true });
  const timer = setTimeout(() => cancelar(new Error(
    'O carregamento demorou demais. Verifique se o servidor local está aberto e tente novamente.',
  )), limiteMs);
  async function carregar() {
    let resposta;
    try {
      resposta = await buscar(url, { signal: controlador.signal, cache: 'no-store' });
    } catch (causa) {
      throw new Error('Não foi possível carregar os dados iniciais. Verifique o servidor local e tente novamente.', { cause: causa });
    }
    if (!resposta.ok) throw new Error(`Não foi possível carregar os dados iniciais (erro ${resposta.status}). Tente novamente.`);
    try {
      return await resposta.json();
    } catch (causa) {
      throw new Error('Os dados iniciais não puderam ser lidos. Verifique o servidor local e tente novamente.', { cause: causa });
    }
  }
  try {
    return await Promise.race([carregar(), cancelamento]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', aoCancelar);
  }
}
