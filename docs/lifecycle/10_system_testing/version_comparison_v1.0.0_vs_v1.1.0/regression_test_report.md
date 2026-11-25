# Informe de Pruebas de Regresión — SISAP v1.0.0 → v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-VV-REG-110` |
| **Título** | Evaluación y Registro de Pruebas de Regresión sobre Capacidades Preexistentes de `v1.0.0` |
| **Versión evaluada** | `v1.1.0` candidata frente a línea base `v1.0.0` (`ea500b3`) |
| **Estado** | **En revisión** |
| **Fecha de ejecución / registro** | 2026-11-23 |
| **Responsable** | Equipo de Verificación y Calidad — SISAP by CENIVRA |
| **Documentos relacionados** | `SISAP-LC-008` · `SISAP-LC-015` · `SISAP-VV-CMP-001` |

---

## 1. Clasificación de Funcionalidades Preexistentes de `v1.0.0` (Sección 6)

Categorías obligatorias aplicadas: **1. Conservada sin cambios · 2. Mejorada · 3. Modificada · 4. Sustituida · 5. Retirada intencionalmente con justificación · 6. Deteriorada o rota**.

| ID Regresión | Funcionalidad Preexistente en `v1.0.0` | Clasificación | Resultado en `v1.1.0` | Evidencia / Prueba |
|---|---|---|---|---|
| `REG-01` | Alta de pacientes (`POST /api/patients`), UUID + `TUS-XXXX`, bloqueo de duplicados `409` y consulta (`search`, `duplicates`, `record`) | **1. Conservada sin cambios** | Operativa al 100% sin ruptura de contrato JSON ni esquema. | `T-04`, `T-06`, `T-06b`, `comparison_benchmark_results.json` (`env_b.core`) |
| `REG-02` | Persistencia SQLite WAL, `PRAGMA foreign_keys = ON`, transacciones atómicas y migración `001` | **2. Mejorada** | Conserva las 10 tablas intactas y amplía de forma aditiva con `002` y `003` a 15 tablas preservando datos previos. | `T-01`, `T-02`, `T-09`, `MOT-01`, `PSYC-01`, prueba migración Entorno C |
| `REG-03` | Seguridad de transporte local (`loopbackOnly`, CORS, `verifyOrigin`, `rateLimit`), anti-SQLi, cadena WORM y redactor `[REDACTED]` | **1. Conservada sin cambios** | Todos los controles responden exactamente igual (`403`, `400`, `404`, cadena WORM `valid: true`). | `T-08`, `T-10`, `security.test.js`, `env_b.core.security_and_error_recovery` |
| `REG-04` | Evaluación basal (`POST /api/evaluations`) y observaciones semanales (`POST /api/weekly-observations`) | **1. Conservada sin cambios** | Sigue almacenando `initial_evaluations`, `scale_responses`, `scale_scores` y `weekly_observations` (`q1..q8`) alimentando además a los Motores 2, 3 y 4. | `T-07`, `MOT-02`, `env_b.core.core_crud` |
| `REG-05` | Captura por secuencia numérica en evaluación inicial y escalas de seguimiento (`InitialEvaluationView.tsx`, `FollowUpScalesView.tsx`) | **3. Modificada** *(enlace compatible al Centro Psicométrico)* | Se conserva operativa como modo de compatibilidad (`Compat.`) y comparte paridad matemática `1:1` verificada con la nueva captura digital. | `PSYC-09` (`33/33 PASS`) |
| `REG-06` | Gestión de usuarios, autenticación cliente (`LoginModal.tsx`), `cryptoService.ts` y 10 roles `RoleKey` (`clinicalConstants.ts`) | **1. Conservada sin cambios** | Cero líneas modificadas (`git diff = 0`) frente a `v1.0.0`; compila limpiamente en TS/Vite. | Inspección diff + `tsc --noEmit` + `vite build` |
| `REG-07` | Navegación SPA en `Sidebar.tsx` y `App.tsx` (15 módulos originales) | **2. Mejorada** | Las 15 vistas originales permanecen accesibles; se añaden `centro_psicometrico` y `ecosistema` sin eliminar vistas existentes. | Inspección diff `Sidebar.tsx` / `App.tsx` + `vite build` |
| `REG-08` | Integración opcional Firebase / Google Drive (`googleDriveService.ts`) | **2. Mejorada** | Corrige defecto heredado `PRB-007` permitiendo compilación limpia sin `firebase-applet-config.json` presente. | Prueba `CLEAN NO-FIREBASE-CONFIG BUILD PASS` (`1717` módulos, `2.27s`) |
| `REG-09` | Uso de matriz estática `ENCODER_PROJECTION_WEIGHTS` en flujo analítico como proyección de encoder (`v1.0.0` `autoencoderData.ts`) | **4. Sustituida / 5. Retirada intencionalmente del flujo clínico** | Sustituida por pesos reales verificados por SHA-256 (`encoder_22_checkpoint_fase2`, `24`, `17`) y pipeline 5 capas; se mantiene separada la vista demostrativa sintética. | `PRB-004`, `AE-01`, `AE-02`, `04_validacion_modelo_y_12_dimensiones.md` |
| `REG-10` | Registro pasivo de `model_runs` (`POST/GET /api/model-runs`) y exportación/informes | **2. Mejorada** | Mantiene `POST/GET /api/model-runs` retrocompatible y suma trazabilidad real de corridas completadas y rechazadas (`AE-06`), más exportación Markdown/JSON desde Motor 5. | `AE-06`, `env_b.core.core_crud` |
| `REG-11` | Capacidades rotas o deterioradas (`Deteriorada o rota`) | **Ninguna detectada (`0`)** | No se detectó ninguna funcionalidad de `v1.0.0` rota o eliminada sin justificación documentada. | `33/33 PASS` + `comparison_benchmark_results.json` |
