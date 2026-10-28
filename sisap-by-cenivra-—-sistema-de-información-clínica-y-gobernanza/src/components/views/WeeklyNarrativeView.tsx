import React, { useState, useEffect } from 'react';
import { RoleConfig, UserAccount, WeeklyNarrative } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  BookOpen,
  Save,
  Clock,
  CheckCircle,
  Sparkles,
  Info,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export type InferenceStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface NarracionInferenciaSalida {
  id: string;
  pacientePseudonimo: string;
  semana: number;
  fechaProcesamiento: string;
  estado: InferenceStatus;
  error?: {
    codigo: string;
    mensaje: string;
    tipo: 'carga_modelo' | 'preprocesamiento' | 'inferencia' | 'validacion_entrada';
  };
  salidasPorCabeza?: Record<string, {
    tipo: string;
    dimensionalidad: number;
    valores: number[] | Record<string, number>;
    significado: string;
    valido: boolean;
  }>;
  trazabilidad: {
    versionModelo: string;
    versionPreprocesamiento: string;
    hashEntrada: string;
    timestamp: string;
  };
}

interface WeeklyNarrativeViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
}

export const WeeklyNarrativeView: React.FC<WeeklyNarrativeViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
}) => {
  const [history, setHistory] = useState<WeeklyNarrative[]>(
    StorageService.getWeeklyNarratives(selectedPseudonym)
  );

  const nextWeek = history.length > 0 ? Math.max(...history.map((n) => n.semana)) + 1 : 1;

  const [formData, setFormData] = useState({
    semana: nextWeek,
    fecha_entrega: new Date().toISOString().split('T')[0],
    q1_descripcion: '',
    q2_desafios: '',
    q3_estrategias: '',
    q4_emociones: '',
    q5_progresos: '',
    q6_reflexiones: '',
    q7_metas: '',
    q8_comentarios: '',
  });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Motor de narraciones semanales (Motor A — DCSA ae_multihead)
  const [inferenceStatus, setInferenceStatus] = useState<InferenceStatus>('idle');
  const [inferenceResult, setInferenceResult] = useState<NarracionInferenciaSalida | null>(null);
  const [inferenceError, setInferenceError] = useState<{ codigo: string; mensaje: string; tipo: string } | null>(null);

  useEffect(() => {
    setHistory(StorageService.getWeeklyNarratives(selectedPseudonym));
  }, [selectedPseudonym]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFillDemo = () => {
    setFormData({
      ...formData,
      q1_descripcion: 'Esta semana me sentí más activo en el taller matutino y logré mantener mi rutina de sueño sin despertarme angustiado a las 3 am.',
      q2_desafios: 'El miércoles recibí una noticia que me preocupó sobre un trámite y sentí una oleada de tensión en el pecho y pensamientos de que no valía la pena el esfuerzo.',
      q3_estrategias: 'Apliqué la técnica de los 5 sentidos que me enseñó la psicóloga y salí al patio a caminar en lugar de encerrarme en la habitación. Me ayudó a que la intensidad bajara.',
      q4_emociones: 'Predominó la frustración al principio de la semana, pero después de hablar en el grupo sentí alivio y tranquilidad.',
      q5_progresos: 'Logré decir "no" cuando me ofrecieron una cerveza en una reunión virtual familiar sin sentir vergüenza de explicar que estoy en abstinencia.',
      q6_reflexiones: 'Me di cuenta de que antes consumía por miedo al conflicto con los demás y no por el efecto de la sustancia en sí.',
      q7_metas: 'Quiero trabajar en la comunicación con mi hermano y no tomarme las cosas de forma tan personal.',
      q8_comentarios: 'Agradezco el espacio de escucha en las sesiones grupales de los viernes.',
    });
  };

  const handleSaveDraft = () => {
    StorageService.saveDraft({
      formulario: `Narración Semanal #${formData.semana}`,
      screen: 'narracion',
      pre: 'nar',
      paciente: selectedPseudonym,
      datos: {
        semana: formData.semana.toString(),
        fecha_entrega: formData.fecha_entrega,
        q1: formData.q1_descripcion,
        q2: formData.q2_desafios,
        q3: formData.q3_estrategias,
        q4: formData.q4_emociones,
        q5: formData.q5_progresos,
        q6: formData.q6_reflexiones,
        q7: formData.q7_metas,
        q8: formData.q8_comentarios,
      },
    });

    setSaveStatus(`Borrador guardado a las ${new Date().toLocaleTimeString('es-MX')}`);
    if (onDraftSaved) onDraftSaved();
  };

  // Adaptador de inferencia del motor de narraciones (Motor A — DCSA ae_multihead)
  // Frontera estable para invocar el motor cuando estén disponibles los artefactos serializados.
  // Actualmente devuelve estado 'failed' con mensaje informativo, sin presentar resultados ficticios.
  const ejecutarInferenciaNarracion = async () => {
    if (!formData.q1_descripcion.trim()) {
      setInferenceError({
        codigo: 'ENTRADA_VACIA',
        mensaje: 'Debe capturar al menos la descripción de la semana (q1) antes de ejecutar el análisis.',
        tipo: 'validacion_entrada',
      });
      setInferenceStatus('failed');
      return;
    }

    setInferenceStatus('pending');
    setInferenceError(null);
    setInferenceResult(null);

    try {
      setInferenceStatus('processing');

      // Simulación de carga de modelo DCSA (pendiente de artefactos serializados reales)
      // No se conecta a encoder.h5 ni a autoencoder_completo.h5 de shiny_app.
      // No se intenta cargar modelo de Python directamente en TypeScript.
      await new Promise((resolve) => setTimeout(resolve, 800));

      const textoCompleto = Object.values(formData)
        .filter((v): v is string => typeof v === 'string')
        .join(' ');

      // Hash de entrada para trazabilidad (sin revelar contenido)
      const hashEntrada = await crypto.subtle
        .digest('SHA-256', new TextEncoder().encode(textoCompleto))
        .then((buf) => Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''));

      // Estado actual: modelo DCSA no disponible para inferencia nueva.
      // Solo existen latentes pre-computadas en ae_multihead/, no pesos serializados.
      const resultado: NarracionInferenciaSalida = {
        id: `nar-inf-${Date.now()}`,
        pacientePseudonimo: selectedPseudonym,
        semana: formData.semana,
        fechaProcesamiento: new Date().toISOString(),
        estado: 'failed',
        error: {
          codigo: 'MODELO_NO_DISPONIBLE',
          mensaje: 'El motor de narraciones (DCSA ae_multihead) no tiene pesos serializados disponibles para inferencia nueva. Solo existen latentes pre-computadas. Pendiente de entrega de artefactos de modelo.',
          tipo: 'carga_modelo',
        },
        trazabilidad: {
          versionModelo: 'pendiente',
          versionPreprocesamiento: '1.0.0',
          hashEntrada,
          timestamp: new Date().toISOString(),
        },
      };

      setInferenceResult(resultado);
      setInferenceStatus('failed');

      // Registro de auditoría del intento de inferencia
      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Intento de inferencia de narración semanal (Motor A)',
        exp: selectedPseudonym,
        detalles: `Semana #${formData.semana} — estado: fallido (modelo no disponible). Hash de entrada: ${hashEntrada.substring(0, 16)}...`,
      });

    } catch (err: any) {
      setInferenceStatus('failed');
      setInferenceError({
        codigo: 'ERROR_INESPERADO',
        mensaje: err?.message || 'Error inesperado durante la inferencia de narración.',
        tipo: 'inferencia',
      });

      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Error de inferencia de narración semanal (Motor A)',
        exp: selectedPseudonym,
        detalles: `Semana #${formData.semana} — ${err?.message || 'error desconocido'}`,
      });
    }
  };

  const handleSaveFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.q1_descripcion.trim()) {
      alert('Por favor capture al menos la descripción general de la semana.');
      return;
    }

    const narrative: WeeklyNarrative = {
      id: `nar-${Date.now()}`,
      expediente: selectedPseudonym,
      semana: formData.semana,
      fecha_entrega: formData.fecha_entrega,
      q1_descripcion: formData.q1_descripcion,
      q2_desafios: formData.q2_desafios,
      q3_estrategias: formData.q3_estrategias,
      q4_emociones: formData.q4_emociones,
      q5_progresos: formData.q5_progresos,
      q6_reflexiones: formData.q6_reflexiones,
      q7_metas: formData.q7_metas,
      q8_comentarios: formData.q8_comentarios,
      creado_en: new Date().toLocaleString('es-MX'),
    };

    StorageService.saveWeeklyNarrative(narrative);

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Registro de Narración Semanal V1.0',
      exp: selectedPseudonym,
      detalles: `Semana #${formData.semana} guardada en el corpus cualitativo.`,
    });

    setHistory(StorageService.getWeeklyNarratives(selectedPseudonym));
    setSaveStatus('Narración guardada exitosamente');
    alert(`Narración semanal #${formData.semana} registrada para ${selectedPseudonym}.`);

    setFormData((prev) => ({
      ...prev,
      semana: prev.semana + 1,
      q1_descripcion: '',
      q2_desafios: '',
      q3_estrategias: '',
      q4_emociones: '',
      q5_progresos: '',
      q6_reflexiones: '',
      q7_metas: '',
      q8_comentarios: '',
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Narración Semanal · Guía V1.0 (8 Preguntas Abiertas)
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Instrumento cualitativo validado para análisis de cambio y auto-observación del paciente
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillDemo}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5 text-[var(--accion)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ejemplo de Narración</span>
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
            <span className="text-[var(--texto-sec)] mr-1">Instrumento:</span>
            <span className="font-medium text-[var(--texto)]">Guía Canónica V1.0 (8 ítems)</span>
          </div>
        </div>
        {saveStatus && (
          <span className="text-[var(--normal)] font-mono text-[11px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {saveStatus}
          </span>
        )}
      </div>

      {/* V1 vs V2 Methodology Note */}
      <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--texto)]">
          <Info className="w-4 h-4 text-[var(--accion)]" />
          <span>Fidelidad Metodológica de la Investigación:</span>
        </div>
        <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
          Esta pantalla implementa exclusivamente la versión <b>V1.0</b> (las 8 preguntas abiertas) utilizada en los análisis empíricos publicados y en el corpus canónico. Se transcribe textualmente lo que la persona escribió, sin correcciones ortográficas forzadas ni reinterpretaciones del profesional.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveFinal} className="space-y-4">
        <div className="sisap-captura">
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Semana del Tratamiento *</label>
              <input
                type="number"
                required
                value={formData.semana}
                onChange={(e) => handleChange('semana', parseInt(e.target.value, 10) || 1)}
                className="sisap-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Fecha de Entrega *</label>
              <input
                type="date"
                required
                value={formData.fecha_entrega}
                onChange={(e) => handleChange('fecha_entrega', e.target.value)}
                className="sisap-input font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                1. Descripción de la semana — ¿Cómo ha sido tu semana? ¿Hubo algún evento o cambio significativo? *
              </label>
              <textarea
                required
                rows={3}
                value={formData.q1_descripcion}
                onChange={(e) => handleChange('q1_descripcion', e.target.value)}
                placeholder="Escriba la respuesta del paciente..."
                className="sisap-textarea text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                2. Desafíos encontrados — ¿Qué dificultades o situaciones de riesgo has enfrentado?
              </label>
              <textarea
                rows={3}
                value={formData.q2_desafios}
                onChange={(e) => handleChange('q2_desafios', e.target.value)}
                placeholder="Escriba la respuesta del paciente..."
                className="sisap-textarea text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                3. Estrategias de afrontamiento — ¿Qué técnicas utilizaste? ¿Funcionaron? ¿Por qué?
              </label>
              <textarea
                rows={3}
                value={formData.q3_estrategias}
                onChange={(e) => handleChange('q3_estrategias', e.target.value)}
                placeholder="Escriba la respuesta del paciente..."
                className="sisap-textarea text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                4. Emociones experimentadas — ¿Qué emociones predominaron y cómo las manejaste?
              </label>
              <textarea
                rows={3}
                value={formData.q4_emociones}
                onChange={(e) => handleChange('q4_emociones', e.target.value)}
                placeholder="Escriba la respuesta del paciente..."
                className="sisap-textarea text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                5. Progresos y logros — ¿Qué avances o triunfos personales notas esta semana?
              </label>
              <textarea
                rows={3}
                value={formData.q5_progresos}
                onChange={(e) => handleChange('q5_progresos', e.target.value)}
                placeholder="Escriba la respuesta del paciente..."
                className="sisap-textarea text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                6. Reflexiones personales — ¿Has notado cambios en tu actitud, valores o perspectiva?
              </label>
              <textarea
                rows={3}
                value={formData.q6_reflexiones}
                onChange={(e) => handleChange('q6_reflexiones', e.target.value)}
                placeholder="Escriba la respuesta del paciente..."
                className="sisap-textarea text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                7. Metas para la próxima semana — ¿En qué objetivos te gustaría trabajar?
              </label>
              <textarea
                rows={2}
                value={formData.q7_metas}
                onChange={(e) => handleChange('q7_metas', e.target.value)}
                placeholder="Escriba la respuesta del paciente..."
                className="sisap-textarea text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                8. Comentarios adicionales — Cualquier información que desees agregar:
              </label>
              <textarea
                rows={2}
                value={formData.q8_comentarios}
                onChange={(e) => handleChange('q8_comentarios', e.target.value)}
                placeholder="Comentarios adicionales..."
                className="sisap-textarea text-xs"
              />
            </div>
          </div>
        </div>

        {/* Action bar */}
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
                  onClick={ejecutarInferenciaNarracion}
                  disabled={inferenceStatus === 'processing'}
                  className={`sisap-btn-sec text-xs py-2 px-3 inline-flex items-center gap-1.5 ${inferenceStatus === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {inferenceStatus === 'processing' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{inferenceStatus === 'processing' ? 'Procesando...' : 'Ejecutar Análisis de Narración'}</span>
                </button>
                <button
                  type="submit"
                  className="sisap-btn text-xs py-2 px-3 inline-flex items-center gap-1.5 font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Registrar Narración Semanal</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-[var(--texto-tenue)] font-mono">
                [Modo solo lectura: rol {currentUser.rol}]
              </span>
            )}
          </div>

          {/* Estado de inferencia */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono">
              {inferenceStatus === 'idle' ? 'Inferencia: listo' :
                inferenceStatus === 'pending' ? 'Inferencia: en cola' :
                inferenceStatus === 'processing' ? 'Inferencia: procesando' :
                inferenceStatus === 'completed' ? 'Inferencia: completada' :
                'Inferencia: fallida'}
            </span>
          </div>
        </div>
      </form>

      {/* Panel de resultados de inferencia (Motor A — DCSA ae_multihead) */}
      {(inferenceStatus === 'completed' || inferenceStatus === 'failed') && inferenceResult && (
        <div className="sisap-tarjeta mt-6 border-l-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--sep-claro)]">
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${inferenceStatus === 'completed' ? 'text-[var(--normal)]' : 'text-[var(--riesgo)]'}`} />
              <h3 className="text-sm font-bold text-[var(--texto)]">
                Resultado de Análisis de Narración Semanal
              </h3>
            </div>
            <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${inferenceStatus === 'completed' ? 'text-[var(--normal)] border-[var(--normal)]/40 bg-[var(--normal)]/10' : 'text-[var(--riesgo)] border-[var(--riesgo)]/40 bg-[var(--riesgo)]/10'}`}>
              {inferenceStatus === 'completed' ? 'COMPLETADO' : 'FALLIDO'}
            </span>
          </div>

          {inferenceStatus === 'failed' && inferenceResult.error && (
            <div className="p-3 bg-[var(--riesgo)]/10 border border-[var(--riesgo)]/40 rounded text-xs space-y-2">
              <div className="flex items-center gap-1 font-bold text-[var(--riesgo)]">
                <AlertCircle className="w-3 h-3" />
                <span>Error de inferencia — no se presentan resultados clínicos</span>
              </div>
              <p className="text-[var(--texto-sec)]">{inferenceResult.error.mensaje}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-[var(--texto-tenue)]">Código: {inferenceResult.error.codigo}</span>
                <span className="font-mono text-[9px] text-[var(--texto-tenue)]">Tipo: {inferenceResult.error.tipo}</span>
              </div>
              <p className="text-[9px] text-[var(--texto-tenue)] italic">
                Los resultados de este análisis no están disponibles y no deben interpretarse como inferencia clínica.
              </p>
            </div>
          )}

          {inferenceStatus === 'completed' && inferenceResult.salidasPorCabeza && (
            <div className="space-y-3 text-xs">
              <h4 className="font-semibold text-[var(--texto-sec)] uppercase tracking-wider">Salidas por cabeza</h4>
              {Object.entries(inferenceResult.salidasPorCabeza).map(([nombre, salida]) => (
                <div key={nombre} className="p-2 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-1">
                  <div className="flex justify-between">
                    <span className="font-mono font-bold text-[var(--texto)]">{nombre}</span>
                    <span className={`font-mono text-[9px] ${salida.valido ? 'text-[var(--normal)]' : 'text-[var(--advertencia)]'}`}>
                      {salida.valido ? 'Válido' : 'No válido'}
                    </span>
                  </div>
                  <p className="text-[var(--texto-sec)]">{salida.significado}</p>
                  <span className="font-mono text-[9px] text-[var(--texto-tenue)]">Dimensión: {salida.dimensionalidad}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 p-2 bg-[var(--panel)] border border-[var(--sep-claro)] rounded text-[9px] text-[var(--texto-tenue)]">
            <div>Paciente: <span className="font-mono">{inferenceResult.pacientePseudonimo}</span></div>
            <div>Semana: <span className="font-mono">{inferenceResult.semana}</span></div>
            <div>Versión modelo: <span className="font-mono">{inferenceResult.trazabilidad.versionModelo}</span></div>
            <div>Versión preprocesamiento: <span className="font-mono">{inferenceResult.trazabilidad.versionPreprocesamiento}</span></div>
            <div>Hash de entrada: <span className="font-mono">{inferenceResult.trazabilidad.hashEntrada.substring(0, 16)}...</span></div>
            <div>Timestamp: <span className="font-mono">{inferenceResult.trazabilidad.timestamp}</span></div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="sisap-tarjeta mt-6">
        <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--sep-claro)]">
          Historial de Narraciones Semanales ({history.length})
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-6 text-xs text-[var(--texto-tenue)]">
            No se han registrado narraciones para este expediente aún.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="p-4 rounded bg-[var(--campo)] border border-[var(--sep)] text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sep-claro)] pb-2">
                  <span className="font-bold text-sm text-[var(--texto)]">
                    Semana #{item.semana}
                  </span>
                  <span className="text-[11px] text-[var(--texto-tenue)] font-mono">
                    Entregado el: {item.fecha_entrega}
                  </span>
                </div>
                <div>
                  <b className="text-[var(--texto)]">1. Descripción de la semana:</b>
                  <p className="text-[var(--texto-sec)] mt-0.5">{item.q1_descripcion}</p>
                </div>
                <div>
                  <b className="text-[var(--texto)]">2. Desafíos:</b>
                  <p className="text-[var(--texto-sec)] mt-0.5">{item.q2_desafios}</p>
                </div>
                <div>
                  <b className="text-[var(--texto)]">3. Estrategias:</b>
                  <p className="text-[var(--texto-sec)] mt-0.5">{item.q3_estrategias}</p>
                </div>
                <div>
                  <b className="text-[var(--texto)]">5. Progresos y logros:</b>
                  <p className="text-[var(--texto-sec)] mt-0.5">{item.q5_progresos}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
