# SISAP by CENIVRA — Especificación de Requerimientos del Sistema y Entorno Operativo

## 1. Clasificación del Sistema
- **Tipo de Sistema:** SIRES (Sistema de Información y Registro Electrónico para la Salud) conforme a NOM-024-SSA3-2012.
- **Clasificación de Seguridad IEC 62304:** Clase B (Software de Dispositivo Médico / Soporte Auxiliar a la Decisión Clínica).
- **Alcance Operativo:** Expediente Digital de Salud (EDE), Monitoreo Psicoemocional y Análisis Vectorial Auxiliar.

## 2. Requerimientos del Servidor (Backend / Cloud Node)
- **Sistema Operativo:** Linux (Ubuntu LTS 22.04+ / Debian 12+) o entorno contenedorizado OCI/Docker.
- **Motor de Base de Datos:** PostgreSQL 14+ / SQLite 3.35+ (Soporte nativo para JSONB, índices B-Tree y funciones criptográficas).
- **Ambiente de Ejecución:** Node.js v18+ LTS / Python 3.10+ (Servicios analíticos y autoencoders).
- **Memoria RAM:** Mínimo 4 GB, Recomendado 8 GB (para manejo de matrices de autoencoder y bóveda TTL en memoria).
- **Almacenamiento:** Disco SSD NVMe con cifrado a nivel de volumen (LUKS / AWS EBS Encryption AES-256).
- **Red & Seguridad:** Puerto 443 abierto exclusivamente con TLS 1.3 (Cipher: `TLS_AES_256_GCM_SHA384`), certificados SSL/TLS con renovación automática (Let's Encrypt / AWS ACM) y HSTS forzado (`max-age=31536000; includeSubDomains; preload`).

## 3. Requerimientos de Terminal Cliente (Consultorio / Usuario)
- **Navegador Web:** Google Chrome v100+, Mozilla Firefox v100+, Safari v15.4+ o Microsoft Edge (Soporte nativo obligatorio de Web Crypto API y LocalStorage seguro).
- **Procesador:** Intel Core i3 / AMD Ryzen 3 / Apple Silicon (o equivalente de 2.0 GHz superior).
- **Memoria RAM:** Mínimo 2 GB libre en terminal cliente.
- **Resolución de Pantalla:** Mínimo 1280 x 720 píxeles.
- **Conectividad:** Enlace de red HTTPS con ancho de banda mínimo de 1 Mbps por terminal activa.

## 4. Estándares de Interoperabilidad Integrados
- **Formato de Exportación de Expediente:** HL7 FHIR Release 4 (JSON structured Bundle: Patient, Observation, ClinicalImpression).
- **Codificación de Datos Criptográficos:** SHA-256 (Merkle Chains acopladas) y AES-256-GCM.
- **Zona Horaria del Sistema:** UTC estricto para estampas de tiempo en la bitácora WORM y trazabilidad forense.

## 5. Ciclo de Vida del Software conforme a IEC 62304 (Cláusula 5)
- **Desarrollo:** Ciclo iterativo con especificación formal SRS, diseño arquitectónico modular y control de versiones Git.
- **Mantenimiento (Cláusula 6):** Registro de tickets de soporte, análisis de causas raíz y evaluación de impacto en seguridad antes de cada despliegue.
- **Gestión de Riesgos (Cláusula 7 / ISO 14971):** AMEF continuo con trazabilidad directa hacia los controles de código y pruebas SecOps.
