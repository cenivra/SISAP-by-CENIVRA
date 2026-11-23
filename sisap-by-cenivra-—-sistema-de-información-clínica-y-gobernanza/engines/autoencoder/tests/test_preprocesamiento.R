# ==============================================================================
# PRUEBA 3: engines/autoencoder/tests/test_preprocesamiento.R
# Verificación de orden de contrato, no-recalculo de parámetros por paciente,
# prevención de doble normalización adicional en GAD-7 (D-02) y determinismo
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

cat("=== EJECUTANDO test_preprocesamiento.R ===\n")

ruta_ref <- file.path(base_dir, "preprocessing/parametros_referencia_completos.json")
ref_params <- cargar_parametros_referencia(ruta_ref)

reg_test <- list(
  id_registro = "SYNTH_PREPROC_001", edad = 33.3777108433735, tiempo_consumo = 11.25, trat_previos = 2.11265060240964,
  sustancia_principal = "Metanfetamina",
  bis11 = list(modo_captura = "excel_canonico", respuestas = rep(2, 30)),
  bads  = list(respuestas = rep(2, 25)),
  eros  = list(modo_captura = "excel_canonico", respuestas = rep(3, 10)),
  gad7  = list(respuestas = c(1, 1, 1, 1, 1, 1, 2)),
  staxi2 = list(respuestas = rep(2, 49)),
  bsl23 = list(respuestas = rep(1, 23), respuestas_conductuales = rep(1, 11), general_score_0_1 = 0.654096385542169)
)

c1 <- leer_registro_app_capa1(reg_test)
c2 <- ejecutar_scoring_capa2(c1)
c3 <- ejecutar_variables_derivadas_capa3(c2, ref_params)
c4 <- ejecutar_preprocesamiento_capa4(c3, ref_params, aplicar_winsor_ref = TRUE)

stopifnot(abs(c4$vector_preprocesado_24["edad"]) < 1e-12)
stopifnot(abs(c4$vector_preprocesado_24["tiempo_consumo"]) < 1e-12)
stopifnot(abs(c4$vector_preprocesado_24["BSL_23BSL_general"]) < 1e-12)
cat("  [PASS] T3.1 Valores en la media de referencia producen exactamente Z = 0.0 sin recalcular parámetros.\n")

stopifnot(identical(names(c4$vector_preprocesado_24), ORDEN_CANONICO_24))
stopifnot(identical(names(c4$vector_preprocesado_22), ORDEN_CANONICO_22))
stopifnot(length(c4$vector_preprocesado_24) == 24L)
stopifnot(length(c4$vector_preprocesado_22) == 22L)
cat("  [PASS] T3.2 Orden y longitud del vector de 24 y 22 variables coinciden con el contrato.\n")

c3_desordenado <- c3
c3_desordenado$vector_pre_normalizacion_24 <- sample(c3$vector_pre_normalizacion_24)
c4_reordenado <- ejecutar_preprocesamiento_capa4(c3_desordenado, ref_params, aplicar_winsor_ref = TRUE)
stopifnot(identical(c4$vector_preprocesado_24, c4_reordenado$vector_preprocesado_24))
cat("  [PASS] T3.3 Capa 4 selecciona y ordena por nombre de contrato (inmune a permutaciones de entrada).\n")

gad_z_intermedio <- (8.0 - 7.4) / 5.853773711604051
gad_z_final_esp  <- (gad_z_intermedio - 0.1169053303240972) / 1.008350286438533
stopifnot(abs(c3$variables_derivadas$GAD_7GAD_zscore_intermedio - gad_z_intermedio) < 1e-12)
stopifnot(abs(c4$vector_preprocesado_24["GAD_7GAD_zscore"] - gad_z_final_esp) < 1e-12)
cat("  [PASS] T3.4 Transformación de GAD-7 (D-02) verificada de extremo a extremo sin duplicación en inferencia.\n")

cat("=== test_preprocesamiento.R COMPLETADO CON ÉXITO ===\n")
