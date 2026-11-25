# Informe de Pruebas de Nuevas Funcionalidades — SISAP v1.1.0 (Entorno B)

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-VV-NEW-110` |
| **Título** | Verificación Funcional de Nuevos Motores, Autoencoder y Centro Psicométrico (Sección 7) |
| **Versión evaluada** | `v1.1.0` candidata en `release/1.1.0` |
| **Estado** | **En revisión** |
| **Fecha de ejecución / registro** | 2026-11-23 |
| **Responsable** | Equipo de Verificación y Calidad — SISAP by CENIVRA |
| **Documentos relacionados** | `SISAP-LC-003` · `SISAP-LC-008` · `SISAP-MOD-AE-001` · `SISAP-MOD-PSYC-001` · `SISAP-VV-CMP-001` |

---

## 1. Autoencoder Funcional TUS (Motor 1)

| Aspecto Evaluado (Sección 7) | Procedimiento / Endpoint Verificado | Resultado Obtenido | Requisitos / Estado |
|---|---|---|---|
| **Carga de modelo, pesos y SHA-256** | `GET /api/engines/autoencoder/reference` + `AE-01` | `integrity.verified: true`, **`verified_artifacts_count: 8`**, cohorte referencia `N=166`, modelo por defecto `encoder_22_checkpoint_fase2`. | `REQ-AE-001` · **Aprobado** |
| **Compatibilidad de entradas, preprocesamiento e inferencia `22v` y `24v`** | `POST /api/engines/autoencoder/infer` (`encoder_22_checkpoint_fase2` y `encoder_24_deployed`) + `AE-02` | `HTTP 200`, `latent_vector.length = 12` finitos, `MSE_z (22v) = 0.048350`, `MSE_z (24v) = 0.055446` en caso sintético en vivo; paridad R ↔ JS = `0.0000e+0`. | `REQ-AE-002` · **Aprobado** |
| **Separación `EROS` vs `tiempo_consumo`** | Comparación `EROS=[1..1]` vs `EROS=[4..4]` vía HTTP + `AE-04` | Vectores latentes `12D` exactamente iguales al variar solo `EROS`, confirmando aislamiento respecto a `tiempo_consumoEROS`. | `REQ-AE-004` · **Aprobado** |
| **Manejo de datos inválidos / faltantes (`D-06`) y registro de errores** | `POST /api/engines/autoencoder/infer` con `null` en `GAD-7` + `AE-03`, `AE-06` | **`HTTP 422` (`status: 'failed'`)**, cero imputación silenciosa y trazabilidad registrada sin salidas válidas en `model_outputs`. | `REQ-AE-003`, `REQ-AE-007` · **Aprobado** |
| **Versionado y prototipo confirmatorio `17→12`** | `POST /api/engines/autoencoder/candidate17/infer` + `AE-05` | Vector completo `17` variables → **`HTTP 200`** (`ACCEPTED`); vector incompleto (`1` variable) → **`HTTP 422`** (`REJECTED`). Declarado experimental sin validación clínica externa. | `REQ-AE-006`, `REQ-AE-008` · **Aprobado** |
| **Reproducibilidad científica en R (`Rscript`)** | `test_esquema_datos.R`, `test_scoring_escalas.R`, `test_preprocesamiento.R`, `test_dimensiones_latentes.R`, `test_regresion_original.R` | `4/4` suites unitarias `PASS` en entorno limpio; `test_regresion_original.R` omite de forma controlada sin libro Excel confidencial (`[INFO] Defina SISAP_EXCEL_CANONICO...`), verificado previamente en auditoría Drive (`1.554e-14`, `1.788e-7`). | `REQ-INT-001` · **Aprobado** *(omisión controlada PHI documentada)* |

---

## 2. Centro de Evaluación Psicométrica Digital

| Aspecto Evaluado (Sección 7) | Procedimiento Verificado | Resultado Obtenido | Requisitos / Estado |
|---|---|---|---|
| **Selección de instrumento y exclusión de `OCI-R`** | `GET /api/psychometrics/catalog` + `POST /api/psychometrics/score` (`OCI-R`) + `PSYC-01` | Lista exactamente 6 instrumentos (`BIS-11`, `BSL-23`, `GAD-7`, `EROS`, `BADS`, `STAXI-2`); `OCI-R` listado en `excludedInstruments` y rechazado con **`HTTP 400`**. | `REQ-PSYC-001` · **Aprobado** |
| **Presentación de reactivos, opciones, puntuación, inversiones y subescalas** | `POST /api/psychometrics/score` en vivo + `PSYC-02..07` + compilación `PsychometricCenterView.tsx` | Medido en vivo: `BIS-11` (`30` ítems, `total=79`, `9` subescalas, **`11` invertidos**), `BSL-23` (`23` ítems, `total=46`, `1` subescala), `GAD-7` (`7` ítems, `total=14`, `1` subescala), `EROS` (`10` ítems, `total=25`, `4` subescalas, **`5` invertidos**), `BADS-22` (`22` ítems, perfil `8` subescalas sin total unidimensional `null`), `STAXI-2` (`49` ítems TEA autorizados + `8` PAR `pendingAuthorizedText: true`, `12` subescalas). | `REQ-PSYC-002..004` · **Aprobado** *(usabilidad de campo y textos PAR `50..57` pendientes declarados)* |
| **Validación de respuestas faltantes** | `POST /api/psychometrics/score` con 1/10 respuestas `EROS` + `PSYC-08` | `derivedIndicators.completeness.isValidForScoring === false`; sin imputación silenciosa. | `REQ-PSYC-005` · **Aprobado** |
| **Guardado en 3 niveles, borradores, bloqueo `409` y recálculo versionado** | Ciclo completo `/api/psychometrics/evaluations` + `recalculate` + `PSYC-10` | Borrador parcial → `HTTP 200`; cierre `completed` → `HTTP 201`; intento de sobrescritura → **`HTTP 409 Conflict`**; `recalculate` → **`HTTP 200`** preservando respuestas e incrementando historial a `resultsHistory.length = 2`. | `REQ-PSYC-007..009` · **Aprobado** |
| **Versiones longitudinales y compatibilidad histórica** | Registro consecutivo `BADS v22.0-tus-nct07395700` + `BADS v25.0-barraca2011` (`GET /api/patients/:id/psychometrics`) + `PSYC-09` | Emite automáticamente **`versionMismatchWarning: true`** señalando ítems diferenciales (`P4, P10, P16`); equivalencia digital ↔ secuencia numérica legada bit a bit verificada (`maxSubscaleDiff = 0`). | `REQ-PSYC-006`, `REQ-PSYC-010` · **Aprobado** |

---

## 3. Otros Motores Implementados (Motores 2, 3, 4 y 5)

| Motor | Estado Funcional | Verificación Ejecutada (`comparison_benchmark_results.json` + `MOT-01/02`) | Distinción Madurez |
|---|---|---|---|
| **Motor 2 — Analítica Longitudinal (`analyticalService.js`)** | **Completo (RCI + Deltas)** | `POST /api/follow-ups` (`HTTP 201`), combinación automática con línea base `T0` (`GAD-7 = 14 → 4`), cálculo **`rci_status: 'COMPUTED_JACOBSON_TRUAX'`** con **`RCI = -2.9297`**. | Desarrollado y verificado |
| **Motor 3 — Inteligencia Narrativa (`narrativeService.js`)** | **Parcial declarado (Léxico activo / ONNX ausente)** | `GET /api/engines/status` reporta honestamente `inference_ready: false` (`active_lexical_deterministic_onnx_unavailable`); extracción léxica sobre `weekly_observations` procesa `1` semana (`E1_explicit`). | Analizador léxico completo; componente neuronal ONNX pendiente |
| **Motor 4 — Integración Multimodal (`multimodalService.js`)** | **Completo** | `GET /api/patients/:id/intelligence` construye matriz alineada con **`5` fuentes y `5` modalidades activas**, preservando procedencia, temporalidad y sin imputación oculta. | Desarrollado y verificado |
| **Motor 5 — Apoyo a Decisiones `E1–E5` (`decisionSupportService.js`)** | **Completo con barrera humana obligatoria** | `automatic_diagnosis_disabled: true`, `POST /api/patients/:id/formulations` retorna `HTTP 201` con **`review_status: 'pending_human_review'`**. | Desarrollado y verificado como apoyo supervisado (no diagnóstico autónomo) |
