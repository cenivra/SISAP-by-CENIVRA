# Informe de Estado del Ciclo de Vida de SISAP (IEC 62304:2006 + AMD1:2015)

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-017` |
| **Título** | Informe de Estado del Ciclo de Vida y Evaluación de Brechas de SISAP by CENIVRA |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal por Dirección Clínica y Calidad** |
| **Documentos relacionados** | `SISAP-LC-000..018` · `docs/modules/*` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Emisión del informe integral del estado del ciclo de vida conforme a la Sección 15 del requisito transversal IEC 62304. | Equipo de Ingeniería SISAP |

---

## 1. Declaración de Posición Normativa y Alcance
- **Posición exacta de SISAP `v1.1.0` (`release/1.1.0`):** *Desarrollado siguiendo procesos basados en IEC 62304:2006 + AMD1:2015 · Documentación alineada con IEC 62304 · Evaluación de conformidad en curso.*
- **No se declara** certificación regulatoria ni conformidad demostrada definitiva.

---

## 2. Procesos IEC 62304 Aplicables y Matriz de Cumplimiento por Estado

| Proceso / Cláusula IEC 62304 | Estado | Evidencia / Entregables en el Repositorio | Brechas y Plan de Cierre |
|---|---|---|---|
| **§4.1 Sistema de gestión de calidad** | **Parcial** | Procesos técnicos formalizados en `SISAP-LC-000` y `SISAP-LC-002`. | Cerrar SGC institucional formal (revisiones firmadas fuera de Git). |
| **§4.2 / §7 Gestión de riesgos** | **Parcial** | `SISAP-LC-004` con 12 riesgos (`RSK-001..012`), controles verificados y análisis residual. | Realizar sesión formal de revisión clínica/regulatoria independiente y pasar estado a `Aprobado`. |
| **§4.3 Clasificación de seguridad (A/B/C)** | **Parcial** | Pre-evaluación técnica en `SISAP-LC-004` (rigor conservador **Clase B** en motores clínicos / A en utilidades). | Emitir dictamen regulatorio/clínico definitivo sobre aplicabilidad SaMD ante COFEPRIS / NOM-241-SSA1-2025. |
| **§4.4 Software heredado (AMD1:2015)** | **Implementado** | Adaptador de captura numérica legada con equivalencia verificada (`PSYC-09`) y lote histórico R encapsulado (`PRB-006`). | N/A |
| **§5.1 Planificación del desarrollo** | **Implementado** | `SISAP-LC-002` (`SOFTWARE_DEVELOPMENT_PLAN_v1.1.md`). | Pendiente firma de aprobación formal. |
| **§5.2 Requisitos (SRS)** | **Implementado** | `SISAP-LC-003` (`REQ-CORE/AE/PSYC/LONG/NARR/MM/DSS/SEC/PRIV/AVAIL/PERF/UX/INT/TRAC`). | Cerrar ítems parciales de campo/red (`REQ-AE-008`, `REQ-SEC-004`, `REQ-UX-001`). |
| **§5.3 Arquitectura (SAD)** | **Implementado** | `SISAP-LC-005` con 4 diagramas Mermaid actualizados al stack Electron/React/Node/SQLite/R. | Revisar diagrama cuando evolucione a red multiusuario. |
| **§5.4 Diseño detallado** | **Implementado** | `SISAP-LC-006` + 6 expedientes detallados bajo `docs/modules/*`. | Completar enunciados `STAXI-2 50–57` y suplemento `BSL-23` al obtener licencia editorial. |
| **§5.5 Implementación y unidad** | **Implementado** | `SISAP-LC-007` + `33/33 PASS` Node + `4/4` unitarias R `PASS` + `tsc` 0 errores. | Mantener cobertura ante nuevas versiones del catálogo. |
| **§5.6 Integración y pruebas** | **Implementado** | `SISAP-LC-009` + pruebas de integración API/BD/Motores/Psicometría. | N/A |
| **§5.7 Pruebas del sistema** | **Parcial** | `SISAP-LC-010` (`vite build` `2.93s`, BD limpia `15` tablas OK, higiene PHI/rutas limpia). | Ejecutar prueba de usabilidad clínica en campo y prueba de humo sobre el `.exe` NSIS `v1.1.0`. |
| **§5.8 Liberación del software** | **Parcial** | `SISAP-LC-011`, `CHANGELOG.md`, `RELEASE_NOTES_v1.1.0.md` en rama aislada `release/1.1.0` con `v1.0.0` intacto. | Obtener aprobación formal, compilar `.exe` `v1.1.0`, crear tag y publicar borrador cuando se autorice. |
| **§6 Mantenimiento** | **Implementado** | `SISAP-LC-012` con flujo de análisis de impacto, riesgo, regresión y SemVer. | Aplicar ante solicitudes posteriores a `v1.1.0`. |
| **§8 Gestión de configuración y SOUP** | **Implementado** | `SISAP-LC-014` (commits, SHA-256 modelos, migraciones) y `SISAP-LC-016` (inventario SOUP `package-lock.json`). | Auditar periódicamente CVEs de dependencias npm y Node LTS. |
| **§9 Resolución de problemas** | **Implementado** | `SISAP-LC-013` con bitácora cerrada/mitigada `PRB-001..006`. | Mantener registro vivo ante nuevas incidencias. |
| **Trazabilidad bidireccional** | **Implementado** | `SISAP-LC-015` enlazando `REQ ↔ Diseño ↔ Implementación ↔ Riesgo ↔ Control ↔ Prueba ↔ Release`. | N/A |
| **Cláusulas exclusivas Clase C** | **No aplicable** *(Justificado)* | Uso previsto supervisado sin soporte vital ni actuación física directa (`SISAP-LC-001`, `SISAP-LC-004`). | Reabrir únicamente si un dictamen regulatorio clasificase algún módulo como Clase C. |

---

## 3. Inventario de Documentos Existentes vs. Creados vs. Pendientes

- **Documentos heredados de fase conceptual / contextual (`docs/00_..18_`):**
  - `docs/00` a `docs/15`: borrador histórico Python/Dash (agosto 2026) alineado ahora mediante notas de control que remiten a `docs/lifecycle/` como SSOT vigente.
  - `docs/16` a `docs/20`: diseño escritorio, diseño UX/UI, regulación mexicana (`REG-001`, `REG-DOC-DCSA-DICO-001`), verificación Autoencoder (`A..F`) y Centro Psicométrico (`ARQUITECTURA_Y_MATERIALES_CENTRO_PSICOMETRICO.md`).
- **Documentos nuevos creados en esta actividad (25 documentos controlados sin carpetas vacías):**
  - 19 documentos bajo `docs/lifecycle/00` a `18` (`SISAP-LC-000` a `SISAP-LC-018`).
  - 6 expedientes técnicos modulares bajo `docs/modules/*` (`SISAP-MOD-AE-001`, `PSYC-001`, `LONG-001`, `NARR-001`, `MM-001`, `DSS-001`).
- **Documentos o evidencias externas pendientes:**
  - Actas de aprobación formal firmadas por responsables clínicos y de calidad (para promover documentos de `En revisión` a `Aprobado`).
  - Protocolo e informe de pruebas de usabilidad clínica en campo con usuarios previstos (`SISAP-LC-008`).
  - Dictamen regulatorio formal de clasificación sanitaria / SaMD y evidencia de licencia editorial para textos pendientes de `STAXI-2 (50–57)` y suplemento `BSL-23`.

---

## 4. Estado Documental y de Madurez por Motor y Módulo (`v1.1.0`)

| Motor / Subsistema | Expediente Modular | Estado Técnico Real | Estado Documental IEC 62304 | Limitación / Brecha Declarada |
|---|---|---|---|---|
| **Motor 1 — Autoencoder `22v`** (`encoder_22_checkpoint_fase2`) | `SISAP-MOD-AE-001` | **Desarrollado y validado** (SHA-256, `max_diff 1.554e-14` y `0.0000e+0` R↔JS) | **Implementado** (`En revisión`) | Dimensiones opacas `MOD-03`; sin GMM (`D-03`). |
| **Motor 1 — Autoencoder `24v`** (`encoder_24_deployed`) | `SISAP-MOD-AE-001` | **Desarrollado, pendiente de validación externa** | **Implementado** (`En revisión`) | Entrenamiento original sin semilla fija; falta estudio prospectivo externo. |
| **Motor 1 — Prototipo `17v`** (`ae_tus_17to12_m3k12`) | `SISAP-MOD-AE-001` | **Experimental / Confirmatorio aislado** | **Implementado** (`En revisión`) | Sin validación clínica; separado en endpoint `/candidate17/infer`. |
| **Centro de Evaluación Psicométrica** | `SISAP-MOD-PSYC-001` | **Desarrollado y verificado** (`PSYC-01..11` PASS) | **Implementado** (`En revisión`) | Faltan textos autorizados `STAXI-2 (50–57)` y suplemento `BSL-23`; usabilidad en campo pendiente. |
| **Motor 2 — Analítica Longitudinal (RCI)** | `SISAP-MOD-LONG-001` | **Desarrollado y verificado** (`MOT-01..02` PASS) | **Implementado** (`En revisión`) | RCI restringido a escalas con parámetros normativos documentados (`GAD-7`, `BSL-23`, `EROS`, `BADS`). |
| **Motor 3 — Inteligencia Narrativa** | `SISAP-MOD-NARR-001` | **Léxico determinista operativo; ONNX no activo** (`inference_ready: false`) | **Implementado** (`En revisión`) | Sin pesos RoBERTa completos ni binario nativo `onnxruntime-node` en distribución pública. |
| **Motor 4 — Integración Multimodal** | `SISAP-MOD-MM-001` | **Desarrollado y verificado** (`MOT-02` PASS) | **Implementado** (`En revisión`) | — |
| **Motor 5 — Apoyo a Decisiones (`E1–E5`)** | `SISAP-MOD-DSS-001` | **Desarrollado y verificado** (`pending_human_review`, no diagnóstico) | **Implementado** (`En revisión`) | Requiere siempre validación clínica humana. |

---

## 5. Plan de Cierre de Brechas Antes y Después de Liberar `v1.1.0`

| Prioridad | Brecha Identificada | Acción de Cierre | Criterio de Cierre |
|---|---|---|---|
| **Alta (Pre-publicación `v1.1.0`)** | Revisión formal y aprobación de documentos en `En revisión` | Revisar `SISAP-LC-000..018` por responsables clínico y técnico y actualizar columna `Estado` a `Aprobado` en acta de revisión | Registro firmado en `SISAP-LC-017` y `SISAP-LC-011` antes de crear tag `v1.1.0` |
| **Alta (Pre-distribución `.exe`)** | Falta compilación final `.exe` NSIS y firma Authenticode | Ejecutar `npm run dist:win` y prueba de arranque en máquina limpia Windows 10/11 | Instalador generado y verificado; certificado Authenticode si se distribuye externamente |
| **Media (Post-piloto `v1.1.x`)** | Pruebas de usabilidad en campo con personal clínico | Conducir sesión observada con psicólogos/consejeros aplicando los 6 instrumentos en tablet/PC | Informe agregado en `docs/lifecycle/08_verification_and_validation/` |
| **Media (Evolución `v1.1.x` / `v1.2`)** | Textos literales `STAXI-2 (50–57)` y suplemento `BSL-23` | Incorporar enunciados en `catalog_v1.json` una vez validados permisos editoriales TEA/PAR/Bohus | `pendingAuthorizedText: false` y pruebas de regresión `PSYC-03`, `PSYC-07` |
| **Media / Condicional (`v2.0.0` o red)** | RBAC por token HTTP multiusuario y validación externa de `encoder_24` / `17v` | Añadir capa JWT por ruta si abandona modo loopback; ejecutar cohorte de validación externa y dictamen COFEPRIS | Nuevos requisitos `REQ-*`, riesgos revisados y estudio clínico independiente |
