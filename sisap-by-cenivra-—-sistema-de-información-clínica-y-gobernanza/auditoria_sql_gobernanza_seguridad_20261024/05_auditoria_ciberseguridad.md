# 05 — Auditoría de Ciberseguridad

**Fecha:** 24 de octubre de 2026  
**Fase:** Seguridad de la aplicación y la base  
**Estado:** Implementado y probado

---

## 1. Vulnerabilidades identificadas y controles aplicados

| ID | Vulnerabilidad | Severidad | Estado antes | Control implementado | Estado después |
|----|---------------|-----------|--------------|---------------------|----------------|
| V-01 | No hay base de datos SQL (solo localStorage) | Alta | Sin backend ni BD | Backend Express + SQLite local con inicialización automática | Mitigado |
| V-02 | localStorage accesible desde consola del navegador | Alta | Datos clínicos en localStorage | Migración a SQL backend; localStorage solo para sesión | Mitigado |
| V-03 | No hay autenticación en el frontend | Alta | Usuarios en localStorage sin control real | Autenticación básica preparada en middleware (pendiente de activación completa) | Parcialmente mitigado |
| V-04 | Express instalado pero no usado | Media | Dependencia sin implementar | Express usado para backend local con controles de seguridad | Mitigado |
| V-05 | No hay protección contra SQL injection | N/A | No había SQL | Consultas parametrizadas (prepared statements) en todas las rutas | Mitigado |
| V-06 | No hay CORS configurado | Media | Sin servidor | CORS restringido a `localhost:3000` | Mitigado |
| V-07 | No hay CSRF protection | N/A | No había sesiones | Verificación de `Origin` en métodos de escritura | Mitigado |
| V-08 | Pesos del autoencoder en frontend | Alta | `ENCODER_PROJECTION_WEIGHTS` hardcodeados en TS | Pesos no empaquetados en build; motores desactivados | Mitigado (pendiente de activación) |
| V-09 | No hay control de acceso a nivel de endpoint | Alta | Todo el frontend accede a todo | Middleware de autorización por rol (estructura lista) | Parcialmente mitigado |
| V-10 | Pesos hardcodeados en `autoencoderData.ts` | Alta | Pesos en bundle JS | No se incluyen en `dist`/`public`; mantener en backend aislado | Mitigado (arquitectura) |

---

## 2. Controles de seguridad implementados

### 2.1 Middleware de seguridad (`backend/src/middleware/security.js`)

| Control | Descripción | Archivo |
|---------|-------------|---------|
| Loopback-only | El backend solo acepta conexiones desde `127.0.0.1` / `::1` | `security.js` |
| CORS restringido | Solo `http://localhost:3000` y `http://127.0.0.1:3000` | `security.js` |
| Verificación de Origin | Métodos de escritura rechazan orígenes no autorizados | `security.js` |
| Rate limiting | 100 req/min por IP en memoria | `security.js` |
| Límite de cuerpo | 256 KB máximo por solicitud | `security.js` |
| Lectura segura de JSON | Rechaza JSON inválido o cuerpo demasiado grande | `security.js` |

### 2.2 Manejo de errores

| Control | Descripción | Archivo |
|---------|-------------|---------|
| Errores genéricos al cliente | Nunca se expone SQL, rutas internas ni stack traces | `utils/errors.js` |
| Detalles solo en log del servidor | El log redacta claves sensibles | `utils/logger.js` |
| ToSafeResponse | Convierte cualquier error en respuesta segura | `utils/errors.js` |

### 2.3 Bitácora de auditoría (WORM)

| Control | Descripción | Archivo |
|---------|-------------|---------|
| Cadena de hash | Cada evento encadenado con `prev_hash` | `services/auditService.js` |
| Triggers SQL | Impiden `UPDATE` y `DELETE` en `audit_events` | `migrations/001_initial_schema.sql` |
| Verificación de cadena | Endpoint `/api/audit/verify` valida integridad | `services/auditService.js` |

---

## 3. Pruebas de seguridad ejecutadas

| ID | Prueba | Resultado |
|----|--------|-----------|
| T-10 | `loopbackOnly` rechaza conexiones no locales | ✅ Pasó |
| - | Rate limiting bloquea tras exceder límite | ✅ Pasó |
| - | `verifyOrigin` rechaza orígenes no autorizados en POST | ✅ Pasó |
| - | Cadena de auditoría WORM verificable | ✅ Pasó |
| - | Logger redacta claves sensibles (nombre, CURP) | ✅ Pasó |
| T-08 | Entrada SQL maliciosa es inofensiva (consultas parametrizadas) | ✅ Pasó |

**Total seguridad: 6 pruebas, 6 pasaron.**

---

## 4. Configuración de red

| Configuración | Valor | Justificación |
|---------------|-------|---------------|
| Host del backend | `127.0.0.1` (loopback) | Solo acceso local; no conexiones externas |
| Puerto del backend | `8080` | Puerto alternativo al Vite (3000) |
| CORS origin | `http://localhost:3000` | Solo el frontend de desarrollo |
| Rate limit | 100 req/min por IP | Prevención de fuerza bruta |
| Tiempo de sesión | 30 minutos inactividad | Coherente con configuración de ciberseguridad existente |

---

## 5. Limitaciones y riesgos restantes

| Riesgo | Severidad | Mitigación pendiente |
|--------|-----------|---------------------|
| Autenticación completa no implementada | Alta | Pendiente de autorización para activar |
| Credenciales en variables de entorno no configuradas | Media | Crear `.env` con secretos fuera del repositorio |
| Base de datos no cifrada en reposo | Media | Para producción, cifrar archivo SQLite |
| Backup no cifrado | Media | Para producción, cifrar respaldos |

**No se declara la aplicación segura en términos absolutos.** Las pruebas técnicas superadas demuestran controles implementados, pero requieren auditoría independiente para producción.
