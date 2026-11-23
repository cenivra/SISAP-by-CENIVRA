# Matriz de Trazabilidad Bidireccional — SISAP by CENIVRA v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-015` |
| **Título** | Matriz de Trazabilidad Bidireccional (IEC 62304 §5.2–5.7, §7.1–7.3) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Calidad e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-003` · `SISAP-LC-004` · `SISAP-LC-005` · `SISAP-LC-008..011` · `docs/modules/*` · `SISAP-QA-001..010` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Matriz bidireccional completa que enlaza cada requisito `REQ-*` con diseño, implementación, riesgo `RSK-*`, control, prueba, resultado real y release en `release/1.1.0`. | Equipo de Ingeniería SISAP |
| `1.1.0-draft` | 2026-11-23 | Enlace de controles de aseguramiento de calidad (`qa:audit`, `MON-01..02`, `FE-01..05`, `T-04b`, `E2E-01..12` y `SISAP-QA-001..010`). | Equipo de Calidad SISAP |

---

## 1. Trazabilidad Directa (`Requisito → Diseño → Componente → Implementación → Riesgo → Control → Prueba → Resultado → Release`)

| Requisito (`SISAP-LC-003`) | Diseño (`SAD` / Módulo) | Componente / Archivo Implementado | Riesgo (`SISAP-LC-004`) | Control de Riesgo Implementado | Prueba Asociada | Resultado Real Verificado | Release / Commit |
|---|---|---|---|---|---|---|---|
| `REQ-CORE-001` | `SISAP-LC-005` §3 | `patientService.js`, `001_initial_schema.sql` | `RSK-003` | UUID interno + `TUS-XXXX` único + detección duplicados (`allow_duplicate`) | `T-06`, `T-06b` | **PASS** (`33/33`) | `v1.0.0` / `v1.1.0` |
| `REQ-CORE-002` | `SISAP-LC-005` §3 | `patientService.js`, `evaluationService.js` | `RSK-005` | Sentencias parametrizadas + transacciones atómicas | `T-04`, `T-08`, `T-09` | **PASS** (`33/33`) | `v1.0.0` / `v1.1.0` |
| `REQ-CORE-003` | `SISAP-LC-005` §3 | `db/index.js`, `evaluationService.js` | `RSK-003`, `RSK-005` | `PRAGMA foreign_keys = ON` en esquema y conexión | `T-07`, `health.js` | **PASS** (`33/33`) | `v1.0.0` / `v1.1.0` |
| `REQ-CORE-004` | `SISAP-LC-005` §3 | `db/migrations.js`, `002`, `003` | `RSK-011`, `RSK-012` | Migraciones aditivas idempotentes (`IF NOT EXISTS`) | `T-01`, `T-02`, `MOT-01`, `PSYC-01`, `init-db` | **PASS** (`15` tablas) | `bb7078e`, `b9e94d7` (`v1.1.0`) |
| `REQ-AE-001` | `SISAP-MOD-AE-001` §4 | `autoencoderInferenceEngine.js`, `model_registry.json` | `RSK-004` | Validación SHA-256 obligatoria sobre los 8 artefactos | `AE-01` | **PASS** (`33/33`) | `4cb847b` (`v1.1.0`) |
| `REQ-AE-002` | `SISAP-MOD-AE-001` §3, §5 | `autoencoderInferenceEngine.js`, `Autoencoder_TUS_estratificacion_APP.R`, `R/01..07` | `RSK-004`, `PRB-004` | Pipeline 5 capas exacto (`SELU+Linear`) con paridad R↔JS (`0.0000e+0`) | `AE-02`, `T1.1..T4.3` | **PASS** (R & Node) | `4cb847b` (`v1.1.0`) |
| `REQ-AE-003` | `SISAP-MOD-AE-001` §3 | `autoencoderInferenceEngine.js`, `scalesEngine.ts`, `routes/index.js` | `RSK-002`, `PRB-006` | Compuerta `D-06` rechaza faltantes sin imputación (`HTTP 422`) | `AE-03` | **PASS** (`33/33`) | `4cb847b` (`v1.1.0`) |
| `REQ-AE-004` | `SISAP-MOD-AE-001` §2 | `autoencoderInferenceEngine.js`, `scalesEngine.ts` | `RSK-004`, `PRB-002` | Aislamiento semántico `EROS_raw` vs `tiempo_consumo` | `AE-04` | **PASS** (`33/33`) | `4cb847b` (`v1.1.0`) |
| `REQ-AE-005` | `SISAP-MOD-AE-001` §1, §5 | `latentSpaceAnalyzer.js`, `LatentIntervalChart.tsx`, `ReconstructionBarsChart.tsx` | `RSK-009` | Dimensiones opacas `latent_01..12` (`MOD-03`), bloqueo GMM (`D-03`) | `AE-02`, `MOT-02` | **PASS** (`33/33`) | `4cb847b` (`v1.1.0`) |
| `REQ-AE-006` | `SISAP-MOD-AE-001` §4 | `autoencoderInferenceEngine.js`, `routes/index.js` (`candidate17/infer`) | `RSK-009` | Aislamiento explícito de `ae_tus_17to12_m3k12` como comparativo experimental | `AE-05` | **PASS** (`33/33`) | `4cb847b` (`v1.1.0`) |
| `REQ-AE-007` | `SISAP-LC-005` §4 | `autoencoderService.js`, `modelRunService.js` | `RSK-004`, `RSK-008` | Persistencia `model_runs` / `model_outputs` con `input_hash` SHA-256 | `AE-06` | **PASS** (`33/33`) | `4cb847b` (`v1.1.0`) |
| `REQ-AE-008` | `SISAP-MOD-AE-001` §4, §6 | `model_registry.json` | `RSK-009` | Etiquetado explícito `DESARROLLADO_PENDIENTE_VALIDACION_EXTERNA` | `AE-01` | **PASS** (registro) / Estudio externo **Pendiente** | `4cb847b` (`v1.1.0`) |
| `REQ-PSYC-001` | `SISAP-MOD-PSYC-001` §1 | `catalog_v1.json`, `instrumentCatalog.ts/.js` | `RSK-001`, `RSK-010` | Catálogo JSON desacoplado de UI con 6 activos y exclusión `OCI-R` | `PSYC-01` | **PASS** (`33/33`) | `b9e94d7` (`v1.1.0`) |
| `REQ-PSYC-002` | `SISAP-MOD-PSYC-001` §1 | `PsychometricCenterView.tsx`, `Sidebar.tsx` | `RSK-001`, `RSK-002` | Interfaz adaptable desktop/tablet por bloques/página con revisión pre-cierre | `PSYC-09`, `npm run build` | Compilación **PASS** / Usabilidad clínica **Pendiente** | `b9e94d7` (`v1.1.0`) |
| `REQ-PSYC-003` | `SISAP-MOD-PSYC-001` §1, §2 | `scoringEngine.ts/.js` | `RSK-001` | Separación en 5 capas + inversiones exactas (`5 - x`) | `PSYC-02..07` | **PASS** (`33/33`) | `b9e94d7` (`v1.1.0`) |
| `REQ-PSYC-004` | `SISAP-MOD-PSYC-001` §2 | `catalog_v1.json`, `PsychometricCenterView.tsx` | `RSK-001`, `RSK-010`, `PRB-001` | Orden TEA 2001 (`1..49`) + `pendingAuthorizedText: true` en `50..57` | `PSYC-07` | **PASS** (`33/33`) | `b9e94d7` (`v1.1.0`) |
| `REQ-PSYC-005` | `SISAP-MOD-PSYC-001` §2 | `scoringEngine.ts/.js` | `RSK-002`, `PRB-003` | Denominador `136` en `BSL-23` + bloqueo `isValidForScoring: false` ante omisiones | `PSYC-03`, `PSYC-08` | **PASS** (`33/33`) | `b9e94d7` (`v1.1.0`) |
| `REQ-PSYC-006` | `SISAP-MOD-PSYC-001` §3 | `scoringEngine.ts/.js`, `InitialEvaluationView.tsx`, `FollowUpScalesView.tsx` | `RSK-012` | Adaptador `verifyCaptureEquivalence` digital ↔ secuencia numérica | `PSYC-09` | **PASS** (`33/33`) | `b9e94d7` (`v1.1.0`) |
| `REQ-PSYC-007..010` | `SISAP-MOD-PSYC-001` §1 | `003_psychometric_center.sql`, `psychometricService.js`, `storageService.ts` | `RSK-005`, `RSK-006` | 3 niveles relacionales, borradores, bloqueo `409 Conflict`, recálculo aditivo y `versionMismatchWarning` | `PSYC-10`, `PSYC-11` | **PASS** (`33/33`) | `b9e94d7` (`v1.1.0`) |
| `REQ-LONG-001..003` | `SISAP-MOD-LONG-001` §2 | `analyticalService.js`, `002_intelligence_engines.sql`, `PsychometricCenterView.tsx` | `RSK-002`, `RSK-006`, `RSK-007` | Validación `D-06`, cálculo `RCI` con parámetros documentados y propagación longitudinal | `MOT-01`, `MOT-02`, `PSYC-10` | **PASS** (`33/33`) | `bb7078e`, `b9e94d7` (`v1.1.0`) |
| `REQ-NARR-001..002` | `SISAP-MOD-NARR-001` §1, §2 | `narrativeService.js` | `RSK-007`, `RSK-009`, `PRB-005` | Auditoría real de tamaño ONNX + extracción léxica `E1_explicit` (`pending_human_review`) | `MOT-02` | **PASS** (`33/33`) | `bb7078e` (`v1.1.0`) |
| `REQ-MM-001` | `SISAP-MOD-MM-001` §2 | `multimodalService.js` | `RSK-006` | Matriz de procedencia de 5 fuentes sin imputación silenciosa | `MOT-02` | **PASS** (`33/33`) | `bb7078e` (`v1.1.0`) |
| `REQ-DSS-001` | `SISAP-MOD-DSS-001` §2 | `decisionSupportService.js`, `IntelligenceEcosystemView.tsx` | `RSK-009` | `clinical_formulations` (`E1–E5`, `pending_human_review`, diagnóstico/prescripción bloqueados) | `MOT-02` | **PASS** (`33/33`) | `bb7078e` (`v1.1.0`) |
| `REQ-SEC-001..003` | `SISAP-LC-005` §2 | `config.js`, `security.js`, `electron/main.cjs` | `RSK-008` | `loopbackOnly`, CORS, `verifyOrigin`, `rateLimit`, Electron `sandbox: true` | `T-10`, `security.test.js`, inspección `main.cjs` | **PASS** (`33/33`) | `v1.0.0` / `v1.1.0` |
| `REQ-SEC-004` | `SISAP-LC-005` §6 | `src/types/clinical.ts`, `storageService.ts`, `Sidebar.tsx` | `RSK-008` | Matriz 10 `RoleKey` en UI | `npm run lint` | **PASS** en compilación / Token HTTP multiusuario **No aplicable en loopback `v1.1.0`** | `v1.0.0` / `v1.1.0` |
| `REQ-PRIV-001..002` | `SISAP-LC-005` §2 | `logger.js`, `.gitignore` | `RSK-008` | Enmascaramiento `[REDACTED]` y exclusiones Git | `security.test.js`, `rg`, `git diff` | **PASS** | `v1.0.0` / `v1.1.0` / `4cb847b` |
| `REQ-AVAIL-001` | `SISAP-LC-006` §3 | `db/index.js`, `init-db.js`, `health.js`, `backup.js` | `RSK-005` | WAL + FK ON + CLI respaldo y diagnóstico | `db.test.js`, ciclo BD limpia | **PASS** | `v1.0.0` / `v1.1.0` |
| `REQ-PERF-001` | `SISAP-LC-006` §3 | `autoencoderInferenceEngine.js`, `scoringEngine.js` | `RSK-007` | Ejecución síncrona determinista | `npm test` (`1231.68 ms`), `vite build` (`2.93s`) | **PASS** | `v1.1.0` |
| `REQ-UX-001` | `SISAP-MOD-PSYC-001` | `PsychometricCenterView.tsx` | `RSK-001`, `RSK-002` | Vista responsiva desktop/tablet + filtro de pendientes | `npm run lint`, `vite build` | **PASS** compilación / Campo **Pendiente** | `b9e94d7` (`v1.1.0`) |
| `REQ-INT-001` | `SISAP-MOD-AE-001` §3 | `engines/autoencoder/schemas/`, `R/`, JS | `RSK-004` | Esquemas compartidos R ↔ JS | `AE-02`, `test_dimensiones_latentes.R` | **PASS** | `4cb847b` (`v1.1.0`) |
| `REQ-TRAC-001` | `SISAP-LC-005` §4 | `auditService.js`, `001_initial_schema.sql` | `RSK-005`, `RSK-008` | Triggers WORM + cadena hash SHA-256 `verifyChain()` | `T-10 (parcial)`, `security.test.js` | **PASS** | `v1.0.0` / `v1.1.0` |

---

## 2. Trazabilidad Inversa (`Componente / Prueba → Requisito y Riesgo que Justifica su Existencia`)

| Archivo / Prueba Relevante | Requisitos que Justifican su Existencia | Riesgos que Mitiga |
|---|---|---|
| `engines/autoencoder/*` + `autoencoder_engine.test.js` (`AE-01..06`) | `REQ-AE-001` a `REQ-AE-008`, `REQ-INT-001`, `REQ-PERF-001` | `RSK-002`, `RSK-004`, `RSK-009` |
| `engines/autoencoder/tests/*.R` (`T1.1..T4.3`, regresión) | `REQ-AE-002`, `REQ-INT-001` | `RSK-004` |
| `engines/psychometrics/catalog_v1.json` + `scoringEngine.*` + `psychometricService.js` + `psychometric_center.test.js` (`PSYC-01..11`) | `REQ-PSYC-001` a `REQ-PSYC-010`, `REQ-CORE-004`, `REQ-UX-001` | `RSK-001`, `RSK-002`, `RSK-005`, `RSK-006`, `RSK-010`, `RSK-012` |
| `analyticalService.js`, `narrativeService.js`, `multimodalService.js`, `decisionSupportService.js` + `intelligence_motors.test.js` (`MOT-01..02`) | `REQ-LONG-001..003`, `REQ-NARR-001..002`, `REQ-MM-001`, `REQ-DSS-001` | `RSK-002`, `RSK-006`, `RSK-007`, `RSK-009` |
| `security.js`, `logger.js`, `auditService.js`, `electron/main.cjs` + `security.test.js`, `db.test.js`, `patients.test.js` | `REQ-CORE-001..003`, `REQ-SEC-001..004`, `REQ-PRIV-001..002`, `REQ-AVAIL-001`, `REQ-TRAC-001` | `RSK-003`, `RSK-005`, `RSK-008` |
| `LatentIntervalChart.tsx`, `ReconstructionBarsChart.tsx`, `IntelligenceEcosystemView.tsx`, `PsychometricCenterView.tsx` | `REQ-AE-005`, `REQ-PSYC-002`, `REQ-DSS-001`, `REQ-UX-001` | `RSK-001`, `RSK-009`, `RSK-010` |
| `telemetryService.ts`, `monitoringService.js`, `qa-static-audit.mjs`, `run-chromium-e2e.mjs`, `sisap-flows.spec.ts`, `.github/workflows/*` | `REQ-SEC-001..003`, `REQ-PRIV-001..002`, `REQ-TRAC-001`, verificación sistema `v1.1.0` | `QA-RSK-01..07`, `RSK-005`, `RSK-008`, `RSK-011` |
| `CHANGELOG.md`, `RELEASE_NOTES_v1.1.0.md`, `docs/lifecycle/*`, `docs/modules/*`, `docs/lifecycle/08_verification_and_validation/qa_infrastructure/*` (`SISAP-QA-001..010`) | Trazabilidad integral del ciclo de vida IEC 62304, aseguramiento QA y preservación `v1.0.0` | `RSK-011`, `RSK-012` |
