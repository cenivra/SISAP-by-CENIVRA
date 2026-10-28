# 01 — Arquitectura de Persistencia

**Fecha:** 24 de octubre de 2026  
**Fase:** Persistencia local de pruebas y gobernanza  
**Estado:** Implementado y probado

---

## 1. Resumen

El proyecto SISAP era una SPA frontend-only (React + TypeScript + Vite) sin backend, con persistencia exclusivamente en `localStorage` del navegador. Esta fase implementó:

- Un **servicio backend local** (Express + `node:sqlite` nativo) que escucha solo en loopback (`127.0.0.1:8080`).
- Una **base de datos SQLite** ubicada en `data/local/sisap_test.sqlite3` (fuera de `src/`, `public/` y `dist/`).
- Una **capa de servicio desacoplada** entre la interfaz y la base de datos, para permitir migración futura a servidor SQL sin reescribir las vistas clínicas.

---

## 2. Arquitectura de capas

```
React SPA (Vite, puerto 3000)
        │ HTTP (localhost:3000 → localhost:8080)
        ▼
┌─────────────────────────────────────────────┐
│ Backend Express + SQLite                    │
│ (solo loopback, puerto 8080)                │
│                                             │
│ Capas:                                      │
│  ├─ Middleware de seguridad (CORS, rate    │
│  │   limiting, origin check, loopback-only) │
│  ├─ Rutas API (/api/health, /api/patients, │
│  │   /api/evaluations, /api/weekly-obs,      │
│  │   /api/model-runs, /api/audit/events)    │
│  └─ Servicios de dominio (pacientes, eval, │
│      narraciones, auditoría)                │
└─────────────────────────────────────────────┘
        │ SQLite (data/local/sisap_test.sqlite3)
        ▼
Base de datos local de pruebas (migraciones versionadas)
```

---

## 3. Principios de diseño

| Principio | Implementación |
|-----------|---------------|
| **Solo loopback** | El backend escucha en `127.0.0.1` y rechaza conexiones de red externa |
| **Consultas parametrizadas** | Todas las consultas SQL usan sentencias preparadas (never concatenación) |
| **Sin exposición de pesos** | La base de datos NO almacena pesos de modelo ni resultados de autoencoder simulados |
| **Cero datos en logs** | El logger redacta claves sensibles (nombre, CURP, narraciones, etc.) |
| **Motor B desactivado** | El autoencoder de escalas permanece sin conectar (`autoencoderInference = null`) |
| **Motor A sin inferencia** | El adaptador de narraciones existe pero no ejecuta inferencia real (sin pesos DCSA) |

---

## 4. Archivos creados/modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `backend/package.json` | Nuevo | Manifiesto del backend (Node >= 22.5) |
| `backend/src/config.js` | Nuevo | Configuración (rutas derivadas, sin absolutos) |
| `backend/src/utils/logger.js` | Nuevo | Logger con redacción de claves sensibles |
| `backend/src/utils/errors.js` | Nuevo | Errores controlados (nunca filtra al cliente) |
| `backend/src/utils/crypto.js` | Nuevo | UUID, SHA-256, normalización de nombres |
| `backend/src/db/index.js` | Nuevo | Conexión SQLite, inicialización automática |
| `backend/src/db/migrations.js` | Nuevo | Motor de migraciones versionadas e idempotentes |
| `backend/src/migrations/001_initial_schema.sql` | Nuevo | Esquema inicial (10 tablas + triggers WORM) |
| `backend/src/services/auditService.js` | Nuevo | Bitácora append-only con cadena de hash |
| `backend/src/services/patientService.js` | Nuevo | Pacientes, búsqueda, creación, duplicados |
| `backend/src/services/evaluationService.js` | Nuevo | Evaluaciones de escalas y observaciones semanales |
| `backend/src/services/modelRunService.js` | Nuevo | Trazabilidad de runs (motores desactivados) |
| `backend/src/middleware/security.js` | Nuevo | CORS, rate limiting, origin check, cuerpo JSON |
| `backend/src/routes/index.js` | Nuevo | Todas las rutas API |
| `backend/src/server.js` | Nuevo | Servidor HTTP local |
| `backend/src/cli/init-db.js` | Nuevo | CLI de inicialización de base |
| `backend/src/cli/health.js` | Nuevo | CLI de comprobación de salud |
| `backend/src/cli/backup.js` | Nuevo | CLI de respaldo controlado |
| `backend/test/helpers.js` | Nuevo | Utilidades de prueba |
| `backend/test/db.test.js` | Nuevo | Pruebas de base de datos |
| `backend/test/patients.test.js` | Nuevo | Pruebas de pacientes |
| `backend/test/security.test.js` | Nuevo | Pruebas de seguridad |
| `.gitignore` | Modificado | Excluye `data/local/`, `backend/data/`, `*.sqlite3` |

---

## 5. Resultados de pruebas automatizadas

| ID | Prueba | Resultado |
|----|--------|-----------|
| T-01 | Inicialización crea base, tablas, schema_migrations | ✅ Pasó |
| T-02 | Migraciones idempotentes (no duplican) | ✅ Pasó |
| T-10 (parcial) | Restricción WORM en audit_events | ✅ Pasó |
| T-06 | Creación de paciente + expediente (transacción) | ✅ Pasó |
| T-04 | Búsqueda parametrizada por nombre | ✅ Pasó |
| T-06b | Prevención de duplicados sin confirmación | ✅ Pasó |
| T-08 | Entrada SQL maliciosa es inofensiva | ✅ Pasó |
| - | Búsqueda con término corto es rechazada | ✅ Pasó |
| T-07 | Evaluación vinculada al paciente correcto | ✅ Pasó |
| T-09 | Transacción revertida no deja registro parcial | ✅ Pasó |
| T-10 | loopbackOnly rechaza conexiones no locales | ✅ Pasó |
| - | Rate limiting bloquea tras exceder límite | ✅ Pasó |
| - | verifyOrigin rechaza orígenes no autorizados | ✅ Pasó |
| - | Cadena de auditoría WORM verificable | ✅ Pasó |
| - | Logger redacta claves sensibles | ✅ Pasó |

**Total: 15 pruebas, 15 pasaron, 0 fallaron.**

---

## 6. Dónde se ejecuta la aplicación

- **Frontend (Vite):** `http://localhost:3000`
- **Backend (SQLite local):** `http://127.0.0.1:8080`
- **Base de datos:** `data/local/sisap_test.sqlite3`

---

## 7. Limitaciones documentadas

- Una base local no garantiza por sí sola cumplimiento normativo completo ni recuperación ante pérdida del equipo.
- El backend es de pruebas locales; para producción se requiere revisión independiente de seguridad.
- Los autoencoders permanecen desactivados; no se ejecutaron inferencias.
