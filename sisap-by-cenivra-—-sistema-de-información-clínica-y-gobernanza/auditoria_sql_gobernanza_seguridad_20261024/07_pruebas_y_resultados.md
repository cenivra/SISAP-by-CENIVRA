# 07 — Pruebas y Resultados

**Fecha:** 24 de octubre de 2026  
**Fase:** Pruebas técnicas de persistencia, seguridad y gobernanza  
**Estado:** Ejecutado (15 pruebas, 15 pasaron)

---

## 1. Pruebas automatizadas ejecutadas

Todas las pruebas usan **datos sintéticos** (PACIENTE PRUEBA NN). No se usaron expedientes reales ni datos clínicos identificables.

### Pruebas de base de datos (`test/db.test.js`)

| ID | Prueba | Resultado |
|----|--------|-----------|
| T-01 | Inicialización crea base, tablas, schema_migrations | ✅ Pasó |
| T-02 | Migraciones idempotentes (no duplican filas) | ✅ Pasó |
| T-10 (parcial) | Restricción WORM en audit_events (no UPDATE/DELETE) | ✅ Pasó |

### Pruebas de pacientes (`test/patients.test.js`)

| ID | Prueba | Resultado |
|----|--------|-----------|
| T-06 | Creación de paciente + expediente (transacción atómica) | ✅ Pasó |
| T-04 | Búsqueda parametrizada por nombre | ✅ Pasó |
| T-06b | Prevención de duplicados sin confirmación explícita | ✅ Pasó |
| T-08 | Entrada SQL maliciosa es inofensiva | ✅ Pasó |
| - | Búsqueda con término corto (< 2 caracteres) rechazada | ✅ Pasó |
| T-07 | Evaluación vinculada al paciente correcto | ✅ Pasó |
| T-09 | Transacción revertida no deja registro parcial | ✅ Pasó |

### Pruebas de seguridad (`test/security.test.js`)

| ID | Prueba | Resultado |
|----|--------|-----------|
| T-10 | `loopbackOnly` rechaza conexiones no locales | ✅ Pasó |
| - | Rate limiting bloquea tras exceder el límite | ✅ Pasó |
| - | `verifyOrigin` rechaza orígenes no autorizados en POST | ✅ Pasó |
| - | Cadena de auditoría WORM verificable | ✅ Pasó |
| - | Logger redacta claves sensibles (nombre, CURP) | ✅ Pasó |

**Total: 15 pruebas, 15 pasaron, 0 fallaron.**

---

## 2. Verificación de endpoints HTTP (ejecución en tiempo real)

El backend se ejecutó en `127.0.0.1:8080` y se verificaron los siguientes endpoints con PowerShell:

| Endpoint | Método | Resultado |
|----------|--------|-----------|
| `/api/health` | GET | ✅ `{"ok":true,"tables":10,"migrationsApplied":1}` |
| `/api/patients` | POST (crear) | ✅ Paciente TUS-0001 creado con expediente |
| `/api/patients/search?q=PACIENTE` | GET | ✅ 1 resultado retornado |
| `/api/audit/verify` | GET | ✅ `{"valid":true,"total":0}` |

---

## 3. Persistencia entre sesiones (verificada)

| Comportamiento | Resultado |
|----------------|-----------|
| Crear paciente y cerrar aplicación | ✅ Registro persistente en SQLite |
| Reiniciar servicio | ✅ Base recuperada, migraciones aplicadas |
| Buscar mismo paciente tras reinicio | ✅ Mismo `patient_id` recuperado |
| Transacción fallida no deja registro parcial | ✅ ✅ (verificado en T-09) |

---

## 4. Criterios de aceptación verificables

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Base SQL se inicializa automáticamente | ✅ | `init-db.js` crea directorios, base y aplica migraciones |
| Se puede buscar y recuperar expedientes por nombre | ✅ | Endpoint `/api/patients/search` probado |
| Operaciones de persistencia verificadas | ✅ | 15 pruebas automatizadas pasadas |
| Matriz de gobernanza documentada | ✅ | Entregable `04_matriz_gobernanza_datos.md` |
| Controles de ciberseguridad implementados | ✅ | 9 controles en `backend/src/middleware/security.js` |
| Protección de modelos basada en arquitectura real | ✅ | No ofuscación; pesos no en frontend |
| Ambos motores clínicos desactivados | ✅ | `autoencoderInference = null`; Motor A sin ejecución |
| No se ejecutaron inferencias | ✅ | Ninguna inferencia de modelo ejecutada |
| No se modificó configuración de producción | ✅ | Solo se agregó backend de pruebas |

---

## 5. Limitaciones de las pruebas

- Todas las pruebas se ejecutaron en entorno de desarrollo local (localhost).
- No se probaron conexiones de red externa (bloqueadas por diseño).
- No se ejecutaron inferencias de modelo (motores desactivados por restricción).
- Una compilación/prueba satisfactoria **no demuestra validez clínica**.

---

## 6. Archivos de prueba

| Archivo | Contenido |
|---------|-----------|
| `backend/test/helpers.js` | Utilidades (base temporal por test) |
| `backend/test/db.test.js` | Pruebas de base de datos (T-01, T-02, T-10 parcial) |
| `backend/test/patients.test.js` | Pruebas de pacientes (T-04, T-06, T-06b, T-07, T-08, T-09) |
| `backend/test/security.test.js` | Pruebas de seguridad (T-10, rate limit, origin, WORM, logger) |
