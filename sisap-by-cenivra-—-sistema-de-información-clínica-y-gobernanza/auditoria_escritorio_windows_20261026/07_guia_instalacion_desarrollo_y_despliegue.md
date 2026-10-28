# 07. Guía de Instalación, Desarrollo y Despliegue en Windows

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha:** 26 de octubre de 2026  
**Identificador:** SISAP-DESK-AUD-20261026-07  

---

## 1. Requisitos del sistema

- **Sistema Operativo:** Windows 10 o Windows 11 (64 bits).
- **Para desarrollo y compilación:** Node.js v20+ o v24+ (Node.js v24.22.1 recomendado) y npm v10+.
- **Para ejecución del paquete compilado:** Ningún requisito de software previo. El paquete es autocontenido (incluye su propio runtime Chromium y Node.js). No requiere permisos de Administrador.

---

## 2. Instrucciones de desarrollo

Para ejecutar y modificar la aplicación en modo desarrollo con recarga rápida:

```powershell
# 1. Navegar a la carpeta de la aplicación
cd "sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza"

# 2. Instalar dependencias si no se ha hecho previamente
npm install --legacy-peer-deps

# 3. Lanzar la aplicación en modo escritorio
npm run desktop
```

Para ejecutar las pruebas automatizadas del backend relacional:
```powershell
npm run test:backend
```

Para verificar tipos con TypeScript:
```powershell
npm run lint
```

---

## 3. Instrucciones de compilación y empaquetado

Para generar el ejecutable de distribución de Windows:

```powershell
cd "sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza"

# Compila el frontend Vite y empaqueta la distribución con Electron Packager
npm run desktop:package
```

Salida generada:
- Carpeta: `dist-desktop\SISAP_by_CENIVRA-win32-x64\`
- Ejecutable: `SISAP_by_CENIVRA.exe`

---

## 4. Métodos de inicio en Windows

El usuario puede iniciar SISAP de tres formas diferentes, sin abrir ninguna consola ni navegador:

1. **Doble clic en el ejecutable:**  
   Abrir `dist-desktop\SISAP_by_CENIVRA-win32-x64\SISAP_by_CENIVRA.exe`.
2. **Lanzador silencioso VBS (Recomendado):**  
   Doble clic en `Iniciar_SISAP_Escritorio.vbs` ubicado en la raíz del proyecto. Lanza la aplicación directamente sin ventana negra de terminal.
3. **Script por lotes (.bat):**  
   Doble clic en `iniciar_escritorio.bat`.

---

## 5. Procedimiento de desinstalación limpia

Como SISAP no altera el Registro de Windows ni instala controladores del sistema, la desinstalación es completamente limpia:

1. Cerrar la ventana de SISAP.
2. Eliminar la carpeta de la aplicación o la carpeta `dist-desktop\`.
3. (Opcional) Si se desea eliminar la base de datos local y los expedientes clínicos del equipo, eliminar la carpeta de datos de usuario en:  
   `%APPDATA%\SISAP by CENIVRA\`  
   (`C:\Users\<Usuario>\AppData\Roaming\SISAP by CENIVRA\`)
