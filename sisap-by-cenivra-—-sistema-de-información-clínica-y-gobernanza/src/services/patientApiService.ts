/**
 * Servicio cliente para interactuar con la API local de SISAP (SQLite en 127.0.0.1:8080).
 * Maneja consultas parametrizadas, detección de duplicados, recuperación de expedientes
 * y control de errores sin exponer datos sensibles.
 */

export interface PatientSearchResult {
  patient_id: string;
  pseudonym: string;
  nombre_completo: string;
  estado: string;
  actualizado_en: string;
  es_dato_prueba: number;
}

export interface PatientDuplicateCheck {
  patient_id: string;
  pseudonym: string;
  nombre_completo: string;
  curp?: string;
  estado: string;
  coincide_curp: boolean | null;
}

export interface ClinicalRecordPayload {
  patient: {
    patient_id: string;
    pseudonym: string;
    nombre_completo: string;
    curp?: string;
    fecha_nacimiento: string;
    edad: number;
    sexo: 'M' | 'F' | 'Otro';
    estado: string;
    es_dato_prueba: number;
    creado_en: string;
  };
  record: {
    record_id: string;
    patient_id: string;
    expediente_fisico?: string;
    motivo_ingreso?: string;
    diagnostico_cie?: string;
    droga_impacto?: string;
    ingreso_fecha?: string;
    contacto_emergencia?: string;
    telefono_emergencia?: string;
  } | null;
  evaluations: Array<{
    evaluation_id: string;
    fecha_eval: string;
    aplico: string;
    scoring_version: string;
    vector24_json?: string;
    notas?: string;
    creado_en: string;
  }>;
  observations: Array<{
    observation_id: string;
    week_number: number;
    fecha_entrega: string;
    validation_state: string;
    preprocessing_version: string;
    analysis_state: string;
  }>;
  model_runs: Array<{
    run_id: string;
    engine: string;
    state: string;
    model_version: string;
    preprocessing_version: string;
    started_at: string;
  }>;
}

export interface CreatePatientInput {
  nombre_completo: string;
  curp?: string;
  expediente_fisico?: string;
  fecha_nacimiento?: string;
  edad?: number;
  sexo?: 'M' | 'F' | 'Otro';
  estado: string;
  motivo_ingreso?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  allow_duplicate?: boolean;
}

const API_BASE =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8080/api'
    : '/api';

export class PatientApiService {
  /**
   * Comprueba la disponibilidad del backend local y la base SQLite.
   */
  static async checkHealth(): Promise<{ ok: boolean; message?: string; dbPath?: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        return { ok: false, message: `Servidor respondió con código ${res.status}` };
      }
      const data = await res.json();
      return { ok: Boolean(data.ok), dbPath: data.dbPath };
    } catch {
      return { ok: false, message: 'Servicio backend local no disponible (127.0.0.1:8080)' };
    }
  }

  /**
   * Búsqueda de pacientes por nombre o CURP.
   * Aplica límite en el servidor para evitar enumeración total.
   */
  static async searchPatients(query: string): Promise<PatientSearchResult[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const url = `${API_BASE}/patients/search?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { credentials: 'omit', Accept: 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error en búsqueda de pacientes (${res.status})`);
    }

    const data = await res.json();
    return data.results || [];
  }

  /**
   * Consulta potenciales duplicados por nombre normalizado y CURP.
   */
  static async checkDuplicates(nombreCompleto: string, curp?: string): Promise<PatientDuplicateCheck[]> {
    const params = new URLSearchParams();
    params.set('nombre_completo', nombreCompleto.trim());
    if (curp) params.set('curp', curp.trim());

    const res = await fetch(`${API_BASE}/patients/duplicates?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  }

  /**
   * Recupera el expediente clínico disociado de un paciente por su identificador UUID o seudónimo.
   */
  static async getPatientRecord(patientId: string): Promise<ClinicalRecordPayload> {
    const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(patientId)}/record`, {
      headers: { credentials: 'omit', Accept: 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error al recuperar expediente (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Registra un nuevo paciente en la base SQL local con control de duplicados.
   */
  static async createPatient(
    payload: CreatePatientInput,
    allowDuplicate = false
  ): Promise<{ patient: PatientSearchResult; recordId: string }> {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ...payload, allow_duplicate: allowDuplicate }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 409) {
        const error = new Error(err.error || 'Existe un paciente con nombre similar.');
        (error as unknown as { isDuplicate: boolean }).isDuplicate = true;
        throw error;
      }
      throw new Error(err.error || `Error al registrar paciente (${res.status})`);
    }

    const data = await res.json();
    return {
      patient: data.patient,
      recordId: data.record?.record_id,
    };
  }
}
