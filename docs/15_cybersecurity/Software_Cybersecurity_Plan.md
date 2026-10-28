# SISAP by CENIVRA

# Software Cybersecurity Plan

**Documento:** Software Cybersecurity Plan  
**Identificador:** SISAP-CSP-001  
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
| Documento | Software Cybersecurity Plan |
| Identificador | SISAP-CSP-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Información procesada | Información clínica, psicométrica, longitudinal y analítica |
| Marco de desarrollo | IEC 62304:2006 + AMD1:2015 |
| Gestión de riesgos | ISO 14971:2019, cuando corresponda |
| Seguridad de la información | Políticas institucionales y marco técnico aplicable |

---

# 1. Propósito

Este documento establece el marco de ciberseguridad para SISAP by CENIVRA durante su ciclo de vida.

Su finalidad es definir los mecanismos para:

- identificar amenazas;
- proteger información clínica;
- proteger cuentas y credenciales;
- controlar accesos;
- proteger modelos y configuraciones;
- gestionar vulnerabilidades;
- controlar dependencias;
- registrar eventos relevantes;
- responder a incidentes;
- evaluar cambios;
- y mantener la seguridad durante el mantenimiento y retiro.

La ciberseguridad deberá considerarse una propiedad transversal del producto:

```text
Requisitos
   ↓
Arquitectura
   ↓
Diseño
   ↓
Implementación
   ↓
Pruebas
   ↓
Release
   ↓
Mantenimiento
```

---

# 2. Alcance

Este plan aplica a:

```text
Application
Dash UI
Flask
Authentication
Authorization
Database
Clinical Data
Models
Model Registry
Configuration
Dependencies
SOUP
Logs
Audit
Reports
Deployment Environment
Network
Backups
```

También aplica a los procesos de desarrollo, pruebas, despliegue y mantenimiento.

---

# 3. Principios de ciberseguridad

## 3.1 Seguridad por diseño

La seguridad deberá considerarse desde el diseño y no agregarse únicamente al final.

## 3.2 Mínimo privilegio

Cada usuario, proceso y componente deberá disponer únicamente de los permisos necesarios.

## 3.3 Defensa en profundidad

La protección deberá utilizar múltiples controles.

```text
Authentication
+
Authorization
+
Validation
+
Encryption
+
Audit
+
Monitoring
```

## 3.4 Fail Secure

Cuando sea posible, ante un fallo de seguridad el sistema deberá bloquear la operación en lugar de conceder acceso.

## 3.5 Trazabilidad

Las operaciones relevantes deberán poder atribuirse a un actor, sistema o proceso.

## 3.6 Separación de información

Los secretos y datos sensibles deberán estar separados del código fuente.

## 3.7 Gestión continua

La seguridad no finaliza con la primera release.

---

# 4. Objetivos de seguridad

SISAP deberá proteger principalmente:

```text
Confidentiality
Integrity
Availability
Authenticity
Accountability
```

---

# 5. Activos

Los principales activos serán:

```text
ACT-001 Clinical Data
ACT-002 Patient Identifiers
ACT-003 Assessments
ACT-004 Clinical Results
ACT-005 Risk Results
ACT-006 Alerts
ACT-007 Machine Learning Models
ACT-008 Model Configuration
ACT-009 Clinical Rules
ACT-010 Credentials
ACT-011 Application Secrets
ACT-012 Database
ACT-013 Audit Records
ACT-014 Source Code
ACT-015 Test Data
ACT-016 Documentation
ACT-017 Release Artifacts
```

---

# 6. Clasificación de activos

Cada activo podrá clasificarse según:

```text
Public
Internal
Confidential
Restricted
```

La clasificación definitiva dependerá de la política institucional.

---

# 7. Información clínica

La información clínica deberá considerarse información sensible y deberá recibir controles apropiados de:

- acceso;
- almacenamiento;
- transmisión;
- respaldo;
- exportación;
- y eliminación.

---

# 8. Principio de mínimo conocimiento

Un componente deberá acceder únicamente a los datos que necesita.

Ejemplo:

```text
UI
 ↓
Authorized Data
```

No:

```text
UI
 ↓
Complete Database
```

---

# 9. Identidad y autenticación

SISAP deberá autenticar a los usuarios antes de permitir acceso a funciones protegidas.

Flujo:

```text
Username
+
Password
      ↓
Authentication
      ↓
Authenticated Session
```

---

# 10. Contraseñas

Las contraseñas:

- no deberán almacenarse en texto plano;
- no deberán aparecer en logs;
- no deberán incluirse en archivos de configuración versionados.

Deberá utilizarse un mecanismo de hashing adecuado.

---

# 11. Secretos

Los secretos deberán mantenerse fuera del repositorio.

Ejemplos:

```text
APP_SECRET_KEY
Database Credentials
API Keys
Tokens
Encryption Keys
```

---

# 12. Gestión de secretos

Los secretos deberán obtenerse desde un mecanismo controlado:

```text
Environment
      ↓
Secret Management
      ↓
Application
```

No mediante valores hard-coded.

---

# 13. Autorización

La autorización deberá comprobar:

```text
User
+
Role
+
Resource
+
Action
```

---

# 14. Roles

Los roles iniciales son:

```text
admin
psicologo
consejero
viewer
```

La matriz de autorización deberá mantenerse bajo control de configuración.

---

# 15. Control de acceso a datos clínicos

Deberá impedirse el acceso de usuarios que no posean permisos suficientes.

Ejemplo:

```text
viewer
   ↓
Patient Record
   ↓
Allowed / Denied according to policy
```

---

# 16. Control de sesiones

Las sesiones deberán protegerse frente a:

- fijación;
- robo;
- reutilización indebida;
- expiración incorrecta;
- y acceso no autorizado.

Deberán definirse posteriormente:

```text
Session Timeout
Idle Timeout
Reauthentication
Logout
```

---

# 17. Preguntas pendientes de autenticación

### Pregunta SEC-001

¿Cuánto tiempo permanecerá activa una sesión?

### Pregunta SEC-002

¿Se requerirá reautenticación para operaciones críticas?

### Pregunta SEC-003

¿Se utilizará autenticación multifactor en producción?

### Pregunta SEC-004

¿Cómo se deshabilitará una cuenta?

**Respuesta:**

> Pendiente de especificación institucional y técnica.

---

# 18. Protección de interfaz

La interfaz deberá protegerse contra, cuando sean aplicables:

```text
CSRF
XSS
Session attacks
Injection
Unauthorized requests
```

Las medidas concretas se especificarán durante implementación y pruebas de seguridad.

---

# 19. Validación de entrada

Toda entrada que provenga de usuario o sistemas externos deberá validarse.

```text
Input
 ↓
Type Validation
 ↓
Range Validation
 ↓
Schema Validation
 ↓
Processing
```

---

# 20. Protección contra inyección

Las operaciones de base de datos deberán evitar:

- SQL Injection;
- comandos no confiables;
- ejecución arbitraria.

El uso de SQLAlchemy y consultas parametrizadas deberá ser la estrategia preferente.

---

# 21. Deserialización

Los artefactos serializados deberán cargarse únicamente desde fuentes confiables y controladas.

Especial atención:

```text
.pkl
joblib
model artifacts
configuration files
```

---

# 22. Seguridad de modelos

Los modelos ML deberán protegerse contra:

- sustitución;
- manipulación;
- corrupción;
- carga de archivos no autorizados;
- y ejecución de artefactos no confiables.

---

# 23. Integridad de modelos

Los modelos aprobados deberán poder verificarse mediante un mecanismo de integridad.

Ejemplo:

```text
Model
 ↓
SHA-256
 ↓
Integrity Check
```

---

# 24. Model Registry Security

El Model Registry deberá impedir que un usuario no autorizado:

- modifique un modelo aprobado;
- sustituya un artefacto;
- lo marque como aprobado;
- o cambie su metadato crítico.

---

# 25. Seguridad de configuración clínica

Los siguientes elementos deberán protegerse:

```text
Risk Thresholds
Clinical Rules
Normalization Parameters
Dimension Mappings
Model Selection
Feature Definitions
```

---

# 26. Configuración sensible

Una configuración que afecte resultados clínicos deberá requerir autorización y control de cambios.

---

# 27. Seguridad de base de datos

La base de datos deberá proteger:

- confidencialidad;
- integridad;
- disponibilidad.

Deberán controlarse:

```text
Access
Permissions
Backups
Schema Changes
Database Credentials
```

---

# 28. Separación de bases de datos

Los entornos de desarrollo, prueba y producción deberán permanecer separados cuando corresponda.

---

# 29. Datos de producción

Los datos de producción no deberán copiarse a entornos de desarrollo sin controles apropiados.

---

# 30. Datos de prueba

Se utilizarán preferentemente:

```text
Synthetic
De-identified
Controlled
```

---

# 31. Protección de logs

Los logs no deberán contener innecesariamente:

- contraseñas;
- tokens;
- claves;
- información clínica completa;
- datos identificables.

---

# 32. Auditoría versus logs

Se diferenciará:

```text
Security / Application Logs
              ≠
Clinical Audit
```

Los logs sirven principalmente para operación y diagnóstico técnico.

La auditoría registra acciones relevantes sobre información y procesos clínicos.

---

# 33. Integridad de auditoría

Cuando la auditoría constituya evidencia de trazabilidad, deberá protegerse frente a modificación no autorizada.

---

# 34. Seguridad de reportes

Los reportes que contengan información clínica deberán:

- generarse únicamente para usuarios autorizados;
- almacenarse de forma segura;
- evitar exposición innecesaria;
- y seguir las reglas de exportación.

---

# 35. Exportación

La exportación deberá seguir:

```text
Authorization
 ↓
Data Selection
 ↓
Generation
 ↓
Audit
```

---

# 36. Acceso a archivos

Los directorios que contengan:

```text
Models
Database
Clinical Data
Reports
Secrets
```

deberán tener permisos restringidos.

---

# 37. Seguridad del entorno

La infraestructura deberá mantenerse razonablemente protegida.

Esto incluye:

- sistema operativo;
- navegador;
- Python;
- dependencias;
- servidor web;
- almacenamiento;
- y red.

---

# 38. Dependencias

Todas las dependencias deberán mantenerse identificadas.

Los componentes externos relevantes deberán formar parte del inventario SOUP.

---

# 39. Gestión de vulnerabilidades

Cuando se identifique una vulnerabilidad:

```text
Vulnerability
      ↓
Affected Component
      ↓
Impact Assessment
      ↓
Risk Assessment
      ↓
Mitigation / Patch
      ↓
Verification
      ↓
Release
```

---

# 40. Severidad de vulnerabilidades

Las vulnerabilidades podrán clasificarse:

```text
Critical
High
Medium
Low
Informational
```

La clasificación definitiva podrá utilizar un sistema estandarizado como CVSS cuando resulte apropiado.

---

# 41. CVE

Cuando exista un identificador CVE publicado para una vulnerabilidad relevante, deberá registrarse.

---

# 42. Dependencias desactualizadas

No deberá asumirse que “la aplicación funciona” implica que una dependencia es aceptable desde el punto de vista de seguridad.

Las actualizaciones deberán evaluarse.

---

# 43. Security Patch

Un parche de seguridad deberá pasar por:

```text
Patch
 ↓
Compatibility
 ↓
Security Test
 ↓
Regression
 ↓
Release
```

---

# 44. Supply Chain Security

Deberán considerarse riesgos asociados a:

```text
Python Packages
ML Frameworks
Model Files
Build Tools
CI/CD
Repositories
```

---

# 45. Integridad de paquetes

Cuando resulte posible deberá utilizarse un conjunto de dependencias fijado mediante lockfile o mecanismo equivalente.

---

# 46. SBOM

SISAP deberá considerar la generación de una **Software Bill of Materials (SBOM)** para releases de producción.

### Pregunta SEC-005

¿Qué formato se utilizará?

```text
CycloneDX
SPDX
```

u otro.

**Respuesta:**

> Pendiente de especificación.

---

# 47. SBOM por release

Una release podrá contener:

```text
SBOM
+
Software Version
+
Dependency Set
```

Esto permitirá identificar componentes vulnerables.

---

# 48. Seguridad de CI/CD

Cuando se utilice CI/CD deberá protegerse:

```text
Source
Secrets
Build Environment
Artifacts
Signing
Deployment Credentials
```

---

# 49. Control de ramas

Las ramas protegidas deberán evitar modificaciones no autorizadas.

---

# 50. Code Review

Los cambios relevantes deberán someterse a revisión.

Debe considerarse:

- seguridad;
- impacto;
- requisitos;
- riesgos;
- pruebas.

---

# 51. Secret Scanning

El repositorio deberá incorporar, cuando sea posible, detección automatizada de secretos.

---

# 52. Dependency Scanning

Las dependencias deberán analizarse periódicamente.

---

# 53. Static Analysis

Podrán utilizarse herramientas de análisis estático para identificar:

- errores;
- vulnerabilidades;
- código inseguro;
- y patrones peligrosos.

---

# 54. Dynamic Security Testing

Antes de producción podrán realizarse pruebas dinámicas apropiadas.

---

# 55. Threat Modeling

SISAP deberá disponer de un modelo de amenazas.

La estructura inicial será:

```text
Asset
 ↓
Threat
 ↓
Attack Vector
 ↓
Vulnerability
 ↓
Impact
 ↓
Control
```

---

# 56. [DIVISIÓN FUTURA A — Threat Model]

Cuando el proyecto madure, esta sección podrá convertirse en:

```text
docs/
└── 15_cybersecurity/
    └── Threat_Model.md
```

y podrá incluir:

```text
STRIDE
Attack Trees
Data Flow Diagrams
Trust Boundaries
Attack Surfaces
```

según lo que resulte apropiado.

---

# 57. Superficie de ataque

Deberán considerarse:

```text
Browser
Dash
Flask
Authentication
Database
File System
Model Files
Python Packages
Network
Administration
Exports
```

---

# 58. Límites de confianza

La arquitectura deberá identificar:

```text
User
 ↓
Web Application
 ↓
Clinical Services
 ↓
Database
```

y los límites de confianza correspondientes.

---

# 59. Seguridad de API

Si se incorporan APIs:

```text
Authentication
Authorization
Input Validation
Rate Limiting
Logging
```

deberán especificarse.

---

# 60. Rate Limiting

Cuando el despliegue lo requiera deberán existir mecanismos para evitar:

- fuerza bruta;
- abuso;
- solicitudes excesivas.

---

# 61. Seguridad de autenticación

Deberán considerarse:

```text
Brute Force
Credential Stuffing
Password Reuse
Session Theft
```

---

# 62. Protección contra fuerza bruta

La estrategia podrá incluir:

- throttling;
- bloqueo temporal;
- alertas;
- registro.

La implementación definitiva deberá especificarse posteriormente.

---

# 63. Recuperación de cuentas

Deberá definirse un procedimiento seguro para:

```text
Password Reset
Account Recovery
Account Disablement
```

### Pregunta SEC-006

¿Cómo se realizará recuperación de credenciales?

**Respuesta:**

> Pendiente de especificación.

---

# 64. Administración

Las funciones administrativas deberán recibir controles reforzados.

---

# 65. Seguridad de cuentas administrativas

Las cuentas administrativas deberán:

- utilizar credenciales únicas;
- limitarse a usuarios autorizados;
- y auditar operaciones sensibles.

---

# 66. Separación de privilegios

Cuando sea posible:

```text
Development
 ≠
Administration
 ≠
Verification
```

---

# 67. Seguridad durante pruebas

Las pruebas de seguridad deberán utilizar entornos controlados.

No deberán realizarse pruebas destructivas sobre producción.

---

# 68. Penetration Testing

Cuando sea apropiado, podrá realizarse una prueba de penetración antes de una release de producción.

### Pregunta SEC-007

¿Se realizará una prueba de penetración antes de la primera release operativa?

**Respuesta:**

> Pendiente de decisión.

---

# 69. Vulnerability Scanning

Podrá utilizarse exploración automatizada de vulnerabilidades.

---

# 70. Seguridad del entorno Python

La instalación de paquetes deberá realizarse desde fuentes confiables.

---

# 71. Seguridad de paquetes

Cuando sea posible deberán verificarse:

```text
Package Name
Version
Source
Integrity
```

---

# 72. Despliegue seguro

Una release deberá desplegarse desde un artefacto controlado.

```text
Approved Release
 ↓
Integrity Check
 ↓
Deployment
```

---

# 73. Cambios en producción

No deberá realizarse modificación directa de archivos críticos en producción sin control.

---

# 74. Acceso al servidor

El acceso administrativo deberá restringirse.

---

# 75. Gestión de certificados

Si el sistema se despliega mediante HTTPS, los certificados deberán gestionarse de manera controlada.

---

# 76. HTTPS

En cualquier entorno que transporte información clínica sobre una red no confiable, deberá utilizarse una conexión protegida.

---

# 77. Cifrado en tránsito

Cuando corresponda:

```text
Client
 ↓
TLS
 ↓
Application
```

---

# 78. Cifrado en reposo

Deberá evaluarse el cifrado de:

```text
Database
Backups
Clinical Data
Model Artifacts
```

según el entorno y política aplicable.

### Pregunta SEC-008

¿El entorno de producción requerirá cifrado de base de datos y respaldos?

**Respuesta:**

> Pendiente de especificación institucional.

---

# 79. Gestión de backups

Los respaldos deberán protegerse contra:

- acceso no autorizado;
- modificación;
- pérdida;
- y ransomware.

---

# 80. Pruebas de recuperación

Los backups deberán probarse periódicamente cuando formen parte del esquema operativo.

---

# 81. Ransomware

La estrategia de respaldo deberá considerar el riesgo de ransomware.

---

# 82. Seguridad de modelos y backups

Los modelos deberán estar incluidos dentro de una estrategia de respaldo cuando sean necesarios para reproducibilidad o continuidad.

---

# 83. Respuesta a incidentes

Ante un incidente:

```text
Detection
 ↓
Containment
 ↓
Investigation
 ↓
Risk Assessment
 ↓
Correction
 ↓
Verification
 ↓
Recovery
 ↓
Lessons Learned
```

---

# 84. Incidentes de seguridad

Podrán incluir:

```text
Unauthorized Access
Data Exposure
Credential Compromise
Malware
Model Tampering
Database Compromise
Dependency Vulnerability
```

---

# 85. Security Incident Record

Cada incidente relevante deberá poder registrar:

```text
Incident ID
Date
Detection
Affected Component
Description
Impact
Containment
Root Cause
Correction
Verification
Closure
```

---

# 86. Comunicación de incidentes

Deberá definirse quién debe ser informado cuando exista una incidencia de seguridad.

### Pregunta SEC-009

¿Cuál será la cadena institucional de comunicación ante una brecha o incidente de seguridad?

**Respuesta:**

> Pendiente de especificación.

---

# 87. Brecha de información clínica

Cuando exista posible exposición de información clínica:

```text
Security Incident
      ↓
Privacy Assessment
      ↓
Risk Assessment
      ↓
Institutional Response
```

---

# 88. Monitorización

Cuando sea posible deberá monitorizarse:

```text
Authentication Failures
Authorization Failures
Unexpected Errors
Database Errors
Model Integrity Errors
Dependency Alerts
```

---

# 89. Alertas de seguridad

Los eventos críticos deberán generar alertas operativas cuando el entorno lo permita.

---

# 90. Retención de logs de seguridad

Deberá definirse:

```text
Retention Period
Storage
Protection
Access
```

### Pregunta SEC-010

¿Cuánto tiempo se conservarán los logs de seguridad?

**Respuesta:**

> Pendiente de especificación institucional.

---

# 91. Separación entre logs y datos clínicos

La telemetría de seguridad deberá minimizar la inclusión de información clínica identificable.

---

# 92. Seguridad de auditoría

Los registros de auditoría clínica deberán estar protegidos frente a modificación no autorizada.

---

# 93. Seguridad durante mantenimiento

Cada mantenimiento deberá considerar:

```text
Dependency Updates
Security Patches
Model Updates
Configuration Changes
Access Changes
```

---

# 94. Gestión de vulnerabilidades durante mantenimiento

Las vulnerabilidades deberán priorizarse según:

```text
Severity
Exploitability
Exposure
Clinical Impact
```

---

# 95. Vulnerabilidad de alta severidad

Cuando una vulnerabilidad de alta severidad afecte una función crítica:

```text
Detection
 ↓
Risk Review
 ↓
Mitigation
 ↓
Verification
 ↓
Emergency Release if required
```

---

# 96. Dependencias SOUP

Las vulnerabilidades de SOUP deberán incorporarse a la gestión de problemas y riesgos cuando corresponda.

---

# 97. Actualización de SOUP

Una actualización deberá evaluarse respecto de:

- compatibilidad;
- seguridad;
- comportamiento;
- pruebas.

---

# 98. Model Supply Chain

Los artefactos ML deberán proceder de fuentes controladas.

No deberán cargarse modelos desconocidos en producción.

---

# 99. Integridad de artefactos ML

Antes de cargar:

```text
Artifact
 ↓
Hash
 ↓
Registry
 ↓
Approved Version
```

---

# 100. Control de acceso al Model Registry

Sólo usuarios o procesos autorizados deberán modificar el registro de modelos.

---

# 101. Seguridad de configuración

Los parámetros que afecten resultados clínicos deberán estar protegidos frente a modificaciones no autorizadas.

---

# 102. Seguridad del proceso de release

Una release deberá comprobar:

```text
Security Tests
Dependency Status
Configuration
Model Integrity
Open Security Problems
```

---

# 103. Criterios de seguridad para release

Una release deberá bloquearse cuando exista una vulnerabilidad o defecto de seguridad que:

- represente riesgo no aceptable;
- comprometa información sensible;
- permita acceso no autorizado significativo;
- o comprometa una función clínica relevante.

---

# 104. Seguridad de actualización de modelos

Un modelo nuevo deberá pasar por:

```text
Integrity
Compatibility
Verification
Risk Review
Validation when applicable
Release
```

---

# 105. Seguridad de eliminación

La eliminación de:

```text
Users
Models
Clinical Data
Reports
Backups
```

deberá estar controlada.

---

# 106. Secure Disposal

Cuando corresponda, deberá definirse un procedimiento para eliminar de forma segura información y artefactos.

---

# 107. Fin de vida

Al retirar SISAP o un componente:

```text
Retirement
 ↓
Data Review
 ↓
Access Revocation
 ↓
Credential Revocation
 ↓
Archive
 ↓
Secure Disposal where required
```

---

# 108. Seguridad del repositorio

El repositorio deberá estar protegido mediante:

- autenticación;
- permisos;
- branch protection;
- revisión de cambios;
- y backups.

---

# 109. Protección de ramas

Las ramas que generen releases deberán tener protección contra cambios no autorizados.

---

# 110. Protección de tags

Los tags de release deberán permanecer asociados al commit correspondiente.

---

# 111. Firmas de releases

Como mejora futura podrá evaluarse firmar artefactos de release.

### Pregunta SEC-011

¿Se requerirá firma digital de artefactos antes de producción?

**Respuesta:**

> Pendiente de especificación.

---

# 112. Seguridad de documentación

La documentación que contenga:

```text
Architecture Details
Security Details
Credentials
Infrastructure Details
```

deberá clasificarse apropiadamente.

Nunca deberá contener secretos reales.

---

# 113. Security Documentation

La documentación deberá poder mantener:

```text
Threat Model
Security Requirements
Security Tests
Vulnerabilities
Incident Records
```

---

# 114. [DIVISIÓN FUTURA B — Vulnerability Management]

Este bloque podrá convertirse posteriormente en:

```text
Vulnerability_Management_Plan.md
```

---

# 115. [DIVISIÓN FUTURA C — Security Incident Response]

Este bloque podrá convertirse posteriormente en:

```text
Security_Incident_Response_Plan.md
```

---

# 116. [DIVISIÓN FUTURA D — Secure Development]

Cuando sea necesario podrá separarse:

```text
Secure_Development_Standard.md
```

con reglas detalladas de codificación segura.

---

# 117. Security Testing

Las pruebas podrán incluir:

```text
Authentication
Authorization
Session
Input Validation
Injection
Secrets
Dependencies
Model Integrity
Database
Audit
```

---

# 118. Security Test Records

Los resultados deberán registrarse con:

```text
Test ID
Software Version
Environment
Tool
Input
Expected
Observed
Result
Evidence
```

---

# 119. Security Regression

Después de un cambio relevante deberán repetirse las pruebas afectadas.

---

# 120. Security Baseline

Podrá establecerse:

```text
SEC-BL-0.5.0
```

asociada a:

```text
Software
Dependencies
Configuration
Security Tests
```

---

# 121. Configuration Security

La configuración de seguridad deberá formar parte de la baseline de configuración.

---

# 122. Security Review

Antes de una release importante deberá realizarse una revisión de:

```text
Threats
Vulnerabilities
Security Tests
Open Problems
Dependencies
Configuration
```

---

# 123. Security Review Record

Ejemplo:

```text
SEC-REVIEW-001

Release:
0.5.0

Open Vulnerabilities:
0 Critical
0 High
1 Medium

Security Tests:
PASS

Dependency Review:
PASS

Model Integrity:
PASS

Decision:
APPROVED
```

---

# 124. Criterios de entrada para Security Review

Se requiere:

- configuración identificada;
- dependencias identificadas;
- código candidato;
- modelos identificados;
- pruebas disponibles.

---

# 125. Criterios de salida

Se considerará completada cuando:

- las vulnerabilidades críticas estén resueltas o formalmente gestionadas;
- las pruebas críticas estén ejecutadas;
- los riesgos estén revisados;
- la configuración esté identificada;
- y exista decisión documentada.

---

# 126. Relación con Risk Management

La relación será:

```text
Threat
 ↓
Vulnerability
 ↓
Hazard / Impact
 ↓
Risk
 ↓
Security Control
 ↓
Verification
```

---

# 127. Relación con Configuration Management

La configuración deberá conservar:

```text
Security Version
Dependency Versions
Model Versions
Configuration
```

---

# 128. Relación con Problem Management

Los incidentes o vulnerabilidades deberán poder producir:

```text
Problem Report
```

cuando corresponda.

---

# 129. Relación con Release

La release deberá incorporar una evaluación de seguridad.

---

# 130. Relación con SOUP

Los componentes SOUP deberán evaluarse respecto de:

```text
Security
Known Vulnerabilities
Compatibility
```

---

# 131. Riesgos de seguridad específicos de SISAP

Los riesgos iniciales incluyen:

```text
SEC-RISK-001 Unauthorized clinical data access
SEC-RISK-002 Unauthorized data modification
SEC-RISK-003 Credential compromise
SEC-RISK-004 Session compromise
SEC-RISK-005 Model tampering
SEC-RISK-006 Configuration tampering
SEC-RISK-007 Vulnerable dependency
SEC-RISK-008 Database compromise
SEC-RISK-009 Malicious file / artifact
SEC-RISK-010 Audit manipulation
```

Estos riesgos deberán integrarse posteriormente al Risk Management File.

---

# 132. Security Control Examples

| Riesgo | Control |
|---|---|
| SEC-RISK-001 | Authorization |
| SEC-RISK-002 | Access Control + Audit |
| SEC-RISK-003 | Password Hashing |
| SEC-RISK-004 | Session Management |
| SEC-RISK-005 | Model Integrity |
| SEC-RISK-006 | Configuration Control |
| SEC-RISK-007 | Dependency Scanning |
| SEC-RISK-008 | Database Security |
| SEC-RISK-009 | Artifact Validation |
| SEC-RISK-010 | Audit Protection |

---

# 133. Preguntas pendientes de ciberseguridad

Antes de la primera release de producción deberán resolverse al menos:

### SEC-001
Duración de sesión.

### SEC-002
Reautenticación para operaciones críticas.

### SEC-003
Uso de MFA.

### SEC-004
Proceso de deshabilitación de cuentas.

### SEC-005
Formato SBOM.

### SEC-006
Recuperación de credenciales.

### SEC-007
Penetration Testing.

### SEC-008
Cifrado en reposo y backups.

### SEC-009
Comunicación de incidentes.

### SEC-010
Retención de logs.

### SEC-011
Firma de artefactos.

---

# 134. Criterios mínimos de ciberseguridad antes de producción

Antes de una primera release operativa deberá verificarse:

```text
[ ] Authentication implemented
[ ] Authorization implemented
[ ] Password hashing verified
[ ] Secrets externalized
[ ] Production configuration reviewed
[ ] Dependencies identified
[ ] SOUP reviewed
[ ] Vulnerability scan completed
[ ] Security tests completed
[ ] Model integrity verified
[ ] Database access controlled
[ ] Backup strategy defined
[ ] Security logging defined
[ ] Incident process defined
[ ] Security review completed
```

---

# 135. Criterios de bloqueo de producción

No deberá aprobarse una release cuando:

```text
Critical vulnerability unresolved
High-risk security defect unresolved
Unauthorized access possible
Secrets exposed
Model integrity unverifiable
Critical dependency vulnerability unmanaged
```

salvo que exista una justificación formal y evaluación de riesgo aceptada por el proceso correspondiente.

---

# 136. Criterios de aceptación del plan

Este plan podrá pasar a baseline cuando:

- los activos estén identificados;
- las amenazas principales estén identificadas;
- las superficies de ataque estén documentadas;
- los controles básicos estén definidos;
- la gestión de vulnerabilidades esté definida;
- los incidentes estén definidos;
- los componentes SOUP estén contemplados;
- las pruebas de seguridad estén definidas;
- y las responsabilidades estén asignadas.

---

# 137. Estado actual

| Elemento | Estado |
|---|---|
| Activos | Identificados |
| Principios de seguridad | Definidos |
| Authentication | Definida |
| Authorization | Definida |
| Session Management | Definido conceptualmente |
| Secrets | Definidos |
| Data Security | Definida |
| Model Security | Definida |
| Configuration Security | Definida |
| Dependency Security | Definida |
| Threat Modeling | Planificado |
| Vulnerability Management | Definido conceptualmente |
| Incident Response | Definido conceptualmente |
| Security Testing | Definido |
| SBOM | Planificado |
| Penetration Testing | Pendiente |
| Encryption | Pendiente |
| Monitoring | Definido conceptualmente |
| Production Security Review | Pendiente |
| Baseline | Pendiente |

---

# 138. Responsabilidades

| Rol | Responsabilidad |
|---|---|
| Responsable del producto | Decisiones generales |
| Responsable de software | Implementación |
| Responsable clínico | Impacto clínico |
| Responsable de riesgos | Evaluación de riesgos |
| Responsable de configuración | Baselines y control |
| Responsable de verificación | Evidencia de pruebas |
| Responsable de seguridad | Seguridad técnica |
| Administrador del sistema | Infraestructura y acceso |

Los roles podrán acumularse durante las primeras etapas del proyecto, siempre que las responsabilidades estén explícitamente asignadas.

---

# 139. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de riesgos | Pendiente | Pendiente |
| Responsable de seguridad | Pendiente | Pendiente |
| Responsable de configuración | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 140. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 141. Declaración

> **SISAP by CENIVRA Software Cybersecurity Plan establece el marco de ciberseguridad aplicable al software durante desarrollo, pruebas, liberación, operación, mantenimiento y retiro.**
>
> El plan considera la protección de información clínica, autenticación, autorización, sesiones, configuración, modelos ML, dependencias SOUP, infraestructura, registros de auditoría, artefactos de software y procesos de mantenimiento.
>
> Las medidas de ciberseguridad deberán integrarse con la gestión de riesgos, la gestión de configuración, la verificación, la validación, la resolución de problemas y el proceso de release.
>
> La existencia de este plan no implica que el sistema sea automáticamente seguro ni constituye evidencia por sí misma de cumplimiento regulatorio.
>
> La seguridad deberá demostrarse mediante implementación, pruebas, revisiones, gestión de vulnerabilidades y evidencia documentada durante el ciclo de vida.