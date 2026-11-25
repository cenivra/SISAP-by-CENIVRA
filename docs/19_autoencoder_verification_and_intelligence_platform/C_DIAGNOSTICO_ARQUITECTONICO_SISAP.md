# C · Diagnóstico Arquitectónico y de Producto de SISAP

**Alcance:** Auditoría integral de `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza` (React/Vite + Electron + Node `node:http`/`node:sqlite`) previo y posterior a la evolución modular.

---

## 1. Estado Base Previo a la Intervención (Limitaciones Detectadas)

| Dimensión Evaluada | Situación Original Encontrada | Brecha / Riesgo Identificado | Resolución Implementada en esta Fase |
|---|---|---|---|
| **Motor de IA (Autoencoder)** | `autoencoderData.ts` usaba una proyección lineal sintética `24x12` en lugar de las 3 capas SELU reales del `.h5`. `AutoencoderEngine` permitía sobrescribir pesos vía `localStorage` y generaba etiquetas nosológicas no validadas (`Riesgo Neuro-Conductual`). | Desalineación matemática completa con R; riesgo de alteración silenciosa y atribuciones clínicas ilegítimas (`MOD-03`). | Sustituido por `encoder_22_checkpoint_fase2` y `encoder_24_deployed` con Decoder completo, SHA-256 inmutable y dimensiones opacas frente a cuantiles `N=166`. |
| **Captura Psicométrica (`InitialEvaluationView`)** | `STAXI-2` declaraba 44 ítems (faltaban 5 de 49), `EROS` mostraba rango 1–7/70, y `BSL-23` carecía de los 11 ítems conductuales y campo `GENERAL [0–1]`. Se usaba `parseRawNumbers` rellenando huecos con valores por defecto. | Imputación silenciosa prohibida por `D-06` y cálculo incorrecto de `compuesto_bsl` y `STAXI`. | Actualizado a 49 ítems `STAXI-2`, `BSL-23` completo (`23+11+GENERAL`), `sustancia_principal`, `modo_scoring`, y compuerta estricta `validateCompleteEvaluationD06()`. |
| **Seguimiento Longitudinal (`FollowUpScalesView`)** | Solo guardaba estado administrativo (`pendiente` / `completado`) en borradores de `localStorage`; cero puntuaciones cuantitativas longitudinales ni tabla SQL dedicada. | Imposible calcular trayectorias intraindividuales, tasas de cambio o RCI. | Nueva tabla SQLite `follow_up_evaluations` (`002_intelligence_engines.sql`), endpoint `/api/follow-ups` y captura cuantitativa para 7 escalas. |
| **Backend (`model_runs` y Motor A/B)** | `modelRunService.js` y el servidor estaban declarados explícitamente como "motores desactivados" para registrar fallos; `bsc-bio-ehr-es/modelo.onnx` (1.38 MB) sin pesos completos ni `onnxruntime-node`. | Pantalla visual sin procesamiento real en backend y corpus longitudinal en `exportLongitudinalTrainingCorpus()` con cifras fijas falsas (`18.4, 42, 11`). | Habilitados 5 servicios backend reales + paridad Node ESM en `engines/autoencoder/`; corpus longitudinal computa medias reales y Motor 3 declara honestamente estado ONNX usando léxico determinista `E1..E5`. |
| **Persistencia y Privacidad** | Base SQLite `001_initial_schema.sql` robusta (`WORM audit_events` con hash encadenado, solo loopback `127.0.0.1`), pero frontend guardaba mayoritariamente en `localStorage` cuando operaba autónomamente. | Sincronización dual incompleta entre UI clínica y backend SQLite. | Cliente `PatientApiService` ampliado con endpoints de inteligencia manteniendo respaldo local en navegador sin romper modo offline/Electron. |
| **Roles, Seguridad y Escalabilidad** | `LoopbackOnly`, `verifyOrigin`, rate limiting `100 req/min`, pseudonimización `TUS-XXXX` y triggers WORM SQLite verificados (`15/15` tests). | Extensible solo agregando nuevas migraciones SQL y servicios en capas. | Migración `002` incremental preservando `001` intacta; separación limpia `engines/` independiente del framework UI. |

---

## 2. Evaluación Crítica de Capacidad Analítica (Antes vs. Ahora)

- **Pantallas que ya tenían respaldo real:** Padrón y creación transaccional de pacientes (`patients`, `clinical_records`), búsqueda parametrizada SQL, prevención de duplicados, bitácora WORM encadenada por SHA-256, cálculo cliente de `BIS-11` / `GAD-7` / `BADS`.
- **Pantallas que eran parcialmente simuladas o desconectadas:** Simulador Autoencoder (usaba pesos lineales sintéticos y clasificación heurística), Exportación de Corpus Longitudinal (promedios estáticos falsos), Seguimiento de Escalas (solo estado administrativo).
- **Evolución ejecutada:** Cada visualización analítica introducida (`LatentIntervalChart`, `ReconstructionBarsChart`, trayectorias longitudinales con RCI Jacobson-Truax, extracción léxica `E1–E5`, matriz multimodal y comparador geométrico L2/coseno) opera sobre cálculo verificable de extremo a extremo.
