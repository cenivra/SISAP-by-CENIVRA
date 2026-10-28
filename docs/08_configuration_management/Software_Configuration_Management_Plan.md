# SISAP by CENIVRA

> ### Re-baseline — 28 de septiembre de 2026
>
> El historial del repositorio se reescribió en esta fecha para retirar de él el
> material de financiamiento y las rutas absolutas del equipo. Consecuencia directa
> sobre este plan: **los identificadores de línea base citados más abajo cambian**,
> porque cambian desde el commit raíz.
>
> Todo identificador de commit anterior a esta fecha debe considerarse inválido. La
> equivalencia se conserva por **asunto del commit**, que la reescritura no altera, y
> el mapa viejo-nuevo se conserva en el respaldo
> `sisap-respaldo-2026-09-28-pre-reescritura`.
>
> La operación está registrada en `docs/technical_history/README_evolucion.md`, con
> el motivo y el alcance medido. Se registra precisamente aquí porque, sin este
> asiento, una reescritura del historial deja un hueco de trazabilidad: un auditor
> encontraría hashes documentados que no corresponden a ningún commit.

# Software Configuration Management Plan

**Documento:** Software Configuration Management Plan  
**Identificador:** SISAP-CMP-001  
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
| Documento | Software Configuration Management Plan |
| Identificador | SISAP-CMP-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Control de versiones | Git |
| Repositorio | GitHub / repositorio autorizado |
| Persistencia inicial | SQLite / SQLAlchemy |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 |

---

# 1. Propósito

Este documento establece el proceso mediante el cual SISAP by CENIVRA identificará, controlará, versionará y mantendrá los elementos que constituyen su configuración de software.

El objetivo es garantizar que:

- cada elemento controlado tenga una identificación inequívoca;
- cada versión pueda distinguirse de las demás;
- los cambios sean evaluados y autorizados;
- una release pueda reconstruirse o identificarse;
- las configuraciones utilizadas en pruebas puedan reproducirse;
- los modelos ML permanezcan vinculados al software que los ejecuta;
- las configuraciones clínicas permanezcan versionadas;
- y los registros históricos puedan relacionarse con la versión que los produjo.

La gestión de configuración se aplica durante todo el ciclo de vida:

```text
Desarrollo
    ↓
Verificación
    ↓
Integración
    ↓
Release
    ↓
Mantenimiento
    ↓
Retiro
```

IEC 62304 incorpora la gestión de configuración como proceso específico del ciclo de vida del software, incluyendo identificación de elementos, control de cambios y registro del estado de configuración. 

---

# 2. Alcance

Este plan aplica a todos los elementos que puedan afectar:

- comportamiento del software;
- resultados clínicos;
- seguridad;
- trazabilidad;
- reproducibilidad;
- integración;
- o capacidad de reconstruir una release.

Incluye:

```text
Código fuente
Modelos ML
Configuración
Reglas clínicas
Parámetros
Base de datos / esquema
Dependencias
Documentación
Pruebas
Scripts
Artefactos de release
```

---

# 3. Principios de gestión de configuración

## 3.1 Identificación única

Cada elemento controlado deberá poder identificarse inequívocamente.

## 3.2 Versionado explícito

Las modificaciones relevantes deberán generar una nueva versión.

## 3.3 Integridad

Una baseline liberada no deberá modificarse silenciosamente.

## 3.4 Trazabilidad

Cada release deberá poder relacionarse con sus componentes.

## 3.5 Reproducibilidad

Debe ser posible reconstruir el contexto técnico de una ejecución relevante.

## 3.6 Control de cambios

Los cambios deberán pasar por evaluación y autorización.

## 3.7 Separación de entornos

Los artefactos de desarrollo, pruebas y producción deberán mantenerse diferenciados.

## 3.8 Protección de elementos sensibles

Datos clínicos, secretos y credenciales no deberán formar parte del repositorio de código.

---

# 4. Definición de Configuration Item

Un **Configuration Item (CI)** es un elemento identificado y controlado cuya versión debe conocerse para gestionar la configuración del sistema.

En SISAP podrán ser Configuration Items:

```text
CI-CODE
CI-MODEL
CI-CONFIG
CI-DATABASE
CI-DEPENDENCY
CI-DOCUMENT
CI-TEST
CI-SCRIPT
CI-RELEASE
CI-INFRASTRUCTURE
```

---

# 5. Categorías de Configuration Items

## 5.1 Código fuente

Ejemplos:

```text
app/
tests/
scripts/
```

## 5.2 Modelos

Ejemplos:

```text
encoder.h5
autoencoder_completo.h5
gmm_model.pkl
```

## 5.3 Configuración

Ejemplos:

```text
config.py
clinical_config.py
model_config.py
risk_config.py
```

## 5.4 Base de datos

Incluye:

- esquema;
- migraciones;
- scripts de inicialización;
- configuración de acceso.

## 5.5 Dependencias

Ejemplos:

```text
requirements.txt
requirements.lock
```

## 5.6 Documentación

Incluye:

```text
SDP
SRS
SAD
SDD
Verification Plan
System Test Plan
Risk Management
Release Records
Maintenance
```

## 5.7 Pruebas

Incluye:

- casos;
- fixtures;
- scripts;
- resultados;
- baselines de prueba.

---

# 6. Identificación de Configuration Items

Cada CI deberá disponer de:

```text
CI ID
Name
Type
Version
Status
Owner
Location
Description
```

Ejemplo:

```text
CI-MODEL-001
Autoencoder SISAP
Type: ML Model
Version: ML-2026.01
Status: APPROVED
```

---

# 7. Convención de identificadores

Se utilizará:

```text
CI-[TYPE]-[NUMBER]
```

Ejemplos:

```text
CI-CODE-001
CI-MODEL-001
CI-CONFIG-001
CI-DB-001
CI-DOC-001
CI-TEST-001
```

---

# 8. Estados de Configuration Items

Los elementos podrán encontrarse en:

```text
DRAFT
DEVELOPMENT
VERIFICATION
APPROVED
BASELINED
RETIRED
```

Un elemento `RETIRED` no deberá utilizarse en nuevas configuraciones de producción.

---

# 9. Identificación del código fuente

El código será identificado mediante:

```text
Repository
Branch
Commit
Tag
Release
```

Ejemplo:

```text
Repository:
sisap-recover-ai

Commit:
a84f29b

Tag:
v0.5.0
```

---

# 10. Control de ramas

La estrategia inicial podrá utilizar:

```text
main
develop
feature/*
fix/*
release/*
hotfix/*
```

La política definitiva podrá simplificarse o ampliarse según el tamaño del proyecto.

La rama `main` deberá representar únicamente código aprobado para el nivel correspondiente.

---

# 11. Pull Requests / Code Review

Los cambios relevantes deberán revisarse antes de incorporarse a una rama controlada.

La revisión deberá considerar:

- requisito afectado;
- impacto;
- riesgo;
- pruebas;
- arquitectura;
- código;
- y documentación.

---

# 12. Tags de release

Cada release deberá generar un tag inequívoco.

Ejemplo:

```text
v0.1.0
v0.2.0
v1.0.0
```

El tag deberá apuntar a un commit específico.

---

# 13. Identificación de modelos

Los modelos deberán poseer identificadores independientes del software.

Ejemplo:

```text
ML-2026.01
ML-2026.02
ML-2026.03
```

No se utilizará exclusivamente el nombre del archivo para determinar la versión.

---

# 14. Identificación de artefactos de modelos

Cada modelo deberá registrar:

```text
Model ID
Version
Artifact filename
Checksum
Input Schema
Preprocessing Version
Normalization Version
Training Dataset ID
Validation Status
Approval Status
```

---

# 15. Control de integridad de modelos

Los modelos podrán identificarse mediante:

```text
SHA-256
```

Ejemplo:

```text
Model:
ML-2026.03

SHA-256:
<hash>
```

Una discrepancia deberá provocar una evaluación antes de utilizar el artefacto.

---

# 16. Identificación de configuración

Las configuraciones con impacto clínico deberán poseer versión.

Ejemplos:

```text
CC-0.1
CC-0.2
CC-1.0
```

Podrán incluir:

```text
Clinical Configuration
Risk Configuration
Model Configuration
Normalization Configuration
```

---

# 17. Control de reglas clínicas

Las siguientes entidades deberán permanecer bajo control:

```text
Risk thresholds
Clinical rules
Dimension mappings
Scoring definitions
Normalization parameters
Alert rules
```

Un cambio de cualquiera de ellas deberá tratarse como cambio controlado.

---

# 18. Identificación de base de datos

El esquema de base de datos tendrá versión independiente.

Ejemplo:

```text
DB-001
DB-002
DB-003
```

Las migraciones deberán identificar:

```text
Previous Schema
Migration
New Schema
```

---

# 19. Control de migraciones

Las modificaciones del esquema deberán utilizar scripts o mecanismos versionados.

Ejemplo:

```text
migrations/
├── 001_initial.py
├── 002_add_alerts.py
└── 003_add_model_version.py
```

---

# 20. Identificación de dependencias

Cada conjunto de dependencias utilizado para una release deberá quedar identificado.

Ejemplo:

```text
Dependency Set:
DEP-0.5
```

Incluye las versiones de:

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
PyTorch
```

según corresponda.

---

# 21. Control de SOUP

Las dependencias de terceros relevantes deberán conservar:

```text
SOUP ID
Name
Version
Provider
Purpose
Safety Relevance
Known Anomalies
```

El inventario SOUP deberá vincularse con las configuraciones o releases en las que se utilizan.

---

# 22. Identificación de documentación

Cada documento controlado deberá tener:

```text
Document ID
Version
Status
Date
Owner
```

Ejemplo:

```text
SISAP-SRS-001
Version 1.0
Approved
```

---

# 23. Identificación de pruebas

Los planes y casos de prueba deberán poseer identificadores:

```text
TEST-UNIT-001
TEST-INT-001
TEST-SYS-001
```

Los resultados de ejecución deberán identificar la versión evaluada.

---

# 24. Configuration Item Register

Se mantendrá:

```text
configuration_items.csv
```

Columnas iniciales:

```text
ci_id
name
type
version
status
owner
repository
path
description
safety_relevance
created_at
updated_at
```

---

# 25. Ejemplo del Configuration Item Register

| CI ID | Nombre | Tipo | Versión | Estado |
|---|---|---|---|---|
| CI-CODE-001 | SISAP Application | CODE | 0.5.0 | BASELINED |
| CI-MODEL-001 | Autoencoder | MODEL | ML-2026.03 | APPROVED |
| CI-CONFIG-001 | Clinical Config | CONFIG | CC-0.5 | BASELINED |
| CI-DB-001 | Database Schema | DATABASE | DB-05 | BASELINED |
| CI-DEP-001 | Dependency Set | DEPENDENCY | DEP-05 | BASELINED |
| CI-DOC-001 | SRS | DOCUMENT | 1.0 | APPROVED |

---

# 26. Baseline

Una **baseline** es un conjunto identificado de Configuration Items aprobado para una finalidad específica.

Ejemplo:

```text
BASELINE-0.5.0
```

Podrá contener:

```text
Code
Model
Configuration
Database Schema
Dependencies
Documentation
Test Baseline
```

---

# 27. Estructura de una baseline

```text
BASELINE-0.5.0
│
├── Source
│   └── commit a84f29b
│
├── Model
│   └── ML-2026.03
│
├── Configuration
│   └── CC-0.5
│
├── Database
│   └── DB-05
│
├── Dependencies
│   └── DEP-05
│
└── Tests
    └── ST-BL-05
```

---

# 28. Baseline de desarrollo

Podrá existir una baseline temporal para desarrollo.

```text
DEV-BL-001
```

No implica autorización para producción.

---

# 29. Baseline de verificación

Una versión sometida a pruebas podrá identificarse:

```text
VER-BL-001
```

Debe permanecer congelada durante la prueba, salvo cambios controlados.

---

# 30. Baseline de release

Una versión liberada deberá tener una baseline permanente.

Ejemplo:

```text
REL-BL-0.5.0
```

---

# 31. Control de cambios

Todo cambio significativo deberá pasar por:

```text
Change Request
      ↓
Impact Analysis
      ↓
Risk Review
      ↓
Approval
      ↓
Implementation
      ↓
Verification
      ↓
Baseline Update
```

---

# 32. Change Request

Cada solicitud deberá identificar:

```text
Change ID
Description
Reason
Requester
Affected CI
Impact
Risk
Priority
Approval
```

Ejemplo:

```text
CHANGE-023

Change:
Update risk threshold

Affected:
CI-CONFIG-003

Impact:
Risk / Alert

Risk:
RISK-013

Tests:
TEST-RISK-013
```

---

# 33. Clasificación de cambios

Los cambios podrán clasificarse como:

```text
MINOR
FUNCTIONAL
CLINICAL
SAFETY
ARCHITECTURAL
MODEL
DEPENDENCY
```

La clasificación determinará el nivel de revisión necesario.

---

# 34. Cambios de alto impacto

Deberán recibir revisión reforzada los cambios en:

```text
Risk Engine
Alert Engine
Scoring
Normalization
ML Models
Clinical Rules
Authentication
Authorization
Database
```

---

# 35. Aprobación de cambios

Los cambios que puedan afectar resultados clínicos o seguridad deberán tener una aprobación explícita antes de incorporarse a una baseline.

---

# 36. Control de configuración durante pruebas

Una prueba deberá ejecutarse contra una configuración identificada.

Ejemplo:

```text
Test:
ST-025

Software:
0.5.0

Model:
ML-2026.03

Config:
CC-0.5

DB:
DB-05
```

---

# 37. Configuration Status Accounting

Se mantendrá:

```text
configuration_status.csv
```

que permitirá responder:

> ¿Qué configuración estaba activa en una determinada fecha o release?

Columnas:

```text
baseline_id
release_id
ci_id
ci_version
status
effective_date
retirement_date
```

---

# 38. Ejemplo de estado de configuración

| Baseline | CI | Versión | Estado |
|---|---|---|---|
| REL-BL-0.5.0 | CI-CODE-001 | 0.5.0 | Active |
| REL-BL-0.5.0 | CI-MODEL-001 | ML-2026.03 | Active |
| REL-BL-0.5.0 | CI-CONFIG-001 | CC-0.5 | Active |
| REL-BL-0.5.0 | CI-DB-001 | DB-05 | Active |

---

# 39. Reproducibilidad

Una configuración deberá permitir determinar:

```text
Software
Model
Configuration
Database
Dependencies
Test Baseline
```

---

# 40. Ejecuciones clínicas

Cuando una ejecución de SISAP genere un resultado clínicamente relevante, deberá ser posible identificar la configuración utilizada.

Conceptualmente:

```text
Execution
    ↓
Software Version
    +
Model Version
    +
Configuration Version
    +
Database Schema
```

---

# 41. Datos clínicos como NO-CI

Los datos clínicos de pacientes no deberán convertirse en Configuration Items del repositorio de código.

Sin embargo, los **datasets de referencia y prueba** podrán considerarse Configuration Items cuando sean necesarios para reproducibilidad.

Ejemplo:

```text
CI-DATA-001
Synthetic Clinical Test Dataset
Version DATA-0.3
```

---

# 42. Datos de entrenamiento de modelos

Cuando sea necesario para reproducibilidad, los datasets de entrenamiento deberán identificarse mediante:

```text
Dataset ID
Version
Source
Date
Processing Version
```

El tratamiento concreto dependerá de la disponibilidad y sensibilidad de los datos.

---

# 43. Control de datasets

Los datasets de referencia no deberán modificarse silenciosamente.

Una modificación deberá generar:

```text
DATA-0.3
    ↓
DATA-0.4
```

---

# 44. Protección de secretos

No podrán formar parte de una baseline:

```text
.env
Passwords
API Keys
Secret Keys
Tokens
```

---

# 45. Protección de datos sensibles

No deberán formar parte del repositorio:

```text
Patient Database
Identifiable Clinical Data
Production Logs
Uncontrolled Reports
```

---

# 46. Integridad de releases

Cada release deberá estar asociada a:

```text
Git Tag
Commit
Baseline
Model
Configuration
Tests
Release Record
```

---

# 47. Release reproducible

La release deberá poder describirse:

```text
SISAP 0.5.0
│
├── Git: a84f29b
├── Model: ML-2026.03
├── Config: CC-0.5
├── DB: DB-05
├── Dependencies: DEP-05
└── Tests: ST-BL-05
```

---

# 48. Control de modificaciones posteriores

Una vez establecida una baseline:

```text
BASELINE
   ↓
NO DIRECT MODIFICATION
```

Todo cambio genera una nueva baseline o revisión formal.

---

# 49. Retiro de Configuration Items

Un CI podrá pasar a:

```text
DEPRECATED
```

cuando exista una sustitución.

Posteriormente:

```text
RETIRED
```

cuando deje de estar disponible para nuevas configuraciones.

---

# 50. Sustitución de modelos

Ejemplo:

```text
ML-2026.03
       ↓
ML-2026.04
```

El modelo anterior deberá conservarse históricamente cuando sea necesario para reproducibilidad de resultados anteriores.

---

# 51. Sustitución de dependencias

Ejemplo:

```text
DEP-05
   ↓
DEP-06
```

Debe registrarse:

- motivo;
- impacto;
- pruebas;
- autorización.

---

# 52. Sustitución de configuración clínica

Ejemplo:

```text
CC-0.5
   ↓
CC-0.6
```

Debe activarse:

```text
Impact Analysis
Risk Review
Testing
Release
```

---

# 53. Cambios de base de datos

Ejemplo:

```text
DB-05
   ↓
DB-06
```

deberá registrar la migración correspondiente.

---

# 54. Revisión de dependencias

Antes de una release deberá verificarse que las versiones instaladas correspondan con la configuración documentada.

---

# 55. Configuration Audit

En releases relevantes podrá realizarse una auditoría de configuración.

Debe comprobar:

```text
Repository
Tag
Commit
Models
Config
Database
Dependencies
Documentation
Tests
```

---

# 56. Configuration Audit Record

Ejemplo:

```text
CONFIG-AUDIT-001

Release:
0.5.0

Git Tag:
v0.5.0

Commit:
a84f29b

Model:
ML-2026.03

Configuration:
CC-0.5

Database:
DB-05

Dependencies:
DEP-05

Result:
PASS
```

---

# 57. Control de herramientas

Las herramientas utilizadas para construir o verificar una baseline relevante deberán identificarse.

Ejemplo:

```text
Python
Git
pytest
Build tools
Model runtime
```

---

# 58. Herramientas críticas

Si una herramienta puede alterar significativamente un Configuration Item, su versión deberá quedar registrada cuando resulte relevante.

---

# 59. Configuración del entorno

Una release deberá identificar, cuando corresponda:

```text
Operating System
Python Version
Package Versions
Environment Variables
Database
Model Runtime
```

---

# 60. Entornos

Cada entorno tendrá una configuración independiente:

```text
DEV
TEST
VALIDATION
PRODUCTION
```

---

# 61. Promoción de configuración

La configuración deberá promocionarse:

```text
DEV
 ↓
TEST
 ↓
VALIDATION
 ↓
PRODUCTION
```

Una versión diferente no deberá introducirse silenciosamente durante la promoción.

---

# 62. Artefactos generados

Los artefactos de build o empaquetado relevantes deberán poder asociarse con la release.

---

# 63. Integración con CI/CD

Cuando se implemente CI/CD, el pipeline deberá formar parte de la configuración controlada.

Ejemplos:

```text
.github/workflows/
```

o el mecanismo equivalente.

Los cambios al pipeline deberán someterse a control de configuración.

---

# 64. Automatización de controles

Se podrá automatizar la comprobación de:

```text
Version consistency
Dependency lock
Model hash
Tests
Tag
Configuration
```

---

# 65. Control de checksum

Los artefactos críticos podrán verificarse mediante:

```text
SHA-256
```

especialmente:

```text
ML models
Release packages
Important datasets
```

---

# 66. Relaciones de configuración

La configuración completa puede representarse:

```text
Release
│
├── Source
│
├── Model
│
├── Config
│
├── Database
│
├── Dependencies
│
├── Tests
│
└── Documentation
```

---

# 67. Configuration Graph

La relación deberá poder representarse:

```text
REL-0.5.0
│
├── CI-CODE-001 v0.5.0
├── CI-MODEL-001 ML-2026.03
├── CI-CONFIG-001 CC-0.5
├── CI-DB-001 DB-05
├── CI-DEP-001 DEP-05
└── CI-TEST-001 ST-BL-05
```

---

# 68. Trazabilidad con requisitos

Cuando corresponda:

```text
Requirement
   ↓
Configuration Item
   ↓
Release
```

---

# 69. Trazabilidad con riesgos

Cuando corresponda:

```text
Risk
 ↓
Risk Control
 ↓
Configuration Item
 ↓
Verification
 ↓
Release
```

---

# 70. Trazabilidad con pruebas

```text
Test
 ↓
Software Version
 ↓
Baseline
 ↓
Release
```

---

# 71. Cambios de emergencia

Los cambios urgentes podrán seguir un proceso acelerado, pero deberán conservar:

- identificación;
- impacto;
- aprobación;
- pruebas;
- y actualización posterior de la configuración.

La urgencia no elimina la trazabilidad.

---

# 72. Hotfix

Un hotfix deberá generar una versión identificable.

Ejemplo:

```text
0.5.0
   ↓
0.5.1
```

---

# 73. Reconciliación después de hotfix

Después de un hotfix deberá actualizarse la línea principal de desarrollo para evitar divergencias de configuración.

---

# 74. Control de versiones de documentación

Los cambios en:

```text
SRS
SAD
SDD
Risk File
Test Plans
```

deberán registrarse.

---

# 75. Documentación obsoleta

Las versiones anteriores deberán permanecer identificables como:

```text
SUPERSEDED
```

cuando hayan sido reemplazadas.

No deberán eliminarse sin una política de conservación adecuada.

---

# 76. Criterios de baseline

Una baseline podrá establecerse cuando:

- los CIs estén identificados;
- sus versiones estén determinadas;
- las pruebas aplicables estén completadas;
- los riesgos estén revisados;
- y exista autorización.

---

# 77. Criterios de liberación de configuración

Antes de una release:

```text
[ ] Código identificado
[ ] Modelos identificados
[ ] Configuración identificada
[ ] DB identificada
[ ] Dependencias identificadas
[ ] Tests identificados
[ ] Documentación identificada
[ ] Baseline creada
[ ] Release Tag creado
[ ] Release Record creado
```

---

# 78. Criterios de cierre de cambio

Un cambio podrá cerrarse cuando:

- la modificación esté implementada;
- las pruebas estén completas;
- los riesgos estén revisados;
- los CIs estén actualizados;
- la nueva baseline esté establecida;
- y la documentación correspondiente haya sido actualizada.

---

# 79. Estado de configuración

La organización deberá poder responder en cualquier momento:

> ¿Cuál era la configuración de SISAP en la versión X?

y:

> ¿Qué configuración produjo este resultado?

---

# 80. Registro de estado

El archivo:

```text
configuration_status.csv
```

deberá permitir responder esas preguntas.

---

# 81. Control de integridad

Una discrepancia entre:

```text
Documented Version
      ≠
Actual Version
```

deberá tratarse como una anomalía de configuración.

---

# 82. Gestión de discrepancias

Proceso:

```text
Discrepancy
   ↓
Identify
   ↓
Assess Impact
   ↓
Risk Review
   ↓
Correct
   ↓
Verify
```

---

# 83. Responsabilidades

## Responsable de configuración

Supervisa:

- registro de CIs;
- baselines;
- versiones;
- cambios;
- y estado de configuración.

## Desarrolladores

Son responsables de:

- identificar cambios;
- actualizar código;
- crear commits;
- y proporcionar información necesaria.

## Responsable de verificación

Verifica que las pruebas correspondan a la configuración evaluada.

## Responsable del producto

Aprueba cambios de alto impacto y releases según corresponda.

---

# 84. Separación de funciones

Cuando sea posible:

```text
Developer
    ≠
Release Approver
```

y las verificaciones de mayor impacto deberán mantener el nivel de independencia definido por el proceso de desarrollo y el riesgo.

---

# 85. Control de acceso

Los permisos sobre ramas, releases y artefactos deberán limitarse según responsabilidades.

---

# 86. Protección de la branch de producción

La rama utilizada como fuente de releases deberá protegerse contra modificaciones no autorizadas.

---

# 87. Control de eliminación

Los Configuration Items aprobados o asociados a releases no deberán eliminarse sin autorización y registro.

---

# 88. Backup

Los repositorios y artefactos relevantes deberán contar con mecanismos de respaldo adecuados.

---

# 89. Recuperación

La estrategia de recuperación deberá permitir reconstruir una release cuando los mecanismos principales fallen.

---

# 90. Retención

Las baselines y registros de releases deberán conservarse durante el periodo definido por la política documental aplicable.

---

# 91. Relación con mantenimiento

Durante mantenimiento:

```text
Existing Baseline
       ↓
Change
       ↓
Impact
       ↓
New Configuration
       ↓
New Baseline
```

---

# 92. Relación con modelos

Un nuevo modelo no sustituirá silenciosamente al anterior.

```text
Old Model
    ↓
New Model
    ↓
Verification
    ↓
New Baseline
```

---

# 93. Relación con riesgo

Todo cambio que afecte una medida de control de riesgo deberá activar revisión de riesgos.

---

# 94. Relación con pruebas

Todo cambio deberá analizar qué pruebas quedan afectadas.

---

# 95. Gestión de versiones incompatibles

Cuando dos elementos no sean compatibles:

```text
Compatibility = NO
```

deberá impedirse la combinación en producción.

---

# 96. Matriz de compatibilidad

Se mantendrá cuando sea necesaria:

| Software | Model | Config | DB | Compatible |
|---|---|---|---|---|
| 0.5.0 | ML-03 | CC-05 | DB-05 | YES |
| 0.5.0 | ML-04 | CC-05 | DB-05 | NO |
| 0.6.0 | ML-04 | CC-06 | DB-06 | YES |

---

# 97. Control de artefactos de release

Cada release deberá conservar:

```text
Release Package
Configuration Record
Release Record
Test Evidence
```

---

# 98. Ejemplo de Release Package

```text
RELEASE-0.5.0/
│
├── release_record.md
├── configuration.json
├── software/
├── models/
├── documentation/
└── evidence/
```

---

# 99. Configuration Manifest

Cada release podrá incluir:

```json
{
  "release_id": "RELEASE-0.5.0",
  "software_version": "0.5.0",
  "model_version": "ML-2026.03",
  "clinical_config": "CC-0.5",
  "database_schema": "DB-05",
  "dependency_set": "DEP-05",
  "test_baseline": "ST-BL-05"
}
```

---

# 100. Auditoría periódica

Las baselines podrán auditarse periódicamente para verificar:

- integridad;
- consistencia;
- trazabilidad;
- y correspondencia con el software realmente almacenado.

---

# 101. Criterios de aceptación del Configuration Management Plan

El plan podrá pasar a baseline cuando:

- los tipos de CI estén definidos;
- exista una convención de identificación;
- exista un registro de configuración;
- exista un proceso de cambio;
- estén definidos los tipos de baseline;
- esté definida la identificación de releases;
- esté contemplado el control de modelos;
- esté contemplado SOUP;
- exista trazabilidad;
- y estén definidos responsables.

---

# 102. Estado actual

| Elemento | Estado |
|---|---|
| Configuration Items | Definidos |
| CI IDs | Definidos |
| Versionado | Definido |
| Baselines | Definidas |
| Change Control | Definido |
| Status Accounting | Definido |
| Model Configuration | Definida |
| Database Versioning | Definido |
| Dependency Control | Definido |
| SOUP | Definido |
| Release Linkage | Definido |
| Configuration Audit | Definido |
| Responsabilidades | Definidas |
| Implementación física | Pendiente |

---

# 103. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de configuración | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 104. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 105. Declaración

> **SISAP by CENIVRA Software Configuration Management Plan establece el proceso para identificar, versionar, controlar, registrar y mantener la configuración del software durante todo su ciclo de vida.**
>
> Una configuración de SISAP no se define únicamente por la versión del código fuente. Una release deberá poder asociarse, cuando corresponda, con la versión del software, modelos ML, configuración clínica, esquema de base de datos, dependencias, documentación y evidencia de pruebas.
>
> Los cambios posteriores a una baseline deberán someterse al proceso de control de cambios y deberán generar nueva evidencia cuando corresponda.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria.