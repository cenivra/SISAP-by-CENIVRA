# Arquitectura y Estado de Materiales — Centro de Evaluación Psicométrica SISAP

## 1. Propósito y Alcance Clínico

El **Centro de Evaluación Psicométrica** sustituye la captura por secuencia numérica como interfaz clínica principal de SISAP por un entorno digital reactivo por reactivo, con formularios estructurados, progreso en tiempo real, guardado de borradores, revisión pre-cierre, motor de configuración y puntuación psicométrica desacoplado de la interfaz visual, almacenamiento en tres niveles e integración longitudinal con los 5 Motores de Inteligencia de la plataforma.

**Exclusión explícita:** Conforme al alcance clínico y analítico del proyecto, **OCI-R permanece excluido** del catálogo activo de aplicación (`EXCLUDED_INSTRUMENTS = ['OCI-R']`) y es rechazado explícitamente por la API y el motor de puntuación.

---

## 2. Catálogo Activo de Instrumentos y Estado de Materiales Autorizados

La definición única del catálogo reside en [`engines/psychometrics/catalog_v1.json`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/engines/psychometrics/catalog_v1.json) y es compartida por el frontend TypeScript ([`src/psychometrics/instrumentCatalog.ts`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/psychometrics/instrumentCatalog.ts)) y el backend ESM ([`backend/src/psychometrics/instrumentCatalog.js`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/backend/src/psychometrics/instrumentCatalog.js)).

| Instrumento | Reactivos Activos | Versión por Defecto | Versiones Adicionales Soportadas | Fuente Primaria Verificada en Proyecto | Contenido Pendiente o Licencia Declarada |
|---|---:|---|---|---|---|
| **BIS-11** | 30 | `v1.0-patton1995-es` (1–4) | `v1.0-campo-0134` (0, 1, 3, 4) | `shiny_app/R/wizard_ui.r`, `scoring_bis11.r`, Patton et al. (1995), `VERIFICACION_Y_LIMITACIONES.md` | Encabezado introductorio literal editorial no presente en PDF adjunto; se muestra encuadre administrativo neutro sin inventar texto protegido (`instructionsSourceStatus: administrative_framing_verbatim_pending_manual`). |
| **BSL-23** | 23 | `v1.0-soler2013` (0–4) | — (incluye sección complementaria opcional `GENERAL 0–1` + 11 conductuales) | `shiny_app/R/wizard_ui.r`, `scoring_bsl23.r`, Bohus et al. (2009), Soler et al. (2013), `VERIFICACION_Y_LIMITACIONES.md` §2.4 | Los 23 reactivos centrales y opciones (`0=Nada` a `4=Mucho`) están completos. Los 11 reactivos opcionales del suplemento conductual (*Items for Assessing Behavior*) disponen de estructura técnica (`0–4`) y están marcados con `pendingAuthorizedText: true` en espera del texto literal del cuadernillo. |
| **GAD-7** | 7 | `v1.0-garciacampayo2010` (0–3) | — | Spitzer et al. (2006), García-Campayo et al. (2010), `wizard_ui.r`, `scoring_gad7.r` | Completo en instrucciones, reactivos, opciones, puntos de corte (`5/10/15`) y estandarización Z de cohorte. |
| **EROS** | 10 | `v1.0-barraca2010-proyecto9` (1–4) | — (calcula simultáneamente 10 ítems Barraca, 9 ítems bifactorial TUS y suma directa histórica) | `160610ANEXO_Version_Española_de_la_Escala_EROS.pdf`, Anexo IV `Anexos-de-Activacion-Conductual...pdf`, `Validacion EROS/EROS_Resumen_Final_Validacion.csv`, `scoring_eros.r` | Completo en instrucciones literales, 10 reactivos, inversiones `[2, 5, 6, 7, 9]`, baremos de referencia españoles (`M=26.23, DT=6.495`) y factores de validación interna en 9 ítems (sin `EROS7`). |
| **BADS** | 22 | `v22.0-tus-nct07395700` (0–6, excluye `P4, P10, P16`) | `v25.0-barraca2011` (25 reactivos para compatibilidad Autoencoder histórico $N=166$) | `Anexos-de-Activacion-Conductual-para-la-depresion.pdf` (Anexo III pág. 6), `INFORME_REVISION_FACTORIAL_BADS.md`, `MATRIZ_DECISION_SUBESCALAS_BADS.csv` | Completo en instrucciones literales, reactivos y reglas factoriales de la validación en TUS ($N=289$). Se aplica la regla de reportar **Perfil Conductual** (Activación vs. Disfunción/Evitación) sin interpretación clínica unidimensional. |
| **STAXI-2** | 57 | `v57.0-tea49-hybrid` (1–4) | `v49.0-tea2001` (49 reactivos TEA Ediciones completos) | `manual-inventario-staxi-2-tea-edicpdf_compress.pdf` (TEA Ediciones 2001, págs. 18, 83–87) y `shiny_app/R/scoring_staxi2.r` | **Hallazgo crítico resuelto:** `wizard_ui.r` presentaba desorden respecto a la clave oficial de `scoring_staxi2.r`; el catálogo adopta el orden literal y numeración exacta del ejemplar TEA Ediciones (2001) en los reactivos `1..49`. **Pendiente:** la adaptación española oficial TEA Ediciones consta de 49 ítems; las posiciones `50..57` del protocolo estadounidense PAR (1999) se mantienen como estructura técnica marcada con `pendingAuthorizedText: true` sin inventar enunciados. Sujeto a licencia institucional TEA Ediciones / PAR. |

---

## 3. Separación Arquitectónica de Capas de Puntuación

Tanto [`src/psychometrics/scoringEngine.ts`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/psychometrics/scoringEngine.ts) como [`backend/src/psychometrics/scoringEngine.js`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/backend/src/psychometrics/scoringEngine.js) implementan funciones puras guiadas exclusivamente por configuración JSON y devuelven cinco bloques diferenciados:

1. **`rawResponses`**: Respuesta textual seleccionada, código numérico original y marca temporal por `itemId` / `displayNumber` / `canonicalCode`.
2. **`recodedResponses`**: Transformaciones por inversión explícita (`pivot - x`, p. ej. `5 - x` en BIS-11 e EROS), con registro booleano `wasInverted` y fórmula aplicada.
3. **`calculatedScores`**: Puntuación total (cuando es psicométricamente válida), media por reactivo, mapa completo de subescalas, facetas y modos paralelos (`manual_estandar` vs `excel_canonico`).
4. **`derivedIndicators`**: Conteo estricto de valores faltantes (`isValidForScoring`, regla D-06 cero imputación silenciosa), alertas clínicas tempranas en reactivos sensibles (`BSL-23` P5, P7, P18), Z-scores de cohorte, preparación para el vector canónico 24v/22v del Autoencoder y secuencia numérica limpia.
5. **`interpretations`**: Bandas descriptivas normativas con aviso obligatorio de que ninguna puntuación psicométrica constituye un diagnóstico clínico.

---

## 4. Modelo de Almacenamiento en Tres Niveles e Inmutabilidad

La migración [`backend/migrations/003_psychometric_center.sql`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/backend/migrations/003_psychometric_center.sql) y [`StorageService`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/services/storageService.ts) materializan tres entidades relacionales independientes:

1. **`psychometric_evaluations` (Nivel 1)**: `evaluation_id`, `patient_id`, `instrument_id`, `instrument_version`, `language`, `started_at`, `completed_at`, `evaluator`, `application_status` (`draft`, `completed`, `archived`), `capture_mode` (`digital_form`, `numeric_sequence_legacy`), `scoring_mode`, `session_context`, `complements_json`, `notes`.
2. **`psychometric_item_responses` (Nivel 2)**: `response_row_id`, `evaluation_id`, `item_id`, `item_number`, `canonical_code`, `selected_label`, `numeric_code`, `modified_at` (restricción `UNIQUE(evaluation_id, item_id)`).
3. **`psychometric_results` (Nivel 3)**: `result_id`, `evaluation_id`, `total_score`, `technical_total_score`, `mean_score`, `subscales_json`, `recoded_values_json`, `missing_items_json`, `derived_indicators_json`, `interpretation_json`, `numeric_sequence`, `algorithm_version`, `calculated_at`.

### Reglas de Gobernanza de Datos
- **Inmutabilidad tras cierre:** Todo intento de sobrescribir una evaluación en estado `completed` es rechazado con error **HTTP `409 Conflict`**.
- **Recálculo sin pérdida histórica:** La operación `POST /api/psychometrics/evaluations/:evaluationId/recalculate` conserva intactas las filas de `psychometric_item_responses` e inserta una nueva fila fechada en `psychometric_results` con el `algorithm_version` vigente.
- **Control longitudinal entre versiones:** Al comparar evaluaciones sucesivas en el historial de un paciente (p. ej., `BADS v22.0-tus-nct07395700` frente a `BADS v25.0-barraca2011`), `listPatientPsychometricEvaluations` emite explícitamente `versionMismatchWarning: true` indicando los reactivos diferenciales (`P4, P10 y P16`) y evitando comparaciones ingenuas de sumas totales incompatibles.

---

## 5. Equivalencia con Captura Numérica Legada e Integración con Motores 1–5

Los módulos de captura por secuencia numérica (`InitialEvaluationView.tsx` y `FollowUpScalesView.tsx`) permanecen operativos como modo de compatibilidad legada y enlazan directamente al **Centro Psicométrico**.

- La función `verifyCaptureEquivalence()` garantiza paridad matemática bit a bit entre seleccionar opciones en el formulario digital y procesar la secuencia numérica generada.
- Al completar una evaluación digital en `PsychometricCenterView.tsx`, los resultados y la secuencia generada se propagan automáticamente a `follow_up_evaluations`, `InitialEvaluationData` y al indicador de batería del paciente para alimentar los **5 Motores de Inteligencia** sin captura duplicada.

---

## 6. Verificación Automatizada

Suite dedicada en [`backend/test/psychometric_center.test.js`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/backend/test/psychometric_center.test.js):
- `PSYC-01`: Migración 003 (15 tablas verificadas por `healthCheck`), catálogo de 6 instrumentos activos y exclusión/rechazo de `OCI-R`.
- `PSYC-02` a `PSYC-07`: Verificación independiente contra casos sintéticos de referencia para BIS-11 (30), BSL-23 (23), GAD-7 (7), EROS (10 + modelo 9 ítems), BADS-22/25 (22/25) y STAXI-2 (57/49 TEA).
- `PSYC-08`: Bloqueo por faltantes y rechazo de valores fuera de rango.
- `PSYC-09`: Equivalencia exacta captura digital vs. secuencia numérica en los 6 instrumentos activos.
- `PSYC-10` y `PSYC-11`: Guardado en 3 niveles, reanudación de borradores, bloqueo `409 Conflict` ante sobrescritura, recálculo con preservación de respuestas y alerta longitudinal de versiones distintas (`BADS v22` vs `v25`).
