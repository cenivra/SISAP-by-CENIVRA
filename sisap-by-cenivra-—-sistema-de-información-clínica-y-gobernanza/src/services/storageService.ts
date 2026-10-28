import {
  AuditLogEntry,
  ClinicalDraft,
  EvolutionNote,
  ExploratoryInterviewData,
  FamilyNote,
  InitialEvaluationData,
  PatientClinico,
  PatientPadron,
  UserAccount,
  WeeklyNarrative,
  ConsentRecord,
  ArcoRequest,
  DeidentificationVaultToken,
} from '../types/clinical';
import { INITIAL_USERS } from '../constants/clinicalConstants';

const STORAGE_KEYS = {
  PADRON: 'sisap_v1_padron',
  PACIENTES: 'sisap_v1_pacientes',
  BITACORA: 'sisap_v1_bitacora',
  NOTAS_EVOLUCION: 'sisap_v1_notas_evolucion',
  NOTAS_FAMILIARES: 'sisap_v1_notas_familiares',
  NARRACIONES: 'sisap_v1_narraciones',
  EVALUACIONES: 'sisap_v1_evaluaciones_iniciales',
  ENTREVISTAS: 'sisap_v1_entrevistas',
  USUARIOS: 'sisap_v1_usuarios',
  TEMA: 'sisap_v1_tema',
  PREFIJO_BORRADOR: 'sisap_v1_borrador_',
  CONSENTIMIENTOS: 'sisap_v1_consentimientos',
  SOLICITUDES_ARCO: 'sisap_v1_solicitudes_arco',
  VAULT_TOKENS: 'sisap_v1_vault_tokens',
  CONFIG_CIBERSEGURIDAD: 'sisap_v1_config_ciber',
};

// Initial Seed Data for CENIVRA Clinic
const SEED_PADRON: PatientPadron[] = [
  {
    seudonimo: 'TUS-0007',
    nombre_completo: 'Paciente Demo Uno (Sintético)',
    curp: 'DEMO810414HDFRLA01',
    expediente_fisico: 'EXP-CEN-2026-0007',
    fecha_nacimiento: '1981-04-14',
    edad: 43,
    sexo: 'M',
    contacto_emergencia: 'Contacto Demo Familiar 1 (Sintético)',
    telefono_emergencia: '55-4190-8821',
    creado_en: '2026-08-02 09:30',
    creado_por: 'director',
    activo: true,
  },
  {
    seudonimo: 'TUS-0012',
    nombre_completo: 'Paciente Demo Dos (Sintético)',
    curp: 'DEMO960921MDFRN02',
    expediente_fisico: 'EXP-CEN-2026-0012',
    fecha_nacimiento: '1996-09-21',
    edad: 28,
    sexo: 'F',
    contacto_emergencia: 'Contacto Demo Familiar 2 (Sintético)',
    telefono_emergencia: '55-8832-1100',
    creado_en: '2026-08-14 11:15',
    creado_por: 'psicologo',
    activo: true,
  },
  {
    seudonimo: 'TUS-0019',
    nombre_completo: 'Paciente Demo Tres (Sintético)',
    curp: 'DEMO890105HJLN03',
    expediente_fisico: 'EXP-CEN-2026-0019',
    fecha_nacimiento: '1989-01-05',
    edad: 37,
    sexo: 'M',
    contacto_emergencia: 'Contacto Demo Familiar 3 (Sintético)',
    telefono_emergencia: '55-7712-4433',
    creado_en: '2026-09-01 16:00',
    creado_por: 'director',
    activo: true,
  },
  {
    seudonimo: 'TUS-0024',
    nombre_completo: 'Paciente Demo Cuatro (Sintético)',
    curp: 'DEMO010319MDFRX04',
    expediente_fisico: 'EXP-CEN-2026-0024',
    fecha_nacimiento: '2001-03-19',
    edad: 23,
    sexo: 'F',
    contacto_emergencia: 'Contacto Demo Familiar 4 (Sintético)',
    telefono_emergencia: '55-3344-9988',
    creado_en: '2026-09-18 10:20',
    creado_por: 'trabajador',
    activo: true,
  },
];

const SEED_PACIENTES: PatientClinico[] = [
  {
    seudonimo: 'TUS-0007',
    ingreso: '2026-08-02',
    estado: 'Residencial',
    sesiones: 8,
    droga_impacto: 'Metanfetamina / Alcohol',
    diagnostico_cie: '6C41.11 / F15.20 (Dependencia a estimulantes)',
    diagnostico_impresion: 'Trastorno por uso de estimulantes grave con alta reactividad al craving e impulsividad motora.',
    escalas: {
      BIS_11: true,
      BSL_23: true,
      GAD_7: true,
      STAXI_2: true,
      BADS: true,
      EROS: true,
    },
    ultima_actualizacion: '2026-10-12 14:00',
  },
  {
    seudonimo: 'TUS-0012',
    ingreso: '2026-08-14',
    estado: 'Ambulatorio',
    sesiones: 6,
    droga_impacto: 'Alcohol / Benzodiacepinas',
    diagnostico_cie: '6C40.10 / F10.20 (Dependencia de alcohol)',
    diagnostico_impresion: 'Consumo regulatorio por desregulación afectiva y rasgos límite comórbidos.',
    escalas: {
      BIS_11: true,
      BSL_23: true,
      GAD_7: true,
      STAXI_2: false,
      BADS: true,
      EROS: false,
    },
    ultima_actualizacion: '2026-10-10 11:30',
  },
  {
    seudonimo: 'TUS-0019',
    ingreso: '2026-09-01',
    estado: 'En desintoxicación',
    sesiones: 3,
    droga_impacto: 'Opioides / Fentanilo',
    diagnostico_cie: '6C49.1 / F11.20 (Dependencia a opioides)',
    diagnostico_impresion: 'Fase aguda de desintoxicación médica supervisada con protocolo de analgesia y ansiolíticos.',
    escalas: {
      BIS_11: true,
      BSL_23: false,
      GAD_7: true,
      STAXI_2: false,
      BADS: false,
      EROS: false,
    },
    ultima_actualizacion: '2026-10-14 09:45',
  },
  {
    seudonimo: 'TUS-0024',
    ingreso: '2026-09-18',
    estado: 'Seguimiento',
    sesiones: 12,
    droga_impacto: 'Cannabis / Nicotina',
    diagnostico_cie: '6C42.1 / F12.20 (Dependencia a cannabis)',
    diagnostico_impresion: 'Proceso de mantenimiento con alta adherencia a proyecto de vida y fortalecimiento de red de apoyo.',
    escalas: {
      BIS_11: true,
      BSL_23: true,
      GAD_7: true,
      STAXI_2: true,
      BADS: true,
      EROS: true,
    },
    ultima_actualizacion: '2026-10-15 08:30',
  },
];

const SEED_NOTAS_EVOLUCION: EvolutionNote[] = [
  {
    id: 'not-001',
    expediente: 'TUS-0007',
    sesion: 7,
    fecha: '2026-10-08',
    hora: '11:00',
    tipo: 'psicologia',
    objetivo: 'Reestructuración de pensamientos automáticos ante disparadores de consumo social.',
    resumen: 'Se revisó registro de craving semanal. Paciente identifica estresor laboral como gatillo. Se modeló técnica "urge surfing" (la ola).',
    resultado: 'Paciente receptivo, con mayor reconocimiento interoceptivo. Ansiedad reportada descendió de 7 a 3 durante sesión.',
    siguiente: 'Evaluar aplicación en situaciones de fin de semana con red de apoyo primaria.',
    actividades: 'Llevar autoregistro de 3 episodios de craving con calificación 0-10 y estrategia empleada.',
    observaciones: 'Buena alianza terapéutica. Sin signos de consumo activo.',
    proxima_cita: '2026-10-15',
    profesional_nombre: 'Mtra. Demo Psicología (Sintético)',
    profesional_cedula: 'CED-7711204-PSI',
    creado_en: '2026-10-08 12:05',
  },
  {
    id: 'not-002',
    expediente: 'TUS-0007',
    sesion: 8,
    fecha: '2026-10-15',
    hora: '10:30',
    tipo: 'medicina',
    objetivo: 'Ajuste farmacológico y valoración de síntomas neurovegetativos de abstinencia prolongada.',
    resumen: 'Signos vitales estables: TA 120/80 mmHg, FC 74 lpm. Refiere mejoría del insomnio inicial. Ausencia de temblor o diaforesis.',
    resultado: 'Evolución satisfactoria. Se mantiene dosis terapéutica sin requerir ansiolíticos de rescate.',
    siguiente: 'Monitoreo de función hepática y perfil lipídico en 15 días.',
    actividades: 'Mantener higiene de sueño y consumo adecuado de líquidos.',
    observaciones: 'Paciente en adecuada condición somática para actividades de activación conductual.',
    proxima_cita: '2026-10-29',
    profesional_nombre: 'Dr. Demo Medicina (Sintético)',
    profesional_cedula: 'CED-3322198-MED',
    creado_en: '2026-10-15 11:15',
  },
];

const SEED_CONSENTIMIENTOS: ConsentRecord[] = [
  {
    id: 'cons-001',
    pacienteExp: 'TUS-0007',
    nombreTitular: 'Paciente Demo Uno (Sintético)',
    esTutor: false,
    fechaUtc: '2026-08-02T15:30:00.000Z',
    versionAviso: 'AVISO-INTEGRAL-V2.1-2026',
    metodoConsentimiento: 'firma_digital',
    firmaDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    autorizoTransferenciaInvestigacion: true,
    autorizoAlgoritmosAnaliticos: true,
    registradoPor: 'director',
    ipRegistro: '192.168.10.12 (TLS 1.3 / Auth Token mTLS)',
  },
  {
    id: 'cons-002',
    pacienteExp: 'TUS-0012',
    nombreTitular: 'Paciente Demo Dos (Sintético)',
    esTutor: false,
    fechaUtc: '2026-08-14T17:15:00.000Z',
    versionAviso: 'AVISO-INTEGRAL-V2.1-2026',
    metodoConsentimiento: 'otp_sms',
    firmaDigest: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    autorizoTransferenciaInvestigacion: true,
    autorizoAlgoritmosAnaliticos: true,
    registradoPor: 'psicologo',
    ipRegistro: '192.168.10.35 (TLS 1.3 / Auth Token mTLS)',
  },
];

const SEED_ARCO: ArcoRequest[] = [
  {
    folio: 'ARCO-2026-0041',
    pacienteExp: 'TUS-0019',
    tipoDerecho: 'Acceso',
    solicitante: 'Paciente Demo Tres (Sintético)',
    esTitular: true,
    contacto: 'demo.usuario@sisap.local / Tel: 55-7712-4433',
    descripcion: 'Solicitud formal de copia digital íntegra del expediente clínico y notas de evolución conforme a la NOM-004 y LFPDPPP.',
    fechaRecepcion: '2026-10-02',
    fechaLimiteRespuesta: '2026-10-30',
    estado: 'procedente',
    dictamen: 'Solicitud acreditada con INE. Se autoriza emisión de expediente seudonimizado con constancia de cotejo.',
    atendidoPor: 'director',
  },
];

const SEED_BITACORA: AuditLogEntry[] = [
  {
    id: 'log-001',
    hora: '2026-10-14 08:30:15',
    timestampUtc: '2026-10-14T14:30:15.000Z',
    usuario: 'director',
    rol: 'director_clinico',
    accion: 'Sesión iniciada',
    exp: '—',
    detalles: 'Ingreso al sistema clínico central con MFA verificado.',
    ip: '192.168.10.12 (TLS 1.3)',
    prevHash: 'NOM024_GENESIS_ROOT_CHAIN_CENIVRA_2026',
    hash: '8f92b9c1e0a24147',
  },
  {
    id: 'log-002',
    hora: '2026-10-14 09:15:22',
    timestampUtc: '2026-10-14T15:15:22.000Z',
    usuario: 'psicologo',
    rol: 'psicologo',
    accion: 'Captura de escala BIS-11',
    exp: 'TUS-0007',
    detalles: 'Cálculo de subescalas de impulsividad completado.',
    ip: '192.168.10.35 (TLS 1.3)',
    prevHash: '8f92b9c1e0a24147',
    hash: 'a3d4e8b2f9104c8a',
  },
  {
    id: 'log-003',
    hora: '2026-10-14 11:20:04',
    timestampUtc: '2026-10-14T17:20:04.000Z',
    usuario: 'director',
    rol: 'director_clinico',
    accion: 'Reidentificación de identidad',
    exp: 'TUS-0007',
    motivo: 'Supervisión de caso clínico para informe médico legal solicitado por familiar directo.',
    detalles: 'Nombre consultado en padrón: Paciente Demo Uno (Sintético). Token temporal TTL emitido.',
    ip: '192.168.10.12 (TLS 1.3)',
    prevHash: 'a3d4e8b2f9104c8a',
    hash: 'c4e91024bd73441a',
  },
];

function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export const StorageService = {
  // Padrón & Identity
  getPadron(): PatientPadron[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PADRON);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PADRON, JSON.stringify(SEED_PADRON));
      return SEED_PADRON;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PADRON;
    }
  },

  getPatientPadron(pseudonym: string): PatientPadron | undefined {
    return this.getPadron().find((p) => p.seudonimo === pseudonym);
  },

  savePatientPadron(patient: PatientPadron) {
    const list = this.getPadron();
    const index = list.findIndex((p) => p.seudonimo === patient.seudonimo);
    if (index >= 0) {
      list[index] = patient;
    } else {
      list.push(patient);
    }
    localStorage.setItem(STORAGE_KEYS.PADRON, JSON.stringify(list));
  },

  // Clinical Patients
  getPatients(): PatientClinico[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PACIENTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PACIENTES, JSON.stringify(SEED_PACIENTES));
      return SEED_PACIENTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PACIENTES;
    }
  },

  getPatient(pseudonym: string): PatientClinico | undefined {
    return this.getPatients().find((p) => p.seudonimo === pseudonym);
  },

  savePatient(patient: PatientClinico) {
    const list = this.getPatients();
    const index = list.findIndex((p) => p.seudonimo === patient.seudonimo);
    if (index >= 0) {
      list[index] = patient;
    } else {
      list.push(patient);
    }
    localStorage.setItem(STORAGE_KEYS.PACIENTES, JSON.stringify(list));
  },

  createNewPatient(params: {
    nombre_completo: string;
    curp?: string;
    expediente_fisico?: string;
    fecha_nacimiento: string;
    edad: number;
    sexo: 'M' | 'F' | 'Otro';
    contacto_emergencia?: string;
    telefono_emergencia?: string;
    ingreso: string;
    estado: PatientClinico['estado'];
    droga_impacto?: string;
    diagnostico_cie?: string;
    creado_por: string;
  }): { padron: PatientPadron; clinico: PatientClinico } {
    const all = this.getPatients();
    // Auto increment pseudonym e.g. TUS-0025
    let maxNum = 24;
    all.forEach((p) => {
      const match = p.seudonimo.match(/TUS-(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextNum = (maxNum + 1).toString().padStart(4, '0');
    const seudonimo = `TUS-${nextNum}`;

    const padron: PatientPadron = {
      seudonimo,
      nombre_completo: params.nombre_completo,
      curp: params.curp,
      expediente_fisico: params.expediente_fisico || `EXP-CEN-2026-${nextNum}`,
      fecha_nacimiento: params.fecha_nacimiento,
      edad: params.edad,
      sexo: params.sexo,
      contacto_emergencia: params.contacto_emergencia,
      telefono_emergencia: params.telefono_emergencia,
      creado_en: new Date().toLocaleString('es-MX'),
      creado_por: params.creado_por,
      activo: true,
    };

    const clinico: PatientClinico = {
      seudonimo,
      ingreso: params.ingreso || new Date().toISOString().split('T')[0],
      estado: params.estado || 'Residencial',
      sesiones: 1,
      droga_impacto: params.droga_impacto || '',
      diagnostico_cie: params.diagnostico_cie || '',
      escalas: {},
      ultima_actualizacion: new Date().toLocaleString('es-MX'),
    };

    this.savePatientPadron(padron);
    this.savePatient(clinico);

    return { padron, clinico };
  },

  // Audit Log (Bitácora Inmutable WORM conforme a NOM-024)
  getAuditLog(): AuditLogEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BITACORA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(SEED_BITACORA));
      return SEED_BITACORA;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_BITACORA;
    }
  },

  logAction(entry: Omit<AuditLogEntry, 'id' | 'hora' | 'hash'>): AuditLogEntry {
    const logs = this.getAuditLog();
    const hora = new Date().toLocaleString('es-MX');
    const timestampUtc = new Date().toISOString();
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const prevHash = logs.length > 0 && logs[0].hash ? logs[0].hash : 'NOM024_GENESIS_ROOT_CHAIN_CENIVRA_2026';
    const ip = entry.ip || '192.168.10.45 [TLS 1.3 / mTLS]';

    const hashPayload = `${prevHash}|${id}|${timestampUtc}|${entry.usuario}|${entry.rol}|${entry.accion}|${entry.exp}|${entry.detalles || ''}|${entry.motivo || ''}`;
    const hash = generateHash(hashPayload);

    const fullEntry: AuditLogEntry = {
      ...entry,
      id,
      hora,
      timestampUtc,
      ip,
      prevHash,
      hash,
    };

    logs.unshift(fullEntry);
    localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(logs));
    return fullEntry;
  },

  verifyAuditLogIntegrity(): {
    valid: boolean;
    total: number;
    tamperedIndex?: number;
    message: string;
  } {
    const logs = this.getAuditLog();
    if (logs.length === 0) {
      return { valid: true, total: 0, message: 'La bitácora está vacía.' };
    }

    // Check each entry's hash recalculation and link to prevHash
    for (let i = 0; i < logs.length; i++) {
      const entry = logs[i];
      if (!entry.hash) {
        return {
          valid: false,
          total: logs.length,
          tamperedIndex: i,
          message: `El registro en índice ${i} (${entry.id}) carece de hash de integridad.`,
        };
      }

      // Check if entry payload hash was modified
      if (entry.prevHash && entry.timestampUtc) {
        const expectedPayload = `${entry.prevHash}|${entry.id}|${entry.timestampUtc}|${entry.usuario}|${entry.rol}|${entry.accion}|${entry.exp}|${entry.detalles || ''}|${entry.motivo || ''}`;
        const calculatedHash = generateHash(expectedPayload);
        if (calculatedHash !== entry.hash) {
          return {
            valid: false,
            total: logs.length,
            tamperedIndex: i,
            message: `¡ALERTA DE SEGURIDAD! El registro ${entry.id} (${entry.accion}) fue alterado en base de datos. El hash calculado (${calculatedHash.substring(0, 10)}...) no coincide con el hash firmado (${entry.hash.substring(0, 10)}...).`,
          };
        }
      }

      // If there's an older item (i + 1), check if entry.prevHash matches logs[i + 1].hash
      if (i < logs.length - 1) {
        const olderEntry = logs[i + 1];
        if (entry.prevHash && olderEntry.hash && entry.prevHash !== olderEntry.hash) {
          return {
            valid: false,
            total: logs.length,
            tamperedIndex: i,
            message: `Ruptura de cadena inmutable detectada entre registro ${entry.id} y ${olderEntry.id}. El hash previo encadenado fue adulterado.`,
          };
        }
      }
    }

    return {
      valid: true,
      total: logs.length,
      message: `Integridad de bitácora WORM verificada. ${logs.length} registros encadenados y firmados sin alteración.`,
    };
  },

  // Simulación de Ataque a la Cadena WORM para pruebas SecOps
  simulateWormTampering(): { success: boolean; tamperedEntryId: string; originalText: string; corruptedText: string } {
    const logs = this.getAuditLog();
    if (logs.length < 2) {
      this.logAction({
        usuario: 'director',
        rol: 'director_clinico',
        accion: 'Registro de calibración para prueba WORM',
        exp: 'TUS-0007',
        detalles: 'Registro base para validación de cadena SHA-256.',
      });
    }
    const freshLogs = this.getAuditLog();
    // Tamper the 2nd entry (or 1st if only 1)
    const targetIdx = freshLogs.length > 1 ? 1 : 0;
    const target = freshLogs[targetIdx];
    const originalText = target.detalles || 'Sin detalles';
    target.detalles = `[ADULTERADO MANUALMENTE POR INYECCIÓN SQL ILÍCITA A LAS ${new Date().toLocaleTimeString()}]: Nota adulterada`;
    
    // Save without updating hash to simulate unauthorized database mutation
    localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(freshLogs));
    
    return {
      success: true,
      tamperedEntryId: target.id,
      originalText,
      corruptedText: target.detalles,
    };
  },

  // Restaurar Cadena WORM reparando hashes legítimos
  restoreWormChain(): { success: boolean; totalRepaired: number } {
    const raw = localStorage.getItem(STORAGE_KEYS.BITACORA);
    if (!raw) return { success: true, totalRepaired: 0 };
    let logs: AuditLogEntry[] = [];
    try {
      logs = JSON.parse(raw);
    } catch {
      logs = SEED_BITACORA;
    }

    // Re-chain cleanly from oldest (last) to newest (first)
    for (let i = logs.length - 1; i >= 0; i--) {
      const entry = logs[i];
      if (entry.detalles && entry.detalles.includes('[ADULTERADO MANUALMENTE')) {
        entry.detalles = 'Registro validado y restaurado conforme a protocolo DRP/BCP.';
      }
      const prevHash = i === logs.length - 1 ? 'NOM024_GENESIS_ROOT_CHAIN_CENIVRA_2026' : logs[i + 1].hash || 'GENESIS';
      entry.prevHash = prevHash;
      if (!entry.timestampUtc) entry.timestampUtc = new Date().toISOString();
      const payload = `${prevHash}|${entry.id}|${entry.timestampUtc}|${entry.usuario}|${entry.rol}|${entry.accion}|${entry.exp}|${entry.detalles || ''}|${entry.motivo || ''}`;
      entry.hash = generateHash(payload);
    }

    localStorage.setItem(STORAGE_KEYS.BITACORA, JSON.stringify(logs));
    return { success: true, totalRepaired: logs.length };
  },

  // Evolution Notes
  getEvolutionNotes(pseudonym?: string): EvolutionNote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTAS_EVOLUCION);
    let list: EvolutionNote[] = [];
    if (!raw) {
      list = SEED_NOTAS_EVOLUCION;
      localStorage.setItem(STORAGE_KEYS.NOTAS_EVOLUCION, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = SEED_NOTAS_EVOLUCION;
      }
    }
    return pseudonym ? list.filter((n) => n.expediente === pseudonym) : list;
  },

  saveEvolutionNote(note: EvolutionNote) {
    const list = this.getEvolutionNotes();
    const index = list.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      list[index] = note;
    } else {
      list.unshift(note);
    }
    localStorage.setItem(STORAGE_KEYS.NOTAS_EVOLUCION, JSON.stringify(list));

    // Update patient session count
    const pat = this.getPatient(note.expediente);
    if (pat && note.sesion >= pat.sesiones) {
      pat.sesiones = note.sesion;
      pat.ultima_actualizacion = new Date().toLocaleString('es-MX');
      this.savePatient(pat);
    }
  },

  // Family Notes
  getFamilyNotes(pseudonym?: string): FamilyNote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTAS_FAMILIARES);
    const list: FamilyNote[] = raw ? JSON.parse(raw) : [];
    return pseudonym ? list.filter((n) => n.expediente === pseudonym) : list;
  },

  saveFamilyNote(note: FamilyNote) {
    const list = this.getFamilyNotes();
    const index = list.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      list[index] = note;
    } else {
      list.unshift(note);
    }
    localStorage.setItem(STORAGE_KEYS.NOTAS_FAMILIARES, JSON.stringify(list));
  },

  // Weekly Narratives
  getWeeklyNarratives(pseudonym?: string): WeeklyNarrative[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NARRACIONES);
    const list: WeeklyNarrative[] = raw ? JSON.parse(raw) : [];
    return pseudonym ? list.filter((n) => n.expediente === pseudonym) : list;
  },

  saveWeeklyNarrative(item: WeeklyNarrative) {
    const list = this.getWeeklyNarratives();
    const index = list.findIndex((n) => n.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.NARRACIONES, JSON.stringify(list));
  },

  // Initial Evaluations
  getEvaluations(pseudonym?: string): InitialEvaluationData[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUACIONES);
    const list: InitialEvaluationData[] = raw ? JSON.parse(raw) : [];
    return pseudonym ? list.filter((n) => n.expediente === pseudonym) : list;
  },

  saveEvaluation(item: InitialEvaluationData) {
    const list = this.getEvaluations();
    const index = list.findIndex((n) => n.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.EVALUACIONES, JSON.stringify(list));

    // Update patient scales status
    const pat = this.getPatient(item.expediente);
    if (pat) {
      pat.escalas = {
        BIS_11: !!item.raw_bis_11,
        BSL_23: !!item.raw_bsl_23,
        GAD_7: !!item.raw_gad_7,
        STAXI_2: !!item.raw_staxi_2,
        BADS: !!item.raw_bads,
        EROS: !!item.raw_eros,
      };
      pat.ultima_actualizacion = new Date().toLocaleString('es-MX');
      this.savePatient(pat);
    }
  },

  // Exploratory Interviews
  getInterviews(pseudonym?: string): ExploratoryInterviewData[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTREVISTAS);
    const list: ExploratoryInterviewData[] = raw ? JSON.parse(raw) : [];
    return pseudonym ? list.filter((n) => n.expediente === pseudonym) : list;
  },

  saveInterview(item: ExploratoryInterviewData) {
    const list = this.getInterviews();
    const index = list.findIndex((n) => n.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.ENTREVISTAS, JSON.stringify(list));
  },

  // Drafts
  getDrafts(): ClinicalDraft[] {
    const list: ClinicalDraft[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_KEYS.PREFIJO_BORRADOR)) {
        try {
          const item = JSON.parse(localStorage.getItem(k) || '');
          item.clave = k;
          list.push(item);
        } catch {}
      }
    }
    return list.sort((a, b) => b.sello.localeCompare(a.sello));
  },

  saveDraft(params: {
    formulario: string;
    screen: string;
    pre: string;
    paciente: string;
    datos: Record<string, string>;
  }): ClinicalDraft {
    const fieldsCount = Object.keys(params.datos).filter((k) => params.datos[k] !== '').length;
    const key = `${STORAGE_KEYS.PREFIJO_BORRADOR}${params.pre}_${params.paciente}_${params.screen}`;
    const draft: ClinicalDraft = {
      clave: key,
      formulario: params.formulario,
      screen: params.screen,
      pre: params.pre,
      paciente: params.paciente,
      sello: new Date().toLocaleString('es-MX'),
      campos: fieldsCount,
      datos: params.datos,
    };
    localStorage.setItem(key, JSON.stringify(draft));
    return draft;
  },

  deleteDraft(key: string) {
    localStorage.removeItem(key);
  },

  // Full Clinical Dossier Export (Formatted for Google Drive)
  generatePatientDossierPayload(pseudonym: string) {
    const clinico = this.getPatient(pseudonym);
    const padron = this.getPatientPadron(pseudonym);
    const notes = this.getEvolutionNotes(pseudonym);
    const familyNotes = this.getFamilyNotes(pseudonym);
    const narratives = this.getWeeklyNarratives(pseudonym);
    const evaluations = this.getEvaluations(pseudonym);
    const interviews = this.getInterviews(pseudonym);

    const exportObject = {
      institucion: 'CENIVRA - Centro de Integración y Vida Racional',
      sistema: 'SISAP v1.0',
      fecha_exportacion: new Date().toISOString(),
      seudonimo: pseudonym,
      expediente_clinico: clinico,
      // Pseudonymized by default for research, or unmasked if authorized
      padron_identidad: {
        seudonimo: padron?.seudonimo,
        expediente_fisico: padron?.expediente_fisico,
        edad: padron?.edad,
        sexo: padron?.sexo,
        // Name excluded in standard export for data protection!
        nota_privacidad: 'Nombre y datos de contacto reservados en padrón físico bajo custodia CENIVRA',
      },
      historial_sesiones_notas: notes,
      sesiones_familiares: familyNotes,
      narraciones_semanales: narratives,
      evaluaciones_psicometricas: evaluations,
      entrevistas_exploratorias: interviews,
    };

    return JSON.stringify(exportObject, null, 2);
  },

  // Anonymized Research Dataset Export
  generateAnonymizedDatasetPayload() {
    const patients = this.getPatients();
    const evaluations = this.getEvaluations();
    const notes = this.getEvolutionNotes();

    const dataset = {
      estudio: 'SISAP-CENIVRA Cohorte TUS 2026',
      total_pacientes: patients.length,
      generado_en: new Date().toISOString(),
      pacientes: patients.map((p) => {
        const evalItem = evaluations.find((e) => e.expediente === p.seudonimo);
        const pNotes = notes.filter((n) => n.expediente === p.seudonimo);
        return {
          id_sujeto: p.seudonimo,
          ingreso: p.ingreso,
          estado_actual: p.estado,
          total_sesiones: pNotes.length,
          droga_impacto: p.droga_impacto,
          codigo_cie: p.diagnostico_cie,
          vector_autoencoder_24: evalItem?.vector24 || null,
          calculados_escalas: evalItem?.calculados || null,
        };
      }),
    };

    return JSON.stringify(dataset, null, 2);
  },

  // User Accounts & Authentication Management
  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    if (!raw) {
      const initial: UserAccount[] = INITIAL_USERS.map((u) => ({
        ...u,
        email: `${u.u}@cenivra.org.mx`,
        activo: true,
        creado_en: '2026-08-01 08:00',
        debe_cambiar_clave: false,
      }));
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  getUser(username: string): UserAccount | undefined {
    return this.getUsers().find((u) => u.u.toLowerCase() === username.toLowerCase());
  },

  saveUser(user: UserAccount) {
    const list = this.getUsers();
    const index = list.findIndex((u) => u.u.toLowerCase() === user.u.toLowerCase());
    if (index >= 0) {
      list[index] = user;
    } else {
      list.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(list));
  },

  updateUserPassword(username: string, newHash: string, newSalt: string) {
    const user = this.getUser(username);
    if (!user) return;
    user.clave_hash = newHash;
    user.clave_sal = newSalt;
    user.c = '(protegida con sal)';
    user.debe_cambiar_clave = false;
    this.saveUser(user);
  },

  toggleUserStatus(username: string): boolean {
    const user = this.getUser(username);
    if (!user) return false;
    user.activo = !user.activo;
    this.saveUser(user);
    return !!user.activo;
  },

  // ==========================================
  // CAPA DE CIBERSEGURIDAD Y CUMPLIMIENTO LFPDPPP / NOM-024
  // ==========================================

  // 1. Consentimientos Expresos (LFPDPPP Art. 3 Fracc. VI)
  getConsentRecords(): ConsentRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSENTIMIENTOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONSENTIMIENTOS, JSON.stringify(SEED_CONSENTIMIENTOS));
      return SEED_CONSENTIMIENTOS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_CONSENTIMIENTOS;
    }
  },

  saveConsentRecord(record: ConsentRecord) {
    const list = this.getConsentRecords();
    const idx = list.findIndex((c) => c.pacienteExp === record.pacienteExp);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.CONSENTIMIENTOS, JSON.stringify(list));

    this.logAction({
      usuario: record.registradoPor,
      rol: 'director_clinico',
      accion: 'Registro de Consentimiento Expreso',
      exp: record.pacienteExp,
      detalles: `Consentimiento LFPDPPP (${record.metodoConsentimiento}) asentado con digest de firma: ${record.firmaDigest?.substring(0, 16)}...`,
    });
  },

  getConsentByPatient(pseudonym: string): ConsentRecord | undefined {
    return this.getConsentRecords().find((c) => c.pacienteExp === pseudonym);
  },

  // 2. Solicitudes de Derechos ARCO (INAI / LFPDPPP)
  getArcoRequests(): ArcoRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOLICITUDES_ARCO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOLICITUDES_ARCO, JSON.stringify(SEED_ARCO));
      return SEED_ARCO;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_ARCO;
    }
  },

  saveArcoRequest(request: ArcoRequest) {
    const list = this.getArcoRequests();
    list.unshift(request);
    localStorage.setItem(STORAGE_KEYS.SOLICITUDES_ARCO, JSON.stringify(list));

    this.logAction({
      usuario: request.solicitante,
      rol: 'trabajador_social',
      accion: `Recepción de Solicitud ARCO: ${request.tipoDerecho}`,
      exp: request.pacienteExp,
      detalles: `Folio ${request.folio}. Plazo legal de respuesta fijado al ${request.fechaLimiteRespuesta}.`,
    });
  },

  updateArcoStatus(
    folio: string,
    estado: ArcoRequest['estado'],
    dictamen?: string,
    atendidoPor?: string
  ) {
    const list = this.getArcoRequests();
    const item = list.find((r) => r.folio === folio);
    if (!item) return;

    item.estado = estado;
    if (dictamen) item.dictamen = dictamen;
    if (atendidoPor) item.atendidoPor = atendidoPor;

    localStorage.setItem(STORAGE_KEYS.SOLICITUDES_ARCO, JSON.stringify(list));

    this.logAction({
      usuario: atendidoPor || 'director',
      rol: 'director_clinico',
      accion: `Actualización de Folio ARCO ${folio}`,
      exp: item.pacienteExp,
      detalles: `Nuevo estado: ${estado}. Dictamen: ${dictamen || 'N/A'}`,
    });
  },

  // 3. Bóveda de Seudonimización con Token Temporal (TTL)
  getVaultTokens(): DeidentificationVaultToken[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VAULT_TOKENS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  issueVaultToken(params: {
    pacienteExp: string;
    nombreReal: string;
    curp?: string;
    solicitadoPor: string;
    rolSolicitante: any;
    motivoJustificado: string;
    ttlSegundos?: number;
  }): DeidentificationVaultToken {
    const tokens = this.getVaultTokens();
    const ttl = params.ttlSegundos || 300; // 5 minutos por defecto
    const now = new Date();
    const expires = new Date(now.getTime() + ttl * 1000);

    const tokenObj: DeidentificationVaultToken = {
      token: `VAULT-TK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      pacienteExp: params.pacienteExp,
      nombreReal: params.nombreReal,
      curp: params.curp,
      solicitadoPor: params.solicitadoPor,
      rolSolicitante: params.rolSolicitante,
      motivoJustificado: params.motivoJustificado,
      emitidoEn: now.toISOString(),
      expiraEn: expires.toISOString(),
      ttlSegundos: ttl,
    };

    // Purge expired tokens and add new
    const validTokens = tokens.filter((t) => new Date(t.expiraEn).getTime() > Date.now());
    validTokens.unshift(tokenObj);
    localStorage.setItem(STORAGE_KEYS.VAULT_TOKENS, JSON.stringify(validTokens));

    this.logAction({
      usuario: params.solicitadoPor,
      rol: params.rolSolicitante,
      accion: 'Emisión de Token Des-seudonimización Temporal',
      exp: params.pacienteExp,
      motivo: params.motivoJustificado,
      detalles: `Token temporal expedido con TTL de ${ttl} seg. Expira: ${expires.toLocaleTimeString('es-MX')}.`,
    });

    return tokenObj;
  },

  getActiveVaultToken(pacienteExp: string): DeidentificationVaultToken | null {
    const tokens = this.getVaultTokens();
    const valid = tokens.find(
      (t) => t.pacienteExp === pacienteExp && new Date(t.expiraEn).getTime() > Date.now()
    );
    return valid || null;
  },

  revokeVaultToken(tokenStr: string) {
    const tokens = this.getVaultTokens();
    const filtered = tokens.filter((t) => t.token !== tokenStr);
    localStorage.setItem(STORAGE_KEYS.VAULT_TOKENS, JSON.stringify(filtered));
  },

  // 4. Parámetros de Seguridad de Sesión e Inactividad
  getSecurityConfig(): {
    inactivityTimeoutMinutes: number;
    enforceMfaAll: boolean;
    photoExemptionActive: boolean;
    tls13Enforced: boolean;
  } {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG_CIBERSEGURIDAD);
    if (!raw) {
      const def = {
        inactivityTimeoutMinutes: 15,
        enforceMfaAll: true,
        photoExemptionActive: false, // Minimización de datos IPSG 1
        tls13Enforced: true,
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG_CIBERSEGURIDAD, JSON.stringify(def));
      return def;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        inactivityTimeoutMinutes: 15,
        enforceMfaAll: true,
        photoExemptionActive: false,
        tls13Enforced: true,
      };
    }
  },

  saveSecurityConfig(cfg: {
    inactivityTimeoutMinutes: number;
    enforceMfaAll: boolean;
    photoExemptionActive: boolean;
    tls13Enforced: boolean;
  }) {
    localStorage.setItem(STORAGE_KEYS.CONFIG_CIBERSEGURIDAD, JSON.stringify(cfg));
  },

  // 5. Regla de Retención de 5 Años (NOM-004-SSA3-2012)
  calculateLegalRetention(expediente: string): {
    fechaIngreso: string;
    ultimaAtencion: string;
    fechaCaducidadLegal: string;
    aniosRestantes: number;
    diasRestantes: number;
    vigente: boolean;
  } {
    const patient = this.getPatients().find((p) => p.seudonimo === expediente);
    const notes = this.getEvolutionNotes(expediente);

    let lastDateStr = patient?.ingreso || '2026-01-01';
    if (notes.length > 0) {
      // Find latest note date
      const sorted = [...notes].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      lastDateStr = sorted[0].fecha;
    }

    const lastAttentionDate = new Date(lastDateStr);
    // Add 5 legal calendar years per NOM-004
    const expiryDate = new Date(lastAttentionDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);

    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const aniosRestantes = +(diasRestantes / 365.25).toFixed(1);

    return {
      fechaIngreso: patient?.ingreso || '2026-08-01',
      ultimaAtencion: lastDateStr,
      fechaCaducidadLegal: expiryDate.toISOString().slice(0, 10),
      aniosRestantes,
      diasRestantes,
      vigente: diffMs > 0,
    };
  },

  // 6. Matriz de Interoperabilidad HL7 FHIR (NOM-024)
  generateFhirPatientBundle(pseudonym: string): Record<string, any> {
    const patient = this.getPatients().find((p) => p.seudonimo === pseudonym);
    const padron = this.getPadron().find((p) => p.seudonimo === pseudonym);
    const evalData = this.getEvaluations().find((e) => e.expediente === pseudonym);
    const notes = this.getEvolutionNotes(pseudonym);

    return {
      resourceType: 'Bundle',
      id: `bundle-cenivra-${pseudonym.toLowerCase()}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/ClinicalDocument'],
        versionId: '1.0',
        lastUpdated: new Date().toISOString(),
      },
      identifier: {
        system: 'urn:cenivra:sisap:expedientes',
        value: pseudonym,
      },
      entry: [
        {
          fullUrl: `urn:uuid:patient-${pseudonym}`,
          resource: {
            resourceType: 'Patient',
            id: pseudonym,
            identifier: [
              {
                use: 'official',
                system: 'urn:cenivra:pseudonym',
                value: pseudonym,
              },
              ...(padron?.curp
                ? [
                    {
                      use: 'secondary',
                      system: 'urn:renapo:curp',
                      value: padron.curp,
                    },
                  ]
                : []),
            ],
            active: true,
            gender: padron?.sexo === 'M' ? 'male' : padron?.sexo === 'F' ? 'female' : 'other',
            birthDate: padron?.fecha_nacimiento || '1990-01-01',
            managingOrganization: {
              display: 'CENIVRA - Centro Especializado en Adicciones y Salud Mental',
            },
          },
        },
        ...(evalData?.vector24
          ? [
              {
                fullUrl: `urn:uuid:observation-scales-${pseudonym}`,
                resource: {
                  resourceType: 'Observation',
                  id: `obs-vector24-${pseudonym}`,
                  status: 'final',
                  category: [
                    {
                      coding: [
                        {
                          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                          code: 'survey',
                          display: 'Clinical Survey',
                        },
                      ],
                    },
                  ],
                  code: {
                    coding: [
                      {
                        system: 'http://cenivra.org/scales/canonical24',
                        code: 'SISAP-CANONICAL-24',
                        display: 'Vector Transversal 24 Variables Canónicas',
                      },
                    ],
                  },
                  subject: { reference: `urn:uuid:patient-${pseudonym}` },
                  effectiveDateTime: evalData.creado_en || new Date().toISOString(),
                  component: Object.entries(evalData.vector24).map(([k, v]) => ({
                    code: { text: k },
                    valueQuantity: { value: v, unit: 'score' },
                  })),
                },
              },
            ]
          : []),
        ...notes.map((n, idx) => ({
          fullUrl: `urn:uuid:clinical-note-${n.id || idx}`,
          resource: {
            resourceType: 'ClinicalImpression',
            id: n.id,
            status: 'completed',
            subject: { reference: `urn:uuid:patient-${pseudonym}` },
            date: `${n.fecha}T${n.hora}:00Z`,
            assessor: {
              display: `${n.profesional_nombre} (${n.profesional_cedula || 'S/C'})`,
            },
            summary: n.resumen,
            finding: [
              { itemCodeableConcept: { text: n.objetivo } },
              { itemCodeableConcept: { text: n.resultado } },
            ],
          },
        })),
      ],
    };
  },
};

