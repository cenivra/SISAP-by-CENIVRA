/**
 * SISAP by CENIVRA — Proceso Principal de Escritorio (Electron Main Process)
 *
 * Características de Gobernanza y Ciclo de Vida:
 *  - Ventana nativa independiente (sin dependencia de navegador externo).
 *  - Proceso unificado y seguro: el backend local SQLite/HTTP se ejecuta integrado
 *    en el proceso principal de Electron, garantizando cero procesos huérfanos.
 *  - Protección contra instancias múltiples (Single-Instance Lock).
 *  - Aislamiento estricto de contexto (contextIsolation: true, nodeIntegration: false, sandbox: true).
 *  - Restricción estricta de navegación externa y prevención de ataques de inyección.
 *  - Persistencia de datos en directorio Windows protegido (%APPDATA% en producción, data/local en desarrollo).
 */
const { app, BrowserWindow, dialog, shell, ipcMain } = require('electron');
const path = require('node:path');
const http = require('node:http');
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

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = Number(process.env.SISAP_PORT || 8080);
const HOST = '127.0.0.1';

// Directorio raíz de la aplicación
const appRoot = app.isPackaged
  ? (fs.existsSync(path.resolve(process.resourcesPath, 'app'))
      ? path.resolve(process.resourcesPath, 'app')
      : app.getAppPath())
  : path.resolve(__dirname, '..');

// Directorio de persistencia de datos (Windows AppData en producción / data/local en desarrollo)
const userDbDir = app.isPackaged
  ? path.join(app.getPath('userData'), 'data', 'local')
  : path.join(appRoot, 'data', 'local');

/**
 * Comprueba si el backend local está respondiendo en /api/health
 */
function checkBackendHealth(timeoutMs = 1000) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: HOST,
        port: PORT,
        path: '/api/health',
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve(Boolean(data && data.ok));
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

/**
 * Sondeo hasta que el backend esté listo
 */
async function waitForBackend(maxRetries = 40, delayMs = 200) {
  for (let i = 0; i < maxRetries; i++) {
    const ok = await checkBackendHealth(500);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

/**
 * Inicializa el backend local de SQLite
 */
async function startBackend() {
  // Asegurar que el directorio de datos existe
  try {
    fs.mkdirSync(userDbDir, { recursive: true });
  } catch (err) {
    console.error('[SISAP Desktop] Error asegurando carpeta de datos:', err);
  }

  // Si estamos en producción y la base local no existe en AppData pero existe en appRoot, copiarla
  const targetDb = path.join(userDbDir, 'sisap_test.sqlite3');
  const sourceDb = path.join(appRoot, 'data', 'local', 'sisap_test.sqlite3');
  if (app.isPackaged && !fs.existsSync(targetDb) && fs.existsSync(sourceDb)) {
    try {
      fs.copyFileSync(sourceDb, targetDb);
      console.log('[SISAP Desktop] Base de datos inicial copiada a AppData:', targetDb);
    } catch (e) {
      console.warn('[SISAP Desktop] No se pudo copiar base inicial:', e.message);
    }
  }

  // Configurar entorno antes de importar el servidor
  process.env.SISAP_HOST = HOST;
  process.env.SISAP_PORT = String(PORT);
  process.env.SISAP_DB_DIR = userDbDir;
  process.env.SISAP_DB_FILE = 'sisap_test.sqlite3';

  // Si ya está activo en el puerto, reutilizar
  const alreadyRunning = await checkBackendHealth(300);
  if (alreadyRunning) {
    console.log('[SISAP Desktop] Servicio local ya activo en puerto', PORT);
    return;
  }

  const serverScript = path.join(appRoot, 'backend', 'src', 'server.js');
  const serverModuleUrl = pathToFileURL(serverScript).href;

  console.log('[SISAP Desktop] Importando e iniciando backend local desde:', serverScript);
  const serverMod = await import(serverModuleUrl);
  serverInstance = serverMod.startServer();
  closeDbFn = serverMod.closeDatabase;

  const ready = await waitForBackend();
  if (!ready) {
    throw new Error(`El servicio local no respondió en http://${HOST}:${PORT}/api/health tras el inicio.`);
  }
}

/**
 * Detiene el servidor y cierra la base de datos de forma limpia
 */
function stopBackend() {
  if (serverInstance) {
    console.log('[SISAP Desktop] Deteniendo servidor HTTP local...');
    try {
      serverInstance.close();
      serverInstance = null;
    } catch (e) {
      console.error('[SISAP Desktop] Error cerrando servidor HTTP:', e);
    }
  }
  if (typeof closeDbFn === 'function') {
    try {
      closeDbFn();
      closeDbFn = null;
    } catch (e) {
      console.error('[SISAP Desktop] Error cerrando base de datos:', e);
    }
  }
}

/**
 * Crea la ventana principal de escritorio
 */
function createWindow() {
  const iconPath = path.join(appRoot, 'assets', 'icons', 'sisap.ico');
  const fallbackIcon = path.join(appRoot, 'assets', 'icons', 'sisap_256.png');
  const resolvedIcon = fs.existsSync(iconPath)
    ? iconPath
    : fs.existsSync(fallbackIcon)
    ? fallbackIcon
    : undefined;

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'SISAP by CENIVRA — Sistema de Información Clínica y Gobernanza',
    icon: resolvedIcon,
    show: false, // Espera a ready-to-show para evitar destello
    backgroundColor: '#161616',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // URL del frontend servido localmente por el backend en loopback
  const targetUrl = `http://${HOST}:${PORT}/`;
  console.log('[SISAP Desktop] Cargando interfaz:', targetUrl);
  mainWindow.loadURL(targetUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Interceptar navegación no autorizada fuera del origen local
  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const parsed = new URL(url);
      const isLocal =
        (parsed.hostname === HOST || parsed.hostname === 'localhost') &&
        (parsed.port === String(PORT) || parsed.port === '3000');
      if (!isLocal) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch {
      event.preventDefault();
    }
  });

  // Interceptar ventanas emergentes (target="_blank")
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

// 2. Control de eventos de aplicación y ciclo de vida
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  // IPC Handlers
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
      port: PORT,
      userDbDir,
      version: app.getVersion(),
      isPackaged: app.isPackaged,
    };
  });

  ipcMain.handle('sisap:close-app', () => {
    app.quit();
  });

  try {
    await startBackend();
    createWindow();
  } catch (err) {
    console.error('[SISAP Desktop] Error fatal de inicialización:', err);
    dialog.showErrorBox(
      'Error de Inicialización SISAP',
      `No se pudo iniciar la base de datos o el servicio local:\n\n${err.message}\n\nVerifique que el puerto ${PORT} esté libre.`
    );
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

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
