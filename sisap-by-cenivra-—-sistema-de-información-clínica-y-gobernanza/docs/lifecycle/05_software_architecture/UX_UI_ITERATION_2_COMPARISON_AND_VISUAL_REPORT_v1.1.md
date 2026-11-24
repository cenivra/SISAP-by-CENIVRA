# SISAP v1.1.0 — Reporte Comparativo UX/UI (Segunda Iteración) y Evidencia Visual

**Rama:** `release/1.1.0`  
**Base intacta:** `v1.0.0` (`defbfc4e42f9e7cc78fe334bffbf56d68e5a7945`) · `main` (`ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f`)  
**Alcance:** Transformación de la interfaz de escritorio desde una estructura de dashboard técnico hacia una plataforma de trabajo clínico e inteligencia funcional con separación estricta entre experiencia clínica y administración/gobernanza de modelos.

---

## 1. Cambios principales de UX/UI y Gobernanza

1. **Central de trabajo centrada en la operación clínica (`WorkDashboardView.tsx`)**:
   - Se eliminó el protagonismo de las tarjetas KPI superiores.
   - La vista prioriza: **Expedientes que requieren atención y continuidad** (faltantes basales, borradores abiertos, ausencia de seguimientos), **Borradores sin terminar**, **Expedientes Clínicos Activos** (con filtro `Todos / Incompletos / Completos`) y el panel lateral **Continuidad del caso seleccionado** con acciones directas y un **Resumen del centro** compacto.
2. **Contexto de expediente unificado y chrome ligero (`Header.tsx`, `WorkbenchContextRibbon.tsx`, `Footer.tsx`, `index.css`)**:
   - Barra superior de una sola línea, tipografía sans-serif para textos y encabezados (reservando fuente monoespaciada exclusivamente para códigos `TUS-XXXX`, métricas numéricas y hashes administrativos), bordes suaves y reducción de insignias repetitivas.
   - El contexto persistente muestra en una sola línea `TUS-XXXX · estado`, identidad o modo disociado, sesiones, escalas base (`X/6`), seguimientos, narrativas e integridad, sin exponer `model_id` técnicos al perfil clínico.
3. **Navegación en 3 grupos y separación clínica vs. administrativa (`Sidebar.tsx`, `App.tsx`, `backend/src/routes/index.js`)**:
   - `A. TRABAJO CLÍNICO`: `Central de trabajo`, `Padrón y expedientes`, `Entrevista exploratoria`, `Evaluación inicial`, `Centro psicométrico`, `Nota de evolución`, `Nota de sesión familiar`, `Narrativa semanal`.
   - `B. SEGUIMIENTO Y ANÁLISIS`: `Seguimiento longitudinal`, `Inteligencia funcional`, `Apoyo a decisiones`.
   - `C. ADMINISTRACIÓN Y GOBERNANZA` (oculta y bloqueada por guardia de ruta en frontend + validación RBAC en backend para perfiles clínicos): `Gestión de modelos`, `Arquitectura y artefactos`, `Auditoría`, `Usuarios y permisos`, `Configuración y seguridad`, `Almacenamiento en Drive`, `Mantenimiento SQL`, `Capa blindada modelo`.
   - En `backend/src/routes/index.js`, `POST /api/engines/autoencoder/candidate17/infer` devuelve `403` para roles no administrativos, complementando las restricciones existentes en `/governance/active-model` y `/infer`.
4. **Rediseño de `Inteligencia funcional` (`IntelligenceEcosystemView.tsx`)**:
   - Reemplazo de pestañas técnicas `M1..M5` por 5 preguntas clínicas funcionales: **Representación funcional transversal**, **Evolución longitudinal**, **Procesos narrativos y conductuales**, **Integración de fuentes** y **Apoyo a la formulación clínica**, distinguiendo `Disponible`, `Insuficiente (E5)`, `Proceso pendiente (solo léxico)` y `Revisión humana`.
   - Ocultamiento de selectores técnicos, hashes SHA-256 y detalles internos `model_runs` para perfiles no administrativos (`!roleConfig.administra`), manteniendo la auditoría completa para `admin`/`superadmin`.
5. **Armonización transversal de vistas**:
   - `PatientsView.tsx`: ocultamiento de detalles técnicos `model_runs` / SHA-256 al rol clínico.
   - `PsychometricCenterView.tsx`: corrección de ancho en selector de paciente (`w-[155px] shrink-0 truncate`) para evitar solapamientos a `1366×768` y unificación de botón `Inteligencia funcional`.
   - `InitialEvaluationView.tsx` y `WeeklyNarrativeView.tsx`: encabezados compactos y lenguaje clínico claro.

---

## 2. Comparativa Antes / Después (Evidencia Visual)

| Escenario | Antes (Iteración 1) | Después (Iteración 2) |
|---|---|---|
| Login institucional | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0/01_login_modo_institucional_1440x900.png` | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0_iter2/01_login_modo_institucional_1366x768.png` |
| Central de trabajo (`psicologo`) | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0/02_central_trabajo_clinico_1440x900.png` | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0_iter2/02_central_trabajo_psicologo_1366x768.png` · `03_central_trabajo_psicologo_1920x1080.png` |
| Padrón y expedientes (`psicologo`) | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0/03_padron_expediente_1440x900.png` | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0_iter2/04_padron_expedientes_psicologo_1366x768.png` |
| Centro psicométrico (`psicologo`) | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0/04_centro_psicometrico_1440x900.png` | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0_iter2/05_centro_psicometrico_psicologo_1366x768.png` |
| Inteligencia funcional (`E5` vs con datos) | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0/05_inteligencia_e5_insufficient_1440x900.png` | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0_iter2/06_inteligencia_funcional_E5_psicologo_1366x768.png` · `07_inteligencia_funcional_datos_psicologo_1920x1080.png` |
| Administración: Modelos y Arquitectura (`admin`) | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0/06_gobernanza_modelos_admin_1440x900.png` · `07_simulador_12d_1440x900.png` | `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0_iter2/08_admin_gestion_modelos_1366x768.png` · `09_admin_arquitectura_artefactos_1920x1080.png` |

---

## 3. Lista de Archivos Modificados en Iteración 2

- `src/index.css`
- `src/components/Header.tsx`
- `src/components/WorkbenchContextRibbon.tsx`
- `src/components/Footer.tsx`
- `src/components/Sidebar.tsx`
- `src/App.tsx`
- `src/components/views/WorkDashboardView.tsx`
- `src/components/views/IntelligenceEcosystemView.tsx`
- `src/components/views/PatientsView.tsx`
- `src/components/views/PsychometricCenterView.tsx`
- `src/components/views/InitialEvaluationView.tsx`
- `src/components/views/WeeklyNarrativeView.tsx`
- `backend/src/routes/index.js`
- `e2e/run-chromium-e2e.mjs`

---

## 4. Matriz de Pruebas Visuales y Automatizadas

- **Pruebas visuales en Chromium (`1366×768` y `1920×1080`)**: 9/9 capturas con `overflowX: false` (`scrollWidth === clientWidth`), sin truncamientos ni solapamientos en perfiles `psicologo` y `admin`, tanto en estado `E5_insufficient` como con batería sintética completa (D-06 disponible).
- **`npm run qa:audit`**: 5/5 verificaciones (`SEC-GIT-01`, `SEC-FB-01`, `SEC-SCAN-01`, `SAST-SYNTAX-01`, `INT-AE-SHA`).
- **`npm run lint` (`tsc --noEmit`)**: 0 errores.
- **`npm run test:all`**: 43/43 pruebas unitarias e integración PASS (0 fallos, 0 omitidas).
- **`npm run test:e2e`**: 12/12 flujos Chromium E2E PASS (incluyendo `E2E-08` que verifica explícitamente que `psicologo` no visualiza módulos de administración/modelos y que `admin` sí accede a `Gestión de modelos` y `Arquitectura y artefactos`).

---

## 5. Artefactos Windows `.exe` Recompilados (`npm run dist:win`)

- `dist-electron/SISAP-by-CENIVRA-Setup-1.1.0-x64.exe`  
  - Tamaño: `121,909,736` bytes  
  - SHA-256: `058A326633E6767736FE1D479E349F6D2B8AA69DF85485698D6684469D7B076B`
- `dist-electron/SISAP-by-CENIVRA-Portable-1.1.0-x64.exe`  
  - Tamaño: `110,792,138` bytes  
  - SHA-256: `DE2F94033245226A4274F209D45B925535EABA2290B933E69EECC4F3CC4DDD79`

---

## 6. Pendientes / Observaciones Residuales

1. **Empaquetado ASAR y firma de código**: `electron-builder` reporta `asar usage is disabled` y ausencia de certificado de firma de código Windows (`signing is skipped`).
2. **Motor 3 ONNX narrativo**: permanece explícitamente marcado como `Proceso pendiente (solo léxico)` sin inferencia neuronal automática hasta contar con artefacto ONNX validado.
3. **Verificación interactiva de escritorio**: el lanzamiento desde terminal en modo headless no muestra ventanas GUI al escritorio interactivo del usuario; se recomienda abrir `SISAP-by-CENIVRA-Setup-1.1.0-x64.exe` o `SISAP-by-CENIVRA-Portable-1.1.0-x64.exe` directamente desde el Explorador de Windows para revisión visual final en sesión de escritorio.
