# ==============================================================================
# PRUEBA 2: engines/autoencoder/tests/test_scoring_escalas.R
# Verificación de reglas de puntuación por instrumento, preservación de ítems
# crudos y separación entre EROS y tiempo de consumo (Sección 4 y 5, D-01)
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

cat("=== EJECUTANDO test_scoring_escalas.R ===\n")

items_bis_test <- rep(1:4, length.out = 30)
res_bis_man <- puntuar_bis11_capa2(items_bis_test, modo = "manual_estandar")
stopifnot(identical(as.numeric(res_bis_man$items_raw), as.numeric(items_bis_test)))
stopifnot(res_bis_man$items_scored[1] == (5 - items_bis_test[1]))
stopifnot(res_bis_man$items_scored[2] == items_bis_test[2])
cat("  [PASS] T2.1 BIS-11 conserva items_raw sin sobrescribirlos con items_scored ni subescalas.\n")

items_bads_test <- rep(2, 25)
res_bads <- puntuar_bads_capa2(items_bads_test)
stopifnot(res_bads$subescalas$activation == 7 * 2)
stopifnot(res_bads$subescalas$avoidance  == 8 * 2)
stopifnot(res_bads$subescalas$work       == 5 * 2)
stopifnot(res_bads$subescalas$social     == 5 * 2)
stopifnot(res_bads$totales$total_bads_invertido == 86)
cat("  [PASS] T2.2 BADS separa subescalas directas, ítems invertidos y total general.\n")

items_eros_test <- c(4, 1, 4, 4, 1, 1, 1, 4, 1, 4)
res_eros_exc <- puntuar_eros_capa2(items_eros_test, modo = "excel_canonico")
res_eros_man <- puntuar_eros_capa2(items_eros_test, modo = "manual_estandar")
stopifnot(res_eros_exc$totales$eros_total_activo == 25)
stopifnot(res_eros_man$totales$eros_total_activo == 40)
cat("  [PASS] T2.3 EROS documenta y separa suma directa del Excel (25) vs inversión manual de Barraca (40).\n")

ruta_ref <- file.path(base_dir, "preprocessing/parametros_referencia_completos.json")
ref_params <- cargar_parametros_referencia(ruta_ref)

reg_a <- list(
  id_registro = "SYNTH_EROS_A", edad = 30, tiempo_consumo = 12, trat_previos = 1, sustancia_principal = "Alcohol",
  bis11 = list(modo_captura = "excel_canonico", respuestas = rep(2, 30)),
  bads  = list(respuestas = rep(2, 25)),
  eros  = list(modo_captura = "excel_canonico", respuestas = rep(1, 10)),
  gad7  = list(respuestas = rep(1, 7)),
  staxi2 = list(respuestas = rep(2, 49)),
  bsl23 = list(respuestas = rep(1, 23), respuestas_conductuales = rep(0, 11), general_score_0_1 = 0.5)
)
reg_b <- reg_a
reg_b$eros$respuestas <- rep(4, 10)

c3_a <- ejecutar_variables_derivadas_capa3(ejecutar_scoring_capa2(leer_registro_app_capa1(reg_a)), ref_params)
c3_b <- ejecutar_variables_derivadas_capa3(ejecutar_scoring_capa2(leer_registro_app_capa1(reg_b)), ref_params)

stopifnot(c3_a$separacion_eros_tiempo_consumo$EROS_raw == 10)
stopifnot(c3_b$separacion_eros_tiempo_consumo$EROS_raw == 40)
stopifnot(c3_a$separacion_eros_tiempo_consumo$tiempo_consumo_raw == 12)
stopifnot(c3_b$separacion_eros_tiempo_consumo$tiempo_consumo_raw == 12)
stopifnot(c3_a$separacion_eros_tiempo_consumo$EROS_tiempo_consumo_derivado == 12)
stopifnot(c3_b$separacion_eros_tiempo_consumo$EROS_tiempo_consumo_derivado == 12)
cat("  [PASS] T2.4 Cambiar las respuestas de EROS no altera tiempo_consumo ni tiempo_consumoEROS.\n")

cat("=== test_scoring_escalas.R COMPLETADO CON ÉXITO ===\n")
