# Aplicación de escritorio y empaquetado

**Documento:** Desktop Application & Packaging
**Identificador:** SISAP-DESK-001
**Versión:** 1.0
**Estado:** Implementado (empaquetado verificable)

Este documento cubre dos cosas:

1. cómo se ejecuta y se empaqueta SISAP by CENIVRA como aplicación local;
2. la evaluación de alternativas tecnológicas para la futura evolución.

---

# 1. Modelo de ejecución

SISAP es una aplicación **local**. Nunca depende de infraestructura externa.

```text
run_sisap.py  →  app.desktop.main()
   ├── app.config.init_directories()
   ├── app.database.models.init_db()        (crea la BD si no existe)
   ├── servidor HTTP en 127.0.0.1:<libre>   (Werkzeug make_server, hilo daemon)
   ├── ventana nativa (pywebview → WebView2)
   └── al cerrar la ventana: shutdown del servidor y fin del proceso
```

### Por qué hay un servidor

Dash es una aplicación **web** (HTML/CSS/JS). Necesita servir su frontend y
mantener el canal de callbacks. Ese servidor es **interno y efímero**: escucha
solo en `127.0.0.1`, se elige un puerto libre automáticamente y muere al cerrar
la ventana. El usuario nunca lo gestiona ni lo ve.

Es el mismo modelo que usan Electron o Tauri: por dentro hay un proceso/servidor
local; por fuera, una ventana de aplicación.

### Diferencias entre desarrollo y producto

| | Desarrollo | Empaquetado |
|---|---|---|
| Arranque | `python run_sisap.py` | doble clic en `SISAP_Recover_AI.exe` |
| Consola | visible | oculta (`--windowed`) |
| Ventana | pywebview si está instalado; si no, navegador | pywebview/WebView2 |
| Navegador externo | posible (degradación) | no |
| Rutas de datos | `<repo>/data/` | `<carpeta del exe>/data/` |
| Assets | `<repo>/assets/` | dentro del bundle (`sys._MEIPASS/assets`) |
| Base de datos | `data/expediente_clinico.sqlite` | junto al ejecutable |

La resolución de rutas vive en `app/config.py` (`IS_FROZEN`, `BASE_DIR`,
`RESOURCE_DIR`, `ASSETS_DIR`): separa **datos escribibles** (junto al ejecutable)
de **recursos de solo lectura** (dentro del bundle).

---

# 2. Construcción

## Requisitos

```bash
python -m pip install -r requirements.txt      # incluye pywebview, pythonnet, pyinstaller
python scripts/fetch_fonts.py                  # autoaloja Sora y JetBrains Mono (una vez)
```

`fetch_fonts.py` descarga las tipografías a `assets/fonts/` y genera
`assets/fonts/fonts.css`. Sin este paso, la aplicación depende de la CDN de
Google Fonts y degrada a fuentes del sistema cuando no hay red.

## Empaquetado

```bash
python scripts/build_desktop.py --clean        # one-folder, sin ML (rápido, ~150 MB)
python scripts/build_desktop.py --with-ml      # incluye TensorFlow (grande y lento)
python scripts/build_desktop.py --console      # conserva consola (diagnóstico)
```

Salida: `dist/SISAP_Recover_AI/SISAP_Recover_AI.exe`

### Icono del ejecutable — **IMPLEMENTADO y VERIFICADO**

El icono se genera **una sola vez** con un script reproducible, y el build lo
consume. La geometría se define en un único sitio: el mismo código emite el SVG
máster **y** los PNG derivados, así que máster y derivados no pueden divergir.

```bash
python scripts/generar_icono.py      # escribe assets/branding/ y assets/icons/
```

| Artefacto | Ruta | Papel |
|---|---|---|
| Máster vectorial | `assets/branding/icono_master.svg` | fuente de verdad de la forma |
| PNG derivados | `assets/icons/sisap_{16,24,32,48,64,128,256}.png` | interfaz y documentación |
| Icono de Windows | `assets/icons/sisap.ico` | `--icon` del ejecutable; 16, 32, 48 y 256 px embebidos |
| Hoja de contacto | `assets/branding/hoja_de_contacto.png` | revisión visual (claro/oscuro, tamaño real y ampliado) |

`build_desktop.py` pasa `--icon assets/icons/sisap.ico`. Si el `.ico` no existe,
**la construcción se detiene** con un mensaje explícito en vez de producir un
ejecutable sin identidad. Reejecutar el generador produce bytes idénticos
(salida determinista).

Medir el contraste del trazo es parte del diseño: el color de señal se eligió
para superar 3:1 **contra blanco y contra `#1e1e1e`** a la vez (4.23:1 y
3.95:1). Procedencia, licencia y condiciones de la forma: `assets/branding/LEEME.md`.
El recurso es geometría original del proyecto; no deriva de marcas ni de iconos
de terceros, y no contiene texto ni letras.

### Metadatos de versión de Windows — **IMPLEMENTADO y VERIFICADO**

La versión sale de `pyproject.toml` (`[project] version`), fuente única: nadie la
escribe a mano en el build. En tiempo de construcción se genera
`build/SISAP_Recover_AI.version.txt` y se pasa con `--version-file`:

| Campo | Valor |
|---|---|
| ProductName | SISAP by CENIVRA |
| CompanyName | CENIVRA |
| FileDescription | Captura, seguimiento y análisis clínico (SISAP) |
| FileVersion / ProductVersion | la de `pyproject.toml` |
| LegalCopyright | Copyright (c) 2026 CENIVRA |

Comprobarlo sobre un `.exe` ya construido:

```powershell
(Get-Item dist\SISAP_Recover_AI\SISAP_Recover_AI.exe).VersionInfo | Format-List
```

**Evidencia de la última construcción real** (2026-09-30, `--clean`, sin `--with-ml`):
la carpeta `dist/SISAP_Recover_AI/` se generó completa (447,3 MB, *one-folder*) y,
leyendo los recursos del `.exe` con `pefile`, aparecen:

| Comprobación | Resultado |
|---|---|
| `ProductName` | SISAP by CENIVRA |
| `CompanyName` | CENIVRA |
| `FileVersion` / `ProductVersion` | 0.1.0 |
| `FileDescription` | Captura, seguimiento y análisis clínico (SISAP) |
| Tamaños de icono en los recursos del PE | 16, 24, 32, 48, 64, 128 y 256 px |
| Píxeles a 16/32/256 px vs. `assets/icons/sisap.ico` | idénticos |
| Firma Authenticode | **ausente** (`directorio de seguridad` con tamaño 0) |

### Sobre TensorFlow

`app/services/ml_model_service.py` importa `tensorflow.keras` de forma diferida
para cargar el encoder. PyInstaller detecta esa importación y empaqueta
TensorFlow completo, lo que eleva el bundle a cientos de MB y multiplica el
tiempo de construcción.

La construcción por defecto **lo excluye**. La UI, el scoring, los servicios
clínicos y el orquestador funcionan sin él. La consecuencia es explícita:

| | Sin TensorFlow (por defecto) | Con `--with-ml` |
|---|---|---|
| UI, scoring, expediente | Funcionan | Funcionan |
| Proyección latente desde respuestas | **No disponible** | Disponible |
| Flujo de evaluación | Vector de demostración declarado (`latents_source = "demo"`) | Cálculo real |
| Tamaño / tiempo de construcción | Reducido | Alto |

Para un despliegue clínico con artefactos del modelo (`encoder.h5`, `gmm_model`)
construya con `--with-ml`.

### Sobre lo que NO se puede excluir

Además de TensorFlow se excluyen `torch`, `matplotlib`, `zmq`, `IPython`,
`jupyter`, `pygments` y `pytest`, que la aplicación no usa.

**No se puede excluir `plotly` ni su cadena de dependencias**
(`_plotly_utils`, `narwhals`, `pandas`, `scipy`, `pyarrow`). Se intentó y la
aplicación empaquetada fallaba al arrancar:

```text
ModuleNotFoundError: No module named 'narwhals'
  dash._callback → dash.long_callback.managers.celery_manager
    → _plotly_utils.utils → _plotly_utils.basevalidators
```

`import dash` carga `_plotly_utils` aunque la interfaz no use gráficos. Verificar
`'plotly' in sys.modules` resulta engañoso: el paquete que Dash importa es
`_plotly_utils`, no `plotly`.

Esto explica el tamaño del bundle (~333 MB): plotly arrastra pandas y scipy.
Reducirlo exigiría sustituir Dash, no ajustar el empaquetado.

## Verificación realizada

Construcción y ejecución comprobadas en Windows 11 con Python 3.14.2:

| Comprobación | Resultado |
|---|---|
| Construcción `--onedir` sin TensorFlow | OK, ~9-13 min |
| `dist/SISAP_Recover_AI/` | 3 097 archivos, **333.1 MB** |
| `SISAP_Recover_AI.exe` | 32.6 MB |
| Arranque del ejecutable | OK, sirve en `127.0.0.1:<puerto>` |
| `/`, `/pacientes`, `/pacientes/nuevo`, `/pacientes/<id>`, `/…/evaluacion/nueva`, `/panel` | HTTP 200 |
| `/assets/app.css` y `/assets/fonts/fonts.css` desde el bundle | HTTP 200 |
| Tipografías autoalojadas servidas | HTTP 200/304 (sin CDN) |
| Callbacks de Dash en el binario (`POST /_dash-update-component`) | HTTP 200 |
| Base de datos creada junto al ejecutable | `dist/SISAP_Recover_AI/data/expediente_clinico.sqlite` |
| Carpetas creadas en el bundle | solo `data/` y `_internal/` |
| Registro de arranque | `dist/SISAP_Recover_AI/sisap_startup.log` |

El registro de arranque es deliberado: en modo ventana no hay consola, así que
todo fallo de inicio queda escrito en `sisap_startup.log` junto al ejecutable.
En ejecución desatendida (`--no-window`) **no** se abre diálogo modal, para no
bloquear el proceso.

## Detalles del empaquetado

- `assets/` se incluye como recurso de solo lectura dentro del bundle.
- `data/` **no** se incluye: la base de datos se crea junto al ejecutable en el
  primer arranque.
- Se recolectan todos los subpaquetes de `app` porque varias páginas se importan
  de forma diferida dentro de los callbacks y el análisis estático no las vería.
- `--collect-all dash` es necesario: Dash sirve su propio bundle JS desde los
  archivos de datos del paquete.

## Firma de código (Authenticode) — **PREPARADA; firma real PENDIENTE**

La firma es un paso **posterior** al empaquetado y **no** lo hace
`build_desktop.py`. Un ejecutable recién construido **no está firmado**; nada en
el proceso marca lo contrario.

```bash
python scripts/firmar.py --list-tools        # qué herramienta y credencial se ven
python scripts/firmar.py                     # firma el ejecutable y el instalador si existe
python scripts/firmar.py dist/setup_sisap.exe
python scripts/firmar.py --all-binaries      # además, todo .exe/.dll/.msi bajo dist/
python scripts/firmar.py --verify-signature dist/SISAP_Recover_AI/SISAP_Recover_AI.exe
```

- **Herramienta:** `signtool.exe` (Windows SDK) o `osslsigncode` si no hay SDK.
- **Sellado de tiempo RFC 3161** obligatorio (`/tr` + `/td sha256`).
- **La credencial de firma nunca está en el repositorio.** Se lee del entorno:
  `SISAP_SIGN_PFX` (o `SISAP_SIGN_CERT_PATH`) + `SISAP_SIGN_PASSWORD`, o una
  credencial del almacén de Windows por `SISAP_SIGN_CERT_SHA1` /
  `SISAP_SIGN_CERT_SUBJECT`. El script **rechaza** cualquier ruta que apunte
  dentro del repositorio.
- Si falta la herramienta o la credencial, el script se **detiene** con un
  mensaje explícito y **no** marca nada como firmado. No existe ninguna ruta que
  finja la firma. `--dry-run` sólo imprime la orden y lo dice sin ambigüedad.

Códigos de salida:

| Modo | Código | Significado |
|---|---|---|
| firma | 0 | firmado y verificado |
| firma | 2 | faltan precondiciones (nada firmado) |
| firma | 3 | la firma falló |
| firma | 4 | no hay artefactos que firmar |
| firma | 5 | `--dry-run`: sólo se imprimió la orden, nada se firmó |
| verificación | 0 | firmado y válido |
| verificación | 1 | no firmado |
| verificación | 2 | firma presente pero no válida |
| verificación | 3 | no comprobable (falta herramienta o no es un binario firmable) |

### Qué falta para firmar de verdad

1. **Una credencial de firma de código propia, OV o EV**, emitida a nombre de
   CENIVRA por una autoridad de confianza pública. Sin ella no hay nada que
   firmar. Se guarda **fuera** del repositorio, como PFX/PKCS#12 con contraseña
   o importada al almacén de Windows.
2. **La herramienta de firma**: `signtool.exe` del Windows SDK (presente en este
   equipo, en `Windows Kits/10/bin/*/x64/signtool.exe`) u `osslsigncode`.
3. **Una autoridad de sellado de tiempo RFC 3161** accesible por HTTP.

Estado: el guion está **IMPLEMENTADO** y **VERIFICADO** en sus modos de
comprobación, de rechazo (sin credencial, sin herramienta, credencial dentro del
repositorio) y de orden simulada; la firma real de un binario propio está
**PENDIENTE** porque la credencial OV/EV todavía no existe.

## Despliegue

Copiar la carpeta `dist/SISAP_Recover_AI/` **completa** (one-folder). El `.exe`
no funciona aislado.

## Requisitos del equipo destino

- Windows 10/11 de 64 bits.
- **WebView2 Runtime** (motor de Edge). Viene preinstalado en Windows 11 y en la
  mayoría de Windows 10 actualizados. Si falta, instalar el *Evergreen Runtime*
  de Microsoft. Sin él, la aplicación cae al navegador local.
- Sin permisos de administrador para ejecutar (todo vive en la carpeta de la app).

## Checklist antes de distribuir

- [ ] `APP_SECRET_KEY` real (no la de desarrollo).
- [ ] `APP_ENV=production`.
- [ ] Artefactos del modelo presentes (`encoder.h5`, `gmm_model`) junto al ejecutable.
- [ ] Fuentes autoalojadas (`assets/fonts/`).
- [ ] Verificado el arranque en un equipo **sin** Python instalado.
- [ ] Verificado el arranque **sin red** (fuentes y assets locales).
- [ ] Base de datos creada y accesible en la carpeta del ejecutable.
- [ ] La API clínica no es accesible desde la red (solo `127.0.0.1`).
- [ ] Icono presente en el ejecutable (`assets/icons/sisap.ico`, 16/32/48/256).
- [ ] Metadatos de versión correctos en el `.exe` (`VersionInfo`).
- [ ] Firma de código aplicada al `.exe` y al instalador, y **comprobada**
      (`scripts/firmar.py --verify-signature`, código de salida 0).
- [ ] Sellado de tiempo presente en la firma.

---

# 3. Estado y pendientes del empaquetado

| Elemento | Estado |
|---|---|
| Lanzador local (`app/desktop.py`) | **Implementado** |
| Ventana nativa (pywebview/WebView2) | **Implementado** (con degradación a navegador) |
| Rutas conscientes del empaquetado (`config.py`) | **Implementado** |
| Tipografías autoalojadas | **Implementado** |
| Script de empaquetado (`scripts/build_desktop.py`) | **Implementado** |
| Icono del ejecutable (`assets/icons/sisap.ico`) | **Implementado y verificado** (16/32/48/256 embebidos) |
| Metadatos de versión de Windows del `.exe` | **Implementado y verificado** |
| Generador del icono (`scripts/generar_icono.py`) | **Implementado y verificado** (salida determinista) |
| Firma de código (Authenticode): guion `scripts/firmar.py` | **Implementado y verificado** en comprobación, rechazo y `--dry-run` |
| Firma de código: firma real de un binario propio | **Pendiente** — falta la credencial OV/EV propia |
| Instalador (MSI/Inno Setup) | Pendiente |
| Actualizaciones automáticas | Pendiente |
| Modo *one-file* | No recomendado (arranque lento y desempaquetado temporal) |

---

# 4. Evaluación de alternativas a Dash

Se evaluó mantener Dash frente a reescribir la capa de presentación.

**Dato clave:** la lógica clínica está desacoplada (`app/services/`,
`app/clinical/`, `app/security/`, `app/database/`). **Cualquier alternativa
reutilizaría el backend completo**; lo que se reescribiría es la capa de
presentación (`app/ui/components`, `app/ui/pages`, `app/ui/layout`,
`assets/app.css`), hoy entre 2 500 y 3 500 líneas.

| Opción | Modelo | Reutiliza backend | Ventana nativa | Madurez | Coste de migración |
|---|---|---|---|---|---|
| **Dash + pywebview** (actual) | web en loopback | — | Sí (WebView2) | Alta | — |
| NiceGUI | web (FastAPI + Vue/Quasar) | Sí | Sí (pywebview integrado) | Media | Medio |
| Flet | Flutter renderizado desde Python | Sí | Sí (nativa) | Media | Medio-alto |
| PySide6 / Qt | widgets nativos | Sí | Sí (Qt) | Muy alta | Alto |
| Toga (BeeWare) | nativo multiplataforma | Sí | Sí | Baja-media | Alto |
| Reflex | web (React) | Sí | Vía navegador | Media | Medio |
| Textual | TUI en terminal | Sí | No aplica | Media | No aplica (otro producto) |

## Criterios de decisión

| Criterio | Dash+pywebview | NiceGUI | Flet | PySide6 |
|---|---|---|---|---|
| Continuidad con lo construido | completa | baja | nula | nula |
| Control fino del layout clínico | alto (CSS propio) | medio (CSS) | medio | alto |
| Esfuerzo de reescritura | ninguno | alto | muy alto | muy alto |
| Empaquetado | PyInstaller | PyInstaller | nativo | PyInstaller |
| Riesgo de regresión clínica | nulo | alto | alto | alto |

## Recomendación

**Mantener Dash + pywebview.** Razones:

1. La dirección visual ya está implementada y validada (sistema visual propio en
   CSS, densidad, jerarquía clínica).
2. El coste de una migración es una reescritura completa de la presentación sin
   ganancia funcional: el producto ya es local, sin navegador externo.
3. La misión del proyecto prioriza la trazabilidad y la verificación; una
   reescritura invalidaría la evidencia de UI existente y exigiría nueva V&V.

## Cuándo reevaluar

Reconsiderar solo si se cumple alguno de estos disparadores:

- tiempo de arranque del binario > 5 s en el equipo destino;
- tamaño del bundle > 500 MB;
- necesidad real de operar en equipos **sin** WebView2;
- requisito regulatorio explícito de interfaz nativa;
- necesidad de integración con hardware (lectores, instrumentos) donde el
  puente de pywebview resulte insuficiente;
- multiusuario concurrente intenso sobre la misma instalación.

Si se activa alguno, la opción con mejor relación coste/beneficio es
**NiceGUI** (mismo modelo web, ventana nativa integrada, reutiliza el backend),
seguida de **PySide6** si se exige nativo.

---

# 5. Referencias históricas

- `assets/branding/LEEME.md` — procedencia y licencia del icono.
- `scripts/generar_icono.py` — generador del icono (SVG máster, PNG, `.ico`).
- `scripts/firmar.py` — firma de código y comprobación de firma Authenticode.
- `app/ui/README.md` — arquitectura de la interfaz clínica.

---

# 6. Actualización — 26 de octubre de 2026: Consolidación de la Aplicación Canónica de Escritorio (Electron / React 19)

Conforme a la decisión de consolidación arquitectónica de SISAP by CENIVRA, la aplicación de escritorio se unifica en la ruta canónica:
`sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`

### 6.1 Resumen de la arquitectura de escritorio consolidada

1. **Plataforma y Framework:**
   - **Frontend:** React 19, TypeScript 5, Vite 5, Tailwind CSS, Lucide React.
   - **Contenedor de escritorio:** Electron v45 (Chromium/Node.js).
   - **Persistencia local:** SQLite nativo a través de `node:sqlite` (Node.js 22 LTS / Electron), configurado con WAL (`PRAGMA journal_mode = WAL;`) y claves foráneas estrictas (`PRAGMA foreign_keys = ON;`).
   - **Ubicación de base de datos:** `data/local/sisap_test.sqlite3` (entorno local de pruebas) y `data/local/sisap_production.sqlite3` (producción).
   - **Proceso de Ventana:** Ventana única nativa de 1366x868 (mínimo 1024x768) con ciclo de vida completo de ventana Windows (`mainWindow`), sin requerir apertura de navegador ni intervención manual en puertos de red.

2. **Seguridad y Aislamiento del Proceso:**
   - `contextIsolation: true`
   - `nodeIntegration: false`
   - `sandbox: false` (con preload restringido `preload.cjs` vía `contextBridge`)
   - Exposición estricta mediante API segura en `window.sisapDesktop`:
     - `ping()` para diagnóstico de canal IPC.
     - `executeSql(action, payload)` canalizando operaciones autorizadas al motor SQLite del proceso principal.
     - `getAppVersion()` y `getPlatform()`.

3. **Ciclo de vida y lanzadores:**
   - **Desarrollo y pruebas:** `npm run electron:dev` (inicia Vite y lanza Electron sincronizado).
   - **Lanzador directo Windows:** `iniciar_sisap_escritorio.bat` en la raíz de la aplicación canónica (inicia automáticamente la ventana sin consola).
   - **Empaquetado de producción:** `electron-builder` (`npm run dist:win`), produciendo instalador NSIS (`.exe`) y paquete portable en `dist-electron/`.
   - **Firma de código:** Compatible con `scripts/firmar.py` para la firma Authenticode de los ejecutables generados en `dist-electron/`.

4. **Retiro de código obsoleto:**
   - Se retiraron del repositorio el prototipo Python/Dash (`app/desktop.py`, `run_sisap.py`), el empaquetador PyInstaller (`scripts/build_desktop.py`) y las cachés de compilación en `build/`.
   - Los artefactos de identidad (`generar_icono.py`, `firmar.py`) se mantienen preservados y vinculados al flujo de entrega de la aplicación canónica.

---

# 7. Verificación del Instalador de Windows y Pruebas Reales (26 de octubre de 2026)

### 7.1 Artefactos Generados mediante `npm run dist:win`

| Artefacto | Ruta Relativa | Tamaño (Bytes) | Tamaño (MB) | Hash SHA-256 |
|---|---|:---:|:---:|---|
| **Instalador NSIS Windows** | `sisap-by-cenivra-.../dist-electron/SISAP by CENIVRA Setup 1.0.0.exe` | 121,531,339 | 115.90 MB | `B1CCA8E732FB1D89EA1D442174C0AF2D385BB93DF040CF9652018F26AF26A1D1` |
| **Bloque de Actualización NSIS** | `sisap-by-cenivra-.../dist-electron/SISAP by CENIVRA Setup 1.0.0.exe.blockmap` | 128,767 | 0.12 MB | `FE1D937BDEB394AE2F9F3D5B317135832E5049537DE8808D80F166FDE0E7B27C` |
| **Binario empaquetado (win-unpacked)** | `sisap-by-cenivra-.../dist-electron/win-unpacked/SISAP by CENIVRA.exe` | 249,797,632 | 238.22 MB | `0C50BEBFFC524595EF68B7626F5A612061779239AF93C93FF1D87522AE551CF3` |

### 7.2 Resultados de la Suite de Pruebas de Escritorio

1. **Compilación de Frontend (Vite):** Aprobada (1,705 módulos transformados, bundle minificado en `dist/`).
2. **Verificación Estricta de Tipos (TypeScript):** Aprobada (`tsc --noEmit`, 0 errores).
3. **Pruebas Automatizadas de Backend:** Aprobadas (15/15 pruebas unitarias y de integración pasando en `node:test`).
4. **Empaquetado Electron:** Aprobado (`electron-builder v26.18.0` con destino NSIS x64 y extracción determinista).
5. **Ejecución del Paquete Generado:** Aprobada. El ejecutable arranca en ventana nativa Chromium/Electron sin necesidad de navegador externo.
6. **Diagnóstico HTTP Local:** `/api/health` responde HTTP 200 en `127.0.0.1:8080` con base de datos activa en `%APPDATA%\SISAP by CENIVRA\data\local\sisap_test.sqlite3`, 10 tablas creadas, modo WAL activo y verificación referencial habilitada.
7. **Prueba de Persistencia y Reinicio:**
   - Se insertó un paciente sintético (`PACIENTE SINTETICO DIST`, `TUS-0004`, expediente `cb3ec05f-e809-4e4a-b1da-594f532088d1`).
   - Se detuvo por completo el árbol de procesos de Electron.
   - Se reinició la aplicación desde el binario empaquetado.
   - Se verificó la recuperación íntegra e inalterada del registro en la nueva sesión.
8. **Seguridad y Fronteras:**
   - Ningún peso de modelo (`.h5`, `.onnx`, `.pt`) ni datos sensibles expuestos en el bundle público `dist/`.
   - Modos clínicos y autoencoders protegidos bajo contratos estrictos y sin inferencia matemática ficticia.

---

# 8. Preparación para Publicación en GitHub Releases y Gobernanza de Distribución Pública (26 de octubre de 2026)

### 8.1 Política de Publicación de Binarios y Releases
1. **Exclusión de Git:** Las salidas de compilación (`dist-electron/`, `dist-desktop/`, instaladores `.exe` y desempaquetados) están estrictamente ignoradas por Git en `.gitignore`. No deben comitearse al historial de Git para evitar la degradación del repositorio.
2. **Distribución mediante GitHub Releases:** Los instaladores binarios de Windows (`SISAP by CENIVRA Setup 1.0.0.exe`) se publicarán como archivos adjuntos (*assets*) en la sección de **Releases** de GitHub, acompañados de sus sumas de verificación SHA-256 y notas de versión.
3. **Desacoplamiento de Modelos de IA:** Los pesos neuronales (`.h5`, `.onnx`) entrenados por CENIVRA sobre cohortes reales permanecen fuera de la distribución pública en `data/modelo/` (ignorado en Git).
4. **Simulador Demostrativo:** La aplicación pública incluye el componente `AutoencoderSimulatorView` con datos 100% sintéticos y un banner visible permanente:
   *«MODO DEMOSTRACIÓN. Datos sintéticos. No ejecuta el autoencoder canónico ni genera resultados clínicos»*.
5. **Solicitud de Acceso a IA Canónica:** Para proyectos formales (e.g. SensorLab, hospitales), se incluye el protocolo institucional de acceso con el marcador:
   `[CANAL OFICIAL PENDIENTE DE ASIGNACIÓN INSTITUCIONAL]`.
6. **Telemetría Responsable:** Desactivada por defecto, con anonimización estricta por expresiones regulares, buffer local transparente y posibilidad de exportación o borrado por el usuario.



