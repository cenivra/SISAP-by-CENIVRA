# Informe de Comparación Funcional, Rendimiento y Migración — SISAP v1.0.0 vs v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-VV-CMP-001` |
| **Título** | Informe Comparativo Integral entre SISAP `v1.0.0` (Entorno A) y `v1.1.0` (Entorno B) |
| **Versiones comparadas** | `v1.0.0` (`ea500b3`) vs `release/1.1.0` (`v1.1.0` candidata) |
| **Estado** | **En revisión** |
| **Fecha de ejecución / registro** | 2026-11-23 |
| **Responsable** | Equipo de Verificación y Calidad — SISAP by CENIVRA |
| **Documentos relacionados** | `SISAP-VV-INST-100` · `SISAP-VV-INST-110` · `SISAP-VV-REG-110` · `SISAP-VV-NEW-110` · `SISAP-VV-ISS-110` · `SISAP-VV-RDY-110` |

---

## 1. Matriz de Comparación Funcional (13 Dimensiones — Sección 5)

| Dimensión | `v1.0.0` (Entorno A) | Nueva versión `v1.1.0` (Entorno B) | Resultado |
|---|---|---|---|
| **Instalación** | Limpia BD/deps OK; requiere copiar `firebase-applet-config.json.example` → `firebase-applet-config.json` para compilar UI (`TS2307` sin ese paso). | Compila directamente incluso en clon limpio sin `firebase-applet-config.json` (`1717` módulos, `2.27s`) tras corrección `PRB-007`; 3 migraciones SQLite limpias (`15` tablas). | **Aprobado** *(v1.0.0: Aprobado con observaciones)* |
| **Arranque** | Arranque HTTP loopback (`127.0.0.1:18081`) hasta `/api/health` = 200 en **`571.05 ms`** (`ok: true`, `10` tablas). | Arranque HTTP loopback (`127.0.0.1:18082`) hasta `/api/health` = 200 en **`346.4 ms`** (`ok: true`, `15` tablas). | **Aprobado** |
| **Autenticación** | Lógica de autenticación local (`LoginModal.tsx`, `cryptoService.ts` PBKDF2-SHA256 / fallback) en cliente; código idéntico byte a byte (`git diff = 0`) respecto a `v1.1.0`. No probado interactivamente en Electron GUI en esta sesión. | Sin cambios en flujo ni credenciales (`git diff = 0` en `LoginModal.tsx`, `cryptoService.ts`); verificada compilación TS/Vite completa. Sesión inter-navegador en UI gráfica no automatizada por Playwright. | **Aprobado con observaciones** *(verificación estática y de servicio idénticos; prueba interactiva de login en Electron GUI pendiente de campo)* |
| **Roles y permisos** | 10 roles `RoleKey` (`clinicalConstants.ts`) idénticos en SPA; backend loopback sin token por ruta. | Conserva intactos los 10 roles `RoleKey` y añade soporte de vistas nuevas sin alterar privilegios (`PRB`/observación `REQ-SEC-004` en red multiusuario). | **Aprobado con observaciones** *(RBAC UI compilado sin regresiones; prueba interactiva GUI y token multiusuario pendientes si evoluciona a red)* |
| **Navegación** | 15 pantallas originales en `Sidebar.tsx` y `App.tsx`. | Conserva las 15 pantallas de `v1.0.0` y agrega `centro_psicometrico` y `ecosistema` enlazados en `Sidebar.tsx` y desde captura inicial/seguimiento. | **Aprobado** |
| **Módulos existentes** | `15 / 15 PASS` en backend + `1706` módulos SPA compilados. | Todos los módulos `v1.0.0` conservados (`PSYC-09` paridad numérica + `33/33 PASS`); `1718` módulos SPA compilados. | **Aprobado** |
| **Captura y consulta de datos** | Alta, búsqueda parametrizada, bloqueo duplicados `409`, expediente, evaluaciones basales, semanales `q1..q8` (`201/200` OK). | Misma API núcleo íntegra + captura digital reactivo por reactivo (6 escalas), borradores `draft`, exclusión `OCI-R` (`400`) y seguimientos `follow-ups` (`201`). | **Aprobado** |
| **Persistencia** | SQLite WAL (`001_initial_schema.sql`: `10` tablas, `FK ON`, cadena WORM). | SQLite WAL (`001`+`002`+`003`: `15` tablas, `FK ON`, 3 niveles psicométricos con bloqueo `409 Conflict` y recálculo no destructivo). Migración desde copia de BD `v1.0.0` conserva 100% de datos (`verifyChain: true`). | **Aprobado** |
| **Visualizaciones** | Bundle Vite `1706` módulos compilado (`LatentRadarChart`, vistas básicas; simulador sintético). | Añade `LatentIntervalChart` (intervalos `p05–p95`), `ReconstructionBarsChart` y consola `IntelligenceEcosystemView` (`1718` módulos compilados). | **Aprobado** |
| **APIs e integraciones** | 10 rutas base (`/api/health`, `/migrations/status`, `/patients/*`, `/evaluations`, `/weekly-observations`, `/model-runs`, `/audit/*`). Rutas de motores devuelven `404`. | Conserva 100% de rutas `v1.0.0` y agrega 11 endpoints reales (`/api/engines/*`, `/api/follow-ups`, `/api/patients/:id/intelligence`, `/formulations`, `/api/psychometrics/*`). | **Aprobado** |
| **Rendimiento** | Arranque `571.05 ms`, RSS `53.84 → 66.61 MB`; latencias 50 iter.: `/health` `2.196 ms`, `/search` `4.418 ms`, `/record` `5.037 ms`, `/audit/verify` `6.575 ms`. | Arranque `346.4 ms`, RSS `61.00 → 70.52 MB`; latencias 50 iter.: `/health` `2.938 ms`, `/search` `6.027 ms`, `/record` `6.062 ms`, `/audit/verify` `4.592 ms`. Sub-7 ms medios en ambos; `+~3.9 MB` RSS final por motores cargados. | **Aprobado** |
| **Seguridad** | Loopback `127.0.0.1`, rechazo `Origin` externo (`403`), anti-SQLi, cadena WORM (`329` eventos OK), logger redactor `[REDACTED]`. | Mismas protecciones (`403`, anti-SQLi, WORM `valid: true`, `[REDACTED]`), más bloqueo `HTTP 409` anti-sobrescritura, verificación SHA-256 de pesos y eliminación de dependencia de build sobre `.json` externo. | **Aprobado** |
| **Recuperación ante errores** | Rechaza JSON inválido (`400`), búsqueda corta (`400`), ruta inexistente (`404`) y rollback SQL atómico (`T-09`) sin registros parciales. | Misma resiliencia + compuerta `D-06` (`422` sin imputación), rechazo `OCI-R` (`400`) y degradación controlada en Motor 3 sin binario ONNX (`inference_ready: false`). | **Aprobado** |

---

## 2. Comparación de Rendimiento y Estabilidad (Sección 8)

- **Condiciones comparables medidas:** Windows NT `10.0.26300.0` (`x64`), `Intel Core i3-10110U @ 2.10GHz` (2C/4T), `7.81 GB` RAM, Node.js `v24.22.1`, SQLite WAL local aislado por puerto (`18081` vs `18082`), 3 llamadas de calentamiento seguidas de **50 iteraciones** secuenciales por endpoint.

| Métrica | `v1.0.0` (Entorno A) | `v1.1.0` (Entorno B) | Lectura Comparativa |
|---|---:|---:|---|
| **Tiempo de compilación Vite (`vite build`)** | `2.31 s` (`1706` módulos) | `2.15 s` (`1718` módulos) | Equivalente (`~2.2s`) pese a +12 módulos e integración psicométrica/IA |
| **Tamaño bundle JS principal** | `839.36 kB` (`216.03 kB` gzip) | `1,200.43 kB` (`338.38 kB` gzip) | `+122.35 kB` gzip esperados por catálogo de 6 instrumentos completos (`catalog_v1.json`) y pesos JSON integrados |
| **Arranque servidor hasta `/api/health`** | `571.05 ms` | `346.4 ms` | Ambas arrancan por debajo de `0.6 s` |
| **Memoria RSS proceso backend (inicio → post-test)** | `51.35 MB` → `63.53 MB` (`53,841,920 → 66,613,248 B`) | `58.18 MB` → `67.25 MB` (`61,001,728 → 70,516,736 B`) | Incremento moderado de `+3.72 MiB` en RSS final en `v1.1.0` al cargar pesos del Autoencoder y catálogo en memoria |
| **`GET /api/health` (avg / p50 / p95 / max)** | `2.196 / 1.960 / 3.549 / 3.899 ms` | `2.938 / 2.479 / 7.094 / 9.995 ms` | Sub-10 ms en p95/max en ambas |
| **`GET /api/patients/search` (avg / p50 / p95 / max)** | `4.418 / 4.236 / 5.710 / 7.208 ms` | `6.027 / 5.162 / 12.593 / 17.882 ms` | Diferencia de ~1.6 ms en media; p95 < 13 ms |
| **`GET /api/patients/:id/record` (avg / p50 / p95 / max)** | `5.037 / 4.610 / 7.019 / 9.249 ms` | `6.062 / 5.561 / 9.771 / 11.530 ms` | Diferencia de ~1.0 ms en media |
| **`GET /api/audit/verify` (avg / p50 / p95 / max)** | `6.575 / 6.349 / 8.146 / 9.808 ms` | `4.592 / 3.652 / 8.122 / 23.817 ms` | No comparable directamente en absoluto porque Entorno A tenía `329` eventos WORM en cadena tras más escrituras previas y Entorno B `34` eventos (ver Sección 8: no sobreafirmar mejora). |

---

## 3. Verificación de Migraciones, Interoperabilidad y Reversión (Entorno C)

- **Procedimiento ejecutado sobre copia de BD de Entorno A (`db_env_c_migration_test`):**
  1. Se copiaron `sisap_env_a_v1_0_0.sqlite3` (con WAL/SHM tras cierre limpio de Entorno A, conteniendo los `TUS-0001..0003` + paciente de prueba `TUS-0007` ID `341ac67d-b651-4b2b-af9f-a7ad217e59cf` y su evaluación `f96ab47d-2394-48c7-ae08-fc3872565cea`) a un respaldo pre-migración y a una copia de trabajo.
  2. Sobre la copia de trabajo se ejecutó `init-db.js` y `health.js` de `v1.1.0`: aplicó únicamente las migraciones `2` (`intelligence_engines`) y `3` (`psychometric_center`), pasó de `10` a **`15` tablas**, `conflicts: []`, `missingTables: []`, `foreignKeysEnabled: true`.
  3. Al levantar Entorno B sobre esa base migrada (`127.0.0.1:18083`):
     - `GET /api/patients/341ac67d-.../record` devolvió `200 OK` conservando íntegro el paciente y la evaluación `f96ab47d-...` creada en `v1.0.0`.
     - `GET /api/audit/verify` confirmó `valid: true` (`430` eventos totales tras sumar operaciones de verificación migrada).
  4. **Reversión (Rollback):** Restaurando `sisap_pre_migration_backup_v1_0_0.sqlite3`, `health.js` de `v1.0.0` validó `ok: true`, `tables: 10`, `migrationsApplied: 1`, y la BD original de Entorno A permaneció intacta (`tables: 10`, `migrationsApplied: 1`).
- **Cambios incompatibles detectados entre `v1.0.0` y `v1.1.0`:** **Ninguno** en contratos API o tablas existentes (versión `MINOR` `v1.1.0` validada).

---

## 4. Respuestas Directas Basadas en Evidencia (Sección 12)

1. **¿La versión 1.0.0 sigue funcionando correctamente?** Sí (`15/15 PASS`, `10` tablas OK, arranque en `571.05 ms`, CRUD y auditoría WORM operativos; requiere seguir su paso documentado de copiar `firebase-applet-config.json.example` antes de compilar UI).
2. **¿La nueva versión se instala y arranca correctamente?** Sí (`33/33 PASS`, `15` tablas OK, arranque en `346.4 ms`, y compila incluso sin `firebase-applet-config.json` gracias a la corrección `PRB-007`).
3. **¿Qué funcionalidades conserva?** Todas las vistas originales (`15` pantallas), endpoints REST `v1.0.0`, esquema de `10` tablas, RBAC de `10` roles en cliente, loopback estricto, anti-SQLi, redactor de logs y bitácora WORM SHA-256.
4. **¿Qué funcionalidades mejora?** Sustituye la matriz demo de proyección por el pipeline real del Autoencoder TUS (`engines/autoencoder/`) verificado con SHA-256; reemplaza secuencias numéricas como flujo principal por el Centro Psicométrico digital manteniendo paridad `1:1`; corrige `STAXI-2 (1..49)`, `EROS/tiempo_consumo` y `BSL-23 Total Integrado (136)`; añade inmunidad de build ante ausencia de `firebase-applet-config.json`.
5. **¿Qué funcionalidades nuevas incorpora?** Motor 1 productivo (`22v`/`24v`) y comparativo (`17v`), Centro de Evaluación Psicométrica Digital (6 escalas, almacenamiento inmutable 3 niveles, bloqueo `HTTP 409`, recálculo versionado, alerta `versionMismatchWarning`), Motor 2 longitudinal `RCI`, Motor 3 léxico + detección honesta ONNX, Motor 4 multimodal y Motor 5 `E1–E5` con revisión humana obligatoria, además del sistema documental IEC 62304 (`docs/lifecycle/`, `docs/modules/`).
6. **¿Qué funcionalidades modifica o elimina?** Retira la matriz estática de participantes (`ENCODER_PROJECTION_WEIGHTS`) del flujo clínico; mantiene explícitamente excluido `OCI-R` del catálogo activo psicométrico; bloquea clustering nosológico `GMM` (`D-03`). La captura numérica previa se conserva como modo compatible (`numeric_sequence_legacy`), no eliminada.
7. **¿Qué regresiones se detectaron?** Ninguna regresión destructiva sobre las funciones de `v1.0.0`. Durante la verificación de compilación aislada se detectó `PRB-007` (import estático de `firebase-applet-config.json` heredado de `v1.0.0`), ya corregido en `v1.1.0`.
8. **¿Qué defectos siguen pendientes?** Ninguno crítico; permanecen declaradas limitaciones menores: textos editoriales `STAXI-2 (50–57)` y suplemento `BSL-23` pendientes de permiso (`pendingAuthorizedText: true`), Motor 3 sin binario/pesos ONNX densos (`inference_ready: false`), validación externa de `encoder_24`/`17v`, compilación final `.exe` NSIS + firma Authenticode y pruebas de campo de usabilidad/GUI interactiva (ver `SISAP-VV-ISS-110`).
9. **¿Qué versión presenta mejor desempeño bajo condiciones comparables?** En operaciones base CRUD (`search`, `record`, `health`), `v1.0.0` presentó latencias medias ligeramente menores por `1–1.6 ms` y `-3.72 MiB` de RSS final debido a su menor carga de motores; `v1.1.0` arrancó más rápido en la corrida medida (`346.4 ms` vs `571.05 ms`), compiló ligeramente más rápido (`2.15 s` vs `2.31 s`) y mantiene latencias medias `<= 6.1 ms` aportando toda la capacidad analítica y psicométrica adicional. Ambas operan en rango sub-10 ms sin degradación perceptible.
10. **¿Está la nueva versión técnicamente preparada para publicarse en GitHub?** **Sí para preparación como borrador (`--draft`) y aprobación formal previa a publicación definitiva**, cumpliendo los requisitos técnicos y documentales, pero **pendiente** de: (a) revisión clínica/calidad formal para promover los documentos IEC 62304 de `En revisión` a `Aprobado` y (b) generación/verificación del instalador `.exe` NSIS `v1.1.0` si se adjuntará binario compilado al release.
