# Guía Completa de Instalación y Ejecución Local: SISAP by CENIVRA

Esta guía describe cómo descargar, instalar y ejecutar **SISAP by CENIVRA** en tu equipo local (por ejemplo en tu directorio de trabajo `C:\SISAP-by-CENIVRA`) sin necesidad de un compilador complejo ni archivos `.exe` externos.

---

## 1. ¿Es necesario un ejecutable `.exe`?

**No es estrictamente necesario un `.exe`**, y para sistemas con estándares de seguridad clínica y gobernanza es incluso mejor no depender de binarios opacos. SISAP está construido con la arquitectura moderna **React 19 + TypeScript + Vite + Tailwind CSS**.

Para facilitarte la vida al 100%, se han creado dos archivos de ejecución en 1 solo clic:
* `instalar_y_ejecutar.bat` (Script automático de Windows que instala el entorno y lanza el navegador).
* `iniciar_sisap.bat` (Lanzador rápido diario).
* `instalar_y_ejecutar.ps1` (Script alternativo para PowerShell).

Además, una vez abierto en Google Chrome o Microsoft Edge, puedes hacer clic en **"Instalar aplicación"** en la barra de direcciones y se convertirá en una **Aplicación de Escritorio nativa para Windows**, con su propia ventana independiente, icono y acceso directo en el escritorio.

---

## 2. Requisito Único Previo

El único programa que necesitas tener en tu computadora es **Node.js**:
1. Entra a [https://nodejs.org/](https://nodejs.org/).
2. Descarga la versión **LTS** (Long Term Support).
3. Instálala aceptando las opciones por defecto (`Siguiente` -> `Instalar`).

---

## 3. Pasos para Ejecutar Localmente en tu Carpeta

Si ya tienes los archivos en `C:\SISAP-by-CENIVRA`:

### Método A: Doble Clic (El más rápido)
1. Abre tu explorador de archivos en `C:\SISAP-by-CENIVRA`.
2. Haz **doble clic en `instalar_y_ejecutar.bat`**.
3. El script automáticamente:
   * Verificará que Node.js esté presente.
   * Ejecutará `npm install` para descargar todas las librerías necesarias.
   * Levantará el servidor seguro local.
   * **Abrirá tu navegador por defecto en `http://localhost:3000`**.

### Método B: Desde la Terminal (CMD o PowerShell)
Si prefieres usar la consola:
```bash
cd "C:\SISAP-by-CENIVRA"
npm install
npm run dev
```
Luego abre tu navegador en:
```
http://localhost:3000
```

---

## 4. Convertir SISAP en una App de Escritorio (Sin `.exe`)

Una vez que tengas `http://localhost:3000` abierto en tu navegador:
1. En **Google Chrome**:
   * En la barra de direcciones (a la derecha), verás un icono de monitor con una flecha que dice **"Instalar SISAP by CENIVRA"**.
   * Haz clic en **Instalar**.
2. En **Microsoft Edge**:
   * En la barra de direcciones o en el menú `...` -> `Aplicaciones` -> `Instalar este sitio como una aplicación`.
3. ¡Listo! SISAP se abrirá en una ventana propia sin barras de navegador, como si fuera un programa de Windows tradicional, y tendrás el acceso directo en tu menú Inicio y barra de tareas.

---

## 5. Descarga y Respaldo a tu Google Drive

Para tener todo el código, esquemas y bases de datos sincronizados con tu Google Drive institucional:
1. Dentro de SISAP, haz clic en el botón de la nube **"Google Drive"** en la barra superior o en el menú lateral.
2. Haz clic en **"Conectar con Google Drive"** e inicia sesión con tu cuenta de Google.
3. El sistema incluye las opciones de exportación inmediata a tu carpeta de Drive:
   * **"Subir Respaldo Total de Sistema a Drive"**: Sube la base de datos completa de pacientes, padrón ciego, notas SOAP, evaluaciones de las 6 escalas, esquemas SQL (`esquema_cenivra_canonico.sql` y `generar_usuarios_claves.sql`) y la matriz de pesos del autoencoder.
   * **"Respaldar Expediente Activo"**: Sube el expediente clínico completo del paciente seleccionado.
   * **"Exportar Dataset de Investigación Anónimo"**: Sube la cohorte cuantitativa lista para análisis epidemiológico.

---

## 6. Estructura de Archivos del Proyecto (`v1.1.0`)
```
SISAP-by-CENIVRA/sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/
├── instalar_y_ejecutar.bat        <-- Doble clic para instalar y arrancar
├── iniciar_sisap.bat              <-- Lanzador diario
├── instalar_y_ejecutar.ps1        <-- Lanzador PowerShell
├── GUIA_INSTALACION_LOCAL.md      <-- Este manual
├── package.json                   <-- Dependencias y empaquetado v1.1.0
├── backend/
│   ├── migrations/                <-- Migraciones aditivas SQLite (001, 002, 003)
│   ├── src/psychometrics/         <-- Catálogo y motor de puntuación servidor
│   └── src/services/              <-- Motores 1..5 y servicio psicométrico 3 niveles
├── engines/
│   ├── autoencoder/               <-- Modelos verificados SHA-256, inferencia R/JS y tests
│   └── psychometrics/             <-- catalog_v1.json (6 instrumentos activos; OCI-R excluido)
├── src/
│   ├── App.tsx                    <-- Aplicación principal
│   ├── components/views/          <-- Incluye Centro Psicométrico y Ecosistema 5 Motores
│   ├── psychometrics/             <-- Configuración y puntuación psicométrica desacoplada
│   ├── services/                  <-- Autoencoder, SQLite API, RCI y almacenamiento local
│   └── types/                     <-- Tipos clínicos y registros en 3 niveles
```

## 7. Actualización desde v1.0.0
1. Respaldar su carpeta local de datos (`data/local/`) o ejecutar `node backend/src/cli/backup.js`.
2. Instalar dependencias limpias (`npm ci`) y recompilar (`npm run build`).
3. Al iniciar el backend (`npm run backend` o `node backend/src/cli/init-db.js`), las migraciones `002_intelligence_engines.sql` y `003_psychometric_center.sql` se aplican automáticamente preservando intactos los datos de `v1.0.0`.
