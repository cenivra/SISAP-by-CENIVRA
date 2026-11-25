/**
 * Servicio cliente para interactuar con la API local de SISAP (SQLite en 127.0.0.1:8080).
 * Maneja consultas parametrizadas, detección de duplicados, recuperación de expedientes
 * y control de errores sin exponer datos sensibles.
 */

export interface EnginesStatusResponse {
  motors: {
    motor_1_autoencoder: {
      status: string;
      default_model_id: string;
      canonical_reference_cohort_n: number;
      integrity_verified: boolean;
      verified_artifacts_count: number;
      models: Record<string, any>;
    };
    motor_2_analytical_longitudinal: { status: string };
    motor_3_narrative_behavioral: {
      engine_id: string;
      status: string;
      onnx_artifact: {
        present: boolean;
        size_bytes: number;
        inference_ready: boolean;
        reason: string;
      };
    };
    motor_4_multimodal_integration: { status: string };
    motor_5_decision_support: {
      status: string;
      automatic_diagnosis_allowed: boolean;
    };
  };
}

export interface AutoencoderInferencePayload {
  patient_id?: string;
  id_registro?: string;
  model_id?: string;
  modo_scoring?: 'excel_canonico' | 'manual_estandar';
  persist?: boolean;
  edad: number;
  sexo?: string;
  tiempo_consumo: number;
  trat_previos: number;
  sustancia_principal?: string;
  bis11: { modo_captura: string; respuestas: number[] };
  bads: { modo_captura: string; respuestas: number[] };
  eros: { modo_captura: string; respuestas: number[] };
  gad7: { modo_captura: string; respuestas: number[] };
  staxi2: { modo_captura: string; respuestas: number[] };
  bsl23: {
    modo_captura: string;
    respuestas: number[];
    respuestas_conductuales: number[];
    general_score_0_1: number;
  };
}

export interface ModelGovernanceEntry {
  model_id: string;
  display_name: string;
  model_version: string;
  architecture_spec: string;
  input_variables_count: number;
  latent_dim: number;
  governance_state:
    | 'ACTIVE_DEFAULT'
    | 'VALIDATED_ELIGIBLE'
    | 'EXPERIMENTAL_RESTRICTED'
    | 'HISTORICAL_LEGACY'
    | 'INVALID_EXCLUDED';
  clinical_use_allowed: boolean;
  artifact_path: string | null;
  artifact_sha256: string | null;
  preprocessing_version: string | null;
  input_schema_version: string | null;
  validation_summary: string;
  updated_at: string;
  updated_by: string;
  disk_integrity?: {
    checkable?: boolean;
    ok?: boolean;
    verified?: boolean;
    reason?: string;
    observedSha256?: string | null;
  };
}

export interface GovernedModelRunRecord {
  run_id: string;
  model_id: string;
  model_version: string;
  artifact_sha256: string | null;
  preprocessing_version: string | null;
  input_schema_version: string | null;
  executed_at: string;
  patient_or_evaluation_id: string | null;
  patient_id: string | null;
  patient_pseudonym: string | null;
  execution_status: string;
  executed_by: string | null;
  actor_role: string | null;
  input_hash: string | null;
  error_code: string | null;
  error_message: string | null;
}

export interface ModelGovernanceRegistryPayload {
  registry_source: string;
  active_model_id: string | null;
  active_model: ModelGovernanceEntry | null;
  models: ModelGovernanceEntry[];
  recent_runs: GovernedModelRunRecord[];
  governance_events: Array<{
    event_id: string;
    occurred_at: string;
    actor: string;
    actor_role: string;
    action: string;
    details: string;
  }>;
}

export interface CreateFollowUpInput {
  patient_id: string;
  evaluation_date: string;
  session_number?: number | null;
  instrument: string;
  total_score: number;
  subscales?: Record<string, number> | null;
  items: number[];
  clinical_severity?: string | null;
  clinician_id?: string | null;
  notes?: string | null;
}

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
    model_id?: string | null;
    model_version: string;
    artifact_sha256?: string | null;
    preprocessing_version: string;
    input_schema_version?: string | null;
    executed_by?: string | null;
    actor_role?: string | null;
    started_at: string;
    finished_at?: string | null;
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

const resolveDefaultApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const desktopApiBase = (window as { sisapDesktop?: { apiBase?: string } }).sisapDesktop?.apiBase;
    if (desktopApiBase && typeof desktopApiBase === 'string') {
      return desktopApiBase;
    }
    if (window.location?.protocol === 'file:') {
      return 'http://127.0.0.1:8080/api';
    }
  }
  return '/api';
};

let API_BASE = resolveDefaultApiBase();

export class PatientApiService {
  private static sessionActor = '';
  private static sessionRole = '';

  static setApiBase(nextBase: string): void {
    if (nextBase && typeof nextBase === 'string') {
      API_BASE = nextBase.replace(/\/+$/, '');
    }
  }

  static getApiBase(): string {
    return API_BASE;
  }

  static setSessionActor(actor: string | null | undefined, role: string | null | undefined): void {
    this.sessionActor = (actor || '').trim();
    this.sessionRole = (role || '').trim();
  }

  static getActorHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(extra || {}),
    };
    if (this.sessionActor) headers['X-SISAP-Actor'] = this.sessionActor;
    if (this.sessionRole) headers['X-SISAP-Role'] = this.sessionRole;
    return headers;
  }

  static getReadHeaders(): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.sessionActor) headers['X-SISAP-Actor'] = this.sessionActor;
    if (this.sessionRole) headers['X-SISAP-Role'] = this.sessionRole;
    return headers;
  }

  static async syncDesktopApiBase(): Promise<string> {
    if (typeof window === 'undefined') return API_BASE;
    const desktop = (
      window as {
        sisapDesktop?: {
          apiBase?: string;
          getBackendInfo?: () => Promise<{ apiBase?: string; port?: number }>;
        };
      }
    ).sisapDesktop;
    if (desktop?.apiBase) {
      this.setApiBase(desktop.apiBase);
      return API_BASE;
    }
    if (desktop?.getBackendInfo) {
      try {
        const info = await desktop.getBackendInfo();
        if (info?.apiBase) {
          this.setApiBase(info.apiBase);
        } else if (info?.port) {
          this.setApiBase(`http://127.0.0.1:${info.port}/api`);
        }
      } catch {
        // Keep resolved default if IPC backend info fails transiently
      }
    }
    return API_BASE;
  }
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
      headers: this.getActorHeaders(),
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

  static async getEnginesStatus(): Promise<EnginesStatusResponse> {
    const res = await fetch(`${API_BASE}/engines/status`, { headers: this.getReadHeaders() });
    if (!res.ok) throw new Error(`Error al consultar motores (${res.status})`);
    return res.json();
  }

  static async getAutoencoderReference(): Promise<any> {
    const res = await fetch(`${API_BASE}/engines/autoencoder/reference`, {
      headers: this.getReadHeaders(),
    });
    if (!res.ok) throw new Error(`Error al consultar referencia Autoencoder (${res.status})`);
    return res.json();
  }

  static async getAutoencoderGovernance(): Promise<ModelGovernanceRegistryPayload> {
    const res = await fetch(`${API_BASE}/engines/autoencoder/governance`, {
      headers: this.getReadHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Error al consultar gobernanza de modelos (${res.status})`);
    }
    return data;
  }

  static async setActiveGovernanceModel(modelId: string, justification: string): Promise<any> {
    const res = await fetch(`${API_BASE}/engines/autoencoder/governance/active-model`, {
      method: 'POST',
      headers: this.getActorHeaders(),
      body: JSON.stringify({ model_id: modelId, justification }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data.message ||
          `Error al actualizar modelo activo (${res.status}). Verifica permisos administrativos.`
      );
    }
    return data;
  }

  static async runAutoencoderInference(payload: AutoencoderInferencePayload): Promise<any> {
    const res = await fetch(`${API_BASE}/engines/autoencoder/infer`, {
      method: 'POST',
      headers: this.getActorHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 422) {
      throw new Error(data.message || `Error en inferencia Autoencoder (${res.status})`);
    }
    return data;
  }

  static async runCandidate17Comparison(payload: AutoencoderInferencePayload): Promise<any> {
    const res = await fetch(`${API_BASE}/engines/autoencoder/candidate17/infer`, {
      method: 'POST',
      headers: this.getActorHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 422) {
      throw new Error(data.message || `Error en comparativa 17D (${res.status})`);
    }
    return data;
  }

  static async createFollowUp(input: CreateFollowUpInput): Promise<any> {
    const res = await fetch(`${API_BASE}/follow-ups`, {
      method: 'POST',
      headers: this.getActorHeaders(),
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Error al registrar seguimiento (${res.status})`);
    }
    return data;
  }

  static async getPatientFollowUps(patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(patientId)}/follow-ups`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Error al leer seguimientos (${res.status})`);
    return res.json();
  }

  static async getPatientIntelligence(patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(patientId)}/intelligence`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Error al generar síntesis multimodal (${res.status})`);
    return res.json();
  }

  static async createClinicalFormulation(
    patientId: string,
    payload: {
      summary_text: string;
      evidence_level: 'E1_explicit' | 'E2_contextual' | 'E3_observational' | 'E4_latent_hypothesis' | 'E5_insufficient';
      review_status?: 'pending_human_review' | 'reviewed_approved' | 'reviewed_modified' | 'rejected';
      domains?: string[];
      model_run_id?: string | null;
      provenance?: Record<string, unknown>;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(patientId)}/formulations`, {
      method: 'POST',
      headers: this.getActorHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Error al guardar formulación (${res.status})`);
    }
    return data;
  }

  // ---- Centro de Evaluación Psicométrica Digital ----

  static async getPsychometricCatalog(): Promise<any> {
    const res = await fetch(`${API_BASE}/psychometrics/catalog`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Error al leer catálogo psicométrico (${res.status})`);
    return res.json();
  }

  static async previewPsychometricScore(payload: {
    instrument_id: string;
    instrument_version?: string;
    responses: any;
    optional_complements?: any;
    scoring_mode?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/psychometrics/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Error de cálculo (${res.status})`);
    return data;
  }

  static async savePsychometricEvaluation(payload: {
    evaluation_id?: string;
    patient_id: string;
    instrument_id: string;
    instrument_version?: string;
    evaluator: string;
    application_status: 'draft' | 'completed';
    capture_mode?: 'digital_form' | 'numeric_sequence_legacy';
    scoring_mode?: 'manual_estandar' | 'excel_canonico';
    session_context?: string;
    session_number?: number | null;
    responses: any[];
    optional_complements?: any;
    notes?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/psychometrics/evaluations`, {
      method: 'POST',
      headers: this.getActorHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Error al guardar evaluación (${res.status})`);
    return data;
  }

  static async getPatientPsychometrics(patientIdOrPseudonym: string): Promise<any> {
    const res = await fetch(
      `${API_BASE}/patients/${encodeURIComponent(patientIdOrPseudonym)}/psychometrics`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Error al leer historial psicométrico (${res.status})`);
    return data;
  }

  static async getPsychometricEvaluationById(evalId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/psychometrics/evaluations/${encodeURIComponent(evalId)}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Error al leer evaluación (${res.status})`);
    return data;
  }

  static async recalculatePsychometricEvaluation(evalId: string, scoringMode?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/psychometrics/evaluations/${encodeURIComponent(evalId)}/recalculate`, {
      method: 'POST',
      headers: this.getActorHeaders(),
      body: JSON.stringify({ scoring_mode: scoringMode }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Error al recalcular evaluación (${res.status})`);
    return data;
  }
}
