# Índice Maestro de Control Documental y Matriz de Cumplimiento IEC 62304

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-000` |
| **Título** | Índice Maestro de Control Documental y Matriz de Cumplimiento IEC 62304:2006 + AMD1:2015 |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** *(borrador controlado para línea `release/1.1.0`)* |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Ciclo de Vida de Software — Proyecto SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** *(no se asigna aprobación ficticia)* |
| **Marco de referencia** | IEC 62304:2006 + AMD1:2015 (*Medical device software — Software life cycle processes*) · ISO 14971:2019 |
| **Estado declarativo permitido** | **Documentación alineada con IEC 62304 · Desarrollado siguiendo procesos basados en IEC 62304 · Evaluación de conformidad en curso** |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Creación del índice maestro centralizado bajo `docs/lifecycle/` y `docs/modules/` reflejando el stack real de producción `v1.1.0` (Electron + React + Node.js SQLite + R) y el inventario de brechas respecto a `docs/00..15` (Python/Dash, ago 2026). | Equipo de Ingeniería SISAP |

### Documentos Relacionados
- [`SISAP-LC-001` — Evaluación de Aplicabilidad Regulatoria y Uso Previsto](../01_intended_use_and_scope/REGULATORY_SCOPE_AND_INTENDED_USE.md)
- [`SISAP-LC-002` — Plan de Desarrollo de Software v1.1](../02_software_development_plan/SOFTWARE_DEVELOPMENT_PLAN_v1.1.md)
- [`SISAP-LC-015` — Matriz de Trazabilidad Bidireccional](../15_traceability/BIDIRECTIONAL_TRACEABILITY_MATRIX.md)
- [`SISAP-LC-017` — Informe de Estado del Ciclo de Vida de SISAP](../17_lifecycle_reviews/LIFECYCLE_COMPLIANCE_STATUS_REPORT.md)

---

## 1. Política de Control Documental y Fuente Única de Verdad

1. **Estados válidos de documento:** Todo documento controlado adopta exclusivamente uno de cuatro estados: `Borrador`, `En revisión`, `Aprobado` u `Obsoleto`. Ningún documento podrá marcarse como `Aprobado` sin revisión y aceptación explícita registrada de una persona responsable autorizada.
2. **Fuente única de verdad (SSOT) para `v1.1.0`:**
   - Los documentos históricos en `docs/00_intended_use/` a `docs/15_cybersecurity/` (agosto de 2026) documentaron la fase conceptual inicial en **Python / Dash / Flask / SQLAlchemy**. Conservan valor de archivo histórico, pero la especificación arquitectónica, de requisitos, riesgos, trazabilidad y SOUP **vigente para la plataforma operativa `v1.1.0`** (**Electron v45 + React 19 + TypeScript 7 + Vite 8 + Node.js >=22.5 + Express 4.22 + SQLite WAL + R >=4.0**) reside de forma centralizada en `docs/lifecycle/` y `docs/modules/`.
   - Los entregables específicos de verificación científica y psicométrica en `docs/19_autoencoder_verification_and_intelligence_platform/` y `docs/20_psychometric_evaluation_center/` actúan como anexos técnicos enlazados desde los expedientes modulares de `docs/modules/`, evitando duplicación contradictoria.
   - Los documentos de diseño UX y gobernanza regulatoria mexicana (`docs/17_product_interface_design/`, `docs/18_regulatory/`) mantienen su vigencia en su dominio específico y se referencian aquí.
3. **Prohibición de sobreafirmación:** La existencia de estos documentos **no constituye certificación regulatoria ni conformidad demostrada** con IEC 62304, ISO 14971 ni normas sanitarias nacionales (COFEPRIS / NOM-241-SSA1-2025).

---

## 2. Inventario Maestro del Sistema Documental

| Carpeta / Módulo | Código | Documento | Estado Documental | Alcance |
|---|---|---|---|---|
| `docs/lifecycle/00_document_control/` | `SISAP-LC-000` | `DOCUMENT_CONTROL_AND_COMPLIANCE_INDEX.md` | En revisión | Control documental y matriz normativa |
| `docs/lifecycle/01_intended_use_and_scope/` | `SISAP-LC-001` | `REGULATORY_SCOPE_AND_INTENDED_USE.md` | En revisión | Uso previsto, usuarios, límites IA y marco regulatorio |
| `docs/lifecycle/02_software_development_plan/` | `SISAP-LC-002` | `SOFTWARE_DEVELOPMENT_PLAN_v1.1.md` | En revisión | Plan rector de desarrollo IEC 62304 §5.1 |
| `docs/lifecycle/03_requirements/` | `SISAP-LC-003` | `SOFTWARE_REQUIREMENTS_SPECIFICATION_v1.1.md` | En revisión | Especificación de requisitos `REQ-*` §5.2 |
| `docs/lifecycle/04_risk_management/` | `SISAP-LC-004` | `RISK_MANAGEMENT_FILE_v1.1.md` | En revisión | Análisis de peligros `RSK-001..012` y clase A/B/C §4.3, §7 |
| `docs/lifecycle/05_software_architecture/` | `SISAP-LC-005` | `SOFTWARE_ARCHITECTURE_v1.1.md` | En revisión | Arquitectura 15 tablas, APIs, RBAC y diagramas §5.3 |
| `docs/lifecycle/06_detailed_design/` | `SISAP-LC-006` | `DETAILED_DESIGN_OVERVIEW.md` | En revisión | Diseño detallado transversal y mapa de unidades §5.4 |
| `docs/lifecycle/07_implementation/` | `SISAP-LC-007` | `IMPLEMENTATION_AND_UNIT_VERIFICATION.md` | En revisión | Unidades, revisión de código y pruebas unitarias §5.5 |
| `docs/lifecycle/08_verification_and_validation/` | `SISAP-LC-008` | `VERIFICATION_AND_VALIDATION_MASTER_RECORD.md` | En revisión | Plan y estado maestro V&V (ejecutadas vs pendientes) |
| `docs/lifecycle/09_integration_testing/` | `SISAP-LC-009` | `INTEGRATION_TEST_REPORT_v1.1.md` | En revisión | Registro de pruebas de integración §5.6 |
| `docs/lifecycle/10_system_testing/` | `SISAP-LC-010` | `SYSTEM_TEST_REPORT_v1.1.md` | En revisión | Registro de pruebas de sistema, build y BD limpia §5.7 |
| `docs/lifecycle/11_release_and_deployment/` | `SISAP-LC-011` | `RELEASE_DOSSIER_v1.1.0.md` | En revisión | Expediente de liberación y reversión §5.8 |
| `docs/lifecycle/12_maintenance/` | `SISAP-LC-012` | `MAINTENANCE_AND_CHANGE_CONTROL_PROCEDURE.md` | En revisión | Procedimiento de mantenimiento §6 |
| `docs/lifecycle/13_problem_resolution/` | `SISAP-LC-013` | `PROBLEM_RESOLUTION_LOG.md` | En revisión | Proceso §9 y bitácora verificada `PRB-001..006` |
| `docs/lifecycle/14_configuration_management/` | `SISAP-LC-014` | `CONFIGURATION_BASELINE_v1.1.0.md` | En revisión | Línea base Git, SHA-256 modelos y migraciones §8 |
| `docs/lifecycle/15_traceability/` | `SISAP-LC-015` | `BIDIRECTIONAL_TRACEABILITY_MATRIX.md` | En revisión | Matriz bidireccional Requisito ↔ Release |
| `docs/lifecycle/16_supplier_and_SOUP/` | `SISAP-LC-016` | `SOUP_INVENTORY_AND_EVALUATION.md` | En revisión | Inventario SOUP, licencias, riesgos y actualización §8.1.2 |
| `docs/lifecycle/17_lifecycle_reviews/` | `SISAP-LC-017` | `LIFECYCLE_COMPLIANCE_STATUS_REPORT.md` | En revisión | Informe de estado y brechas del ciclo de vida |
| `docs/lifecycle/18_change_history/` | `SISAP-LC-018` | `LIFECYCLE_CHANGE_HISTORY.md` | En revisión | Bitácora de cambios vinculada a commits GitHub |
| `docs/modules/autoencoder/` | `SISAP-MOD-AE-001` | `AUTOENCODER_TECHNICAL_AND_SCIENTIFIC_DOSSIER.md` | En revisión | Expediente científico y técnico del Autoencoder TUS |
| `docs/modules/psychometric_center/` | `SISAP-MOD-PSYC-001` | `PSYCHOMETRIC_CENTER_DETAILED_DESIGN.md` | En revisión | Expediente técnico de los 6 instrumentos y 3 niveles |
| `docs/modules/longitudinal_analytics/` | `SISAP-MOD-LONG-001` | `LONGITUDINAL_ANALYTICS_MODULE.md` | En revisión | Motor 2 (deltas + Jacobson-Truax RCI) |
| `docs/modules/narrative_intelligence/` | `SISAP-MOD-NARR-001` | `NARRATIVE_INTELLIGENCE_MODULE.md` | En revisión | Motor 3 (analizador léxico y compuerta ONNX) |
| `docs/modules/multimodal_integration/` | `SISAP-MOD-MM-001` | `MULTIMODAL_INTEGRATION_MODULE.md` | En revisión | Motor 4 (alineación multimodal 5 fuentes) |
| `docs/modules/decision_support/` | `SISAP-MOD-DSS-001` | `DECISION_SUPPORT_MODULE.md` | En revisión | Motor 5 (`E1–E5`, revisión humana obligatoria) |

---

## 3. Matriz de Evaluación Inicial de Cumplimiento por Cláusula IEC 62304:2006 + AMD1:2015

| Cláusula IEC 62304 | Requisito / Proceso | Estado en `release/1.1.0` | Evidencia / Brecha Principal |
|---|---|---|---|
| **4.1** | Sistema de gestión de calidad | **Parcial** | Procesos documentados en `SISAP-LC-002`; falta sistema de gestión de calidad institucional certificado ISO 13485 fuera del repositorio. |
| **4.2 / 7** | Gestión de riesgos integrada | **Parcial** | Expediente completo `SISAP-LC-004` con 12 riesgos y controles probados; revisión clínica/regulatoria externa pendiente. |
| **4.3** | Clasificación de seguridad del software (A, B, C) | **Parcial** | Pre-evaluación técnica por ítem registrada en `SISAP-LC-004` (candidato Clase B en motores clínicos / A en utilidades); **dictamen formal pendiente**. |
| **4.4** | Software heredado (*Legacy software*, AMD1:2015) | **Parcial** | Captura legada numérica integrada con equivalencia verificada (`PSYC-09`) y artefactos `N=166` encapsulados bajo regresión `P-07`/`P-08`. |
| **5.1** | Planificación del desarrollo (SDP) | **Implementado** | `SISAP-LC-002` alineado al stack real y criterios de entrada/salida. |
| **5.2** | Análisis de requisitos de software (SRS) | **Implementado** | `SISAP-LC-003` con identificadores `REQ-*`, criterios de aceptación y vínculo a pruebas. |
| **5.3** | Diseño arquitectónico | **Implementado** | `SISAP-LC-005` con diagramas reales de componentes, despliegue, BD (15 tablas) y secuencia. |
| **5.4** | Diseño detallado | **Implementado** | `SISAP-LC-006` + 6 expedientes en `docs/modules/*`. |
| **5.5** | Implementación y verificación de unidades | **Implementado** | Pruebas automatizadas Node (`33/33 PASS`) y R (`4/4` unitarias PASS) en `SISAP-LC-007`. |
| **5.6** | Integración y pruebas de integración | **Implementado** | Pruebas extremo a extremo API/DB/Motores/UI compilada en `SISAP-LC-009`. |
| **5.7** | Pruebas del sistema | **Parcial** | `npm test`, `npm run lint`, `vite build` y BD limpia PASS; faltan pruebas formales de usabilidad clínica en campo y compilación final `.exe` `v1.1.0`. |
| **5.8** | Liberación del software | **Parcial** | `SISAP-LC-011` y `RELEASE_NOTES_v1.1.0.md` preparados en `release/1.1.0`; aprobación final y generación de instalador pendientes antes de taguear `v1.1.0`. |
| **6** | Mantenimiento de software | **Implementado** | Procedimiento formal documentado en `SISAP-LC-012` y preservación verificada de `v1.0.0`. |
| **7** | Proceso de gestión de riesgos de software | **Parcial** | Matriz peligro → control → verificación en `SISAP-LC-004` y `SISAP-LC-015`; revisión independiente pendiente. |
| **8** | Gestión de configuración (incluye SOUP §8.1.2) | **Implementado** | `SISAP-LC-014` (Git, SHA-256 de modelos, migraciones) y `SISAP-LC-016` (inventario SOUP desde `package-lock.json`). |
| **9** | Resolución de problemas de software | **Implementado** | `SISAP-LC-013` con flujo de cierre y 6 incidencias históricas reales trazadas (`PRB-001` a `PRB-006`). |
| **C.5–C.7** | Cláusulas exclusivas de Clase C (descomposición exhaustiva a unidad de hardware / auditoría médica certificadora) | **No aplicable (sujeto a clasificación final)** | SISAP se declara software de apoyo clínico bajo supervisión profesional sin actuación física ni soporte vital; si un dictamen regulatorio elevara a Clase C, deberá abrirse expediente específico. |
