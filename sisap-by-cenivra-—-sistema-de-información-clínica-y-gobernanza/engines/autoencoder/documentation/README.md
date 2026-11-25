# Motor Autoencoder Transversal TUS — Artefactos Integrados en SISAP

**Versión de integración:** `1.0.0-SISAP-20261123`  
**Origen científico:** Proyecto *Estratificación Funcional Transversal en TUS* (`Analisis para la app` y `Analisis en R Fase Transversal`).  
**Propósito:** Proveer a SISAP-by-CENIVRA el pipeline completo verificable en 5 capas (lectura y validación estricta D-06, puntuación psicométrica, variables derivadas, preprocesamiento determinista con parámetros congelados de cohorte `N = 166` e inferencia + reconstrucción Autoencoder 12D) desacoplado de la ubicación original de Google Drive y libre de datos clínicos identificables.

---

## Estructura Modular

```text
engines/autoencoder/
├── documentation/       Informes de auditoría, comparación confirmatoria y limitaciones
├── embeddings/          Analizador geométrico del espacio latente (percentiles, distancias, reconstrucción)
├── evaluation/          Mapa de variables/transformaciones y métricas de validación confirmatoria
├── inference/           Orquestador R + módulos R/01..07 + motor determinista Node.js ESM
├── models/              Pesos JSON verificados por SHA-256, percentiles 12D y registro de modelos
├── preprocessing/       Parámetros fijos congelados de la cohorte canónica (N = 166)
├── schemas/             Contratos formales de entrada y salida (JSON)
└── tests/               Suite de pruebas automatizadas en R (esquema, scoring, preproc, latentes, regresión)
```

---

## Modelos Registrados y Estado de Validación

| `model_id` | Arquitectura | Entrada | Estado de desarrollo y validación | Archivo de pesos |
| :--- | :--- | :---: | :--- | :--- |
| `encoder_22_checkpoint_fase2` | `22 → 32 (selu) → 24 (selu) → 12 (linear) → 24 (selu) → 32 (selu) → 22 (linear)` | 22 vars | **VERIFICADO_EXACTO** (reproduce `representaciones_completas.csv` `166×12` con error máx. `1.79 × 10⁻⁷`, `r = 1.000000`) | `models/pesos_autoencoder_22_completo.json` |
| `encoder_24_deployed` | `24 → 32 (selu) → 24 (selu) → 12 (linear) → 24 (selu) → 32 (selu) → 24 (linear)` | 24 vars | **DESARROLLADO, PENDIENTE DE VALIDACIÓN EXTERNA** (reentrenado sobre 24 vars sin semilla fija) | `models/pesos_autoencoder_24_completo.json` |
| `ae_tus_17to12_m3k12` | `17 → 24 (selu) → 12 (linear) → 24 (selu) → 17 (linear)` | 17 vars | **PROTOTIPO CONFIRMATORIO (5-fold CV, sin validación clínica)** (`R²_orig = 0.847`, `r_dist = 0.857`, fold 1 sem 4) | `models/pesos_candidato_17_m3k12.json` |

---

## Salvaguardas Clínicas y Epistemológicas (`MOD-02`, `MOD-03`, `ONT-11`, `D-06`)

1. **Sin imputación silenciosa (`D-06`):** En inferencia individual, cualquier valor ausente (`NA`/`null`), no finito o fuera de rango de captura bloquea la inferencia (`status = "failed"`) antes de llegar al modelo.
2. **Representaciones opacas (`MOD-03` / `ONT-11`):** Las dimensiones `latent_01..latent_12` y el error de reconstrucción (`MSE_z`) **no constituyen diagnósticos clínicos, rasgos psicológicos ni categorías de riesgo**, y **no están acoplados a clustering GMM (`clustering_incluido = false`)**.
3. **Separación `EROS` vs `tiempo_consumo`:** `EROS_raw`, `tiempo_consumo_raw` y `edad_raw` se mantienen separados; `tiempo_consumoEROS` se asigna determinísticamente por trazabilidad histórica sin duplicar preguntas al usuario.
4. **Licencia y privacidad:** Sujeto a la licencia del repositorio principal (`LICENSE` / `NOTICE`). Ningún registro clínico individual ni archivo identificable forma parte de este directorio.
