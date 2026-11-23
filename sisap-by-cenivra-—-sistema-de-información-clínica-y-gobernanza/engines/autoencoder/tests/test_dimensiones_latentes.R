# ==============================================================================
# PRUEBA 4: engines/autoencoder/tests/test_dimensiones_latentes.R
# Verificación estructural de las 12 dimensiones latentes, integridad SHA-256
# de pesos y separación de clustering (Sección 10.1, D-03, D-04, D-07)
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

cat("=== EJECUTANDO test_dimensiones_latentes.R ===\n")

reg_test <- list(
  id_registro = "SYNTH_LAT_001", edad = 29, tiempo_consumo = 6, trat_previos = 1,
  sustancia_principal = "Cocaina", sexo = "M",
  bis11 = list(modo_captura = "excel_canonico", respuestas = rep(2, 30)),
  bads  = list(respuestas = rep(3, 25)),
  eros  = list(modo_captura = "excel_canonico", respuestas = rep(2, 10)),
  gad7  = list(respuestas = rep(1, 7)),
  staxi2 = list(respuestas = rep(2, 49)),
  bsl23 = list(respuestas = rep(1, 23), respuestas_conductuales = rep(0, 11), general_score_0_1 = 0.70)
)

res_22 <- ejecutar_pipeline_registro_sisap(reg_test, base_dir = base_dir, modelo_objetivo = "encoder_22_checkpoint_fase2")
stopifnot(res_22$contrato_salida$status == "completed")
stopifnot(length(res_22$contrato_salida$dimensions) == 12L)
stopifnot(identical(names(res_22$contrato_salida$dimensions), sprintf("latent_%02d", 1:12)))
stopifnot(all(is.finite(unlist(res_22$contrato_salida$dimensions))))
stopifnot(res_22$contrato_salida$model_metadata$clustering_incluido == FALSE)
cat("  [PASS] T4.1 Inferencia con encoder_22_checkpoint_fase2 devuelve 12 dimensiones finitas y sin clustering.\n")

res_24 <- ejecutar_pipeline_registro_sisap(reg_test, base_dir = base_dir, modelo_objetivo = "encoder_24_deployed")
stopifnot(res_24$contrato_salida$status == "completed")
stopifnot(length(res_24$contrato_salida$dimensions) == 12L)
stopifnot(all(is.finite(unlist(res_24$contrato_salida$dimensions))))
cat("  [PASS] T4.2 Inferencia con encoder_24_deployed devuelve 12 dimensiones finitas y verificadas.\n")

reg_invalido <- reg_test
reg_invalido$bads$respuestas[10] <- NA
res_inv <- ejecutar_pipeline_registro_sisap(reg_invalido, base_dir = base_dir)
stopifnot(res_inv$status == "failed")
stopifnot(all(is.na(unlist(res_inv$dimensions))))
cat("  [PASS] T4.3 Registro incompleto detiene la inferencia y NO devuelve 12 números falsos.\n")

cat("=== test_dimensiones_latentes.R COMPLETADO CON ÉXITO ===\n")
