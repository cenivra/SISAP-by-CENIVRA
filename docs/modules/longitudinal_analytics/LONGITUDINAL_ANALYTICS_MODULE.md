# Diseño Detallado — Motor 2: Analítica Longitudinal e Índice RCI

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-MOD-LONG-001` |
| **Título** | Especificación Detallada del Motor de Inteligencia Analítica Longitudinal (IEC 62304 §5.4) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-003` (`REQ-LONG-*`) · `SISAP-LC-004` (`RSK-002`, `RSK-006`) · `SISAP-LC-005` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Documentación detallada del módulo `analyticalService.js` y tabla `follow_up_evaluations`. | Equipo de Ingeniería SISAP |

---

## 1. Propósito y Alcance de Unidad

- **Archivo de implementación:** [`backend/src/services/analyticalService.js`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/src/services/analyticalService.js) + vista [`FollowUpScalesView.tsx`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/src/components/views/FollowUpScalesView.tsx).
- **Tabla SQLite asociada:** `follow_up_evaluations` (`002_intelligence_engines.sql`) combinada en lectura con línea base (`scale_scores`, `initial_evaluations`) y observaciones semanales (`weekly_observations`).
- **Instrumentos admitidos (`ALLOWED_INSTRUMENTS`):** `BADS`, `GAD-7`, `EROS`, `BSCS`, `PSS-4`, `SHAPS`, `UCLA-3`, `BIS-11`, `STAXI-2`, `BSL-23`.

---

## 2. Contratos, Validaciones y Algoritmo RCI

1. **`createFollowUpEvaluation(input, { actor })` (`POST /api/follow-ups`):**
   - Valida `patient_id` existente, pertenencia a `ALLOWED_INSTRUMENTS`, `total_score` numérico finito, `session_number` entero positivo opcional y arreglo no vacío de `items` sin valores no finitos (compuerta `D-06`).
   - Inserta registro en `follow_up_evaluations` (`schema_version = '1.0.0'`) y registra evento WORM `followup.create`.
2. **`analyzePatientLongitudinalTrajectory(patientId)`:**
   - Combina línea base `T0` (`buildBaselineInstrumentPoints`: `gad_total_bruto`, `eros_total_activo`, `total_bads_invertido`, `bsl_total_integrado`, `total_bruto_30_items`) con seguimientos ordenados cronológicamente por fecha y `session_number`.
   - Calcula `delta_first_to_last` y `delta_previous_to_last`.
   - Calcula el **Índice de Cambio Confiable de Jacobson-Truax** únicamente cuando `observations_count >= 2` y existen parámetros normativos documentados (`NORMATIVE_RCI_PARAMS`):
     $$\text{SE}_{\text{diff}} = \text{SD} \sqrt{2(1 - r_{xx})}, \qquad \text{RCI} = \frac{X_{\text{último}} - X_{\text{inicial}}}{\text{SE}_{\text{diff}}}$$
   - Parámetros normativos codificados:
     - `GAD-7`: `SD = 5.853773711604051` (cohorte TUS $N=166$), `r_xx = 0.83` (Spitzer 2006), `higher_is_worse: true`.
     - `BSL-23`: `SD = 24.56472699502826` (cohorte TUS $N=166$), `r_xx = 0.82` (Bohus 2009), `higher_is_worse: true`.
     - `EROS`: `SD = 6.95`, `r_xx = 0.85` (Barraca & Pérez-Álvarez), `higher_is_worse: false`.
     - `BADS`: `SD = 22.4`, `r_xx = 0.74` (Kanter et al.), `higher_is_worse: false`.
   - Emite alerta (`RELIABLE_CHANGE_POSITIVE` o `RELIABLE_CHANGE_DETERIORATION`, evidencia `E1_explicit`) cuando `|RCI| >= 1.96`.
3. **Estados explícitos de insuficiencia:**
   - `< 2` observaciones: `rci_status = 'INSUFFICIENT_OBSERVATIONS_LT2'`.
   - Sin parámetros normativos (ej. `BSCS`, `PSS-4`): `rci_status = 'NOT_APPLICABLE_MISSING_NORMATIVE_PARAMS'`.

---

## 3. Verificación Asociada
- `MOT-01` (`intelligence_motors.test.js`): verifica creación de `follow_up_evaluations` en migración 002.
- `MOT-02` (`intelligence_motors.test.js`): verifica creación vía `POST /api/follow-ups`, rechazo ante faltantes, cálculo de `RCI` y emisión de alerta con `|RCI| >= 1.96`.
