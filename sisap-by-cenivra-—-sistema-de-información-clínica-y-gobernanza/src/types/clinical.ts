export type RoleKey =
  | 'superadmin'
  | 'admin'
  | 'director_clinico'
  | 'psicologo'
  | 'medicina'
  | 'enfermeria'
  | 'consejero'
  | 'trabajador_social'
  | 'coordinacion'
  | 'viewer';

export interface RoleConfig {
  key: RoleKey;
  n: string;
  descripcion: string;
  ve_identidad: boolean;
  reidentifica: boolean;
  escribe: boolean;
  usa_modelo: boolean;
  administra: boolean;
  capa_blindada: boolean;
  exportar_drive: boolean;
}

export interface UserAccount {
  u: string;
  c: string; // Demo password fallback
  nombre: string;
  rol: RoleKey;
  cedula?: string;
  email?: string;
  clave_hash?: string;
  clave_sal?: string;
  debe_cambiar_clave?: boolean;
  activo?: boolean;
  creado_en?: string;
  ultimo_acceso?: string;
  mfa_habilitado?: boolean;
  mfa_secreto?: string;
}

export interface PatientPadron {
  seudonimo: string; // TUS-XXXX
  nombre_completo: string; // Private
  curp?: string;
  expediente_fisico: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: 'M' | 'F' | 'Otro';
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  creado_en: string;
  creado_por: string;
  activo: boolean;
}

export type PatientStatus =
  | 'En desintoxicación'
  | 'Residencial'
  | 'Ambulatorio'
  | 'Seguimiento'
  | 'Alta por objetivos'
  | 'Baja voluntaria';

export interface PatientClinico {
  seudonimo: string;
  ingreso: string;
  estado: PatientStatus;
  sesiones: number;
  droga_impacto?: string;
  diagnostico_cie?: string;
  diagnostico_impresion?: string;
  escalas: {
    BIS_11?: boolean;
    BSL_23?: boolean;
    GAD_7?: boolean;
    STAXI_2?: boolean;
    BADS?: boolean;
    EROS?: boolean;
  };
  ultima_actualizacion?: string;
}

export interface AuditLogEntry {
  id: string;
  hora: string;
  timestampUtc?: string;
  usuario: string;
  rol: RoleKey;
  accion: string;
  exp: string;
  motivo?: string;
  detalles?: string;
  ip?: string;
  prevHash?: string;
  hash?: string;
}

export interface ClinicalDraft {
  clave: string;
  formulario: string;
  screen: string;
  pre: string;
  paciente: string;
  sello: string;
  campos: number;
  datos: Record<string, string>;
}

export interface EvolutionNote {
  id: string;
  expediente: string;
  sesion: number;
  fecha: string;
  hora: string;
  tipo: 'psicologia' | 'medicina' | 'consejeria' | 'enfermeria';
  objetivo: string;
  resumen: string;
  resultado: string;
  siguiente: string;
  actividades: string;
  observaciones: string;
  proxima_cita?: string;
  profesional_nombre: string;
  profesional_cedula: string;
  creado_en: string;
}

export interface FamilyNote {
  id: string;
  expediente: string;
  familiar_nombre: string;
  parentesco: string;
  sesion_no: number;
  fecha: string;
  hora: string;
  objetivo: string;
  temas: string;
  psicoeducacion: string;
  narrativa_familiar: string;
  resultado: string;
  acuerdos: string;
  plan_siguiente: string;
  observaciones: string;
  proxima_fecha?: string;
  profesional_nombre: string;
  profesional_cedula: string;
  creado_en: string;
}

export interface WeeklyNarrative {
  id: string;
  expediente: string;
  semana: number;
  fecha_entrega: string;
  q1_descripcion: string;
  q2_desafios: string;
  q3_estrategias: string;
  q4_emociones: string;
  q5_progresos: string;
  q6_reflexiones: string;
  q7_metas: string;
  q8_comentarios: string;
  creado_en: string;
}

export interface InitialEvaluationData {
  id: string;
  expediente: string;
  fecha_eval: string;
  aplico: string;
  // Raw items or strings
  raw_bis_11: string; // 30 numbers 1-4 (o 0-4 excel_canonico)
  raw_bsl_23: string; // 23 numbers 0-4
  raw_bsl_23_conductual?: string; // 11 numbers 0-4
  bsl_general_0_1?: number; // 0.0 - 1.0
  raw_gad_7: string;  // 7 numbers 0-3
  raw_staxi_2: string; // 49 numbers 1-4
  raw_bads: string;    // 25 numbers 0-6
  raw_eros: string;    // 10 numbers 0-4 o 1-4
  sustancia_principal?: string;
  modo_scoring?: 'excel_canonico' | 'manual_estandar';
  // Demographics
  edad: number;
  tiempo_consumo_anios: number;
  tratamientos_previos_cuenta: number;
  // Calculated Subscales
  calculados?: {
    bis_motor: number;
    bis_nonplanning: number;
    bis_cognitive_instability: number;
    bis_perseverance: number;
    bis_motor_impulsivity: number;
    bis_total: number;
    bsl_general: number;
    bsl_total_integrado: number;
    gad_total: number;
    gad_zscore: number;
    gad_severidad: string;
    staxi_state: number;
    staxi_trait: number;
    staxi_temperamento: number;
    bads_activation: number;
    bads_avoidance: number;
    bads_work: number;
    bads_social: number;
    eros_total: number;
  };
  vector24?: Record<string, number>;
  latentes_autoencoder?: {
    latentDimensions: Array<{
      dimId: string;
      label: string;
      rawValue: number;
      zScore: number;
      percentile: number;
      interpretation: string;
    }>;
    summaryIndices: {
      severidad_multidominio: number;
      desregulacion_emocional_impulsiva: number;
      compuesto_total: number;
      clase_latente_3b: string;
      probabilidad_clase_3b: number;
      incertidumbre_clase_3b: number;
    };
    recommendations?: string[];
  };
  creado_en: string;
}

export interface ExploratoryInterviewData {
  id: string;
  expediente: string;
  fecha: string;
  capturado_por: string;
  datos: Record<string, string>;
  creado_en: string;
  actualizado_en: string;
}

export interface DriveExportRecord {
  fileId: string;
  fileName: string;
  mimeType: string;
  exportedAt: string;
  webViewLink?: string;
  type: 'patient_dossier' | 'anonymized_database' | 'audit_log' | 'clinical_summary';
  patientPseudonym?: string;
}

export interface ConsentRecord {
  id: string;
  pacienteExp: string;
  nombreTitular: string;
  esTutor: boolean;
  nombreTutor?: string;
  fechaUtc: string;
  versionAviso: string;
  metodoConsentimiento: 'firma_digital' | 'otp_sms' | 'casilla_trazable';
  firmaDigest?: string;
  autorizoTransferenciaInvestigacion: boolean;
  autorizoAlgoritmosAnaliticos: boolean;
  registradoPor: string;
  ipRegistro: string;
}

export interface ArcoRequest {
  folio: string;
  pacienteExp: string;
  tipoDerecho: 'Acceso' | 'Rectificación' | 'Cancelación' | 'Oposición';
  solicitante: string;
  esTitular: boolean;
  contacto: string;
  descripcion: string;
  documentosAdjuntos?: string[];
  fechaRecepcion: string;
  fechaLimiteRespuesta: string; // +20 días hábiles
  estado: 'recibida' | 'en_analisis' | 'procedente' | 'ejecutada' | 'improcedente';
  dictamen?: string;
  atendidoPor?: string;
}

export interface DeidentificationVaultToken {
  token: string;
  pacienteExp: string;
  nombreReal: string;
  curp?: string;
  solicitadoPor: string;
  rolSolicitante: RoleKey;
  motivoJustificado: string;
  emitidoEn: string;
  expiraEn: string; // ISO String
  ttlSegundos: number;
}

export interface FollowUpEvaluationRecord {
  follow_up_id: string;
  patient_id: string;
  evaluation_date: string;
  session_number: number | null;
  instrument: 'BADS' | 'GAD-7' | 'EROS' | 'BSCS' | 'PSS-4' | 'SHAPS' | 'UCLA-3' | 'BIS-11' | 'STAXI-2' | 'BSL-23';
  total_score: number;
  subscales?: Record<string, number> | null;
  items: number[];
  items_count: number;
  clinical_severity?: string | null;
  clinician_id?: string | null;
  notes?: string | null;
  creado_en: string;
}

// Centro de Evaluación Psicométrica — Modelo en 3 niveles (Evaluación / Respuestas / Resultados)
export type PsychometricApplicationStatus = 'draft' | 'completed' | 'archived';
export type PsychometricCaptureMode = 'digital_form' | 'numeric_sequence_legacy';

export interface PsychometricEvaluationRecord {
  evaluation_id: string;
  patient_id: string;
  instrument_id: 'BIS-11' | 'BSL-23' | 'GAD-7' | 'EROS' | 'BADS' | 'STAXI-2';
  instrument_version: string;
  language: string;
  started_at: string;
  completed_at: string | null;
  evaluator: string;
  application_status: PsychometricApplicationStatus;
  capture_mode: PsychometricCaptureMode;
  scoring_mode: 'manual_estandar' | 'excel_canonico';
  session_context: string;
  complements?: {
    bslGeneral01?: number | null;
    bslBehavioral11?: Array<number | null> | null;
  } | null;
  notes?: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface PsychometricItemResponseRecord {
  response_row_id: string;
  evaluation_id: string;
  item_id: string;
  item_number: number;
  canonical_code: string | null;
  selected_label: string | null;
  numeric_code: number | null;
  modified_at: string;
}

export interface PsychometricResultRecord {
  result_id: string;
  evaluation_id: string;
  total_score: number | null;
  technical_total_score: number | null;
  mean_score: number | null;
  subscales: {
    subscales: any[];
    subscaleMap: Record<string, number | null>;
    alternateScoringModes: Record<string, any>;
  };
  recoded_values: any[];
  missing_items: {
    missingItems: number;
    missingItemIds: string[];
    missingDisplayNumbers: number[];
    isValidForScoring: boolean;
    warnings: string[];
  };
  derived_indicators: Record<string, any>;
  interpretation: {
    level: string;
    summary: string;
    descriptiveNotes: string[];
    nonDiagnosticNotice: string;
  };
  numeric_sequence: string;
  algorithm_version: string;
  calculated_at: string;
}

export interface PsychometricEvaluationBundle {
  evaluation: PsychometricEvaluationRecord;
  responses: PsychometricItemResponseRecord[];
  latestResult: PsychometricResultRecord | null;
  resultsHistory: PsychometricResultRecord[];
}

export interface LongitudinalInstrumentSummary {
  instrument_id: string;
  total_applications: number;
  completed_count: number;
  draft_count: number;
  versionsObserved: string[];
  versionMismatchWarning: boolean;
  versionWarningMessage: string | null;
  timeline: Array<{
    evaluation_id: string;
    date: string;
    timestamp: string;
    version: string;
    evaluator: string;
    total_score: number | null;
    technical_total_score: number | null;
    mean_score: number | null;
    subscaleMap: Record<string, number | null>;
    delta_from_previous: number | null;
  }>;
}



