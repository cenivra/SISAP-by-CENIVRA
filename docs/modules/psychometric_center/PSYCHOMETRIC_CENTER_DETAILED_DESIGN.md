# Expediente de Diseño Detallado — Centro de Evaluación Psicométrica Digital

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-MOD-PSYC-001` |
| **Título** | Especificación Técnica y Configuración Versionada del Centro de Evaluación Psicométrica (IEC 62304 §5.4, §8) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Psicometría — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión clínica y psicométrica formal** |
| **Documentos relacionados** | `SISAP-LC-003` (`REQ-PSYC-*`) · `SISAP-LC-004` (`RSK-001`, `RSK-002`, `RSK-006`, `RSK-010`) · [`ARQUITECTURA_Y_MATERIALES_CENTRO_PSICOMETRICO.md`](../../20_psychometric_evaluation_center/ARQUITECTURA_Y_MATERIALES_CENTRO_PSICOMETRICO.md) |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Documentación detallada conforme a Sección 8 IEC 62304 cubriendo los 6 instrumentos activos, exclusión de `OCI-R`, algoritmos de 5 capas, 3 niveles SQLite, equivalencia `PSYC-09` y control de versiones. | Equipo de Ingeniería SISAP |

---

## 1. Arquitectura Desacoplada y Gobernanza de Versión

El módulo separa por completo la **configuración psicométrica**, la **lógica matemática pura** y la **interfaz de usuario**:
1. **Configuración única:** [`engines/psychometrics/catalog_v1.json`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/engines/psychometrics/catalog_v1.json) (`catalogVersion: "1.0.0"`), leída por [`instrumentCatalog.ts`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/src/psychometrics/instrumentCatalog.ts) y [`instrumentCatalog.js`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/src/psychometrics/instrumentCatalog.js).
2. **Motor puro en 5 capas:** [`scoringEngine.ts`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/src/psychometrics/scoringEngine.ts) y [`scoringEngine.js`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/src/psychometrics/scoringEngine.js) generan:
   - `rawResponses` (texto seleccionado + código original por ítem)
   - `recodedResponses` (transformaciones por inversión con fórmula explícita)
   - `calculatedScores` (total, media y subescalas)
   - `derivedIndicators` (`isValidForScoring`, omisiones, alertas de reactivos críticos, Z-scores, secuencia numérica)
   - `interpretations` (bandas descriptivas normativas sin emisión de diagnóstico).
3. **Persistencia en 3 niveles (`003_psychometric_center.sql`) y reglas de inmutabilidad:**
   - Nivel 1 `psychometric_evaluations`: guarda `instrument_id`, `instrument_version`, `application_status` (`draft`, `completed`, `archived`), `capture_mode` (`digital_form`, `numeric_sequence_legacy`), `scoring_mode`.
   - Nivel 2 `psychometric_item_responses`: guarda cada reactivo original con restricción `UNIQUE(evaluation_id, item_id)`.
   - Nivel 3 `psychometric_results`: guarda el resultado calculado etiquetado con `algorithm_version`.
   - **Bloqueo `HTTP 409 Conflict`:** una evaluación cerrada (`completed`) no admite sobrescritura destructiva (`PSYC-10`).
   - **Recálculo versionado:** `POST /api/psychometrics/evaluations/:id/recalculate` inserta una nueva fila en Nivel 3 preservando intacto Nivel 2 (`PSYC-11`).
   - **Alerta longitudinal entre versiones (`versionMismatchWarning`):** detecta automáticamente mezclas como `BADS v22.0-tus-nct07395700` vs `BADS v25.0-barraca2011`, enumerando ítems diferenciales (`P4, P10, P16`).

**Exclusión estricta de `OCI-R`:** Declarada en `excludedInstruments` del catálogo y bloqueada tanto en `instrumentCatalog` como en `routes/index.js` (`HTTP 400`) y restricción `CHECK` en SQLite (`PSYC-01`).

---

## 2. Ficha Técnica Verificada de los 6 Instrumentos Activos

| Instrumento | Versión Defecto / Variantes | N.º Reactivos / Escala | Periodo de Referencia | Fuente Primaria Verificada | Ítems Invertidos / Reglas | Subescalas Calculadas | Omisiones y Textos Pendientes |
|---|---|---|---|---|---|---|---|
| **BIS-11** | `v1.0-patton1995-es`<br>Variante: `v1.0-campo-0134` | `30`<br>Estándar `1–4` (variante `0,1,3,4`) | Forma habitual de comportamiento y pensamiento (sin ventana temporal fija). | `wizard_ui.r`, `scoring_bis11.r`, Patton et al. (1995) | 11 ítems invertidos (`5 - x` en `v1.0-patton1995-es`) | `attention`, `cognitive_instability`, `motor`, `perseverance`, `self_control`, `cognitive_complexity`, `attentional_2nd`, `motor_2nd`, `nonplanning_2nd` | `maxMissingAllowedForTotal: 0` (D-06, `imputationMethod: none`). **Pendiente:** encabezado literal de portada editorial (`administrative_framing_verbatim_pending_manual`). |
| **BSL-23** | `v1.0-soler2013` | `23` nucleares (`0–4`) + complementos (`GENERAL 0–1`, `11` conductuales `0–4`) | Durante la última semana. | `wizard_ui.r`, `scoring_bsl23.r`, Bohus et al. (2009), Soler et al. (2013) | Directo (`0–4`) | `bsl_core_total`, media `bsl_mean`, `bsl_total_integrado` (denominador `136`) | `maxMissingAllowedForTotal: 0` sobre 23 nucleares; alertas conductuales en ítems sensibles (`P5, P7, P18`). **Pendiente:** enunciados literales de los `11` ítems conductuales (`pendingAuthorizedText: true`). |
| **GAD-7** | `v1.0-garciacampayo2010` | `7`<br>Likert `0–3` | Durante las últimas 2 semanas. | Spitzer et al. (2006), García-Campayo et al. (2010), `scoring_gad7.r` | Directo (`0–3`) | `gad_total` + Z-score `(Total - 7.4) / 5.853773711604051` | `maxMissingAllowedForTotal: 0` para cálculo válido (advertencia `<6` sin imputación); cortes normativos `5/10/15`. **Completo.** |
| **EROS** | `v1.0-barraca2010-proyecto9` | `10`<br>Likert `1–4` | Experiencia vital reciente y actual con las actividades cotidianas. | `160610ANEXO_Version_Española_de_la_Escala_EROS.pdf`, `scoring_eros.r`, `EROS_Resumen_Final_Validacion.csv` | `[2, 5, 6, 7, 9]` invertidos (`5 - x`) | `eros_f1_agrado_5`, `eros_f2_disforia_4_inv`, `eros_f2_disforia_4_raw`, `eros_validado_9` (modelo bifactorial TUS sin `EROS7`) | `maxMissingAllowedForTotal: 0`; baremos de referencia españoles (`M=26.23, DT=6.495`). **Completo.** |
| **BADS** | `v22.0-tus-nct07395700`<br>Variante: `v25.0-barraca2011` | `22` (excluye `P4, P10, P16`) · `25` en variante | Durante la pasada semana, incluyendo el día de hoy. | `Anexos-de-Activacion-Conductual-para-la-depresion.pdf` (Anexo III p. 6), `MATRIZ_DECISION_SUBESCALAS_BADS.csv` (`NCT07395700`, $N=289$) | Puntuación directa e invertida según subescala (Activación vs Evitación/Disfunción) | `bads_activation`, `bads_activation_autonomous`, `bads_activation_regulated`, `bads_avoidance`, `bads_work`, `bads_social`, `bads_functional_impairment`, `bads_dysfunction_avoidance_total` | `maxMissingAllowedForTotal: 0` en versión aplicada. Reporta **Perfil Conductual** (no reducción unidimensional simple). **Completo.** |
| **STAXI-2** | `v57.0-tea49-hybrid`<br>Variante: `v49.0-tea2001` | `57` posiciones (`1–49` TEA + `50–57` PAR) · `49` en `v49` | Parte 1: En este momento · Parte 2: Normalmente · Parte 3: Cuando me enfado o enfurezco. | Manual TEA Ediciones (2001, págs. 17–18, 83–87) y `scoring_staxi2.r` | Directo `1–4`; corrección crítica de orden frente a `wizard_ui.r` | `staxi_sentimiento`, `staxi_expresion_fisica`, `staxi_expresion_verbal`, `staxi_state_total`, `staxi_temperamento`, `staxi_reaccion`, `staxi_trait_total`, `staxi_expresion_externa`, `staxi_expresion_interna`, `staxi_control_externo`, `staxi_control_interno`, `staxi_iei` | Regla TEA p. 17 (`teaManualMaxMissingTotal: 9`, escala principal `>2`, subescala `>1`). **Pendiente:** reactivos `50–57` PAR (1999) con `pendingAuthorizedText: true` sin invención de texto. |

---

## 3. Pruebas de Equivalencia con Captura Legada y Validación Automatizada
- **`PSYC-01` (`backend/test/psychometric_center.test.js`):** Valida creación de las 3 tablas en migración 003, carga exacta de 6 instrumentos y rechazo explícito de `OCI-R`.
- **`PSYC-02..07`:** Verifican totales, inversiones y subescalas de los 6 instrumentos frente a vectores de referencia controlados.
- **`PSYC-08`:** Comprueba rechazo sin imputación ante omisiones o valores fuera de rango.
- **`PSYC-09`:** Demuestra **equivalencia matemática bit a bit (`verifyCaptureEquivalence`)** entre respuestas del formulario digital y el adaptador de secuencia numérica heredado en los 6 instrumentos.
- **`PSYC-10` y `PSYC-11`:** Demuestran guardado de borradores, bloqueo `HTTP 409 Conflict` al cerrar, recálculo no destructivo sobre Nivel 3 y alerta `versionMismatchWarning` entre `BADS v22` y `BADS v25`.
