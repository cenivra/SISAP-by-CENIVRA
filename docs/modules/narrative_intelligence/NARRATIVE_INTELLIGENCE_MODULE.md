# Diseño Detallado — Motor 3: Inteligencia Narrativa y Conductual

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-MOD-NARR-001` |
| **Título** | Especificación Detallada del Motor de Inteligencia Narrativa y Conductual (IEC 62304 §5.4) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-003` (`REQ-NARR-*`) · `SISAP-LC-004` (`RSK-007`, `RSK-008`, `RSK-009`) · `SISAP-LC-005` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Documentación detallada del módulo `narrativeService.js`, auditoría ONNX y barreras epistemológicas `E1–E5`. | Equipo de Ingeniería SISAP |

---

## 1. Propósito, Unidades y Estado de Inferencia Neuronal

- **Unidad principal:** [`backend/src/services/narrativeService.js`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/src/services/narrativeService.js) + vista [`WeeklyNarrativeView.tsx`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/src/components/views/WeeklyNarrativeView.tsx).
- **Tablas fuente:** `weekly_observations` (`q1..q8` JSON) y `initial_evaluations` (`notas`).
- **Auditoría en tiempo real del artefacto ONNX (`getNarrativeEngineRuntimeStatus()`):**
  - Inspecciona `data/modelo/nlp/bsc-bio-ehr-es/` (`modelo.onnx`, `config.json`, `vocab.json`).
  - Requiere `onnxBytes > 20_000_000` (un RoBERTa de 12 capas completo supera `400 MB`; `1.38 MB` sin `external_data` ni `onnxruntime-node` resulta insuficiente).
  - En el entorno público de `v1.1.0`, retorna honestamente `onnx_artifact.inference_ready: false` y `status: 'active_lexical_deterministic_onnx_unavailable'`, **sin simular inferencia neuronal**.

---

## 2. Algoritmo Léxico Determinista, Privacidad y Restricciones

1. **Normalización textual:** Conversión a minúsculas y descomposición NFD eliminando diacríticos (`normalizeForMatch`).
2. **Métricas por entrada (`analyzeSingleTextEntry`):** `char_count`, `token_count`, `sentence_count`, `type_token_ratio` y suficiencia mínima (`evidence_sufficiency = tokens.length >= 12 ? 'sufficient_for_lexical_extraction' : 'E5_insufficient'`).
3. **Detección de 4 categorías funcionales (`PROCESS_MARKERS`):**
   - `craving_impulso` (`polarity: 'risk_signal'`)
   - `evitacion_experiencial` (`polarity: 'risk_signal'`)
   - `disregulacion_afectiva` (`polarity: 'risk_signal'`)
   - `activacion_conductual_afrontamiento` (`polarity: 'protective_signal'`)
4. **Etiquetado y privacidad:**
   - Toda coincidencia en narrativas semanales se marca como `evidence_level: 'E1_explicit'` y en notas iniciales como `E3_observational`.
   - Todas las salidas mantienen `review_status: 'pending_human_review'` y `diagnostic_inference_allowed: false`.
   - `analyzePatientNarratives` nunca devuelve el texto íntegro ni PHI en eventos de bitácora (`excerpt_anonymized_length` y `logger.js` redactor).

---

## 3. Verificación Asociada
- `MOT-02` (`intelligence_motors.test.js`): comprueba `getNarrativeEngineRuntimeStatus()` vía `/api/engines/status`, la extracción léxica sobre `weekly_observations` y la obligación `pending_human_review`.
- `security.test.js`: verifica que `q1_descripcion..q8_comentarios`, `text_json` y `notas` queden redactados como `[REDACTED]` en `logger.js`.
