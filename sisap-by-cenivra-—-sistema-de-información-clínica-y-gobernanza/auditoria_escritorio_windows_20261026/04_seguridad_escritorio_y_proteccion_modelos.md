# 04. Seguridad de la Aplicación de Escritorio y Protección de Modelos

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha:** 26 de octubre de 2026  
**Identificador:** SISAP-DESK-AUD-20261026-04  

---

## 1. Controles de seguridad en Electron

La integración de Electron se diseñó conforme a las guías oficiales de seguridad de Electron (Electron Security Best Practices):

### 1.1 Configuración de `webPreferences`
En `electron/main.cjs`:
- `nodeIntegration: false`: Impide que el código del renderer (React/Vite) tenga acceso a APIs de Node.js como `require`, `process`, `fs` o `child_process`.
- `contextIsolation: true`: Ejecuta los scripts de preload en un contexto de JavaScript completamente aislado del contexto de la página web, previniendo ataques de escalamiento o prototipado malicioso.
- `sandbox: true`: Aplica el mecanismo de arena (*sandbox*) del sistema operativo a nivel de proceso de renderizado.
- `webSecurity: true`: Mantiene activas todas las políticas de origen del navegador.

### 1.2 Restricción de navegación y apertura de ventanas externas
Para evitar que un atacante redireccione la ventana de SISAP o cargue contenido web arbitrario:
- **`will-navigate`:** Intercepta cualquier intento de navegación hacia dominios externos a `http://127.0.0.1:8080/` o `http://localhost:3000/`. Si un enlace apunta a una URL externa, se previene la navegación y se abre en el navegador web predeterminado del sistema operativo mediante `shell.openExternal()`.
- **`setWindowOpenHandler`:** Cualquier llamada a `window.open()` con `target="_blank"` es denegada (`action: 'deny'`) y dirigida de forma segura a `shell.openExternal()`.

### 1.3 Preload mínimo y validación IPC
El archivo `electron/preload.cjs` no expone ninguna función destructiva. Expone exclusivamente el objeto inmutable `window.sisapDesktop` con:
- `isDesktop: true`
- `platform: process.platform`
- `openExternal(url)` (validando esquema http/https en el main process)
- `getBackendInfo()` (devolviendo información contextual sin secretos)
- `closeApp()`

---

## 2. Estado de los autoencoders y protección contra ingeniería inversa

### 2.1 Desactivación estricta de inferencia clínica
Conforme a las directrices éticas y metodológicas de SISAP:
- **Motor A (Narraciones DCSA Multihead):** Desactivado en `WeeklyNarrativeView.tsx`. Los envíos devuelven un mensaje explícito de auditoría y no ejecutan procesamiento en caliente.
- **Motor B (Escalas canónicas 24→12):** Desactivado en `InitialEvaluationView.tsx`. La variable `autoencoderInference` se mantiene en `undefined`. Se calculan las subescalas psicométricas y el vector canónico de entrada, pero no se ejecuta proyección latente para diagnóstico clínico.

### 2.2 Auditoría de pesos de modelos (Vulnerabilidad R-05)
- En `src/data/autoencoderData.ts` reside la matriz de proyección `ENCODER_PROJECTION_WEIGHTS`.
- **Diagnóstico:** Al compilarse el frontend con Vite, los pesos estáticos quedan incluidos en el bundle de JavaScript (`dist/assets/index-*.js`).
- **Estado de mitigación:** Durante la fase actual de escritorio, los pesos se mantienen únicamente para propósitos de referencia estructural y no se emplean para diagnóstico.
- **Acción requerida para fase clínica:** La matriz de pesos y la lógica de normalización deben trasladarse al backend local protegido (`backend/src/services/modelInferenceService.js`), exponiendo únicamente un endpoint de cálculo bajo autenticación y firma de sesión clínica.
