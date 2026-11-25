# LIMITACIONES DEL CANDIDATO A (M3-k12) — v0.1.0

1. **No es validación clínica.** Reconstrucción y estabilidad son propiedades estadísticas; no hay validez diagnóstica, pronóstica ni utilidad terapéutica demostradas.
2. **Reconstrucción inferior a PCA-12 en escala original** (MSE bootstrap: A 10.78 [9.72, 11.80] vs PCA 9.07 [7.96, 10.16]). El AE no supera a la referencia lineal.
3. **Ejes latentes no reproducibles entre semillas** (congruencia Hungarian ≈ 0.14; control de azar 0.03). La **geometría** sí es reproducible (r_dist 0.857), pero **Z01–Z12 no deben interpretarse ni compararse por eje** entre versiones/entrenamientos.
4. **n = 166**, un solo dataset, sin partición externa independiente; la confirmación usó CV 5-fold con semillas 4–6.
5. **Modelo de un solo fold** (sem4/fold1): entrenado con el 80 % de la muestra. No se reentrenó con todos los datos (no autorizado). Un prototipo debe documentar esta diferencia.
6. **Incertidumbre no estimada** (`uncertainty = null`).
7. **Métricas condicionadas a la matriz 166×17 y al preprocesamiento robusto**; otro escalamiento cambia la representación (el experimento log1p lo demuestra: B pierde su ventaja al volver a escala original).
8. **Casos extremos**: id 87 (patrones anómalos de captura) e id 71 (auxiliar dudoso) permanecen en la muestra; su error de reconstrucción es mayor y se documenta.
9. **No usar** para: diagnóstico, cribado, decisiones de tratamiento, predicción de recaídas, asignación de recursos, comunicación a pacientes.
10. **Compatibilidad de runtime**: verificada en TF 2.21.0/Keras 3.15.1. Cualquier otro runtime requiere prueba de equivalencia numérica antes de usarse.
