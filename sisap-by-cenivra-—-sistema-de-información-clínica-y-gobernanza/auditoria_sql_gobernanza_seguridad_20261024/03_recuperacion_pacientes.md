# 03 — Recuperación de Pacientes

**Fecha:** 24 de octubre de 2026  
**Fase:** Búsqueda y recuperación de expedientes  
**Estado:** Implementado y probado

---

## 1. Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Comprobación de salud (base y migraciones) |
| GET | `/api/migrations/status` | Estado de migraciones aplicadas |
| GET | `/api/patients/search?q=<texto>` | Búsqueda de pacientes por nombre o CURP |
| GET | `/api/patients/duplicates?nombre_completo=<>&curp=<>` | Detección de posibles duplicados |
| GET | `/api/patients/:patientId/record` | Recuperación del expediente completo |
| POST | `/api/patients` | Creación de paciente + expediente (transacción) |
| POST | `/api/evaluations` | Registro de evaluación inicial (Motor B preparado) |
| POST | `/api/weekly-observations` | Registro de observación semanal (Motor A preparado) |
| POST | `/api/model-runs` | Trazabilidad de intento de ejecución (motores DESACTIVADOS) |
| GET | `/api/model-runs` | Listado de runs con estado |
| GET | `/api/audit/events` | Eventos de auditoría (bitácora WORM) |
| GET | `/api/audit/verify` | Verificación de integridad de cadena de hash |

---

## 2. Flujo de búsqueda y recuperación

### 2.1 Búsqueda por nombre o CURP

1. El usuario introduce el nombre o una parte del nombre (o CURP completa).
2. El frontend llama a `GET /api/patients/search?q=<parte>` con el encabezado `Origin: http://localhost:3000`.
3. El backend aplica validación de seguridad:
   - **Búsqueda parametrizada** (sentencias preparadas, nunca concatenación SQL).
   - **Límite de resultados** (`LIMIT 10`) para evitar enumeración total.
   - **Término mínimo** de 2 caracteres para evitar búsquedas triviales.
   - Normalización de nombres (sin acentos, minúsculas) **solo para el índice de búsqueda**; el nombre almacenado no se altera.
4. El backend devuelve una lista limitada de coincidencias con información mínima: `patient_id`, `pseudonym`, `nombre_completo`, `estado`, `actualizado_en`, `es_dato_prueba`.

### 2.2 Selección del paciente

- **No hay selección automática** del primer resultado, incluso cuando hay una sola coincidencia.
- Si hay nombres iguales o similares, se muestran todos para que el usuario seleccione manualmente.
- Si no hay coincidencias, el frontend muestra un estado vacío.

### 2.3 Recuperación del expediente

Tras seleccionar un paciente (por su `patient_id` interno estable), el frontend llama a `GET /api/patients/:patientId/record`, que devuelve:

| Campo | Contenido |
|-------|-----------|
| `patient` | Datos del paciente (pseudónimo, nombre, estado, etc.) |
| `record` | Expediente clínico (ingreso, droga_impacto, diagnóstico, etc.) |
| `evaluations` | Evaluaciones iniciales de escalas (últimas 100) |
| `observations` | Observaciones semanales (últimas 200) |
| `model_runs` | Intentos de ejecución de modelo (últimos 100, estado `failed` mientras motores desactivados) |

### 2.4 Manejo de fallos

| Situación | Comportamiento |
|-----------|---------------|
| Servicio/base caídas | Error controlado al cliente (`INTERNAL_ERROR`), sin crear paciente duplicado |
| Paciente no encontrado | `404 NOT_FOUND` con mensaje genérico |
| Entrada SQL maliciosa | Rechazada por sentencias preparadas; error `BAD_REQUEST` |
| Término de búsqueda corto | Rechazado con mensaje de al menos 2 caracteres |

---

## 3. Pruebas ejecutadas

| ID | Prueba | Resultado |
|----|--------|-----------|
| T-04 | Búsqueda parametrizada por nombre | ✅ Pasó |
| T-06b | Prevención de duplicados sin confirmación | ✅ Pasó |
| T-08 | Entrada SQL maliciosa es inofensiva | ✅ Pasó |
| - | Búsqueda con término corto rechazada | ✅ Pasó |
| T-07 | Evaluación vinculada al paciente correcto | ✅ Pasó |

---

## 4. Seguridad de la búsqueda

| Control | Implementación |
|---------|---------------|
| Consulta parametrizada | `db.prepare("SELECT ... WHERE nombre_normalizado LIKE ?").all(...)` |
| Sin concatenación SQL | Prohibido estrictamente en todas las rutas |
| Sin enumeración total | `LIMIT 10` en búsquedas; no existe endpoint `GET /patients` sin filtro |
| Identificador interno estable | `patient_id` (UUID) como clave relacional; `pseudonym` como identificador clínico visible |
| Detección de duplicados | Endpoint `/api/patients/duplicates` verifica nombre normalizado + CURP antes de crear |

---

## 5. Ejemplo de respuesta (búsqueda)

```json
{
  "results": [
    {
      "patient_id": "70d267a7-252a-405b-8695-babc1c9f07aa",
      "pseudonym": "TUS-0001",
      "nombre_completo": "PACIENTE PRUEBA UNO",
      "estado": "Residencial",
      "actualizado_en": "2026-10-25T05:43:16.918Z",
      "es_dato_prueba": 1
    }
  ],
  "count": 1
}
```
