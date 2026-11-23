# Especificación de Pruebas Automatizadas, Unitarias, Integración y Playwright/Chromium E2E — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-004` |
| **Título** | Arquitectura de Pirámide de Pruebas Automatizadas y Especificación E2E de 12 Flujos |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Calidad e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-007` · `SISAP-LC-008` · `SISAP-LC-009` · `SISAP-QA-008` |

---

## 1. Comandos de Ejecución en `package.json`

| Script npm | Alcance Técnico | Dependencia de Red / Externa |
|---|---|---|
| `npm test` / `npm run test:backend` | 7 suites de backend e integración SQLite/Motores/Psicometría/Monitorización (`backend/test/*.test.js`). | Ninguna (100% local offline). |
| `npm run test:fe` | Suite TypeScript de lógica clínica frontend (`src/test/frontend_units.test.ts`: `FE-01..05`). | Ninguna (Node + `tsx`). |
| `npm run test:all` | Ejecución unificada de las 8 suites (`41` casos unitarios y de integración JS + TS). | Ninguna. |
| `npm run test:coverage` | Ejecuta `scripts/run-coverage.mjs` con `--experimental-test-coverage` produciendo `coverage/lcov.info` y `coverage/summary.json`. | Ninguna. |
| `npm run test:e2e` | Ejecuta `e2e/run-chromium-e2e.mjs` en Chromium headless real vía DevTools Protocol WebSocket nativo en Node 24 contra `dist/` + SQLite WAL aislado en puerto `18090`. | Ninguna externa (usa Chromium instalado localmente o cacheado). |
| `npm run test:e2e:playwright` | Ejecuta `npx playwright test` usando [`playwright.config.ts`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/playwright.config.ts) y [`e2e/sisap-flows.spec.ts`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/e2e/sisap-flows.spec.ts) en puerto `18091`. | Requiere binario `@playwright/test` + Chromium (`npx playwright install` en CI). |
| `npm run qa:audit` | Auditoría estática (`SEC-GIT-01`, `SEC-FB-01`, `SEC-SCAN-01`, `SAST-SYNTAX-01`, `INT-AE-SHA`). | Ninguna. |
| `npm run qa:full` | Tubería local completa bloqueante: `qa:audit && lint && test:all && build && test:e2e`. | Ninguna. |

---

## 2. Cobertura de Nuevas Pruebas Unitarias Incorporadas (`MON-*` y `FE-*` + `T-04b`)

| ID Prueba | Archivo | Qué Verifica Específicamente |
|---|---|---|
| `T-04b` | `backend/test/patients.test.js` | Búsqueda parametrizada exacta por seudónimo institucional `TUS-XXXX` (`PRB-008`). |
| `MON-01` | `backend/test/monitoring.test.js` | Endpoint `GET /api/monitoring/metrics`: salud SQLite, conteo agregado sin PHI, WORM `valid`, `phi_exported: false`. |
| `MON-02` | `backend/test/monitoring.test.js` | Endpoint `POST /api/monitoring/client-error`: redacción `[REDACTED]` de `TUS-XXXX`, CURP, emails y rutas Windows; evento en auditoría. |
| `FE-01` | `src/test/frontend_units.test.ts` | Catálogo TS (`instrumentCatalog.ts`) + paridad `1:1` entre captura digital y secuencia numérica legada (`scoringEngine.ts`) en los 6 activos y exclusión `OCI-R`. |
| `FE-02` | `src/test/frontend_units.test.ts` | Compuerta estricta `D-06` en `scalesEngine.ts`: valida casos completos y rechaza omisiones o inconsistencias (`edad < tiempo_consumo`). |
| `FE-03` | `src/test/frontend_units.test.ts` | Ensamblaje de vector 24v, winsorización, inferencia Autoencoder SELU 12D cliente, invarianza `EROS` y opacidad `MOD-03`. |
| `FE-04` | `src/test/frontend_units.test.ts` | Criptografía WebCrypto (`PBKDF2-SHA256`, cifrado autenticado `AES-GCM` y códigos `OTP`). |
| `FE-05` | `src/test/frontend_units.test.ts` | Opt-in desactivado por defecto en `telemetryService.ts` y sanitización anti-PHI en `sanitizeTelemetryString()`. |

---

## 3. Especificación de los 12 Flujos E2E (`e2e/sisap-flows.spec.ts` y `e2e/run-chromium-e2e.mjs`)

Todos los flujos utilizan datos sintéticos en un perfil temporal limpio de Chromium y un directorio SQLite WAL aislado en `os.tmpdir()`, garantizando que jamás se alteren bases operativas reales ni la línea histórica `v1.0.0`.

| ID Flujo | Escenario Probado de Punta a Punta | Aserciones Verificadas |
|---|---|---|
| **`E2E-01`** | Arranque inicial SPA compilada (`dist/`), banner telemetría INAI y `/api/health` | Render completo sin errores de consola; opt-in guardado en `sisap_v1_telemetry_opt_in`; `/api/health` HTTP `200 { ok: true }`. |
| **`E2E-02`** | Cierre de sesión, login `admin`, rechazo MFA `000000`, MFA contingencia `123456`, vista RBAC y retorno clínico | Bloqueo ante OTP erróneo; acceso a vista `Modo Admin · Usuarios` (`debe_cambiar_clave = 1`); regreso autenticado como `psicologo`. |
| **`E2E-03`** | Padrón y Pacientes: alta sintética SQLite y búsqueda parametrizada | Modal `Alta de Nuevo Paciente`; asignación de seudónimo `TUS-0001`; búsqueda por subcadena `'Sintetico'` devuelve el expediente creado. |
| **`E2E-04`** | Catálogo del Centro Psicométrico (6 activos) y exclusión de `OCI-R` | Presencia de `BIS-11 (30)`, `BSL-23 (23)`, `GAD-7 (7)`, `EROS (10)`, `BADS (22)`, `STAXI-2 (57)` (`6` botones iniciar); `OCI-R` excluido sin aplicación activa. |
| **`E2E-05`** | Captura digital `GAD-7`, guardar borrador y retomar respuestas | Selección parcial de reactivos 1..3; persistencia en borrador; al pulsar `Retomar` en catálogo se preservan exactamente `3` botones `Limpiar respuesta`. |
| **`E2E-06`** | Finalización inmutable `GAD-7`, recálculo de algoritmo y bloqueo HTTP `409` | Cierre inmutable; historial Nivel 2 con `7 reactivos` conservados; recálculo no destructivo; intento de sobrescritura POST en SQLite bloqueado con HTTP `409 Conflict`. |
| **`E2E-07`** | Navegación multivista clínica y gobernanza (`v1.0.0 → v1.1.0`) | Recorrido por 9 pantallas heredadas/operativas sin pantallas vacías ni excepciones JS. |
| **`E2E-08`** | Simulador Autoencoder 12D y Arquitectura y Pesos | Aviso didáctico explícito, cambio a `Arquetipo B`, actualización de 12 dimensiones y pestaña `Auditoría Científica DICO / DCSA`. |
| **`E2E-09`** | Compuerta `D-06` (`E5_insufficient`) en Ecosistema de Inteligencia | Para paciente con captura incompleta (solo `GAD-7`), verifica despliegue explícito del bloqueo `Compuerta D-06 · Representación Latente No Disponible (E5_insufficient)`. |
| **`E2E-10`** | Inferencia Motor 1 (`22v`/`24v`) y reglas `E1–E5` vía `/api/engines/*` | Resolución UUID por seudónimo, inferencia persistida (`22v` y `24v`) con `12` latentes finitas, `MSE_z` finito, opacidad `MOD-03` y `automatic_diagnosis_allowed: false`. |
| **`E2E-11`** | Monitorización soberana de errores cliente y sanitización anti-PHI | Disparo de `ErrorEvent` sintético en ventana con `TUS-9876`/CURP/email; entrega asíncrona por `sendBeacon` a `audit_events` (`monitoring.client_error`), verificación anti-fuga y `phi_exported: false` en `/api/monitoring/metrics`. |
| **`E2E-12`** | Reinicio completo del proceso backend (`SIGTERM` → respawn), persistencia SQLite WAL e integridad WORM | Muerte y relanzamiento real del servidor Node sobre el mismo archivo WAL + recarga completa Chromium; verifica paciente, evaluación `GAD-7` cerrada y `audit/verify` `{ valid: true }`. |
