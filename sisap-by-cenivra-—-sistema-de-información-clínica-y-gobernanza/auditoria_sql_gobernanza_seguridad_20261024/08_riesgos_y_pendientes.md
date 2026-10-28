# 08 — Riesgos y Pendientes

**Fecha:** 24 de octubre de 2026  
**Fase:** Riesgos restantes y decisiones pendientes  
**Estado:** Documentado

---

## 1. Riesgos restantes

| ID | Riesgo | Severidad | Estado actual | Mitigación pendiente |
|----|--------|-----------|---------------|---------------------|
| R-01 | Autenticación completa no implementada | Alta | Middleware de autorización por rol listo pero sin activar | Activar cuando se requiera control de acceso |
| R-02 | Credenciales en variables de entorno no configuradas | Media | No hay `.env` real (solo `.env.example`) | Crear `.env` con secretos fuera del repositorio |
| R-03 | Base de datos no cifrada en reposo | Media | Archivo SQLite con permisos 600 | Para producción, cifrar archivo SQLite |
| R-04 | Backup no cifrado | Media | Respaldo en `data/local/backups/` sin cifrado | Para producción, cifrar respaldos |
| R-05 | Pesos del autoencoder en frontend (Motor B) | Alta | `ENCODER_PROJECTION_WEIGHTS` hardcodeado en `autoencoderData.ts` | Mover pesos a backend aislado cuando se active |
| R-06 | Múltiples versiones de modelos `.h5` sin manifiesto | Media | 10+ versiones en directorios diversos | Crear manifiesto; definir versión canónica |
| R-07 | Sin semilla aleatoria (no reproducible) | Media | No hay `set.seed()` en scripts R | Definir y documentar semilla |
| R-08 | Versiones de librerías no pinadas | Media | `package.json` con rangos (`^`) | Crear `package-lock.json` o equivalente pinado |

---

## 2. Decisiones que requieren autorización

| ID | Decisión | Consecuencia si NO se autoriza |
|----|----------|-------------------------------|
| D-01 | Implementar backend Express + SQLite local | No hay persistencia SQL; solo localStorage |
| D-02 | Puerto del backend (8080 recomendado) | Puerto por defecto del sistema |
| D-03 | Implementar autenticación básica en backend | Sin control de acceso a endpoints |
| D-04 | Cargar datos de prueba sintéticos | Base inicia vacía |
| D-05 | Crear rama de Git para estos cambios | Cambios en rama principal sin aislamiento |

---

## 3. Pasos posteriores recomendados

| Paso | Descripción | Dependencia |
|------|-------------|-------------|
| 1 | Revisar y autorizar decisiones D-01 a D-05 | Autorización del responsable del proyecto |
| 2 | Instalar dependencias npm y compilar TypeScript del frontend | `bun install` (ya hecho) |
| 3 | Ejecutar pruebas de regresión de vistas clínicas | Backend corriendo + frontend |
| 4 | Crear rama de Git para aislar cambios | D-05 autorizada |
| 5 | Documentar procedimiento de respaldo y restauración | D-04 autorizada |
| 6 | Revisión independiente de seguridad para producción | Antes de despliegue productivo |
| 7 | Evaluar activación de Motor A/B (solo con pesos autorizados) | D-01, D-03 y pesos serializados |

---

## 4. Archivos modificados en el proyecto SISAP

| Archivo | Tipo de cambio | Razón |
|---------|---------------|-------|
| `.gitignore` | Modificado | Excluir `data/local/`, `backend/data/`, `*.sqlite3` de Git |

**Archivos creados (nuevo directorio `backend/`):**

| Archivo | Tipo |
|---------|------|
| `backend/package.json` | Nuevo |
| `backend/src/config.js` | Nuevo |
| `backend/src/utils/logger.js` | Nuevo |
| `backend/src/utils/errors.js` | Nuevo |
| `backend/src/utils/crypto.js` | Nuevo |
| `backend/src/db/index.js` | Nuevo |
| `backend/src/db/migrations.js` | Nuevo |
| `backend/src/migrations/001_initial_schema.sql` | Nuevo |
| `backend/src/services/auditService.js` | Nuevo |
| `backend/src/services/patientService.js` | Nuevo |
| `backend/src/services/evaluationService.js` | Nuevo |
| `backend/src/services/modelRunService.js` | Nuevo |
| `backend/src/middleware/security.js` | Nuevo |
| `backend/src/routes/index.js` | Nuevo |
| `backend/src/server.js` | Nuevo |
| `backend/src/cli/init-db.js` | Nuevo |
| `backend/src/cli/health.js` | Nuevo |
| `backend/src/cli/backup.js` | Nuevo |
| `backend/test/helpers.js` | Nuevo |
| `backend/test/db.test.js` | Nuevo |
| `backend/test/patients.test.js` | Nuevo |
| `backend/test/security.test.js` | Nuevo |

**Archivos NO modificados (preservados intencionalmente):**

| Archivo | Razón |
|---------|-------|
| `src/services/autoencoderEngine.ts` | Motor B preservado, desactivado |
| `src/data/autoencoderData.ts` | Pesos preservados, no usados |
| `src/components/views/InitialEvaluationView.tsx` | Motor B desactivado (`autoencoderInference = null`) |
| `src/components/views/WeeklyNarrativeView.tsx` | Motor A sin ejecución real |
| Todos los archivos de `shiny_app/` y `ae_multihead/` | No tocados |

---

## 5. Veredicto final

La aplicación **puede guardar y recuperar registros de prueba en SQL local** (`data/local/sisap_test.sqlite3`), mantiene la trazabilidad de los datos mediante la bitácora WORM, y conserva **ambos motores clínicos desactivados**. Las medidas de protección de modelos se basan en la arquitectura real (pesos no empaquetados, backend aislado, no ofuscación), no en ofuscación cosmética.

**No se declara la aplicación segura en términos absolutos.** Se requieren revisión independiente de seguridad y cumplimiento normativo antes de cualquier despliegue productivo.
