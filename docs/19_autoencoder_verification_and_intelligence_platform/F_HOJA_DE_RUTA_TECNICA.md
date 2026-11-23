# F · Hoja de Ruta Técnica de Corto, Mediano y Largo Plazo

---

## 1. Corto Plazo (Semanas 1–4 · Consolidación Operativa Inmediata)

1. **Validación clínica longitudinal con cohorte local nueva:**
   - Capturar al menos 30 expedientes con batería basal completa de 6 instrumentos (`D-06` estricto) y ≥ 3 sesiones en `follow_up_evaluations`.
   - Evaluar estabilidad longitudinal de residuos `MSE_z` y concordancia clínica de `encoder_22_checkpoint_fase2` frente a `encoder_24_deployed` antes de activar `encoder_24_deployed` como modelo por defecto.
2. **Habilitación de flujo UI de revisión humana (`reviewed_approved` / `reviewed_modified`):**
   - Agregar endpoint `POST /api/patients/:id/formulations/:fid/review` para que supervisores clínicos cierren el ciclo de `pending_human_review` con firma auditable WORM.
3. **Sincronización automática de evaluación inicial hacia `/api/evaluations` + `/api/engines/autoencoder/infer` (`persist: true`):**
   - Conectar creación automática o resolución `pseudonym → patient_id` en el flujo de `InitialEvaluationView` cuando el servidor local SQLite está activo.

---

## 2. Mediano Plazo (Meses 2–4 · Validación Científica y Multimodalidad)

1. **Evaluación externa del candidato `ae_tus_17to12_m3k12` y comparativa contra `PCA-12`:**
   - Recoger cohorte independiente multicéntrica o temporal nueva para decidir formalmente si un autoencoder de 17 variables supera de forma clínicamente relevante al baseline lineal `PCA-12` (`MSE_orig = 9.07` vs `10.76`).
2. **Activación neuronal real del Motor 3 (NLP Clínico):**
   - Exportar o descargar el archivo completo de pesos ONNX/Safetensors cuantizado (~110–440 MB) para `bsc-bio-ehr-es` e integrar `onnxruntime-node` aislado en proceso worker local para extraer embeddings semánticos reales de `q1..q8`.
3. **Parámetros normativos RCI específicos para `BSCS`, `PSS-4`, `SHAPS` y `UCLA-3`:**
   - Incorporar coeficientes `r_xx` y `SD` poblacionales mexicanos / hispanohablantes validados para habilitar `RCI` confiable en toda la batería longitudinal.

---

## 3. Largo Plazo (Meses 5–12 · Inteligencia de Precisión y Gobernanza Avanzada)

1. **Interpretabilidad explicable pos-hoc validada (SHAP / gradientes integrados sobre `latent_01..12`):**
   - Únicamente tras validación psicométrica longitudinal de estabilidad de ejes latentes, exponer mapas de contribución variable→latente en `ReconstructionBarsChart`.
2. **Modelos mixtos longitudinales (LMM) y trayectorias no lineales:**
   - Integrar análisis poblacional anonimizado con curvas latentes por cohorte (respetando anonimización irreversible `TUS-XXXX` y cumplimiento LFPDPPP).
3. **Empaquetado desktop Electron completo con servidor local supervisado:**
   - Automatizar arranque embebido de `backend/src/server.js` al iniciar la aplicación Electron de escritorio con backups cifrados SQLite automáticos.
