# 02 — Esquema SQL y Migraciones

**Fecha:** 24 de octubre de 2026  
**Fase:** Modelo de datos y migraciones  
**Estado:** Implementado y probado

---

## 1. Base de datos

| Aspecto | Valor |
|---------|-------|
| Motor | SQLite (módulo nativo `node:sqlite`, Node >= 22.5) |
| Ubicación | `data/local/sisap_test.sqlite3` |
| Fichero excluido de Git | Sí (`.gitignore` actualizado) |
| Ubicación excluida de publicación | Sí (fuera de `src/`, `public/`, `dist/`) |

---

## 2. Migración `001_initial_schema.sql`

Archivo: `backend/migrations/001_initial_schema.sql`

La migración es **idempotente**: ejecutarla dos veces no duplica tablas ni filas. Registra cada versión en `schema_migrations` con su checksum SHA-256.

### Tablas creadas (10)

| Tabla | Propósito | Columnas clave |
|-------|-----------|----------------|
| `schema_migrations` | Historial de migraciones aplicadas | version, name, checksum, applied_at |
| `patients` | Identidad: seudónimo, nombre (búsqueda), estado, marcas de tiempo | patient_id (UUID), pseudonym (UNIQUE), nombre_completo, curp, estado |
| `clinical_records` | Expediente clínico (1:1 con patients) | record_id, patient_id (FK), ingreso, droga_impacto, diagnostico_cie |
| `initial_evaluations` | Evaluaciones iniciales de escalas (Motor B preparado) | evaluation_id, patient_id (FK), scoring_version, schema_version, vector24_json |
| `scale_responses` | Respuestas crudas por instrumento | response_id, evaluation_id (FK), instrument, items_json |
| `scale_scores` | Puntuaciones calculadas con procedencia | score_id, evaluation_id (FK), instrument, subscale, value, rules_version |
| `weekly_observations` | Observaciones semanales (Motor A preparado) | observation_id, patient_id (FK), week_number, text_json, analysis_state |
| `model_runs` | Trazabilidad de intentos de inferencia (motores DESACTIVADOS) | run_id, engine, state, model_version, input_hash |
| `model_outputs` | Salidas de inferencia (vacía mientras motores desactivados) | output_id, run_id (FK), head_name, values_json, is_valid |
| `audit_events` | Bitácora APPEND-ONLY (WORM) | event_id, occurred_at, action, subject_pseudonym, hash, prev_hash |

### Restricciones de integridad

- `FOREIGN KEY` activado (`PRAGMA foreign_keys = ON`).
- Todas las claves foráneas usan `ON DELETE RESTRICT` o `ON DELETE CASCADE` según corresponda.
- `CHECK` en valores enumerados (`estado`, `instrument`, `sexo`, `analysis_state`, `engine`, `state`).
- `UNIQUE` en `patients.pseudonym`.
- `NOT NULL` en campos obligatorios.

### Triggers WORM (audit_events)

```sql
CREATE TRIGGER IF NOT EXISTS tr_audit_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'VIOLACION DE GOBERNANZA: audit_events es append-only (WORM).');
END;

CREATE TRIGGER IF NOT EXISTS tr_audit_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'VIOLACION DE GOBERNANZA: audit_events es append-only (WORM).');
END;
```

Estos triggers impiden cualquier modificación o borrado de eventos de auditoría, preservando la integridad histórica.

---

## 3. Índices

| Índice | Tabla | Propósito |
|--------|-------|-----------|
| `idx_patients_nombre_norm` | patients | Búsqueda rápida por nombre normalizado |
| `idx_patients_curp` | patients | Búsqueda por CURP |
| `idx_eval_patient` | initial_evaluations | Consultar evaluaciones por paciente |
| `idx_scaleresp_eval` | scale_responses | Respuestas por evaluación |
| `idx_scores_eval` | scale_scores | Puntuaciones por evaluación |
| `idx_weekly_patient` | weekly_observations | Observaciones por paciente |
| `idx_runs_engine_state` | model_runs | Runs por motor y estado |
| `idx_outputs_run` | model_outputs | Salidas por run |
| `idx_audit_occurred` | audit_events | Eventos por tiempo |

---

## 4. Migraciones pendientes (futuras)

| Versión | Nombre propuesto | Propósito |
|---------|------------------|-----------|
| 002 | usuarios_autenticacion | Tabla de usuarios con claves PBKDF2 (migrar de sqlScripts.ts) |
| 003 | consentimientos_arco | Tablas de consentimiento LFPDPPP y derechos ARCO |
| 004 | vault_tokens | Tokens temporales de des-seudonimización con TTL |

---

## 5. Pruebas ejecutadas (relacionadas con esquema)

| ID | Prueba | Resultado |
|----|--------|-----------|
| T-01 | Inicialización crea base, tablas, schema_migrations | ✅ Pasó |
| T-02 | Migraciones idempotentes | ✅ Pasó |
| T-10 (parcial) | Restricción WORM impide UPDATE/DELETE en audit_events | ✅ Pasó |

---

## 6. Comandos de utilidad

```bash
# Inicializar base (idempotente)
node src/cli/init-db.js

# Comprobación de salud
node src/cli/health.js

# Respaldo controlado (no sobrescribe destino existente)
node src/cli/backup.js [destino]
```

---

## 7. Seguridad del esquema

- **No almacena pesos de modelo** en ninguna tabla.
- **No almacena resultados de autoencoder simulados** (motores desactivados).
- **Las tablas `model_runs` y `model_outputs` existen solo para trazabilidad futura** de inferencias, no para ejecutar motor alguno.
- **Los datos clínicos se separan de la identidad**: `patients.pseudonym` viaja con el expediente; `patients.nombre_completo` y `curp` viven solo en `patients`.
