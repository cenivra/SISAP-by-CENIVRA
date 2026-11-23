# Informe de Cobertura de Pruebas y Ejecución E2E Real en Chromium — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-008` |
| **Título** | Resultados Verificados de Auditoría Estática, Cobertura LCOV, Pruebas Unitarias/Integración y E2E Chromium |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de ejecución** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Verificación y Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Evidencias fuente** | [`coverage/summary.json`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/coverage/summary.json) · [`e2e/results.json`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/e2e/results.json) |

---

## 1. Resumen Ejecutivo de Ejecuciones Locales Verificadas

| Verificación | Comando | Alcance Exacto | Resultado Verificado |
|---|---|---|---|
| **Auditoría estática e integridad** | `npm run qa:audit` | `SEC-GIT-01` (290 archivos), `SEC-FB-01`, `SEC-SCAN-01` (86 archivos), `SAST-SYNTAX-01`, `INT-AE-SHA` (8/8 modelos) | **PASS (`0` errores, `0` advertencias)** |
| **Tipado TypeScript** | `npm run lint` (`tsc --noEmit`) | Código productivo `src/` (`exclude` aplicado a E2E) | **PASS (`0` errores)** |
| **Pruebas unitarias/integración JS + TS** | `npm run test:all` | 8 suites (`backend/test/*.test.js` + `src/test/frontend_units.test.ts`), **41 pruebas** | **PASS (`41/41 PASS`, `fail: 0`, `skipped: 0`)** |
| **Cobertura consolidada LCOV** | `npm run test:coverage` | **30 módulos fuente** (`backend/src/*`, `engines/autoencoder/*`, `src/*`) | **PASS (`87.38%` líneas, `66.59%` ramas, `82.43%` funciones)** |
| **Compilación SPA limpia** | `npm run build` (`vite build`) | Empaquetado completo sin requerir `firebase-applet-config.json` | **PASS (`1718` módulos transformados)** |
| **Suite E2E Chromium Headless** | `npm run test:e2e` (`e2e/run-chromium-e2e.mjs`) | **12 flujos** punta a punta en `chrome.exe` real + backend/SQLite temporal | **PASS (`12/12 PASS`, `0` errores de consola, `0` excepciones)** |

---

## 2. Desglose de Cobertura por Módulo (`coverage/summary.json`)

Totales medidos sobre **`30` módulos lógicos** (`7,899` líneas totales, `6,902` cubiertas = **`87.38%`**; `1,314` ramas totales, `875` cubiertas = **`66.59%`**; `370` funciones totales, `305` cubiertas = **`82.43%`**):

| Módulo | Cobertura Líneas | Cobertura Ramas | Cobertura Funciones | Líneas Cubiertas / Totales |
|---|---:|---:|---:|---:|
| `backend/src/config.js` | `100.00%` | `100.00%` | `100.00%` | `61 / 61` |
| `backend/src/db/index.js` | `89.92%` | `63.16%` | `100.00%` | `116 / 129` |
| `backend/src/db/migrations.js` | `88.24%` | `71.43%` | `100.00%` | `90 / 102` |
| `backend/src/middleware/security.js` | `64.89%` | `81.25%` | `66.67%` | `61 / 94` |
| `backend/src/psychometrics/instrumentCatalog.js` | `86.47%` | `72.34%` | `84.62%` | `147 / 170` |
| `backend/src/psychometrics/scoringEngine.js` | `94.91%` | `82.86%` | `93.75%` | `653 / 688` |
| `backend/src/routes/index.js` | `69.86%` | `75.00%` | `100.00%` | `197 / 282` |
| `backend/src/services/analyticalService.js` | `93.57%` | `50.88%` | `100.00%` | `262 / 280` |
| `backend/src/services/auditService.js` | `83.54%` | `77.78%` | `66.67%` | `66 / 79` |
| `backend/src/services/autoencoderService.js` | `93.72%` | `27.78%` | `75.00%` | `209 / 223` |
| `backend/src/services/decisionSupportService.js` | `86.64%` | `21.43%` | `62.50%` | `188 / 217` |
| `backend/src/services/evaluationService.js` | `90.97%` | `58.33%` | `66.67%` | `131 / 144` |
| `backend/src/services/modelRunService.js` | `26.37%` | `100.00%` | `0.00%` | `24 / 91` |
| `backend/src/services/monitoringService.js` | `100.00%` | `50.00%` | `100.00%` | `87 / 87` |
| `backend/src/services/multimodalService.js` | `100.00%` | `11.11%` | `66.67%` | `155 / 155` |
| `backend/src/services/narrativeService.js` | `87.16%` | `38.46%` | `54.55%` | `190 / 218` |
| `backend/src/services/patientService.js` | `91.98%` | `73.17%` | `77.78%` | `195 / 212` |
| `backend/src/services/psychometricService.js` | `93.76%` | `58.82%` | `100.00%` | `481 / 513` |
| `backend/src/utils/crypto.js` | `83.33%` | `80.00%` | `60.00%` | `40 / 48` |
| `backend/src/utils/errors.js` | `86.84%` | `100.00%` | `66.67%` | `33 / 38` |
| `backend/src/utils/logger.js` | `94.12%` | `71.43%` | `50.00%` | `64 / 68` |
| `engines/autoencoder/embeddings/latentSpaceAnalyzer.js` | `94.51%` | `59.62%` | `92.86%` | `241 / 255` |
| `engines/autoencoder/inference/autoencoderInferenceEngine.js` | `84.02%` | `59.87%` | `100.00%` | `920 / 1095` |
| `src/data/autoencoderData.ts` | `100.00%` | `100.00%` | `100.00%` | `184 / 184` |
| `src/psychometrics/instrumentCatalog.ts` | `70.80%` | `72.97%` | `61.54%` | `194 / 274` |
| `src/psychometrics/scoringEngine.ts` | `92.70%` | `72.56%` | `87.50%` | `813 / 877` |
| `src/services/autoencoderEngine.ts` | `82.75%` | `67.39%` | `55.56%` | `355 / 429` |
| `src/services/cryptoService.ts` | `88.03%` | `76.92%` | `89.47%` | `206 / 234` |
| `src/services/scalesEngine.ts` | `91.61%` | `68.18%` | `94.74%` | `415 / 453` |
| `src/services/telemetryService.ts` | `60.30%` | `71.43%` | `35.71%` | `120 / 199` |

*(Nota de brecha honesta: `modelRunService.js` (`26.37%`) y los listeners DOM del navegador en `telemetryService.ts` (`60.30%`) tienen cobertura unitaria parcial, aunque las rutas HTTP de telemetría y persistencia de `model_runs` sí quedaron ejercitadas en vivo durante `E2E-10` y `E2E-11`).*

---

## 3. Resultados de los 12 Flujos E2E en Chromium Real (`e2e/results.json`)

- **Navegador ejecutado:** `chrome.exe` (Chromium headless vía DevTools Protocol en Node `v24.22.1`)
- **Errores de consola JS:** `0` · **Excepciones de página no capturadas:** `0`
- **Defecto real detectado y corregido durante E2E:** `PRB-008` (`patientService.js` ahora resuelve `TUS-XXXX` exactamente, habilitando sincronización completa UI → SQLite en `E2E-06` y persistencia post-reinicio en `E2E-12`).

| Flujo | Descripción | Estado | Duración |
|---|---|---|---:|
| `E2E-01` | Arranque inicial, SPA compilada, banner INAI y `/api/health` | **PASSED** | `1499 ms` |
| `E2E-02` | Logout, login `admin`, rechazo MFA inválido, MFA `123456`, vista RBAC y retorno clínico | **PASSED** | `1170 ms` |
| `E2E-03` | Padrón y Pacientes — alta sintética en SQLite y búsqueda parametrizada | **PASSED** | `723 ms` |
| `E2E-04` | Catálogo Centro Psicométrico (6 activos) y exclusión `OCI-R` | **PASSED** | `118 ms` |
| `E2E-05` | Captura digital `GAD-7`, guardar borrador y retomar respuestas | **PASSED** | `535 ms` |
| `E2E-06` | Finalización inmutable `GAD-7`, recálculo algoritmo y bloqueo HTTP `409` | **PASSED** | `436 ms` |
| `E2E-07` | Navegación multivista clínica `v1.0.0 → v1.1.0` sin errores | **PASSED** | `1156 ms` |
| `E2E-08` | Simulador Autoencoder 12D y Arquitectura/Pesos | **PASSED** | `174 ms` |
| `E2E-09` | Compuerta de seguridad `D-06` (`E5_insufficient`) en Ecosistema de Inteligencia | **PASSED** | `41 ms` |
| `E2E-10` | Inferencia Motor 1 Autoencoder (`22v`/`24v`) y guardrails `E1–E5` en `/api/engines` | **PASSED** | `77 ms` |
| `E2E-11` | Monitorización soberana de errores cliente y sanitización anti-PHI | **PASSED** | `79 ms` |
| `E2E-12` | Reinicio completo del proceso backend, persistencia SQLite WAL e integridad auditoría | **PASSED** | `956 ms` |
