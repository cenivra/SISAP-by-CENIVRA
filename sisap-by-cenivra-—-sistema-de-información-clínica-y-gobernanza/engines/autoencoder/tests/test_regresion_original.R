# ==============================================================================
# PRUEBA 5: engines/autoencoder/tests/test_regresion_original.R
# Prueba de regresión extremo a extremo sobre las 166 observaciones del Excel
# canónico comparando contra matriz 166x24 y representaciones_completas.csv (166x12)
# ==============================================================================

resolver_engine_dir <- function() {
  env_d <- Sys.getenv("SISAP_ENGINE_DIR", unset = "")
  if (nzchar(env_d) && dir.exists(env_d)) return(normalizePath(env_d, winslash = "/"))
  if (file.exists("inference/Autoencoder_TUS_estratificacion_APP.R")) return(normalizePath(".", winslash = "/"))
  if (file.exists("../inference/Autoencoder_TUS_estratificacion_APP.R")) return(normalizePath("..", winslash = "/"))
  if (file.exists("engines/autoencoder/inference/Autoencoder_TUS_estratificacion_APP.R")) return(normalizePath("engines/autoencoder", winslash = "/"))
  stop("No se localizó el directorio engines/autoencoder")
}

base_dir <- resolver_engine_dir()
Sys.setenv(SISAP_ENGINE_DIR = base_dir)
source(file.path(base_dir, "inference/Autoencoder_TUS_estratificacion_APP.R"), encoding = "UTF-8")
cargar_modulos_pipeline_app(base_dir)

cat("=== EJECUTANDO test_regresion_original.R ===\n")

ruta_excel <- Sys.getenv("SISAP_EXCEL_CANONICO", unset = "")
if (!nzchar(ruta_excel) || !file.exists(ruta_excel)) {
  cat("  [INFO] Defina SISAP_EXCEL_CANONICO para ejecutar la regresión contra el archivo Excel completo.\n")
} else {
  res_lote_22 <- ejecutar_pipeline_lote_excel_canonico(
    ruta_excel = ruta_excel,
    base_dir = base_dir,
    modelo_objetivo = "encoder_22_checkpoint_fase2",
    modo_regresion_historica_166 = TRUE
  )
  stopifnot(nrow(res_lote_22$matriz_preprocesada_24) == 166L)
  stopifnot(ncol(res_lote_22$matriz_preprocesada_24) == 24L)
  stopifnot(nrow(res_lote_22$dimensiones_latentes_12) == 166L)
  stopifnot(ncol(res_lote_22$dimensiones_latentes_12) == 12L)
  stopifnot(all(is.finite(as.matrix(res_lote_22$dimensiones_latentes_12))))
  cat("  [PASS] T5.1 Lote de 166 observaciones del Excel canónico procesado sin errores (166x24 -> 166x12).\n")

  ruta_ref_24 <- Sys.getenv("SISAP_REF_PREPROC_CSV", unset = "")
  if (nzchar(ruta_ref_24) && file.exists(ruta_ref_24)) {
    ref_24 <- as.matrix(read.csv(ruta_ref_24)[, colnames(res_lote_22$matriz_preprocesada_24)])
    obs_24 <- as.matrix(res_lote_22$matriz_preprocesada_24)
    max_diff_24 <- max(abs(obs_24 - ref_24))
    cat(sprintf("  [INFO] Max abs diff preprocesamiento 166x24: %.3e\n", max_diff_24))
    stopifnot(max_diff_24 < 1e-12)
    cat("  [PASS] T5.2 Reproducción exacta 166x24 verificada (< 1e-12).\n")
  }

  ruta_ref_12 <- Sys.getenv("SISAP_REF_LATENTS_CSV", unset = "")
  if (nzchar(ruta_ref_12) && file.exists(ruta_ref_12)) {
    df_12 <- read.csv(ruta_ref_12)
    cols_dim <- paste0("Dim", 1:12)
    ref_12 <- as.matrix(df_12[, cols_dim])
    obs_12 <- as.matrix(res_lote_22$dimensiones_latentes_12)
    max_diff_12 <- max(abs(obs_12 - ref_12))
    cat(sprintf("  [INFO] Max abs diff latentes 166x12: %.3e\n", max_diff_12))
    stopifnot(max_diff_12 < 1e-6)
    cat("  [PASS] T5.3 Reproducción exacta 166x12 contra representaciones_completas.csv verificada (< 1e-6).\n")
  }
}

cat("=== test_regresion_original.R COMPLETADO CON ÉXITO ===\n")
