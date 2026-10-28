import React, { useState, useEffect } from 'react';
import { InitialEvaluationData, RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  parseRawNumbers,
  computeBis11,
  computeBsl23,
  computeGad7,
  computeStaxi2,
  computeBads,
  computeEros,
  assemble24Vector,
} from '../../services/scalesEngine';
import { COLUMNAS_MODELO, INSTRUMENTOS_CATALOGO } from '../../constants/clinicalConstants';
import {
  Activity,
  Calculator,
  Save,
  CheckCircle,
  Sparkles,
  Info,
  Clock,
  Cpu,
  Layers,
  Zap,
  BarChart3,
  TrendingUp,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { AutoencoderEngine, AutoencoderInferenceResult } from '../../services/autoencoderEngine';
import { LatentRadarChart } from '../LatentRadarChart';
import { ClinicalReportModal } from '../ClinicalReportModal';

interface InitialEvaluationViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
}

export const InitialEvaluationView: React.FC<InitialEvaluationViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
}) => {
  const [aplico, setAplico] = useState<string>(currentUser.nombre || currentUser.u);
  const [fechaEval, setFechaEval] = useState<string>(new Date().toISOString().split('T')[0]);

  // Raw inputs for the 6 scales
  const [rawBis11, setRawBis11] = useState<string>('');
  const [rawBsl23, setRawBsl23] = useState<string>('');
  const [rawGad7, setRawGad7] = useState<string>('');
  const [rawStaxi2, setRawStaxi2] = useState<string>('');
  const [rawBads, setRawBads] = useState<string>('');
  const [rawEros, setRawEros] = useState<string>('');

  // Demographics
  const [edad, setEdad] = useState<number>(38);
  const [tiempoConsumo, setTiempoConsumo] = useState<number>(7);
  const [tratamientosPrevios, setTratamientosPrevios] = useState<number>(2);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const getRawItemsCount = (input: string): number => {
    if (!input || !input.trim()) return 0;
    return input.trim().replace(/[,;\t\-]/g, ' ').split(/\s+/).filter((s) => !isNaN(parseFloat(s))).length;
  };

  // Restore draft if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.aplico) setAplico(initialData.aplico);
      if (initialData.fecha_eval) setFechaEval(initialData.fecha_eval);
      if (initialData.raw_bis_11) setRawBis11(initialData.raw_bis_11);
      if (initialData.raw_bsl_23) setRawBsl23(initialData.raw_bsl_23);
      if (initialData.raw_gad_7) setRawGad7(initialData.raw_gad_7);
      if (initialData.raw_staxi_2) setRawStaxi2(initialData.raw_staxi_2);
      if (initialData.raw_bads) setRawBads(initialData.raw_bads);
      if (initialData.raw_eros) setRawEros(initialData.raw_eros);
      if (initialData.edad) setEdad(parseInt(initialData.edad, 10));
      if (initialData.tiempo_consumo) setTiempoConsumo(parseInt(initialData.tiempo_consumo, 10));
      if (initialData.trat_previos) setTratamientosPrevios(parseInt(initialData.trat_previos, 10));
    }
  }, [initialData]);

  // Item count helpers
  const bisCount = getRawItemsCount(rawBis11);
  const bslCount = getRawItemsCount(rawBsl23);
  const gadCount = getRawItemsCount(rawGad7);
  const staxiCount = getRawItemsCount(rawStaxi2);
  const badsCount = getRawItemsCount(rawBads);
  const erosCount = getRawItemsCount(rawEros);

  // Calculations
  const bisCalculated = computeBis11(parseRawNumbers(rawBis11, 30, 2));
  const bslCalculated = computeBsl23(parseRawNumbers(rawBsl23, 23, 1));
  const gadCalculated = computeGad7(parseRawNumbers(rawGad7, 7, 1));
  const staxiCalculated = computeStaxi2(parseRawNumbers(rawStaxi2, 44, 2));
  const badsCalculated = computeBads(parseRawNumbers(rawBads, 25, 3));
  const erosTotal = computeEros(parseRawNumbers(rawEros, 10, 4));

  const vector24 = assemble24Vector({
    bis: bisCalculated,
    staxi: staxiCalculated,
    bsl: bslCalculated,
    gad: gadCalculated,
    bads: badsCalculated,
    edad,
    tiempoConsumoAnios: tiempoConsumo,
    tratamientosPrevios,
  });

  // Autoencoder de escalas iniciales: PENDIENTE DE INTEGRACIÓN
  // No se ejecuta runTransversalInference() como motor clínico definitivo.
  // El vector canónico se calcula y muestra, pero no se conecta al autoencoder.
  // Pesos en ENCODER_PROJECTION_WEIGHTS no se usan para inferencia clínica.
  // Pendiente de autorización para activar como motor definitivo.
  const autoencoderInference = undefined;

  const handleFillDemoValues = () => {
    // Standard clinical sample values for a residential patient
    const demoBis = '3 2 4 3 2 1 4 2 3 4 3 2 4 3 2 3 4 2 3 2 4 3 2 4 3 2 3 4 2 3';
    const demoBsl = '2 3 1 2 4 3 2 1 2 3 4 2 1 3 2 2 3 4 1 2 3 2 1';
    const demoGad = '2 3 2 3 1 2 2';
    const demoStaxi = Array(44)
      .fill(0)
      .map((_, i) => (i % 3) + 1)
      .join(' ');
    const demoBads = Array(25)
      .fill(0)
      .map((_, i) => ((i * 2) % 6) + 1)
      .join(' ');
    const demoEros = '4 5 3 6 4 5 3 4 5 4';

    setRawBis11(demoBis);
    setRawBsl23(demoBsl);
    setRawGad7(demoGad);
    setRawStaxi2(demoStaxi);
    setRawBads(demoBads);
    setRawEros(demoEros);
    setEdad(43);
    setTiempoConsumo(8);
    setTratamientosPrevios(2);
  };

  const handleSaveDraft = () => {
    const data: Record<string, string> = {
      aplico,
      fecha_eval: fechaEval,
      raw_bis_11: rawBis11,
      raw_bsl_23: rawBsl23,
      raw_gad_7: rawGad7,
      raw_staxi_2: rawStaxi2,
      raw_bads: rawBads,
      raw_eros: rawEros,
      edad: edad.toString(),
      tiempo_consumo: tiempoConsumo.toString(),
      trat_previos: tratamientosPrevios.toString(),
    };

    StorageService.saveDraft({
      formulario: 'Evaluación Inicial (6 escalas)',
      screen: 'eval_inicial',
      pre: 'ei',
      paciente: selectedPseudonym,
      datos: data,
    });

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Guardado de borrador de Evaluación Inicial',
      exp: selectedPseudonym,
      detalles: 'Escalas psicométricas en proceso de captura.',
    });

    setSaveStatus(`Borrador guardado a las ${new Date().toLocaleTimeString('es-MX')}`);
    if (onDraftSaved) onDraftSaved();
  };

  const handleSaveFinal = () => {
    if (!rawBis11.trim() && !rawGad7.trim()) {
      alert('Por favor ingrese al menos las respuestas de BIS-11 y GAD-7 para registrar la evaluación.');
      return;
    }

    const id = `eval-${Date.now()}`;
    const evaluationRecord: InitialEvaluationData = {
      id,
      expediente: selectedPseudonym,
      fecha_eval: fechaEval,
      aplico,
      raw_bis_11: rawBis11,
      raw_bsl_23: rawBsl23,
      raw_gad_7: rawGad7,
      raw_staxi_2: rawStaxi2,
      raw_bads: rawBads,
      raw_eros: rawEros,
      edad,
      tiempo_consumo_anios: tiempoConsumo,
      tratamientos_previos_cuenta: tratamientosPrevios,
      calculados: {
        bis_motor: bisCalculated.motor,
        bis_nonplanning: bisCalculated.nonplanning,
        bis_cognitive_instability: bisCalculated.cognitive_instability,
        bis_perseverance: bisCalculated.perseverance,
        bis_motor_impulsivity: bisCalculated.motor_impulsivity,
        bis_total: bisCalculated.total,
        bsl_general: bslCalculated.general,
        bsl_total_integrado: bslCalculated.total_integrado,
        gad_total: gadCalculated.total,
        gad_zscore: gadCalculated.zscore,
        gad_severidad: gadCalculated.severidad,
        staxi_state: staxiCalculated.state,
        staxi_trait: staxiCalculated.trait,
        staxi_temperamento: staxiCalculated.temperamento,
        bads_activation: badsCalculated.activation,
        bads_avoidance: badsCalculated.avoidance,
        bads_work: badsCalculated.work,
        bads_social: badsCalculated.social,
        eros_total: erosTotal,
      },
      vector24,
      latentes_autoencoder: autoencoderInference,
      creado_en: new Date().toLocaleString('es-MX'),
    };

    StorageService.saveEvaluation(evaluationRecord);

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Cálculo y registro de evaluación inicial',
      exp: selectedPseudonym,
      detalles: `BIS-11 total: ${bisCalculated.total}, GAD-7 total: ${gadCalculated.total} (${gadCalculated.severidad}), BSL-23: ${bslCalculated.general}`,
    });

    alert(`Evaluación inicial y vector canónico de 24 columnas registrados para ${selectedPseudonym}.`);
    setSaveStatus(`Registrado formalmente a las ${new Date().toLocaleTimeString('es-MX')}`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Evaluación Inicial · Las 6 Escalas Base del Autoencoder
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Captura de reactivos en bruto · Derivación algorítmica de subescalas y ensamblado del vector de 24 columnas
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5"
            title="Ver Dictamen Clínico e Imprimir PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--accion)]" />
            <span>Dictamen / Imprimir PDF</span>
          </button>
          <button
            type="button"
            onClick={handleFillDemoValues}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5 text-[var(--accion)]"
            title="Cargar reactivos de prueba para las 6 escalas"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cargar Valores de Prueba</span>
          </button>
        </div>
      </div>

      {/* Target patient banner */}
      <div className="p-3 bg-[var(--panel)] border border-[var(--sep-claro)] rounded flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[var(--texto-sec)] mr-1">Expediente:</span>
            <span className="font-mono font-bold text-[var(--accion)]">{selectedPseudonym}</span>
          </div>
          <div>
            <span className="text-[var(--texto-sec)] mr-1">Aplicó:</span>
            <span className="font-medium text-[var(--texto)]">{aplico}</span>
          </div>
          <div>
            <span className="text-[var(--texto-sec)] mr-1">Fecha:</span>
            <span className="font-mono">{fechaEval}</span>
          </div>
        </div>
        {saveStatus && (
          <span className="text-[var(--normal)] font-mono text-[11px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {saveStatus}
          </span>
        )}
      </div>

      {/* Methodology notice */}
      <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--texto)]">
          <Info className="w-4 h-4 text-[var(--accion)]" />
          <span>Principio de Automatización Psicométrica:</span>
        </div>
        <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
          El personal clínico captura exclusivamente las respuestas en bruto de cada reactivo (separadas por espacio o coma). El sistema se encarga de invertir reactivos inversos, calcular las sumatorias por subescala, computar Z-scores y estructurar el vector estandarizado para la investigación y el modelo.
        </p>
      </div>

      {/* Metadata and Demographics Form */}
      <div className="sisap-captura">
        <h3 className="text-sm font-semibold mb-2">Variables Sociodemográficas de Entrada al Modelo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Edad Actual (años) *</label>
            <input
              type="number"
              value={edad}
              onChange={(e) => setEdad(parseInt(e.target.value, 10) || 0)}
              className="sisap-input"
            />
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Tiempo de Consumo (años) *</label>
            <input
              type="number"
              value={tiempoConsumo}
              onChange={(e) => setTiempoConsumo(parseInt(e.target.value, 10) || 0)}
              className="sisap-input"
            />
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Tratamientos Previos (número) *</label>
            <input
              type="number"
              value={tratamientosPrevios}
              onChange={(e) => setTratamientosPrevios(parseInt(e.target.value, 10) || 0)}
              className="sisap-input"
            />
          </div>
          <div>
            <label className="block text-[var(--texto-sec)] mb-1">Fecha de Aplicación</label>
            <input
              type="date"
              value={fechaEval}
              onChange={(e) => setFechaEval(e.target.value)}
              className="sisap-input"
            />
          </div>
        </div>
      </div>

      {/* The 6 Scales Capture Section */}
      <div className="space-y-4">
        {/* Scale 1: BIS-11 */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--texto)]">
                  BIS-11 · Escala de Impulsividad de Barratt (30 reactivos)
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  bisCount === 30
                    ? 'bg-[var(--normal)]/20 text-[var(--normal)] border border-[var(--normal)]/40'
                    : bisCount > 0
                    ? 'bg-[var(--advertencia)]/20 text-[var(--advertencia)] border border-[var(--advertencia)]/40'
                    : 'bg-[var(--panel)] text-[var(--texto-tenue)]'
                }`}>
                  {bisCount === 30 ? '✓ 30/30 completados' : `${bisCount}/30 reactivos`}
                </span>
              </div>
              <div className="text-[11px] text-[var(--texto-tenue)]">
                Valores del 1 (Rara vez/Nunca) al 4 (Siempre). Reactivos inversos invertidos automáticamente.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="est-ok">Total: {bisCalculated.total} / 120</span>
              <span className="est-warn">Motora: {bisCalculated.motor}</span>
              <span className="est-warn">No-planeada: {bisCalculated.nonplanning}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawBis11}
            onChange={(e) => setRawBis11(e.target.value)}
            placeholder="Pegue los 30 reactivos separados por espacio (ej. 3 2 4 1 2 3...)"
            className="sisap-input font-mono text-xs mb-2"
          />
          <div className="text-[10.5px] text-[var(--texto-tenue)] font-mono flex flex-wrap gap-x-3 gap-y-1">
            <span>Subescalas derivadas:</span>
            <span>motor: <b>{bisCalculated.motor}</b></span>
            <span>nonplanning: <b>{bisCalculated.nonplanning}</b></span>
            <span>cognitive_instability: <b>{bisCalculated.cognitive_instability}</b></span>
            <span>perseverance: <b>{bisCalculated.perseverance}</b></span>
            <span>motor_impulsivity: <b>{bisCalculated.motor_impulsivity}</b></span>
          </div>
        </div>

        {/* Scale 2: BSL-23 */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--texto)]">
                  BSL-23 · Sintomatología Límite y Desregulación (23 reactivos)
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  bslCount === 23
                    ? 'bg-[var(--normal)]/20 text-[var(--normal)] border border-[var(--normal)]/40'
                    : bslCount > 0
                    ? 'bg-[var(--advertencia)]/20 text-[var(--advertencia)] border border-[var(--advertencia)]/40'
                    : 'bg-[var(--panel)] text-[var(--texto-tenue)]'
                }`}>
                  {bslCount === 23 ? '✓ 23/23 completados' : `${bslCount}/23 reactivos`}
                </span>
              </div>
              <div className="text-[11px] text-[var(--texto-tenue)]">
                Valores del 0 (Para nada) al 4 (Muy intensamente).
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="est-ok">Puntaje General: {bslCalculated.general}</span>
              <span className="est-pend">Total integrado: {bslCalculated.total_integrado}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawBsl23}
            onChange={(e) => setRawBsl23(e.target.value)}
            placeholder="Pegue los 23 reactivos separados por espacio (ej. 1 0 3 4 2 1...)"
            className="sisap-input font-mono text-xs mb-2"
          />
          <div className="text-[10.5px] text-[var(--texto-tenue)] font-mono">
            Subescalas derivadas: <code>BSL_23BSL_general: {bslCalculated.general}</code>, <code>BSL_23BSL_total_integrado: {bslCalculated.total_integrado}</code>
          </div>
        </div>

        {/* Scale 3: GAD-7 */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--texto)]">
                  GAD-7 · Ansiedad Generalizada (7 reactivos)
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  gadCount === 7
                    ? 'bg-[var(--normal)]/20 text-[var(--normal)] border border-[var(--normal)]/40'
                    : gadCount > 0
                    ? 'bg-[var(--advertencia)]/20 text-[var(--advertencia)] border border-[var(--advertencia)]/40'
                    : 'bg-[var(--panel)] text-[var(--texto-tenue)]'
                }`}>
                  {gadCount === 7 ? '✓ 7/7 completados' : `${gadCount}/7 reactivos`}
                </span>
              </div>
              <div className="text-[11px] text-[var(--texto-tenue)]">
                Valores del 0 (Para nada) al 3 (Casi todos los días).
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="est-ok">Total: {gadCalculated.total} / 21</span>
              <span className={gadCalculated.severidad === 'Severa' ? 'est-risk' : 'est-warn'}>
                {gadCalculated.severidad}
              </span>
              <span className="est-pend font-mono">Z: {gadCalculated.zscore}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawGad7}
            onChange={(e) => setRawGad7(e.target.value)}
            placeholder="Pegue los 7 reactivos separados por espacio (ej. 2 3 1 2 0 1 3)"
            className="sisap-input font-mono text-xs mb-2"
          />
          <div className="text-[10.5px] text-[var(--texto-tenue)] font-mono">
            Subescalas derivadas: <code>GAD_7GAD_zscore: {gadCalculated.zscore}</code>
          </div>
        </div>

        {/* Scale 4: STAXI-2 */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--texto)]">
                  STAXI-2 · Expresión de Ira y Temperamento (44 reactivos)
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  staxiCount === 44
                    ? 'bg-[var(--normal)]/20 text-[var(--normal)] border border-[var(--normal)]/40'
                    : staxiCount > 0
                    ? 'bg-[var(--advertencia)]/20 text-[var(--advertencia)] border border-[var(--advertencia)]/40'
                    : 'bg-[var(--panel)] text-[var(--texto-tenue)]'
                }`}>
                  {staxiCount === 44 ? '✓ 44/44 completados' : `${staxiCount}/44 reactivos`}
                </span>
              </div>
              <div className="text-[11px] text-[var(--texto-tenue)]">
                Valores del 1 (Casi nunca) al 4 (Casi siempre).
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="est-warn">Estado: {staxiCalculated.state}</span>
              <span className="est-warn">Rasgo: {staxiCalculated.trait}</span>
              <span className="est-pend">Temperamento: {staxiCalculated.temperamento}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawStaxi2}
            onChange={(e) => setRawStaxi2(e.target.value)}
            placeholder="Pegue los reactivos en bruto (ej. 2 1 3 4 2 1...)"
            className="sisap-input font-mono text-xs mb-2"
          />
          <div className="text-[10.5px] text-[var(--texto-tenue)] font-mono">
            Subescalas derivadas: <code>STAXI_state: {staxiCalculated.state}</code>, <code>STAXI_trait: {staxiCalculated.trait}</code>, <code>STAXI_temperamento: {staxiCalculated.temperamento}</code>
          </div>
        </div>

        {/* Scale 5: BADS */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--texto)]">
                  BADS · Activación Conductual y Evitación (25 reactivos)
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  badsCount === 25
                    ? 'bg-[var(--normal)]/20 text-[var(--normal)] border border-[var(--normal)]/40'
                    : badsCount > 0
                    ? 'bg-[var(--advertencia)]/20 text-[var(--advertencia)] border border-[var(--advertencia)]/40'
                    : 'bg-[var(--panel)] text-[var(--texto-tenue)]'
                }`}>
                  {badsCount === 25 ? '✓ 25/25 completados' : `${badsCount}/25 reactivos`}
                </span>
              </div>
              <div className="text-[11px] text-[var(--texto-tenue)]">
                Valores del 0 (Completamente en desacuerdo) al 6 (Totalmente de acuerdo).
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="est-ok">Activación: {badsCalculated.activation}</span>
              <span className="est-risk">Evitación: {badsCalculated.avoidance}</span>
            </div>
          </div>
          <input
            type="text"
            value={rawBads}
            onChange={(e) => setRawBads(e.target.value)}
            placeholder="Pegue los 25 reactivos (ej. 3 4 2 5 1 0 6...)"
            className="sisap-input font-mono text-xs mb-2"
          />
          <div className="text-[10.5px] text-[var(--texto-tenue)] font-mono flex gap-3">
            <span>activation: <b>{badsCalculated.activation}</b></span>
            <span>avoidance: <b>{badsCalculated.avoidance}</b></span>
            <span>work: <b>{badsCalculated.work}</b></span>
            <span>social: <b>{badsCalculated.social}</b></span>
          </div>
        </div>

        {/* Scale 6: EROS */}
        <div className="sisap-captura">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--texto)]">
                  EROS · Escala de Recompensa Ambiental (10 reactivos)
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  erosCount === 10
                    ? 'bg-[var(--normal)]/20 text-[var(--normal)] border border-[var(--normal)]/40'
                    : erosCount > 0
                    ? 'bg-[var(--advertencia)]/20 text-[var(--advertencia)] border border-[var(--advertencia)]/40'
                    : 'bg-[var(--panel)] text-[var(--texto-tenue)]'
                }`}>
                  {erosCount === 10 ? '✓ 10/10 completados' : `${erosCount}/10 reactivos`}
                </span>
              </div>
              <div className="text-[11px] text-[var(--texto-tenue)]">
                Valores del 1 (Totalmente en desacuerdo) al 7 (Totalmente de acuerdo).
              </div>
            </div>
            <span className="est-ok">Total EROS: {erosTotal} / 70</span>
          </div>
          <input
            type="text"
            value={rawEros}
            onChange={(e) => setRawEros(e.target.value)}
            placeholder="Pegue los 10 reactivos (ej. 5 4 6 5 4 3 6 5 4 5)"
            className="sisap-input font-mono text-xs"
          />
        </div>
      </div>

      {/* 24-Column Autoencoder Canonical Vector Preview */}
      <div className="sisap-tarjeta">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--sep-claro)]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accion)]" />
            <h3 className="text-sm font-bold text-[var(--texto)]">
              Vector Canónico de 24 Columnas (Entrada al Autoencoder)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[var(--normal)]">
            24 / 24 dimensiones resueltas
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {COLUMNAS_MODELO.map((colName) => {
              const val = vector24[colName] ?? 0;
              return (
                <div
                  key={colName}
                  className="p-2 bg-[var(--campo)] border border-[var(--sep)] rounded flex flex-col justify-between"
                >
                  <span className="font-mono text-[10px] text-[var(--texto-tenue)] truncate" title={colName}>
                    {colName}
                  </span>
                  <span className="text-sm font-bold font-mono text-[var(--accion)] mt-1">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Autoencoder de Escalas Iniciales — Pendiente de Integración */}
      <div className="sisap-captura border-2 border-[var(--advertencia)]/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--sep-claro)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[var(--advertencia)]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--texto)]">
                Análisis Latente de Escalas · Pendiente de Integración
              </h3>
              <div className="text-[11px] text-[var(--texto-tenue)]">
                El autoencoder de escalas iniciales no está conectado como motor clínico definitivo.
                El vector canónico de 24 columnas se calcula y muestra, pero no se ejecuta inferencia del modelo.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="est-warn font-mono text-[10px]">Motor: Desactivado</span>
            <span className="est-pend font-mono text-[10px]">Pendiente de autorización</span>
          </div>
        </div>

        <div className="p-3 bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/40 rounded text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[var(--advertencia)]">
            <AlertCircle className="w-4 h-4" />
            <span>Estado del motor de escalas</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[var(--texto-sec)] leading-relaxed">
            <li>El vector de 24 columnas se calcula correctamente desde las 6 escalas (BIS-11, BSL-23, GAD-7, STAXI-2, BADS, EROS) y variables sociodemográficas.</li>
            <li>La función <code>runTransversalInference()</code> de <code>autoencoderEngine.ts</code> permanece disponible en el código pero <b>no se ejecuta</b> como motor clínico definitivo.</li>
            <li>Los pesos en <code>ENCODER_PROJECTION_WEIGHTS</code> de <code>autoencoderData.ts</code> no se utilizan para inferencia clínica.</li>
            <li>Se requiere autorización explícita para activar el autoencoder de escalas como motor definitivo.</li>
            <li>Hasta entonces, los resultados mostrados son exclusivamente de scoring de escalas, no de inferencia del modelo latente.</li>
          </ul>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-[var(--panel)] border border-[var(--sep-claro)] rounded flex flex-wrap items-center justify-between gap-3 sticky bottom-8 shadow-lg">
        <div className="flex items-center gap-2">
          {roleConfig.escribe ? (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="sisap-btn-sec text-xs py-2 px-3 inline-flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[var(--advertencia)]" />
                <span>Guardar Borrador</span>
              </button>
              <button
                type="button"
                onClick={handleSaveFinal}
                className="sisap-btn text-xs py-2 px-3 inline-flex items-center gap-1.5 font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Registrar en Expediente {selectedPseudonym}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-[var(--texto-tenue)] font-mono">
              [Modo solo lectura: rol {currentUser.rol}]
            </span>
          )}
        </div>

        <span className="text-xs text-[var(--texto-tenue)] font-mono">
          Expediente: {selectedPseudonym}
        </span>
      </div>

      {/* Official Clinical Report Modal */}
      <ClinicalReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        pseudonym={selectedPseudonym}
        currentUser={currentUser}
      />
    </div>
  );
};
