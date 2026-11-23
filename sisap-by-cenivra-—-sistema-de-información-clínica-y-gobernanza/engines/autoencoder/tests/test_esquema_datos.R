# ==============================================================================
# PRUEBA 1: engines/autoencoder/tests/test_esquema_datos.R
# Verificación de esquema y validación D-06 (valores ausentes y fuera de rango
# sin imputación silenciosa)
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

cat("=== EJECUTANDO test_esquema_datos.R ===\n")

registro_valido <- list(
  id_registro = "SYNTH_VALID_001",
  edad = 34,
  tiempo_consumo = 8,
  trat_previos = 2,
  sustancia_principal = "Metanfetamina",
  sexo = "H",
  bis11  = list(modo_captura = "manual_estandar", respuestas = rep(2, 30)),
  bads   = list(respuestas = rep(3, 25)),
  eros   = list(modo_captura = "manual_estandar", respuestas = rep(2, 10)),
  gad7   = list(respuestas = rep(1, 7)),
  staxi2 = list(respuestas = rep(2, 49)),
  bsl23  = list(respuestas = rep(1, 23), respuestas_conductuales = rep(0, 11), general_score_0_1 = 0.65)
)

c1_ok <- leer_registro_app_capa1(registro_valido)
v1_ok <- validar_registro_capa1(c1_ok)
stopifnot(v1_ok$valido == TRUE)
stopifnot(v1_ok$n_incidencias == 0L)
cat("  [PASS] T1.1 Registro sintético completo validado sin incidencias.\n")

reg_sin_edad <- registro_valido
reg_sin_edad$edad <- NA
v_sin_edad <- validar_registro_capa1(leer_registro_app_capa1(reg_sin_edad))
stopifnot(v_sin_edad$valido == FALSE)
stopifnot(any(sapply(v_sin_edad$incidencias, function(x) x$categoria_d06 == "MISSING_REQUIRED_FIELD")))
cat("  [PASS] T1.2 Campo obligatorio ausente (edad=NA) rechazado explícitamente (MISSING_REQUIRED_FIELD).\n")

reg_item_na <- registro_valido
reg_item_na$gad7$respuestas[4] <- NA
v_item_na <- validar_registro_capa1(leer_registro_app_capa1(reg_item_na))
stopifnot(v_item_na$valido == FALSE)
stopifnot(any(sapply(v_item_na$incidencias, function(x) x$categoria_d06 == "MISSING_ITEM_RESPONSE")))
cat("  [PASS] T1.3 Respuesta de ítem ausente en GAD-7 detectada sin convertirse en cero (MISSING_ITEM_RESPONSE).\n")

reg_oor <- registro_valido
reg_oor$gad7$respuestas[7] <- 99
v_oor <- validar_registro_capa1(leer_registro_app_capa1(reg_oor))
stopifnot(v_oor$valido == FALSE)
stopifnot(any(sapply(v_oor$incidencias, function(x) x$categoria_d06 == "OUT_OF_RANGE_VALUE")))
cat("  [PASS] T1.4 Valor fuera de rango (P7=99 en GAD-7) rechazado explícitamente (OUT_OF_RANGE_VALUE).\n")

reg_bio <- registro_valido
reg_bio$edad <- 22
reg_bio$tiempo_consumo <- 30
v_bio <- validar_registro_capa1(leer_registro_app_capa1(reg_bio))
stopifnot(v_bio$valido == FALSE)
cat("  [PASS] T1.5 Inconsistencia temporal (tiempo_consumo > edad) rechazada explícitamente.\n")

cat("=== test_esquema_datos.R COMPLETADO CON ÉXITO ===\n")
