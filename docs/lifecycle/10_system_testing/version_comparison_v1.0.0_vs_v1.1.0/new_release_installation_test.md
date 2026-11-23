# Prueba de Instalación Local Independiente — SISAP v1.1.0 (Entorno B)

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-VV-INST-110` |
| **Título** | Registro de Instalación Local Independiente y Verificación de Arranque de SISAP `v1.1.0` (`release/1.1.0`) |
| **Versión bajo prueba** | `v1.1.0` candidata en rama `release/1.1.0` (base `f9ac00a` + corrección `PRB-007` en `googleDriveService.ts`) |
| **Estado** | **En revisión** |
| **Fecha de ejecución / registro** | 2026-11-23 |
| **Responsable** | Equipo de Verificación y Calidad — SISAP by CENIVRA |
| **Documentos relacionados** | `SISAP-LC-008` · `SISAP-LC-010` · `SISAP-VV-CMP-001` · `SISAP-VV-ISS-110` |

---

## 1. Configuración del Entorno B (Reproducible y Aislado)

- **Sistema Operativo y Hardware:** Microsoft Windows NT `10.0.26300.0` (`win32` `x64`), `Intel(R) Core(TM) i3-10110U CPU @ 2.10GHz` (2 núcleos / 4 procesadores lógicos), `7.81 GB` RAM física.
- **Runtime:** Node.js `v24.22.1`, npm `11.19.1`.
- **Fuente:** Rama `release/1.1.0` (incluye corrección en `src/services/googleDriveService.ts` mediante `import.meta.glob` opcional).
- **Aislamiento completo respecto al Entorno A (`v1.0.0`):**
  - Puerto exclusivo: `SISAP_PORT=18082` (`SISAP_HOST=127.0.0.1`).
  - Base de datos independiente: `SISAP_DB_DIR=...\scratch\db_env_b_v1_1_0`, `SISAP_DB_FILE=sisap_env_b_v1_1_0.sqlite3`.

---

## 2. Casos de Prueba Registrados (Entorno B)

| Identificador | Requisitos Relacionados | Procedimiento | Resultado Esperado | Resultado Obtenido | Evidencia | Incidencias | Estado Final |
|---|---|---|---|---|---|---|---|
| **`INST-B-01`** Inicialización limpia BD `v1.1.0` | `REQ-CORE-004`, `REQ-AVAIL-001` | Ejecutar `init-db.js`, `seed-fixtures.js` y `health.js` con `SISAP_DB_DIR` aislado. | 3 migraciones (`001`, `002`, `003`), 15 tablas, `missingTables: []`, `foreignKeysEnabled: true`, `ok: true`. | `migrationsApplied: 3`, `tables: 15`, `missingTables: []`, `foreignKeysEnabled: true`, `ok: true`, fixtures `TUS-0001..0003` creados. | Log `task-1029` | Ninguna | **Aprobado** |
| **`INST-B-02`** Compilación limpia SIN `firebase-applet-config.json` | `REQ-PRIV-002`, `PRB-007` | Copiar código de `release/1.1.0` a directorio sin `firebase-applet-config.json` (`Test-Path = False`) y ejecutar `npm run lint` + `npm run build`. | `0` errores TS y compilación Vite limpia cumpliendo autonomía local sin configuración Firebase. | `tsc --noEmit` = `0` errores; `vite build` transformó **`1717` módulos en `2.27s`** (`dist/index.html` `1.21 kB`, JS `1,199.98 kB`). | Salida directa `CLEAN NO-FIREBASE-CONFIG BUILD PASS` | Ninguna (`PRB-007` resuelto) | **Aprobado** |
| **`INST-B-03`** Compilación estándar en árbol de trabajo completo | `REQ-PERF-001`, `REQ-UX-001` | Ejecutar `npm run lint` y `npm run build` en el directorio principal de `release/1.1.0`. | `0` errores TS y generación de bundle SPA completo. | `tsc --noEmit` = `0` errores; `vite build` transformó **`1718` módulos en `2.15s`** (`dist/index.html` `1.21 kB`, CSS `52.96 kB`, JS `1,200.43 kB`). | Log `task-1029` | Ninguna *(advertencia informativa estándar Vite por tamaño de chunk >500 kB y uso de `__dirname` en `vite.config.ts`)* | **Aprobado** |
| **`INST-B-04`** Suite automatizada integral de `v1.1.0` | `REQ-CORE-*`, `REQ-AE-*`, `REQ-PSYC-*`, `REQ-LONG/NARR/MM/DSS-*` | Ejecutar `npm test` (`node --test backend/test/*.test.js`). | `33 / 33 PASS`, `0` fallos. | **`33 / 33 PASS`** (`fail: 0`, `duration_ms: 977.5891`). | Log `task-1029` | Ninguna | **Aprobado** |
| **`INST-B-05`** Arranque HTTP loopback, UI y verificación funcional completa `v1.1.0` | `REQ-SEC-*`, `REQ-AE-*`, `REQ-PSYC-*` | Arrancar servidor en `127.0.0.1:18082`; verificar `/api/health`, `GET /`, operaciones núcleo + todos los endpoints nuevos (`Autoencoder`, `Centro Psicométrico`, `Motores 2..5`). | Todos los servicios y rutas responden con exactitud funcional, validaciones de error y cadena WORM válida. | Arranque en **`346.4 ms`**, RSS `61.00 MB → 70.52 MB`, `GET /` `200`, núcleo + Autoencoder + 6 escalas + Motores 2..5 operativos, `audit_events` válido (`34` eventos). | `comparison_benchmark_results.json` (`env_b`) | Ninguna | **Aprobado** |

---

## 3. Instrucciones de Reproducción desde Cero (Entorno B — `release/1.1.0`)

```powershell
git checkout release/1.1.0
cd ./sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza
npm ci
$env:SISAP_DB_DIR = "$PWD\tmp_db_v1_1_0"
$env:SISAP_DB_FILE = "sisap_v1_1_0.sqlite3"
$env:SISAP_PORT = "18082"
node backend/src/cli/init-db.js
node backend/src/cli/seed-fixtures.js
node backend/src/cli/health.js
npm test
npm run lint
npm run build
node backend/src/server.js
```
*(Responsable: Equipo de Verificación SISAP · Fecha: 2026-11-23 · Estado general Entorno B: **Aprobado**).*
