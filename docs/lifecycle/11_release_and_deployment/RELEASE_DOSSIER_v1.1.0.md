# Expediente de Liberación de Software — SISAP by CENIVRA v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-011` |
| **Título** | Expediente de Liberación, Compatibilidad e Instrucciones de Reversión `v1.1.0` (IEC 62304 §5.8) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión — Pendiente de autorización de publicación** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Responsable de Liberación y Configuración — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de aprobación formal previa al tag `v1.1.0`** |
| **Documentos relacionados** | `SISAP-LC-002` · `SISAP-LC-004` · `SISAP-LC-008` · `SISAP-LC-014` · [`RELEASE_NOTES_v1.1.0.md`](../../11_release_and_maintenance/RELEASE_NOTES_v1.1.0.md) |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Consolidación del expediente de liberación conforme a Sección 11 IEC 62304 sobre la rama `release/1.1.0`, preservando íntegro `v1.0.0`. | Equipo de Ingeniería SISAP |

---

## 1. Identificación de Versión y Preservación de `v1.0.0`
- **Versión candidata:** `v1.1.0` (tipo `MINOR`, retrocompatible).
- **Rama de desarrollo y liberación:** `release/1.1.0`.
- **Preservación de línea histórica `v1.0.0`:**
  - El tag Git `v1.0.0`, la rama `main` (`ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f`) y el release publicado en GitHub [`v1.0.0`](https://github.com/cenivra/SISAP-by-CENIVRA/releases/tag/v1.0.0) (con sus 2 adjuntos Windows) **permanecen íntegramente sin alteración**.

---

## 2. Alcance de Cambios, Requisitos, Defectos y Riesgos Revisados
- **Alcance funcional (`main..release/1.1.0`):**
  1. Integración verificada del Autoencoder TUS (`engines/autoencoder/`) y pipeline R/Node (`4cb847b`).
  2. Arquitectura de 5 Motores de Inteligencia Clínica y longitudinal (`bb7078e`).
  3. Centro de Evaluación Psicométrica Digital con catálogo de 6 escalas, exclusión de `OCI-R`, almacenamiento en 3 niveles y equivalencia numérica (`b9e94d7`).
  4. Documentación de versión `CHANGELOG.md`, `RELEASE_NOTES_v1.1.0.md` y expediente del ciclo de vida IEC 62304 (`7bca47e` + commit ciclo de vida).
- **Requisitos implementados:** Trazados en `SISAP-LC-003` y `SISAP-LC-015` (`REQ-CORE-001..004`, `REQ-AE-001..007`, `REQ-PSYC-001..010`, `REQ-LONG-001..003`, `REQ-NARR-001..002`, `REQ-MM-001`, `REQ-DSS-001`, `REQ-SEC-001..003`, `REQ-PRIV-001..002`, `REQ-AVAIL-001`, `REQ-PERF-001`, `REQ-INT-001`, `REQ-TRAC-001`; parciales declarados: `REQ-AE-008`, `REQ-SEC-004`, `REQ-UX-001`).
- **Defectos resueltos:** `PRB-001` (`STAXI-2` 1..49), `PRB-002` (`EROS` vs `tiempo_consumo`), `PRB-003` (denominador `BSL-23` = 136), `PRB-004` (`ENCODER_PROJECTION_WEIGHTS` demo retirada), `PRB-005` (detección honesta ONNX), `PRB-006` (regresión histórica `N=166` vs `D-06`), `PRB-007` (carga opcional de `firebase-applet-config.json` en build limpio), documentados en `SISAP-LC-013` y `SISAP-VV-ISS-110`.
- **Riesgos revisados:** `RSK-001` a `RSK-012` evaluados en `SISAP-LC-004`.
- **Expediente comparativo `v1.0.0` vs `v1.1.0`:** [`version_comparison_report.md`](../10_system_testing/version_comparison_v1.0.0_vs_v1.1.0/version_comparison_report.md) y [`release_readiness_report.md`](../10_system_testing/version_comparison_v1.0.0_vs_v1.1.0/release_readiness_report.md) (incluye migración `v1.0.0 → v1.1.0` y reversión comprobadas en Entorno C).

---

## 3. Pruebas Ejecutadas, Dependencias, Modelos y Compatibilidad
- **Pruebas verificadas:** `33/33 PASS` en Node (`npm test`), `0` errores en `tsc --noEmit`, `1718` módulos en `vite build` (`2.93s`), `4/4` suites unitarias R `PASS`, instalación limpia SQLite (`15` tablas, `3` migraciones, `ok: true`) y escaneo de higiene (`NO_PATHS_OR_SECRETS_FOUND`).
- **Modelos y configuraciones incluidos:** `encoder_22_checkpoint_fase2` (defecto verificado), `encoder_24_deployed` (pendiente validación externa), `ae_tus_17to12_m3k12` (experimental confirmatorio), `catalog_v1.json` (`1.0.0`).
- **Dependencias SOUP:** Controladas en `SISAP-LC-016` y `package-lock.json`.
- **Compatibilidad y migraciones:** Las migraciones `002` y `003` son aditivas desde `v1.0.0` sin pérdida ni alteración de registros previos.

---

## 4. Limitaciones Conocidas y Criterios Pendientes antes de Publicar
1. Textos literales pendientes con bandera explícita `pendingAuthorizedText: true`: `STAXI-2` ítems `50..57` (PAR 1999) y `BSL-23` suplemento conductual (11 ítems); encabezado de portada `BIS-11` en encuadre neutro.
2. Motor 3 opera en análisis léxico determinista (`onnx_artifact.inference_ready: false`) al no incluirse pesos densos RoBERTa/binario ONNX.
3. Compilación de instalador Windows `.exe` (`npm run dist:win`), firma digital Authenticode y evaluación de usabilidad clínica en campo pendientes.

---

## 5. Instrucciones de Instalación, Verificación Post-Despliegue y Reversión (Rollback)

### Instalación / Actualización desde `v1.0.0`
1. Respaldar la base SQLite actual antes de actualizar (`node backend/src/cli/backup.js`).
2. Instalar dependencias y compilar frontend dentro de `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`:
   ```bash
   npm ci
   npm run build
   ```
3. Aplicar migraciones aditivas y verificar estado de base:
   ```bash
   node backend/src/cli/init-db.js
   node backend/src/cli/health.js
   ```
   Confirmar `migrationsApplied: 3`, `tables: 15`, `missingTables: []`, `ok: true`.

### Procedimiento de Reversión (Rollback a `v1.0.0`)
1. Detener la aplicación Electron / proceso backend `127.0.0.1:8080`.
2. Restaurar la copia de respaldo SQLite previa a la migración (tomada en el paso 1 de actualización) en `%APPDATA%/.../data/local/` o `data/local/`. *(Nota: aunque SQLite `v1.0.0` no lee tablas nuevas `002/003`, restaurar el backup previo garantiza estado bit a bit de `v1.0.0` sin filas adicionales).*
3. Reinstalar o ejecutar el binario/código de la etiqueta inmutable `v1.0.0` (`ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f`).

---

## 6. Estado de Aprobación de Liberación
- **Estado:** **Pendiente de aprobación formal por Dirección de Producto / Responsable Clínico / V&V.**
- **Bloqueo activo:** No crear tag público `v1.1.0` ni retirar el estado borrador hasta completar firma/autorización y decisión sobre empaquetado `.exe`.
