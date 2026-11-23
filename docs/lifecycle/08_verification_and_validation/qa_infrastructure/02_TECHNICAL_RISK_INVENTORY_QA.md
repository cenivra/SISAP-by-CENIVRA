# Inventario Técnico de Riesgos y Priorización para Aseguramiento de Calidad — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-002` |
| **Título** | Análisis Técnico de Puntos Críticos, Superficie de Fallo y Mapeo a Controles QA |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería, Riesgos y QA — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-004` (`RSK-001..012`) · `SISAP-LC-013` (`PRB-001..008`) · `SISAP-QA-001` · `SISAP-QA-009` |

---

## 1. Puntos Críticos Técnicos Detectados en Auditoría (`release/1.1.0`)

| ID Riesgo QA | Vector Técnico Específico | Evidencia / Hallazgo Observado en Auditoría | Controles QA Implementados | Evidencia de Verificación |
|---|---|---|---|---|
| **`QA-RSK-01`** *(vinculado a `RSK-008`)* | Exposición accidental de credenciales o rutas de entorno local en Git (`firebase-applet-config.json`, `.env`, SQLite con datos de prueba, rutas Windows `C:\Users\...`) | Histórico `PRB-007`: ausencia de `.json` rompía compilación en clones limpios de `v1.0.0`. | `qa-static-audit.mjs` (`SEC-GIT-01`, `SEC-FB-01`, `SEC-SCAN-01`), `.gitignore` endurecido y patrón `import.meta.glob` opcional. | `npm run qa:audit` (`0` hallazgos en 290 archivos Git y 86 archivos de código); build limpio PASS. |
| **`QA-RSK-02`** *(vinculado a `RSK-003/005`)* | Desincronización silenciosa UI ↔ SQLite al resolver pacientes por seudónimo (`PRB-008`) | Detectado en vivo por `E2E-06`: `PsychometricCenterView` consultaba `searchPatients('TUS-0001')` pero `patientService.js` no buscaba `pseudonym`. | Consulta exacta parametrizada `UPPER(pseudonym) = ?` en `patientService.js` + pruebas automatizadas de regresión UI+API. | `T-04b` (`41/41 PASS`) y `E2E-06` (`409 Conflict`) + `E2E-12` (`12/12 PASS`). |
| **`QA-RSK-03`** *(vinculado a `RSK-004/002`)* | Adulteración de matriz de pesos Autoencoder o bypass de compuerta `D-06` ante entradas incompletas | Riesgo de imputación silenciosa en vectores 22v/24v o divergencia silenciosa entre cliente TS (`scalesEngine.ts`) y backend Node (`autoencoderInferenceEngine.js`). | Verificación SHA-256 en arranque (`INT-AE-SHA`), tests `AE-01..06`, `FE-02..03` y verificación DOM de bloqueo `E5_insufficient` (`E2E-09`). | `qa:audit`, `test:all` (`41/41 PASS`) y `E2E-09` + `E2E-10` PASS. |
| **`QA-RSK-04`** *(vinculado a `RSK-001/010`)* | Regresión en puntuación psicométrica, inversiones (`BIS-11`/`EROS`), exclusión `OCI-R` o sobrescritura de evaluaciones cerradas | Riesgo de reactivar `OCI-R`, perder textos TEA 1..49 o mutar respuestas cerradas en Nivel 2. | `FE-01`, `PSYC-01..11`, bloqueo HTTP `409` en BD y validación de UI (`E2E-04`, `E2E-05`, `E2E-06`). | `PSYC-01..11`, `FE-01`, `E2E-04..06` PASS. |
| **`QA-RSK-05`** *(vinculado a `RSK-008`)* | Fuga de PHI en telemetría de errores del cliente o logs del servidor | Captura global `window.error` y `unhandledrejection` puede contener seudónimos `TUS-XXXX`, CURP, correos o rutas con usuario Windows. | Doble sanitización: cliente (`sanitizeTelemetryString`) y servidor (`sanitizeMonitoringText` + `logger`), más bandera `phi_exported: false`. | `FE-05`, `MON-01`, `MON-02` y `E2E-11` (`sendBeacon` + verificación no-fuga en respuesta y buffer). |
| **`QA-RSK-06`** *(vinculado a `RSK-005/011`)* | Corrupción de base SQLite WAL o pérdida de estado tras reinicio del proceso local | Pérdida de transacciones o alteración de bitácora WORM (`audit_events`) ante cierres o upgrades desde `v1.0.0`. | Modo WAL + `PRAGMA foreign_keys = ON` + triggers WORM + prueba E2E con muerte (`SIGTERM`) y relanzamiento real del proceso backend. | `T-01`, `T-02`, `T-09`, `T-10` y `E2E-12` (`verifyChain().valid === true` tras reinicio). |
| **`QA-RSK-07`** *(vinculado a `RSK-011`)* | Vulnerabilidades en SOUP (`npm` / GitHub Actions) o regresiones de calidad silenciosas | Acumulación de dependencias obsoletas o introducción de código inseguro (`eval`, `new Function`, XSS). | CodeQL SAST semanal + Dependabot semanal (`SOUP-review`), ESLint `v9` (`no-eval`, `eqeqeq`) y `npm audit` en CI. | Workflows `.github/workflows/codeql.yml`, `ci-quality-gate.yml` y `.github/dependabot.yml` activos en repositorio. |

---

## 2. Clasificación Prioritaria de Cobertura QA

1. **Prioridad Crítica (Bloqueo inmediato en `qa:full` y CI):** Compuertas clínicas (`D-06`), integridad SHA-256 del Autoencoder, inmutabilidad psicométrica (`HTTP 409`), sanitización anti-PHI, higiene de secretos en Git y persistencia tras reinicio SQLite WAL.
2. **Prioridad Alta (Bloqueo estático y de regresión):** Compilación TypeScript (`tsc --noEmit`), bundle Vite limpio, flujo completo de login/MFA/RBAC en Chromium, paridad matemática de las 6 escalas y exclusión `OCI-R`.
3. **Prioridad Media (Control continuo / Condicional):** Revisión semanal CodeQL & Dependabot, Quality Gate SonarQube Cloud al configurar `SONAR_TOKEN`, y ampliación progresiva de cobertura sobre módulos auxiliares UI y CLI (`modelRunService.js`, componentes de vistas narrativas).
