# 03. Persistencia de Datos y Rutas en Windows

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha:** 26 de octubre de 2026  
**Identificador:** SISAP-DESK-AUD-20261026-03  

---

## 1. Localización física de la base de datos

Uno de los requerimientos críticos de una aplicación de escritorio profesional en Windows es evitar almacenar datos persistentes en directorios temporales (`AppData\Local\Temp`) o dentro de carpetas de instalación que puedan sobrescribirse durante una actualización.

### 1.1 Resolución adaptativa de rutas
SISAP implementa una lógica de resolución contextual en `electron/main.cjs` y `backend/src/config.js`:

```javascript
// En desarrollo:
userDbDir = path.join(appRoot, 'data', 'local');
// => <repo>\sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza\data\local

// En producción empaquetada (Windows):
userDbDir = path.join(app.getPath('userData'), 'data', 'local');
// => C:\Users\<Usuario>\AppData\Roaming\SISAP by CENIVRA\data\local
```

### 1.2 Justificación de `app.getPath('userData')` en Windows
1. **Preservación entre actualizaciones:** Si el usuario actualiza la carpeta o ejecutable de SISAP a una versión más reciente, la carpeta `AppData\Roaming\SISAP by CENIVRA\` permanece intacta, preservando todos los expedientes, evaluaciones y registros de auditoría históricos.
2. **Permisos de escritura estándar:** No requiere privilegios de Administrador para crear, leer o modificar la base de datos `sisap_test.sqlite3` o sus archivos de bitácora WAL (`sisap_test.sqlite3-wal`, `sisap_test.sqlite3-shm`).
3. **Aislamiento de código vs. datos:** Separa los recursos de solo lectura de la aplicación (código compilado en `resources/app`) de los datos clínicos vivos.

---

## 2. Esquema relacional y migraciones automáticas

En el primer arranque en un equipo nuevo, el backend verifica la existencia de la base de datos en `userDbDir`:
- Si no existe, se ejecuta la migración inicial `001_initial_schema.sql`.
- Se crean las 10 entidades normalizadas:
  1. `schema_migrations` (Historial de versiones de esquema)
  2. `patients` (Padrón de identidad con nombre real, CURP y datos de contacto)
  3. `clinical_records` (Expediente ciego desvinculado, enlazado solo por UUID y seudónimo `TUS-XXXX`)
  4. `initial_evaluations` (Batería psicométrica de 6 escalas canónicas y vector de 24 reactivos)
  5. `scale_responses` (Respuestas atómicas por ítem)
  6. `scale_scores` (Subescalas calculadas)
  7. `weekly_observations` (Observaciones semanales de evolución)
  8. `model_runs` (Registro auditable de intentos y estado de ejecución de modelos)
  9. `model_outputs` (Salidas de modelos analíticos)
  10. `audit_events` (Bitácora inmutable con disparadores WORM y encadenamiento criptográfico SHA-256)

---

## 3. Respaldo y recuperación de datos

El backend incluye herramientas CLI reproducibles para salvaguardar la base de datos:

- **Copia de seguridad en caliente (Backup API):**  
  `node backend/src/cli/backup.js`  
  Crea una instantánea consistente en `data/local/backups/sisap_backup_<timestamp>.sqlite3`, verificando la integridad de SQLite antes de concluir.
- **Modo exportación segura:**  
  La interfaz clínica cuenta con el botón "Respaldar en Drive" para sincronización encriptada voluntaria con almacenamiento en la nube institucional de Google Workspace.
