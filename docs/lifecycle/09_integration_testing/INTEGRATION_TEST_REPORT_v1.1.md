# Informe de Pruebas de Integración — SISAP v1.1

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-009` |
| **Título** | Informe de Integración y Pruebas de Integración (IEC 62304 §5.6) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Verificación e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-005` · `SISAP-LC-007` · `SISAP-LC-008` · `SISAP-LC-010` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Evidencia consolidada de la ejecución de integración extremo a extremo (33/33 pruebas backend + API + BD + Motores + Centro Psicométrico). | Equipo de Ingeniería SISAP |

---

## 1. Entorno de Ejecución Registrado
- **Fecha de ejecución de referencia sobre código final `release/1.1.0`:** 2026-11-23
- **Sistema Operativo / Arquitectura:** Windows x64
- **Runtime:** Node.js `v24.22.1` (`node:test`, `node:sqlite`)
- **Comando:** `npm test` (`node --test backend/test/*.test.js` en `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`)
- **Resultado global observado:** **`33 / 33 PASS`, `fail: 0`, `duration_ms: 1231.6818`, exit code `0`**.

---

## 2. Casos de Integración Verificados

| Caso de Prueba | Suites / Módulos Integrados | Procedimiento Verificado | Resultado |
|---|---|---|---|
| **`T-07`** | `routes` / `patientService` / `evaluationService` / SQLite | Creación transaccional de paciente y vinculación referencial de evaluación basal. | **PASS** |
| **`AE-06`** | `routes` (`/api/engines/autoencoder/*`) ↔ `autoencoderService` ↔ `model_runs` / `model_outputs` ↔ `auditService` | Persistencia completa de corrida `encoder_22`, vector `12D`, error de reconstrucción, rechazo `D-06` (`422`) y cadena WORM válida. | **PASS** |
| **`MOT-01`** | `migrations` (`002_intelligence_engines.sql`) ↔ `healthCheck()` | Verificación de existencia de `follow_up_evaluations` y `clinical_formulations` tras migración aditiva sobre `001`. | **PASS** |
| **`MOT-02`** | Motor 1 + Motor 2 (`RCI`) + Motor 3 (`narrativeService`) + Motor 4 (`multimodalService`) + Motor 5 (`decisionSupportService`) ↔ API REST | Flujo extremo a extremo: alta de seguimiento (`POST /api/follow-ups`), cálculo RCI con alerta, verificación `onnx_artifact.inference_ready: false`, matriz multimodal de 5 dominios (`GET /api/patients/:id/intelligence`), creación de formulación `pending_human_review` (`POST /api/patients/:id/formulations`) y verificación `automatic_diagnosis_disabled: true`. | **PASS** |
| **`PSYC-01`** | `migrations` (`003`) ↔ `instrumentCatalog` ↔ API REST | Verificación de 15 tablas totales, carga de 6 instrumentos activos desde `catalog_v1.json` y rechazo explícito de `OCI-R`. | **PASS** |
| **`PSYC-10` y `PSYC-11`** | `PsychometricService` ↔ `scoringEngine` ↔ SQLite (3 niveles) ↔ API REST | Guardado y reanudación de borrador (`draft`), cierre `completed`, rechazo `HTTP 409 Conflict` ante sobrescritura, recálculo con preservación de `psychometric_item_responses`, y emisión automática de `versionMismatchWarning: true` ante mezcla `BADS v22` vs `v25`. | **PASS** |
| **`verifyChain()` + `audit_events` (`T-10`)** | `auditService` ↔ SQLite triggers WORM | Validación criptográfica completa de la cadena `prev_hash -> hash` tras todas las operaciones de escritura e intento bloqueado de mutación SQL. | **PASS** |
