/**
 * Ejecutor E2E real sobre Chromium Headless (DevTools Protocol nativo en Node 24)
 * contra backend HTTP + SQLite WAL temporal + SPA compilada (`dist/`).
 *
 * Ventajas:
 *  - No requiere dependencias npm externas en offline/Windows;
 *  - Ejecuta los 12 flujos críticos en DOM real (login/logout, MFA, Padrón SQLite,
 *    Centro Psicométrico 6 escalas + exclusión OCI-R, borrador/cierre 409,
 *    Simulador 12D, compuerta D-06 E5_insufficient, inferencia Motor 1,
 *    monitorización soberana sin PHI y reinicio completo del proceso backend).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const RESULTS_PATH = path.join(__dirname, 'results.json');

const HOST = '127.0.0.1';
const PORT = Number(process.env.SISAP_E2E_PORT || '18090');
const BASE_URL = `http://${HOST}:${PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function findChromiumBinary() {
  const candidates = [];
  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);
  if (process.env.CHROMIUM_PATH) candidates.push(process.env.CHROMIUM_PATH);

  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const pwRoots = [
    path.join(localAppData, 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
  ];

  for (const pwRoot of pwRoots) {
    if (!fs.existsSync(pwRoot)) continue;
    const entries = fs.readdirSync(pwRoot).sort().reverse();
    for (const entry of entries) {
      if (entry.startsWith('chromium-')) {
        candidates.push(
          path.join(pwRoot, entry, 'chrome-win64', 'chrome.exe'),
          path.join(pwRoot, entry, 'chrome-linux', 'chrome'),
          path.join(pwRoot, entry, 'chrome-linux64', 'chrome')
        );
      }
    }
    for (const entry of entries) {
      if (entry.startsWith('chromium_headless_shell-')) {
        candidates.push(
          path.join(pwRoot, entry, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
          path.join(pwRoot, entry, 'chrome-headless-shell-linux64', 'chrome-headless-shell')
        );
      }
    }
  }

  candidates.push(
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  );

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  throw new Error('No se encontró ejecutable local de Chromium/Chrome para la suite E2E.');
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.ws = null;
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', (err) => reject(err?.error || new Error('CDP WS open failed')), {
        once: true,
      });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
        else resolve(msg.result);
      } else if (msg.method) {
        const handlers = this.listeners.get(msg.method) || [];
        for (const fn of handlers) fn(msg.params);
      }
    });
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(fnBody) {
    const res = await this.send('Runtime.evaluate', {
      expression: `(async () => { ${fnBody} })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      const desc =
        res.exceptionDetails.exception?.description ||
        res.exceptionDetails.text ||
        'Unknown browser error';
      throw new Error(`Browser exception: ${desc}`);
    }
    return res.result?.value;
  }

  async close() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }
}

async function waitForHealth(url, timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) {
        const body = await res.json();
        if (body?.ok) return body;
      }
    } catch {
      // esperando arranque
    }
    await sleep(150);
  }
  throw new Error(`Backend ${url} no respondió /api/health dentro de ${timeoutMs} ms`);
}

function startBackendProcess(dbDir, dbFile) {
  const serverPath = path.join(APP_ROOT, 'backend', 'src', 'server.js');
  const child = spawn(process.execPath, [serverPath], {
    cwd: APP_ROOT,
    env: {
      ...process.env,
      SISAP_HOST: HOST,
      SISAP_PORT: String(PORT),
      SISAP_DB_DIR: dbDir,
      SISAP_DB_FILE: dbFile,
      SISAP_ALLOWED_ORIGINS: `${BASE_URL},http://localhost:${PORT}`,
      SISAP_RATE_LIMIT: '1000',
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return child;
}

async function stopChildProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  const exited = await Promise.race([
    new Promise((res) => child.once('exit', () => res(true))),
    sleep(3000).then(() => false),
  ]);
  if (!exited && child.exitCode === null) {
    child.kill('SIGKILL');
    await sleep(300);
  }
}

async function startChromium(profileDir) {
  const bin = findChromiumBinary();
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    '--window-size=1440,900',
    'about:blank',
  ];
  if (process.platform === 'linux') {
    args.push('--no-sandbox', '--disable-dev-shm-usage');
  }

  const chrome = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const wsPort = await new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error(`Chromium DevTools timeout: ${buf}`)), 15_000);
    const onData = (chunk) => {
      buf += chunk.toString('utf8');
      const m = buf.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (m) {
        clearTimeout(timer);
        chrome.stderr.off('data', onData);
        resolve(Number(m[1]));
      }
    };
    chrome.stderr.on('data', onData);
    chrome.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chromium terminó inesperadamente con código ${code}: ${buf}`));
    });
  });

  const targets = await fetch(`http://127.0.0.1:${wsPort}/json/list`).then((r) => r.json());
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('No se encontró target de página CDP en Chromium.');
  }

  const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  return { chrome, cdp, bin };
}

async function waitForText(cdp, expected, timeoutMs = 10_000) {
  const start = Date.now();
  const needle = expected.toLowerCase();
  while (Date.now() - start < timeoutMs) {
    const ok = await cdp.evaluate(
      `return (document.body?.innerText || '').toLowerCase().includes(${JSON.stringify(needle)});`
    );
    if (ok) return true;
    await sleep(100);
  }
  const snippet = await cdp.evaluate(`return (document.body?.innerText || '').slice(0, 600);`);
  throw new Error(`Timeout esperando texto "${expected}". DOM visible: ${snippet}`);
}

async function clickButtonByText(cdp, substring, { exact = false } = {}) {
  const clicked = await cdp.evaluate(`
    const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim();
    const btns = Array.from(document.querySelectorAll('button'));
    const sub = ${JSON.stringify(substring)};
    const target = btns.find((b) => {
      if (b.offsetParent === null && getComputedStyle(b).position !== 'fixed') return false;
      const tInner = norm(b.innerText);
      const tRaw = norm(b.textContent);
      return ${exact ? `tInner === sub || tRaw === sub` : `tInner.includes(sub) || tRaw.includes(sub)`};
    });
    if (!target) return false;
    target.click();
    return true;
  `);
  if (!clicked) {
    throw new Error(`Botón no encontrado en DOM: "${substring}"`);
  }
}

async function setSelectValue(cdp, selector, value, index = 0) {
  const ok = await cdp.evaluate(`
    const els = Array.from(document.querySelectorAll(${JSON.stringify(selector)}));
    const el = els[${index}];
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    if (setter) setter.call(el, ${JSON.stringify(value)});
    else el.value = ${JSON.stringify(value)};
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  `);
  if (!ok) {
    throw new Error(`Select no encontrado para selector "${selector}" [${index}]`);
  }
}

async function setInputValue(cdp, selector, value, index = 0) {
  const ok = await cdp.evaluate(`
    const els = Array.from(document.querySelectorAll(${JSON.stringify(selector)}));
    const el = els[${index}];
    if (!el) return false;
    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, ${JSON.stringify(value)});
    else el.value = ${JSON.stringify(value)};
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  `);
  if (!ok) {
    throw new Error(`Input no encontrado para selector "${selector}" [${index}]`);
  }
}

async function main() {
  const distIndex = path.join(APP_ROOT, 'dist', 'index.html');
  if (!fs.existsSync(distIndex)) {
    throw new Error(`Falta build compilado (${distIndex}). Ejecuta "npm run build" antes de test:e2e.`);
  }

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sisap-e2e-'));
  const dbDir = path.join(tmpRoot, 'db');
  const dbFile = 'sisap_e2e.sqlite3';
  const chromeProfileDir = path.join(tmpRoot, 'chrome-profile');
  fs.mkdirSync(dbDir, { recursive: true });
  fs.mkdirSync(chromeProfileDir, { recursive: true });

  let backend = startBackendProcess(dbDir, dbFile);
  let chromiumHandle = null;

  const consoleErrors = [];
  const pageExceptions = [];
  const dialogMessages = [];
  const flowResults = [];
  let ignoreSyntheticErrors = false;

  const recordFlow = async (id, name, fn) => {
    const t0 = Date.now();
    await fn();
    flowResults.push({
      id,
      name,
      status: 'PASSED',
      duration_ms: Date.now() - t0,
    });
    console.log(`  [PASS] ${id}: ${name} (${Date.now() - t0} ms)`);
  };

  try {
    await waitForHealth(BASE_URL);
    chromiumHandle = await startChromium(chromeProfileDir);
    const { cdp, bin } = chromiumHandle;
    console.log(`Chromium real conectado: ${bin}`);

    cdp.on('Page.javascriptDialogOpening', async (params) => {
      dialogMessages.push(params.message || '');
      try {
        await cdp.send('Page.handleJavaScriptDialog', { accept: true });
      } catch {
        // diálogo ya cerrado
      }
    });

    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error' && !ignoreSyntheticErrors) {
        const text = (params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
        consoleErrors.push(text);
      }
    });

    cdp.on('Runtime.exceptionThrown', (params) => {
      if (!ignoreSyntheticErrors) {
        pageExceptions.push(params.exceptionDetails?.text || 'exceptionThrown');
      }
    });

    let syntheticPseudonym = '';
    let completedEvalId = '';

    await recordFlow('E2E-01', 'Arranque inicial, SPA compilada, banner INAI y /api/health', async () => {
      await cdp.send('Page.navigate', { url: `${BASE_URL}/` });
      await waitForText(cdp, 'Central de trabajo');
      const hasTelemetryBanner = await cdp.evaluate(
        `return (document.body?.innerText || '').includes('Aceptar telemetría anónima');`
      );
      if (hasTelemetryBanner) {
        await clickButtonByText(cdp, 'Aceptar telemetría anónima');
        await sleep(150);
      }
      const optIn = await cdp.evaluate(`return localStorage.getItem('sisap_v1_telemetry_opt_in');`);
      assert.equal(optIn, 'true');
      const health = await cdp.evaluate(`return await (await fetch('/api/health')).json();`);
      assert.equal(health.ok, true);
    });

    await recordFlow('E2E-02', 'Logout, login admin, rechazo MFA inválido, MFA 123456, vista RBAC y retorno clínico', async () => {
      await clickButtonByText(cdp, 'Salir');
      await waitForText(cdp, 'Ingresar al Sistema Clínico');

      await setSelectValue(cdp, 'select', 'admin', 0);
      await sleep(80);
      await clickButtonByText(cdp, 'Ingresar al Sistema Clínico');
      await waitForText(cdp, 'Segundo Factor de Autenticación (MFA)');

      await setInputValue(cdp, 'input[placeholder="000000"]', '000000', 0);
      await clickButtonByText(cdp, 'Validar MFA y Acceder');
      await sleep(200);
      const stillMfa = await cdp.evaluate(
        `return (document.body?.innerText || '').includes('Segundo Factor de Autenticación (MFA)');`
      );
      assert.equal(stillMfa, true);

      await setInputValue(cdp, 'input[placeholder="000000"]', '123456', 0);
      await clickButtonByText(cdp, 'Validar MFA y Acceder');
      await waitForText(cdp, 'Modo Admin · Usuarios');

      await clickButtonByText(cdp, 'Modo Admin · Usuarios');
      await waitForText(cdp, 'debe_cambiar_clave = 1');

      await clickButtonByText(cdp, 'Salir');
      await waitForText(cdp, 'Ingresar al Sistema Clínico');
      await setSelectValue(cdp, 'select', 'psicologo', 0);
      await sleep(80);
      await clickButtonByText(cdp, 'Ingresar al Sistema Clínico');
      await waitForText(cdp, 'Segundo Factor de Autenticación (MFA)');
      await setInputValue(cdp, 'input[placeholder="000000"]', '123456', 0);
      await clickButtonByText(cdp, 'Validar MFA y Acceder');
      await waitForText(cdp, 'Central de trabajo');
    });

    await recordFlow('E2E-03', 'Padrón y Pacientes — alta sintética en SQLite y búsqueda parametrizada', async () => {
      await clickButtonByText(cdp, 'Padrón y Pacientes');
      await waitForText(cdp, 'Registrar Paciente');
      await sleep(300); // espera checkHealth asíncrono de la vista

      await clickButtonByText(cdp, 'Registrar Paciente');
      await waitForText(cdp, 'Alta de Nuevo Paciente · Separación de Padrón');
      await setInputValue(cdp, 'form input[type="text"][required]', 'Paciente Sintetico QA E2E', 0);
      await clickButtonByText(cdp, 'Crear Registro en Padrón y Expediente');

      const start = Date.now();
      while (dialogMessages.length === 0 && Date.now() - start < 8000) {
        await sleep(100);
      }
      assert.ok(dialogMessages.length > 0, 'Se esperaba alerta de confirmación de alta');
      const m = dialogMessages[dialogMessages.length - 1].match(/TUS-\d+/);
      assert.ok(m, `Seudónimo no detectado en alerta: ${dialogMessages[dialogMessages.length - 1]}`);
      syntheticPseudonym = m[0];

      await setInputValue(
        cdp,
        'input[placeholder="Buscar paciente por nombre o CURP (mínimo 2 caracteres)..."]',
        'Sintetico',
        0
      );
      await clickButtonByText(cdp, 'Buscar', { exact: true });
      await waitForText(cdp, syntheticPseudonym);
    });

    await recordFlow('E2E-04', 'Catálogo Centro Psicométrico (6 activos) y exclusión OCI-R', async () => {
      await clickButtonByText(cdp, 'Centro Psicométrico');
      await waitForText(cdp, 'Control de catálogo:');
      const check = await cdp.evaluate(`
        const txt = document.body?.innerText || '';
        const startButtons = Array.from(document.querySelectorAll('button'))
          .filter((b) => (b.innerText || '').includes('Iniciar aplicación')).length;
        return {
          startButtons,
          hasBis: txt.includes('BIS-11') && txt.includes('30 reactivos'),
          hasBsl: txt.includes('BSL-23') && txt.includes('23 reactivos'),
          hasGad: txt.includes('GAD-7') && txt.includes('7 reactivos'),
          hasEros: txt.includes('EROS') && txt.includes('10 reactivos'),
          hasBads: txt.includes('BADS') && txt.includes('22 reactivos'),
          hasStaxi: txt.includes('STAXI-2') && txt.includes('57 reactivos'),
          hasOcirExclusion: txt.includes('OCI-R'),
        };
      `);
      assert.equal(check.startButtons, 6);
      assert.equal(check.hasBis, true);
      assert.equal(check.hasBsl, true);
      assert.equal(check.hasGad, true);
      assert.equal(check.hasEros, true);
      assert.equal(check.hasBads, true);
      assert.equal(check.hasStaxi, true);
      assert.equal(check.hasOcirExclusion, true);
    });

    await recordFlow('E2E-05', 'Captura digital GAD-7, guardar borrador y retomar respuestas', async () => {
      const started = await cdp.evaluate(`
        const cards = Array.from(document.querySelectorAll('div'));
        const gadCard = cards.find((d) => {
          const t = d.innerText || '';
          const btns = d.querySelectorAll('button');
          return t.includes('GAD-7') && t.includes('7 reactivos') && btns.length <= 2 &&
            Array.from(btns).some((b) => (b.innerText || '').includes('Iniciar aplicación'));
        });
        if (!gadCard) return false;
        const btn = Array.from(gadCard.querySelectorAll('button')).find((b) =>
          (b.innerText || '').includes('Iniciar aplicación')
        );
        btn.click();
        return true;
      `);
      assert.equal(started, true, 'No se pudo iniciar aplicación GAD-7');
      await waitForText(cdp, 'Aplicación Activa (GAD-7)');

      for (let i = 1; i <= 3; i += 1) {
        await cdp.evaluate(`
          const opts = document.querySelectorAll('#psych-item-card-${i} button[type="button"]');
          if (!opts[1]) throw new Error('Opción faltante en reactivo ${i}');
          opts[1].click();
        `);
      }

      await clickButtonByText(cdp, 'Guardar como borrador');
      await waitForText(cdp, 'Borrador guardado en almacenamiento de 3 niveles');

      await clickButtonByText(cdp, 'Catálogo (6)');
      await waitForText(cdp, 'Borrador pendiente (3/7 reactivos)');
      await clickButtonByText(cdp, 'Retomar');
      await waitForText(cdp, 'Limpiar respuesta');

      const clearCount = await cdp.evaluate(
        `return Array.from(document.querySelectorAll('button')).filter((b) => (b.innerText || '').includes('Limpiar respuesta')).length;`
      );
      assert.equal(clearCount, 3);
    });

    await recordFlow('E2E-06', 'Finalización inmutable GAD-7, recálculo algoritmo y bloqueo HTTP 409', async () => {
      for (let i = 4; i <= 7; i += 1) {
        await cdp.evaluate(`
          const opts = document.querySelectorAll('#psych-item-card-${i} button[type="button"]');
          if (!opts[2]) throw new Error('Opción faltante en reactivo ${i}');
          opts[2].click();
        `);
      }

      await clickButtonByText(cdp, 'Revisar respuestas antes de finalizar');
      await waitForText(cdp, 'Completar y cerrar evaluación (Inmutable)');
      await clickButtonByText(cdp, 'Completar y cerrar evaluación (Inmutable)');
      await waitForText(cdp, 'Nivel 2 · Respuestas individuales conservadas (7 reactivos)');

      const evalIdText = await cdp.evaluate(`
        const m = (document.body?.innerText || '').match(/ID:\\s*((?:psy|PSY)-[\\w-]+)/i);
        return m ? m[1] : null;
      `);
      assert.ok(evalIdText, 'No se encontró evaluation_id PSY-... tras cierre');
      completedEvalId = evalIdText;

      await clickButtonByText(cdp, 'Recalcular versión algoritmo');
      await waitForText(cdp, 'Resultados recalculados bajo algoritmo');

      const conflictStatus = await cdp.evaluate(`
        const res = await fetch('/api/psychometrics/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evaluation_id: ${JSON.stringify(completedEvalId)},
            patient_id: ${JSON.stringify(syntheticPseudonym)},
            instrument_id: 'GAD-7',
            evaluator: 'psicologo',
            application_status: 'completed',
            responses: Array.from({ length: 7 }, (_, i) => ({
              itemId: 'GAD7_' + (i + 1),
              numericCode: 1,
            })),
          }),
        });
        return res.status;
      `);
      assert.equal(conflictStatus, 409, `Se esperaba HTTP 409 Conflict al sobrescribir ${completedEvalId}`);
    });

    await recordFlow('E2E-07', 'Navegación multivista clínica v1.0.0 -> v1.1.0 sin errores', async () => {
      for (const navLabel of [
        'Entrevista exploratoria',
        'Evaluación inicial (Resumen)',
        'Seguimiento quincenal',
        'Nota de evolución',
        'Nota de sesión familiar',
        'Narración semanal V1.0',
        'Ciberseguridad y NOMs',
        'Trazabilidad y Bitácora',
        'Esquemas y Scripts SQL',
      ]) {
        await clickButtonByText(cdp, navLabel);
        await sleep(80);
        const len = await cdp.evaluate(`return (document.querySelector('main')?.innerText || '').length;`);
        assert.ok(len > 50, `Vista "${navLabel}" vacía`);
      }
    });

    await recordFlow('E2E-08', 'Simulador Autoencoder 12D y Arquitectura/Pesos', async () => {
      await clickButtonByText(cdp, 'Simulador Autoencoder');
      await waitForText(cdp, 'arquetipos sintéticos precomputados');
      await clickButtonByText(cdp, 'Arquetipo B');
      await waitForText(cdp, 'Desglose de las 12 Dimensiones Latentes');

      await clickButtonByText(cdp, 'Arquitectura y Pesos');
      await waitForText(cdp, 'Auditoría Científica DICO / DCSA');
    });

    await recordFlow('E2E-09', 'Compuerta de seguridad D-06 (E5_insufficient) en Ecosistema de Inteligencia', async () => {
      await clickButtonByText(cdp, 'Ecosistema de Inteligencia');
      await waitForText(cdp, 'Compuerta D-06 · Representación Latente No Disponible (E5_insufficient)');
    });

    await recordFlow('E2E-10', 'Inferencia Motor 1 Autoencoder (22v/24v) y guardrails E1-E5 en /api/engines', async () => {
      const res = await cdp.evaluate(`
        const statusBody = await fetch('/api/engines/status').then((r) => r.json());
        const patSearch = await fetch('/api/patients/search?q=' + encodeURIComponent(${JSON.stringify(syntheticPseudonym)})).then((r) => r.json());
        const realPatientId = patSearch.results[0]?.patient_id;
        const basePayload = {
          patient_id: realPatientId,
          edad: 31,
          sexo: 'M',
          tiempo_consumo: 8,
          trat_previos: 2,
          sustancia_principal: 'Cannabis',
          persist: true,
          bis11: { modo_captura: 'excel_canonico', respuestas: Array.from({ length: 30 }, () => 2) },
          bads: { modo_captura: 'items_crudos', respuestas: Array.from({ length: 25 }, () => 3) },
          eros: { modo_captura: 'excel_canonico', respuestas: Array.from({ length: 10 }, () => 3) },
          gad7: { modo_captura: 'items_crudos', respuestas: [2, 1, 2, 1, 2, 1, 2] },
          staxi2: { modo_captura: 'items_crudos', respuestas: Array.from({ length: 49 }, () => 2) },
          bsl23: {
            modo_captura: 'items_crudos',
            respuestas: Array.from({ length: 23 }, () => 1),
            respuestas_conductuales: Array.from({ length: 11 }, () => 0),
            general_score_0_1: 0.5,
          },
        };
        const r22 = await fetch('/api/engines/autoencoder/infer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...basePayload, model_id: 'encoder_22_checkpoint_fase2' }),
        }).then((r) => r.json());
        const r24 = await fetch('/api/engines/autoencoder/infer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...basePayload, model_id: 'encoder_24_deployed' }),
        }).then((r) => r.json());
        return { realPatientId, statusBody, r22, r24 };
      `);

      assert.ok(res.realPatientId, 'Debe resolverse patient_id UUID por seudónimo');
      assert.equal(res.statusBody.motors.motor_1_autoencoder.integrity_verified, true);
      assert.equal(res.statusBody.motors.motor_5_decision_support.automatic_diagnosis_allowed, false);
      assert.equal(res.r22.status, 'completed');
      assert.equal(res.r22.persistence.persisted, true);
      assert.equal(res.r22.latent_vector.length, 12);
      assert.ok(res.r22.latent_vector.every(Number.isFinite));
      assert.ok(Number.isFinite(res.r22.reconstruction.mse_z));
      assert.equal(res.r22.latent_analysis.epistemological_guardrail.mod_03_opaque_dimensions, true);
      assert.equal(res.r22.latent_analysis.epistemological_guardrail.clinical_diagnosis_allowed, false);
      assert.equal(res.r24.status, 'completed');
      assert.equal(res.r24.latent_vector.length, 12);
      assert.equal(res.r24.reconstruction.per_variable.length, 24);
    });

    await recordFlow('E2E-11', 'Monitorización soberana de errores cliente y sanitización anti-PHI', async () => {
      ignoreSyntheticErrors = true;
      await cdp.evaluate(`
        localStorage.setItem('sisap_v1_telemetry_opt_in', 'true');
        window.dispatchEvent(new ErrorEvent('error', {
          message: 'E2E_SYNTH_ERR TUS-9876 CURP ABCD900101HDFXYZ01 mail test_e2e@cenivra.org'
        }));
      `);

      let auditHasMonitoring = false;
      const start = Date.now();
      while (Date.now() - start < 5000) {
        const evRes = await cdp.evaluate(`return await (await fetch('/api/audit/events?limit=15')).json();`);
        auditHasMonitoring = (evRes.events || []).some((ev) => ev.action === 'monitoring.client_error');
        if (auditHasMonitoring) break;
        await sleep(120);
      }
      ignoreSyntheticErrors = false;

      const checkMon = await cdp.evaluate(`
        const postRes = await fetch('/api/monitoring/client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'window_error',
            message: 'Fallo UI TUS-9876 CURP ABCD900101HDFXYZ01 test_e2e@cenivra.org',
            route: '/centro_psicometrico',
            client_os: 'Windows'
          })
        }).then((r) => r.json());
        const metrics = await fetch('/api/monitoring/metrics').then((r) => r.json());
        const telemetryBuf = localStorage.getItem('sisap_v1_telemetry_buffer') || '';
        return { postRes, metrics, telemetryBuf };
      `);

      assert.equal(auditHasMonitoring, true, 'sendBeacon global error listener debe registrar monitoring.client_error');
      assert.equal(checkMon.postRes.accepted, true);
      assert.equal(checkMon.postRes.phi_sanitized, true);
      assert.ok(!checkMon.postRes.message.includes('TUS-9876'), 'Se filtró seudónimo en endpoint monitoring');
      assert.ok(!checkMon.postRes.message.includes('ABCD900101HDFXYZ01'), 'Se filtró CURP en endpoint monitoring');
      assert.ok(!checkMon.postRes.message.includes('test_e2e@cenivra.org'), 'Se filtró correo en endpoint monitoring');
      assert.ok(!checkMon.telemetryBuf.includes('TUS-9876'), 'Se filtró seudónimo en telemetry buffer');
      assert.equal(checkMon.metrics.database.ok, true);
      assert.equal(checkMon.metrics.audit_worm.valid, true);
      assert.equal(checkMon.metrics.phi_exported, false);
      assert.ok(checkMon.metrics.operational_counts_aggregate.psychometric_evaluations_total >= 1);
      assert.ok(checkMon.metrics.operational_counts_aggregate.model_runs_total >= 2);
    });

    await recordFlow('E2E-12', 'Reinicio completo del proceso backend, persistencia SQLite WAL e integridad auditoría', async () => {
      await stopChildProcess(backend);
      backend = startBackendProcess(dbDir, dbFile);
      await waitForHealth(BASE_URL);

      await cdp.send('Page.reload', { ignoreCache: true });
      await waitForText(cdp, 'Central de trabajo');

      const postRestart = await cdp.evaluate(`
        const search = await fetch('/api/patients/search?q=Sintetico').then((r) => r.json());
        const psych = await fetch('/api/patients/' + encodeURIComponent(${JSON.stringify(syntheticPseudonym)}) + '/psychometrics').then((r) => r.json());
        const audit = await fetch('/api/audit/verify').then((r) => r.json());
        return { search, psych, audit };
      `);

      assert.ok(
        postRestart.search.results.some((p) => p.pseudonym === syntheticPseudonym),
        'Paciente sintético perdido tras reinicio del backend'
      );
      assert.ok(
        postRestart.psych.evaluations.some((b) => b.evaluation.evaluation_id === completedEvalId),
        'Evaluación GAD-7 completada perdida tras reinicio del backend'
      );
      assert.equal(postRestart.audit.valid, true, 'Cadena de hash de auditoría inválida tras reinicio');
    });

    assert.equal(consoleErrors.length, 0, `Errores de consola detectados: ${consoleErrors.join('; ')}`);
    assert.equal(pageExceptions.length, 0, `Excepciones no capturadas en página: ${pageExceptions.join('; ')}`);

    const summary = {
      generated_at: new Date().toISOString(),
      browser_binary: path.basename(chromiumHandle.bin),
      node_version: process.version,
      flows_total: flowResults.length,
      flows_passed: flowResults.filter((f) => f.status === 'PASSED').length,
      console_errors: consoleErrors.length,
      page_exceptions: pageExceptions.length,
      flows: flowResults,
    };
    fs.writeFileSync(RESULTS_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
    console.log(`\nE2E Chromium finalizado: ${summary.flows_passed}/${summary.flows_total} flujos PASS.`);
  } finally {
    await chromiumHandle?.cdp?.close().catch(() => {});
    await stopChildProcess(chromiumHandle?.chrome).catch(() => {});
    await stopChildProcess(backend).catch(() => {});
    await sleep(250);
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
    } catch {
      // Windows puede retener locks transitorios sobre perfiles Chromium temporales
    }
  }
}

main().catch((err) => {
  console.error('FALLO EN SUITE E2E CHROMIUM:', err);
  process.exit(1);
});
