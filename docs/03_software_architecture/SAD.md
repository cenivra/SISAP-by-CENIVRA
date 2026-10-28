# SISAP by CENIVRA

# Software Architecture Description — SAD

**Documento:** Software Architecture Description  
**Identificador:** SISAP-SAD-001  
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
| Documento | Software Architecture Description |
| ID | SISAP-SAD-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma principal | Python |
| Interfaz | Dash |
| Framework web | Flask |
| Persistencia inicial | SQLite |
| ORM | SQLAlchemy |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 |

---

# 1. Propósito

Este documento describe la arquitectura de software de **SISAP by CENIVRA** y establece la organización lógica y técnica de sus componentes.

La SAD tiene como objetivos:

- definir la estructura arquitectónica del sistema;
- identificar los principales *software items*;
- definir las relaciones entre componentes;
- especificar interfaces internas y externas;
- establecer flujos de datos;
- definir límites entre responsabilidades;
- facilitar la implementación;
- facilitar la verificación;
- permitir la trazabilidad entre arquitectura, requisitos y riesgos;
- y proporcionar una base para la clasificación de seguridad de los componentes.

La arquitectura deberá evolucionar junto con los requisitos, riesgos y funcionalidades del sistema.

---

# 2. Alcance

Esta descripción arquitectónica cubre los componentes de software que forman SISAP by CENIVRA:

```text
Presentation Layer
Application Layer
Clinical Logic Layer
ML Layer
Risk & Alert Layer
Persistence Layer
Security Layer
Audit Layer
Configuration Layer
Reporting Layer
External Components
```

También cubre:

- comunicación entre capas;
- interfaces;
- dependencias;
- flujo de información clínica;
- flujo de inferencia;
- persistencia;
- seguridad;
- auditoría;
- y gestión de modelos.

---

# 3. Principios arquitectónicos

La arquitectura se basa en los siguientes principios.

## 3.1 Separación de responsabilidades

Cada componente deberá desempeñar una responsabilidad claramente definida.

## 3.2 Bajo acoplamiento

Los componentes deberán minimizar dependencias innecesarias.

## 3.3 Alta cohesión

Cada componente deberá agrupar funciones relacionadas.

## 3.4 Seguridad por diseño

Las funciones relacionadas con seguridad clínica, autenticación y control de acceso deberán diseñarse desde la arquitectura.

## 3.5 Trazabilidad

Los resultados relevantes deberán poder relacionarse con:

```text
Entrada
   ↓
Transformación
   ↓
Componente
   ↓
Modelo
   ↓
Resultado
```

## 3.6 Determinismo

Las operaciones deterministas deberán producir resultados reproducibles ante la misma entrada y configuración.

## 3.7 Aislamiento de modelos

Los modelos ML deberán estar desacoplados de la interfaz y de la lógica de persistencia.

## 3.8 Fallo seguro

Cuando un componente esencial falle, el sistema deberá evitar presentar resultados incompletos o inválidos como resultados válidos.

---

# 4. Vista general de la arquitectura

La arquitectura lógica de SISAP es:

```text
┌────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                      │
│                     Dash / UI / Views                      │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                       │
│ Controllers / Services / Use Cases / Workflow             │
└──────────────────────────┬─────────────────────────────────┘
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────────┐
│ CLINICAL       │ │ ML / ANALYTICS │ │ RISK / ALERT       │
│ LOGIC          │ │ ENGINE         │ │ ENGINE             │
└────────┬───────┘ └────────┬───────┘ └─────────┬──────────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                       │
│            SQLAlchemy / SQLite / Repositories              │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│              SECURITY / AUDIT / CONFIGURATION              │
└────────────────────────────────────────────────────────────┘
```

---

# 5. Arquitectura por capas

## 5.1 Presentation Layer

Responsable de la interacción con el usuario.

Tecnología principal:

```text
Dash
HTML
CSS
JavaScript auxiliar
```

Responsabilidades:

- mostrar información;
- recibir entradas;
- validar entradas básicas de interfaz;
- presentar resultados;
- mostrar alertas;
- controlar navegación;
- y solicitar operaciones a la Application Layer.

La Presentation Layer **no deberá implementar directamente reglas clínicas ni ejecutar modelos ML**.

---

# 6. Application Layer

La Application Layer coordina los casos de uso.

Responsabilidades:

- recibir solicitudes desde la interfaz;
- validar contexto;
- verificar permisos;
- ejecutar flujos;
- coordinar servicios;
- manejar errores;
- persistir resultados;
- y generar eventos de auditoría.

Ejemplo:

```text
Usuario
   ↓
Dashboard
   ↓
Assessment Service
   ↓
Clinical Engine
   ↓
ML Engine
   ↓
Risk Engine
   ↓
Persistence
```

La Application Layer actúa como orquestador y no deberá contener la implementación matemática de los modelos clínicos.

---

# 7. Clinical Logic Layer

Esta capa contiene la lógica clínica computacional.

Puede dividirse en:

```text
Clinical Logic
│
├── Assessment
├── Scoring
├── Transformations
├── Normalization
├── Composite Variables
├── Dimensional Analysis
└── Clinical Rules
```

Responsabilidades:

- cálculo de escalas;
- recodificación;
- scoring;
- normalización;
- variables derivadas;
- reglas;
- indicadores;
- representación dimensional.

La lógica clínica deberá estar separada de la interfaz.

---

# 8. ML / Analytics Layer

Esta capa contiene la ejecución de modelos estadísticos y de aprendizaje automático.

Arquitectura conceptual:

```text
ML Engine
│
├── Model Registry
├── Preprocessing
├── Normalization
├── Encoder
├── Latent Representation
├── Clustering
├── Reconstruction
├── Risk Models
├── Uncertainty
└── Model Output
```

Responsabilidades:

- cargar modelos autorizados;
- validar compatibilidad;
- preparar entradas;
- ejecutar inferencia;
- generar salidas;
- calcular métricas asociadas;
- devolver resultados estructurados.

El ML Engine no deberá:

- modificar datos clínicos directamente;
- controlar autenticación;
- implementar la interfaz;
- ni escribir directamente en la base de datos salvo mediante interfaces definidas.

---

# 9. Risk & Alert Layer

Este componente se considera arquitectónicamente relevante debido al potencial impacto clínico de sus salidas.

Arquitectura:

```text
Risk Engine
│
├── Risk Rules
├── Risk Models
├── Thresholds
├── Uncertainty
├── Alert Rules
└── Alert State
```

Responsabilidades:

- calcular niveles de riesgo;
- aplicar reglas;
- evaluar umbrales;
- generar alertas;
- registrar estado;
- y proporcionar resultados a la Application Layer.

Este componente deberá estar separado de la Presentation Layer.

---

# 10. Persistence Layer

La Persistence Layer controla el almacenamiento.

Tecnologías iniciales:

```text
SQLAlchemy
SQLite
```

Componentes:

```text
Persistence
│
├── Patient Repository
├── Assessment Repository
├── User Repository
├── Audit Repository
├── Model Registry Repository
└── Configuration Repository
```

La lógica clínica no deberá depender directamente de SQL.

Las operaciones deberán pasar mediante interfaces de persistencia.

---

# 11. Security Layer

La Security Layer centraliza mecanismos relacionados con:

```text
Authentication
Authorization
Session Management
Password Hashing
Secret Management
Access Control
```

Responsabilidades:

- autenticación;
- autorización;
- validación de sesión;
- gestión de roles;
- control de acceso;
- protección de credenciales.

La lógica de autorización deberá mantenerse fuera de la lógica clínica para reducir acoplamiento.

---

# 12. Audit Layer

La Audit Layer registra acciones relevantes.

Puede representar:

```text
Audit Service
│
├── Authentication Events
├── Patient Events
├── Assessment Events
├── Model Execution Events
├── Risk Events
├── Report Events
└── Administrative Events
```

Los eventos de auditoría deberán incluir, cuando corresponda:

- usuario;
- fecha/hora;
- operación;
- entidad;
- identificador;
- versión;
- resultado.

---

# 13. Configuration Layer

Centraliza la configuración del sistema.

Incluye:

```text
Application configuration
Database configuration
Environment configuration
Clinical constants
Model configuration
Feature flags
Security configuration
```

La configuración con impacto clínico deberá estar versionada.

---

# 14. Reporting Layer

Responsable de:

- generar informes;
- preparar información para exportación;
- estructurar resultados;
- incorporar advertencias;
- y conservar la trazabilidad de la versión utilizada.

La generación de reportes no deberá modificar la información clínica original.

---

# 15. Software Items

La arquitectura identifica inicialmente los siguientes *software items*:

| ID | Software Item | Responsabilidad |
|---|---|---|
| SWI-01 | Presentation Service | Interfaz Dash |
| SWI-02 | Application Service | Orquestación de casos de uso |
| SWI-03 | Assessment Service | Gestión de evaluaciones |
| SWI-04 | Clinical Scoring Engine | Scoring psicométrico |
| SWI-05 | Transformation Engine | Transformaciones |
| SWI-06 | Normalization Engine | Normalización |
| SWI-07 | Dimensional Engine | Representación dimensional |
| SWI-08 | ML Engine | Inferencia ML |
| SWI-09 | Model Registry | Gestión de modelos |
| SWI-10 | Risk Engine | Estratificación de riesgo |
| SWI-11 | Alert Engine | Generación de alertas |
| SWI-12 | Longitudinal Engine | Análisis longitudinal |
| SWI-13 | NLP Engine | Procesamiento narrativo |
| SWI-14 | Security Service | Autenticación/autorización |
| SWI-15 | Audit Service | Auditoría |
| SWI-16 | Persistence Service | Persistencia |
| SWI-17 | Reporting Service | Reportes |
| SWI-18 | Configuration Service | Configuración |

La lista podrá ampliarse durante el diseño detallado.

---

# 16. Identificación de componentes de alto impacto

Como principio arquitectónico, los siguientes componentes deberán recibir especial consideración en la clasificación de seguridad:

```text
SWI-04 Clinical Scoring Engine
SWI-07 Dimensional Engine
SWI-08 ML Engine
SWI-10 Risk Engine
SWI-11 Alert Engine
SWI-12 Longitudinal Engine
```

La clasificación definitiva A/B/C no se establece en esta SAD por sí sola.

La clasificación deberá derivarse del análisis de riesgos y del uso previsto.

---

# 17. Interfaces entre componentes

Las interfaces internas deberán utilizar contratos claramente definidos.

Arquitectura principal:

```text
Dash
   ↓
Application Services
   ↓
Clinical Engine
   ↓
ML Engine
   ↓
Risk Engine
   ↓
Persistence
```

Una interfaz podrá conceptualizarse como:

```text
Input
 ↓
Validation
 ↓
Processing
 ↓
Output
 ↓
Error Handling
```

Cada interfaz deberá especificar:

- entradas;
- tipos;
- restricciones;
- salida;
- errores;
- excepciones;
- y condiciones de ejecución.

---

# 18. Interfaz Presentation → Application

```text
Dash
  │
  │ Request
  ▼
Application Service
  │
  │ Response
  ◄────────────────────
```

Entradas posibles:

```text
patient_id
assessment_id
user_id
form_data
action
```

Salidas posibles:

```text
status
result
errors
warnings
metadata
```

La Presentation Layer no deberá invocar directamente el motor ML o la base de datos.

---

# 19. Interfaz Application → Clinical Engine

Ejemplo:

```text
Assessment Service
       │
       ▼
Clinical Scoring Engine
       │
       ▼
Clinical Result
```

Entrada:

```text
AssessmentData
```

Salida:

```text
ClinicalScore
```

El resultado deberá contener, cuando corresponda:

```text
score
scale
validity
missing_items
version
```

---

# 20. Interfaz Clinical Engine → ML Engine

```text
Clinical Features
       │
       ▼
ML Engine
       │
       ▼
ML Result
```

Entrada:

```text
FeatureVector
```

Salida:

```text
latent_representation
cluster
prediction
reconstruction_error
uncertainty
model_version
```

El ML Engine deberá verificar que el vector de entrada corresponda con el modelo seleccionado.

---

# 21. Interfaz ML Engine → Risk Engine

```text
ML Output
    +
Clinical Indicators
    +
Longitudinal Features
          │
          ▼
      Risk Engine
          │
          ▼
      Risk Result
```

La interfaz deberá permitir identificar:

- variables utilizadas;
- modelo;
- versión;
- parámetros;
- resultado;
- incertidumbre;
- y timestamp.

---

# 22. Interfaz Risk Engine → Alert Engine

```text
Risk Result
    +
Clinical Rules
    +
Thresholds
          │
          ▼
     Alert Engine
          │
          ▼
        Alert
```

Una alerta deberá incluir:

```text
alert_id
alert_type
severity
trigger
status
timestamp
source_version
```

---

# 23. Interfaz Application → Persistence

```text
Application Service
       │
       ▼
Repository
       │
       ▼
SQLAlchemy
       │
       ▼
SQLite
```

Los repositorios serán responsables de traducir objetos de dominio a estructuras persistentes.

La lógica clínica no deberá depender de SQL específico.

---

# 24. Flujo clínico principal

El flujo completo esperado es:

```text
Paciente
   │
   ▼
Evaluación
   │
   ▼
Captura de respuestas
   │
   ▼
Validación
   │
   ▼
Scoring
   │
   ▼
Normalización
   │
   ▼
Representación dimensional
   │
   ▼
Modelo ML
   │
   ├─────────────► Perfil
   │
   ├─────────────► Cluster
   │
   ├─────────────► Reconstrucción
   │
   └─────────────► Incertidumbre
   │
   ▼
Risk Engine
   │
   ▼
Alert Engine
   │
   ▼
Interpretación clínica
   │
   ▼
Dashboard / Reporte
   │
   ▼
Auditoría
```

---

# 25. Flujo de validación de datos

Toda entrada clínica deberá seguir:

```text
Entrada
   ↓
Validación sintáctica
   ↓
Validación de tipo
   ↓
Validación de rango
   ↓
Validación de completitud
   ↓
Validación clínica
   ↓
Dato aceptado
```

Si una validación falla:

```text
Entrada inválida
      ↓
Error / Warning
      ↓
No utilizar para inferencia
```

---

# 26. Flujo de inferencia ML

```text
Input
  │
  ▼
Schema Validation
  │
  ▼
Preprocessing
  │
  ▼
Normalization
  │
  ▼
Model Compatibility Check
  │
  ▼
Model Load
  │
  ▼
Inference
  │
  ▼
Output Validation
  │
  ▼
Uncertainty / Metrics
  │
  ▼
Structured ML Result
```

Cualquier fallo crítico deberá impedir que la salida incompleta sea presentada como resultado válido.

---

# 27. Flujo de riesgo

```text
Clinical Features
       │
       ▼
Risk Inputs Validation
       │
       ▼
Risk Model / Rules
       │
       ▼
Risk Score
       │
       ▼
Threshold Evaluation
       │
       ▼
Risk Level
       │
       ▼
Alert Evaluation
```

La implementación definitiva de umbrales deberá encontrarse fuera de la interfaz y estar controlada mediante configuración versionada.

---

# 28. Flujo longitudinal

```text
Evaluación T1
      │
      ▼
Evaluación T2
      │
      ▼
Evaluación T3
      │
      ▼
Longitudinal Engine
      │
      ├── Trends
      ├── Change Scores
      ├── Trajectories
      ├── Dynamic Risk
      └── Alerts
```

El Longitudinal Engine deberá considerar la compatibilidad entre versiones de variables y modelos antes de comparar resultados.

---

# 29. Gestión del estado

El sistema distinguirá al menos:

```text
Draft
Validated
Processed
Completed
Error
Archived
```

Una evaluación con error no deberá presentarse como completada.

---

# 30. Manejo de errores arquitectónico

Los errores se clasifican conceptualmente en:

```text
Validation Error
Authentication Error
Authorization Error
Clinical Processing Error
ML Error
Persistence Error
Configuration Error
Integration Error
System Error
```

Cada error deberá:

- identificarse;
- registrarse cuando corresponda;
- presentarse apropiadamente al usuario;
- y evitar estados inconsistentes.

---

# 31. Fallos de componentes clínicos

## 31.1 Fallo del scoring

```text
Scoring failure
       ↓
No valid score
       ↓
Assessment marked incomplete/error
```

## 31.2 Fallo del modelo ML

```text
ML failure
       ↓
No valid ML result
       ↓
Risk inference based on ML disabled
       ↓
User informed
```

## 31.3 Fallo del Risk Engine

```text
Risk failure
       ↓
No valid risk level
       ↓
No false fallback value
       ↓
Clinical user informed
```

## 31.4 Fallo de persistencia

```text
Database failure
       ↓
Operation not confirmed
       ↓
User informed
       ↓
Audit / error record
```

---

# 32. Seguridad arquitectónica

La arquitectura deberá aplicar:

```text
Authentication
      ↓
Authorization
      ↓
Service Access
      ↓
Data Access
```

Ninguna función clínica protegida deberá depender únicamente de ocultar elementos en la interfaz.

El control de autorización deberá existir en la capa de servicio.

---

# 33. Principio de mínimo privilegio

Cada componente deberá disponer únicamente de acceso a los recursos requeridos.

Ejemplo:

```text
Presentation
  └── no direct DB access

Clinical Engine
  └── no user administration

ML Engine
  └── no direct UI control

Audit Service
  └── controlled write access

Admin Service
  └── elevated privileges
```

---

# 34. Seguridad de datos

Los datos deberán seguir:

```text
Input
 ↓
Validation
 ↓
Authorized Processing
 ↓
Controlled Storage
 ↓
Authorized Retrieval
```

Los datos identificables deberán separarse, cuando sea posible, de los datos analíticos.

---

# 35. Modelo de datos arquitectónico

Las entidades principales son:

```text
User
  │
  ├── Role
  │
  ▼
Patient
  │
  ▼
Assessment
  │
  ├── Responses
  ├── Clinical Scores
  ├── Dimensional Results
  ├── ML Results
  ├── Risk Results
  ├── Alerts
  └── Narrative / NLP
```

Y transversalmente:

```text
Assessment
      │
      ├── Audit Events
      ├── Model Version
      ├── Software Version
      └── Configuration Version
```

---

# 36. Modelo de persistencia

La estructura inicial será:

```text
users
patients
assessments
audit_events
```

Podrán añadirse:

```text
models
model_versions
risk_results
alerts
clinical_scores
dimensional_results
narratives
```

cuando el desarrollo lo requiera.

La decisión de normalización de tablas deberá evaluarse en función de:

- integridad;
- trazabilidad;
- rendimiento;
- auditabilidad;
- y facilidad de mantenimiento.

---

# 37. Model Registry

El Model Registry deberá proporcionar una capa de abstracción entre los modelos físicos y el resto del sistema.

Conceptualmente:

```text
Model Registry
│
├── Model ID
├── Version
├── Artifact
├── Input Schema
├── Preprocessing
├── Normalization
├── Metrics
├── Hash
├── Status
└── Compatibility
```

Estados posibles:

```text
development
validation
approved
deprecated
retired
```

Únicamente los modelos autorizados podrán utilizarse en producción.

---

# 38. Compatibilidad modelo–datos

Antes de ejecutar un modelo deberá verificarse:

```text
Variables
+
Tipos
+
Orden
+
Transformaciones
+
Normalización
+
Dimensiones
+
Versión
```

Si existe incompatibilidad:

```text
Model incompatible
       ↓
Inference blocked
```

---

# 39. Versionado arquitectónico

Una versión de software deberá identificar, cuando corresponda:

```text
Software Version
Model Version
Clinical Configuration Version
Database Schema Version
Dependency Version Set
```

Ejemplo:

```text
SISAP Software     0.5.0
Model              ML-2026.03
Clinical Config    CC-0.4
Database Schema    DB-0.5
```

---

# 40. Dependencias externas

La arquitectura dependerá inicialmente de componentes como:

```text
Python
Dash
Flask
SQLAlchemy
NumPy
Pandas
SciPy
scikit-learn
TensorFlow / Keras
PyTorch
```

Estos componentes deberán mantenerse identificados y controlados mediante el inventario SOUP correspondiente.

---

# 41. Interfaz con componentes externos

Las dependencias externas deberán interactuar mediante interfaces documentadas.

Ejemplo:

```text
SISAP
  │
  ├── Python Runtime
  ├── Dash
  ├── Flask
  ├── SQLAlchemy
  ├── ML Framework
  └── Scientific Libraries
```

El sistema no deberá depender de comportamientos no documentados de componentes externos cuando dichos comportamientos puedan afectar seguridad o resultados clínicos.

---

# 42. Arquitectura de seguridad de modelos

Los artefactos de modelos deberán estar protegidos contra:

- sustitución accidental;
- modificación no autorizada;
- incompatibilidad;
- corrupción;
- pérdida;
- y ejecución fuera de configuración.

Flujo:

```text
Model Requested
      ↓
Registry Lookup
      ↓
Version Check
      ↓
Integrity Check
      ↓
Compatibility Check
      ↓
Load
      ↓
Inference
```

---

# 43. Arquitectura de auditoría

Los eventos críticos deberán seguir:

```text
Action
 ↓
Audit Event
 ↓
Timestamp
 ↓
User
 ↓
Entity
 ↓
Software Version
 ↓
Model Version
```

Cuando corresponda.

La auditoría no deberá depender de que el usuario final introduzca manualmente la información de trazabilidad.

---

# 44. Arquitectura para trazabilidad clínica

Una operación clínica relevante deberá poder representar:

```text
Patient
   ↓
Assessment
   ↓
Input Data
   ↓
Clinical Processing
   ↓
Model Execution
   ↓
Risk Result
   ↓
Alert
   ↓
Clinical Presentation
```

Cada paso deberá poder relacionarse con sus identificadores y versiones correspondientes.

---

# 45. Separación entre resultado y decisión clínica

La arquitectura deberá mantener una frontera explícita:

```text
COMPUTATIONAL DOMAIN
────────────────────────────
Data
Scoring
ML
Risk
Alerts
Metrics
────────────────────────────
CLINICAL DOMAIN
────────────────────────────
Professional review
Clinical interpretation
Decision
Intervention
```

El software podrá generar información de apoyo, pero no deberá asumir que la salida computacional constituye automáticamente una decisión clínica.

---

# 46. Requisitos arquitectónicos derivados de seguridad

La arquitectura establece los siguientes controles:

### AR-SAF-001

Los resultados inválidos no deberán presentarse como resultados válidos.

### AR-SAF-002

El fallo del ML Engine deberá impedir la generación de una salida ML falsa.

### AR-SAF-003

El fallo del Risk Engine deberá impedir la presentación de un nivel de riesgo ficticio.

### AR-SAF-004

Las funciones de mayor impacto clínico deberán estar aisladas de la interfaz.

### AR-SAF-005

La autenticación y autorización deberán ejecutarse antes del acceso a funciones protegidas.

### AR-SAF-006

Los modelos deberán identificarse por versión.

### AR-SAF-007

Los parámetros clínicos relevantes deberán permanecer bajo control de configuración.

---

# 47. Independencia de componentes

La arquitectura deberá evitar:

```text
UI → Database
UI → ML Model
UI → Clinical Rules
```

y favorecer:

```text
UI
 ↓
Application
 ↓
Domain Services
 ↓
Repositories / Engines
 ↓
Infrastructure
```

Esto reduce el acoplamiento y facilita la verificación.

---

# 48. Pruebas arquitectónicas

La arquitectura deberá permitir verificar:

```text
Component isolation
Interface contracts
Error propagation
Authorization
Data integrity
Model compatibility
Persistence
Audit
```

Cada interfaz crítica deberá disponer de casos de prueba.

---

# 49. Arquitectura para pruebas

Se favorecerá la inyección de dependencias y componentes sustituibles.

Ejemplo:

```text
Application Service
       │
       ├── Clinical Engine
       ├── ML Engine
       ├── Risk Engine
       └── Repository
```

Durante pruebas, podrán utilizarse implementaciones controladas:

```text
MockClinicalEngine
MockMLEngine
MockRiskEngine
MockRepository
```

Esto permitirá aislar componentes.

---

# 50. Arquitectura de desarrollo, pruebas y producción

```text
DEVELOPMENT
    │
    ▼
TEST
    │
    ▼
VALIDATION
    │
    ▼
PRODUCTION
```

Los artefactos deberán promoverse de manera controlada.

No deberá utilizarse directamente un modelo en desarrollo en producción.

---

# 51. Restricciones arquitectónicas

Las siguientes restricciones serán aplicables:

1. La Presentation Layer no accederá directamente a la base de datos.
2. La lógica clínica no estará implementada directamente en callbacks de Dash.
3. Los modelos ML estarán desacoplados de la UI.
4. Los resultados deberán pasar por validación.
5. Los controles de autorización no dependerán exclusivamente de la interfaz.
6. Las configuraciones con impacto clínico estarán versionadas.
7. Los modelos estarán identificados por versión.
8. Los artefactos sensibles no estarán almacenados en el repositorio de código.

---

# 52. Estructura física propuesta

La arquitectura podrá implementarse inicialmente como:

```text
app/
│
├── __init__.py
│
├── config.py
│
├── clinical/
│   ├── __init__.py
│   ├── scoring.py
│   ├── normalization.py
│   ├── dimensions.py
│   └── rules.py
│
├── ml/
│   ├── __init__.py
│   ├── engine.py
│   ├── registry.py
│   ├── preprocessing.py
│   └── inference.py
│
├── risk/
│   ├── __init__.py
│   ├── engine.py
│   └── alerts.py
│
├── services/
│   ├── __init__.py
│   ├── assessment_service.py
│   ├── patient_service.py
│   └── reporting_service.py
│
├── database/
│   ├── __init__.py
│   ├── connection.py
│   ├── models.py
│   └── repositories/
│
├── security/
│   ├── __init__.py
│   ├── auth.py
│   ├── authorization.py
│   └── password.py
│
├── audit/
│   ├── __init__.py
│   └── service.py
│
├── reporting/
│   ├── __init__.py
│   └── reports.py
│
├── ui/
│   ├── __init__.py
│   ├── layout.py
│   └── pages/
│
└── utils/
    ├── __init__.py
    └── helpers.py
```

Esta estructura es una propuesta arquitectónica y podrá refinarse durante el diseño detallado.

---

# 53. Dependencias entre módulos

La dirección preferente de dependencias será:

```text
ui
 ↓
services
 ↓
clinical / ml / risk
 ↓
repositories
 ↓
database
```

Los servicios transversales:

```text
security
audit
configuration
```

proporcionarán funciones a los demás componentes sin generar ciclos de dependencia.

---

# 54. Prohibición de dependencias circulares

Deberán evitarse arquitecturas como:

```text
Clinical → UI → Clinical
ML → Database → ML
Risk → UI → Risk
```

Las dependencias circulares deberán considerarse defecto arquitectónico salvo justificación documentada.

---

# 55. Seguridad y clasificación de software items

La identificación de *software items* permite posteriormente analizar:

```text
Software Item
      ↓
Function
      ↓
Potential Failure
      ↓
Hazard Contribution
      ↓
Safety Classification
```

La arquitectura favorece la separación de los componentes potencialmente más críticos para permitir una clasificación y control de riesgos apropiados.

---

# 56. Arquitectura de fallos seguros

La arquitectura deberá evitar *silent failures*.

Ejemplo:

```text
Expected result
      │
      ├── SUCCESS → Validated Result
      │
      └── FAILURE → Explicit Error State
```

No deberá implementarse:

```text
Failure
  ↓
Last Result
  ↓
Present as Current Result
```

salvo que exista una especificación explícita y un control de riesgo que lo justifique.

---

# 57. Arquitectura de resultados

Todo resultado analítico relevante deberá poder representarse conceptualmente como:

```text
Result
│
├── value
├── status
├── source
├── version
├── timestamp
├── uncertainty
└── metadata
```

Por ejemplo:

```text
RiskResult
│
├── risk_level
├── risk_score
├── uncertainty
├── model_version
├── configuration_version
└── timestamp
```

---

# 58. Consideraciones de escalabilidad

SQLite será utilizado inicialmente por su simplicidad y adecuación al entorno inicial.

La arquitectura deberá evitar dependencias que impidan posteriormente evolucionar a otra base de datos.

El acceso a persistencia deberá realizarse mediante repositorios para facilitar una eventual sustitución.

---

# 59. Consideraciones de mantenibilidad

La arquitectura deberá favorecer:

- módulos pequeños;
- interfaces explícitas;
- pruebas independientes;
- bajo acoplamiento;
- nombres consistentes;
- configuración externa;
- documentación;
- y control de dependencias.

---

# 60. Consideraciones de rendimiento

Los componentes que ejecuten modelos o análisis intensivos deberán estar desacoplados de la lógica de presentación.

La arquitectura deberá permitir posteriormente incorporar:

- caching;
- procesamiento asíncrono;
- colas;
- ejecución en background;
- o servicios separados,

sin modificar la capa clínica fundamental.

---

# 61. Consideraciones de disponibilidad

El sistema deberá diferenciar entre:

```text
System unavailable
Component unavailable
Result unavailable
```

La ausencia de un componente no deberá interpretarse automáticamente como un valor clínico.

---

# 62. Consideraciones de integridad

La arquitectura deberá proteger la integridad de:

- datos clínicos;
- resultados;
- configuraciones;
- modelos;
- y auditoría.

Los resultados persistidos deberán estar relacionados con su contexto de generación.

---

# 63. Registro de configuración arquitectónica

La versión de arquitectura deberá quedar identificada.

Ejemplo:

```text
SISAP Architecture
Version: ARCH-0.5
Software: 0.5.0
```

Los cambios arquitectónicos deberán seguir el proceso de control de cambios.

---

# 64. Criterios de aceptación de la arquitectura

La arquitectura podrá considerarse lista para baseline cuando:

- los principales componentes estén identificados;
- las responsabilidades estén definidas;
- las interfaces principales estén documentadas;
- los flujos clínicos estén definidos;
- los flujos ML estén definidos;
- los límites de seguridad estén documentados;
- los *software items* estén identificados;
- las dependencias principales estén documentadas;
- los puntos de fallo estén identificados;
- y exista correspondencia con los requisitos relevantes de la SRS.

---

# 65. Trazabilidad SRS → SAD

La relación inicial será:

| Requisito | Software Item |
|---|---|
| REQ-SEC-* | SWI-14 Security Service |
| REQ-USER-* | SWI-14 / SWI-02 |
| REQ-PAT-* | SWI-03 / SWI-16 |
| REQ-EVAL-* | SWI-03 / SWI-16 |
| REQ-CLIN-* | SWI-04 |
| REQ-NORM-* | SWI-06 |
| REQ-DIM-* | SWI-07 |
| REQ-ML-* | SWI-08 / SWI-09 |
| REQ-CLUST-* | SWI-08 |
| REQ-RISK-* | SWI-10 |
| REQ-ALERT-* | SWI-11 |
| REQ-LONG-* | SWI-12 |
| REQ-NLP-* | SWI-13 |
| REQ-REP-* | SWI-17 |
| REQ-AUD-* | SWI-15 |
| REQ-DB-* | SWI-16 |
| REQ-CFG-* | SWI-18 |
| REQ-REPRO-* | SWI-08 / SWI-09 / SWI-18 |
| REQ-SAF-* | SWI-04 / SWI-08 / SWI-10 / SWI-11 |

Esta tabla es preliminar y deberá evolucionar conforme se aprueben la SRS y la arquitectura detallada.

---

# 66. Relación con gestión de riesgos

Los riesgos deberán enlazarse con componentes concretos.

Ejemplo:

```text
RISK-ML-001
       ↓
SWI-08 ML Engine
       ↓
AR-SAF-002
       ↓
TEST-ML-001
```

Otro ejemplo:

```text
RISK-ALERT-001
       ↓
SWI-11 Alert Engine
       ↓
AR-SAF-003
       ↓
TEST-ALERT-001
```

---

# 67. Próximo nivel de diseño

La presente SAD será seguida por el **Software Detailed Design**, donde se especificarán:

- clases;
- módulos;
- funciones;
- estructuras de datos;
- contratos;
- APIs internas;
- validaciones;
- manejo de excepciones;
- algoritmos;
- y dependencias concretas.

La SAD define **qué componentes existen y cómo se relacionan**.

El diseño detallado definirá **cómo se implementa cada componente**.

---

# 68. Estado actual

| Elemento | Estado |
|---|---|
| Arquitectura general | Definida |
| Capas | Definidas |
| Software Items | Identificados preliminarmente |
| Interfaces | Definidas conceptualmente |
| Flujos de datos | Definidos |
| Flujo ML | Definido |
| Flujo de riesgo | Definido |
| Seguridad arquitectónica | Definida conceptualmente |
| Persistencia | Definida inicialmente |
| Model Registry | Definido |
| Clasificación A/B/C | Pendiente de análisis formal |
| Diseño detallado | Pendiente |
| Matriz completa SRS → SAD | Pendiente |
| Revisión arquitectónica formal | Pendiente |

---

# 69. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 70. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión arquitectónica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 71. Declaración

> **SISAP by CENIVRA Software Architecture Description define la arquitectura de referencia del sistema y sus principales componentes de software.**
>
> La arquitectura deberá mantenerse bajo control de configuración y deberá actualizarse cuando cambios de requisitos, riesgos, tecnología o funcionalidades puedan afectar la estructura del sistema.
>
> La clasificación definitiva de seguridad de los *software items* y la evaluación de riesgos no se establecen exclusivamente mediante esta SAD y deberán formalizarse en los documentos correspondientes.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria.