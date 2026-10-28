@echo off
chcp 65001 >nul
title SISAP by CENIVRA - Servidor Local
color 0a

echo ==============================================================================
echo        Iniciando SISAP by CENIVRA en entorno local...
echo ==============================================================================
echo.

:: 1. Verificar versión de Node.js (mínimo 22.5.0)
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

:: 2. Inicializar base de datos SQLite y aplicar migraciones
echo [1/3] Verificando base de datos SQLite local...
call node backend/src/cli/init-db.js

:: 3. Iniciar servicio backend en segundo plano si no está activo
echo [2/3] Levantando backend local seguro (127.0.0.1:8080)...
node -e "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >nul 2>&1
if %errorlevel% neq 0 (
    start "SISAP Backend (127.0.0.1:8080)" /min node backend/src/server.js
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Backend ya en ejecución.
)

:: 4. Abrir navegador e iniciar frontend Vite
echo [3/3] Iniciando interfaz Vite en http://localhost:3000...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

call npm run dev
