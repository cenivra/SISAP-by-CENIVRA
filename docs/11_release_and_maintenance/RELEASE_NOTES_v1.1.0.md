# Notas de Publicación — SISAP by CENIVRA v1.1.0 *(Borrador Preparado en `release/1.1.0`)*

> **Estado:** Borrador oficial preparado para revisión antes de publicar.  
> **Versión histórica preservada:** [`v1.0.0`](https://github.com/cenivra/SISAP-by-CENIVRA/releases/tag/v1.0.0) permanece intacta en el commit `ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f` y su rama `main`.  
> **Rama candidata:** `release/1.1.0`  
> **Tag propuesto tras aprobación:** `v1.1.0`

---

## 1. Novedades Principales

**SISAP by CENIVRA v1.1.0** marca la evolución desde una aplicación de captura clínica básica hacia una **plataforma de inteligencia funcional, analítica y evaluación psicométrica digital**, preservando retrocompatibilidad completa con las bases de datos y flujos de `v1.0.0`:

1. **Centro de Evaluación Psicométrica Digital** con captura reactivo por reactivo para los 6 instrumentos activos del proyecto (`BIS-11`, `BSL-23`, `GAD-7`, `EROS`, `BADS-22` validado y `STAXI-2`).
2. **Motor Integrado del Autoencoder Funcional TUS (`engines/autoencoder/`)** con verificación criptográfica SHA-256, pipeline determinista de 5 capas en JavaScript y R, y visualización de dimensiones latentes e intervalos de reconstrucción.
3. **Ecosistema de 5 Motores de Inteligencia Clínica**: Autoencoder latente 12D, Análisis Longitudinal RCI, Narrativa E1–E5, Integración Multimodal y Soporte a Decisiones bajo revisión humana obligatoria.
4. **Almacenamiento Inmutable en 3 Niveles (`003_psychometric_center.sql`)**: Evaluación, Respuestas Individuales por reactivo y Resultados Versionados.

---

## 2. Funcionalidades Implementadas y Verificadas

### A. Centro de Evaluación Psicométrica
- Formularios digitales adaptables a computadora y tableta ([`PsychometricCenterView.tsx`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/components/views/PsychometricCenterView.tsx)) con nombre, descripción breve, instrucciones originales verificadas, periodo de referencia, barra fija de progreso, filtro de pendientes, navegación por página única o por bloques, guardado en borrador y revisión pre-cierre.
- Catálogo activo desacoplado ([`catalog_v1.json`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/engines/psychometrics/catalog_v1.json)):
  - **BIS-11** (30 reactivos · `v1.0-patton1995-es` y `v1.0-campo-0134`)
  - **BSL-23** (23 reactivos · `v1.0-soler2013` + complementos opcionales para vector 24v)
  - **GAD-7** (7 reactivos · `v1.0-garciacampayo2010`)
  - **EROS** (10 reactivos · `v1.0-barraca2010-proyecto9`, calcula puntaje 10 ítems y modelo 9 ítems sin `EROS7`)
  - **BADS** (22 reactivos · `v22.0-tus-nct07395700`, perfil Activación vs. Disfunción/Evitación + compatibilidad `v25.0-barraca2011`)
  - **STAXI-2** (estructura de 57 posiciones con los 49 reactivos españoles literales TEA Ediciones 2001 y posiciones `50–57` preparadas para texto autorizado PAR)
  - **OCI-R** excluido estrictamente del catálogo activo y rechazado por motor/API.
- Motor automático de puntuación con separación estricta de `rawResponses`, `recodedResponses`, `calculatedScores`, `derivedIndicators` e `interpretations` (sin emitir diagnósticos clínicos).
- Equivalencia matemática verificada (`PSYC-09`) entre captura digital y captura por secuencia numérica legada.

### B. Integración del Autoencoder y Motores de Inteligencia
- Artefactos verificados con SHA-256 en [`engines/autoencoder/`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/engines/autoencoder/models/model_registry.json) y compuerta estricta D-06 sin imputación silenciosa.
- Visualizaciones analíticas incorporadas en el frontend: [`IntelligenceEcosystemView.tsx`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/components/views/IntelligenceEcosystemView.tsx), [`LatentIntervalChart.tsx`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/components/LatentIntervalChart.tsx) y [`ReconstructionBarsChart.tsx`](../../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/src/components/ReconstructionBarsChart.tsx).
- Persistencia longitudinal en `follow_up_evaluations` y formulaciones trazables en `clinical_formulations` (`E1–E5`, revisión humana obligatoria).

---

## 3. Mejoras Arquitectónicas, Correcciones e Interfaz

- **Backend local (`127.0.0.1:8080`, SQLite WAL + claves foráneas)**: Migraciones aditivas `002_intelligence_engines.sql` y `003_psychometric_center.sql` que amplían de 10 a **15 tablas verificadas** manteniendo 100% de compatibilidad hacia atrás.
- **Inmutabilidad histórica**: Las evaluaciones psicométricas cerradas como `completed` no pueden sobrescribirse (`HTTP 409 Conflict`) y los recálculos algorítmicos preservan intactas las respuestas individuales originales.
- **Alertas longitudinales entre versiones**: `GET /api/patients/:id/psychometrics` detecta y advierte automáticamente cuando el historial mezcla versiones distintas de un mismo instrumento (por ejemplo `BADS v22` vs `v25`).
- **Corrección crítica STAXI-2 y BSL-23**: Alineación de reactivos `1..49` de `STAXI-2` con el cuadernillo TEA Ediciones (2001) y `scoring_staxi2.r`, separación garantizada de `EROS` vs `tiempo_consumo`, y denominador corregido (`136`) para el Total Integrado de BSL-23.

---

## 4. Requisitos de Instalación y Compatibilidad

- **Node.js**: `>= 22.5.0` (requerido por `node:sqlite`).
- **npm**: `>= 10.0.0`.
- **R (opcional, para reproducibilidad científica del pipeline Autoencoder)**: `R >= 4.0` con paquete `jsonlite`.
- **Sistema Operativo**: Windows 10/11 (64-bit) para aplicación web o escritorio Electron v45; Linux/macOS compatibles para desarrollo y servidor local.
- **Compatibilidad desde `v1.0.0`**: Totalmente compatible (`MINOR`). No requiere scripts manuales de migración ni pérdida de datos existentes.

---

## 5. Instrucciones de Actualización desde `v1.0.0`

1. Hacer una copia de respaldo de su base local existente (opcionalmente vía `node backend/src/cli/backup.js`).
2. Actualizar el código a la rama/tag `v1.1.0` dentro de `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`:
   ```bash
   npm ci
   npm run build
   ```
3. Verificar migraciones automáticas de SQLite (aplicará `002_intelligence_engines.sql` y `003_psychometric_center.sql` sin alterar tablas ni registros de `001`):
   ```bash
   node backend/src/cli/init-db.js
   node backend/src/cli/health.js
   ```
   *(Debe confirmar `migrationsApplied >= 3`, `tables: 15`, `missingTables: []` y `ok: true`).*
4. Ejecutar verificación integral:
   ```bash
   npm test
   npm run lint
   ```

---

## 6. Limitaciones Conocidas y Contenido Pendiente Declarado

- **Materiales psicométricos protegidos pendientes de texto autorizado**:
  - `STAXI-2` posiciones `50–57` del protocolo estadounidense PAR (1999): marcadas con `pendingAuthorizedText: true` en el catálogo; los reactivos `1..49` de la adaptación española TEA Ediciones (2001) están completos y operativos.
  - `BSL-23` suplemento conductual opcional (`11` ítems): valores `0–4` operativos; enunciados individuales marcados como pendientes de cuadernillo autorizado.
  - `BIS-11` encabezado literal de portada: se utiliza encuadre administrativo neutro sin inventar texto protegido.
- **Motor 3 ONNX**: En el paquete público sin artefacto `.onnx` / binario nativo, reporta estado controlado `degraded_onnx_not_ready` manteniendo activo el analizador léxico clínico y la trazabilidad `E1–E5`.
- **Instalador Windows y Firma Digital**: La compilación `.exe` NSIS (`npm run dist:win`) se genera en el momento del empaquetado final sobre entorno Windows con certificación y permanece `NotSigned` hasta incorporar certificado Authenticode institucional.

---

## 7. Comandos para Publicar el Borrador de Release (Solo cuando se Autorice)

```bash
# 1. Crear tag anotado sobre el commit definitivo de release/1.1.0
git tag -a v1.1.0 -m "SISAP by CENIVRA v1.1.0 - Motores de Inteligencia y Centro Psicométrico Digital"

# 2. Subir rama y tag nuevo (sin tocar main ni v1.0.0)
git push origin release/1.1.0
git push origin v1.1.0

# 3. Crear borrador de release en GitHub CLI (--draft evita publicación pública inmediata)
gh release create v1.1.0 --draft --target release/1.1.0 --title "SISAP by CENIVRA v1.1.0" --notes-file docs/11_release_and_maintenance/RELEASE_NOTES_v1.1.0.md
```
