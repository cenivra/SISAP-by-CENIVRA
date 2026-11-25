# Registro de Incidencias, Defectos Resueltos y Limitaciones Conocidas — v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-VV-ISS-110` |
| **Título** | Consolidado de Incidencias Detectadas en Comparación y Limitaciones Conocidas (`v1.0.0` vs `v1.1.0`) |
| **Estado** | **En revisión** |
| **Fecha de actualización** | 2026-11-23 |
| **Documentos relacionados** | `SISAP-LC-013` · `SISAP-LC-017` · `SISAP-VV-CMP-001` · `SISAP-VV-RDY-110` |

---

## 1. Defectos Críticos/Altos Detectados y Corregidos antes de Liberar `v1.1.0`

*(Detalle forense completo trazado en `SISAP-LC-013` `PROBLEM_RESOLUTION_LOG.md`).*

| ID | Resumen | Versión Origen | Estado en `release/1.1.0` | Verificación |
|---|---|---|---|---|
| `PRB-001` | Desorden de ítems `STAXI-2` respecto a clave oficial TEA Ediciones (2001) en UI heredada | Pre-`v1.1.0` | **Cerrado** | `PSYC-07` (`33/33 PASS`) |
| `PRB-002` | Colisión histórica de nombres entre `EROS` y `tiempo_consumoEROS` | Pipeline previo | **Cerrado** | `AE-04` (`33/33 PASS`) |
| `PRB-003` | Denominador incorrecto para `BSL-23 Total Integrado` (corregido a `136`) | Pre-`v1.1.0` | **Cerrado** | `PSYC-03` (`33/33 PASS`) |
| `PRB-004` | `ENCODER_PROJECTION_WEIGHTS` en flujo demo correspondía a filas `1..24` de participantes, no a pesos de red | `v1.0.0` (simulador) | **Cerrado** (aislado y sustituido por pesos SHA-256 reales) | `AE-01`, `AE-02`, R `test_dimensiones_latentes.R` |
| `PRB-006` | Reproducción histórica `N=166` en R fallaba ante compuerta `D-06` de producción sin bandera explícita | Fase I Auditoría | **Cerrado** | `AE-03`, `test_regresion_original.R` |
| **`PRB-007`** | **Nuevo en esta fase:** Import estático obligatorio de `../../firebase-applet-config.json` en `src/services/googleDriveService.ts` causaba fallo `TS2307` / `[UNRESOLVED_IMPORT]` al compilar un checkout limpio sin copiar antes `.example` | `v1.0.0` (`ea500b3`) | **Cerrado en `release/1.1.0`** mediante `import.meta.glob` opcional *(permanece como observación documentada en `v1.0.0` histórico)* | Prueba limpia sin `.json` (`1717` módulos, `2.27s`, `0` errores) |

---

## 2. Incidencias Menores y Limitaciones Abiertas Documentadas (`v1.1.0`)

*(Ninguna bloquea técnicamente el funcionamiento local ni constituye fallo crítico de seguridad o pérdida de datos; deben permanecer declaradas explícitamente hasta resolverse).*

| ID / Área | Impacto Técnico / Clínico | Severidad | Estado y Justificación |
|---|---|---|---|
| **`OPEN-01` (`PRB-005` — Motor 3 ONNX)** | El archivo `modelo.onnx` (`1.38 MB`) en `data/modelo/nlp/bsc-bio-ehr-es/` no contiene los pesos densos completos de RoBERTa 12 capas (>400 MB) ni runtime `onnxruntime-node`. | Baja / Media *(funcional degradado)* | **Mitigado:** `/api/engines/status` declara honestamente `inference_ready: false`; Motor 3 opera de forma determinista por extracción léxica trazable `E1_explicit`. |
| **`OPEN-02` (Textos editoriales pendientes)** | `STAXI-2` posiciones `50..57` (PAR 1999), suplemento conductual de `11` ítems de `BSL-23` y encabezado literal de portada `BIS-11` carecen de texto literal autorizado dentro del repositorio. | Baja *(gobernanza IP)* | **Mitigado:** Marcados con `pendingAuthorizedText: true` / `administrative_framing_verbatim_pending_manual` sin inventar reactivos; captura `TEA-49` y centrales `BSL-23`/`BIS-11` operan completas. |
| **`OPEN-03` (Validación externa de modelos)** | `encoder_24_deployed` (reentrenado sin semilla fija) y prototipo `ae_tus_17to12_m3k12` carecen aún de validación prospectiva externa independiente. | Media *(clínico-epistemológica)* | **Mitigado:** Etiquetado obligatorio en `model_registry.json`, modelo productivo por defecto fijado en `encoder_22_checkpoint_fase2`, dimensiones opacas (`MOD-03`), bloqueo `GMM` (`D-03`) y revisión humana obligatoria. |
| **`OPEN-04` (Verificación GUI interactiva y usabilidad en campo)** | La verificación en esta fase cubrió compilación `tsc`/`Vite`, servicios backend en vivo y pruebas unitarias/integración; no se automatizó navegación interactiva de pantalla completa en ventana Electron con clics humanos observados. | Media *(calidad clínica)* | **Pendiente de campo:** Programado en plan de cierre (`SISAP-LC-017`) antes del despliegue clínico asistido o piloto formal. |
| **`OPEN-05` (Empaquetado `.exe` NSIS y firma Authenticode)** | El instalador `SISAP.by.CENIVRA.Setup.1.1.0.exe` no ha sido compilado todavía en `v1.1.0` y carece de certificado comercial Authenticode (`NotSigned`). | Baja *(distribución)* | **Diferido intencionalmente** hasta autorización expresa de generación del artefacto de release. |
| **`OPEN-06` (RBAC por token HTTP multiusuario)** | El control de 10 roles `RoleKey` opera en la capa SPA cliente sobre un backend loopback monousuario (`127.0.0.1`). | Baja en uso local monousuario; Alta si pasa a red | **Aceptable bajo contrato loopback `v1.1.0`**; obligatorio reforzar si evoluciona a servidor institucional en red (`REQ-SEC-004`). |
