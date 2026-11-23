# Changelog — SISAP by CENIVRA

Todos los cambios notables de este proyecto se documentan en este archivo siguiendo el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Semantic Versioning 2.0.0](https://semver.org/).

> [!NOTE]
> El release histórico [`v1.0.0`](https://github.com/cenivra/SISAP-by-CENIVRA/releases/tag/v1.0.0) (commit `ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f`) se conserva íntegro sin modificaciones. La versión `1.1.0` se prepara en la rama independiente `release/1.1.0`.

---

## [1.1.0] - 2026-11-23 *(En preparación — rama `release/1.1.0`, pendiente de publicación)*

### Decisión de Versionado Semántico (`v1.1.0` vs `v2.0.0`)
Se recomienda **`v1.1.0` (MINOR)** porque todas las capacidades incorporadas amplían la plataforma de forma **retrocompatible** con `v1.0.0`:
- Las migraciones SQLite [`002_intelligence_engines.sql`](sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/backend/migrations/002_intelligence_engines.sql) y [`003_psychometric_center.sql`](sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/backend/migrations/003_psychometric_center.sql) son estrictamente aditivas (`CREATE TABLE IF NOT EXISTS`) y no destruyen ni alteran las 10 tablas de `001_initial_schema.sql`.
- Los endpoints REST, esquemas y flujos de evaluación/seguimiento de `v1.0.0` continúan activos.
- La captura por secuencia numérica legada se conserva como modo de compatibilidad verificada (`numeric_sequence_legacy`) con equivalencia matemática comprobada frente a los nuevos formularios digitales.
- Se reservaría un salto **MAJOR (`v2.0.0`)** para el momento en que se retire la captura numérica legada, se modifiquen de forma incompatible contratos API/BD de `v1.0.0` o se sustituya el esquema de identidad local.

### Added (Novedades)
- **Motor 1 — Integración Verificada del Autoencoder TUS (`engines/autoencoder/`)**:
  - Artefactos verificados mediante hashes SHA-256 (`model_registry.json`): modelos `encoder_22_checkpoint_fase2`, `encoder_24_deployed` y prototipo confirmatorio `ae_tus_17to12_m3k12`.
  - Pipeline determinista de 5 capas en JavaScript ESM (`autoencoderInferenceEngine.js`, `latentSpaceAnalyzer.js`) y R (`engines/autoencoder/inference/R/01..07`) con paridad numérica exacta y verificación de compuerta D-06 (cero imputación silenciosa).
  - Endpoints `/api/engines/autoencoder/reference`, `/api/engines/autoencoder/infer` y `/api/engines/autoencoder/candidate17/infer` con trazabilidad en `model_runs` y `model_outputs`.
- **Arquitectura de Ecosistema de Inteligencia de 5 Motores**:
  - **Motor 2 (`analyticalService.js`)**: Seguimiento longitudinal con cálculo de deltas y Reliable Change Index (RCI) sobre `follow_up_evaluations`.
  - **Motor 3 (`narrativeService.js`)**: Análisis textual y verificación de estado del runtime ONNX con degradación elegante controlada cuando no hay runtime nativo.
  - **Motor 4 (`multimodalService.js`)**: Alineación multimodal de los 5 dominios del expediente con trazabilidad.
  - **Motor 5 (`decisionSupportService.js`)**: Síntesis estructurada con niveles de evidencia `E1–E5` y revisión humana obligatoria en `clinical_formulations` (prohibido el diagnóstico automático).
  - Vistas y visualizaciones analíticas: `IntelligenceEcosystemView.tsx`, `LatentIntervalChart.tsx` y `ReconstructionBarsChart.tsx`.
- **Centro de Evaluación Psicométrica y Captura Digital de Instrumentos**:
  - Catálogo de configuración versionado independiente de UI ([`catalog_v1.json`](sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/engines/psychometrics/catalog_v1.json), `instrumentCatalog.ts` / `.js`) para **6 instrumentos activos**:
    - `BIS-11` (30 reactivos, inversiones `5 - x` en 11 ítems).
    - `BSL-23` (23 reactivos centrales + complemento opcional `GENERAL 0–1` y suplemento conductual).
    - `GAD-7` (7 reactivos, severidad y Z-score).
    - `EROS` (10 reactivos Barraca & Pérez-Álvarez + modelo bifactorial interno de 9 ítems sin `EROS7`).
    - `BADS` (22 reactivos validados `v22.0-tus-nct07395700` excluyendo `P4, P10, P16` con Perfil Conductual multidimensional + variante de compatibilidad `v25.0-barraca2011`).
    - `STAXI-2` (estructura híbrida de 57 reactivos con los 49 reactivos literales TEA Ediciones 2001 y 8 posiciones extendidas `50–57` preparadas para texto autorizado PAR).
  - Exclusión explícita de `OCI-R` del catálogo aplicable.
  - Motor de puntuación automática (`scoringEngine.ts` / `.js`) con separación estricta en 5 capas (`rawResponses`, `recodedResponses`, `calculatedScores`, `derivedIndicators`, `interpretations`) y adaptador de equivalencia frente a secuencias numéricas legadas.
  - Almacenamiento en 3 niveles (`003_psychometric_center.sql`: `psychometric_evaluations`, `psychometric_item_responses`, `psychometric_results`) con bloqueo `HTTP 409 Conflict` contra sobrescritura de evaluaciones completadas, recálculo no destructivo por versión de algoritmo y detección automática de mezcla de versiones longitudinales (`versionMismatchWarning`).
  - Interfaz clínica [`PsychometricCenterView.tsx`](sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/components/views/PsychometricCenterView.tsx) adaptable a escritorio y tableta (borradores, progreso, filtro de pendientes, navegación por bloques o página única, revisión pre-envío e historial longitudinal).
- **Documentación y Pruebas**:
  - `docs/19_autoencoder_verification_and_intelligence_platform/` (entregables A–F).
  - `docs/20_psychometric_evaluation_center/ARQUITECTURA_Y_MATERIALES_CENTRO_PSICOMETRICO.md`.
  - `docs/11_release_and_maintenance/RELEASE_NOTES_v1.1.0.md`.
  - Nuevas suites `autoencoder_engine.test.js`, `intelligence_motors.test.js` y `psychometric_center.test.js` (`33/33` pruebas Node + `5` scripts R).

### Changed (Cambios)
- Reemplazo del modo demostración `DCT-II` en el flujo principal por el motor verificado del Autoencoder TUS en `engines/autoencoder/`, manteniendo intacta la separación entre simulador demostrativo e inferencia verificada.
- Promoción de la captura digital por reactivos (`Centro Psicométrico`) como vía principal de captura clínica, conservando `InitialEvaluationView.tsx` y `FollowUpScalesView.tsx` como modo de compatibilidad legada enlazado.
- Inclusión de `engines/**/*` en `package.json` (`build.files`) para empaquetado Electron y excepciones acotadas en `.gitignore` exclusivamente para archivos técnicos de `engines/autoencoder/` libres de PHI.

### Fixed (Correcciones)
- Corrección de orden e indexación de reactivos `1..49` de `STAXI-2` respecto al ejemplar oficial español de TEA Ediciones (2001) y `scoring_staxi2.r` (resolviendo discrepancia detectada en `wizard_ui.r`).
- Separación semántica estricta de `EROS` frente a `tiempo_consumo` / `tiempo_consumoEROS` en evaluación inicial e inferencia Autoencoder (`AE-04`).
- Eliminación de denominadores heredados incorrectos en `BSL-23 Total Integrado` (cota real `136 = 34 × 4`).

### Known Limitations / Pending Authorized Content
- **`STAXI-2` reactivos `50..57`**: La adaptación española oficial TEA Ediciones (2001) disponible en el proyecto comprende los reactivos `1..49`; los 8 reactivos adicionales (`50..57`) de la forma estadounidense PAR (1999) permanecen marcados con `pendingAuthorizedText: true` sin inventar enunciados.
- **`BSL-23` suplemento conductual (11 ítems)** y **encabezado literal de portada `BIS-11`**: Estructura técnica habilitada; textos literales de portada/ítems conductuales marcados como pendientes de documento fuente.
- **Motor 3 ONNX Runtime**: La inferencia neuronal local de embeddings narrativos opera en degradación elegante declarada (`inference_ready: false`) cuando no existe modelo ONNX ni binario nativo `onnxruntime-node` en el entorno público.
- **Firma digital Windows (Authenticode)**: Pendiente de certificado comercial de firma de código.

---

## [1.0.0] - 2026-10-27

- **Commit original**: `ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f` (`tag: v1.0.0`).
- **Release histórico**: [`v1.0.0`](https://github.com/cenivra/SISAP-by-CENIVRA/releases/tag/v1.0.0) — Distribución pública inicial de aplicación de escritorio Windows (Electron v45 + React 19 + Node.js SQLite WAL + auditoría WORM + simulador sintético Autoencoder). Conservada íntegramente sin alteraciones.
