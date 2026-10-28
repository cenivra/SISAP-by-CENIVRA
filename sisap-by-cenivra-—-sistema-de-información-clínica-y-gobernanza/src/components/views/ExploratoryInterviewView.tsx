import React, { useState, useEffect } from 'react';
import { RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  FileSpreadsheet,
  Save,
  CheckCircle,
  FileCheck,
  Eye,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';

interface ExploratoryInterviewViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
}

export const ExploratoryInterviewView: React.FC<ExploratoryInterviewViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(initialData || {});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxToggle = (key: string, option: string) => {
    const current = formData[key] ? formData[key].split(' | ') : [];
    const index = current.indexOf(option);
    let updated: string[];
    if (index >= 0) {
      updated = current.filter((x) => x !== option);
    } else {
      updated = [...current, option];
    }
    setFormData((prev) => ({ ...prev, [key]: updated.join(' | ') }));
  };

  const handleSaveDraft = () => {
    const keysCount = Object.keys(formData).filter((k) => formData[k] !== '').length;
    if (keysCount === 0) {
      alert('No hay campos completados para guardar como borrador.');
      return;
    }

    StorageService.saveDraft({
      formulario: 'Entrevista Exploratoria',
      screen: 'entrevista',
      pre: 'ent',
      paciente: selectedPseudonym,
      datos: formData,
    });

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Guardado de borrador de Entrevista',
      exp: selectedPseudonym,
      detalles: `${keysCount} campos almacenados en borrador local.`,
    });

    setSaveStatus(`Borrador guardado (${keysCount} campos) el ${new Date().toLocaleTimeString('es-MX')}`);
    if (onDraftSaved) onDraftSaved();
  };

  const handleSaveFinal = () => {
    const keysCount = Object.keys(formData).filter((k) => formData[k] !== '').length;
    if (keysCount < 5) {
      alert('Capture al menos los campos principales de motivo de consulta, sustancia y diagnóstico.');
      return;
    }

    const id = `ent-${Date.now()}`;
    StorageService.saveInterview({
      id,
      expediente: selectedPseudonym,
      fecha: new Date().toISOString().split('T')[0],
      capturado_por: currentUser.nombre || currentUser.u,
      datos: formData,
      creado_en: new Date().toLocaleString('es-MX'),
      actualizado_en: new Date().toLocaleString('es-MX'),
    });

    // Update patient clinical record with primary diagnosis if captured
    const pat = StorageService.getPatient(selectedPseudonym);
    if (pat) {
      if (formData.dx_codigo) pat.diagnostico_cie = formData.dx_codigo;
      if (formData.dx_texto) pat.diagnostico_impresion = formData.dx_texto;
      if (formData.droga_impacto) pat.droga_impacto = formData.droga_impacto;
      pat.ultima_actualizacion = new Date().toLocaleString('es-MX');
      StorageService.savePatient(pat);
    }

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Entrevista exploratoria registrada formalmente',
      exp: selectedPseudonym,
      detalles: `Diagnóstico: ${formData.dx_codigo || 'CIE'} - ${formData.dx_texto || 'Impresión clínica'}.`,
    });

    alert(`Entrevista exploratoria registrada exitosamente en el expediente ${selectedPseudonym}.`);
    setSaveStatus(`Registrado formalmente el ${new Date().toLocaleTimeString('es-MX')}`);
  };

  const handleFillDemo = () => {
    const demo = {
      rig_conductual: 'Alto',
      rig_emocional: 'Alto',
      rig_cognitivo: 'Medio',
      rig_interpersonal: 'Alto',
      rig_identitario: 'Medio',
      patron_rigido: 'Regulación emocional',
      motivo: 'Refiere: "Ya no puedo controlar las ganas de consumir después del trabajo cuando me siento abrumado."',
      precipitante: 'Discusión fuerte con cónyuge y despido laboral hace 3 semanas.',
      consecuencias: 'Salud | Familia | Pareja | Trabajo',
      escolaridad: 'Licenciatura',
      empleo: 'Desempleado',
      afectacion: 'Grave',
      sustancia_inicio: 'Alcohol a los 16 años',
      edad_inicio: '16',
      via: 'Fumada',
      frecuencia: 'Diaria',
      droga_impacto: 'Metanfetamina / Cristal',
      combinado: 'Alcohol al término del consumo estimulante',
      disparador: 'Estados de fatiga mental combinados con soledad en el departamento.',
      contexto: 'Tardes y noches al llegar a casa tras entrevistas o discusiones.',
      estados: 'Ansiedad anticipatoria elevada, sensación de vacío y culpa previa.',
      pensamientos: '"Solo una dosis para aguantar la noche", "mañana lo dejo".',
      conducta: 'Llamada al distribuidor, aislamiento en recámara y consumo repetitivo.',
      funcion: 'Regulación emocional',
      funcion2: 'Evitación',
      cons_inmediata: 'Alivio rápido de la tristeza y aumento transitorio de energía.',
      cons_tardia: 'Paranoia leve, agotamiento de 48 horas, reproches familiares.',
      bucle: 'Culpa intensa -> baja autoestima -> deseo de anestesia -> consumo.',
      craving: '8',
      frec_craving: '3-5',
      ola: 'A veces',
      bis_item1: 'Frecuentemente',
      bis_item2: 'Siempre',
      bis_item3: 'Frecuentemente',
      salud: 'Insomnio | Pérdida de peso | Dolores de cabeza',
      familia: 'Discusiones | Pérdida de confianza | Distanciamiento',
      pareja: 'Discusiones | Separación',
      sintoma1: 'Craving',
      sintoma2: 'Vacío',
      centralidad: 'La rumiación sobre el fracaso laboral activa el craving en 15 minutos.',
      intentos: '2',
      duracion: '1-4 semanas',
      dificultades: 'Síntomas de anhedonia marcada al segundo día sin estimulantes.',
      estrategias: 'Grupos de apoyo | Familia',
      hf_consumo: 'Sí, en primer grado',
      hf_tratamiento: 'Sí, con recaída',
      hf_influencia: 'Alta',
      trauma: 'Sí, adolescencia',
      trauma_descr: 'Violencia intrafamiliar severa y negligencia afectiva.',
      estres: '9',
      apoyo: 'Escaso',
      tp_tipo: 'Ambulatorio',
      tp_veces: '1',
      tp_resultado: 'Abandono',
      esp_tipo: 'Dejar de consumir | Recuperar familia | Entenderse a sí mismo',
      esp_duracion: '3-6 meses',
      esp_preocupa: 'Recaer',
      fam_involucrada: 'Parcialmente',
      fam_importancia: 'Central',
      hitop: 'Internalizante | Externalizante',
      rdoc: 'Valencia negativa | Valencia positiva | Sistemas cognitivos',
      sisaptus: 'Regulación afectiva | Motivación y recompensa | Interocepción y estrés',
      causal_vuln: 'Historia de trauma infantil, apego ansioso y desregulación afectiva.',
      causal_disp: 'Discusiones familiares, fatiga cognitiva y aislamiento.',
      causal_ampl: 'Falta de sueño e interpretaciones catastróficas del cansancio.',
      causal_mant: 'Evitación de conversaciones difíciles y consumo solitario.',
      causal_perp: 'Deterioro económico y desconfianza en su red vincular.',
      causal_prot: 'Deseo de reconexión con sus hijos y asistencia voluntaria.',
      temporal: 'Patrón de escalada en ciclos de 5 días con 2 días de colapso.',
      dx_codigo: '6C41.11 / F15.20',
      dx_texto: 'Trastorno por uso de estimulantes grave (metanfetamina) en contexto de desregulación afectiva y trauma complejo.',
      dx_pronostico: 'Favorable',
      dx_nota: 'Asentado por profesional tratante bajo criterios CIE-11.',
      plan: 'Fase residencial de 90 días con protocolo de regulación emocional, terapia dialéctico conductual y terapia familiar.',
      recomendaciones: 'Abstinencia total | Terapia individual | Terapia familiar | Valoración médica',
      proxima: '2026-10-22',
    };
    setFormData(demo);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Entrevista Exploratoria · Consulta de Primera Vez
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Instrumento de estratificación, análisis funcional, hipótesis ontológica de rigidez y modelo causal
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillDemo}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5 text-[var(--accion)]"
            title="Llenar con caso clínico de prueba"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ejemplo Clínico</span>
          </button>
          <button
            type="button"
            onClick={() => setShowJsonModal(true)}
            className="sisap-btn-sec text-xs py-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver JSON</span>
          </button>
        </div>
      </div>

      {/* Target patient banner */}
      <div className="p-3 bg-[var(--panel)] border border-[var(--sep-claro)] rounded flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--texto-sec)]">Expediente Asignado:</span>
          <span className="font-mono font-bold text-[var(--accion)]">{selectedPseudonym}</span>
        </div>
        {saveStatus && (
          <span className="text-[var(--normal)] font-mono text-[11px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {saveStatus}
          </span>
        )}
      </div>

      {/* Module 0: Rigidez por Dominio */}
      <div className="sisap-captura">
        <h3 className="text-sm font-bold text-[var(--texto)] mb-1">
          0. Rigidez por Dominio (Hipótesis Ontológica CENIVRA)
        </h3>
        <p className="text-xs text-[var(--texto-tenue)] mb-3">
          Evaluación de la pérdida de flexibilidad adaptativa previa y durante la consolidación de la adicción.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Conductual: ¿El repertorio se ha estrechado?
            </label>
            <select
              value={formData.rig_conductual || ''}
              onChange={(e) => handleChange('rig_conductual', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— sin registrar —</option>
              <option value="Bajo">Bajo (Variabilidad adaptativa conservada)</option>
              <option value="Medio">Medio (Restricción moderada)</option>
              <option value="Alto">Alto (Monopolio de actividades por consumo)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Emocional: ¿La respuesta afectiva es rígida?
            </label>
            <select
              value={formData.rig_emocional || ''}
              onChange={(e) => handleChange('rig_emocional', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— sin registrar —</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto (Afecto plano o reactividad estereotipada)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Cognitivo: ¿El pensamiento es repetitivo?
            </label>
            <select
              value={formData.rig_cognitivo || ''}
              onChange={(e) => handleChange('rig_cognitivo', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— sin registrar —</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto (Rumiación / Fusión cognitiva)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Interpersonal: ¿Vínculos estrechados?
            </label>
            <select
              value={formData.rig_interpersonal || ''}
              onChange={(e) => handleChange('rig_interpersonal', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— sin registrar —</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto (Aislamiento o red exclusiva de consumo)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Identitario: ¿El autoconcepto se ha fijado?
            </label>
            <select
              value={formData.rig_identitario || ''}
              onChange={(e) => handleChange('rig_identitario', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— sin registrar —</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto ("Soy adicto y no hay otra salida")</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Patrón Rígido Predominante
            </label>
            <select
              value={formData.patron_rigido || ''}
              onChange={(e) => handleChange('patron_rigido', e.target.value)}
              className="sisap-select text-xs font-semibold text-[var(--accion)]"
            >
              <option value="">— sin registrar —</option>
              <option value="Regulación emocional">Regulación emocional</option>
              <option value="Evitación">Evitación experiencial</option>
              <option value="Control cognitivo">Control cognitivo</option>
              <option value="Dependencia">Dependencia vincular</option>
              <option value="Sin predominio">Sin predominio claro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Module 1: Motivo de consulta */}
      <div className="sisap-captura">
        <h3 className="text-sm font-bold text-[var(--texto)] mb-1">1. Motivo de Consulta</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Motivo declarado por el usuario (Cita textual):
            </label>
            <textarea
              rows={2}
              value={formData.motivo || ''}
              onChange={(e) => handleChange('motivo', e.target.value)}
              placeholder='Refiere textualmente: "..."'
              className="sisap-textarea text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Evento Precipitante (Gatillo de la consulta):
            </label>
            <textarea
              rows={2}
              value={formData.precipitante || ''}
              onChange={(e) => handleChange('precipitante', e.target.value)}
              placeholder="¿Qué ocurrió en los últimos días que motivó el ingreso?"
              className="sisap-textarea text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Consecuencias más graves referidas:
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Salud', 'Familia', 'Pareja', 'Trabajo', 'Legal', 'Económica', 'Social', 'Ninguna'].map((opt) => {
                const checked = (formData.consecuencias || '').split(' | ').includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleCheckboxToggle('consecuencias', opt)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-[var(--accion-fondo)] text-white border-[var(--accion-fondo)]'
                        : 'bg-[var(--campo)] text-[var(--texto-sec)] border-[var(--borde)]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Module 2 & 3: Consumo y Análisis Funcional */}
      <div className="sisap-captura">
        <h3 className="text-sm font-bold text-[var(--texto)] mb-1">
          2 y 3. Patrón de Consumo y Análisis Funcional de la Conducta
        </h3>
        <p className="text-xs text-[var(--texto-tenue)] mb-3">
          Mapeo de la sustancia de impacto, frecuencia, vía y la triple relación de contingencia (Antecedente - Conducta - Consecuencia).
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">Droga de Impacto *</label>
            <input
              type="text"
              value={formData.droga_impacto || ''}
              onChange={(e) => handleChange('droga_impacto', e.target.value)}
              placeholder="Ej. Metanfetamina"
              className="sisap-input text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">Vía Principal</label>
            <select
              value={formData.via || ''}
              onChange={(e) => handleChange('via', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— Seleccionar —</option>
              <option value="Oral">Oral</option>
              <option value="Inhalada">Inhalada</option>
              <option value="Fumada">Fumada</option>
              <option value="Intranasal">Intranasal</option>
              <option value="Intravenosa">Intravenosa</option>
              <option value="Sublingual">Sublingual</option>
              <option value="Otra">Otra</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">Frecuencia</label>
            <select
              value={formData.frecuencia || ''}
              onChange={(e) => handleChange('frecuencia', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— Seleccionar —</option>
              <option value="Diaria">Diaria</option>
              <option value="2-3 por semana">2-3 por semana</option>
              <option value="Semanal">Semanal</option>
              <option value="Ocasional">Ocasional</option>
              <option value="Varias veces al día">Varias veces al día</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">Edad de Inicio</label>
            <input
              type="number"
              value={formData.edad_inicio || ''}
              onChange={(e) => handleChange('edad_inicio', e.target.value)}
              placeholder="Ej. 16"
              className="sisap-input text-xs"
            />
          </div>
        </div>

        {/* Functional Analysis Block */}
        <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3 mb-3">
          <div className="font-semibold text-xs text-[var(--accion)]">
            Análisis Funcional (Contingencias de Mantenimiento):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[var(--texto-sec)] mb-1">
                Disparadores / Estresores Discriminativos:
              </label>
              <textarea
                rows={2}
                value={formData.disparador || ''}
                onChange={(e) => handleChange('disparador', e.target.value)}
                placeholder="Estresores externos (discusiones, soledad, lugares, horas)..."
                className="sisap-textarea text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--texto-sec)] mb-1">
                Estados Internos y Pensamientos Automáticos:
              </label>
              <textarea
                rows={2}
                value={formData.pensamientos || ''}
                onChange={(e) => handleChange('pensamientos', e.target.value)}
                placeholder="Creencias de permiso: 'no pasa nada', 'lo merezco', etc."
                className="sisap-textarea text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[var(--texto-sec)] mb-1">
                Función Primaria del Consumo:
              </label>
              <select
                value={formData.funcion || ''}
                onChange={(e) => handleChange('funcion', e.target.value)}
                className="sisap-select text-xs"
              >
                <option value="">— sin registrar —</option>
                <option value="Regulación emocional">Regulación emocional (alivio de malestar)</option>
                <option value="Evitación">Evitación experiencial</option>
                <option value="Búsqueda de sensaciones">Búsqueda de sensaciones / Euforia</option>
                <option value="Pertenencia social">Pertenencia social</option>
                <option value="Automedicación">Automedicación (dolor/insomnio)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[var(--texto-sec)] mb-1">
                Consecuencia Inmediata (Reforzador + / -):
              </label>
              <input
                type="text"
                value={formData.cons_inmediata || ''}
                onChange={(e) => handleChange('cons_inmediata', e.target.value)}
                placeholder="Ej. Anestesia rápida, euforia..."
                className="sisap-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--texto-sec)] mb-1">
                Consecuencia Tardía (Castigo diferido):
              </label>
              <input
                type="text"
                value={formData.cons_tardia || ''}
                onChange={(e) => handleChange('cons_tardia', e.target.value)}
                placeholder="Ej. Resaca moral, disfunción..."
                className="sisap-input text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Module 4 & 5: Craving y Red de Síntomas */}
      <div className="sisap-captura">
        <h3 className="text-sm font-bold text-[var(--texto)] mb-1">
          4 y 5. Craving, Urgencia y Red de Síntomas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-[var(--texto-sec)]">
                Craving máximo última semana (0-10):
              </label>
              <span className="font-mono font-bold text-[var(--accion)]">
                {formData.craving || '0'} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.craving || '0'}
              onChange={(e) => handleChange('craving', e.target.value)}
              className="w-full accent-[var(--accion-fondo)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">Frecuencia de Craving:</label>
            <select
              value={formData.frec_craving || ''}
              onChange={(e) => handleChange('frec_craving', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— Seleccionar —</option>
              <option value="Ninguno">Ninguno</option>
              <option value="1-2 por día">1-2 por día</option>
              <option value="3-5 por día">3-5 por día</option>
              <option value="Más de 5 por día">Más de 5 por día</option>
              <option value="Constante">Constante</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              ¿Puede surfear el deseo como una ola?
            </label>
            <select
              value={formData.ola || ''}
              onChange={(e) => handleChange('ola', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— Seleccionar —</option>
              <option value="Nunca">Nunca (Se fusiona de inmediato)</option>
              <option value="A veces">A veces</option>
              <option value="Frecuentemente">Frecuentemente</option>
              <option value="Siempre">Siempre</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Peor síntoma en la red (Nodo central percibido):
            </label>
            <select
              value={formData.sintoma1 || ''}
              onChange={(e) => handleChange('sintoma1', e.target.value)}
              className="sisap-select text-xs"
            >
              <option value="">— Seleccionar —</option>
              <option value="Craving">Craving insoportable</option>
              <option value="Vacío">Sensación de vacío afectivo</option>
              <option value="Vergüenza">Vergüenza y culpa</option>
              <option value="Impulsividad">Impulsividad motora</option>
              <option value="Conflicto interpersonal">Conflicto interpersonal</option>
              <option value="Rumiación">Rumiación mental</option>
              <option value="Insomnio">Insomnio</option>
              <option value="Ira">Ira desbordada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Hipótesis de Centralidad:
            </label>
            <input
              type="text"
              value={formData.centralidad || ''}
              onChange={(e) => handleChange('centralidad', e.target.value)}
              placeholder="¿Qué síntoma activa en cascada a todos los demás?"
              className="sisap-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* Module 11: Estratificación y Modelo Causal */}
      <div className="sisap-captura">
        <h3 className="text-sm font-bold text-[var(--texto)] mb-1">
          11. Estratificación Clínica y Modelo Causal Integrado
        </h3>
        <p className="text-xs text-[var(--texto-tenue)] mb-3">
          Integración de espectros HiTOP, dominios RDoC y módulos de intervención SISAP-TUS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Vulnerabilidades Basales:
            </label>
            <textarea
              rows={2}
              value={formData.causal_vuln || ''}
              onChange={(e) => handleChange('causal_vuln', e.target.value)}
              placeholder="Rasgos de personalidad, impulsividad innata, trauma..."
              className="sisap-textarea text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Factores Protectores y Resiliencia:
            </label>
            <textarea
              rows={2}
              value={formData.causal_prot || ''}
              onChange={(e) => handleChange('causal_prot', e.target.value)}
              placeholder="Red de apoyo, motivación intrínseca, competencias..."
              className="sisap-textarea text-xs"
            />
          </div>
        </div>
      </div>

      {/* Module 12: Impresión Diagnóstica (Acto del Profesional) */}
      <div className="sisap-captura border-l-4 border-l-[var(--accion)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-[var(--texto)]">
            12. Impresión Diagnóstica · ACTO EXCLUSIVO DEL PROFESIONAL
          </h3>
          <span className="text-[10px] text-[var(--accion)] font-mono uppercase bg-[var(--accion)]/10 px-2 py-0.5 rounded">
            Firma Responsable
          </span>
        </div>
        <div className="p-2.5 rounded bg-[var(--fondo)] border border-[var(--sep)] text-xs text-[var(--texto-tenue)] mb-3">
          <b>Aviso normativo:</b> El diagnóstico no es generado, inferido ni calculado por algoritmos. Lo asienta con su criterio clínico y cédula el profesional autorizado.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Código Diagnóstico CIE-11 / DSM-5-TR *
            </label>
            <input
              type="text"
              required
              value={formData.dx_codigo || ''}
              onChange={(e) => handleChange('dx_codigo', e.target.value)}
              placeholder="Ej. 6C41.11 / F15.20"
              className="sisap-input font-mono font-bold text-[var(--accion)] text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Texto Diagnóstico y Criterios Cumplidos *
            </label>
            <input
              type="text"
              required
              value={formData.dx_texto || ''}
              onChange={(e) => handleChange('dx_texto', e.target.value)}
              placeholder="Trastorno grave por uso de estimulantes con tolerancia y abstinencia..."
              className="sisap-input text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--texto-sec)] mb-1">
            Pronóstico Clínico Estimado:
          </label>
          <select
            value={formData.dx_pronostico || ''}
            onChange={(e) => handleChange('dx_pronostico', e.target.value)}
            className="sisap-select text-xs font-medium"
          >
            <option value="">— Seleccionar —</option>
            <option value="Favorable">Favorable (Buen soporte, motivación activa)</option>
            <option value="Reservado">Reservado (Comorbilidad psiquiátrica / entorno adverso)</option>
            <option value="Desfavorable">Desfavorable (Múltiples recaídas y deterioro neurocognitivo)</option>
            <option value="No concluyente">No concluyente a primera entrevista</option>
          </select>
        </div>
      </div>

      {/* Module 13: Plan y Recomendaciones */}
      <div className="sisap-captura">
        <h3 className="text-sm font-bold text-[var(--texto)] mb-1">
          13. Plan Terapéutico y Recomendaciones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Plan de Tratamiento (Metas iniciales):
            </label>
            <textarea
              rows={3}
              value={formData.plan || ''}
              onChange={(e) => handleChange('plan', e.target.value)}
              placeholder="Frecuencia de sesiones, abordaje DBT/ACT, participación en talleres..."
              className="sisap-textarea text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Fecha de Próxima Cita de Valoración:
            </label>
            <input
              type="date"
              value={formData.proxima || ''}
              onChange={(e) => handleChange('proxima', e.target.value)}
              className="sisap-input text-xs mb-3"
            />
            <div className="text-[11px] text-[var(--texto-tenue)]">
              Profesional que asienta: <b className="text-[var(--texto)]">{currentUser.nombre || currentUser.u}</b> ({roleConfig.n})
            </div>
          </div>
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
                <span>Guardar y continuar después (Borrador)</span>
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
              [Modo solo lectura: su rol no tiene facultades de escritura]
            </span>
          )}
        </div>

        <span className="text-xs text-[var(--texto-tenue)]">
          {Object.keys(formData).filter((k) => formData[k] !== '').length} campos con valor
        </span>
      </div>

      {/* JSON Viewer Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-5 text-[var(--texto)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--sep)] mb-3">
              <h3 className="font-semibold text-sm">JSON Estructurado de la Entrevista</h3>
              <button onClick={() => setShowJsonModal(false)} className="text-[var(--texto-tenue)] hover:text-[var(--texto)]">
                ×
              </button>
            </div>
            <pre className="p-3 bg-[var(--fondo)] border border-[var(--sep)] rounded text-[11px] font-mono max-h-80 overflow-y-auto text-[var(--texto-sec)]">
              {JSON.stringify(formData, null, 2)}
            </pre>
            <div className="flex justify-end pt-3 mt-3 border-t border-[var(--sep-claro)]">
              <button onClick={() => setShowJsonModal(false)} className="sisap-btn-sec text-xs">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
