@echo off
chcp 65001 >nul
title SISAP by CENIVRA - Instalador y Servidor Local
color 0b

echo ==============================================================================
echo        SISAP by CENIVRA — Sistema de Información Clínica y Gobernanza
echo        Instalación y Lanzamiento Automatizado (Entorno Local Seguro)
echo ==============================================================================
echo.

:: 1. Verificar si Node.js está instalado y su versión (mínimo 22.5.0 para node:sqlite)
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR CRÍTICO] Node.js no está instalado en este equipo.
    echo.
    echo Para que SISAP funcione localmente, necesitas instalar Node.js 22.5.0 o superior.
    echo 1. Descarga el instalador oficial gratuito desde: https://nodejs.org/
    echo 2. Instala la versión LTS actual (Node.js 22 o superior).
    echo 3. Reinicia tu terminal o haz doble clic nuevamente en este archivo.
    echo.
    pause
    exit /b 1
)

:: Validación estricta de versión de Node.js mediante runtime
node -e "const [major, minor] = process.versions.node.split('.').map(Number); if (major < 22 || (major === 22 && minor < 5)) { console.error('[ERROR] Versión detectada: v' + process.versions.node + '. Se requiere Node.js 22.5.0 o superior para soporte nativo de base de datos local SQLite (node:sqlite).'); process.exit(1); } else { console.log('[OK] Node.js v' + process.versions.node + ' compatible detectado.'); }"
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo Por favor actualiza Node.js a la versión 22.5.0 o superior desde https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Preparar configuración de demostración si no existe
if not exist "firebase-applet-config.json" (
    if exist "firebase-applet-config.json.example" (
        echo [INFO] Generando firebase-applet-config.json a partir del archivo de ejemplo...
        copy "firebase-applet-config.json.example" "firebase-applet-config.json" >nul
    )
)

:: 3. Verificar e instalar dependencias en node_modules
if not exist "node_modules\" (
    echo.
    echo [PASO 1/4] Carpeta node_modules no encontrada. Instalando dependencias del proyecto...
    echo Esto tomará entre 30 y 60 segundos la primera vez...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0c
        echo.
        echo [ERROR] Ocurrió un fallo al ejecutar npm install.
        echo Verifica tu conexión a internet o intenta ejecutar: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas exitosamente.
) else (
    echo [OK] Dependencias de Node.js ya presentes.
)

:: 4. Inicializar base de datos local SQLite y aplicar migraciones
echo.
echo [PASO 2/4] Verificando e inicializando base de datos SQLite local...
call node backend/src/cli/init-db.js
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] No se pudo inicializar la base de datos local.
    pause
    exit /b 1
)
echo [OK] Base de datos local lista y verificada.

:: 5. Iniciar servicio backend en loopback (127.0.0.1:8080) si no está activo
echo.
echo [PASO 3/4] Comprobando disponibilidad del servicio backend...
node -e "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Iniciando backend seguro en segundo plano (http://127.0.0.1:8080)...
    start "SISAP Backend (127.0.0.1:8080)" /min node backend/src/server.js
    :: Esperar hasta 3 segundos a que el backend responda
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Backend local ya se encuentra activo en el puerto 8080.
)

:: 6. Abrir navegador e iniciar frontend Vite
echo.
echo [PASO 4/4] Iniciando interfaz web de SISAP en http://localhost:3000...
echo ==============================================================================
echo   El sistema abrirá automáticamente tu navegador en: http://localhost:3000
echo.
echo   Credenciales de demostración iniciales (consultar README.md para más roles):
echo   • Psicólogo:  usuario: psicologo   contraseña: demo-clinico
echo   • Director:   usuario: director    contraseña: demo-director
echo   • Admin:      usuario: admin       contraseña: demo-admin
echo.
echo   Para detener el sistema, presiona CTRL + C en esta ventana.
echo ==============================================================================
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

call npm run dev

pause
