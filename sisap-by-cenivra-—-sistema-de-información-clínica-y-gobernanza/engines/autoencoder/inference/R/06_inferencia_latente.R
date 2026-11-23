# ==============================================================================
# MÓDULO: R/06_inferencia_latente.R
# CAPA 5: INFERENCIA LATENTE DE 12 DIMENSIONES (D-03, D-04, D-07, D-08)
# Proyecto: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# Fecha: 24 de octubre de 2026
# ==============================================================================
# Responsabilidad:
#   - Ejecutar el pase hacia adelante (forward pass) del encoder profundo de 3 capas
#     (Input -> Dense(32, selu) -> Dense(24, selu) -> Dense(12, linear)) usando los
#     pesos extraídos y verificados por SHA-256 de los artefactos HDF5 originales.
#   - Separar estrictamente la inferencia latente de 12 dimensiones de cualquier
#     etapa posterior de clustering (GMM 2 vs 3 clases) o reglas clínicas (D-03).
#   - Verificar la integridad criptográfica (SHA-256) de los pesos antes de
#     ejecutar cualquier inferencia (D-07).
# ==============================================================================

HASHES_MODELOS_OFICIALES <- list(
  encoder_24_deployed          = "598313c683529d60f9e957ea521b97cb66f6cf391a7edaee106f0b65dc129cfe",
  encoder_22_checkpoint_fase2  = "fc82dd7f7fbc87f3b45fd4455b2a8011cca5451c6f1eb64b82ddda005c77151f"
)

#' Función de activación SELU exacta de Keras/TensorFlow
#' @param x Matriz o vector numérico
selu_keras <- function(x) {
  alpha <- 1.6732632423543772848170429916717
  scale <- 1.0507009873554804934193349852946
  ifelse(x > 0, scale * x, scale * alpha * (exp(x) - 1.0))
}

#' Cargar y verificar pesos del encoder desde el artefacto JSON verificado
#' @param ruta_pesos_json Ruta al archivo JSON con los pesos extraídos del .h5
#' @param ruta_h5_original Ruta opcional al archivo .h5 binario para verificar su SHA-256 directo
cargar_encoder_verificado <- function(ruta_pesos_json, ruta_h5_original = NULL) {
  if (!file.exists(ruta_pesos_json)) {
    stop(sprintf("[CAPA 5 ERROR] No se encontró el archivo de pesos: %s", ruta_pesos_json))
  }
  if (!requireNamespace("jsonlite", quietly = TRUE)) {
    stop("[CAPA 5 ERROR] Se requiere 'jsonlite' para cargar los pesos verificados.")
  }

  w <- jsonlite::fromJSON(ruta_pesos_json, simplifyVector = TRUE)
  if (!w$sha256 %in% unlist(HASHES_MODELOS_OFICIALES)) {
    stop(sprintf("[CAPA 5 ERROR DE INTEGRIDAD D-07] El hash SHA-256 registrado (%s) no pertenece a un modelo oficial autorizado.", w$sha256))
  }

  if (!is.null(ruta_h5_original) && file.exists(ruta_h5_original)) {
    hash_bin <- calcular_sha256_archivo(ruta_h5_original)
    if (hash_bin != w$sha256) {
      stop(sprintf(
        "[CAPA 5 ERROR DE INTEGRIDAD D-07] El binario HDF5 (%s) no coincide con el hash esperado (%s).",
        hash_bin, w$sha256
      ))
    }
  }

  n_in <- as.integer(w$n_input)
  W1 <- matrix(as.numeric(w$encoder_1_kernel), nrow = n_in, ncol = 32L)
  b1 <- as.numeric(w$encoder_1_bias)
  W2 <- matrix(as.numeric(w$encoder_2_kernel), nrow = 32L, ncol = 24L)
  b2 <- as.numeric(w$encoder_2_bias)
  Wb <- matrix(as.numeric(w$bottleneck_kernel), nrow = 24L, ncol = 12L)
  bb <- as.numeric(w$bottleneck_bias)

  list(
    model_id = if (n_in == 24L) "encoder_24_deployed" else "encoder_22_checkpoint_fase2",
    sha256_h5 = w$sha256,
    n_input = n_in,
    architecture = w$architecture,
    W1 = W1, b1 = b1,
    W2 = W2, b2 = b2,
    Wb = Wb, bb = bb
  )
}

#' Ejecutar inferencia latente de 12 dimensiones (Capa 5)
#' @param obj_capa4 Objeto devuelto por ejecutar_preprocesamiento_capa4()
#' @param modelo_verificado Objeto devuelto por cargar_encoder_verificado()
ejecutar_inferencia_capa5 <- function(obj_capa4, modelo_verificado) {
  n_in <- modelo_verificado$n_input
  X <- if (n_in == 24L) obj_capa4$matriz_entrada_24 else obj_capa4$matriz_entrada_22
  orden_esperado <- if (n_in == 24L) ORDEN_CANONICO_24 else ORDEN_CANONICO_22

  # Validación 8 (Sección 7.3): Dimensionalidad y orden exactos antes del forward pass
  if (!is.matrix(X) || ncol(X) != n_in) {
    stop(sprintf(
      "[CAPA 5 ERROR] Dimensionalidad inválida: el modelo espera %d columnas pero recibió %d.",
      n_in, if (is.matrix(X)) ncol(X) else -1L
    ))
  }
  if (!identical(colnames(X), orden_esperado)) {
    stop("[CAPA 5 ERROR] El orden o los nombres de las columnas no coinciden con el contrato del encoder.")
  }
  if (any(!is.finite(X))) {
    stop("[CAPA 5 ERROR] La matriz de entrada contiene valores NA, NaN o Inf.")
  }

  # Pase hacia adelante exacto de las 3 capas Dense (Dropout inactivo en inferencia):
  # Capa 1: Dense(32, activation = "selu")
  h1_lin <- sweep(X %*% modelo_verificado$W1, 2, modelo_verificado$b1, "+")
  h1     <- selu_keras(h1_lin)

  # Capa 2: Dense(24, activation = "selu")
  h2_lin <- sweep(h1 %*% modelo_verificado$W2, 2, modelo_verificado$b2, "+")
  h2     <- selu_keras(h2_lin)

  # Capa 3 (Bottleneck): Dense(12, activation = "linear")
  z_mat  <- sweep(h2 %*% modelo_verificado$Wb, 2, modelo_verificado$bb, "+")

  nombres_latentes <- sprintf("latent_%02d", 1:12)
  colnames(z_mat) <- nombres_latentes
  vec_lat <- as.numeric(z_mat[1, ])
  names(vec_lat) <- nombres_latentes

  list(
    capa = "CAPA_5_INFERENCIA_LATENTE",
    status = "completed",
    registro_id = obj_capa4$id_registro,
    timestamp_utc = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
    model_id = modelo_verificado$model_id,
    model_sha256 = modelo_verificado$sha256_h5,
    n_input_features = n_in,
    dimensions = as.list(vec_lat),
    vector_latente_12d = vec_lat,
    matriz_latente_12d = z_mat,
    capa4_preservada = obj_capa4
  )
}
