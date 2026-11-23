# Visión General del Diseño Detallado y Descomposición en Unidades — SISAP v1.1

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-006` |
| **Título** | Visión General del Diseño Detallado (SDD) e Índice de Expedientes Modulares |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Arquitectura e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-005` · `SISAP-LC-007` · `docs/modules/*` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Definición del mapa de unidades de software, manejo estándar de errores y enlaces a los 6 expedientes técnicos modulares. | Equipo de Ingeniería SISAP |

---

## 1. Propósito

Este documento conecta la arquitectura global (`SISAP-LC-005`) con el diseño detallado interno de cada *Software Item* y *Software Unit* de SISAP `v1.1.0`. Los algoritmos, reglas matemáticas, contratos JSON, esquemas de validación y excepciones específicas de cada subsistema clínico-analítico residen en su expediente modular dedicado bajo `docs/modules/`.

---

## 2. Mapa de Subsistemas y Expedientes Modulares Detallados

| Subsistema / Motor | Código Modular | Expediente Detallado | Unidades Principales de Software |
|---|---|---|---|
| **Autoencoder Funcional TUS (Motor 1)** | `SISAP-MOD-AE-001` | [`AUTOENCODER_TECHNICAL_AND_SCIENTIFIC_DOSSIER.md`](../../modules/autoencoder/AUTOENCODER_TECHNICAL_AND_SCIENTIFIC_DOSSIER.md) | `autoencoderInferenceEngine.js`, `latentSpaceAnalyzer.js`, `autoencoderService.js`, `src/services/autoencoderEngine.ts`, `src/services/scalesEngine.ts`, `engines/autoencoder/inference/R/01..07` |
| **Centro de Evaluación Psicométrica** | `SISAP-MOD-PSYC-001` | [`PSYCHOMETRIC_CENTER_DETAILED_DESIGN.md`](../../modules/psychometric_center/PSYCHOMETRIC_CENTER_DETAILED_DESIGN.md) | `catalog_v1.json`, `instrumentCatalog.ts/.js`, `scoringEngine.ts/.js`, `psychometricService.js`, `PsychometricCenterView.tsx`, `003_psychometric_center.sql` |
| **Analítica Longitudinal (Motor 2)** | `SISAP-MOD-LONG-001` | [`LONGITUDINAL_ANALYTICS_MODULE.md`](../../modules/longitudinal_analytics/LONGITUDINAL_ANALYTICS_MODULE.md) | `analyticalService.js`, `FollowUpScalesView.tsx`, `002_intelligence_engines.sql` (`follow_up_evaluations`) |
| **Inteligencia Narrativa (Motor 3)** | `SISAP-MOD-NARR-001` | [`NARRATIVE_INTELLIGENCE_MODULE.md`](../../modules/narrative_intelligence/NARRATIVE_INTELLIGENCE_MODULE.md) | `narrativeService.js`, `WeeklyNarrativeView.tsx`, `weekly_observations` |
| **Integración Multimodal (Motor 4)** | `SISAP-MOD-MM-001` | [`MULTIMODAL_INTEGRATION_MODULE.md`](../../modules/multimodal_integration/MULTIMODAL_INTEGRATION_MODULE.md) | `multimodalService.js` |
| **Apoyo a Decisiones `E1–E5` (Motor 5)** | `SISAP-MOD-DSS-001` | [`DECISION_SUPPORT_MODULE.md`](../../modules/decision_support/DECISION_SUPPORT_MODULE.md) | `decisionSupportService.js`, `IntelligenceEcosystemView.tsx`, `002_intelligence_engines.sql` (`clinical_formulations`) |

---

## 3. Unidades Transversales de Infraestructura, Seguridad y Persistencia

| Unidad | Archivo | Responsabilidad y Contratos | Manejo de Errores y Excepciones |
|---|---|---|---|
| **Configuración** | `backend/src/config.js` | Resuelve rutas relativas sin rutas locales fijas (`appRoot`, `dbDir`, `host: '127.0.0.1'`, `port: 8080`, `rateLimitPerMinute: 100`, `maxBodyBytes: 262144`). | Usa valores por defecto seguros cuando faltan variables de entorno `SISAP_*`. |
| **Gestor SQLite WAL** | `backend/src/db/index.js`, `migrations.js` | Abre `node:sqlite` (`DatabaseSync`), activa `PRAGMA journal_mode = WAL` y `PRAGMA foreign_keys = ON`, ejecuta migraciones `001..003` en orden con checksum SHA-256 y verifica 15 tablas en `healthCheck()`. | Aborta inicio ante migración alterada o violación de FK; reporta `ok: false` y `missingTables` en `/api/health`. |
| **Errores Tipados** | `backend/src/utils/errors.js` | Define constructores `Errors.badRequest` (`400`), `forbidden` (`403`), `notFound` (`404`), `conflict` (`409`), `tooMany` (`429`), `unprocessable` (`422`). | Impide filtrado de stack traces crudos en respuestas JSON y garantiza códigos HTTP semánticos. |
| **Seguridad HTTP** | `backend/src/middleware/security.js` | `loopbackOnly`, `applyCors`, `verifyOrigin`, `rateLimit`, `readJsonBody`. | Cierra socket/destruye stream si cuerpo excede `256 KiB`; rechaza origen externo o exceso > `100 req/min`. |
| **Bitácora WORM** | `backend/src/services/auditService.js` | Encadena `prev_hash` desde `SISAP_LOCAL_GENESIS_ROOT` usando `sha256` y verifica cadena completa en `verifyChain()`. | Triggers SQL (`tr_audit_no_update`, `tr_audit_no_delete`) abortan mutaciones. |
| **Logger Redactor** | `backend/src/utils/logger.js` | Emite JSON por nivel (`info/warn/error/debug`) redactando recursivamente claves de PHI/narrativa (`SENSITIVE_KEYS` → `[REDACTED]`) hasta profundidad 4. | Evita desbordamiento circular con `depth-limit` y omite `debug` cuando `NODE_ENV === 'production'`. |
| **Proceso Electron** | `electron/main.cjs` | `requestSingleInstanceLock`, arranca servidor local embebido, espera `/api/health`, crea `BrowserWindow` con `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. | Cierra base de datos limpiamente al terminar ventana para evitar corrupción del WAL. |
