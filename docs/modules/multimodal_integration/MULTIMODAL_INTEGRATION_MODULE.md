# Diseño Detallado — Motor 4: Integración Multimodal con Procedencia

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-MOD-MM-001` |
| **Título** | Especificación Detallada del Motor de Integración Multimodal (IEC 62304 §5.4) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-003` (`REQ-MM-*`) · `SISAP-LC-004` (`RSK-006`) · `SISAP-LC-005` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Documentación detallada del módulo `multimodalService.js` y matriz de procedencia de 5 fuentes. | Equipo de Ingeniería SISAP |

---

## 1. Propósito y Contratos (`buildPatientMultimodalProfile`)

- **Archivo de implementación:** [`backend/src/services/multimodalService.js`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/src/services/multimodalService.js).
- **Función:** Consolida en una vista de procedencia trazable (`modality_provenance_matrix`) las **5 modalidades de información clínica** de un `patient_id` existente (arrojando `HTTP 404` si no existe).

---

## 2. Matriz de Fuentes, Granularidad y Flags de Calidad

| `modality_id` | Tablas Origen | Granularidad | Cálculo de Completitud / Quality Flags | Nivel de Evidencia |
|---|---|---|---|---|
| `sociodemographic_clinical` | `patients`, `clinical_records` | `paciente_fijo_y_episodio` | `1.0` con expediente / `0.5` sin él · `synthetic_test_record` o `verified_capture` | `E1_explicit` |
| `baseline_psychometrics_6_scales` | `initial_evaluations`, `scale_responses`, `scale_scores` | `item_y_subescala` | `capturedInstrumentsCount / 6` · `complete_6_of_6` o `partial_d06_blocked_for_autoencoder` o `E5_insufficient` | `E1_explicit` o `E5_insufficient` |
| `latent_representation_12d` | `model_runs`, `model_outputs` | `vector_latente_12d` | `1.0` si existe ejecución completada / `0.0` si `no_completed_run` | `E4_latent_hypothesis` o `E5_insufficient` |
| `longitudinal_follow_ups` | `follow_up_evaluations` | `sesion_y_fecha` | `1.0` si hay instrumentos longitudinales `>= 2` obs · `longitudinal_series_available` / `awaiting_followup_capture` | `E1_explicit` o `E5_insufficient` |
| `weekly_narratives_behavioral` | `weekly_observations` | `semana_textual` | `1.0` si `>= 1` registro semanal analizado / `0.0` · reporta estado de Motor 3 | `E1_explicit` o `E5_insufficient` |

### Garantías de Integración (`alignment_summary`)
- `temporality_preserved: true`: conserva la fecha/ventana propia de cada fuente sin colapsar eventos de semanas distintas.
- `silent_imputation_used: false`: no rellena modalidades ausentes; ajusta `integration_readiness_ratio = active_modalities / 5`.

---

## 3. Verificación Asociada
- `MOT-02` (`intelligence_motors.test.js`): valida que `modality_provenance_matrix` retorne exactamente las 5 modalidades con su `evidence_level` y conteo de completitud real.
