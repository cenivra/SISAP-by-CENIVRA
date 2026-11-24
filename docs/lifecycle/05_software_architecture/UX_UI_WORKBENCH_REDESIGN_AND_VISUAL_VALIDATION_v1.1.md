# Rediseño Integral UX/UI de Estación Clínica y Validación Visual — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-005-UX` |
| **Versión del producto** | `1.1.0` (`release/1.1.0`) |
| **Referencia de diseño** | IBM Carbon Productive Workbench + HashiCorp Technical Systems |
| **Resoluciones validadas** | `1440×900` y `1280×800` (Chromium Headless CDP sobre build de producción) |

---

## 1. Propósito del Rediseño

Transformar la interfaz de un tablero genérico de tarjetas KPI hacia una **estación de trabajo clínica, psicométrica y computacional** donde el profesional visualice de forma continua el expediente activo, la completitud de la compuerta `D-06`, la trazabilidad del modelo gobernado y las fronteras epistemológicas `E1–E5`.

---

## 2. Sistema Visual y Arquitectura de Navegación

1. **Tokens y Capas (`src/index.css`):**
   - Superficies técnicas oscuras por defecto (`--fondo: #161616`, `--panel: #1f2023`, `--panel-elev: #26272b`, `--captura: #2c2e33`) y modo claro de alto contraste (`body.claro`), respetando `@media (prefers-reduced-motion: reduce)`.
   - Primitivas estructurales `.wb-surface`, `.wb-surface-elev`, `.wb-eyebrow`, `.wb-metric-cell` y `.tabular-nums` encapsuladas en `@layer components` para preservar prioridad de utilidades Tailwind CSS v4 (ej. `pl-8`/`pl-9` en campos con icono).
2. **Barra Superior, Cinta Contextual y Navegación (`Header.tsx`, `WorkbenchContextRibbon.tsx`, `Sidebar.tsx`, `DesktopStorageModal.tsx`):**
   - `Header.tsx`: barra de una sola línea (`whitespace-nowrap`) con indicador de modo operativo (`EVALUACIÓN` vs `INSTITUCIONAL`), acceso directo a estado SQLite y respaldos de escritorio (`DesktopStorageModal`), conteo de borradores, conmutador de vista clínica/anónima, Drive, métricas y cierre de sesión.
   - `WorkbenchContextRibbon.tsx`: cinta persistente bajo el encabezado con selector rápido de expediente activo (incluyendo expedientes de SQLite), barra segmentada de 6 instrumentos para la compuerta `D-06` (`BIS-11`, `BSL-23`, `GAD-7`, `EROS`, `BADS`, `STAXI-2`), modelo activo gobernado (`encoder_22_checkpoint_fase2`) y saltos directos a captura o motores.
   - `Sidebar.tsx`: 5 secciones jerárquicas (`I. WORKBENCH Y PADRÓN`, `II. CAPTURA CLÍNICA Y PSICOMÉTRICA`, `III. INTELIGENCIA FUNCIONAL Y MODELOS`, `IV. SEGUIMIENTO LONGITUDINAL`, `V. GOBERNANZA, SEGURIDAD Y DATOS`) con filtrado RBAC (`requiresAdmin` en `Modo Admin · Usuarios` y `requiresBlindLayer` en `Capa blindada modelo`).

---

## 3. Rediseño por Módulos Funcionales y Gobernanza

- **Separación de Autenticación (`LoginModal.tsx`, `App.tsx`):** en `Modo Institucional` (y en compilaciones `VITE_SISAP_DISTRIBUTION=institutional`) se ocultan por completo las claves demo, el autocompletado de contraseñas, el generador TOTP en pantalla y los códigos de contingencia (`999111` / `123456`).
- **Central de Trabajo (`WorkDashboardView.tsx`):** estructura de 3 paneles (preparación funcional `D-06` del expediente enfocado + matriz de telemetría local; tabla de expedientes con barra visual `0..6`, filtros `Todos / Apto D-06 (6/6) / Parcial` y buscador; tabla de borradores reanudables).
- **Padrón y Pacientes (`PatientsView.tsx`):** consulta parametrizada SQLite, control estricto de identidad disociada/reidentificación auditada y bitácora de corridas `model_runs` de 8 campos por expediente.
- **Centro Psicométrico y Evaluación Inicial (`PsychometricCenterView.tsx`, `InitialEvaluationView.tsx`):** barra persistente de cobertura `D-06` y sincronización automática con SQLite (`persist: true`) resolviendo `patient_id` por seudónimo sin selección manual de versión del modelo.
- **Ecosistema de Inteligencia (`IntelligenceEcosystemView.tsx`):** eliminación total del `<select>` clínico de modelos; mapa causal interactivo de 5 motores (`M1`..`M5`); panel fijo de los 8 campos obligatorios de trazabilidad criptográfica; matriz epistemológica de 3 columnas en Motor 5 (`E1–E3` observacional/longitudinal, `E4` hipótesis latente gobernada, `E5 / pending_human_review`).
- **Arquitectura, Pesos y Gobernanza Central (`AnalysisModelView.tsx`):** nueva pestaña principal `Gobernanza y Registro Central de Modelos` conectada a `/api/engines/autoencoder/governance` y `/active-model` (editable solo para roles `admin` / `superadmin`, solo lectura para roles clínicos), tabla reciente de `model_runs` de 8 campos, corrección de `STAXI-2` a 49 reactivos en el sandbox y nota técnica explícita diferenciando la matriz lineal `24×12` de la inferencia neuronal SELU de 5 capas.

---

## 4. Evidencia Visual Auditada (`visual_evidence_v1.1.0/`)

Durante la revisión visual directa de capturas se detectaron y corrigieron tres defectos antes de emitir el paquete final:
1. Solapamiento del nombre completo en `Header.tsx` y salto a dos líneas de botones -> corregido con truncado estricto y `whitespace-nowrap`.
2. Solapamiento del icono `<Search />` sobre el texto de entrada por precedencia CSS en `.sisap-input` -> corregido encapsulando `.sisap-*` en `@layer components`.
3. Nombres de campo en la tabla de gobernanza (`input_variables_count`, `architecture_spec`, `disk_integrity.ok`) y recorte horizontal de la 5.ª pestaña en `AnalysisModelView.tsx` -> corregido y revalidado visualmente.

Capturas finales almacenadas en `docs/lifecycle/11_release_and_deployment/visual_evidence_v1.1.0/`:
- `01_login_modo_institucional_1440x900.png`
- `02_workbench_central_de_trabajo_1440x900.png`
- `03_padron_y_expediente_disociado_1440x900.png`
- `04_centro_psicometrico_d06_1440x900.png`
- `05_ecosistema_5_motores_pipeline_1440x900.png`
- `06_motor5_columnas_epistemologicas_1440x900.png`
- `07_gobernanza_central_modelos_1440x900.png`
- `08_workbench_responsive_1280x800.png`
