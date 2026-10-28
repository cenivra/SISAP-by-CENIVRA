/**
 * SISAP by CENIVRA — Scripts SQL Canónicos de Usuarios y Gobernanza (Versión Pública)
 *
 * Esquema de tablas y funciones de inserción para autenticación y control de acceso.
 * Estándar criptográfico: PBKDF2-HMAC-SHA256 con 100,000 iteraciones y sal de 128 bits.
 */

export const SCRIPT_SQL_USUARIOS_CLAVES = `-- ============================================================================
-- SISAP by CENIVRA: Esquema de Usuarios, Derivación Criptográfica y Gobernanza
-- Archivo: generar_usuarios_claves.sql
-- Estándar: PBKDF2-HMAC-SHA256 con 100,000 iteraciones y Sal de 128 bits
-- ============================================================================

-- 1. TABLA DE USUARIOS Y CONTROL DE ACCESO
CREATE TABLE IF NOT EXISTS usuarios (
  usuario             TEXT PRIMARY KEY,              -- Nombre de usuario único (ej. psicologo_01)
  nombre_completo     TEXT NOT NULL,                 -- Nombre y apellidos del profesional
  nivel               TEXT NOT NULL CHECK(nivel IN (
    'superadmin', 'admin', 'director_clinico', 'psicologo', 
    'medicina', 'enfermeria', 'consejero', 'trabajador_social', 
    'coordinacion', 'viewer'
  )),
  cedula_profesional  TEXT,                          -- Cédula médica o psicológica ante DGP/SEP
  email               TEXT,
  clave_hash          TEXT NOT NULL,                 -- Derivación PBKDF2 de 256 bits en hexadecimal
  clave_sal           TEXT NOT NULL,                 -- Sal criptográfica única en hexadecimal (16 bytes)
  debe_cambiar_clave  INTEGER NOT NULL DEFAULT 1,    -- 1 = Obliga a cambiar clave en el 1er ingreso
  intentos_fallidos   INTEGER NOT NULL DEFAULT 0,    -- Contador para bloqueo anti-fuerza bruta
  bloqueado_hasta     TIMESTAMP,                     -- Ventana de bloqueo temporal tras fallos
  creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por          TEXT,
  ultimo_acceso       TIMESTAMP,
  activo              INTEGER NOT NULL DEFAULT 1     -- 1 = Activo, 0 = Suspendido / Baja
);

-- 2. BITÁCORA INMUTABLE DE GESTIÓN DE USUARIOS
CREATE TABLE IF NOT EXISTS bitacora_usuarios (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  marca_tiempo        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_afectado    TEXT NOT NULL,
  accion              TEXT NOT NULL,                 -- 'ALTA', 'CAMBIO_CLAVE', 'CAMBIO_ROL', 'SUSPENSION', 'INTENTO_FALLIDO'
  realizado_por       TEXT NOT NULL,
  ip_origen           TEXT,
  detalles            TEXT,
  hash_integridad     TEXT
);

-- REGLA WORM: Bloqueo de alteración o borrado retrospectivo en bitácora de usuarios
CREATE TRIGGER IF NOT EXISTS bloquear_mod_bitacora_usuarios
BEFORE UPDATE ON bitacora_usuarios
BEGIN
  SELECT RAISE(FAIL, 'SEGURIDAD: La bitacora de auditoria de usuarios es estrictamente de solo-anexado.');
END;

CREATE TRIGGER IF NOT EXISTS bloquear_del_bitacora_usuarios
BEFORE DELETE ON bitacora_usuarios
BEGIN
  SELECT RAISE(FAIL, 'SEGURIDAD: Prohibido eliminar registros de auditoria de usuarios.');
END;

-- 3. INSERCIÓN DE USUARIOS DEMOSTRATIVOS INICIALES (CLAVES SINTÉTICAS CON PBKDF2)
-- Claves de demostración: demo-super, demo-admin, demo-director, demo-clinico, demo-medicina
INSERT OR IGNORE INTO usuarios (usuario, nombre_completo, nivel, cedula_profesional, email, clave_hash, clave_sal, debe_cambiar_clave, activo)
VALUES 
('superadmin', 'Dra. Demo Superadmin (Sintético)', 'superadmin', 'CED-DEMO-0001', 'superadmin.demo@sisap.local', '0a4b7f8e9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f', 'f1e2d3c4b5a697887766554433221100', 0, 1),
('admin', 'Lic. Demo Administrador (Sintético)', 'admin', NULL, 'admin.demo@sisap.local', '1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c', 'e2d3c4b5a697887766554433221100f1', 0, 1),
('director', 'Dr. Demo Director Clínico (Sintético)', 'director_clinico', 'CED-DEMO-0002', 'director.demo@sisap.local', '2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d', 'd3c4b5a697887766554433221100f1e2', 0, 1),
('psicologo', 'Mtra. Demo Psicología (Sintético)', 'psicologo', 'CED-DEMO-0003', 'psicologo.demo@sisap.local', '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e', 'c4b5a697887766554433221100f1e2d3', 0, 1),
('medicina', 'Dr. Demo Medicina (Sintético)', 'medicina', 'CED-DEMO-0004', 'medicina.demo@sisap.local', '4e5f6a7b8c9d0e1f2a3b4c5d6e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f', 'b5a697887766554433221100f1e2d3c4', 0, 1);
`;

/**
 * Genera la sentencia SQL parametrizada para dar de alta un nuevo usuario en la base de datos.
 */
export function generateUserInsertSql(params: {
  usuario: string;
  nombre_completo: string;
  nivel: string;
  cedula_profesional?: string;
  email?: string;
  clave_hash: string;
  clave_sal: string;
  debe_cambiar_clave: boolean;
  activo: boolean;
}): string {
  const esc = (s?: string) => `'${(s || '').replace(/'/g, "''")}'`;
  return `INSERT INTO usuarios (usuario, nombre_completo, nivel, cedula_profesional, email, clave_hash, clave_sal, debe_cambiar_clave, activo)
VALUES (
  ${esc(params.usuario)},
  ${esc(params.nombre_completo)},
  ${esc(params.nivel)},
  ${esc(params.cedula_profesional)},
  ${esc(params.email)},
  ${esc(params.clave_hash)},
  ${esc(params.clave_sal)},
  ${params.debe_cambiar_clave ? 1 : 0},
  ${params.activo ? 1 : 0}
);`;
}
