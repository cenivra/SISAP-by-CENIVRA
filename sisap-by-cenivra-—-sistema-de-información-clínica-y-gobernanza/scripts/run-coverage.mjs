/**
 * Ejecutor de cobertura de pruebas para backend (JS) y frontend lógico (TS) con Node >=22.5 + tsx.
 * Genera `coverage/lcov.info` (consumible por SonarQube Cloud) y `coverage/summary.json`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const COV_DIR = path.join(APP_ROOT, 'coverage');

fs.mkdirSync(COV_DIR, { recursive: true });

const backendTests = fs
  .readdirSync(path.join(APP_ROOT, 'backend', 'test'))
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => path.join('backend', 'test', f));

const feDir = path.join(APP_ROOT, 'src', 'test');
const frontendTests = fs.existsSync(feDir)
  ? fs
      .readdirSync(feDir)
      .filter((f) => f.endsWith('.test.ts'))
      .map((f) => path.join('src', 'test', f))
  : [];

const allTests = [...backendTests, ...frontendTests];

const commonArgs = [
  '--import',
  'tsx',
  '--test',
  '--experimental-test-coverage',
  '--test-coverage-exclude=**/node_modules/**',
  '--test-coverage-exclude=**/*.test.*',
  '--test-coverage-exclude=**/backend/test/helpers.js',
];

// 1. Generar LCOV para SonarQube Cloud
const lcovRes = spawnSync(
  process.execPath,
  [...commonArgs, '--test-reporter=lcov', ...allTests],
  { cwd: APP_ROOT, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
);

if (lcovRes.status !== 0) {
  console.error(lcovRes.stderr || lcovRes.stdout);
  process.exit(lcovRes.status || 1);
}

const lcovPath = path.join(COV_DIR, 'lcov.info');
fs.writeFileSync(lcovPath, lcovRes.stdout || '', 'utf8');

// 2. Calcular resumen cuantitativo desde lcov.info
const files = [];
let cur = null;
for (const line of (lcovRes.stdout || '').split(/\r?\n/)) {
  if (line.startsWith('SF:')) {
    cur = { file: line.slice(3), lf: 0, lh: 0, brf: 0, brh: 0, fnf: 0, fnh: 0 };
  } else if (line.startsWith('LF:') && cur) cur.lf = Number(line.slice(3));
  else if (line.startsWith('LH:') && cur) cur.lh = Number(line.slice(3));
  else if (line.startsWith('BRF:') && cur) cur.brf = Number(line.slice(4));
  else if (line.startsWith('BRH:') && cur) cur.brh = Number(line.slice(4));
  else if (line.startsWith('FNF:') && cur) cur.fnf = Number(line.slice(4));
  else if (line.startsWith('FNH:') && cur) cur.fnh = Number(line.slice(4));
  else if (line === 'end_of_record' && cur) {
    const linePct = cur.lf > 0 ? Number(((cur.lh / cur.lf) * 100).toFixed(2)) : 100;
    const branchPct = cur.brf > 0 ? Number(((cur.brh / cur.brf) * 100).toFixed(2)) : 100;
    const fnPct = cur.fnf > 0 ? Number(((cur.fnh / cur.fnf) * 100).toFixed(2)) : 100;
    files.push({ ...cur, linePct, branchPct, fnPct });
    cur = null;
  }
}

const sourceFiles = files.filter((f) => {
  const norm = f.file.replace(/\\/g, '/').replace(/^\.\//, '');
  return (
    (norm.startsWith('backend/src/') ||
      norm.includes('/backend/src/') ||
      norm.startsWith('src/') ||
      norm.includes('/src/') ||
      norm.startsWith('engines/') ||
      norm.includes('/engines/')) &&
    !norm.endsWith('.json')
  );
});

const totals = sourceFiles.reduce(
  (acc, f) => {
    acc.lf += f.lf;
    acc.lh += f.lh;
    acc.brf += f.brf;
    acc.brh += f.brh;
    acc.fnf += f.fnf;
    acc.fnh += f.fnh;
    return acc;
  },
  { lf: 0, lh: 0, brf: 0, brh: 0, fnf: 0, fnh: 0 }
);

const summary = {
  generated_at: new Date().toISOString(),
  test_files_count: allTests.length,
  lcov_path: 'coverage/lcov.info',
  source_files_covered: sourceFiles.length,
  totals: {
    lines_found: totals.lf,
    lines_hit: totals.lh,
    line_coverage_pct: totals.lf > 0 ? Number(((totals.lh / totals.lf) * 100).toFixed(2)) : 0,
    branches_found: totals.brf,
    branches_hit: totals.brh,
    branch_coverage_pct: totals.brf > 0 ? Number(((totals.brh / totals.brf) * 100).toFixed(2)) : 0,
    functions_found: totals.fnf,
    functions_hit: totals.fnh,
    function_coverage_pct: totals.fnf > 0 ? Number(((totals.fnh / totals.fnf) * 100).toFixed(2)) : 0,
  },
  files: sourceFiles.map((f) => ({
    file: path.relative(APP_ROOT, path.resolve(APP_ROOT, f.file)).replace(/\\/g, '/'),
    linePct: f.linePct,
    branchPct: f.branchPct,
    fnPct: f.fnPct,
    linesHit: f.lh,
    linesFound: f.lf,
  })),
};

fs.writeFileSync(path.join(COV_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify(summary.totals, null, 2));
console.log(`Saved ${lcovPath} (${sourceFiles.length} covered source modules).`);
