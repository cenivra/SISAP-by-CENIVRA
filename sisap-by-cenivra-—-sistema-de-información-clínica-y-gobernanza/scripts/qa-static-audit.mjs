/**
 * Auditoría estática determinista, higiene de secretos y validación de integridad (SISAP v1.1.0).
 * No requiere red ni dependencias pesadas externas; bloquea ante errores reales.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(APP_ROOT, '..');

const findings = { errors: [], warnings: [], checks: [] };

function recordCheck(id, ok, detail) {
  findings.checks.push({ id, ok, detail });
  if (!ok) findings.errors.push(`[${id}] ${detail}`);
}

function recordWarn(id, detail) {
  findings.warnings.push(`[${id}] ${detail}`);
}

// 1. Verificar archivos prohibidos rastreados por Git (firebase-applet-config.json, .env, BD, rutas)
try {
  const trackedRaw = execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const tracked = trackedRaw.split(/\r?\n/).filter(Boolean);
  const forbiddenFiles = tracked.filter((f) => {
    const base = path.basename(f);
    if (base === 'firebase-applet-config.json') return true;
    if (base === '.env' || (base.startsWith('.env.') && !base.endsWith('.example'))) return true;
    if (/\.(sqlite3|sqlite|db|pem|key|p12|pfx)$/i.test(base)) return true;
    return false;
  });
  recordCheck(
    'SEC-GIT-01',
    forbiddenFiles.length === 0,
    forbiddenFiles.length === 0
      ? `0 archivos sensibles rastreados en ${tracked.length} archivos Git.`
      : `Archivos sensibles rastreados detectados: ${forbiddenFiles.join(', ')}`
  );
} catch (err) {
  recordWarn('SEC-GIT-01', `No se pudo consultar git ls-files: ${err.message}`);
}

// 2. Verificar plantilla segura firebase-applet-config.json.example
const fbExamplePath = path.join(APP_ROOT, 'firebase-applet-config.json.example');
if (fs.existsSync(fbExamplePath)) {
  try {
    const ex = JSON.parse(fs.readFileSync(fbExamplePath, 'utf8'));
    const safePlaceholder =
      typeof ex.apiKey === 'string' && (ex.apiKey.includes('YOUR_') || ex.apiKey === '');
    recordCheck(
      'SEC-FB-01',
      safePlaceholder,
      safePlaceholder
        ? 'firebase-applet-config.json.example contiene únicamente placeholders seguros.'
        : 'firebase-applet-config.json.example parece contener una apiKey no placeholder.'
    );
  } catch (err) {
    recordCheck('SEC-FB-01', false, `JSON inválido en firebase-applet-config.json.example: ${err.message}`);
  }
} else {
  recordCheck('SEC-FB-01', false, 'Falta firebase-applet-config.json.example');
}

// 3. Escaneo de secretos, rutas absolutas locales y patrones de riesgo en código fuente
function walkCodeFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'coverage') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkCodeFiles(full, exts, out);
    else if (exts.some((ext) => ent.name.endsWith(ext))) out.push(full);
  }
  return out;
}

const codeFiles = [
  ...walkCodeFiles(path.join(APP_ROOT, 'src'), ['.ts', '.tsx', '.js']),
  ...walkCodeFiles(path.join(APP_ROOT, 'backend', 'src'), ['.js', '.mjs']),
  ...walkCodeFiles(path.join(APP_ROOT, 'engines'), ['.js', '.json']),
];

const SECRET_PATTERNS = [
  { id: 'APIKEY_GOOGLE', regex: /AIzaSy[0-9A-Za-z_-]{20,}/g },
  { id: 'PRIVATE_KEY', regex: /-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g },
  { id: 'GITHUB_PAT', regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { id: 'DEV_WIN_PATH', regex: /[A-Za-z]:\\Users\\[A-Za-z0-9._-]+\\(?:Mi unidad|Documents|Desktop|Downloads)/gi },
];

const RISK_PATTERNS = [
  { id: 'EVAL_USAGE', regex: /\beval\s*\(/g },
  { id: 'NEW_FUNC', regex: /\bnew\s+Function\s*\(/g },
  { id: 'DEBUGGER', regex: /^\s*debugger\s*;?\s*$/gm },
];

let secretHits = [];
let riskHits = [];
let invalidJson = [];

for (const file of codeFiles) {
  const rel = path.relative(APP_ROOT, file);
  const content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) {
    try {
      JSON.parse(content);
    } catch (err) {
      invalidJson.push(`${rel}: ${err.message}`);
    }
    continue;
  }
  for (const pat of SECRET_PATTERNS) {
    if (pat.regex.test(content)) secretHits.push(`${pat.id} en ${rel}`);
  }
  for (const pat of RISK_PATTERNS) {
    if (pat.regex.test(content)) riskHits.push(`${pat.id} en ${rel}`);
  }
}

recordCheck(
  'SEC-SCAN-01',
  secretHits.length === 0,
  secretHits.length === 0
    ? `0 secretos/rutas locales expuestas en ${codeFiles.length} archivos revisados.`
    : `Hallazgos sensibles: ${secretHits.join('; ')}`
);

recordCheck(
  'SAST-SYNTAX-01',
  riskHits.length === 0 && invalidJson.length === 0,
  riskHits.length === 0 && invalidJson.length === 0
    ? `0 patrones peligrosos (eval/new Function/debugger) y 0 JSON corruptos.`
    : `Riesgos: [${riskHits.join('; ')}], JSON inválidos: [${invalidJson.join('; ')}]`
);

// 4. Integridad SHA-256 del Autoencoder
const regPath = path.join(APP_ROOT, 'engines', 'autoencoder', 'models', 'model_registry.json');
try {
  const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
  let checked = 0;
  let mismatches = [];
  for (const [relArt, expectedSha] of Object.entries(reg.artifacts_sha256 || {})) {
    const absArt = path.join(APP_ROOT, 'engines', 'autoencoder', relArt);
    if (!fs.existsSync(absArt)) {
      mismatches.push(`Falta ${relArt}`);
      continue;
    }
    const actual = crypto.createHash('sha256').update(fs.readFileSync(absArt)).digest('hex');
    if (actual !== expectedSha) mismatches.push(`Hash distinto en ${relArt}`);
    checked += 1;
  }
  recordCheck(
    'INT-AE-SHA',
    checked === 8 && mismatches.length === 0,
    mismatches.length === 0
      ? `Integridad SHA-256 verificada en ${checked}/8 artefactos de Autoencoder.`
      : `Discrepancias SHA-256: ${mismatches.join(', ')}`
  );
} catch (err) {
  recordCheck('INT-AE-SHA', false, `No pudo validarse model_registry.json: ${err.message}`);
}

console.log(JSON.stringify(findings, null, 2));
if (findings.errors.length > 0) {
  process.exit(1);
}
