import React, { useState, useEffect } from 'react';
import { FollowUpEvaluationRecord, RoleConfig, UserAccount } from '../../types/clinical';
import { SEGUIMIENTO_CATALOGO } from '../../constants/clinicalConstants';
import { StorageService } from '../../services/storageService';
import { PatientApiService } from '../../services/patientApiService';
import {
  computeBads,
  computeEros,
  computeGad7,
  parseRawNumbersStrict,
} from '../../services/scalesEngine';
import {
  CalendarCheck,
  Save,
  CheckCircle2,
  Clock,
  Activity,
  Info,
  AlertCircle,
} from 'lucide-react';

interface FollowUpScalesViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
  onOpenPsychometricCenter?: () => void;
}

type FollowUpInstrumentSpec = {
  id: 'GAD-7' | 'BADS' | 'EROS' | 'BSCS' | 'PSS-4' | 'SHAPS' | 'UCLA-3';
  nombre: string;
  nItems: number;
  minVal: number;
  maxVal: number;
  instruccion: string;
};

const FOLLOWUP_INSTRUMENTS: FollowUpInstrumentSpec[] = [
  { id: 'GAD-7', nombre: 'GAD-7 · Ansiedad Generalizada', nItems: 7, minVal: 0, maxVal: 3, instruccion: '7 ítems (0=Para nada a 3=Casi todos los días)' },
  { id: 'BADS', nombre: 'BADS · Activación Conductual', nItems: 25, minVal: 0, maxVal: 6, instruccion: '25 ítems (0=Total desacuerdo a 6=Total acuerdo)' },
  { id: 'EROS', nombre: 'EROS · Recompensa Ambiental', nItems: 10, minVal: 0, maxVal: 4, instruccion: '10 ítems (1–4 o 0–4 según protocolo basal)' },
  { id: 'BSCS', nombre: 'BSCS · Escala Breve de Craving', nItems: 3, minVal: 0, maxVal: 4, instruccion: '3 ítems de intensidad/frecuencia/duración (0–4)' },
  { id: 'PSS-4', nombre: 'PSS-4 · Estrés Percibido Breve', nItems: 4, minVal: 0, maxVal: 4, instruccion: '4 ítems (0=Nunca a 4=Muy a menudo; invierte P2 y P3)' },
  { id: 'SHAPS', nombre: 'SHAPS · Capacidad Hedónica', nItems: 14, minVal: 0, maxVal: 3, instruccion: '14 ítems de placer anticipatorio/consumatorio (0–3)' },
  { id: 'UCLA-3', nombre: 'UCLA-3 · Soledad Afectiva Breve', nItems: 3, minVal: 1, maxVal: 3, instruccion: '3 ítems (1=Casi nunca, 2=Algunas veces, 3=A menudo)' },
];

function computeFollowUpScore(spec: FollowUpInstrumentSpec, items: number[]): { total: number; subscales: Record<string, number> | null; severity: string | null } {
  if (spec.id === 'GAD-7') {
    const res = computeGad7(items);
    return { total: res.total, subscales: { zscore_excel_ref: res.zscore }, severity: res.severidad };
  }
  if (spec.id === 'BADS') {
    const res = computeBads(items);
    return {
      total: res.total_bads_invertido,
      subscales: {
        activation: res.activation,
        avoidance: res.avoidance,
        work: res.work,
        social: res.social,
      },
      severity: null,
    };
  }
  if (spec.id === 'EROS') {
    const tot = computeEros(items, 'excel_canonico');
    return { total: tot, subscales: null, severity: null };
  }
  if (spec.id === 'PSS-4') {
    // Ítems 2 y 3 (base-1: índices 1 y 2) son inversos (4 - x)
    const tot = items[0] + (4 - items[1]) + (4 - items[2]) + items[3];
    return { total: tot, subscales: null, severity: tot >= 8 ? 'Estrés elevado' : 'Moderado/Bajo' };
  }
  const sum = items.reduce((a, b) => a + b, 0);
  if (spec.id === 'UCLA-3') {
    return { total: sum, subscales: null, severity: sum >= 6 ? 'Aislamiento significativo' : 'Rango habitual' };
  }
  return { total: sum, subscales: null, severity: null };
}

export const FollowUpScalesView: React.FC<FollowUpScalesViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
  onOpenPsychometricCenter,
}) => {
  const [activeCadenceIndex, setActiveCadenceIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, string>>(initialData || {});

  // Estado cuantitativo longitudinal
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<FollowUpInstrumentSpec['id']>('GAD-7');
  const [evalDate, setEvalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionNumber, setSessionNumber] = useState<string>('2');
  const [rawItems, setRawItems] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [history, setHistory] = useState<FollowUpEvaluationRecord[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeCadence = SEGUIMIENTO_CATALOGO[activeCadenceIndex];
  const currentSpec = FOLLOWUP_INSTRUMENTS.find((s) => s.id === selectedInstrumentId) || FOLLOWUP_INSTRUMENTS[0];

  const loadLocalHistory = () => {
    setHistory(StorageService.getFollowUpEvaluations(selectedPseudonym));
  };

  useEffect(() => {
    loadLocalHistory();
  }, [selectedPseudonym]);

  const parsedCheck = parseRawNumbersStrict(
    rawItems,
    currentSpec.nItems,
    currentSpec.minVal,
    currentSpec.maxVal,
    currentSpec.id
  );
  const computedPreview = parsedCheck.valid ? computeFollowUpScore(currentSpec, parsedCheck.items) : null;

  const handleStatusChange = (instrumentId: string, status: string) => {
    setFormData((prev) => ({ ...prev, [instrumentId]: status }));
  };

  const handleSaveFollowUpScore = async () => {
    setErrorMsg(null);
    if (!parsedCheck.valid || !computedPreview) {
      setErrorMsg(parsedCheck.incidents.map((i) => i.mensaje).join(' · '));
      return;
    }
    const sessNum = sessionNumber.trim() ? Number.parseInt(sessionNumber, 10) : null;
    if (sessNum !== null && (!Number.isInteger(sessNum) || sessNum < 1)) {
      setErrorMsg('El número de sesión debe ser un entero positivo.');
      return;
    }

    const record: FollowUpEvaluationRecord = {
      follow_up_id: `FU-${Date.now()}`,
      patient_id: selectedPseudonym,
      evaluation_date: evalDate,
      session_number: sessNum,
      instrument: currentSpec.id,
      total_score: computedPreview.total,
      subscales: computedPreview.subscales,
      items: parsedCheck.items,
      items_count: parsedCheck.items.length,
      clinical_severity: computedPreview.severity,
      clinician_id: currentUser.u,
      notes: notes.trim() || null,
      creado_en: new Date().toISOString(),
    };

    StorageService.saveFollowUpEvaluation(record);
    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: `Captura cuantitativa de seguimiento (${currentSpec.id})`,
      exp: selectedPseudonym,
      detalles: `fecha=${evalDate} total=${computedPreview.total} sesion=${sessNum ?? 'N/A'}`,
    });

    // Intentar sincronizar con backend SQLite si el paciente existe por ID o búsqueda de seudónimo
    let syncedBackend = false;
    try {
      const search = await PatientApiService.searchPatients(selectedPseudonym);
      const match = search.find((p) => p.pseudonym === selectedPseudonym || p.patient_id === selectedPseudonym);
      if (match) {
        await PatientApiService.createFollowUp({
          patient_id: match.patient_id,
          evaluation_date: evalDate,
          session_number: sessNum,
          instrument: currentSpec.id,
          total_score: computedPreview.total,
          subscales: computedPreview.subscales,
          items: parsedCheck.items,
          clinical_severity: computedPreview.severity,
          clinician_id: currentUser.u,
          notes: notes.trim() || null,
        });
        syncedBackend = true;
      }
    } catch {
      syncedBackend = false;
    }

    loadLocalHistory();
    setRawItems('');
    setNotes('');
    setSaveStatus(
      `${currentSpec.id} registrado (total = ${computedPreview.total}) el ${evalDate}${
        syncedBackend ? ' · sincronizado con SQLite' : ' · almacenado localmente'
      }.`
    );
  };

  const handleSaveDraft = () => {
    StorageService.saveDraft({
      formulario: `Control de Escalas (${activeCadence.frecuencia})`,
      screen: 'seguimiento',
      pre: selectedPseudonym,
      paciente: selectedPseudonym,
      datos: { ...formData, instrument: selectedInstrumentId, rawItems },
    });
    if (onDraftSaved) onDraftSaved();
    setSaveStatus(`Borrador guardado a las ${new Date().toLocaleTimeString('es-MX')}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--sep-claro)]">
        <div>
          <h2 className="text-base font-bold text-[var(--texto)]">
            Seguimiento Longitudinal Cuantitativo y Calendario Psicométrico
          </h2>
          <p className="text-xs text-[var(--texto-sec)]">
            Expediente: <span className="font-mono font-bold">{selectedPseudonym}</span> · Modo de compatibilidad por secuencia numérica (legado)
          </p>
        </div>
        {onOpenPsychometricCenter && (
          <button
            type="button"
            onClick={onOpenPsychometricCenter}
            className="sisap-btn-pri text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Abrir aplicación digital por reactivos</span>
          </button>
        )}
      </div>

      {saveStatus && (
        <div className="p-3 bg-[var(--normal)]/10 border border-[var(--normal)]/40 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--normal)] shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-[var(--riesgo)]/10 border border-[var(--riesgo)]/40 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--riesgo)] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Captura Cuantitativa para Motor 2 */}
      <div className="sisap-captura border border-[var(--accion)]/40 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--sep-claro)] pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accion)]" />
            <h3 className="text-sm font-bold text-[var(--texto)]">
              Registro Cuantitativo de Seguimiento (Insumo para Trayectoria y RCI)
            </h3>
          </div>
          {computedPreview ? (
            <span className="est-ok font-mono tabular-nums">
              Válido · Total = {computedPreview.total} {computedPreview.severity ? `(${computedPreview.severity})` : ''}
            </span>
          ) : (
            <span className="est-pend font-mono tabular-nums">
              {parsedCheck.count}/{currentSpec.nItems} reactivos
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="md:col-span-2">
            <label className="block text-[var(--texto-sec)] mb-1">Instrumento cuantitativo</label>
            <select
              value={selectedInstrumentId}
              onChange={(e) => {
                setSelectedInstrumentId(e.target.value as FollowUpInstrumentSpec['id']);
                setRawItems('');
                setErrorMsg(null);
              }}
              className="sisap-select"
            >
              {FOLLOWUP_INSTRUMENTS.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre} ({inst.nItems} ítems)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Fecha de aplicación</label>
            <input
              type="date"
              value={evalDate}
              onChange={(e) => setEvalDate(e.target.value)}
              className="sisap-input"
            />
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">N.º de sesión clínica</label>
            <input
              type="number"
              min={1}
              value={sessionNumber}
              onChange={(e) => setSessionNumber(e.target.value)}
              className="sisap-input tabular-nums"
            />
          </div>
        </div>

        <div className="text-xs space-y-1">
          <label className="block text-[var(--texto-sec)]">
            Respuestas crudas ({currentSpec.instruccion})
          </label>
          <input
            type="text"
            value={rawItems}
            onChange={(e) => setRawItems(e.target.value)}
            placeholder={`Ingrese exactamente ${currentSpec.nItems} valores entre ${currentSpec.minVal} y ${currentSpec.maxVal}...`}
            className="sisap-input font-mono text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end text-xs">
          <div className="md:col-span-3">
            <label className="block text-[var(--texto-sec)] mb-1">Observación clínica breve (contexto de aplicación)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Aplicación al cierre de sesión semanal sin incidentes..."
              className="sisap-input text-xs"
            />
          </div>
          {roleConfig.escribe && (
            <button
              type="button"
              onClick={handleSaveFollowUpScore}
              disabled={!parsedCheck.valid}
              className="sisap-btn text-xs py-2 px-3 inline-flex items-center justify-center gap-1.5 font-semibold disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Registrar medición</span>
            </button>
          )}
        </div>
      </div>

      {/* Serie histórica registrada del paciente */}
      <div className="sisap-tarjeta">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--sep-claro)]">
          <h3 className="text-sm font-bold">Historial Longitudinal Registrado ({history.length})</h3>
          <span className="text-[11px] text-[var(--texto-tenue)]">Orden cronológico · tabla follow_up_evaluations</span>
        </div>
        {history.length === 0 ? (
          <div className="p-4 text-xs text-[var(--texto-sec)] flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--accion)]" />
            <span>Aún no hay seguimientos cuantitativos registrados para {selectedPseudonym}.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[var(--sep)] text-[var(--texto-sec)] text-left">
                  <th className="py-1.5 pr-3">Fecha</th>
                  <th className="py-1.5 pr-3">Sesión</th>
                  <th className="py-1.5 pr-3">Instrumento</th>
                  <th className="py-1.5 pr-3">Puntuación Total</th>
                  <th className="py-1.5 pr-3">Severidad / Subescalas</th>
                  <th className="py-1.5">Notas</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.follow_up_id} className="border-b border-[var(--sep-claro)]">
                    <td className="py-1.5 pr-3 font-mono">{item.evaluation_date}</td>
                    <td className="py-1.5 pr-3 font-mono">{item.session_number ? `S${item.session_number}` : '—'}</td>
                    <td className="py-1.5 pr-3 font-semibold">{item.instrument}</td>
                    <td className="py-1.5 pr-3 font-mono font-bold text-[var(--accion)]">{item.total_score}</td>
                    <td className="py-1.5 pr-3 text-[var(--texto-sec)]">
                      {item.clinical_severity || (item.subscales ? JSON.stringify(item.subscales) : '—')}
                    </td>
                    <td className="py-1.5 text-[var(--texto-tenue)]">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calendario de cadencias */}
      <div className="flex flex-wrap gap-2">
        {SEGUIMIENTO_CATALOGO.map((cadence, idx) => (
          <button
            key={cadence.frecuencia}
            type="button"
            onClick={() => setActiveCadenceIndex(idx)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
              activeCadenceIndex === idx
                ? 'bg-[var(--accion)] text-white border-[var(--accion)]'
                : 'bg-[var(--panel)] text-[var(--texto)] border-[var(--sep)] hover:bg-[var(--nav-hover)]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 inline mr-1.5" />
            {cadence.frecuencia}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeCadence.instrumentos.map((inst) => {
          const val = formData[inst.id] || 'pendiente';
          return (
            <div key={inst.id} className="sisap-tarjeta flex flex-col justify-between gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold">{inst.nombre}</h4>
                  <span className="text-[11px] font-mono text-[var(--texto-tenue)]">{inst.duracion}</span>
                </div>
                <span className={val === 'completado' ? 'est-ok' : 'est-pend'}>{val}</span>
              </div>
              {roleConfig.escribe && (
                <select
                  value={val}
                  onChange={(e) => handleStatusChange(inst.id, e.target.value)}
                  className="sisap-select text-xs"
                >
                  <option value="pendiente">Pendiente de aplicación</option>
                  <option value="completado">Completado</option>
                  <option value="no_aplica">No aplica en esta visita</option>
                </select>
              )}
            </div>
          );
        })}
      </div>

      {roleConfig.escribe && (
        <div className="p-3 bg-[var(--panel)] border border-[var(--sep-claro)] rounded flex justify-end">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="sisap-btn-sec text-xs py-2 px-3 inline-flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-[var(--advertencia)]" />
            <span>Guardar borrador de calendario</span>
          </button>
        </div>
      )}
    </div>
  );
};
