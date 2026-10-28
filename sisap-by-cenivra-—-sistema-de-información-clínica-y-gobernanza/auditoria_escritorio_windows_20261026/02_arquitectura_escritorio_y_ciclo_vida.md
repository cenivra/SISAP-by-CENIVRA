# 02. Arquitectura de Escritorio, Ciclo de Vida y Control de Procesos

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha:** 26 de octubre de 2026  
**Identificador:** SISAP-DESK-AUD-20261026-02  

---

## 1. Modelo de proceso unificado

A diferencia de una arquitectura que lanza procesos separados y no coordinados (donde una terminal oculta o un subproceso de Node puede quedar huérfano tras cerrar la ventana), SISAP implementa un **modelo de proceso coordinado** dentro del ciclo de vida de Electron:

```
[ Usuario hace doble clic en SISAP_by_CENIVRA.exe ]
                       │
                       ▼
         [ Electron Main Process (main.cjs) ]
                       │
     ┌─────────────────┴─────────────────┐
     │ 1. Solicita SingleInstanceLock   │
     │ 2. Inicializa Base SQLite local  │
     │ 3. Levanta Servidor HTTP loopback│
     │    (127.0.0.1:8080)              │
     │    - Sirve dist/ SPA React        │
     │    - Sirve endpoints /api/       │
     └─────────────────┬─────────────────┘
                       │
                       ▼
       [ Sondeo de salud: /api/health ]  ──► (Si falla: ErrorBox nativo y salida limpia)
                       │
                       ▼
        [ Creación de BrowserWindow ]
     ┌───────────────────────────────────┐
     │ - Icono: assets/icons/sisap.ico   │
     │ - ContextIsolation: true          │
     │ - NodeIntegration: false          │
     │ - Preload: preload.cjs (seguro)   │
     │ - Carga: http://127.0.0.1:8080/   │
     └─────────────────┬─────────────────┘
                       │
                       ▼
     [ Cierre de Ventana / Evento Quit ]
     ┌───────────────────────────────────┐
     │ 1. Intercepta 'before-quit'       │
     │ 2. Cierra servidor HTTP (server)  │
     │ 3. Cierra conexiones SQLite (WAL) │
     │ 4. Termina proceso limpiamente    │
     └───────────────────────────────────┘
```

---

## 2. Puntos clave del ciclo de vida

### 2.1 Protección contra múltiples instancias (`Single-Instance Lock`)
Si el usuario intenta abrir SISAP cuando ya hay una ventana activa:
```javascript
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}
```
El segundo proceso cede el foco a la ventana existente mediante el evento `second-instance` y termina inmediatamente, previniendo:
- Colisión del puerto `8080`.
- Bloqueos de escritura concurrentes sobre la base SQLite (`SQLITE_BUSY`).
- Desincronización de memoria del usuario.

### 2.2 Verificación activa de salud previa a la visualización
La ventana no se muestra hasta que el servicio de persistencia y la base de datos están operativos. Mediante `waitForBackend()`, se consulta `/api/health`.
- Si el backend responde `{ ok: true }`, se crea la ventana y se hace visible en el evento `ready-to-show` (evitando destellos en blanco o ventanas no responsivas).
- Si ocurre un error irrecuperable (por ejemplo, puerto ocupado por otra aplicación ajena), se despliega un diálogo nativo de Windows (`dialog.showErrorBox`) con un mensaje claro y la aplicación se detiene sin colgarse.

### 2.3 Cierre garantizado sin procesos huérfanos
Al cerrar la ventana o ejecutar `app.quit()`:
1. Se invoca `stopBackend()`.
2. Se cierra el servidor HTTP local mediante `serverInstance.close()`.
3. Se liberan los descriptores de archivo de SQLite mediante `closeDatabase()`.
4. El proceso de Electron termina por completo. No queda ningún proceso de Node.js ni Electron activo en el Administrador de Tareas de Windows.
