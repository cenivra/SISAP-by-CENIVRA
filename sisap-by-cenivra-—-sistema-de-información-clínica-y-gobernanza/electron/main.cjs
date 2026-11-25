/**
 * SISAP by CENIVRA — Proceso Principal de Escritorio (Electron Main Process)
 *
 * Características de Gobernanza y Ciclo de Vida:
 *  - Ventana nativa independiente (sin navegador externo ni terminal manual).
 *  - Backend HTTP + SQLite integrado en el proceso de la aplicación con puerto loopback libre automático.
 *  - Apagado limpio garantizado de HTTP y SQLite para cero procesos huérfanos en Windows.
 *  - Protección contra instancias múltiples (Single-Instance Lock).
 *  - Aislamiento estricto de contexto (contextIsolation: true, nodeIntegration: false, sandbox: true).
 *  - Persistencia protegida en %APPDATA%\SISAP by CENIVRA (data/local, backups, logs) sin sobrescritura.
 */
const { app, BrowserWindow, dialog, shell, ipcMain } = require('electron');
const path = require('node:path');
const http = require('node:http');
const net = require('node:net');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

// 1. Protección estricta contra múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let serverInstance = null;
let closeDbFn = null;
let activePort = Number(process.env.SISAP_PORT || 8080);
let isShuttingDown = false;

const PREFERRED_PORT = Number(process.env.SISAP_PORT || 8080);
const HOST = '127.0.0.1';

const appRoot = app.isPackaged
  ? (fs.existsSync(path.resolve(process.resourcesPath, 'app'))
      ? path.resolve(process.resourcesPath, 'app')
      : app.getAppPath())
  : path.resolve(__dirname, '..');

const userDataRoot = app.isPackaged ? app.getPath('userData') : path.join(appRoot, 'data');
const userDbDir = app.isPackaged
  ? path.join(userDataRoot, 'data', 'local')
  : path.join(appRoot, 'data', 'local');
const backupDir = path.join(userDataRoot, 'backups');
const logDir = path.join(userDataRoot, 'logs');
const logFile = path.join(logDir, 'desktop.log');
const dbFileName = app.isPackaged ? 'sisap_clinical.sqlite3' : 'sisap_test.sqlite3';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function appendDesktopLog(level, message) {
  try {
    ensureDir(logDir);
    if (fs.existsSync(logFile) && fs.statSync(logFile).size > 2 * 1024 * 1024) {
      const archived = path.join(logDir, 'desktop.prev.log');
      if (fs.existsSync(archived)) fs.unlinkSync(archived);
      fs.renameSync(logFile, archived);
    }
    const line = `[${new Date().toISOString()}] [${level}] ${String(message || '').slice(0, 500)}\n`;
    fs.appendFileSync(logFile, line, 'utf8');
  } catch {
    // No propagar errores de log durante inicialización o cierre
  }
}

function isPortFree(port, host = HOST) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.unref();
    tester.on('error', () => resolve(false));
    tester.listen({ port, host, exclusive: true }, () => {
      tester.close(() => resolve(true));
    });
  });
}

function allocateEphemeralPort(host = HOST) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen({ port: 0, host, exclusive: true }, () => {
      const addr = srv.address();
      const port = addr && typeof addr === 'object' ? addr.port : 8080;
      srv.close(() => resolve(port));
    });
  });
}

async function findAvailableLoopbackPort(preferred = PREFERRED_PORT) {
  const candidates = [preferred];
  for (let p = 8081; p <= 8099; p++) {
    if (p !== preferred) candidates.push(p);
  }
  for (const port of candidates) {
    if (await isPortFree(port, HOST)) {
      return port;
    }
  }
  return allocateEphemeralPort(HOST);
}

/**
 * Comprueba que el servicio HTTP local sea específicamente SISAP en /api/health
 */
function checkBackendHealth(port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: HOST,
        port,
        path: '/api/health',
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve(
              res.statusCode === 200 &&
                Boolean(data && data.ok === true && data.service === 'sisap-local-backend')
            );
          } catch {
            resolve(false);
          }
        });
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackend(port, maxRetries = 50, delayMs = 150) {
  for (let i = 0; i < maxRetries; i++) {
    const ok = await checkBackendHealth(port, 600);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

/**
 * Inicializa almacenamiento protegido (%APPDATA%) y levanta el backend local en puerto loopback libre
 */
async function startBackend() {
  ensureDir(userDbDir);
  ensureDir(backupDir);
  ensureDir(logDir);

  const targetDb = path.join(userDbDir, dbFileName);
  const legacyUserDb = path.join(userDbDir, 'sisap_test.sqlite3');

  // Migración no destructiva desde beta local previa en el mismo perfil %APPDATA%; nunca sobrescribir BD existente
  if (app.isPackaged && !fs.existsSync(targetDb) && fs.existsSync(legacyUserDb)) {
    try {
      fs.copyFileSync(legacyUserDb, targetDb);
      appendDesktopLog('INFO', `Migración no destructiva de SQLite previo hacia ${dbFileName}`);
    } catch (err) {
      appendDesktopLog('WARN', `No se pudo copiar SQLite previo: ${err.message}`);
    }
  }

  activePort = await findAvailableLoopbackPort(PREFERRED_PORT);
  process.env.SISAP_HOST = HOST;
  process.env.SISAP_PORT = String(activePort);
  process.env.SISAP_DB_DIR = userDbDir;
  process.env.SISAP_DB_FILE = dbFileName;
  process.env.SISAP_ALLOWED_ORIGINS = [
    `http://${HOST}:${activePort}`,
    `http://localhost:${activePort}`,
    'null',
    'file://',
  ].join(',');

  const serverScript = path.join(appRoot, 'backend', 'src', 'server.js');
  const serverModuleUrl = pathToFileURL(serverScript).href;

  appendDesktopLog('INFO', `Iniciando backend SQLite/HTTP en ${HOST}:${activePort}`);
  const serverMod = await import(serverModuleUrl);
  serverInstance = serverMod.startServer();
  closeDbFn = serverMod.closeDatabase;

  const ready = await waitForBackend(activePort);
  if (!ready) {
    throw new Error(
      `El servicio local no respondió en http://${HOST}:${activePort}/api/health tras el arranque.`
    );
  }
  appendDesktopLog('INFO', `Backend operativo en http://${HOST}:${activePort} (DB=${dbFileName})`);
}

/**
 * Detiene servidor HTTP (incluidas conexiones keep-alive) y cierra SQLite limpiamente
 */
function stopBackend() {
  if (isShuttingDown && !serverInstance && !closeDbFn) return;
  isShuttingDown = true;

  if (serverInstance) {
    appendDesktopLog('INFO', 'Deteniendo servidor HTTP local...');
    try {
      if (typeof serverInstance.closeAllConnections === 'function') {
        serverInstance.closeAllConnections();
      }
      serverInstance.close();
      serverInstance = null;
    } catch (err) {
      appendDesktopLog('ERROR', `Error cerrando servidor HTTP: ${err.message}`);
    }
  }

  if (typeof closeDbFn === 'function') {
    try {
      closeDbFn();
      closeDbFn = null;
      appendDesktopLog('INFO', 'Conexión SQLite cerrada correctamente.');
    } catch (err) {
      appendDesktopLog('ERROR', `Error cerrando SQLite: ${err.message}`);
    }
  }
}

function createWindow() {
  const iconPath = path.join(appRoot, 'assets', 'icons', 'sisap.ico');
  const fallbackIcon = path.join(appRoot, 'assets', 'icons', 'sisap_256.png');
  const resolvedIcon = fs.existsSync(iconPath)
    ? iconPath
    : fs.existsSync(fallbackIcon)
    ? fallbackIcon
    : undefined;

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'SISAP by CENIVRA — Estación Clínica, Psicométrica y Analítica',
    icon: resolvedIcon,
    show: false,
    backgroundColor: '#161616',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: true,
      additionalArguments: [`--sisap-api-base=http://${HOST}:${activePort}/api`],
    },
  });

  mainWindow.setMenuBarVisibility(false);

  const targetUrl = `http://${HOST}:${activePort}/`;
  appendDesktopLog('INFO', `Cargando interfaz de escritorio en ${targetUrl}`);
  mainWindow.loadURL(targetUrl);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const parsed = new URL(url);
      const isLocal =
        (parsed.hostname === HOST || parsed.hostname === 'localhost') &&
        (parsed.port === String(activePort) || (!app.isPackaged && parsed.port === '3000'));
      if (!isLocal) {
        event.preventDefault();
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          shell.openExternal(url);
        }
      }
    } catch {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTimestampedBackup() {
  ensureDir(backupDir);
  const sourceDb = path.join(userDbDir, dbFileName);
  if (!fs.existsSync(sourceDb)) {
    throw new Error('La base SQLite local aún no ha sido inicializada en disco.');
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `sisap_backup_${stamp}.sqlite3`;
  const dest = path.join(backupDir, fileName);
  fs.copyFileSync(sourceDb, dest);
  const stat = fs.statSync(dest);
  appendDesktopLog('INFO', `Respaldo SQLite generado: ${fileName} (${stat.size} bytes)`);
  return {
    ok: true,
    fileName,
    path: dest,
    sizeBytes: stat.size,
    createdAt: new Date().toISOString(),
  };
}

function listBackups() {
  ensureDir(backupDir);
  return fs
    .readdirSync(backupDir)
    .filter((f) => f.endsWith('.sqlite3'))
    .map((fileName) => {
      const st = fs.statSync(path.join(backupDir, fileName));
      return {
        fileName,
        sizeBytes: st.size,
        modifiedAt: st.mtime.toISOString(),
      };
    })
    .sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  ipcMain.handle('sisap:open-external', async (_, url) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });

  ipcMain.handle('sisap:get-backend-info', async () => {
    return {
      host: HOST,
      port: activePort,
      apiBase: `http://${HOST}:${activePort}/api`,
      userDbDir,
      dbFilePath: path.join(userDbDir, dbFileName),
      backupDir,
      logFile,
      version: app.getVersion(),
      isPackaged: app.isPackaged,
    };
  });

  ipcMain.handle('sisap:create-db-backup', async () => {
    return createTimestampedBackup();
  });

  ipcMain.handle('sisap:list-db-backups', async () => {
    return listBackups();
  });

  ipcMain.handle('sisap:open-data-dir', async (_, target = 'db') => {
    const dirMap = { db: userDbDir, backups: backupDir, logs: logDir };
    const chosen = dirMap[target] || userDbDir;
    ensureDir(chosen);
    const errMsg = await shell.openPath(chosen);
    return { ok: !errMsg, path: chosen, error: errMsg || null };
  });

  ipcMain.handle('sisap:read-desktop-log', async () => {
    try {
      if (!fs.existsSync(logFile)) return '';
      const raw = fs.readFileSync(logFile, 'utf8');
      const lines = raw.split(/\r?\n/).filter(Boolean);
      return lines.slice(-60).join('\n');
    } catch {
      return '';
    }
  });

  ipcMain.handle('sisap:close-app', () => {
    app.quit();
  });

  try {
    await startBackend();
    createWindow();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    appendDesktopLog('FATAL', `Fallo de arranque desktop: ${msg}`);
    dialog.showErrorBox(
      'Error de Inicialización — SISAP by CENIVRA',
      `No se pudo inicializar el motor local o la base SQLite.\n\nDetalle técnico: ${msg}\n\nBitácora de escritorio: ${logFile}`
    );
    stopBackend();
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  stopBackend();
});

app.on('will-quit', () => {
  stopBackend();
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    stopBackend();
    process.exit(0);
  });
}
