# 01. Arquitectura Inicial y Evaluación de Mecanismo de Escritorio

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha de auditoría:** 26 de octubre de 2026  
**Identificador de auditoría:** SISAP-DESK-AUD-20261026-01  

---

## 1. Auditoría del repositorio y versiones identificadas

Antes de realizar modificaciones, se inspeccionó sistemáticamente el repositorio:
`C:\SISAP-by-CENIVRA`

### 1.1 Existencia de dos capas históricas
1. **Capa legacy/prototipo (Raíz del repositorio):**
   - Implementada en Python con Dash, Flask y pywebview (`app/`, `run_sisap.py`, `scripts/build_desktop.py`).
   - Documentada en `docs/16_desktop_and_packaging/README.md`.
   - Limitaciones identificadas: paquete de 333 MB debido a dependencias analíticas no desacopladas (`plotly`, `scipy`, `pandas`), acoplamiento de callbacks y dificultad para interfaces reactivas modernas.
2. **Capa moderna de producción (Aplicación objetivo):**
   - Directorio: `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`
   - Framework frontend: **React 19 + TypeScript + Vite + Tailwind CSS**.
   - Iconografía y componentes: **Lucide React**.
   - Backend local seguro: **Node.js (node:http) + SQLite nativo (node:sqlite DatabaseSync)** en `backend/`.
   - Persistencia relacional disociada: Identidad en Padrón (`patients`) vs Expediente Ciego (`clinical_records`) con WORM inmutable en `audit_events`.

Esta segunda capa es la versión vigente y activa sobre la que se fundamenta el producto, la persistencia relacional local y la interfaz clínica.

---

## 2. Evaluación comparativa: Electron vs. Tauri

El requerimiento exige evaluar técnicamente la adopción de **Electron** frente a **Tauri** para convertir SISAP en una aplicación de escritorio local para Windows.

### 2.1 Matriz de criterios técnicos

| Criterio | Tauri (v1 / v2) | Electron (v45 LTS) | Justificación técnica en SISAP |
| :--- | :--- | :--- | :--- |
| **Toolchain disponible en el sistema** | ❌ **Ausente** (`rustc` y `cargo` no reconocidos en Windows). | ✅ **Instalado y validado** (Node.js v24.22.1 y npm 11.19.1). | Tauri exigiría descargar e instalar Visual Studio C++ Build Tools (MSVC), SDK de Windows y Rust (~3.5 GB). Electron funciona de inmediato sobre el entorno Node.js disponible. |
| **Compatibilidad con la arquitectura actual** | ⚠️ Requiere puente Rust FFI o compilar backend como sidecar independiente. | ✅ **100% Nativo** (comparte el mismo runtime Node.js del backend). | SISAP cuenta con un backend Express/node:http y base de datos relacional `node:sqlite`. En Electron, el backend se ejecuta directamente dentro del runtime. |
| **Soporte de base de datos relacional** | Requiere rusqlite o plugins Tauri SQL. | ✅ `node:sqlite DatabaseSync` nativo verificado en Electron v45. | Se verificó mediante prueba de ejecución que Electron v45 soporta `node:sqlite` sin dependencias binarias externas. |
| **Aislamiento y seguridad** | Modelo de capacidades y permisos en `tauri.conf.json`. | ✅ `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`. | Ambos frameworks permiten aislamiento estricto de contexto. Electron cuenta con API madura para IPC mediante `contextBridge`. |
| **Independencia del navegador del sistema** | Depende de Microsoft WebView2 Evergreen preinstalado. | ✅ Incluye motor Chromium autocontenido. | En entornos hospitalarios o equipos restringidos, WebView2 puede estar desactualizado o bloqueado. Electron garantiza renderizado idéntico y predecible. |
| **Evolución hacia inferencia de Autoencoders** | Requiere runtime en Rust (Tract/ORT) o subprocess Python. | ✅ Soporta Node Workers, ONNX Runtime Node o procesos hijos de inferencia. | La integración futura de modelos locales se beneficia del ecosistema Node/Python sin necesidad de bindings en Rust. |

### 2.2 Decisión técnica fundamentada

Se selecciona **Electron** como la solución definitiva para SISAP. Razones principales:
1. **Factibilidad inmediata sin dependencias ausentes:** No impone la instalación de un compilador de Rust ni de Microsoft C++ Build Tools.
2. **Simplicidad arquitectónica:** Permite ejecutar la base de datos relacional SQLite y el servidor local HTTP en el proceso principal o como proceso integrado, eliminando problemas de concurrencia y puertos huérfanos.
3. **Distribución autosuficiente para Windows:** Genera un paquete autónomo (`dist-desktop/SISAP_by_CENIVRA-win32-x64/`) con su propio ejecutable `SISAP_by_CENIVRA.exe` y dependencias fijadas.
