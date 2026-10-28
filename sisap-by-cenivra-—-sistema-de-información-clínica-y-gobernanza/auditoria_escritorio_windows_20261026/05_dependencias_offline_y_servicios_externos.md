# 05. Dependencias Offline y Servicios Externos

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha:** 26 de octubre de 2026  
**Identificador:** SISAP-DESK-AUD-20261026-05  

---

## 1. Auditoría de dependencias en tiempo de ejecución

Para determinar la viabilidad operativa sin conexión a Internet (*offline-first*), se auditaron todos los componentes de interfaz, servicios y estilos.

### 1.1 Clasificación de recursos

| Recurso | Tipo de empaquetado | ¿Requiere Internet? | Comportamiento sin conexión |
| :--- | :--- | :--- | :--- |
| **Motor Chromium y Node.js** | Embebido en `SISAP_by_CENIVRA.exe` | No | Totalmente autónomo |
| **Base de datos SQLite** | Local en `node:sqlite` nativo | No | Totalmente autónomo |
| **Interfaz SPA (React 19 + Vite)** | Compilada en `dist/` | No | Totalmente autónomo |
| **Estilos CSS (Tailwind)** | Compilados en `dist/assets/index-*.css` | No | Sin dependencias de CDN |
| **Iconografía (Lucide React)** | Compilada en el bundle JS | No | Sin llamadas a repositorios remotos |
| **Tipografías** | Fuentes del sistema (`ui-monospace, Consolas, monospace`) | No | Sin enlaces a Google Fonts |
| **Cálculo de subescalas psicométricas** | Lógica interna TypeScript en frontend | No | Totalmente funcional offline |
| **Autenticación con Google Drive** | Firebase Auth / Google APIs (`googleDriveService.ts`) | **Sí** | Opcional: Si no hay red, la app no se rompe; el botón de respaldo avisa de la falta de conexión. |
| **Telemetría opcional** | Banner voluntario (`TelemetryService.ts`) | Opcional | Si está deshabilitada o no hay red, no interfiere con el uso clínico. |

---

## 2. Diagnóstico del funcionamiento sin conexión

1. **Arranque y uso general:** SISAP **inicia, captura, busca pacientes, almacena expedientes y genera reportes 100% sin conexión a Internet**.
2. **Respaldo en la nube:** La única funcionalidad que depende de conectividad externa es la sincronización de archivos con Google Drive a través de Firebase.
3. **Resiliencia de Firebase:** En `src/services/googleDriveService.ts`, la inicialización de Firebase se ejecuta en modo no bloqueante. Si no hay conexión a los servidores de Google, la aplicación continúa funcionando normalmente para todos los flujos clínicos locales.
