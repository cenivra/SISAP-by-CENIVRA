# 06. Pruebas de Verificación y Resultados de Ejecución

**Proyecto:** SISAP-by-CENIVRA — Sistema de Información Clínica y Gobernanza  
**Fecha:** 26 de octubre de 2026  
**Identificador:** SISAP-DESK-AUD-20261026-06  

---

## 1. Verificación del sistema de tipos y compilación

### 1.1 Verificación de TypeScript
- **Comando:** `npm run lint` (`tsc --noEmit`)
- **Resultado:** Código de salida 0 (0 errores, 0 advertencias).
- **Evidencia:**
  ```text
  > sisap-by-cenivra@1.0.0 lint
  > tsc --noEmit
  ```

### 1.2 Compilación para producción (Vite)
- **Comando:** `npm run build` (`vite build`)
- **Resultado:** Código de salida 0.
- **Artefactos generados:**
  - `dist/index.html` (1.19 kB)
  - `dist/assets/index-CTqZ1t0D.css` (47.65 kB)
  - `dist/assets/index-gslEO2_T.js` (815.24 kB)
- **Tiempo de compilación:** 2.37 segundos.

---

## 2. Pruebas automatizadas del backend y persistencia

- **Comando:** `npm run test:backend`
- **Runner:** `node --test` nativo (Node.js v24.22.1)
- **Resultado:** **15 pruebas ejecutadas, 15 pruebas aprobadas (100% éxito)**.
- **Detalle de casos de prueba:**
  1. `T-01`: Inicialización crea base, 10 tablas y tabla `schema_migrations` (OK).
  2. `T-02`: Migraciones idempotentes sin duplicación de registros (OK).
  3. `T-10 (parcial)`: Restricción inmutable WORM en `audit_events` (OK).
  4. `T-06`: Creación transaccional atómica de paciente + expediente ciego (OK).
  5. `T-04`: Búsqueda parametrizada por nombre con límite estricto (OK).
  6. `T-06b`: Prevención de duplicados sin confirmación explícita (OK).
  7. `T-08`: Búsqueda con entradas SQL maliciosas e inyección SQL resulta inocua (OK).
  8. Búsqueda con término menor a 2 caracteres es rechazada con error comprensible (OK).
  9. `T-07`: Evaluación psicométrica se vincula correctamente al paciente (OK).
  10. `T-09`: Transacción revertida no deja registros parciales (OK).
  11. `T-10`: Middleware `loopbackOnly` rechaza conexiones remotas no locales (OK).
  12. Rate limiting en memoria bloquea abusos tras exceder umbral por minuto (OK).
  13. `verifyOrigin` rechaza peticiones de mutación con orígenes ajenos a localhost/127.0.0.1 (OK).
  14. Cadena criptográfica SHA-256 de auditoría es verificable e inmutable (OK).
  15. Logger JSON redacta automáticamente contraseñas, CURP, teléfonos y tokens (OK).

---

## 3. Pruebas de empaquetado de escritorio y artefactos

- **Comando:** `npm run desktop:package`
- **Herramienta:** `electron-packager` v17.1.2 sobre Electron v45.0.0 (Windows x64).
- **Resultado:** Carpeta de distribución generada en `dist-desktop\SISAP_by_CENIVRA-win32-x64\`.
- **Ejecutable principal:**
  - Archivo: `dist-desktop\SISAP_by_CENIVRA-win32-x64\SISAP_by_CENIVRA.exe`
  - Tamaño: 249,781,248 bytes (238.21 MB)
  - Hash SHA-256: `0d2c9bde05af0f103b67a45e0a25dfe62d62943c38abe7c4ffe57c98b9fe9ae2`
  - Icono incrustado: `assets/icons/sisap.ico` (resoluciones de 16, 24, 32, 48, 64, 128 y 256 px).

---

## 4. Prueba de servicio local integrado (SPA + API)

Se verificó mediante solicitud HTTP controlada que el servidor integrado responde en `127.0.0.1:8080`:
- `GET http://127.0.0.1:8080/api/health` -> HTTP 200 `{ ok: true, tables: 10, foreignKeysEnabled: true }`.
- `GET http://127.0.0.1:8080/` -> HTTP 200 sirviendo `dist/index.html` con texto base de SISAP.
- Cierre del servidor: Termina en menos de 100 ms liberando el socket y la base de datos sin dejar procesos bloqueados.
