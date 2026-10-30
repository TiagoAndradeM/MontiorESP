// Interpreta somente as palavras-chave usadas pelo schema 0.1.0 do projeto.
// O schema empacotado é conferido contra docs/contratos no CI.
const objeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const tipo = (v, t) => ({
  null: v === null, object: objeto(v), string: typeof v === 'string',
  number: typeof v === 'number' && Number.isFinite(v),
  integer: Number.isSafeInteger(v), boolean: typeof v === 'boolean',
})[t] === true;

function dataUtc(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/.exec(v);
  if (!m) return false;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) && d.getUTCFullYear() === +m[1]
    && d.getUTCMonth() + 1 === +m[2] && d.getUTCDate() === +m[3]
    && d.getUTCHours() === +m[4] && d.getUTCMinutes() === +m[5] && d.getUTCSeconds() === +m[6];
}

export function criarValidador(schema) {
  function conferir(v, regra, caminho = '$') {
    if (regra.$ref) {
      const r = regra.$ref.split('/').slice(1).reduce((p, k) => p[k], schema);
      return conferir(v, r, caminho);
    }
    const erros = [];
    const erro = (texto) => erros.push(`${caminho}: ${texto}`);
    if (regra.type && ![regra.type].flat().some((t) => tipo(v, t))) {
      return [`${caminho}: tipo inválido`];
    }
    if ('const' in regra && !igual(v, regra.const)) erro('valor não suportado');
    if (regra.enum && !regra.enum.some((e) => igual(e, v))) erro('opção não suportada');
    if (regra.anyOf && !regra.anyOf.some((r) => conferir(v, r, caminho).length === 0)) erro('formato inválido');
    for (const r of regra.allOf ?? []) erros.push(...conferir(v, r, caminho));
    if (regra.if && conferir(v, regra.if, caminho).length === 0 && regra.then) {
      erros.push(...conferir(v, regra.then, caminho));
    }
    if (objeto(v)) {
      for (const nome of regra.required ?? []) if (!(nome in v)) erro(`campo obrigatório ${nome}`);
      for (const [nome, valor] of Object.entries(v)) {
        if (regra.properties?.[nome]) erros.push(...conferir(valor, regra.properties[nome], `${caminho}.${nome}`));
        else if (regra.additionalProperties === false) erro(`campo desconhecido ${nome}`);
      }
    }
    if (typeof v === 'string') {
      if (regra.minLength && v.length < regra.minLength) erro('texto vazio');
      if (regra.pattern && !new RegExp(regra.pattern).test(v)) erro('texto fora do formato');
      if (regra.format === 'date-time' && !dataUtc(v)) erro('data UTC inválida');
    }
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) erro('número não finito');
      if ('minimum' in regra && v < regra.minimum) erro('abaixo do mínimo');
      if ('maximum' in regra && v > regra.maximum) erro('acima do máximo');
      if ('exclusiveMinimum' in regra && v <= regra.exclusiveMinimum) erro('fora da faixa positiva');
    }
    return erros;
  }

  return (payload) => {
    let dado = payload;
    if (typeof dado === 'string') {
      try { dado = JSON.parse(dado); }
      catch { return { valido: false, erros: ['JSON malformado'] }; }
    }
    const erros = conferir(dado, schema);
    if (!erros.length) {
      if (dado.frequencia_dominante_hz != null && dado.frequencia_dominante_hz > dado.fs_hz / 2) {
        erros.push('Frequência acima de Nyquist');
      }
      if (dado.bandas && Math.abs(dado.bandas.graves_pct + dado.bandas.medios_pct + dado.bandas.agudos_pct - 100) > 0.5) {
        erros.push('A energia das bandas deve somar 100%');
      }
      if (dado.rms_normalizado === 0 && dado.rms_dbfs != null) erros.push('RMS zero não possui dBFS finito');
    }
    return erros.length ? { valido: false, erros } : { valido: true, dado: structuredClone(dado), erros: [] };
  };
}
