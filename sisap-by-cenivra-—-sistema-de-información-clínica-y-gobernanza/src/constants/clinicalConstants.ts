/**
 * SISAP by CENIVRA — Constantes Clínicas y de Gobernanza (Versión Pública Sintética)
 *
 * Módulo de metadatos clínicos, roles de acceso, usuarios de demostración
 * y catálogo de escalas psicométricas estandarizadas.
 *
 * NOTA DE SEGURIDAD Y GOBERNANZA:
 * Todos los usuarios incluidos en este archivo corresponden a cuentas DEMOSTRATIVAS
 * con credenciales ficticias para evaluación técnica local. No contiene credenciales
 * reales, nombres de pacientes ni datos clínicos auténticos.
 */

import { RoleConfig, RoleKey, UserAccount } from '../types/clinical';

export const ROLES: Record<RoleKey, RoleConfig> = {
  superadmin: {
    key: 'superadmin',
    n: 'Superadministración',
    descripcion: 'Control integral, lectura total, reidentificación auditada, acceso a capa blindada y modelos.',
    ve_identidad: true,
    reidentifica: true,
    escribe: true,
    usa_modelo: true,
    administra: true,
    capa_blindada: true,
    exportar_drive: true,
  },
  admin: {
    key: 'admin',
    n: 'Administración del Centro',
    descripcion: 'Gestión de cuentas, bitácoras operativas, infraestructura. NO tiene acceso al contenido clínico confidencial.',
    ve_identidad: false,
    reidentifica: false,
    escribe: false,
    usa_modelo: false,
    administra: true,
    capa_blindada: false,
    exportar_drive: true,
  },
  director_clinico: {
    key: 'director_clinico',
    n: 'Dirección Clínica',
    descripcion: 'Supervisión integral de casos, aprobación diagnóstica, revisión de escalas y reidentificación justificada.',
    ve_identidad: true,
    reidentifica: true,
    escribe: true,
    usa_modelo: true,
    administra: false,
    capa_blindada: false,
    exportar_drive: true,
  },
  psicologo: {
    key: 'psicologo',
    n: 'Psicología Clínica',
    descripcion: 'Captura y análisis de notas de evolución, escalas psicométricas, narraciones semanales y entrevistas.',
    ve_identidad: true,
    reidentifica: true,
    escribe: true,
    usa_modelo: true,
    administra: false,
    capa_blindada: false,
    exportar_drive: true,
  },
  medicina: {
    key: 'medicina',
    n: 'Medicina / Psiquiatría',
    descripcion: 'Evaluación somatomédica, desintoxicación, psicofarmacología y seguimiento de abstinencia física.',
    ve_identidad: true,
    reidentifica: true,
    escribe: true,
    usa_modelo: false,
    administra: false,
    capa_blindada: false,
    exportar_drive: true,
  },
  enfermeria: {
    key: 'enfermeria',
    n: 'Enfermería',
    descripcion: 'Signos vitales, administración de fármacos prescritos, detección de crisis somáticas y tamizaje rápido.',
    ve_identidad: true,
    reidentifica: false,
    escribe: true,
    usa_modelo: false,
    administra: false,
    capa_blindada: false,
    exportar_drive: false,
  },
  consejero: {
    key: 'consejero',
    n: 'Consejería en Adicciones',
    descripcion: 'Acompañamiento vivencial, bitácora de autoayuda (12 Pasos), reporte de incidentes y observación.',
    ve_identidad: false,
    reidentifica: false,
    escribe: true,
    usa_modelo: false,
    administra: false,
    capa_blindada: false,
    exportar_drive: false,
  },
  trabajador_social: {
    key: 'trabajador_social',
    n: 'Trabajo Social',
    descripcion: 'Entrevistas familiares, estudio socioeconómico, red de apoyo exterior y planeación del egreso.',
    ve_identidad: true,
    reidentifica: false,
    escribe: true,
    usa_modelo: false,
    administra: false,
    capa_blindada: false,
    exportar_drive: true,
  },
  coordinacion: {
    key: 'coordinacion',
    n: 'Coordinación Operativa',
    descripcion: 'Supervisión de estancias, control de cupo residencial, altas, bajas y reportes estadísticos ciegos.',
    ve_identidad: false,
    reidentifica: false,
    escribe: false,
    usa_modelo: false,
    administra: false,
    capa_blindada: false,
    exportar_drive: true,
  },
  viewer: {
    key: 'viewer',
    n: 'Auditoría Externa / Solo Lectura',
    descripcion: 'Inspección de calidad y cumplimiento normativo (CECAJ / COFEPRIS). Solo datos ciegos.',
    ve_identidad: false,
    reidentifica: false,
    escribe: false,
    usa_modelo: false,
    administra: false,
    capa_blindada: false,
    exportar_drive: false,
  },
};

/**
 * Cuentas de demostración iniciales con contraseñas de prueba documentadas.
 * ÚNICAMENTE PARA USO EN ENTORNO DE EVALUACIÓN LOCAL Y DEMOSTRACIÓN.
 */
export const INITIAL_USERS: UserAccount[] = [
  { u: 'superadmin', c: 'demo-super', nombre: 'Dra. Demo Superadmin (Sintético)', rol: 'superadmin', cedula: 'CED-DEMO-0001' },
  { u: 'admin', c: 'demo-admin', nombre: 'Lic. Demo Administrador (Sintético)', rol: 'admin' },
  { u: 'director', c: 'demo-director', nombre: 'Dr. Demo Director Clínico (Sintético)', rol: 'director_clinico', cedula: 'CED-DEMO-0002' },
  { u: 'psicologo', c: 'demo-clinico', nombre: 'Mtra. Demo Psicología (Sintético)', rol: 'psicologo', cedula: 'CED-DEMO-0003' },
  { u: 'medicina', c: 'demo-medicina', nombre: 'Dr. Demo Medicina (Sintético)', rol: 'medicina', cedula: 'CED-DEMO-0004' },
  { u: 'enfermeria', c: 'demo-enfermeria', nombre: 'Enf. Demo Enfermería (Sintético)', rol: 'enfermeria', cedula: 'CED-DEMO-0005' },
  { u: 'consejero', c: 'demo-consejero', nombre: 'Cns. Demo Consejero (Sintético)', rol: 'consejero' },
  { u: 'trabajador', c: 'demo-social', nombre: 'Lic. Demo Trabajo Social (Sintético)', rol: 'trabajador_social', cedula: 'CED-DEMO-0006' },
  { u: 'coordinacion', c: 'demo-coord', nombre: 'Lic. Demo Coordinación (Sintético)', rol: 'coordinacion' },
  { u: 'lectura', c: 'demo-lectura', nombre: 'Auditor Demo COFEPRIS/CECAJ (Sintético)', rol: 'viewer' },
];

export const COLUMNAS_MODELO = [
  'BIS_11BIS_motor',
  'BIS_11BIS_nonplanning',
  'BIS_11BIS_cognitive_instability',
  'BIS_11BIS_perseverance',
  'BIS_11BIS_motor_impulsivity',
  'BIS_11BIS_total_calculado',
  'compuesto_bis',
  'STAXI_2STAXI_state',
  'STAXI_2STAXI_trait',
  'STAXI_2STAXI_temperamento',
  'compuesto_staxi',
  'BSL_23BSL_general',
  'BSL_23BSL_total_integrado',
  'compuesto_bsl',
  'GAD_7GAD_zscore',
  'BADS_bads_activation',
  'BADS_bads_avoidance',
  'BADS_bads_work',
  'BADS_bads_social',
  'edad',
  'tiempo_consumo',
  'trat_previos',
  'tiempo_consumoEROS',
  'trat_previosEROS',
];

export const INSTRUMENTOS_CATALOGO = [
  {
    id: 'BIS_11',
    n: 'BIS-11 — Escala de Impulsividad de Barratt',
    items: 30,
    cadencia: 'inicial',
    rango_items: '1 (Rara vez) a 4 (Siempre)',
    punt: ['motor', 'nonplanning', 'cognitive_instability', 'perseverance', 'motor_impulsivity', 'total'],
  },
  {
    id: 'BSL_23',
    n: 'BSL-23 — Lista de Síntomas Límite',
    items: 23,
    cadencia: 'inicial',
    rango_items: '0 (Nada) a 4 (Mucho)',
    punt: ['general', 'total_integrado'],
  },
  {
    id: 'GAD_7',
    n: 'GAD-7 — Escala de Ansiedad Generalizada',
    items: 7,
    cadencia: 'inicial',
    rango_items: '0 (Nunca) a 3 (Casi todos los días)',
    punt: ['total', 'zscore', 'severidad'],
  },
  {
    id: 'STAXI_2',
    n: 'STAXI-2 — Inventario de Expresión de Ira Estado-Rasgo',
    items: 44,
    cadencia: 'inicial',
    rango_items: '1 (Casi nunca) a 4 (Casi siempre)',
    punt: ['state', 'trait', 'temperamento'],
  },
  {
    id: 'BADS',
    n: 'BADS — Escala de Activación Conductual para Depresión',
    items: 25,
    cadencia: 'inicial',
    rango_items: '0 (En desacuerdo) a 6 (Totalmente de acuerdo)',
    punt: ['activation', 'avoidance', 'work', 'social'],
  },
  {
    id: 'EROS',
    n: 'EROS — Escala de Recompensa Ambiental',
    items: 10,
    cadencia: 'inicial',
    rango_items: '1 (Totalmente en desacuerdo) a 7 (Totalmente de acuerdo)',
    punt: ['total_recompensa'],
  },
];

export const SEGUIMIENTO_CATALOGO = [
  {
    frecuencia: 'Semana A',
    descripcion: 'Evaluación rápida de activación, craving y síntomas nucleares',
    instrumentos: [
      { id: 'BADS', nombre: 'BADS (Activación Conductual)', duracion: '6 min' },
      { id: 'BSCS', nombre: 'Brief Substance Craving Scale (0-10)', duracion: '2 min' },
      { id: 'DST', nombre: 'DST (Test de Sensibilidad al Descuento)', duracion: '4 min' },
      { id: 'EROS', nombre: 'EROS (Recompensa Ambiental)', duracion: '3 min' },
      { id: 'PSS4', nombre: 'Estrés Percibido PSS-4', duracion: '2 min' },
      { id: 'GAD7', nombre: 'GAD-7 (Ansiedad Generalizada)', duracion: '3 min' },
      { id: 'SHAPS', nombre: 'SHAPS (Capacidad Hedónica / Anhedonia)', duracion: '3 min' },
      { id: 'UCLA3', nombre: 'UCLA-3 (Soledad Afectiva)', duracion: '2 min' },
    ],
  },
  {
    frecuencia: 'Semana B',
    descripcion: 'Evaluación de evitación experiencial, rumiación y flexibilidad',
    instrumentos: [
      { id: 'AAQ2', nombre: 'AAQ-II (Aceptación y Acción - Evitación)', duracion: '3 min' },
      { id: 'ATQ8', nombre: 'ATQ-8 (Pensamiento Automático Negativo)', duracion: '3 min' },
      { id: 'BSCS2', nombre: 'Brief Substance Craving Scale', duracion: '2 min' },
      { id: 'CESDR', nombre: 'CESD-R (Sintomatología Depresiva)', duracion: '5 min' },
      { id: 'CFQ1', nombre: 'CFQ-1 (Fusión Cognitiva)', duracion: '3 min' },
      { id: 'IUS12', nombre: 'IUS-12 (Intolerancia a la Incertidumbre)', duracion: '4 min' },
      { id: 'RRSSF', nombre: 'RRS-SF (Respuesta Rumiante Breve)', duracion: '3 min' },
      { id: 'SCS', nombre: 'SCS (Autocompasión Breve)', duracion: '4 min' },
    ],
  },
  {
    frecuencia: 'Cada Mes',
    descripcion: 'Batería mensual de impacto clínico, desregulación y recuperación',
    instrumentos: [
      { id: 'DERSE', nombre: 'DERS-E (Desregulación Emocional)', duracion: '10 min' },
      { id: 'PHQ9', nombre: 'PHQ-9 (Criterios DSM de Depresión Mayor)', duracion: '4 min' },
      { id: 'RASDS', nombre: 'RAS-DS (Etapas de Recuperación en Adicción)', duracion: '8 min' },
      { id: 'PSS14', nombre: 'Estrés Percibido PSS-14 (Completo)', duracion: '5 min' },
      { id: 'ISI', nombre: 'ISI (Índice de Severidad de Insomnio)', duracion: '3 min' },
      { id: 'BSL23', nombre: 'BSL-23 (Monitoreo de desregulación límite)', duracion: '6 min' },
    ],
  },
  {
    frecuencia: 'Pre / Post Tratamiento',
    descripcion: 'Medición de salida y cambio estructural en rasgos de personalidad',
    instrumentos: [
      { id: 'ROSENBERG', nombre: 'Escala de Autoestima de Rosenberg', duracion: '3 min' },
      { id: 'BISBAS', nombre: 'BIS/BAS (Sensibilidad al Castigo y a la Recompensa)', duracion: '6 min' },
      { id: 'OCIR', nombre: 'OCI-R (Inventario Obsesivo-Compulsivo)', duracion: '5 min' },
      { id: 'ECRR', nombre: 'ECR-R (Apego Adulto)', duracion: '8 min' },
      { id: 'UCLA20', nombre: 'UCLA-20 (Aislamiento social completo)', duracion: '6 min' },
    ],
  },
];

export const ESQUEMA_SQL_CENIVRA = `-- SISAP by CENIVRA: Esquema Canónico de Base de Datos Clínicos y Gobernanza
-- Principio ontológico: Separación estricta entre Identidad (Padrón) y Datos Clínicos (Expedientes)

CREATE TABLE IF NOT EXISTS padron_identidad (
  seudonimo         TEXT PRIMARY KEY,              -- Identificador ciego (ej. TUS-0007)
  nombre_completo   TEXT NOT NULL,                 -- Dato personal protegido (sólo visible con permiso)
  curp              TEXT,                          -- Clave de identificación nacional
  expediente_fisico TEXT,                          -- Número de archivo físico en el centro
  fecha_nacimiento  TEXT NOT NULL,
  sexo              TEXT CHECK(sexo IN ('M', 'F', 'Otro')),
  contacto_emergencia TEXT,
  telefono_emergencia TEXT,
  creado_en         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por        TEXT NOT NULL,
  activo            INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS pacientes_clinico (
  seudonimo         TEXT PRIMARY KEY REFERENCES padron_identidad(seudonimo) ON DELETE RESTRICT,
  fecha_ingreso     DATE NOT NULL,
  estado            TEXT NOT NULL CHECK(estado IN ('En desintoxicación','Residencial','Ambulatorio','Seguimiento','Alta por objetivos','Baja voluntaria')),
  sesiones_totales  INTEGER DEFAULT 0,
  droga_impacto     TEXT,
  diagnostico_cie   TEXT,                          -- Código CIE-11 / DSM-5-TR asentado por profesional
  diagnostico_texto TEXT,
  ultima_evaluacion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bitacora_acceso (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  marca_tiempo      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario           TEXT NOT NULL,
  rol               TEXT NOT NULL,
  accion            TEXT NOT NULL,                 -- 'reidentificacion', 'consulta_identidad', 'export_drive', etc.
  seudonimo         TEXT,
  justificacion     TEXT,
  hash_integridad   TEXT
);

-- REGLA DE SOLO-ANEXADO (IMMUTABLE AUDIT LOG)
CREATE TRIGGER IF NOT EXISTS bloquear_modificacion_bitacora
BEFORE UPDATE ON bitacora_acceso
BEGIN
  SELECT RAISE(FAIL, 'VIOLACION DE GOBERNANZA: La bitacora de acceso es estrictamente de solo-anexado.');
END;

CREATE TRIGGER IF NOT EXISTS bloquear_borrado_bitacora
BEFORE DELETE ON bitacora_acceso
BEGIN
  SELECT RAISE(FAIL, 'VIOLACION DE GOBERNANZA: No se permite eliminar registros de auditoria.');
END;

-- VISTA DE ANONIMATO PARA INVESTIGACION Y EPIDEMIOLOGIA
-- No contiene llaves de acceso al padron ni nombres
CREATE VIEW IF NOT EXISTS v_analisis_investigacion AS
SELECT
  p.seudonimo,
  p.fecha_ingreso,
  p.estado,
  p.sesiones_totales,
  p.droga_impacto,
  p.diagnostico_cie
FROM pacientes_clinico p;`;
