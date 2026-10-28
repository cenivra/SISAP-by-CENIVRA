# ==============================================================================
# SISAP by CENIVRA — Script PowerShell para Instalación y Ejecución Local
# ==============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "       SISAP by CENIVRA — Sistema de Información Clínica y Gobernanza" -ForegroundColor Cyan
Write-Host "       Automatización de Entorno Local y Lanzamiento (PowerShell)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Comprobar Node.js (mínimo 22.5.0 para soporte nativo de node:sqlite)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR CRÍTICO] Node.js no está instalado en este equipo." -ForegroundColor Red
    Write-Host "1. Descarga el instalador gratuito desde: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Instala la versión Node.js 22.5.0 o superior." -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir..."
    exit 1
}

$nodeVerStr = (node -v).TrimStart('v')
$parts = $nodeVerStr.Split('.')
$major = [int]$parts[0]
$minor = [int]$parts[1]

if ($major -lt 22 -or ($major -eq 22 -and $minor -lt 5)) {
    Write-Host "[ERROR] Versión detectada: v$nodeVerStr. Se requiere Node.js 22.5.0 o superior para node:sqlite." -ForegroundColor Red
    Read-Host "Presiona Enter para salir..."
    exit 1
}
Write-Host "[OK] Node.js detectado: v$nodeVerStr (compatible)" -ForegroundColor Green

# 2. Configuración opcional
if (-not (Test-Path "firebase-applet-config.json") -and (Test-Path "firebase-applet-config.json.example")) {
    Copy-Item "firebase-applet-config.json.example" "firebase-applet-config.json"
}

# 3. Comprobar dependencias
if (-not (Test-Path "node_modules")) {
    Write-Host "[PASO 1/4] Instalando dependencias de Node.js..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Falló la instalación de paquetes con npm." -ForegroundColor Red
        Read-Host "Presiona Enter para salir..."
        exit 1
    }
    Write-Host "[OK] Dependencias instaladas correctamente." -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencias ya instaladas." -ForegroundColor Green
}

# 4. Inicializar base de datos SQLite local
Write-Host ""
Write-Host "[PASO 2/4] Verificando e inicializando base de datos SQLite..." -ForegroundColor Cyan
node backend/src/cli/init-db.js

# 5. Iniciar backend loopback en segundo plano
Write-Host ""
Write-Host "[PASO 3/4] Comprobando servicio backend seguro (127.0.0.1:8080)..." -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8080/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
    Write-Host "[OK] Backend ya se encuentra activo." -ForegroundColor Green
} catch {
    Write-Host "[INFO] Iniciando backend en segundo plano..." -ForegroundColor Yellow
    Start-Process node -ArgumentList "backend/src/server.js" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# 6. Lanzar servidor y navegador
Write-Host ""
Write-Host "[PASO 4/4] Iniciando servidor Vite en http://localhost:3000..." -ForegroundColor Cyan
Write-Host "Credenciales demo: usuario: psicologo | clave: demo-clinico" -ForegroundColor White
Write-Host "Presiona CTRL + C cuando desees detener el servidor." -ForegroundColor Gray
Write-Host ""

Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
} | Out-Null

npm run dev
