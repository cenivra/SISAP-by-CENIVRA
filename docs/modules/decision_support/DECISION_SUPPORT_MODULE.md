# Diseño Detallado — Motor 5: Apoyo a Decisiones Clínicas (`E1–E5`)

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-MOD-DSS-001` |
| **Título** | Especificación Detallada del Motor de Apoyo a Decisiones y Síntesis Trazable (IEC 62304 §5.4) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Clínica — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión clínica y regulatoria formal** |
| **Documentos relacionados** | `SISAP-LC-001` · `SISAP-LC-003` (`REQ-DSS-*`) · `SISAP-LC-004` (`RSK-009`) · `SISAP-LC-005` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Documentación detallada de `decisionSupportService.js`, clasificación `E1–E5` y tabla `clinical_formulations`. | Equipo de Ingeniería SISAP |

---

## 1. Propósito, Unidades y Guardrails Epistemológicos

- **Unidad backend:** [`backend/src/services/decisionSupportService.js`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/src/services/decisionSupportService.js) + vista [`IntelligenceEcosystemView.tsx`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/src/components/views/IntelligenceEcosystemView.tsx).
- **Tabla SQLite:** `clinical_formulations` (`002_intelligence_engines.sql`).
- **Restricciones obligatorias (`governance_constraints`):**
  - `automatic_diagnosis_disabled: true`
  - `therapeutic_prescription_disabled: true`
  - `mandatory_human_review_status: 'pending_human_review'`
  - `mod_03_opaque_latent_labels: true`

---

## 2. Contratos, Generación de Hallazgos y Taxonomía `E1–E5`

1. **`getPatientDecisionSupportReport(patientId)` (`GET /api/patients/:id/intelligence`):**
   - Invoca `buildPatientMultimodalProfile(patientId)` (Motor 4) y `loadReferencePercentiles12d` / `analyzeLatentProfile` (Motor 1).
   - Construye hallazgos trazables (`buildEvidenceDrivenFindings`):
     - Geometría `12D` (distancia L2 a mediana `p50` de $N=166$ y número de dimensiones fuera de `[p05, p95]`) y error de reconstrucción (`MSE_z`, `RMSE_z`, variable con mayor residuo) clasificados como `E4_latent_hypothesis`, aclarando explícitamente que miden ajuste al manifold entrenado y **no gravedad diagnóstica**.
     - Si falta corrida latente: emite `latent_missing` (`E5_insufficient`) indicando requisito `D-06`.
     - Agrega alertas longitudinales `|RCI| >= 1.96` del Motor 2 (`E1_explicit`).
     - Agrega conteo de coincidencias léxicas exploratorias del Motor 3 (`E1_explicit`), indicando explícitamente que el modelo neuronal ONNX está inactivo.
   - Recupera las últimas 20 formulaciones registradas en `clinical_formulations` para ese paciente.
2. **`createClinicalFormulation(patientId, input, { actor })` (`POST /api/patients/:id/formulations`):**
   - Valida `summary_text` (`>= 10` caracteres), `evidence_level` en `['E1_explicit','E2_contextual','E3_observational','E4_latent_hypothesis','E5_insufficient']` y `review_status` en `['pending_human_review','reviewed_approved','reviewed_modified','rejected']` (por defecto `'pending_human_review'`).
   - Persiste procedencia (`domains_json`, `provenance_json`, vínculo opcional a `model_run_id`) y registra evento WORM `formulation.create`.

---

## 3. Verificación Asociada
- `MOT-02` (`intelligence_motors.test.js`): comprueba el flujo completo vía `GET /api/patients/:id/intelligence` y `POST /api/patients/:id/formulations`, verificando `governance_constraints` y almacenamiento con estado `pending_human_review`.
