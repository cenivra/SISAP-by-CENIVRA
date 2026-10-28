# 08. Riesgos Residuales y Trabajo Pendiente

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha:** 26 de octubre de 2026  
**Identificador:** SISAP-DESK-AUD-20261026-08  

---

## 1. Riesgos residuales identificados

| ID | Riesgo Residual | Severidad | Impacto | Estrategia de Mitigación / Trabajo Pendiente |
| :--- | :--- | :--- | :--- | :--- |
| **R-DESK-01** | **Firma de código Authenticode ausente** | Media | Windows Defender SmartScreen puede alertar sobre un "editor desconocido" al abrir el ejecutable por primera vez. | Requiere adquirir un certificado digital de firma de código (OV o EV) a nombre de CENIVRA y ejecutar `signtool.exe` con sellado de tiempo RFC 3161. |
| **R-DESK-02** | **Instalador guiado (Setup Wizard) pendiente** | Baja | Actualmente se distribuye como carpeta autónoma (*portable folder*). | Desarrollar un script con Inno Setup o WiX Toolset para generar un instalador único `setup_sisap.exe` que cree automáticamente el acceso directo en el Escritorio y Menú Inicio. |
| **R-DESK-03** | **Cifrado en reposo a nivel de archivo SQLite** | Media | La base de datos `sisap_test.sqlite3` depende de las listas de control de acceso (ACL) y BitLocker del sistema operativo Windows del usuario. | Evaluar la incorporación de cifrado transparente de base de datos mediante extensiones SQLite o clave derivada por sesión de usuario. |
| **R-DESK-04** | **Pesos de autoencoder en bundle frontend (R-05)** | Media | La matriz de pesos `ENCODER_PROJECTION_WEIGHTS` está presente en el frontend compilado. | Aunque los motores de inferencia clínica están desactivados, deben migrarse a un servicio de inferencia desacoplado en el backend antes de cualquier uso clínico. |
| **R-DESK-05** | **Validación prospectiva de autoencoders pendiente** | Alta (para uso clínico) | Los modelos analíticos no cuentan con validación prospectiva en entornos clínicos reales. | Mantener los motores A y B en estado estrictamente inactivo hasta contar con autorización de comités éticos y protocolos formales de verificación y validación (V&V). |

---

## 2. Hoja de ruta recomendada para la fase de incubación

1. **Corto plazo:** Distribución del paquete `dist-desktop` para pruebas de usabilidad técnica local con profesionales de CENIVRA.
2. **Medio plazo:** Empaquetado de instalador MSI / Inno Setup con firma digital y migración de pesos de modelos a backend.
3. **Largo plazo:** Integración del runtime de inferencia local para los autoencoders una vez concluida la validación científica y ética.
