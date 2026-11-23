# Expediente de Gestión de Riesgos y Clasificación de Seguridad — SISAP v1.1

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-004` |
| **Título** | Expediente de Gestión de Riesgos de Software y Evaluación de Clasificación de Seguridad |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Responsable de Riesgos e Ingeniería Clínica — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión clínica y regulatoria independiente** |
| **Marco de referencia** | IEC 62304:2006 + AMD1:2015 (§4.3, §7) · ISO 14971:2019 |
| **Documentos relacionados** | `SISAP-LC-001` · `SISAP-LC-003` · `SISAP-LC-005` · `SISAP-LC-013` · `SISAP-LC-015` · `SISAP-LC-016` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Expediente de riesgos adaptado a la plataforma real `v1.1.0` (Autoencoder 22v/24v/17v, Centro Psicométrico 6 escalas, 5 Motores, SQLite WAL y SOUP), e inclusión del análisis de clase de seguridad A/B/C. | Equipo de Ingeniería SISAP |

---

## 1. Metodología de Estimación y Evaluación del Riesgo

De acuerdo con **IEC 62304 Cláusula 7** e **ISO 14971**, cada peligro potencial relacionado con el software se analiza siguiendo la cadena causal:
`Peligro → Secuencia previsible de eventos → Situación peligrosa → Daño potencial → Estimación (Severidad × Probabilidad) → Medidas de control → Verificación del control → Riesgo residual`.

### Escala Cualitativa de Referencia (Pre-Control y Residual)
- **Severidad (`S`):**
  - `S1` (Despreciable): molestia operativa sin impacto clínico.
  - `S2` (Moderada): error de registro, confusión de informe o retraso en atención que requiere corrección manual por el clínico, sin daño físico irreversible.
  - `S3` (Seria): sesgo relevante en formulación clínica o decisión terapéutica ambulatoria/residencial si no existiera revisión humana compensatoria.
  - `S4` (Crítica / Catastrófica): lesión grave permanente o muerte *(no aplicable directamente según uso previsto bajo supervisión humana, salvo uso indebido fuera de alcance)*.
- **Probabilidad (`P`):** `P1` (Improbable / remota), `P2` (Ocasional), `P3` (Probable si falta control).
- **Nivel de Riesgo (`S × P`):** `Bajo` · `Medio` · `Alto` *(todo riesgo Medio o Alto exige controles implementados en arquitectura/código y verificación documentada)*.

---

## 2. Análisis de Riesgos y Controles de Software (`RSK-001` a `RSK-012`)

| ID | Categoría / Peligro | Secuencia previsible de eventos → Situación peligrosa | Daño potencial | Pre-Control (`S / P / Nivel`) | Medidas de control implementadas en `v1.1.0` | Verificación del control | Residual (`S / P / Nivel`) |
|---|---|---|---|---|---|---|---|
| `RSK-001` | **Errores de puntuación psicométrica o inversión** | Mapeo erróneo de ítems (`STAXI-2` desordenado en `wizard_ui.r`), fórmula sin inversión `5 - x` o denominador erróneo (`BSL-23 Total Integrado`) → puntaje calculado falso presentado al clínico. | Sobreestimación o subestimación de impulsividad, ira, ansiedad o riesgo conductual en evaluación clínica. | `S3 / P3 / Alto` | 1) Catálogo único `catalog_v1.json` desacoplado de UI con orden literal TEA 2001 (`STAXI-2 1..49`), inversiones explícitas (`BIS-11`, `EROS`) y denominador `136` en `BSL-23`. 2) Separación estricta de `rawResponses` vs `recodedResponses` vs `calculatedScores`. 3) Equivalencia bit a bit con secuencia numérica (`PSYC-09`). | `PSYC-02..07`, `PSYC-09` (`33/33 PASS`) | `S2 / P1 / Bajo` |
| `RSK-002` | **Datos incompletos o imputación silenciosa** | El usuario omite reactivos en el formulario o en el vector basal/longitudinal y el algoritmo rellena con ceros o promedios ocultos → puntuación o vector `12D` aparentemente válido sobre datos ausentes. | Ocultamiento de áreas no evaluadas o alteración artificial de las dimensiones latentes y del `RCI`. | `S3 / P3 / Alto` | 1) Compuerta estricta `D-06` en `autoencoderInferenceEngine.js`, `scoringEngine.ts/.js` y `analyticalService.js`: rechazo con `HTTP 422` / `HTTP 400` y bandera `isValidForScoring: false`. 2) Filtro rápido de reactivos pendientes en UI antes del envío. | `AE-03`, `PSYC-08`, `MOT-02` | `S2 / P1 / Bajo` |
| `RSK-003` | **Errores de identificación de paciente o duplicidad de expediente** | Captura de un paciente ya registrado con distinto `UUID`, o vinculación de escalas a expediente equivocado → fragmentación o cruce de historiales. | Seguimiento longitudinal erróneo o atribución clínica cruzada. | `S3 / P2 / Alto` | 1) `UUID` interno + seudónimo único `TUS-XXXX` + prevención de duplicados por nombre normalizado y CURP (`HTTP 409` sin `allow_duplicate`). 2) `PRAGMA foreign_keys = ON` en todas las tablas (`patients`, `clinical_records`, `psychometric_evaluations`, etc.). | `T-06`, `T-06b`, `T-07`, `health.js` | `S2 / P1 / Bajo` |
| `RSK-004` | **Inferencias incorrectas o adulteración de pesos del Autoencoder** | Uso de matriz incorrecta (`ENCODER_PROJECTION_WEIGHTS` heredado de filas 1..24), corrupción de archivo JSON/HDF5, mezcla de `EROS` con `tiempo_consumo` o divergencia JS vs R → vector `12D` sin validez matemática. | Perfil geométrico erróneo o irreproducible entre evaluación clínica e investigación R. | `S3 / P3 / Alto` | 1) Retiro de la matriz demo del flujo clínico activo. 2) Verificación criptográfica SHA-256 obligatoria sobre los 8 artefactos en `model_registry.json`. 3) Paridad exacta 5 capas R vs Node (`max_abs_diff = 0.0000e+0`) y separación `EROS_raw` vs `tiempo_consumo` (`PRB-002`). | `AE-01`, `AE-02`, `AE-04`, `test_regresion_original.R` | `S2 / P1 / Bajo` |
| `RSK-005` | **Pérdida, corrupción o sobrescritura retroactiva de datos** | Sobrescritura de evaluación cerrada, caída de energía durante escritura parcial o alteración de bitácora forense → pérdida de evidencia clínica original. | Pérdida de trazabilidad clínica, violación NOM-004/NOM-024 o invalidez auditora. | `S3 / P2 / Alto` | 1) SQLite modo WAL + transacciones atómicas (`T-09`). 2) Almacenamiento en 3 niveles (`003_psychometric_center.sql`) con bloqueo `HTTP 409 Conflict` ante edición de `completed`. 3) Recálculo aditivo no destructivo. 4) Bitácora WORM `audit_events` con triggers `BEFORE UPDATE/DELETE` y cadena hash SHA-256. | `T-09`, `T-10`, `PSYC-10`, `PSYC-11` | `S2 / P1 / Bajo` |
| `RSK-006` | **Resultados desactualizados o mezcla de versiones longitudinales** | Comparar puntaje total de `BADS v22` (22 ítems, validación $N=289$) directamente con `BADS v25` (25 ítems), o actualizar algoritmo sin identificar la versión del resultado → falsa lectura de deterioro o mejoría. | Interpretación longitudinal falsa entre dos aplicaciones sucesivas. | `S2 / P3 / Medio` | 1) Registro obligatorio de `instrument_version` y `algorithm_version` en niveles 1 y 3. 2) Detección automática `versionMismatchWarning: true` informando los ítems diferenciales (`P4, P10, P16`). 3) Parámetros normativos explícitos en `RCI` con bandera `INSUFFICIENT_OBSERVATIONS_LT2` cuando `< 2`. | `PSYC-11`, `MOT-02` | `S1 / P1 / Bajo` |
| `RSK-007` | **Fallo de sincronización o indisponibilidad de runtime R / ONNX** | Ausencia de `Rscript` o ausencia del artefacto denso ONNX `bsc-bio-ehr-es` (`1.38 MB` sin pesos completos ni binario nativo) → bloqueo de la aplicación o simulación falsa de NLP neuronal. | Interrupción de flujo clínico o falsa creencia de inferencia por deep learning NLP. | `S2 / P3 / Medio` | 1) La inferencia productiva del Autoencoder corre de forma nativa y determinista en Node.js ESM sin depender de R en tiempo de ejecución. 2) Motor 3 reporta honestamente `onnx_artifact.inference_ready: false` y degrada limpiamente a extracción léxica determinista (`E1_explicit`). 3) Propagación síncrona al cerrar evaluación en `PsychometricCenterView`. | `AE-02`, `MOT-02`, `npm run build` | `S1 / P1 / Bajo` |
| `RSK-008` | **Permisos inadecuados o fuga de PHI / secretos** | Exposición del servidor backend en `0.0.0.0`, peticiones CSRF desde navegador externo, impresión de nombres/CURP/respuestas en logs o subida de datos reales/rutas a GitHub. | Violación grave de confidencialidad y LFPDPPP (datos sensibles de salud). | `S3 / P2 / Alto` | 1) Enlace estricto a `127.0.0.1` (`loopbackOnly`), validación `Origin`, CORS local y rate limiting. 2) Electron con `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. 3) `logger.js` redacta claves sensibles con `[REDACTED]`. 4) `.gitignore` y auditoría `rg` bloquean `.sqlite3`, `.env`, rutas y credenciales. 5) 10 roles `RoleKey` en UI *(pendiente refuerzo RBAC por token en backend si hubiera red multiusuario)*. | `security.test.js`, `T-10`, revisión `electron/main.cjs`, escaneo `rg` | `S2 / P1 / Bajo` |
| `RSK-009` | **Presentación engañosa de resultados de IA o embeddings como diagnóstico** | Mostrar dimensiones latentes opacas (`latent_01..12`), prototipo `17→12`, clusters GMM o salidas del Motor 5 como categorías clínicas validadas o recomendaciones autónomas. | Sesgo de automatización (*automation bias*) llevando a decisiones clínicas no justificadas. | `S3 / P3 / Alto` | 1) Bloqueo de clustering GMM (`D-03`). 2) Etiquetas opacas (`MOD-03`). 3) Aislamiento de `ae_tus_17to12_m3k12` como comparativo experimental sin validación clínica. 4) Taxonomía `E1–E5` + `review_status = 'pending_human_review'` obligatorio + `automatic_diagnosis_disabled = true`. | `AE-02`, `AE-05`, `MOT-02` | `S2 / P1 / Bajo` |
| `RSK-010` | **Textos psicométricos protegidos pendientes o reconstruidos por suposición** | Incorporar ítems inventados en `STAXI-2` (posiciones `50..57`) o en el suplemento conductual de `BSL-23` → invalidez psicométrica e infracción editorial. | Medición inválida e incumplimiento de derechos de reproducción (TEA / PAR). | `S2 / P2 / Medio` | Prohibición de inventar reactivos; banderas explícitas `pendingAuthorizedText: true` y `administrative_framing_verbatim_pending_manual` en `catalog_v1.json` y documentación. | `PSYC-01`, `PSYC-07`, revisión catálogo | `S1 / P1 / Bajo` |
| `RSK-011` | **Riesgos derivados de componentes SOUP y cambios entre versiones** | Actualización no controlada o vulnerabilidad en dependencias (`electron`, `express`, `react`, `@google/genai`, `firebase`) o ruptura de compatibilidad al migrar desde `v1.0.0`. | Falla de arranque, vulnerabilidad local o degradación de bases de datos `v1.0.0`. | `S2 / P2 / Medio` | Control de versiones exactas en `package-lock.json`, inventario SOUP (`SISAP-LC-016`), preservación inmutable de `v1.0.0`/`main` y migraciones aditivas verificadas en BD limpia. | `npm ls --depth=0`, `T-01`, `T-02`, ciclo `init-db` + `health` | `S1 / P1 / Bajo` |
| `RSK-012` | **Riesgo introducido por cambios en `v1.1.0` (desfase entre código nuevo y documentación conceptual previa)** | Documentación heredada (`Python/Dash`, ago 2026) contradice la arquitectura real (`Electron/Node/React`), dificultando auditorías o mantenimiento. | Desalineación operativa, mantenimiento erróneo o declaraciones regulatorias imprecisas. | `S2 / P3 / Medio` | Establecimiento de `docs/lifecycle/` y `docs/modules/` como fuente única de verdad vigente + notas de transición en documentos heredados de `docs/00..10`. | Revisión de consistencia documental (`SISAP-LC-000`, `SISAP-LC-017`) | `S1 / P1 / Bajo` |

---

## 3. Evaluación de Clasificación de Seguridad de Software (IEC 62304 §4.3 + AMD1:2015)

Conforme a IEC 62304 Cláusula 4.3, la clasificación de seguridad (**Clase A**: ningún daño posible; **Clase B**: posible daño no grave; **Clase C**: posible muerte o lesión grave) **no debe asignarse automáticamente**, sino evaluarse antes y después de medidas externas de control de hardware/supervisión, registrando explícitamente cualquier incertidumbre.

### Evaluación Preliminar por Subsistemas de Software

| Subsistema / *Software Item* | Contribución potencial a situación peligrosa (antes de controles) | Evaluación Técnica Preliminar | Justificación y Estado de Decisión |
|---|---|---|---|
| **Centro de Evaluación Psicométrica (`scoringEngine`, `instrumentCatalog`, `psychometricService`)** | Cálculo incorrecto de escalas/inversiones (`BIS-11`, `BSL-23`, `GAD-7`, `EROS`, `BADS`, `STAXI-2`) o alerta conductual omitida puede sesgar el juicio clínico del terapeuta en consulta ambulatoria/residencial. | **Candidato a Clase B** *(sujeto a dictamen regulatorio)* | SISAP no ejecuta terapias ni soporte vital (no provoca daño físico inmediato crítico por sí mismo), pero un puntaje erróneo puede contribuir indirectamente a decisiones terapéuticas subóptimas si el profesional confía en el resumen. **Decisión formal: Pendiente.** |
| **Motor 1 (Autoencoder 22v/24v) y Motor 5 (Soporte `E1–E5`)** | Presentación errónea o engañosa de representaciones latentes o síntesis de formulaciones bajo supervisión humana obligatoria. | **Candidato a Clase B** *(sujeto a dictamen regulatorio)* | Aunque se imponen barreras epistemológicas (`pending_human_review`, no diagnóstico automático), IEC 62304 AMD1:2015 exige considerar la contribución potencial previa a controles puramente operacionales. **Decisión formal: Pendiente.** |
| **Motor 2 (Longitudinal RCI), Motor 3 (Narrativa léxica), Motor 4 (Multimodal)** | Discrepancias estadísticas, conteo léxico o pérdida de trazabilidad multimodal. | **Candidato a Clase B** *(por acoplamiento a síntesis clínica)* | Alimentan la revisión longitudinal del clínico; requieren rigor equivalente en verificación y configuración. **Decisión formal: Pendiente.** |
| **Prototipo confirmatorio `ae_tus_17to12_m3k12` y utilidades CLI / empaquetado (`backup.js`, `seed-fixtures.js`)** | Entorno estrictamente experimental/comparativo o de soporte técnico local sin emisión de recomendaciones clínicas activas. | **Candidato a Clase A** *(si permanece estrictamente aislado del flujo clínico)* | No participa en decisiones clínicas operativas; su fallo no genera daño directo ni indirecto sobre el paciente. |

### Estado Oficial de la Clasificación de Seguridad en `v1.1.0`
- **Estado:** **Pendiente de dictamen regulatorio y clínico formal.**
- **Justificación de cautela:** La determinación vinculante de si SISAP entra bajo regulación de Dispositivo Médico Software (COFEPRIS / NOM-241-SSA1-2025) y si corresponde globalmente a Clase A o Clase B depende de la revisión institucional del Uso Previsto (`SISAP-LC-001`) y de evaluación jurídica sanitaria externa.
- **Postura técnica adoptada entretanto:** De forma conservadora y preventiva, **todos los motores productivos y el Centro Psicométrico se documentan, verifican y trazan aplicando rigor equivalente a Clase B** (requisitos detallados, diseño modular, gestión de riesgos, pruebas de unidad e integración, trazabilidad bidireccional y control SOUP).
