# SISAP by CENIVRA

# Software Release and Maintenance Plan

**Documento:** Software Release and Maintenance Plan  
**Identificador:** SISAP-RMP-001  
**Versión:** 1.0  
**Estado:** Borrador controlado  
**Fecha:** Agosto 2026  
**Producto:** SISAP by CENIVRA  
**Plataforma:** Python / Dash  
**Responsable:** Psic. Lauro Gutiérrez Castro

---

# Control del documento

| Campo | Valor |
|---|---|
| Documento | Software Release and Maintenance Plan |
| Identificador | SISAP-RMP-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Persistencia inicial | SQLite / SQLAlchemy |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 |

---

# 1. Propósito

Este documento establece el proceso para:

- preparar una versión de SISAP para liberación;
- verificar que una versión está lista para ser liberada;
- identificar exactamente la configuración liberada;
- documentar anomalías conocidas;
- registrar la autorización de liberación;
- mantener versiones liberadas;
- recibir y analizar problemas;
- controlar modificaciones;
- actualizar modelos;
- actualizar dependencias;
- reevaluar riesgos;
- ejecutar pruebas de regresión;
- y retirar versiones obsoletas.

El documento integra dos etapas relacionadas:

```text
DESARROLLO
    ↓
VERIFICACIÓN
    ↓
RELEASE
    ↓
OPERACIÓN
    ↓
MAINTENANCE
    ↓
NUEVA RELEASE
```

La estructura se basa en los procesos de liberación y mantenimiento descritos en IEC 62304:2006+AMD1:2015.

---

# 2. Alcance

Este plan aplica a:

- versiones de SISAP by CENIVRA;
- código fuente;
- configuraciones;
- modelos ML;
- reglas clínicas;
- esquemas de base de datos;
- dependencias;
- documentación;
- artefactos de prueba;
- y modificaciones posteriores a la liberación.

Aplica desde la preparación de una primera versión controlada hasta su mantenimiento y eventual retiro.

---

# 3. Principios de liberación y mantenimiento

## 3.1 Ninguna release sin evidencia

Una versión no deberá liberarse únicamente porque funcione técnicamente.

Debe existir evidencia de:

```text
Requisitos
+
Implementación
+
Verificación
+
Integración
+
System Testing
+
Riesgo
+
Configuración
```

## 3.2 Configuración identificable

Cada release deberá identificar todos los elementos relevantes utilizados para generarla.

## 3.3 No modificar releases publicadas

Una release liberada no deberá modificarse silenciosamente.

Las correcciones deberán generar una nueva versión.

## 3.4 Cambios controlados

Todo cambio posterior deberá evaluarse antes de ser incorporado.

## 3.5 Mantenimiento proporcional al impacto

La cantidad de verificación requerida dependerá del impacto del cambio.

## 3.6 Modelos como componentes controlados

Un cambio de modelo ML deberá tratarse como un cambio de software controlado, no como una simple sustitución de archivo.

---

# 4. Estados del software

SISAP utilizará los siguientes estados:

```text
DEVELOPMENT
     ↓
VERIFICATION
     ↓
VALIDATION
     ↓
RELEASE CANDIDATE
     ↓
RELEASED
     ↓
MAINTENANCE
     ↓
DEPRECATED
     ↓
RETIRED
```

No deberá utilizarse un software en producción antes de estar en estado `RELEASED`.

---

# 5. Tipos de release

## 5.1 Development Build

Versión utilizada durante desarrollo.

No autorizada para producción.

## 5.2 Verification Build

Versión utilizada para verificación.

## 5.3 Release Candidate

Versión candidata a liberación.

Debe encontrarse congelada respecto de cambios funcionales durante las pruebas finales, salvo cambios controlados.

## 5.4 Production Release

Versión autorizada para el entorno correspondiente.

## 5.5 Maintenance Release

Versión posterior destinada a correcciones o cambios controlados.

---

# 6. Identificación de releases

Cada release tendrá un identificador único.

Ejemplo:

```text
SISAP by CENIVRA v0.1.0
SISAP by CENIVRA v0.2.0
SISAP by CENIVRA v1.0.0
```

El software deberá identificarse independientemente de:

```text
Model Version
Configuration Version
Database Schema Version
Dependency Version
```

---

# 7. Versionado semántico

Cuando sea apropiado se utilizará:

```text
MAJOR.MINOR.PATCH
```

## MAJOR

Cambios incompatibles o modificaciones importantes del sistema.

## MINOR

Nueva funcionalidad compatible.

## PATCH

Corrección de defectos sin cambios funcionales sustanciales.

El versionado semántico será una convención de identificación, no un sustituto del control formal de configuración.

---

# 8. Identificación completa de una release

Una release deberá poder describirse mediante:

```text
Software Version
+
Model Version
+
Clinical Configuration Version
+
Database Schema Version
+
Dependency Set
+
Test Baseline
```

Ejemplo:

```text
Software:
0.2.0

Model:
ML-2026.04

Clinical Configuration:
CC-0.2

Database:
DB-03

Dependencies:
requirements.lock

Test Baseline:
ST-BL-02
```

---

# 9. Release Configuration Record

Cada release deberá generar un registro de configuración.

Ejemplo:

```text
RELEASE-0.2.0

Software:
SISAP by CENIVRA 0.2.0

Source Commit:
abcdef123456

Model:
ML-2026.04

Configuration:
CC-0.2

Database Schema:
DB-03

Python:
3.x

Dependency Set:
requirements.lock

Test Baseline:
ST-BL-02
```

---

# 10. Preparación de una release

Antes de crear una Release Candidate deberán completarse:

```text
Requirements
      ↓
Implementation
      ↓
Unit Verification
      ↓
Integration Testing
      ↓
System Testing
      ↓
Risk Review
      ↓
Configuration Freeze
      ↓
Release Candidate
```

---

# 11. Criterios de entrada para Release Candidate

Una versión podrá convertirse en Release Candidate cuando:

- los requisitos aplicables estén implementados;
- las pruebas unitarias estén completadas;
- las pruebas de integración estén completadas;
- las pruebas de sistema requeridas estén ejecutadas;
- los defectos críticos estén resueltos;
- los riesgos hayan sido revisados;
- la configuración pueda identificarse;
- los modelos estén identificados;
- y exista documentación suficiente.

---

# 12. Configuration Freeze

Antes de una liberación se establecerá un estado de congelamiento.

Esto significa que la configuración candidata queda identificada.

Debe incluir:

```text
Source Code
Model
Configuration
Database Schema
Dependencies
Documentation
Tests
```

Después del congelamiento, cualquier modificación deberá generar una nueva evaluación.

---

# 13. Verificación previa a la release

Antes de liberar se revisarán:

```text
Unit Tests
Integration Tests
System Tests
Regression Tests
Security Tests
Risk Controls
```

Los resultados deberán cumplir los criterios establecidos.

---

# 14. Anomalías conocidas

Una release deberá documentar las anomalías conocidas.

Ejemplo:

```text
ANOM-001

Description:
Certain report rendering behavior occurs under
specific browser configuration.

Impact:
No identified clinical effect.

Risk assessment:
Acceptable / Pending

Decision:
Release allowed with monitoring.
```

Las anomalías no deberán ocultarse para permitir una liberación.

---

# 15. Clasificación de anomalías

Las anomalías podrán clasificarse como:

```text
CRITICAL
MAJOR
MINOR
TRIVIAL
```

La clasificación definitiva deberá considerar:

- impacto funcional;
- seguridad;
- integridad;
- datos;
- riesgo clínico;
- y reproducibilidad.

---

# 16. Criterios de bloqueo de release

Una release deberá bloquearse cuando exista:

```text
Critical Safety Issue
Unresolved Critical Defect
Invalid Clinical Result
Unverified Risk Control
Unknown Configuration
Unverified Model
```

cuando cualquiera de estos impida cumplir los criterios definidos.

---

# 17. Evaluación de anomalías residuales

Antes de autorizar una release deberá revisarse si existen anomalías residuales.

Para cada una:

```text
Anomaly
 ↓
Impact
 ↓
Risk
 ↓
Acceptability
 ↓
Decision
```

La decisión deberá quedar registrada.

---

# 18. Risk Review antes de release

Antes de la liberación deberán revisarse:

- riesgos nuevos;
- riesgos modificados;
- controles afectados;
- cambios en modelos;
- cambios de configuración;
- cambios de dependencias;
- anomalías.

---

# 19. Model Review antes de release

Cuando una release incluya un modelo ML nuevo o modificado deberán verificarse:

```text
Model ID
Model Version
Artifact Integrity
Input Schema
Preprocessing
Normalization
Validation Metrics
Compatibility
Known Limitations
```

---

# 20. Dependencias antes de release

Deberá comprobarse:

```text
Python Version
Dash Version
Flask Version
SQLAlchemy Version
ML Framework
Scientific Libraries
```

Los cambios relevantes deberán ser evaluados.

---

# 21. Software Release Record

Cada release tendrá un registro formal.

Plantilla:

```text
==================================================
SISAP RECOVER AI — SOFTWARE RELEASE RECORD
==================================================

Release ID:
RELEASE-0.2.0

Software:
SISAP by CENIVRA

Software Version:
0.2.0

Model:
ML-2026.04

Clinical Configuration:
CC-0.2

Database Schema:
DB-03

Dependency Set:
requirements.lock

Source Commit:
________________

Environment:
________________

Test Baseline:
________________

System Tests:
PASS / FAIL

Risk Review:
PASS / FAIL

Known Anomalies:
________________

Open Problems:
________________

Configuration Verified:
YES / NO

Documentation Complete:
YES / NO

Release Decision:
APPROVED / REJECTED

Authorized By:
________________

Date:
________________
```

---

# 22. Release Checklist

Antes de aprobar una release:

```text
[ ] Requirements reviewed
[ ] Unit verification complete
[ ] Integration testing complete
[ ] System testing complete
[ ] Regression complete
[ ] Security review complete where applicable
[ ] Risk review complete
[ ] Model version identified
[ ] Configuration identified
[ ] Dependencies identified
[ ] Known anomalies documented
[ ] Open problems assessed
[ ] Documentation complete
[ ] Release package identified
[ ] Authorization recorded
```

---

# 23. Autorización de release

La liberación deberá contar con una decisión explícita.

Estados:

```text
APPROVED
REJECTED
APPROVED WITH CONDITIONS
```

Cuando exista aprobación condicionada deberá documentarse la condición.

---

# 24. Release Artifact

Cada release deberá generar un conjunto identificable de artefactos.

Conceptualmente:

```text
release/
├── application/
├── models/
├── configuration/
├── documentation/
├── tests/
└── release_record/
```

---

# 25. Integridad de artefactos

Los artefactos relevantes podrán identificarse mediante hashes.

Ejemplo:

```text
Model:
SHA-256 = ...

Application:
SHA-256 = ...
```

Esto permitirá detectar sustituciones o modificaciones posteriores.

---

# 26. Promoción entre entornos

Las versiones deberán promoverse:

```text
Development
      ↓
Verification
      ↓
Validation
      ↓
Production
```

No se permitirá copiar manualmente una versión diferente durante la promoción sin actualizar la configuración correspondiente.

---

# 27. Mantenimiento

El mantenimiento comienza después de la liberación de una versión.

El proceso será:

```text
Problem / Change Request
        ↓
Analysis
        ↓
Impact Assessment
        ↓
Risk Assessment
        ↓
Modification
        ↓
Verification
        ↓
Integration
        ↓
System Testing
        ↓
Release
```

IEC 62304 contempla el mantenimiento como un proceso específico posterior al desarrollo y establece que los cambios deben analizarse, implementarse y verificarse conforme corresponda.

---

# 28. Fuentes de problemas de mantenimiento

Los problemas podrán provenir de:

- usuarios;
- pruebas;
- monitoreo;
- seguridad;
- modelos;
- dependencias;
- infraestructura;
- bases de datos;
- requisitos nuevos;
- o cambios clínicos.

---

# 29. Clasificación de cambios

Los cambios podrán clasificarse:

```text
CLASS 1
Correction / trivial

CLASS 2
Functional modification

CLASS 3
Clinical-impacting modification

CLASS 4
Safety-impacting modification

CLASS 5
Model / algorithm modification
```

La clasificación determinará el nivel de revisión y pruebas requerido.

---

# 30. Análisis de impacto

Todo cambio deberá analizar:

```text
Requirements
Architecture
Software Units
Interfaces
Models
Configuration
Risks
Tests
Documentation
```

Ejemplo:

```text
Change:
Risk threshold

Affected:
Risk Engine
Alert Engine
Dashboard
Reports
Risk Analysis
System Tests
```

---

# 31. Cambio de modelo ML

Un cambio de modelo requiere:

```text
New Model ID / Version
+
Artifact Integrity
+
Input Compatibility
+
Preprocessing Check
+
Validation
+
Integration Testing
+
System Testing
+
Risk Review
+
Release
```

No se permitirá:

```text
replace_model.h5
```

como procedimiento completo de actualización.

---

# 32. Cambio de normalización

Un cambio en parámetros de normalización deberá analizar:

- modelos afectados;
- resultados afectados;
- casos de prueba;
- riesgo;
- compatibilidad.

---

# 33. Cambio de umbral

Un cambio en un umbral clínico deberá analizar:

```text
Risk
Alert
Dashboard
Reports
Longitudinal Results
```

y ejecutar las pruebas correspondientes.

---

# 34. Cambio de dependencia

Una actualización de:

```text
Python
Dash
Flask
SQLAlchemy
TensorFlow
PyTorch
scikit-learn
```

deberá evaluarse según su impacto.

---

# 35. Cambio de base de datos

Una modificación del esquema deberá generar:

```text
Migration
Verification
Data Integrity Test
Integration Test
Regression
```

---

# 36. Corrección de defectos

Una corrección deberá seguir:

```text
Problem
 ↓
Root Cause / Analysis
 ↓
Fix
 ↓
Unit Test
 ↓
Regression
 ↓
Integration
 ↓
System Test when required
```

---

# 37. Revisión de riesgos después de cambios

Después de un cambio deberá determinarse si:

```text
Existing Risk
Unchanged
Modified
New
```

La evaluación deberá quedar registrada.

---

# 38. Reutilización de pruebas

Las pruebas existentes deberán reutilizarse cuando sigan siendo válidas.

Los casos afectados deberán actualizarse.

---

# 39. Regresión

La selección de pruebas de regresión estará determinada por el análisis de impacto.

Como mínimo, se considerará:

```text
Directly affected component
Dependent components
Safety-related components
End-to-end workflow
```

---

# 40. Release de mantenimiento

Una corrección liberada tendrá una nueva versión.

Ejemplo:

```text
0.5.0
   ↓
0.5.1
```

y deberá generar un nuevo Release Record.

---

# 41. Hotfix

Podrá existir un procedimiento para correcciones urgentes cuando una situación requiera una respuesta rápida.

El hotfix deberá:

- identificarse;
- documentarse;
- evaluarse;
- probarse;
- y posteriormente integrarse con la línea principal de desarrollo.

La urgencia no elimina la necesidad de trazabilidad.

---

# 42. Rollback

Cuando una release presente problemas graves podrá ejecutarse un rollback.

La estrategia deberá considerar:

```text
Software Version
Model Version
Configuration
Database Compatibility
Clinical Data
```

No deberá ejecutarse un rollback que genere incompatibilidad con datos ya almacenados sin evaluación.

---

# 43. Compatibilidad retrospectiva

Antes de retirar una versión se deberá determinar:

```text
Historical Results
Historical Reports
Database Schema
Model Outputs
```

y cómo serán tratados.

---

# 44. Retiro de modelos

Un modelo podrá pasar a:

```text
DEPRECATED
```

antes de:

```text
RETIRED
```

Durante `DEPRECATED` podrá permanecer disponible para interpretar resultados históricos cuando sea necesario, pero no deberá utilizarse para nuevas operaciones de producción cuando haya sido formalmente sustituido.

---

# 45. Retiro de software

Una versión podrá retirarse por:

- obsolescencia;
- vulnerabilidad;
- incompatibilidad;
- sustitución;
- cambio regulatorio;
- cambio arquitectónico;
- o decisión institucional.

---

# 46. Proceso de retiro

```text
Retirement Decision
       ↓
Impact Analysis
       ↓
Replacement
       ↓
Data Review
       ↓
Archive
       ↓
Access Control
       ↓
Retirement
```

---

# 47. Conservación histórica

Los resultados históricos deberán conservar, cuando corresponda:

```text
Software Version
Model Version
Configuration Version
Assessment ID
Timestamp
```

Esto permitirá determinar qué versión produjo un resultado.

---

# 48. Mantenimiento de datos

Las operaciones de mantenimiento deberán evitar:

- modificación silenciosa;
- pérdida de integridad;
- eliminación no autorizada;
- ruptura de referencias.

---

# 49. Seguridad durante mantenimiento

Las actualizaciones deberán evaluarse respecto de:

- vulnerabilidades;
- cambios de dependencias;
- exposición de datos;
- autenticación;
- autorización;
- y componentes de terceros.

---

# 50. Gestión de vulnerabilidades

Cuando una vulnerabilidad afecte una dependencia:

```text
Vulnerability
 ↓
Affected Component
 ↓
Impact Assessment
 ↓
Risk Assessment
 ↓
Patch / Mitigation
 ↓
Verification
 ↓
Release
```

---

# 51. Gestión de problemas posteriores a release

Cada problema deberá tener:

```text
Problem ID
Release
Component
Description
Severity
Safety Impact
Root Cause
Correction
Test
Status
```

---

# 52. Problem States

```text
OPEN
UNDER_ANALYSIS
CONFIRMED
FIX_IN_PROGRESS
FIXED
RETEST
CLOSED
REJECTED
DEFERRED
```

---

# 53. Registros de mantenimiento

Los registros deberán conservar:

```text
Change ID
Problem ID
Affected Version
New Version
Impact Assessment
Risk Review
Tests
Release Record
```

---

# 54. Gestión de documentación durante mantenimiento

Cuando un cambio modifique:

- requisitos;
- arquitectura;
- diseño;
- riesgos;
- pruebas;

los documentos correspondientes deberán actualizarse.

No deberá existir una diferencia permanente entre el software y su documentación controlada.

---

# 55. Configuración de mantenimiento

Debe conservarse la configuración exacta de la versión modificada.

Ejemplo:

```text
Baseline:
0.4.0

Modified:
0.4.1

Model:
ML-2026.02

Database:
DB-04
```

---

# 56. Modelos como elementos mantenibles

Cada modificación de modelo deberá tratarse como mantenimiento controlado.

Debe conservarse:

```text
Previous Model
New Model
Comparison
Validation
Risk Assessment
Release Record
```

---

# 57. Cambio de arquitectura

Un cambio como:

```text
SQLite → PostgreSQL
```

deberá considerarse un cambio arquitectónico y activar:

- análisis de impacto;
- pruebas;
- revisión de riesgos;
- actualización del SAD;
- actualización del SDD;
- actualización de configuración.

---

# 58. Cambio de framework

Un cambio como:

```text
Dash Version A
     ↓
Dash Version B
```

deberá evaluarse respecto de:

- UI;
- callbacks;
- seguridad;
- dependencias;
- pruebas;
- rendimiento.

---

# 59. Criterios de mantenimiento completado

Una modificación podrá considerarse completada cuando:

- el cambio esté implementado;
- los requisitos afectados estén actualizados;
- los riesgos hayan sido evaluados;
- las pruebas requeridas estén completas;
- la documentación esté actualizada;
- la configuración esté identificada;
- y exista una nueva versión controlada cuando corresponda.

---

# 60. Criterios de rechazo de cambio

Un cambio podrá rechazarse cuando:

- no sea necesario;
- tenga riesgo no aceptable;
- no sea verificable;
- sea incompatible;
- o carezca de justificación suficiente.

---

# 61. Matriz de trazabilidad de release

Cada release deberá poder relacionarse con:

```text
Release
 ↓
Requirements
 ↓
Changes
 ↓
Risks
 ↓
Tests
 ↓
Models
 ↓
Configuration
```

---

# 62. Ejemplo completo de Release Record

```text
========================================================
SISAP RECOVER AI
SOFTWARE RELEASE RECORD
========================================================

Release ID:
RELEASE-0.2.0

Release Type:
MINOR

Software Version:
0.2.0

Source Commit:
a84f29b

Model:
ML-2026.04

Clinical Configuration:
CC-0.2

Database:
DB-03

Python:
3.12.x

Dependencies:
requirements.lock

Test Baseline:
ST-BL-02

Unit Verification:
PASS

Integration Testing:
PASS

System Testing:
PASS

Regression:
PASS

Security Review:
PASS

Risk Review:
PASS

Known Anomalies:
ANOM-003 — Minor UI rendering issue

Open Safety Issues:
NONE

Configuration Verified:
YES

Documentation Verified:
YES

Release Decision:
APPROVED

Authorized By:
________________________

Date:
________________________

Notes:
________________________
========================================================
```

---

# 63. Estructura documental

Los registros podrán organizarse:

```text
docs/
└── 08_release_and_maintenance/
    │
    ├── Software_Release_and_Maintenance_Plan.md
    │
    └── release_records/
        │
        ├── RELEASE-0.1.0/
        │   ├── release_record.md
        │   ├── configuration.json
        │   └── evidence/
        │
        ├── RELEASE-0.2.0/
        │   ├── release_record.md
        │   ├── configuration.json
        │   └── evidence/
        │
        └── ...
```

---

# 64. Registro de configuración de release

Cada release podrá incorporar:

```json
{
  "release_id": "RELEASE-0.2.0",
  "software_version": "0.2.0",
  "model_version": "ML-2026.04",
  "clinical_config_version": "CC-0.2",
  "database_schema": "DB-03",
  "test_baseline": "ST-BL-02"
}
```

La estructura definitiva podrá cambiar durante la implementación.

---

# 65. Relación con System Testing

Una release deberá identificar el conjunto de pruebas utilizado:

```text
Release
   ↓
System Test Baseline
```

Ejemplo:

```text
RELEASE-0.2.0
        ↓
ST-BL-02
```

---

# 66. Relación con Risk Management

Una release deberá tener asociada una revisión de riesgos:

```text
RELEASE-0.2.0
        ↓
RISK-REVIEW-02
```

---

# 67. Relación con Configuration Management

Una release deberá tener asociada una baseline de configuración:

```text
RELEASE-0.2.0
        ↓
CFG-BL-02
```

---

# 68. Relación con Problem Resolution

Las anomalías que permanezcan abiertas deberán asociarse a:

```text
Problem ID
```

Ejemplo:

```text
RELEASE-0.2.0
       ↓
PROB-017
       ↓
Deferred
```

---

# 69. Indicadores de mantenimiento

Podrán monitorizarse:

```text
Open Problems
Mean Time to Resolution
Releases
Regression Failures
Model Updates
Security Updates
Rejected Changes
```

Estas métricas sirven para gestión interna y no sustituyen los criterios de aceptación.

---

# 70. Criterios de aceptación del documento

Este plan podrá pasar a baseline cuando:

- el proceso de release esté definido;
- exista formato de Release Record;
- existan criterios de entrada/salida;
- estén definidos los controles de anomalías;
- esté definido el proceso de mantenimiento;
- esté definido el tratamiento de cambios;
- estén contemplados los modelos ML;
- esté contemplada la actualización de dependencias;
- y exista relación con gestión de riesgos, configuración y pruebas.

---

# 71. Estado actual

| Elemento | Estado |
|---|---|
| Release Process | Definido |
| Release Record | Definido |
| Configuration Identification | Definido |
| Anomaly Management | Definido |
| Risk Review | Definido |
| Model Release | Definido |
| Maintenance Process | Definido |
| Change Management | Definido |
| Regression | Definida |
| Rollback | Definido conceptualmente |
| Retirement | Definido |
| Records | Estructura definida |
| Baseline | Pendiente |

---

# 72. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 73. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline |
| 1.x | Futuro | Cambios controlados |

---

# 74. Declaración

> **SISAP by CENIVRA Software Release and Maintenance Plan establece el proceso controlado para la preparación, autorización, identificación, liberación, mantenimiento y retiro de versiones del software.**
>
> Cada release deberá poder reconstruirse o identificarse mediante su configuración, versión de código, modelo, configuración clínica, dependencias, base de datos y evidencia de pruebas.
>
> Los cambios posteriores a una release deberán evaluarse antes de su implementación y deberán generar nueva evidencia de verificación cuando corresponda.
>
> La utilización de este proceso no constituye por sí misma certificación, declaración de conformidad ni autorización regulatoria.