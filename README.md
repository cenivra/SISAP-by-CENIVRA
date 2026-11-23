# SISAP by CENIVRA

**Sistema de Información, Captura Clínica y Gobernanza de Datos**  
Desarrollado para comunidades terapéuticas y entornos de atención en salud mental y adicciones.

Sustituye la captura fragmentada o en papel de instrumentos psicométricos mediante un flujo estructurado de evaluación, normalización determinista y monitoreo longitudinal con persistencia soberana local (SQLite nativo) y trazabilidad inmutable (WORM).

---

## 1. Ubicación de la Aplicación Oficial

La aplicación ejecutable oficial y su código fuente completo se encuentran ubicados en el subdirectorio:

👉 **[`sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`](sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/)**

Todos los comandos de instalación, scripts de inicio, dependencias y pruebas se ejecutan directamente dentro de esa carpeta.

---

## 2. Requisitos del Sistema

Para ejecutar SISAP by CENIVRA de forma local o de escritorio se requiere:

- **Sistema Operativo:** Windows 10 / 11 (64-bit) o macOS / Linux compatibles con Node.js y Electron.
- **Node.js:** Versión **>= 22.5.0** (Requisito estricto: el motor de base de datos local utiliza la API nativa `node:sqlite` introducida en Node.js v22.5.0; versiones anteriores como Node 20 LTS o Node 22.0.0 a 22.4.x no cuentan con este módulo y fallarán).
- **npm:** Versión **>= 10.0.0**.
- **Memoria RAM:** 4 GB mínimo (8 GB recomendado).
- **Almacenamiento:** ~500 MB de espacio disponible para dependencias y módulos compilados.

---

## 3. Instalación y Ejecución Rápida (Windows)

Dentro de [`sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`](sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/) se incluyen scripts automatizados para el entorno Windows:

### Opción A. Instalación y puesta en marcha automática en un paso
Haga doble clic en:
```cmd
instalar_y_ejecutar.bat
```
*(O ejecute `.\instalar_y_ejecutar.ps1` desde PowerShell).*

Este script:
1. Valida que Node.js esté instalado y sea `>= 22.5.0`.
2. Instala dependencias de frontend y backend (`npm ci` o `npm install`).
3. Inicializa la base de datos local SQLite soberana con su esquema relacional y bitácoras WORM.
4. Inicia el servidor backend local y abre la aplicación en el navegador predeterminado (`http://localhost:3000`).

---

### Opción B. Ejecución en Modo Escritorio (Electron)
Para ejecutar SISAP como aplicación nativa de escritorio para Windows:
```cmd
iniciar_escritorio.bat
```
*Comando manual equivalente:*
```bash
cd "sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza"
npm run desktop
```
*(Este comando compila el bundle de producción en `dist/` e inicia la ventana nativa de Electron).*

---

### Opción C. Ejecución en Modo Web (Desarrollo)
Para iniciar el entorno de desarrollo con recarga en vivo (HMR):
```cmd
iniciar_sisap.bat
```
*Comandos manuales equivalentes:*
```bash
cd "sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza"
npm run dev:all
```
*O en dos terminales independientes:*
- **Backend (Terminal 1):** `npm run backend` (Inicia API local en `http://127.0.0.1:8080`)
- **Frontend (Terminal 2):** `npm run dev` (Inicia Vite en `http://localhost:3000`)

---

## 4. Credenciales de Prueba Demostrativas

La aplicación se distribuye preconfigurada con cuentas sintéticas para evaluación técnica de roles de gobernanza clínica:

| Rol de Usuario | Nombre de Usuario | Contraseña Demostrativa | Segundo Factor (MFA) | Nivel de Acceso y Funcionalidad |
|---|---|---|---|---|
| **Psicólogo Clínico** | `psicologo` | `demo-clinico` | `123456` o `999111` | Captura de reactivos, expedientes, historial de notas, simulación de autoencoder |
| **Director / Administrador** | `admin` | `demo-admin` | `123456` o `999111` | Gestión de usuarios, auditoría forense inmutable, gobernanza institucional |
| **Director Médico** | `director` | `demo-director` | `123456` o `999111` | Supervisión longitudinal, métricas de retención, expedientes clínicos |
| **Trabajador Social** | `trabajador` | `demo-social` | `123456` o `999111` | Padrón de beneficiarios, expediente social, redes de apoyo familiar |
| **Auditor de Calidad** | `lectura` | `demo-lectura` | `123456` o `999111` | Inspección de bitácoras WORM de sólo anexado e integridad de registros |

> [!NOTE]
> Todos los usuarios y contraseñas listados son puramente ficticios y destinados exclusivamente a pruebas locales de funcionalidad.

---

## 5. Plataforma de Inteligencia (5 Motores), Autoencoder Verificado y Centro Psicométrico (v1.1.0)

> [!NOTE]
> El primer release histórico [**v1.0.0**](https://github.com/cenivra/SISAP-by-CENIVRA/releases/tag/v1.0.0) se conserva íntegro sin modificaciones. La línea **`release/1.1.0`** incorpora las siguientes capacidades verificadas:

- **Autoencoder Funcional TUS (`engines/autoencoder/`)**: Pipeline determinista en 5 capas (JS ESM y R) con pesos y parámetros verificados mediante SHA-256 (`encoder_22_checkpoint_fase2`, `encoder_24_deployed` y prototipo confirmatorio `ae_tus_17to12_m3k12`), estricto cumplimiento D-06 (cero imputación silenciosa) y separación de `EROS` respecto a `tiempo_consumo`. El módulo **"Simulador Autoencoder"** continúa claramente separado para demostraciones sintéticas.
- **Ecosistema de 5 Motores (`IntelligenceEcosystemView`)**: Combina Motor 1 (Autoencoder 12D y reconstrucción), Motor 2 (Trayectorias longitudinales y RCI), Motor 3 (Análisis narrativo contextual con degradación elegante si no hay runtime ONNX), Motor 4 (Integración multimodal) y Motor 5 (Soporte a decisiones bajo evidencia `E1–E5` y revisión humana obligatoria, sin diagnóstico automático).
- **Centro de Evaluación Psicométrica Digital (`PsychometricCenterView`)**: Captura digital reactivo por reactivo con configuración versionada independiente de UI (`engines/psychometrics/catalog_v1.json`) para `BIS-11 (30)`, `BSL-23 (23)`, `GAD-7 (7)`, `EROS (10 / validación 9)`, `BADS-22 (v22 + compatibilidad v25)` y `STAXI-2 (49 TEA literales + estructura 57)`, manteniendo excluido `OCI-R` y almacenamiento inmutable en 3 niveles (`003_psychometric_center.sql`).

---

## 6. Arquitectura y Privacidad por Diseño

1. **Soberanía de Datos Locales:** La persistencia principal se almacena en el equipo local del usuario en SQLite con soporte WAL (Write-Ahead Logging) a través de 15 tablas relacionales verificadas (`001`–`003`). Ningún dato de salud viaja a la nube por defecto.
2. **Separación de Identidad y Clínica:** El nombre e identidad de la persona nunca viajan en los registros clínicos; se gestionan mediante seudónimos técnicos (`id_paciente`).
3. **Auditoría WORM (Write-Once, Read-Many):** Los eventos de auditoría (`audit_events`) e historial psicométrico completado (`completed`) están protegidos contra modificaciones retroactivas.
4. **Resiliencia Operativa:** La integración opcional con Google Drive / Firebase es estrictamente voluntaria; si no se provee un archivo `firebase-applet-config.json`, la aplicación opera al 100% de manera autónoma y local.

---

## 7. Pruebas y Verificación Automatizada

Dentro de [`sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`](sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/):

```bash
# Ejecutar suite de pruebas unitarias, psicométricas e integración (33/33 tests)
npm test

# Verificación de tipos TypeScript estricto (0 errores)
npm run lint

# Compilación de producción (Vite)
npm run build
```

Para la verificación científica en R del pipeline del Autoencoder (`engines/autoencoder/tests/`):
```powershell
foreach ($t in Get-ChildItem engines/autoencoder/tests/test_*.R) { Rscript $t.FullName }
```

---

## 8. Licencia, Historial de Versiones y Soporte

- **Código Fuente:** Licencia [MIT](LICENSE).
- **Documentación:** Licencia [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE).
- **Registro de Cambios y Release Notes:**
  - [CHANGELOG.md](CHANGELOG.md)
  - [Notas de Publicación v1.1.0](docs/11_release_and_maintenance/RELEASE_NOTES_v1.1.0.md)
- **Expediente Documental:** Consulte el directorio [`docs/`](docs/) para revisiones de diseño según directrices IEC 62304 / ISO aplicables.
- **Verificación del Autoencoder y Plataforma de Inteligencia (5 Motores):**
  - [A · Informe de Comprobación del Autoencoder](docs/19_autoencoder_verification_and_intelligence_platform/A_INFORME_COMPROBACION_AUTOENCODER.md)
  - [B · Mapa de Artefactos Integrados](docs/19_autoencoder_verification_and_intelligence_platform/B_MAPA_ARTEFACTOS_INTEGRADOS.md)
  - [C · Diagnóstico Arquitectónico de SISAP](docs/19_autoencoder_verification_and_intelligence_platform/C_DIAGNOSTICO_ARQUITECTONICO_SISAP.md)
  - [D · Catálogo de Skills Utilizadas](docs/19_autoencoder_verification_and_intelligence_platform/D_CATALOGO_SKILLS_UTILIZADAS.md)
  - [E · Arquitectura de Plataforma de Inteligencia](docs/19_autoencoder_verification_and_intelligence_platform/E_ARQUITECTURA_PLATAFORMA_INTELIGENCIA.md)
  - [F · Hoja de Ruta Técnica](docs/19_autoencoder_verification_and_intelligence_platform/F_HOJA_DE_RUTA_TECNICA.md)
- **Centro de Evaluación Psicométrica (Captura Digital y Configuración Versionada):**
  - [Arquitectura, Fuentes Autorizadas y Materiales Pendientes](docs/20_psychometric_evaluation_center/ARQUITECTURA_Y_MATERIALES_CENTRO_PSICOMETRICO.md)
- **Aviso de Privacidad:** Consulte [`PRIVACY.md`](PRIVACY.md).
- **Política de Seguridad:** Consulte [`SECURITY.md`](SECURITY.md).
