# Aplicación de Escritorio Windows e Instalador — SISAP by CENIVRA v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-011-WIN` |
| **Versión del producto** | `1.1.0` (rama `release/1.1.0`) |
| **Fecha de verificación** | 2026-11-23 |
| **Plataforma objetivo** | Windows 10 / Windows 11 x64 (`perMachine: false`, sin requerir elevación UAC obligatoria) |

---

## 1. Decisión Arquitectónica: Electron v45 vs Tauri

Se evaluó el empaquetado de escritorio Windows entre **Electron v45** y **Tauri**:

| Criterio | Electron v45 (`electron-builder` v26.18.0) | Tauri |
|---|---|---|
| **Compatibilidad Node.js + `node:sqlite`** | Nativa en el mismo proceso (`server.js` + `DatabaseSync` embebido en `main.cjs`) | Requeriría sidecar Node.js externo o reescritura del backend HTTP/SQLite en Rust |
| **Cero procesos huérfanos** | Garantizado mediante `stopBackend()` (`server.closeAllConnections()` + `closeDatabase()`) en `before-quit`, `will-quit`, `window-all-closed`, `SIGINT` y `SIGTERM` | Mayor riesgo de procesos sidecar huérfanos en cierres forzados de Windows |
| **Disponibilidad de toolchain local** | Instalado y funcional en el entorno (`electron@45.0.0`, `electron-builder@26.18.0`) | Sin `rustc`, `cargo` ni MSVC Build Tools en el host |
| **Decisión final** | **Seleccionado** | Descartado para `v1.1.0` |

---

## 2. Artefactos Generados (`dist-electron/`)

Ambos ejecutables se encuentran empaquetados localmente tras la compilación de `vite build` y verificación integral:

| Artefacto | Ruta relativa en `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/` | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| **Instalador Windows (NSIS x64)** | `dist-electron/SISAP-by-CENIVRA-Setup-1.1.0-x64.exe` | `121,910,283` | `59b7f8a1455a2fed065cc10eefe242f22370d9b8763ca3c781140057453a1f98` |
| **Ejecutable Portable (x64)** | `dist-electron/SISAP-by-CENIVRA-Portable-1.1.0-x64.exe` | `110,741,682` | `b55d8018871fcda9fbfec4f4d62f1ff22619561b3b54261bfae96b72c078d177` |

Scripts disponibles en `package.json`:
- `npm run dist:win`: genera el instalador NSIS y la versión portable en modo estándar.
- `npm run dist:win:institutional`: compila el frontend con `VITE_SISAP_DISTRIBUTION=institutional` (bloqueando modo demostrativo, claves visibles y códigos TOTP de evaluación) y genera los paquetes Windows.

---

## 3. Operación en Windows, Persistencia en `%APPDATA%` y Respaldos IPC

1. **Arranque autónomo sin consola ni navegador externo:**
   - Al abrir **SISAP by CENIVRA** desde el acceso directo del Escritorio o Menú Inicio, `electron/main.cjs` adquiere `app.requestSingleInstanceLock()`.
   - Sondea puertos loopback en `127.0.0.1` (`8080`, luego `8081..8099`, o puerto efímero del SO si estuvieran ocupados) mediante `findAvailableLoopbackPort()`, evitando colisiones con otros servicios locales.
   - Configura `SISAP_ALLOWED_ORIGINS` dinámicamente para el puerto activo, importa `backend/src/server.js`, espera confirmación `service === 'sisap-local-backend'` en `/api/health` y pasa `--sisap-api-base=http://127.0.0.1:<puerto>/api` al `preload.cjs` aislado (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).
2. **Rutas protegidas de datos (`%APPDATA%\SISAP by CENIVRA`):**
   - `data/local/sisap_clinical.sqlite3`: base SQLite WAL con las 16 tablas y migraciones `001..004`. Si existe un perfil previo `sisap_test.sqlite3` en esa misma ruta y no existe `sisap_clinical.sqlite3`, realiza una copia no destructiva única; **nunca sobrescribe una base clínica existente**.
   - `backups/`: respaldos manuales `sisap_backup_<timestamp>.sqlite3` generados desde la interfaz (`DesktopStorageModal.tsx`) vía IPC `sisap:create-db-backup`.
   - `logs/desktop.log`: bitácora técnica de arranque y cierre sin PHI (con rotación automática a `desktop.prev.log` al superar 2 MB).
3. **Preservación en actualizaciones y desinstalación:**
   - `package.json` define `"deleteAppDataOnUninstall": false`, de modo que ni una actualización encima ni una desinstalación eliminan la base SQLite clínica ni los respaldos en `%APPDATA%`.
4. **Canales IPC expuestos en `window.sisapDesktop` (`electron/preload.cjs`):**
   - `getBackendInfo()`, `createDbBackup()`, `listDbBackups()`, `openDataDir('db' | 'backups' | 'logs')`, `readDesktopLog()`, `openExternal(url)` (solo `http:`/`https:`), `closeApp()`.

---

## 4. Verificación Limpia en Windows (10 Pasos Reales)

Ejecutada sobre los binarios finales reconstruidos mediante el arnés automatizado (`verify_windows_installer.mjs`, perfil aislado `--user-data-dir`):

1. **Instalación silenciosa limpia (`SISAP-by-CENIVRA-Setup-1.1.0-x64.exe /S /D=...`)**: PASS (`desktopShortcutExists: true`, `startMenuShortcutExists: true`).
2. **Estructura instalada**: PASS (`SISAP by CENIVRA.exe`, `Uninstall SISAP by CENIVRA.exe`, `dist/`, `backend/`, `engines/autoencoder/models/model_registry.json`).
3. **Arranque automático del backend embebido**: PASS (`http://127.0.0.1:8080`, `desktop.log` operativo en <1 s).
4. **Salud SQLite y Gobernanza Central**: PASS (`service: 'sisap-local-backend'`, `16` tablas, `active_model_id: 'encoder_22_checkpoint_fase2'`, SPA servida en `/`).
5. **Alta clínica e inferencia persistida**: PASS (`TUS-0001` creado y corrida `c9598c4b-e434-4810-845e-1c422aa7d44b` persistida en `model_runs` en `%APPDATA%`).
6. **Cierre limpio sin procesos huérfanos**: PASS (`0` procesos `SISAP by CENIVRA.exe` tras `CloseMainWindow()`, registro `Conexión SQLite cerrada correctamente.` en `desktop.log`).
7. **Reapertura y persistencia**: PASS (`TUS-0001` y su `model_run` continúan disponibles tras reiniciar).
8. **Actualización / Reinstalación sobre instalación previa**: PASS (la reinstalación silenciosa conserva intacta `sisap_clinical.sqlite3`).
9. **Fallback por conflicto de puerto**: PASS (al bloquear `127.0.0.1:8080`, la aplicación selecciona automáticamente `http://127.0.0.1:8081` y responde `/api/health`).
10. **Desinstalación silenciosa y supervivencia de datos**: PASS (`SISAP by CENIVRA.exe` eliminado; `sisap_clinical.sqlite3` conservada íntegra en `%APPDATA%`).
