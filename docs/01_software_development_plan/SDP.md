# SISAP by CENIVRA

> [!NOTE]
> **Control Documental (Fuente Única de Verdad `v1.1.0`):** Este archivo se conserva como registro histórico de la fase conceptual inicial (`v1.0`, agosto 2026, Python / Dash). El Plan de Desarrollo de Software (SDP) **vigente para la línea `v1.1.0` (Electron + React + Node.js SQLite WAL + R)** reside en [`docs/lifecycle/02_software_development_plan/SOFTWARE_DEVELOPMENT_PLAN_v1.1.md`](../lifecycle/02_software_development_plan/SOFTWARE_DEVELOPMENT_PLAN_v1.1.md).
## Software Development Plan (SDP)

**Documento:** Software Development Plan  
**Identificador:** SISAP-SDP-001  
**Versión:** 1.0  
**Estado:** En desarrollo controlado  
**Fecha:** Agosto 2026  
**Producto:** SISAP by CENIVRA  
**Responsable:** Psic. Lauro Gutiérrez Castro

---

# 1. Propósito

El presente **Software Development Plan (SDP)** establece el proceso mediante el cual será diseñado, desarrollado, verificado, liberado, mantenido y retirado **SISAP by CENIVRA**.

El documento define:

- el modelo de ciclo de vida;
- las actividades de desarrollo;
- las responsabilidades;
- las herramientas;
- los entornos;
- la gestión de requisitos;
- la arquitectura;
- la implementación;
- la verificación;
- la integración;
- las pruebas de sistema;
- la liberación;
- el mantenimiento;
- la gestión de configuración;
- la resolución de problemas;
- la gestión de riesgos;
- la documentación;
- la gestión de componentes de terceros;
- los criterios de entrada y salida;
- el control de cambios;
- el control de versiones;
- y la identificación de defectos comunes.

Este documento constituye el documento rector del proceso de desarrollo de software de SISAP by CENIVRA.

El SDP se desarrolla tomando como marco de referencia **IEC 62304:2006 + AMD1:2015 — Medical device software — Software life cycle processes**, complementado con principios de gestión de riesgos de software y prácticas de ingeniería de software orientadas a sistemas clínicos.

> **Nota:** La existencia de este SDP no constituye por sí misma una declaración de conformidad con IEC 62304 ni una certificación regulatoria.

---

# 2. Alcance

Este SDP aplica al desarrollo del software de **SISAP by CENIVRA**, incluyendo:

```text
Interfaz de usuario
        │
        ▼
Servicios de aplicación
        │
        ▼
Lógica clínica
        │
        ├── Scoring psicométrico
        ├── Transformaciones
        ├── Normalización
        ├── Indicadores
        └── Reglas clínicas
        │
        ▼
Motor analítico
        │
        ├── Representación dimensional
        ├── Modelos ML
        ├── Clustering
        ├── Métricas
        └── Incertidumbre
        │
        ▼
Presentación clínica
        │
        ├── Perfil
        ├── Riesgo
        ├── Alertas
        ├── Seguimiento
        └── Reportes
        │
        ▼
Persistencia y auditoría
```

El alcance incluye tanto el software desarrollado específicamente para SISAP como los componentes externos necesarios para su funcionamiento.

Quedan fuera del alcance directo de este SDP:

- procedimientos clínicos realizados por profesionales;
- protocolos terapéuticos institucionales;
- evaluación clínica independiente del paciente;
- validación de instrumentos psicométricos originales;
- y decisiones clínicas realizadas por profesionales.

Estos elementos podrán interactuar con SISAP, pero no forman parte del software objeto de este plan.

---

# 3. Uso previsto

SISAP by CENIVRA está destinado a proporcionar **información estructurada de apoyo a profesionales** durante la evaluación, estratificación dimensional y seguimiento de personas atendidas por trastornos por uso de sustancias.

El sistema podrá:

- procesar respuestas psicométricas;
- generar puntuaciones;
- representar información clínica en espacios dimensionales;
- ejecutar modelos estadísticos y de aprendizaje automático;
- generar perfiles;
- identificar patrones;
- estimar niveles de riesgo definidos por el sistema;
- generar alertas;
- proporcionar información longitudinal;
- y presentar resultados para revisión profesional.

El sistema **no deberá considerarse un sustituto del profesional**.

Las decisiones clínicas deberán permanecer bajo responsabilidad del profesional autorizado.

---

# 4. Organización del desarrollo

El desarrollo se organizará alrededor de las siguientes responsabilidades:

### Responsable del producto

Supervisa:

- alcance;
- uso previsto;
- decisiones de producto;
- prioridades;
- y aprobación de cambios relevantes.

### Responsable clínico

Supervisa:

- definiciones clínicas;
- variables;
- reglas;
- interpretación;
- criterios clínicos;
- y revisión de resultados.

### Responsable de software

Supervisa:

- arquitectura;
- implementación;
- repositorio;
- integración;
- dependencias;
- pruebas;
- y liberaciones.

### Responsable de verificación

Supervisa:

- estrategia de pruebas;
- evidencia de verificación;
- revisión de resultados;
- pruebas de regresión;
- y criterios de aceptación.

En una estructura pequeña una misma persona podrá desempeñar más de una función, siempre que el nivel de independencia requerido para las actividades de verificación se mantenga de manera proporcional al riesgo del software.

---

# 5. Modelo de ciclo de vida

SISAP utilizará un modelo de desarrollo **incremental, controlado y orientado a riesgos**.

Cada incremento funcional seguirá, cuando corresponda, el siguiente ciclo:

```text
Necesidad
   ↓
Requisito
   ↓
Análisis de riesgo
   ↓
Arquitectura / diseño
   ↓
Implementación
   ↓
Verificación
   ↓
Integración
   ↓
Prueba de sistema
   ↓
Liberación
   ↓
Mantenimiento
```

Las actividades de gestión de configuración, gestión de riesgos y resolución de problemas se desarrollarán de forma transversal.

El modelo podrá ejecutarse iterativamente.

Un incremento no podrá considerarse completado únicamente porque el código funcione; deberá satisfacer los criterios de aceptación definidos y contar con la evidencia requerida.

---

# 6. Fases del desarrollo

El desarrollo de SISAP se organizará inicialmente en las siguientes fases:

| Fase | Objetivo |
|---|---|
| 0 | Uso previsto, alcance y planificación |
| 1 | Auditoría y preparación de datos |
| 2 | Configuración, estructura y base de datos |
| 3 | Scoring clínico |
| 4 | Modelos de aprendizaje automático |
| 5 | Servicios clínicos |
| 6 | Autenticación y control de acceso |
| 7 | Expediente clínico |
| 8 | Dashboard clínico |
| 9 | Perfil dimensional |
| 10 | Seguimiento longitudinal |
| 11 | Alertas y apoyo a la decisión |
| 12 | Reportes y trazabilidad |
| 13 | Integración completa |
| 14 | Verificación y validación |
| 15 | Primera liberación controlada |
| 16+ | Mantenimiento y evolución |

Las fases son una estructura de gestión del proyecto y no sustituyen las actividades específicas de desarrollo, verificación, gestión de riesgos y configuración.

---

# 7. Herramientas

Las herramientas deberán seleccionarse considerando:

- reproducibilidad;
- estabilidad;
- soporte;
- capacidad de auditoría;
- control de versiones;
- seguridad;
- compatibilidad;
- y adecuación a las funciones clínicas.

Herramientas inicialmente previstas:

```text
IDE / Editor
├── Visual Studio Code
└── PyCharm (opcional)

Control de versiones
└── Git / GitHub

Entorno Python
└── Python virtual environment

Gestión de dependencias
├── pip
└── requirements.txt

Pruebas
└── pytest

Base de datos
└── SQLite

ORM
└── SQLAlchemy

Interfaz
└── Dash

Servidor / aplicación
└── Flask

Análisis científico
├── NumPy
├── Pandas
├── SciPy
└── scikit-learn

Machine Learning
├── TensorFlow / Keras
└── PyTorch, cuando corresponda
```

Las versiones utilizadas en una liberación deberán quedar registradas.

---

# 8. Lenguajes

El lenguaje principal del producto será:

```text
Python
```

También podrán utilizarse:

```text
HTML
CSS
JavaScript
SQL
Bash / PowerShell
YAML / JSON
```

Los lenguajes y formatos auxiliares deberán utilizarse únicamente cuando exista una función definida dentro de la arquitectura.

---

# 9. Entornos

SISAP deberá mantener como mínimo tres entornos conceptuales:

```text
DESARROLLO
      ↓
PRUEBAS
      ↓
PRODUCCIÓN
```

## Desarrollo

Utilizado para:

- implementación;
- experimentación;
- depuración;
- desarrollo de nuevas funcionalidades.

## Pruebas

Utilizado para:

- integración;
- pruebas de regresión;
- verificación;
- pruebas de sistema;
- validación técnica.

## Producción

Utilizado únicamente para versiones aprobadas.

Los datos de desarrollo y prueba deberán mantenerse separados de los datos clínicos reales.

---

# 10. Repositorios

El código fuente deberá mantenerse bajo control de versiones.

El repositorio deberá contener:

```text
app/
assets/
tests/
docs/
requirements.txt
README.md
.gitignore
```

No deberán almacenarse directamente en el repositorio:

```text
.env
bases de datos clínicas
datos identificables
expedientes
credenciales
modelos de producción no controlados
logs clínicos
```

Los artefactos de modelos y datos que deban mantenerse fuera del repositorio deberán conservar un mecanismo de identificación y versión.

---

# 11. Gestión de requisitos

Los requisitos deberán documentarse antes de la implementación de funciones significativas.

Cada requisito deberá disponer de un identificador único.

Ejemplo:

```text
REQ-CLIN-001
REQ-ML-001
REQ-SEC-001
REQ-DATA-001
REQ-AUD-001
REQ-UI-001
REQ-RISK-001
```

Cada requisito deberá indicar, cuando corresponda:

- descripción;
- justificación;
- origen;
- prioridad;
- categoría;
- criterio de aceptación;
- riesgo relacionado;
- estado;
- versión;
- y pruebas asociadas.

Los requisitos deberán ser verificables.

Un requisito que no pueda determinar objetivamente si se cumple deberá reformularse.

---

# 12. Arquitectura

La arquitectura será modular y orientada a separación de responsabilidades.

Arquitectura conceptual:

```text
Presentation Layer
        │
        ▼
Application Layer
        │
        ├── Clinical Services
        ├── Assessment Services
        ├── Risk Services
        └── Reporting Services
        │
        ▼
Domain / Clinical Logic
        │
        ├── Scoring
        ├── Normalization
        ├── Dimensional Analysis
        ├── ML Inference
        └── Clinical Rules
        │
        ▼
Persistence Layer
        │
        ├── Database
        ├── Audit
        └── Configuration
```

Los componentes deberán diseñarse de manera que los elementos de mayor impacto clínico puedan identificarse y, cuando sea apropiado, aislarse.

La descripción formal de la arquitectura se documentará en el **Software Architecture Description (SAD)**.

---

# 13. Implementación

La implementación deberá realizarse a partir de requisitos y diseños aprobados.

Todo código deberá:

- utilizar convenciones consistentes;
- ser legible;
- ser mantenible;
- evitar duplicaciones innecesarias;
- manejar errores;
- validar entradas;
- y mantener separación de responsabilidades.

Las funciones relacionadas con cálculos clínicos deberán evitar cambios implícitos de comportamiento.

Cuando una modificación pueda alterar resultados clínicos deberá activar revisión de impacto y las pruebas correspondientes.

---

# 14. Verificación

La verificación deberá demostrar que el software implementado cumple sus requisitos.

Se utilizarán niveles progresivos:

```text
Unidad
   ↓
Integración
   ↓
Sistema
```

Las actividades podrán incluir:

- pruebas unitarias;
- pruebas de límites;
- pruebas con valores faltantes;
- pruebas de entradas inválidas;
- pruebas de error;
- pruebas de regresión;
- comparación de resultados esperados;
- comprobación matemática;
- y pruebas de reproducibilidad.

La evidencia de verificación deberá poder identificar:

```text
Versión
Requisito
Caso de prueba
Entrada
Resultado esperado
Resultado obtenido
Estado
Evidencia
```

---

# 15. Integración

Los componentes deberán integrarse de manera progresiva.

Ejemplo:

```text
Captura
   ↓
Validación
   ↓
Scoring
   ↓
Normalización
   ↓
Representación dimensional
   ↓
Modelo ML
   ↓
Riesgo
   ↓
Presentación
   ↓
Auditoría
```

Las interfaces entre componentes deberán definirse y probarse.

Los problemas encontrados durante la integración deberán registrarse.

---

# 16. Pruebas de sistema

Las pruebas de sistema evaluarán el comportamiento del producto completo.

Los escenarios deberán representar flujos reales de uso previsto.

Ejemplo:

```text
Crear paciente
      ↓
Crear evaluación
      ↓
Capturar respuestas
      ↓
Calcular puntuaciones
      ↓
Ejecutar análisis
      ↓
Generar perfil
      ↓
Generar riesgo
      ↓
Mostrar resultados
      ↓
Guardar evaluación
      ↓
Registrar auditoría
```

Las pruebas de sistema deberán cubrir también:

- datos incompletos;
- datos incorrectos;
- errores;
- permisos;
- sesiones;
- persistencia;
- integridad;
- comportamiento ante componentes ausentes;
- y recuperación de errores.

---

# 17. Liberación

Una versión solamente podrá liberarse cuando se hayan satisfecho los criterios establecidos para la versión.

Antes de la liberación deberán comprobarse:

- requisitos completados;
- pruebas completadas;
- problemas conocidos evaluados;
- riesgos revisados;
- configuración identificada;
- modelos identificados;
- dependencias registradas;
- documentación correspondiente;
- y autorización de liberación.

Cada release deberá disponer de un identificador único.

Ejemplo:

```text
SISAP by CENIVRA v0.1.0
SISAP by CENIVRA v0.2.0
SISAP by CENIVRA v1.0.0
```

---

# 18. Mantenimiento

Después de la primera liberación, cualquier modificación deberá seguir el proceso de mantenimiento correspondiente.

Los cambios podrán deberse a:

- errores;
- vulnerabilidades;
- nuevas necesidades;
- cambios clínicos;
- cambios regulatorios;
- cambios de infraestructura;
- nuevas versiones de dependencias;
- cambios de modelos;
- o mejoras.

Cada cambio deberá evaluarse para determinar si requiere:

- actualización de requisitos;
- modificación de arquitectura;
- actualización de riesgos;
- nuevas pruebas;
- nueva documentación;
- y nueva liberación.

---

# 19. Gestión de configuración

Los elementos controlados deberán identificarse.

Ejemplos:

```text
Código fuente
Requisitos
Arquitectura
Base de datos
Scripts
Modelos
Parámetros
Dependencias
Pruebas
Documentación
Configuración
```

Cada release deberá permitir reconstruir o identificar de manera inequívoca el conjunto de componentes que la integran.

Una configuración podrá representarse como:

```text
Release
│
├── Source version
├── Model version
├── Configuration version
├── Database schema
├── Dependency versions
└── Test baseline
```

---

# 20. Gestión de problemas

Todo defecto o anomalía relevante deberá registrarse.

Cada registro deberá contener, cuando corresponda:

```text
ID
Fecha
Versión
Componente
Descripción
Severidad
Impacto
Relación con seguridad
Reproducibilidad
Causa
Corrección
Pruebas
Estado
```

Las incidencias relacionadas con seguridad deberán evaluarse también dentro del proceso de gestión de riesgos.

La auditoría clínica y la gestión de problemas de software deberán mantenerse separadas.

---

# 21. Gestión de riesgos

El desarrollo se realizará teniendo en cuenta los riesgos derivados de las funciones del software.

Los escenarios de interés incluyen:

- datos incorrectos;
- datos incompletos;
- resultados incorrectos;
- errores de cálculo;
- errores de normalización;
- resultados ML incorrectos;
- clasificación incorrecta;
- falsos positivos;
- falsos negativos;
- ausencia de alertas;
- alertas incorrectas;
- incertidumbre no reconocida;
- pérdida de información;
- corrupción de modelos;
- acceso no autorizado;
- y presentación ambigua de resultados.

Los controles de riesgo deberán relacionarse con:

```text
Riesgo
 ↓
Control
 ↓
Implementación
 ↓
Verificación
```

El proceso formal de gestión de riesgos se documentará en el **Software Risk Management File** correspondiente.

---

# 22. Documentación

SISAP utilizará un sistema de documentación controlada.

Documentos principales previstos:

```text
01 Software Development Plan
02 Intended Use
03 Software Safety Classification
04 Software Requirements Specification
05 Software Architecture Description
06 Software Detailed Design
07 Verification & Test Plan
08 Unit Verification Records
09 Integration Test Plan
10 System Test Plan
11 Risk Management Documentation
12 Configuration Management Plan
13 SOUP Inventory
14 Problem Resolution Records
15 Release Records
16 Maintenance Plan
17 Traceability Matrix
18 Model Documentation
```

Cada documento deberá identificarse mediante:

```text
Nombre
Identificador
Versión
Fecha
Estado
Responsable
```

---

# 23. SOUP

Los componentes externos utilizados por SISAP deberán ser identificados y controlados.

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

Para cada componente relevante deberá registrarse:

- nombre;
- versión;
- proveedor/mantenedor;
- función;
- relevancia para seguridad;
- dependencias;
- vulnerabilidades conocidas relevantes;
- problemas conocidos;
- y estrategia de actualización.

La información se conservará en un inventario de SOUP.

---

# 24. Criterios de entrada y salida

Cada actividad deberá tener criterios que permitan determinar cuándo comienza y cuándo termina.

## Ejemplo: implementación

### Entrada

```text
Requisito aprobado
Diseño aprobado
Riesgo evaluado
Entorno disponible
```

### Salida

```text
Código implementado
Pruebas unitarias
Revisión completada
Problemas registrados
```

## Ejemplo: integración

### Entrada

```text
Componentes verificados
Interfaces definidas
```

### Salida

```text
Integración ejecutada
Pruebas completadas
Problemas registrados
Resultado aceptado
```

## Ejemplo: liberación

### Entrada

```text
Requisitos completos
Pruebas completas
Riesgos revisados
Configuración congelada
```

### Salida

```text
Release identificada
Artefactos identificados
Evidencia archivada
Autorización de liberación
```

---

# 25. Gestión de cambios

Los cambios deberán clasificarse según su impacto.

Proceso general:

```text
Solicitud
   ↓
Descripción
   ↓
Análisis de impacto
   ↓
Análisis de riesgo
   ↓
Aprobación
   ↓
Implementación
   ↓
Pruebas
   ↓
Revisión
   ↓
Liberación
```

Un cambio que altere una salida clínica deberá evaluarse específicamente respecto a:

- requisitos;
- riesgos;
- arquitectura;
- modelos;
- datos;
- pruebas;
- documentación;
- y trazabilidad.

---

# 26. Control de versiones

SISAP utilizará control de versiones para el código fuente y documentos controlados.

Se utilizará versionado semántico cuando resulte adecuado:

```text
MAJOR.MINOR.PATCH
```

Ejemplo:

```text
1.0.0
1.1.0
1.1.1
```

### MAJOR

Cambios incompatibles o cambios de comportamiento significativos.

### MINOR

Nueva funcionalidad compatible.

### PATCH

Correcciones sin cambios funcionales significativos.

La versión del software no sustituye la identificación de la versión del modelo ML.

Un release deberá identificar ambas:

```text
Software: SISAP 1.2.0
Model: ML-2026.04
```

---

# 27. Identificación de defectos comunes

Como parte del proceso de desarrollo se establecerá un procedimiento para identificar **categorías de defectos comunes asociados con las tecnologías utilizadas**.

Este proceso es particularmente importante para componentes clasificados como B o C.

Las categorías a considerar incluirán, según corresponda:

### Gestión de memoria

- fugas de memoria;
- uso excesivo;
- corrupción;
- recursos no liberados.

### Datos

- valores fuera de rango;
- valores faltantes;
- tipos incorrectos;
- conversiones silenciosas;
- pérdida de precisión.

### Algoritmos

- errores matemáticos;
- overflow;
- underflow;
- errores de redondeo;
- resultados no deterministas cuando no deberían serlo.

### Machine Learning

- modelo incorrecto;
- modelo incompatible;
- transformación incorrecta;
- normalización incorrecta;
- entradas incompatibles;
- artefacto corrupto;
- cambio accidental de versión;
- deriva de datos;
- resultados fuera del dominio de validación;
- incertidumbre elevada no detectada.

### Persistencia

- pérdida de información;
- corrupción de datos;
- escritura parcial;
- inconsistencias entre registros.

### Interfaz

- presentación incorrecta;
- información truncada;
- etiquetas ambiguas;
- visualización que pueda inducir a una interpretación incorrecta.

### Seguridad

- autenticación incorrecta;
- autorización incorrecta;
- exposición de datos;
- manejo incorrecto de sesiones;
- secretos expuestos.

Para cada categoría relevante deberá determinarse:

```text
Defecto potencial
      ↓
Posible contribución a una situación peligrosa
      ↓
Control existente
      ↓
Necesidad de prueba
      ↓
Evidencia
```

El resultado de esta actividad deberá integrarse con la gestión de riesgos.

---

# 28. Desarrollo específico de modelos ML

Los modelos de aprendizaje automático se considerarán componentes controlados del software.

Cada modelo deberá disponer de un registro mínimo:

```text
Model ID
Model Version
Training Date
Dataset / Dataset ID
Input Variables
Preprocessing
Normalization Parameters
Architecture
Training Parameters
Validation Metrics
Test Metrics
Known Limitations
Software Compatibility
Hash / Integrity Identifier
Approval Status
```

La sustitución de un modelo por otro deberá considerarse un cambio controlado.

No deberá permitirse que un modelo actualizado sea utilizado automáticamente en producción únicamente porque el archivo tenga el mismo nombre.

---

# 29. Datos de referencia y normalización

Las variables utilizadas por los modelos deberán estar asociadas con:

- nombre;
- tipo;
- rango;
- unidad cuando corresponda;
- transformación;
- tratamiento de faltantes;
- parámetros de normalización;
- versión;
- y fuente.

Los parámetros utilizados durante entrenamiento e inferencia deberán permanecer sincronizados.

El sistema deberá evitar ejecutar un modelo con una transformación distinta a aquella para la que fue validado.

---

# 30. Requisitos de reproducibilidad

Siempre que sea técnicamente posible, una ejecución deberá poder reconstruirse a partir de:

```text
Código
+
Dependencias
+
Configuración
+
Modelo
+
Parámetros
+
Datos de entrada
```

Para resultados clínicamente relevantes deberá conservarse información suficiente para identificar la versión de los componentes que generaron la salida.

---

# 31. Ciberseguridad y seguridad técnica

El desarrollo deberá contemplar:

- autenticación;
- autorización;
- protección de credenciales;
- protección de secretos;
- gestión de dependencias;
- control de acceso;
- registro de actividad;
- protección de datos;
- revisión de vulnerabilidades;
- y actualización de componentes.

Las vulnerabilidades que puedan afectar funciones clínicas deberán evaluarse también desde la perspectiva de riesgo.

---

# 32. Auditoría

Las acciones relevantes deberán generar registros de auditoría.

Ejemplos:

```text
Inicio de sesión
Creación de paciente
Creación de evaluación
Modificación de evaluación
Ejecución de análisis
Visualización de resultados
Generación de reporte
Modificación administrativa
```

La auditoría deberá permitir determinar:

```text
Quién
Qué
Cuándo
Sobre qué registro
Con qué versión
```

cuando resulte necesario para la trazabilidad.

---

# 33. Liberación y baseline

Antes de cada release deberá establecerse una **baseline**.

Una baseline podrá incluir:

```text
Código
Modelos
Configuración
Dependencias
Base de datos / esquema
Documentación
Tests
```

La baseline deberá quedar identificada mediante una versión o etiqueta inequívoca.

Ningún componente perteneciente a una baseline deberá modificarse silenciosamente después de su liberación.

---

# 34. Mantenimiento y obsolescencia

Los componentes podrán quedar obsoletos por:

- falta de soporte;
- vulnerabilidad;
- incompatibilidad;
- cambios de plataforma;
- nuevas versiones;
- cambios regulatorios;
- o deterioro del desempeño clínico/técnico.

Antes de retirar o sustituir un componente deberá evaluarse:

```text
Impacto
+
Riesgo
+
Compatibilidad
+
Pruebas necesarias
```

Los datos históricos deberán conservar suficiente información para saber con qué versión del sistema y del modelo fueron generados.

---

# 35. Retiro del software

Cuando una versión o el sistema completo deje de utilizarse deberá realizarse un proceso controlado.

Deberá establecerse:

- fecha de retiro;
- versión afectada;
- motivo;
- periodo de soporte;
- tratamiento de datos;
- conservación de registros;
- conservación de evidencia;
- y eliminación segura cuando corresponda.

Las versiones retiradas deberán permanecer identificables históricamente.

---

# 36. Criterios generales de calidad

Una fase o release no se considerará terminada cuando solamente:

```text
"el programa funciona"
```

Se considerará terminada cuando se hayan satisfecho los criterios definidos para:

```text
Requisitos
Seguridad
Riesgo
Implementación
Verificación
Integración
Documentación
Configuración
Problemas
```

---

# 37. Registros generados por el ciclo de vida

El proyecto deberá conservar registros suficientes para demostrar las actividades realizadas.

Entre ellos:

```text
Requisitos
Revisiones
Cambios
Pruebas
Resultados
Problemas
Riesgos
Modelos
Configuraciones
Releases
Mantenimiento
```

Los registros deberán mantenerse durante el periodo definido por la política de conservación documental aplicable al proyecto.

---

# 38. Criterios para completar el desarrollo inicial

La primera versión controlada de SISAP deberá contar, como mínimo, con:

```text
Uso previsto definido
↓
Clasificación de seguridad analizada
↓
Requisitos establecidos
↓
Arquitectura documentada
↓
Implementación
↓
Gestión de riesgos
↓
Pruebas unitarias
↓
Pruebas de integración
↓
Pruebas de sistema
↓
Trazabilidad
↓
Configuración identificada
↓
SOUP documentado
↓
Problemas evaluados
↓
Release controlada
```

---

# 39. Estado inicial del SDP

| Elemento | Estado |
|---|---|
| SDP | En desarrollo |
| Uso previsto | Definido preliminarmente |
| Requisitos | En construcción |
| Arquitectura | En desarrollo |
| Clasificación de seguridad | Pendiente de análisis formal |
| Gestión de riesgos | En construcción |
| Gestión de configuración | En construcción |
| SOUP | En construcción |
| Plan de pruebas | Pendiente |
| Trazabilidad | En construcción |
| Gestión de problemas | Pendiente de formalización |
| Mantenimiento | Planificado |
| Liberación | Pendiente |

---

# 40. Relación con otros documentos

Este SDP no sustituye los documentos especializados.

La relación prevista es:

```text
                    SDP
                     │
        ┌────────────┼─────────────┐
        ↓            ↓             ↓
       SRS          SAD        Risk File
        │            │             │
        ↓            ↓             ↓
   Requisitos    Arquitectura    Riesgos
        │            │             │
        └────────────┼─────────────┘
                     ↓
               Implementación
                     ↓
              Verification Plan
                     ↓
               Test Records
                     ↓
               Release Record
                     ↓
                Maintenance
```

---

# 41. Aprobación del documento

Este documento deberá revisarse y aprobarse antes de considerarse la línea base del proceso de desarrollo.

| Rol | Nombre | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente de asignación | Pendiente |
| Responsable de verificación | Pendiente de asignación | Pendiente |

---

# 42. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Modificaciones controladas |

---

# 43. Declaración de estado

> **SISAP by CENIVRA está actualmente en desarrollo.**
>
> Este Software Development Plan define el proceso mediante el cual el software será desarrollado, verificado, liberado y mantenido.
>
> El proceso toma como referencia IEC 62304:2006 + AMD1:2015 y otros principios aplicables de ingeniería de software y gestión de riesgos.
>
> La existencia de este documento no constituye por sí misma una certificación, declaración de conformidad ni autorización regulatoria.