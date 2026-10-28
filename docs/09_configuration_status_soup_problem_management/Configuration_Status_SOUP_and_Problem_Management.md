# SISAP by CENIVRA

# Configuration Status, SOUP and Problem Management

**Documento:** Configuration Status, SOUP and Problem Management  
**Identificador:** SISAP-CSPM-001  
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
| Documento | Configuration Status, SOUP and Problem Management |
| Identificador | SISAP-CSPM-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Relación | Configuration Management / SOUP / Problem Resolution |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 |

---

# 1. Propósito

Este documento establece el sistema de control para:

1. mantener el **estado de configuración** de SISAP by CENIVRA;
2. identificar los componentes exactos que forman parte de una versión;
3. controlar y registrar los componentes externos utilizados por el software;
4. registrar problemas, anomalías y defectos;
5. diferenciar problemas técnicos de auditoría clínica;
6. establecer la relación entre problema, versión, riesgo, corrección y prueba;
7. y conservar la trazabilidad histórica del software.

El documento integra inicialmente tres áreas relacionadas:

```text
A. Configuration Status Accounting
B. SOUP Management
C. Problem Reports / Problem Resolution
```

Estas áreas podrán separarse posteriormente en documentos independientes.

---

# 2. Alcance

Este documento aplica a:

- código fuente;
- modelos ML;
- configuración;
- reglas clínicas;
- parámetros;
- base de datos y esquema;
- dependencias;
- herramientas relevantes;
- documentación controlada;
- casos de prueba;
- baselines;
- releases;
- problemas;
- anomalías;
- defectos;
- y componentes SOUP.

No aplica a la auditoría clínica de pacientes como mecanismo de resolución de problemas de software.

---

# 3. Relación con otros documentos

Este documento depende de:

```text
Software Development Plan
        ↓
Software Requirements Specification
        ↓
Software Architecture Description
        ↓
Software Detailed Design
        ↓
Verification & Integration Plan
        ↓
System Test Plan
        ↓
Risk Management File
        ↓
Software Configuration Management Plan
```

y alimenta:

```text
Release Records
Maintenance Records
Risk Reviews
Regression Tests
```

---

# 4. Principio fundamental

La versión de SISAP by CENIVRA no se define únicamente por:

```text
Git commit
```

Una versión completa deberá poder representarse mediante:

```text
Software
+
Models
+
Clinical Configuration
+
Database Schema
+
Dependencies
+
Documentation
+
Test Baseline
```

Por ejemplo:

```text
SISAP by CENIVRA 0.3.0
│
├── Source commit: a84f29b
├── Model: AE-2026-02
├── GMM: GMM-2026-01
├── Normalization: NORM-03
├── Clinical Config: CC-03
├── Database schema: DB-04
├── Python: 3.12.x
├── Dependencies: DEP-03
└── Test baseline: TEST-2026-08
```

---

# 5. Identificación de configuración

Cada configuración deberá poseer una identificación única.

Ejemplo:

```text
Configuration ID:
CFG-0.3.0
```

La configuración deberá estar asociada a una release o baseline.

---

# 6. Componentes de una configuración

Una configuración de SISAP podrá incluir:

```text
CI-CODE
CI-MODEL
CI-CONFIG
CI-DATABASE
CI-DEPENDENCY
CI-DOCUMENT
CI-TEST
CI-SCRIPT
CI-INFRASTRUCTURE
```

---

# 7. Configuration Status Accounting

## [DIVISIÓN FUTURA A — Este bloque podrá convertirse en `Configuration_Status_Accounting.md`]

---

# 8. Objetivo del Configuration Status Accounting

El Configuration Status Accounting deberá permitir responder:

> **¿Qué componentes exactos constituían SISAP by CENIVRA en una fecha o release determinada?**

También deberá permitir:

> **¿Qué versión de cada componente estaba activa cuando se generó un resultado?**

---

# 9. Configuration Status Register

Se mantendrá un registro:

```text
configuration_status.csv
```

con información como:

```text
baseline_id
release_id
ci_id
ci_version
status
effective_date
retirement_date
owner
```

---

# 10. Ejemplo de Configuration Status Register

| Baseline | Release | CI | Versión | Estado |
|---|---|---|---|---|
| REL-BL-0.3.0 | 0.3.0 | CI-CODE-001 | 0.3.0 | Active |
| REL-BL-0.3.0 | 0.3.0 | CI-MODEL-001 | AE-2026-02 | Active |
| REL-BL-0.3.0 | 0.3.0 | CI-MODEL-002 | GMM-2026-01 | Active |
| REL-BL-0.3.0 | 0.3.0 | CI-CONFIG-001 | CC-03 | Active |
| REL-BL-0.3.0 | 0.3.0 | CI-DB-001 | DB-04 | Active |
| REL-BL-0.3.0 | 0.3.0 | CI-DEP-001 | DEP-03 | Active |
| REL-BL-0.3.0 | 0.3.0 | CI-TEST-001 | TEST-2026-08 | Active |

---

# 11. Configuration Snapshot

Cada release deberá disponer de un snapshot de configuración.

Ejemplo:

```text
RELEASE-0.3.0

Software:
0.3.0

Model:
AE-2026-02

GMM:
GMM-2026-01

Normalization:
NORM-03

Clinical Configuration:
CC-03

Database:
DB-04

Python:
3.12.x

Dependencies:
DEP-03

Test Baseline:
TEST-2026-08
```

---

# 12. Configuration Manifest

Podrá utilizarse un archivo:

```text
configuration.json
```

Ejemplo:

```json
{
  "release_id": "RELEASE-0.3.0",
  "software_version": "0.3.0",
  "model_versions": {
    "autoencoder": "AE-2026-02",
    "gmm": "GMM-2026-01"
  },
  "normalization_version": "NORM-03",
  "clinical_configuration": "CC-03",
  "database_schema": "DB-04",
  "python_version": "3.12.x",
  "dependency_set": "DEP-03",
  "test_baseline": "TEST-2026-08"
}
```

---

# 13. Relación con resultados clínicos

Una ejecución relevante podrá asociarse con:

```text
assessment_id
execution_id
software_version
model_version
configuration_version
database_schema
timestamp
```

Esto permitirá saber qué configuración produjo el resultado.

---

# 14. Preguntas que el sistema deberá poder responder

El Configuration Status Accounting deberá permitir responder:

### Pregunta 1

¿Qué software estaba instalado?

### Pregunta 2

¿Qué modelo estaba activo?

### Pregunta 3

¿Qué parámetros de normalización estaban activos?

### Pregunta 4

¿Qué reglas clínicas estaban activas?

### Pregunta 5

¿Qué esquema de base de datos estaba vigente?

### Pregunta 6

¿Qué dependencias estaban instaladas?

### Pregunta 7

¿Qué pruebas respaldaban esa versión?

---

# 15. Estado histórico

Las configuraciones retiradas deberán permanecer identificables.

Ejemplo:

```text
0.1.0 → RETIRED
0.2.0 → RETIRED
0.3.0 → ACTIVE
0.4.0 → DEVELOPMENT
```

---

# 16. Cambios de configuración

Un cambio deberá producir:

```text
Previous Configuration
        ↓
Change
        ↓
New Configuration
```

---

# 17. Configuration Status Accounting y release

La relación será:

```text
Configuration
      ↓
Baseline
      ↓
Release
```

Una release no deberá existir sin una configuración identificable.

---

# 18. Configuration Audit

Cuando corresponda, deberá realizarse una revisión:

```text
Repository
Models
Configuration
Database
Dependencies
Tests
Documentation
```

---

# 19. Configuration Audit Record

Ejemplo:

```text
CONFIG-AUDIT-001

Release:
0.3.0

Source:
a84f29b

Model:
AE-2026-02

GMM:
GMM-2026-01

Config:
CC-03

Database:
DB-04

Dependencies:
DEP-03

Tests:
TEST-2026-08

Result:
PASS
```

---

# 20. Integridad del estado de configuración

Una diferencia entre el estado documentado y el estado real deberá tratarse como:

```text
Configuration Discrepancy
```

y deberá generar una evaluación.

---

# 21. Configuration Discrepancy

Ejemplo:

```text
Documented:
AE-2026-02

Actual:
AE-2026-03
```

Deberá evaluarse:

- origen;
- impacto;
- riesgo;
- releases afectadas;
- resultados afectados;
- acciones correctivas.

---

# 22. Baselines

Las baselines utilizadas por SISAP podrán incluir:

```text
DEV-BL
VER-BL
VAL-BL
REL-BL
```

Cada baseline deberá poseer una identificación única.

---

# 23. [DIVISIÓN FUTURA A — FIN]

---

# 24. SOUP Management

## [DIVISIÓN FUTURA B — Este bloque podrá convertirse en `SOUP_Management.md`]

---

# 25. Propósito

SISAP utiliza componentes de software desarrollados externamente.

Estos componentes deberán identificarse, controlarse y evaluarse cuando puedan afectar:

- funcionalidad;
- seguridad;
- rendimiento;
- integridad;
- o resultados clínicos.

IEC 62304 requiere considerar el uso de SOUP dentro del ciclo de vida del software y documentar aspectos relevantes de estos componentes, incluyendo versión y anomalías conocidas cuando puedan afectar al comportamiento del producto. 

---

# 26. Componentes SOUP previstos

Ejemplos:

```text
Python
Dash
Flask
SQLAlchemy
NumPy
Pandas
SciPy
scikit-learn
TensorFlow
Keras
PyTorch
```

La lista real dependerá de las dependencias efectivamente utilizadas.

---

# 27. SOUP ID

Cada componente deberá disponer de identificación.

Ejemplo:

```text
SOUP-001
```

---

# 28. Inventario SOUP

Se mantendrá:

```text
soup_inventory.csv
```

Columnas propuestas:

```text
soup_id
component
version
provider
purpose
license
safety_relevance
known_anomalies
security_status
verification_method
verification_reference
status
```

---

# 29. Ejemplo SOUP-001

```text
SOUP ID:
SOUP-001

Component:
Python

Version:
3.12.x

Purpose:
Runtime

Safety relevance:
YES / NO

Known anomalies:
...

Verification:
Environment verification

Status:
APPROVED
```

---

# 30. Ejemplo SOUP-002

```text
SOUP ID:
SOUP-002

Component:
TensorFlow

Version:
X.X.X

Purpose:
ML inference

Safety relevance:
YES

Known anomalies:
...

Verification:
ML integration tests

Status:
APPROVED
```

---

# 31. Evaluación de seguridad de SOUP

Para cada componente relevante deberá determinarse:

```text
Can failure contribute to a hazardous situation?
```

Si la respuesta es sí:

```text
SOUP
 ↓
Risk Analysis
 ↓
Control
 ↓
Verification
```

---

# 32. Anomalías conocidas de SOUP

Cuando existan problemas conocidos publicados por el proveedor, deberán evaluarse respecto de:

- versión utilizada;
- funciones utilizadas;
- impacto;
- relevancia de seguridad;
- mitigaciones.

---

# 33. Cambio de versión SOUP

Una actualización deberá seguir:

```text
Old Version
   ↓
New Version
   ↓
Impact Analysis
   ↓
Security Review
   ↓
Compatibility
   ↓
Testing
   ↓
Approval
```

---

# 34. SOUP y configuración

El conjunto SOUP deberá formar parte de la configuración de una release.

Ejemplo:

```text
DEP-03
│
├── Python 3.12.x
├── Dash X.X.X
├── Flask X.X.X
├── SQLAlchemy X.X.X
├── NumPy X.X.X
└── TensorFlow X.X.X
```

---

# 35. SOUP y pruebas

Un cambio de SOUP deberá activar las pruebas afectadas.

Ejemplo:

```text
TensorFlow update
        ↓
ML Tests
        ↓
Risk Tests
        ↓
System Tests
```

según el análisis de impacto.

---

# 36. SOUP y seguridad informática

Cuando una vulnerabilidad afecte un componente SOUP:

```text
Vulnerability
      ↓
Affected Release
      ↓
Risk Assessment
      ↓
Patch / Mitigation
      ↓
Verification
```

---

# 37. SOUP y release

Una release deberá identificar:

```text
Software Version
SOUP Versions
Test Baseline
```

---

# 38. SOUP Status

Los componentes podrán tener:

```text
EVALUATING
APPROVED
RESTRICTED
DEPRECATED
RETIRED
```

---

# 39. Criterios SOUP

Un componente deberá evaluarse antes de ser utilizado en producción.

La evaluación deberá considerar:

- función;
- versión;
- seguridad;
- compatibilidad;
- anomalías;
- y pruebas.

---

# 40. [DIVISIÓN FUTURA B — FIN]

---

# 41. Problem Management

## [DIVISIÓN FUTURA C — Este bloque podrá convertirse en `Problem_Reports_and_Resolution.md`]

---

# 42. Propósito

El proceso de gestión de problemas permite identificar, documentar, investigar y resolver anomalías o defectos encontrados durante:

- desarrollo;
- pruebas;
- integración;
- validación;
- operación;
- mantenimiento;
- y revisión de seguridad.

IEC 62304 contempla la resolución de problemas como un proceso específico del ciclo de vida y requiere registrar y evaluar problemas detectados en el software, incluyendo su impacto relevante. 

---

# 43. Diferencia entre auditoría clínica y Problem Report

## Auditoría clínica

La auditoría responde:

```text
¿Quién hizo qué?
¿Sobre qué paciente?
¿Sobre qué evaluación?
¿Cuándo?
```

Ejemplo:

```text
usuario:
USR-003

acción:
ASSESSMENT_PROCESSED

paciente:
PAT-001

evaluación:
EVAL-032

fecha:
2026-08-29
```

## Problem Report

El Problem Report responde:

```text
¿Qué falló?
¿En qué versión?
¿Qué componente?
¿Qué impacto tuvo?
¿Afecta seguridad?
¿Por qué ocurrió?
¿Cómo se corrigió?
¿Cómo se verificó?
```

Estos registros deberán permanecer separados.

---

# 44. Identificación de problemas

Cada problema deberá poseer un identificador único:

```text
PROB-001
PROB-002
PROB-003
```

---

# 45. Estados de problemas

Los estados serán:

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

# 46. Clasificación de problemas

Los problemas podrán clasificarse por:

```text
CRITICAL
MAJOR
MINOR
TRIVIAL
```

La severidad deberá considerar:

- funcionalidad;
- rendimiento;
- seguridad;
- integridad;
- datos;
- y posible impacto clínico.

---

# 47. Problem Report mínimo

Cada registro deberá incluir:

```text
Problem ID
Date
Reporter
Software Version
Configuration
Component
Description
Expected Behavior
Observed Behavior
Reproduction Steps
Severity
Safety Impact
Security Impact
Root Cause
Correction
Verification
Status
```

---

# 48. Ejemplo de Problem Report

```text
PROB-017

Date:
2026-08-29

Software Version:
0.4.0

Component:
Risk Engine

Description:
Risk threshold evaluated incorrectly at boundary.

Expected:
Threshold = 0.70 → HIGH

Observed:
Threshold = 0.70 → MEDIUM

Severity:
MAJOR

Safety Impact:
Potentially relevant

Root Cause:
Boundary comparison operator

Correction:
Updated risk rule

Verification:
TEST-RISK-BOUNDARY-004

Status:
CLOSED
```

---

# 49. Evaluación inicial del problema

Todo problema deberá determinar:

```text
Does it affect safety?
Does it affect security?
Does it affect clinical output?
Does it affect data integrity?
Does it affect released software?
```

---

# 50. Problem → Risk

Cuando corresponda:

```text
Problem
   ↓
Risk Assessment
```

Ejemplo:

```text
PROB-017
   ↓
RISK-013
```

---

# 51. Problem → Requirement

Cuando el problema revele una deficiencia de requisitos:

```text
Problem
   ↓
Requirement Change
```

Ejemplo:

```text
PROB-022
   ↓
REQ-RISK-014
```

---

# 52. Problem → Design

Cuando sea necesario modificar arquitectura o diseño:

```text
Problem
   ↓
Design Change
```

---

# 53. Problem → Test

Cada corrección deberá disponer de una prueba adecuada.

```text
Problem
   ↓
Correction
   ↓
Test
```

---

# 54. Corrección

Las correcciones deberán:

- identificarse;
- revisarse;
- probarse;
- y quedar asociadas con una nueva versión cuando corresponda.

---

# 55. Retest

Después de una corrección:

```text
Original Failure
      ↓
Fix
      ↓
Retest
      ↓
PASS
```

El resultado original no deberá eliminarse.

---

# 56. Regression

Una corrección deberá someterse a análisis de regresión.

```text
Fix
 ↓
Direct Tests
+
Dependent Tests
+
Safety Tests
```

---

# 57. Problemas en producción

Un problema detectado durante operación deberá:

```text
Detection
 ↓
Problem Report
 ↓
Impact Assessment
 ↓
Risk Review
 ↓
Correction
 ↓
Verification
 ↓
Release
```

---

# 58. Problemas relacionados con modelos ML

Deberán registrarse problemas como:

```text
Wrong Model
Wrong Version
Wrong Normalization
Unexpected Output
Model Corruption
Performance Degradation
Distribution Shift
```

---

# 59. Problemas relacionados con configuración

Ejemplos:

```text
Wrong Threshold
Wrong Clinical Rule
Wrong Dimension Mapping
Wrong Model Selection
```

---

# 60. Problemas relacionados con SOUP

Ejemplos:

```text
Dependency Bug
Security Vulnerability
Breaking Change
Unexpected Behavior
```

---

# 61. Problemas relacionados con seguridad

Los problemas de:

```text
Authentication
Authorization
Session
Data Exposure
Secrets
```

deberán tener evaluación específica de seguridad.

---

# 62. Problemas relacionados con datos

Ejemplos:

```text
Wrong Patient Association
Missing Data
Corrupted Data
Wrong Assessment Association
Duplicate Record
```

---

# 63. Causa raíz

Cuando sea posible deberá determinarse:

```text
Root Cause
```

Podrá clasificarse como:

```text
Requirement
Design
Implementation
Configuration
Dependency
Data
Environment
Human/Process
Unknown
```

---

# 64. Corrección y acción preventiva

Cuando corresponda podrá diferenciarse:

```text
Corrective Action
Preventive / Process Improvement
```

---

# 65. Relación con configuración

Cada problema deberá identificar la versión afectada:

```text
PROB-017
Affected Release:
0.4.0
```

---

# 66. Problemas que afectan múltiples releases

Cuando corresponda:

```text
PROB-017

Affected:
0.3.0
0.4.0

Fixed:
0.4.1
```

---

# 67. Estado de problemas por release

Se mantendrá información como:

```text
release_id
problem_id
status
severity
safety_impact
resolution_version
```

---

# 68. Problem Status Accounting

Deberá ser posible responder:

> ¿Qué problemas conocidos existían en SISAP 0.4.0?

Ejemplo:

```text
PROB-012 → CLOSED
PROB-015 → DEFERRED
PROB-017 → FIXED IN 0.4.1
```

---

# 69. Anomalías conocidas de una release

Las anomalías abiertas podrán aparecer también en el Release Record.

Ejemplo:

```text
Known Anomalies:

PROB-015
Minor reporting issue
No identified safety impact
Deferred to 0.5.0
```

---

# 70. Criterios de cierre

Un problema podrá cerrarse cuando:

- la causa esté identificada o se haya justificado su imposibilidad;
- la corrección esté implementada;
- la prueba haya pasado;
- el riesgo haya sido revisado;
- y la documentación esté actualizada.

---

# 71. Problemas no reproducibles

Si un problema no puede reproducirse deberá permanecer documentado y clasificarse apropiadamente.

No deberá cerrarse únicamente por no poder reproducirlo.

---

# 72. Problemas diferidos

Un problema podrá diferirse cuando:

- el riesgo sea aceptable;
- exista justificación;
- se registre la decisión;
- y se indique la versión objetivo.

---

# 73. Problemas críticos

Un problema crítico deberá bloquear normalmente la liberación cuando:

- pueda comprometer seguridad;
- produzca resultados clínicos inválidos;
- o impida cumplir un control de riesgo.

La decisión final deberá quedar documentada.

---

# 74. Problem Review

Los problemas abiertos podrán revisarse periódicamente.

La revisión deberá incluir:

```text
Open Problems
Severity
Safety Impact
Age
Affected Releases
Pending Fixes
```

---

# 75. Problem Review Record

Ejemplo:

```text
PROBLEM-REVIEW-003

Release:
0.5.0

Open Problems:
PROB-021
PROB-023

Critical:
0

Major:
1

Minor:
1

Safety-related:
0

Decision:
Release acceptable with monitoring
```

---

# 76. Integración con mantenimiento

La resolución de problemas alimentará directamente el mantenimiento:

```text
Problem
 ↓
Change
 ↓
Verification
 ↓
Release
```

---

# 77. Integración con gestión de riesgos

```text
Problem
 ↓
Risk Evaluation
 ↓
Risk File
```

---

# 78. Integración con configuración

```text
Problem
 ↓
Affected CI
 ↓
Configuration
 ↓
Release
```

---

# 79. Integración con pruebas

```text
Problem
 ↓
Test
 ↓
Retest
 ↓
Regression
```

---

# 80. Integración con documentación

Cuando un problema produzca cambios en:

- requisitos;
- arquitectura;
- diseño;
- riesgos;
- pruebas;
- configuración;

los documentos correspondientes deberán actualizarse.

---

# 81. Estructura física futura

Cuando el proyecto crezca, este documento podrá separarse en:

```text
docs/
└── 09_configuration_status_and_problem_management/
    │
    ├── Configuration_Status_Accounting.md
    ├── SOUP_Management.md
    ├── Problem_Reports_and_Resolution.md
    │
    ├── configuration_status.csv
    ├── soup_inventory.csv
    │
    └── problem_reports/
        ├── PROB-001/
        ├── PROB-002/
        └── ...
```

---

# 82. Reglas de separación futura

## Documento A — Configuration Status Accounting

Contendrá exclusivamente:

```text
Configuration Items
Baselines
Configuration Status
Configuration Snapshots
Configuration Audits
Historical Configuration
```

## Documento B — SOUP Management

Contendrá:

```text
SOUP Inventory
Versions
Providers
Known Anomalies
Security
Compatibility
Verification
Lifecycle
```

## Documento C — Problem Reports / Resolution

Contendrá:

```text
Problem Process
Problem Records
Severity
Investigation
Correction
Retest
Regression
Closure
```

---

# 83. Criterios de aceptación del documento

Este documento podrá pasar a baseline cuando:

- el registro de configuración esté definido;
- las baselines sean identificables;
- las releases puedan reconstruirse o identificarse;
- exista inventario SOUP;
- exista estructura de Problem Reports;
- los problemas estén separados de la auditoría clínica;
- exista trazabilidad entre problemas, riesgos, pruebas y releases;
- y estén definidos los responsables.

---

# 84. Estado actual

| Elemento | Estado |
|---|---|
| Configuration Status Accounting | Definido |
| Configuration Snapshot | Definido |
| Configuration Manifest | Definido |
| Historical Configuration | Definido |
| Configuration Audit | Definido |
| SOUP Inventory | Definido |
| SOUP Versioning | Definido |
| SOUP Risk Assessment | Definido |
| SOUP Verification | Definida |
| Problem Reports | Definidos |
| Problem Severity | Definida |
| Problem States | Definidos |
| Retest | Definido |
| Regression | Definida |
| Problem → Risk | Definido |
| Problem → Test | Definido |
| Problem → Release | Definido |
| Implementación de registros | Pendiente |

---

# 85. Responsabilidades

| Rol | Responsabilidad |
|---|---|
| Responsable de configuración | Estado y baselines |
| Responsable de software | Cambios técnicos |
| Responsable clínico | Impacto clínico |
| Responsable de riesgos | Evaluación de riesgos |
| Responsable de verificación | Evidencia de pruebas |
| Responsable del producto | Decisiones de release |

---

# 86. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de configuración | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |
| Responsable de riesgos | Pendiente | Pendiente |

---

# 87. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Documento maestro inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 88. Declaración

> **SISAP by CENIVRA Configuration Status, SOUP and Problem Management establece los mecanismos para mantener la trazabilidad de la configuración del software, controlar los componentes externos relevantes y gestionar los problemas detectados durante el ciclo de vida.**
>
> La configuración de una release deberá poder identificar de forma inequívoca el software, modelos, parámetros, configuración clínica, esquema de base de datos, dependencias, pruebas y documentación aplicables.
>
> Los registros de auditoría clínica y los registros de problemas de software deberán mantenerse separados debido a sus diferentes finalidades.
>
> Los problemas que puedan afectar seguridad, resultados clínicos, integridad de datos o controles de riesgo deberán evaluarse mediante los procesos correspondientes.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria.