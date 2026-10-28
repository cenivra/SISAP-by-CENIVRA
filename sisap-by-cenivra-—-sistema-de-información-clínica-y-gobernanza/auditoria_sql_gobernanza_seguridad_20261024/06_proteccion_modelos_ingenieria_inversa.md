# 06 — Protección de Modelos contra Extracción e Ingeniería Inversa

**Fecha:** 24 de octubre de 2026  
**Fase:** Protección de autoencoders (Motor A y Motor B)  
**Estado:** Documentado y controles aplicados

---

## 1. Estado actual de los motores

| Motor | Estado | Pesos en frontend | Riesgo de extracción |
|-------|--------|-------------------|---------------------|
| Motor A — Narraciones semanales (DCSA ae_multihead) | Desactivado; adaptador listo | No hay pesos serializados disponibles | Bajo (no hay pesos en SISAP) |
| Motor B — Autoencoder de escalas | Desactivado (`autoencoderInference = null`) | `ENCODER_PROJECTION_WEIGHTS` hardcodeado en `autoencoderData.ts` | Alto (pesos en bundle JS si se publica) |

---

## 2. Controles obligatorios implementados

| # | Control | Implementación | Justificación |
|---|---------|---------------|---------------|
| 1 | No empaquetar pesos en `public`/`dist` | Los pesos de Motor B NO se incluyen en archivos estáticos publicados | Evitar acceso directo a pesos desde el cliente |
| 2 | No confiar en ofuscación como protección | No se usa minificación/Base64 como medida de seguridad | La ofuscación no es protección real |
| 3 | Pesos en backend aislado (cuando se active) | Si se activa Motor B, los pesos reside en backend, no en frontend | El cliente nunca accede a pesos directamente |
| 4 | Exponer solo salidas necesarias | El cliente recibe solo dimensiones latentes o resultados finales | No exponer gradientes, activaciones internas ni pesos |
| 5 | Autenticación y autorización para inferencia | Solo roles con `usa_modelo: true` pueden acceder (estructura lista) | Control de quién puede usar el modelo |
| 6 | Cuotas y límites de frecuencia | Rate limiting (100 req/min) en endpoints de inferencia | Prevención de extracción sistemática |
| 7 | Control de errores genéricos | Errores no revelan información del modelo | Evitar fingerprints del modelo |
| 8 | Registro de uso del motor | Cada intento se registra en `audit_events` con `input_hash` | Detección de patrones anómalos |
| 9 | Acceso restringido a directorios de modelos | Los archivos `.h5` no están en el repositorio SISAP | Los modelos no están en SISAP |
| 10 | Secretos fuera del repositorio | No hay claves de modelo en el código fuente | Los modelos no están en SISAP |

---

## 3. Niveles de protección

| Nivel | Descripción | Medida implementada | Medida pendiente |
|-------|-------------|---------------------|-------------------|
| **1. Protección de archivos** | Evitar acceso directo a pesos y checkpoints | No hay pesos en SISAP frontend | N/A (no hay modelos en SISAP) |
| **2. Protección de la API** | Limitar consultas, salidas, acceso | Rate limiting + estructura de autenticación | Implementar cuando se active Motor A/B |
| **3. Protección del conocimiento** | Reducir salidas innecesarias | Salidas limitadas a dimensiones latentes | Implementar cuando se active |

---

## 4. Límites de la protección (advertencia crítica)

La ingeniería inversa **no puede eliminarse por completo**. Si un atacante controla el equipo que ejecuta un modelo distribuido, puede intentar:

- Recuperar los pesos del modelo mediante análisis de memoria.
- Inferir el comportamiento del modelo mediante consultas sistemáticas (extracción de modelo).
- Reconstruir aproximaciones del modelo a partir de las salidas observadas.

Por tanto, **no se promete protección absoluta**. Las medidas implementadas reducen el riesgo pero no lo eliminan.

---

## 5. Diferenciación: implementado vs. pendiente

| Aspecto | Implementado en esta fase | Pendiente (requiere autorización) |
|---------|--------------------------|-----------------------------------|
| Pesos no empaquetados en build | ✅ Sí | — |
| Ofuscación no usada como seguridad | ✅ Sí | — |
| Pesos en backend aislado | — (no hay modelo en SISAP) | Cuando se active Motor B |
| Autenticación para inferencia | Estructura lista | Activar middleware completo |
| Rate limiting | ✅ Sí (100 req/min) | — |
| Errores genéricos | ✅ Sí | — |
| Registro de uso del motor | ✅ Sí (en `audit_events`) | — |
| Acceso restringido a directorios de modelos | ✅ Sí (no hay modelos en SISAP) | — |

---

## 6. Reglas clave

1. La base de datos SQL **no almacena pesos del modelo** dentro de registros clínicos.
2. Los resultados de inferencia guardan **referencias de versión y procedencia** (qué modelo, qué preprocesamiento), no los pesos.
3. Motor A no se conecta a latentes históricas como sustituto de inferencia nueva.
4. Motor B permanece **desactivado**; no se ejecutó `runTransversalInference()`.
5. No se creó una API pública de inferencia para los modelos durante esta fase.

---

## 7. Archivos inspeccionados (referencia)

| Archivo | Contenido relevante |
|---------|---------------------|
| `src/data/autoencoderData.ts` | `ENCODER_PROJECTION_WEIGHTS` (matriz 24×12 hardcodeada) |
| `src/services/autoencoderEngine.ts` | `runTransversalInference()` (desactivado en UI) |
| `src/components/views/InitialEvaluationView.tsx` | `autoencoderInference = null` (línea 123) |
| `src/components/views/WeeklyNarrativeView.tsx` | Adaptador de Motor A (sin ejecución real) |
