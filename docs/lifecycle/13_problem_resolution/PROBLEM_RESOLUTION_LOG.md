# Registro y Proceso de Resolución de Problemas de Software — SISAP

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-013` |
| **Título** | Procedimiento y Bitácora de Resolución de Problemas de Software (IEC 62304 §9) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Calidad e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-004` · `SISAP-LC-008` · `SISAP-LC-012` · `SISAP-LC-018` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Formalización del proceso de resolución de problemas §9 y registro histórico verificado de defectos reales detectados y corregidos hacia `v1.1.0` (`PRB-001` a `PRB-006`). | Equipo de Ingeniería SISAP |

---

## 1. Proceso de Resolución de Problemas (IEC 62304 §9.1–9.8)
Todo defecto o anomalía recibe un identificador único (`PRB-NNN`), versión afectada, severidad, análisis de impacto de riesgo (`RSK-*`), evidencia de reproducción, análisis de causa raíz, corrección controlada, verificación mediante prueba automatizada de regresión y estado explícito de cierre.

---

## 2. Bitácora Verificada de Defectos e Incidencias (`PRB-001` a `PRB-006`)

| ID | Descripción del Problema | Versión Afectada | Severidad / Prioridad | Impacto Funcional y Riesgo | Evidencia de Reproducción y Causa Raíz | Corrección Implementada en `release/1.1.0` | Pruebas de Verificación | Estado |
|---|---|---|---|---|---|---|---|---|
| **`PRB-001`** | Desorden de reactivos `STAXI-2` en interfaz heredada (`wizard_ui.r`, 44 ítems vs 49 TEA). | Pre-`v1.1.0` | Crítica / Alta | Puntuación e índices STAXI-2 mal mapeados (`RSK-001`). | Inspección comparativa frente al manual español TEA Ediciones (2001, págs. 18, 83–87) y `scoring_staxi2.r`. | Alineación literal de reactivos `1..49` en `catalog_v1.json`; posiciones `50..57` marcadas `pendingAuthorizedText: true`. | `PSYC-07` (`33/33 PASS`) | **Cerrado** (en `release/1.1.0`) |
| **`PRB-002`** | Colisión histórica de nombres entre `EROS` y `tiempo_consumoEROS` en merge de hojas Excel. | Pipeline previo | Alta / Alta | Posible alteración cruzada de covariables clínicas en evaluación e inferencia Autoencoder (`RSK-004`). | Auditoría del script R original L806, L1015–1048: `merge_instrument_data()` no excluyó columna duplicada de hoja `EROS`. | Separación estricta de `EROS_raw` respecto a `tiempo_consumo`, clonando determinísticamente `tiempo_consumo` hacia `tiempo_consumoEROS` sin multiplicar ni mezclar con `EROS`. | `AE-04` (`33/33 PASS`) | **Cerrado** (en `release/1.1.0`) |
| **`PRB-003`** | Uso de denominador incorrecto para `BSL-23 Total Integrado` y falta de soporte estructurado del suplemento. | Pre-`v1.1.0` | Media / Alta | Error en porcentajes normalizados del total integrado (`RSK-001`). | El total integrado suma `23` nucleares (`0–92`) + `11` conductuales (`0–44`) = máximo real **`136`**. | Corrección a denominador `136` en `scoringEngine` y `catalog_v1.json`, marcando suplemento conductual como pendiente de texto autorizado. | `PSYC-03` (`33/33 PASS`) | **Cerrado** (en `release/1.1.0`) |
| **`PRB-004`** | `ENCODER_PROJECTION_WEIGHTS` en `src/data/autoencoderData.ts` correspondía a filas `ID=1..24` de `representaciones_completas.csv` (uso demo), no a pesos de red neuronal. | `v1.0.0` (modo simulador) | Crítica / Crítica | Falsa equivalencia matemática si se activase en flujo clínico real (`RSK-004`, `RSK-009`). | Demostración numérica en `04_validacion_modelo_y_12_dimensiones.md` (§2.2): `max_diff = 9.986e-7` vs filas 1..24 de participantes. | Aislamiento estricto del modo demo e integración del pipeline verificado de 5 capas + pesos reales `22→32→24→12→24→32→22` con SHA-256 en `engines/autoencoder/`. | `AE-01`, `AE-02`, `test_dimensiones_latentes.R` | **Cerrado** (en `release/1.1.0`) |
| **`PRB-005`** | Artefacto `modelo.onnx` (`bsc-bio-ehr-es`) de `1.38 MB` sin pesos densos completos de RoBERTa ni runtime nativo `onnxruntime-node`. | `v1.0.0` / `v1.1.0` | Media / Alta | Riesgo de asumir inferencia neuronal activa inexistente (`RSK-007`, `RSK-009`). | Auditoría de tamaño/estructura en `narrativeService.js` (requiere `>20 MB` / `>400 MB` pesos completos). | Degradación elegante explícita reportando `onnx_artifact.inference_ready: false` y activando analizador léxico determinista trazable `E1_explicit`. | `MOT-02` (`33/33 PASS`) | **Mitigado / Documentado como limitación abierta** |
| **`PRB-006`** | Falla en la reproducción del lote histórico `N=166` en R cuando existen valores `NA` históricos en filas `156–166` vs compuerta `D-06` de producción. | Fase I Auditoría AE | Media / Alta | Incapacidad de correr `test_regresion_original.R` sobre las 166 filas históricas sin comprometer rechazo `D-06` en producción (`RSK-002`). | Inspección de `Escalas fase transversal TUS.xlsx` (filas `66, 97, 126, 158` y `156–166`). | Incorporación en la copia integrada `Autoencoder_TUS_estratificacion_APP.R` del parámetro explícito `modo_regresion_historica_166 = TRUE`, conservando rechazo estricto `D-06` en producción. | `AE-03`, `test_preprocesamiento.R`, `test_regresion_original.R` | **Cerrado** (en `release/1.1.0`) |
