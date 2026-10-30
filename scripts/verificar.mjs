import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (p) => readFile(resolve(raiz, p), 'utf8');
const schema = JSON.parse(await ler('docs/contratos/telemetria.schema.json'));
assert.deepEqual(JSON.parse(await ler('interface/contratos/telemetria.schema.json')), schema,
  'Atualize a cópia de distribuição do contrato em interface/contratos.');

// Garante que uma extensão do schema não seja silenciosamente ignorada pelo MVP.
const suportadas = new Set(['$schema', '$defs', '$ref', 'title', 'description', 'type', 'const', 'enum', 'anyOf',
  'allOf', 'if', 'then', 'properties', 'required', 'additionalProperties', 'minLength', 'pattern', 'format',
  'minimum', 'maximum', 'exclusiveMinimum']);
function palavras(regra) {
  for (const [k, v] of Object.entries(regra)) {
    assert.ok(suportadas.has(k), `Palavra-chave do schema ainda não implementada: ${k}`);
    if (k === 'format') assert.equal(v, 'date-time');
    if (k === '$ref') assert.ok(v.startsWith('#/$defs/'));
    if (['properties', '$defs'].includes(k)) Object.values(v).forEach(palavras);
    if (['anyOf', 'allOf'].includes(k)) v.forEach(palavras);
    if (['if', 'then'].includes(k)) palavras(v);
  }
}
palavras(schema);

async function arquivos(pasta) {
  const lista = [];
  for (const e of await readdir(pasta, { withFileTypes: true })) {
    const p = resolve(pasta, e.name);
    lista.push(...(e.isDirectory() ? await arquivos(p) : [p]));
  }
  return lista;
}
const publicos = await arquivos(resolve(raiz, 'interface'));
for (const p of publicos) {
  if (extname(p) === '.js') {
    const r = spawnSync(process.execPath, ['--check', p], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
  }
  if (extname(p) === '.json') JSON.parse(await readFile(p, 'utf8'));
}
const html = await ler('interface/index.html');
for (const [, caminho] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) {
  await readFile(resolve(raiz, 'interface', caminho));
}
assert.ok(!/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(html), 'MVP deve funcionar sem CDN.');
const testes = (await arquivos(resolve(raiz, 'tests'))).filter((p) => p.endsWith('.test.mjs'));
const resultado = spawnSync(process.execPath, ['--test', ...testes], { stdio: 'inherit' });
assert.equal(resultado.status, 0, 'Testes falharam.');
console.log(`Verificação concluída: contrato canônico sincronizado, sintaxe JS e ${publicos.length} arquivos estáticos.`);
