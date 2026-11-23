# Registro Maestro de Verificación y Validación (V&V) — SISAP v1.1

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-008` |
| **Título** | Plan y Estado Maestro de Verificación y Validación (IEC 62304 §5.5–5.7) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Responsable de Verificación y Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-002` · `SISAP-LC-007` · `SISAP-LC-009` · `SISAP-LC-010` · `SISAP-LC-015` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Registro consolidado diferenciando pruebas automatizadas ejecutadas, pruebas manuales pendientes y pruebas no aplicables con justificación. | Equipo de Ingeniería SISAP |

---

## 1. Taxonomía Honesta de Resultados de Prueba

Ninguna prueba se marca como `APROBADA` sin evidencia de ejecución real posterior a las modificaciones del código:
- **Automatizada — PASS:** Ejecutada con resultado exitoso verificable (`exit code 0`).
- **Omitida controlada:** Saltada explícitamente porque depende de datos confidenciales (`Escalas fase transversal TUS.xlsx`) excluidos del repositorio público; validada previamente sobre entorno local autorizado.
- **Pendiente:** No ejecutada todavía en el ciclo actual (requiere usuario clínico o firma de binario final).
- **No aplicable:** Fuera del alcance técnico de `v1.1.0`, con justificación registrada.

---

## 2. Matriz Consolidada de Verificación y Validación (`v1.1.0`)

| Categoría (Sección 9) | Identificador / Suite | Tipo | Estado Real | Evidencia / Justificación |
|---|---|---|---|---|
| **Pruebas unitarias JS** | `AE-01..05`, `PSYC-02..09`, `T-04,06,08,09,10`, `security.test.js` | Automatizada | **PASS** | `npm test` (`33/33 PASS`, `fail 0`, `1231.68 ms`) |
| **Pruebas unitarias R** | `test_esquema_datos.R`, `test_scoring_escalas.R`, `test_preprocesamiento.R`, `test_dimensiones_latentes.R` | Automatizada | **PASS** | `Rscript.exe` exit code `0` en las 4 suites |
| **Pruebas de integración API/BD/Motores** | `AE-06`, `MOT-01`, `MOT-02`, `PSYC-01`, `PSYC-10`, `PSYC-11`, `T-07` | Automatizada | **PASS** | Cubiertas en `npm test` (`33/33 PASS`), detalladas en `SISAP-LC-009` |
| **Pruebas de persistencia y migración** | `T-01`, `T-02` + ciclo limpio temporal (`init-db.js` → `seed-fixtures.js` → `health.js`) | Automatizada | **PASS** | `migrationsApplied: 3`, `tables: 15`, `missingTables: []`, `foreignKeysEnabled: true`, `ok: true` |
| **Pruebas de seguridad e higiene** | `T-10` loopback, `rateLimit`, `verifyOrigin`, WORM `verifyChain()`, `logger` redacción + `rg` rutas/secretos + diff | Automatizada | **PASS** | Sin fugas PHI en logger ni repositorio (`NO_PATHS_OR_SECRETS_FOUND`) |
| **Pruebas de compilación del sistema** | `tsc --noEmit` (`npm run lint`) y `vite build` (`npm run build`) | Automatizada | **PASS** | `0` errores TS; `1718` módulos en `2.93s` |
| **Pruebas de reproducibilidad científica** | Paridad R ↔ JS (`AE-02`) y regresión histórica `N=166` (`test_regresion_original.R`) | Automatizada / Controlada | **PASS en R↔JS / Omitida en repo sin Excel PHI** | Paridad `0.0000e+0`; regresión `N=166` verificada en entorno Drive (`1.554e-14`, `1.788e-7`); omisión limpia `[INFO]` sin `SISAP_EXCEL_CANONICO` |
| **Pruebas de recuperación ante errores** | Rollback transaccional (`T-09`), compuerta `D-06` (`AE-03`, `PSYC-08`), degradación ONNX (`MOT-02`) | Automatizada | **PASS** | Estado íntegro sin registros parciales ni fallos silenciosos |
| **Pruebas de empaquetado instalador NSIS (`v1.1.0`)** | `npm run dist:win` (`SISAP.by.CENIVRA.Setup.1.1.0.exe`) | Sistema / Release | **Pendiente** | Manifiesto configurado (`package.json`); generación diferida hasta autorización de liberación |
| **Pruebas de usabilidad con usuarios clínicos** | Evaluación de campo en desktop/tablet de `PsychometricCenterView.tsx` y `IntelligenceEcosystemView.tsx` | Manual clínica | **Pendiente** | Requiere sesiones observadas con psicólogos/consejeros de CENIVRA |
| **Validación clínica longitudinal prospectiva** | Calibración externa de `encoder_24_deployed` y `ae_tus_17to12_m3k12` | Estudio clínico | **Pendiente** | Fuera del alcance de verificación técnica de `v1.1.0`; declarada como limitación |
| **Pruebas RBAC HTTP multiusuario en red** | Tokens JWT por ruta en servidor compartido | No aplicable en `v1.1.0` *(Condicional)* | **No aplicable en arquitectura loopback `v1.1.0`** | El servidor `127.0.0.1:8080` es monousuario local por contrato (`loopbackOnly`); obligatorio si evoluciona a despliegue en red multiusuario (`REQ-SEC-004`) |
