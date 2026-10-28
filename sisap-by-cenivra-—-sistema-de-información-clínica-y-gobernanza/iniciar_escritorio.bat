@echo off
chcp 65001 >nul
title SISAP by CENIVRA - Aplicación de Escritorio
echo ==============================================================================
echo        Iniciando SISAP by CENIVRA — Aplicación de Escritorio (Windows)
echo ==============================================================================
echo.

:: 1. Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR CRÍTICO] Node.js no está instalado en este equipo.
    pause
    exit /b 1
)

node -e "const [major, minor] = process.versions.node.split('.').map(Number); if (major < 22 || (major === 22 && minor < 5)) { console.error('[ERROR] Versión detectada: v' + process.versions.node + '. Se requiere Node.js 22.5.0 o superior.'); process.exit(1); }"
if %errorlevel% neq 0 (
    color 0c
    echo Se requiere Node.js 22.5.0 o superior para el soporte de node:sqlite.
    pause
    exit /b 1
)

:: 2. Si existe el binario empaquetado independiente, lanzarlo directamente
if exist "dist-desktop\SISAP_by_CENIVRA-win32-x64\SISAP_by_CENIVRA.exe" (
    echo [OK] Ejecutable empaquetado detectado.
    echo [OK] Abriendo ventana nativa de SISAP...
    start "" "dist-desktop\SISAP_by_CENIVRA-win32-x64\SISAP_by_CENIVRA.exe"
    exit /b 0
)

:: 3. Verificar que la compilación de la interfaz web exista antes de abrir Electron
if not exist "dist\index.html" (
    echo [AVISO] Compilación de interfaz web no encontrada en dist\.
    echo Generando build de producción para Electron (npm run build)...
    echo.
    call npm run build
    if %errorlevel% neq 0 (
        color 0c
        echo.
        echo [ERROR CRÍTICO] Falló la compilación de la aplicación.
        echo No se puede abrir Electron sin los archivos estáticos en dist\.
        pause
        exit /b 1
    )
    echo [OK] Compilación finalizada exitosamente.
)

:: 4. Lanzar Electron con el proceso principal
echo [OK] Iniciando proceso principal de Electron...
call npm run desktop
