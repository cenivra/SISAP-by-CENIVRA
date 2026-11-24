import React, { useState, useEffect } from 'react';
import { InitialEvaluationData, RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  computeBis11,
  computeBsl23,
  computeGad7,
  computeStaxi2,
  computeBads,
  computeEros,
  assemble24Vector,
  parseRawNumbers,
  parseRawNumbersStrict,
  validateCompleteEvaluationD06,
  ScoringMode,
} from '../../services/scalesEngine';
import { COLUMNAS_MODELO } from '../../constants/clinicalConstants';
import {
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Info,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { AutoencoderEngine, AutoencoderInferenceResult } from '../../services/autoencoderEngine';
import { PatientApiService } from '../../services/patientApiService';
import { ClinicalReportModal } from '../ClinicalReportModal';

interface InitialEvaluationViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
  onOpenPsychometricCenter?: () => void;
}

function countTokens(raw: string): number {
  const clean = raw.trim();
  if (!clean) return 0;
  return clean.split(/[\s,;]+/).filter(Boolean).length;
}

export const InitialEvaluationView: React.FC<InitialEvaluationViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
  onOpenPsychometricCenter,
}) => {
  const [aplico, setAplico] = useState<string>(currentUser.nombre || currentUser.u);
  const [fechaEval, setFechaEval] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modoScoring, setModoScoring] = useState<ScoringMode>('excel_canonico');
  const [sustanciaPrincipal, setSustanciaPrincipal] = useState<string>('Desconocida');

  // Respuestas crudas de los 6 instrumentos (sin imputación silenciosa)
  const [rawBis11, setRawBis11] = useState<string>('');
  const [rawBsl23, setRawBsl23] = useState<string>('');
  const [rawBsl23Conductual, setRawBsl23Conductual] = useState<string>('');
  const [bslGeneral01, setBslGeneral01] = useState<number>(0.55);
  const [rawGad7, setRawGad7] = useState<string>('');
  const [rawStaxi2, setRawStaxi2] = useState<string>('');
  const [rawBads, setRawBads] = useState<string>('');
  const [rawEros, setRawEros] = useState<string>('');

  // Variables sociodemográficas y clínicas basales
  const [edad, setEdad] = useState<number>(34);
  const [tiempoConsumo, setTiempoConsumo] = useState<number>(9);
  const [tratamientosPrevios, setTratamientosPrevios] = useState<number>(2);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [liveInference, setLiveInference] = useState<AutoencoderInferenceResult | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.raw_bis_11) setRawBis11(initialData.raw_bis_11);
      if (initialData.raw_bsl_23) setRawBsl23(initialData.raw_bsl_23);
      if (initialData.raw_bsl_23_conductual) setRawBsl23Conductual(initialData.raw_bsl_23_conductual);
      if (initialData.bsl_general_0_1) setBslGeneral01(Number(initialData.bsl_general_0_1) || 0.55);
      if (initialData.raw_gad_7) setRawGad7(initialData.raw_gad_7);
      if (initialData.raw_staxi_2) setRawStaxi2(initialData.raw_staxi_2);
      if (initialData.raw_bads) setRawBads(initialData.raw_bads);
      if (initialData.raw_eros) setRawEros(initialData.raw_eros);
      if (initialData.sustancia_principal) setSustanciaPrincipal(initialData.sustancia_principal);
      if (initialData.edad) setEdad(Number(initialData.edad) || 34);
      if (initialData.tiempo_consumo_anios) setTiempoConsumo(Number(initialData.tiempo_consumo_anios) || 9);
      if (initialData.tratamientos_previos_cuenta) setTratamientosPrevios(Number(initialData.tratamientos_previos_cuenta) || 2);
      return;
    }

    const existing = StorageService.getEvaluations(selectedPseudonym)[0];
    if (existing) {
      setRawBis11(existing.raw_bis_11 || '');
      setRawBsl23(existing.raw_bsl_23 || '');
      setRawBsl23Conductual(existing.raw_bsl_23_conductual || '');
      setBslGeneral01(existing.bsl_general_0_1 ?? existing.calculados?.bsl_general ?? 0.55);
      setRawGad7(existing.raw_gad_7 || '');
      setRawStaxi2(existing.raw_staxi_2 || '');
      setRawBads(existing.raw_bads || '');
      setRawEros(existing.raw_eros || '');
      setSustanciaPrincipal(existing.sustancia_principal || 'Desconocida');
      setEdad(existing.edad || 34);
      setTiempoConsumo(existing.tiempo_consumo_anios || 9);
      setTratamientosPrevios(existing.tratamientos_previos_cuenta || 2);
      if (existing.latentes_autoencoder && 'verifiedMetrics' in existing.latentes_autoencoder) {
        setLiveInference(existing.latentes_autoencoder as unknown as AutoencoderInferenceResult);
      }
    }
  }, [selectedPseudonym, initialData]);

  const bisCount = countTokens(rawBis11);
  const bslCount = countTokens(rawBsl23);
  const bslBehCount = countTokens(rawBsl23Conductual);
  const gadCount = countTokens(rawGad7);
  const staxiCount = countTokens(rawStaxi2);
  const badsCount = countTokens(rawBads);
  const erosCount = countTokens(rawEros);

  const d06Validation = validateCompleteEvaluationD06({
    edad,
    tiempo_consumo: tiempoConsumo,
    trat_previos: tratamientosPrevios,
    raw_bis_11: rawBis11,
    raw_bsl_23: rawBsl23,
    raw_bsl_23_conductual: rawBsl23Conductual,
    bsl_general_0_1: bslGeneral01,
    raw_gad_7: rawGad7,
    raw_staxi_2: rawStaxi2,
    raw_bads: rawBads,
    raw_eros: rawEros,
    modo_scoring: modoScoring,
  });

  // Previsualización determinista en pantalla (siempre separada de validez D-06)
  const bisPreview = computeBis11(parseRawNumbers(rawBis11, 30, 2), modoScoring);
  const bslPreview = computeBsl23(
    parseRawNumbers(rawBsl23, 23, 1),
    bslBehCount === 11 ? parseRawNumbers(rawBsl23Conductual, 11, 0) : undefined,
    bslGeneral01
  );
  const gadPreview = computeGad7(parseRawNumbers(rawGad7, 7, 1));
  const staxiPreview = computeStaxi2(parseRawNumbers(rawStaxi2, Math.max(staxiCount, 49), 2));
  const badsPreview = computeBads(parseRawNumbers(rawBads, 25, 3));
  const erosPreview = computeEros(parseRawNumbers(rawEros, 10, 2), modoScoring);

  const vector24 = assemble24Vector({
    bis: bisPreview,
    staxi: staxiPreview,
    bsl: bslPreview,
    gad: gadPreview,
    bads: badsPreview,
    erosTotal: erosPreview,
    edad,
    tiempoConsumo,
    tratPrevios: tratamientosPrevios,
    sustanciaPrincipal,
  });

  const handleFillDemoValues = () => {
    const demoBis = Array.from({ length: 30 }, (_, i) => ((i % 4) + 1)).join(' ');
    const demoBsl = Array.from({ length: 23 }, (_, i) => (i % 3)).join(' ');
    const demoBslBeh = Array.from({ length: 11 }, (_, i) => (i % 2)).join(' ');
    const demoGad = '2 1 2 1 2 1 2';
    const demoStaxi = Array.from({ length: 49 }, (_, i) => ((i % 3) + 1)).join(' ');
    const demoBads = Array.from({ length: 25 }, (_, i) => (i % 6)).join(' ');
    const demoEros = Array.from({ length: 10 }, (_, i) => ((i % 4) + 1)).join(' ');

    setRawBis11(demoBis);
    setRawBsl23(demoBsl);
    setRawBsl23Conductual(demoBslBeh);
    setBslGeneral01(0.55);
    setRawGad7(demoGad);
    setRawStaxi2(demoStaxi);
    setRawBads(demoBads);
    setRawEros(demoEros);
    setSustanciaPrincipal('Cannabis');
    setEdad(32);
    setTiempoConsumo(9);
    setTratamientosPrevios(2);
    setSaveStatus('Datos de prueba completos (D-06 válidos) cargados en el formulario.');
  };

  const handleRunVerifiedInference = () => {
    if (!d06Validation.valido) {
      setLiveInference(null);
      setSaveStatus(
        `Regla D-06: captura incompleta (${d06Validation.n_incidencias} incidencias). No se ejecuta inferencia latente.`
      );
      return;
    }
    const res = AutoencoderEngine.runVerifiedInference(vector24, 'encoder_22_checkpoint_fase2');
    setLiveInference(res);
    setSaveStatus(
      `Inferencia verificada ejecutada (${res.modelId}, MSE_z=${res.verifiedMetrics.mse_z.toFixed(4)}).`
    );
  };

  const handleSaveDraft = () => {
    StorageService.saveDraft({
      formulario: 'Evaluación Inicial de Escalas (6 Instrumentos)',
      screen: 'eval_inicial',
      pre: selectedPseudonym,
      paciente: selectedPseudonym,
      datos: {
        raw_bis_11: rawBis11,
        raw_bsl_23: rawBsl23,
        raw_bsl_23_conductual: rawBsl23Conductual,
        bsl_general_0_1: String(bslGeneral01),
        raw_gad_7: rawGad7,
        raw_staxi_2: rawStaxi2,
        raw_bads: rawBads,
        raw_eros: rawEros,
        sustancia_principal: sustanciaPrincipal,
        edad: String(edad),
        tiempo_consumo_anios: String(tiempoConsumo),
        tratamientos_previos_cuenta: String(tratamientosPrevios),
      },
    });
    if (onDraftSaved) onDraftSaved();
    setSaveStatus(`Borrador guardado localmente a las ${new Date().toLocaleTimeString('es-MX')}.`);
  };

  const handleSaveFinal = async () => {
    if (!d06Validation.valido) {
      setSaveStatus(
        `Registro bloqueado por D-06: resuelva las ${d06Validation.n_incidencias} incidencias antes de firmar el expediente.`
      );
      return;
    }

    const inferenceResult = AutoencoderEngine.runVerifiedInference(vector24, 'encoder_22_checkpoint_fase2');
    setLiveInference(inferenceResult);

    const evaluationRecord: InitialEvaluationData = {
      id: `EVAL-${Date.now()}`,
      expediente: selectedPseudonym,
      fecha_eval: fechaEval,
      aplico,
      raw_bis_11: rawBis11,
      raw_bsl_23: rawBsl23,
      raw_bsl_23_conductual: rawBsl23Conductual,
      bsl_general_0_1: bslGeneral01,
      raw_gad_7: rawGad7,
      raw_staxi_2: rawStaxi2,
      raw_bads: rawBads,
      raw_eros: rawEros,
      sustancia_principal: sustanciaPrincipal,
      modo_scoring: modoScoring,
      edad,
      tiempo_consumo_anios: tiempoConsumo,
      tratamientos_previos_cuenta: tratamientosPrevios,
      calculados: {
        bis_motor: bisPreview.motor,
        bis_nonplanning: bisPreview.nonplanning,
        bis_cognitive_instability: bisPreview.cognitive_instability,
        bis_perseverance: bisPreview.perseverance,
        bis_motor_impulsivity: bisPreview.motor_impulsivity,
        bis_total: bisPreview.total,
        bsl_general: bslPreview.general,
        bsl_total_integrado: bslPreview.total_integrado,
        gad_total: gadPreview.total,
        gad_zscore: gadPreview.zscore,
        gad_severidad: gadPreview.severidad,
        staxi_state: staxiPreview.state,
        staxi_trait: staxiPreview.trait,
        staxi_temperamento: staxiPreview.temperamento,
        bads_activation: badsPreview.activation,
        bads_avoidance: badsPreview.avoidance,
        bads_work: badsPreview.work,
        bads_social: badsPreview.social,
        eros_total: erosPreview,
      },
      vector24,
      latentes_autoencoder: inferenceResult,
      creado_en: new Date().toLocaleString('es-MX'),
    };

    StorageService.saveEvaluation(evaluationRecord);
    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Evaluación inicial e inferencia Autoencoder 12D registradas',
      exp: selectedPseudonym,
      detalles: `BIS-11=${bisPreview.total}, GAD-7=${gadPreview.total}, BSL-23=${bslPreview.total_integrado}, MSE_z=${inferenceResult.verifiedMetrics.mse_z.toFixed(4)}`,
    });

    // Sincronización con backend SQLite: resuelve patient_id por seudónimo y persiste model_runs con el modelo activo gobernado
    let backendSynced = false;
    let persistedRunId: string | null = null;
    try {
      const bisItems = parseRawNumbersStrict(rawBis11, 30, modoScoring === 'excel_canonico' ? 0 : 1, 4, 'BIS-11').items;
      const badsItems = parseRawNumbersStrict(rawBads, 25, 0, 6, 'BADS').items;
      const erosItems = parseRawNumbersStrict(rawEros, 10, modoScoring === 'excel_canonico' ? 0 : 1, 4, 'EROS').items;
      const gadItems = parseRawNumbersStrict(rawGad7, 7, 0, 3, 'GAD-7').items;
      const staxiItems = parseRawNumbersStrict(rawStaxi2, 49, 1, 4, 'STAXI-2').items;
      const bslCore = parseRawNumbersStrict(rawBsl23, 23, 0, 4, 'BSL-23').items;
      const bslBeh = parseRawNumbersStrict(rawBsl23Conductual, 11, 0, 4, 'BSL-23 Conductual').items;

      let matchedPatientId: string | undefined;
      try {
        const searchMatches = await PatientApiService.searchPatients(selectedPseudonym);
        matchedPatientId = searchMatches.find(
          (m) => m.pseudonym === selectedPseudonym || m.patient_id === selectedPseudonym
        )?.patient_id;
      } catch {
        matchedPatientId = undefined;
      }

      const apiRes = await PatientApiService.runAutoencoderInference({
        patient_id: matchedPatientId,
        id_registro: evaluationRecord.id,
        modo_scoring: modoScoring,
        persist: Boolean(matchedPatientId),
        edad,
        tiempo_consumo: tiempoConsumo,
        trat_previos: tratamientosPrevios,
        sustancia_principal: sustanciaPrincipal,
        bis11: { modo_captura: modoScoring, respuestas: bisItems },
        bads: { modo_captura: 'items_crudos', respuestas: badsItems },
        eros: { modo_captura: modoScoring, respuestas: erosItems },
        gad7: { modo_captura: 'items_crudos', respuestas: gadItems },
        staxi2: { modo_captura: 'items_crudos', respuestas: staxiItems },
        bsl23: {
          modo_captura: 'items_crudos',
          respuestas: bslCore,
          respuestas_conductuales: bslBeh,
          general_score_0_1: bslGeneral01,
        },
      });
      backendSynced = Boolean(apiRes && apiRes.status !== 'failed');
      persistedRunId = apiRes?.persistence?.persisted ? apiRes?.persistence?.run_id || null : null;
    } catch {
      backendSynced = false;
    }

    setSaveStatus(
      `Evaluación y perfil latente 12D registrados en expediente ${selectedPseudonym} (${
        persistedRunId
          ? `persistido en SQLite model_runs (${persistedRunId})`
          : backendSynced
          ? 'verificado también en backend local'
          : 'persistido en almacén local'
      }).`
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--sep-claro)]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Evaluación Inicial · Batería Psicométrica (6 Instrumentos)
          </h2>
          <p className="text-xs text-[var(--texto-sec)]">
            Aplicó: {aplico} · Compuerta D-06 sin imputación silenciosa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenPsychometricCenter && (
            <button
              type="button"
              onClick={onOpenPsychometricCenter}
              className="sisap-btn-pri text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Aplicar escalas por reactivos (Centro Psicométrico)</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleFillDemoValues}
            className="sisap-btn-sec text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--advertencia)]" />
            <span>Cargar demo completo</span>
          </button>
          <button
            type="button"
            onClick={handleRunVerifiedInference}
            className="sisap-btn-sec text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-[var(--accion)]" />
            <span>Ejecutar Autoencoder 12D</span>
          </button>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="sisap-btn-sec text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--accion)]" />
            <span>Informe oficial</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`p-3 rounded border text-xs flex items-center gap-2 ${
            d06Validation.valido
              ? 'bg-[var(--normal)]/10 border-[var(--normal)]/40 text-[var(--texto)]'
              : 'bg-[var(--advertencia)]/10 border-[var(--advertencia)]/40 text-[var(--texto)]'
          }`}
        >
          <Info className="w-4 h-4 shrink-0 text-[var(--accion)]" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Parámetros de ejecución y variables clínicas basales */}
      <div className="sisap-captura">
        <h3 className="text-sm font-semibold mb-2 text-[var(--texto)]">
          Variables sociodemográficas, consumo y parámetros del pipeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Edad (años)</label>
            <input
              type="number"
              min={12}
              max={100}
              value={edad}
              onChange={(e) => setEdad(Number(e.target.value))}
              className="sisap-input tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Tiempo consumo (años)</label>
            <input
              type="number"
              min={0}
              max={80}
              value={tiempoConsumo}
              onChange={(e) => setTiempoConsumo(Number(e.target.value))}
              className="sisap-input tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Trat. previos</label>
            <input
              type="number"
              min={0}
              max={50}
              value={tratamientosPrevios}
              onChange={(e) => setTratamientosPrevios(Number(e.target.value))}
              className="sisap-input tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Sustancia principal</label>
            <select
              value={sustanciaPrincipal}
              onChange={(e) => setSustanciaPrincipal(e.target.value)}
              className="sisap-select"
            >
              <option value="Desconocida">Otra / No especificada</option>
              <option value="Cannabis">Cannabis (activa dummy Nivel 2B)</option>
              <option value="Alcohol">Alcohol</option>
              <option value="Cocaina">Cocaína / Estimulantes</option>
              <option value="Metanfetamina">Metanfetamina</option>
              <option value="Policonsumo">Policonsumo</option>
            </select>
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Modo scoring (D-01)</label>
            <select
              value={modoScoring}
              onChange={(e) => setModoScoring(e.target.value as ScoringMode)}
              className="sisap-select"
            >
              <option value="excel_canonico">excel_canonico (cohorte N=166)</option>
              <option value="manual_estandar">manual_estandar (manuales)</option>
            </select>
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Fecha aplicación</label>
            <input
              type="date"
              value={fechaEval}
              onChange={(e) => setFechaEval(e.target.value)}
              className="sisap-input"
            />
          </div>
        </div>
      </div>

      {/* Captura de los 6 instrumentos */}
      <div className="space-y-4">
        {/* 1. BIS-11 */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">BIS-11 · Impulsividad de Barratt (30 reactivos)</h3>
                <span className={bisCount === 30 ? 'est-ok font-mono' : 'est-pend font-mono'}>
                  {bisCount}/30 reactivos
                </span>
              </div>
              <p className="text-[11px] text-[var(--texto-tenue)]">
                Rango 1–4 ({modoScoring === 'excel_canonico' ? '0–4 en modo excel_canonico' : 'inversión Patton 5-x'}).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs tabular-nums">
              <span className="est-ok">Total: {bisPreview.total}</span>
              <span className="est-warn">Motora: {bisPreview.motor}</span>
              <span className="est-warn">No-planeada: {bisPreview.nonplanning}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawBis11}
            onChange={(e) => setRawBis11(e.target.value)}
            placeholder="30 reactivos separados por espacio..."
            className="sisap-input font-mono text-xs"
          />
        </div>

        {/* 2. BSL-23 + Conductual (11) + GENERAL */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">BSL-23 · Sintomatología Límite (23 núcleo + 11 conductuales + General)</h3>
                <span className={bslCount === 23 && bslBehCount === 11 ? 'est-ok font-mono' : 'est-pend font-mono'}>
                  {bslCount}/23 + {bslBehCount}/11 conductuales
                </span>
              </div>
              <p className="text-[11px] text-[var(--texto-tenue)]">
                Rango 0–4. Columna GENERAL independiente (escala 0.00–1.00) requerida para compuesto_bsl.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs tabular-nums">
              <span className="est-ok">GENERAL: {bslPreview.general.toFixed(2)}</span>
              <span className="est-pend">Total integrado: {bslPreview.total_integrado}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-6">
              <label className="block text-[10.5px] text-[var(--texto-sec)] mb-1">23 reactivos nucleares (0–4)</label>
              <input
                type="text"
                value={rawBsl23}
                onChange={(e) => setRawBsl23(e.target.value)}
                placeholder="23 reactivos (0..4)..."
                className="sisap-input font-mono text-xs"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-[10.5px] text-[var(--texto-sec)] mb-1">11 ítems conductuales (0–4)</label>
              <input
                type="text"
                value={rawBsl23Conductual}
                onChange={(e) => setRawBsl23Conductual(e.target.value)}
                placeholder="11 ítems conductuales (0..4)..."
                className="sisap-input font-mono text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10.5px] text-[var(--texto-sec)] mb-1">GENERAL (0.00–1.00)</label>
              <input
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={bslGeneral01}
                onChange={(e) => setBslGeneral01(Number(e.target.value))}
                className="sisap-input font-mono text-xs tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* 3. GAD-7 */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">GAD-7 · Ansiedad Generalizada (7 reactivos)</h3>
              <span className={gadCount === 7 ? 'est-ok font-mono' : 'est-pend font-mono'}>
                {gadCount}/7 reactivos
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs tabular-nums">
              <span className="est-ok">Bruto: {gadPreview.total}/21</span>
              <span className="est-warn">{gadPreview.severidad}</span>
              <span className="est-pend font-mono">Z_intermedio: {gadPreview.zscore.toFixed(4)}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawGad7}
            onChange={(e) => setRawGad7(e.target.value)}
            placeholder="7 reactivos (0..3)..."
            className="sisap-input font-mono text-xs"
          />
        </div>

        {/* 4. STAXI-2 (49 reactivos) */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">STAXI-2 · Ira Estado, Rasgo y Expresión (49 reactivos)</h3>
                <span className={staxiCount === 49 ? 'est-ok font-mono' : 'est-pend font-mono'}>
                  {staxiCount}/49 reactivos
                </span>
              </div>
              <p className="text-[11px] text-[var(--texto-tenue)]">
                Versión española completa de 49 ítems (rango 1–4): P1..P15 Estado, P16..P25 Rasgo (Temperamento + Reacción), P26..P49 IEI.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs tabular-nums">
              <span className="est-warn">Estado: {staxiPreview.state}</span>
              <span className="est-warn">Rasgo: {staxiPreview.trait}</span>
              <span className="est-pend">Temp: {staxiPreview.temperamento}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawStaxi2}
            onChange={(e) => setRawStaxi2(e.target.value)}
            placeholder="49 reactivos (1..4)..."
            className="sisap-input font-mono text-xs"
          />
        </div>

        {/* 5. BADS */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">BADS · Activación Conductual (25 reactivos, 0–6)</h3>
              <span className={badsCount === 25 ? 'est-ok font-mono' : 'est-pend font-mono'}>
                {badsCount}/25 reactivos
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs tabular-nums">
              <span className="est-ok">Activación: {badsPreview.activation}</span>
              <span className="est-risk">Evitación: {badsPreview.avoidance}</span>
              <span className="est-pend">Trabajo: {badsPreview.work}</span>
              <span className="est-pend">Social: {badsPreview.social}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawBads}
            onChange={(e) => setRawBads(e.target.value)}
            placeholder="25 reactivos (0..6)..."
            className="sisap-input font-mono text-xs"
          />
        </div>

        {/* 6. EROS */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">EROS · Recompensa Ambiental (10 reactivos)</h3>
                <span className={erosCount === 10 ? 'est-ok font-mono' : 'est-pend font-mono'}>
                  {erosCount}/10 reactivos
                </span>
              </div>
              <p className="text-[11px] text-[var(--texto-tenue)]">
                Rango 1–4 (0–4 en Excel histórico). Preservado como EROS_raw separado de tiempo_consumo y excluido del encoder 22/24.
              </p>
            </div>
            <span className="est-ok tabular-nums">EROS_raw: {erosPreview} / 40</span>
          </div>
          <input
            type="text"
            value={rawEros}
            onChange={(e) => setRawEros(e.target.value)}
            placeholder="10 reactivos (1..4)..."
            className="sisap-input font-mono text-xs"
          />
        </div>
      </div>

      {/* Estado de validación D-06 */}
      <div
        className={`sisap-captura border ${
          d06Validation.valido ? 'border-[var(--normal)]/50' : 'border-[var(--advertencia)]/50'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {d06Validation.valido ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--normal)]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[var(--advertencia)]" />
            )}
            <h3 className="text-sm font-bold">
              Compuerta de Integridad D-06 ({d06Validation.valido ? 'Aprobada · Lista para inferencia' : `${d06Validation.n_incidencias} incidencias pendientes`})
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--texto-sec)]">
            Modelo por defecto: encoder_22_checkpoint_fase2
          </span>
        </div>
        {!d06Validation.valido && (
          <ul className="text-xs text-[var(--texto-sec)] space-y-1 max-h-32 overflow-y-auto">
            {d06Validation.incidencias.slice(0, 6).map((inc, i) => (
              <li key={i} className="font-mono text-[11px]">
                [{inc.categoria_d06}] {inc.campo}: {inc.mensaje}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Vector de 24 columnas */}
      <div className="sisap-tarjeta">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--sep-claro)]">
          <h3 className="text-sm font-bold">Vector Canónico de 24 Características (Capa 3 pre-Winsorización)</h3>
          <span className="text-xs font-mono text-[var(--texto-sec)]">24 columnas verificadas</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs tabular-nums">
          {COLUMNAS_MODELO.map((col) => (
            <div key={col} className="p-2 bg-[var(--campo)] border border-[var(--sep)] rounded">
              <div className="font-mono text-[10px] text-[var(--texto-tenue)] truncate" title={col}>
                {col}
              </div>
              <div className="font-mono font-bold text-[var(--texto)] mt-0.5">
                {Number(vector24[col] ?? 0).toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resultado de Inferencia Verificada 12D */}
      {liveInference && (
        <div className="sisap-tarjeta border border-[var(--accion)]/40">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-[var(--sep-claro)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--normal)]" />
              <h3 className="text-sm font-bold">
                Representación Latente 12D ({liveInference.modelId}) · SHA-256 Verificado
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
              <span className="est-ok">MSE_z: {liveInference.verifiedMetrics.mse_z.toFixed(4)}</span>
              <span className="est-pend">Norma L2: {liveInference.verifiedMetrics.l2_norm.toFixed(4)}</span>
              <span className="est-pend">
                Dist. p50: {liveInference.verifiedMetrics.distance_to_cohort_median_p50.toFixed(4)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs tabular-nums">
            {liveInference.latentDimensions.map((d) => (
              <div key={d.dimId} className="p-2 bg-[var(--campo)] border border-[var(--sep)] rounded">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px]">{d.latentKey}</span>
                  <span className="font-mono text-[10px] text-[var(--texto-tenue)]">P{d.percentile.toFixed(0)}</span>
                </div>
                <div className="font-mono text-sm font-bold mt-0.5 text-[var(--accion)]">
                  {d.rawValue.toFixed(4)}
                </div>
                <div className="text-[10px] text-[var(--texto-sec)] truncate">{d.bracket}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--texto-tenue)] mt-2">
            Nota MOD-03 / D-03: Dimensiones continuas matemáticas sin etiqueta diagnóstica automática ni clasificación GMM.
          </p>
        </div>
      )}

      {/* Barra de acción */}
      <div className="p-4 bg-[var(--panel)] border border-[var(--sep-claro)] rounded flex flex-wrap items-center justify-between gap-3 sticky bottom-4 shadow-sm">
        <div className="flex items-center gap-2">
          {roleConfig.escribe ? (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="sisap-btn-sec text-xs py-2 px-3 inline-flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[var(--advertencia)]" />
                <span>Guardar borrador</span>
              </button>
              <button
                type="button"
                onClick={handleSaveFinal}
                disabled={!d06Validation.valido}
                className="sisap-btn text-xs py-2 px-3 inline-flex items-center gap-1.5 font-semibold disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Registrar evaluación e inferencia 12D</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-[var(--texto-tenue)] font-mono">
              [Modo solo lectura: rol {currentUser.rol}]
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--texto-tenue)] font-mono">Expediente: {selectedPseudonym}</span>
      </div>

      <ClinicalReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        pseudonym={selectedPseudonym}
        currentUser={currentUser}
      />
    </div>
  );
};
