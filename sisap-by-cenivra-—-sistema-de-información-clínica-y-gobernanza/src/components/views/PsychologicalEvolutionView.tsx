import React, { useState, useEffect } from 'react';
import { EvolutionNote, RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  FileSignature,
  Save,
  Clock,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface PsychologicalEvolutionViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
}

export const PsychologicalEvolutionView: React.FC<PsychologicalEvolutionViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
}) => {
  const [history, setHistory] = useState<EvolutionNote[]>(
    StorageService.getEvolutionNotes(selectedPseudonym)
  );

  const nextSessionNumber = history.length > 0 ? Math.max(...history.map((n) => n.sesion)) + 1 : 1;

  // Form state
  const [formData, setFormData] = useState({
    sesion: nextSessionNumber,
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    tipo: (currentUser.rol === 'medicina'
      ? 'medicina'
      : currentUser.rol === 'enfermeria'
      ? 'enfermeria'
      : currentUser.rol === 'consejero'
      ? 'consejeria'
      : 'psicologia') as EvolutionNote['tipo'],
    objetivo: '',
    resumen: '',
    resultado: '',
    siguiente: '',
    actividades: '',
    observaciones: '',
    proxima_cita: '',
    profesional_nombre: currentUser.nombre || currentUser.u,
    profesional_cedula: currentUser.cedula || 'CED-PROF-REGISTRADA',
  });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setHistory(StorageService.getEvolutionNotes(selectedPseudonym));
  }, [selectedPseudonym]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFillDemo = () => {
    setFormData({
      ...formData,
      objetivo: 'Entrenamiento en tolerancia al malestar y reestructuración de distorsiones sobre el craving.',
      resumen: 'Se analizó episodio de craving ocurrido el martes tras llamada de antiguo contacto de consumo. Se identificó pensamiento catastrófico ("no voy a aguantar"). Se aplicó técnica de defusión cognitiva y respiración diafragmática 4-7-8 con descenso de escala de tensión subjetiva (SUDS) de 8/10 a 3/10.',
      resultado: 'Paciente cooperativo, con adecuada capacidad de introspección y compromiso en la práctica de habilidades.',
      siguiente: 'Monitoreo de disparadores ambientales y preparación para visita familiar programada.',
      actividades: 'Completar autoregistro de pensamientos automáticos y practicar respiración diafragmática 10 minutos al despertar.',
      observaciones: 'Buena disposición afectiva; lenguaje coherente y congruente con el afecto.',
      proxima_cita: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
  };

  const handleSaveDraft = () => {
    StorageService.saveDraft({
      formulario: `Nota de Evolución #${formData.sesion}`,
      screen: 'evolucion',
      pre: 'ev',
      paciente: selectedPseudonym,
      datos: {
        sesion: formData.sesion.toString(),
        fecha: formData.fecha,
        hora: formData.hora,
        tipo: formData.tipo,
        objetivo: formData.objetivo,
        resumen: formData.resumen,
        resultado: formData.resultado,
        siguiente: formData.siguiente,
        actividades: formData.actividades,
        observaciones: formData.observaciones,
        proxima_cita: formData.proxima_cita,
      },
    });

    setSaveStatus(`Borrador guardado a las ${new Date().toLocaleTimeString('es-MX')}`);
    if (onDraftSaved) onDraftSaved();
  };

  const handleSaveFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objetivo.trim() || !formData.resumen.trim()) {
      alert('Por favor complete al menos el objetivo y el resumen de la intervención.');
      return;
    }

    const newNote: EvolutionNote = {
      id: `note-${Date.now()}`,
      expediente: selectedPseudonym,
      sesion: formData.sesion,
      fecha: formData.fecha,
      hora: formData.hora,
      tipo: formData.tipo,
      objetivo: formData.objetivo,
      resumen: formData.resumen,
      resultado: formData.resultado,
      siguiente: formData.siguiente,
      actividades: formData.actividades,
      observaciones: formData.observaciones,
      proxima_cita: formData.proxima_cita,
      profesional_nombre: formData.profesional_nombre,
      profesional_cedula: formData.profesional_cedula,
      creado_en: new Date().toLocaleString('es-MX'),
    };

    StorageService.saveEvolutionNote(newNote);

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: `Registro de Nota de Evolución (${formData.tipo.toUpperCase()})`,
      exp: selectedPseudonym,
      detalles: `Sesión #${formData.sesion}. Objetivo: ${formData.objetivo.slice(0, 50)}...`,
    });

    setHistory(StorageService.getEvolutionNotes(selectedPseudonym));
    setSaveStatus(`Nota registrada exitosamente`);
    alert(`Nota de evolución #${formData.sesion} registrada en el expediente ${selectedPseudonym}.`);

    // Reset for next note
    setFormData((prev) => ({
      ...prev,
      sesion: prev.sesion + 1,
      objetivo: '',
      resumen: '',
      resultado: '',
      siguiente: '',
      actividades: '',
      observaciones: '',
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Nota de Evolución Clínica
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Registro estructurado conforme a la NOM-004-SSA3-2012 (Psicología, Medicina, Enfermería y Consejería)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillDemo}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5 text-[var(--accion)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ejemplo Clínico</span>
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
            <span className="text-[var(--texto-sec)] mr-1">Profesional:</span>
            <span className="font-medium text-[var(--texto)]">{formData.profesional_nombre}</span>
          </div>
          <div>
            <span className="text-[var(--texto-sec)] mr-1">Cédula:</span>
            <span className="font-mono">{formData.profesional_cedula}</span>
          </div>
        </div>
        {saveStatus && (
          <span className="text-[var(--normal)] font-mono text-[11px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {saveStatus}
          </span>
        )}
      </div>

      {/* Note Form */}
      <form onSubmit={handleSaveFinal} className="space-y-4">
        <div className="sisap-captura">
          <h3 className="text-sm font-semibold mb-3">Datos Generales de la Sesión</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">No. de Sesión *</label>
              <input
                type="number"
                required
                value={formData.sesion}
                onChange={(e) => handleChange('sesion', parseInt(e.target.value, 10) || 1)}
                className="sisap-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Especialidad de la Nota</label>
              <select
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="sisap-select font-medium"
              >
                <option value="psicologia">Psicología Clínica</option>
                <option value="medicina">Medicina / Psiquiatría</option>
                <option value="consejeria">Consejería en Adicciones</option>
                <option value="enfermeria">Enfermería</option>
              </select>
            </div>
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Fecha de Sesión *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                className="sisap-input font-mono"
              />
            </div>
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Hora de Atención *</label>
              <input
                type="time"
                required
                value={formData.hora}
                onChange={(e) => handleChange('hora', e.target.value)}
                className="sisap-input font-mono"
              />
            </div>
          </div>
        </div>

        {/* Clinical Content */}
        <div className="sisap-captura space-y-3">
          <h3 className="text-sm font-semibold mb-1">Contenido de la Intervención Clínica</h3>

          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Objetivo de la Sesión *
            </label>
            <textarea
              required
              rows={2}
              value={formData.objetivo}
              onChange={(e) => handleChange('objetivo', e.target.value)}
              placeholder="Describa el objetivo psicoterapéutico o médico a abordar..."
              className="sisap-textarea text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Resumen de la Sesión (Técnicas, temas y abordaje) *
            </label>
            <textarea
              required
              rows={4}
              value={formData.resumen}
              onChange={(e) => handleChange('resumen', e.target.value)}
              placeholder="Intervenciones realizadas, eventos significativos referidos, diálogo reflexivo..."
              className="sisap-textarea text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Resultado y Disposición del Paciente
              </label>
              <textarea
                rows={2}
                value={formData.resultado}
                onChange={(e) => handleChange('resultado', e.target.value)}
                placeholder="Conducta observable, nivel de cooperación, introspección..."
                className="sisap-textarea text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Plan para la Siguiente Sesión
              </label>
              <textarea
                rows={2}
                value={formData.siguiente}
                onChange={(e) => handleChange('siguiente', e.target.value)}
                placeholder="Continuidad de habilidades, revisión de tareas..."
                className="sisap-textarea text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Actividades y Tareas Asignadas
              </label>
              <textarea
                rows={2}
                value={formData.actividades}
                onChange={(e) => handleChange('actividades', e.target.value)}
                placeholder="Autoregistros, lectura, ejercicios conductuales..."
                className="sisap-textarea text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Observaciones Relevantes
              </label>
              <textarea
                rows={2}
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Signos de alarma, factores protectores, recomendaciones..."
                className="sisap-textarea text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Fecha Próxima Cita
              </label>
              <input
                type="date"
                value={formData.proxima_cita}
                onChange={(e) => handleChange('proxima_cita', e.target.value)}
                className="sisap-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Profesional Responsable
              </label>
              <input
                type="text"
                readOnly
                value={formData.profesional_nombre}
                className="sisap-input text-xs bg-[var(--fondo)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Cédula Profesional
              </label>
              <input
                type="text"
                readOnly
                value={formData.profesional_cedula}
                className="sisap-input text-xs font-mono bg-[var(--fondo)]"
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
                  type="submit"
                  className="sisap-btn text-xs py-2 px-3 inline-flex items-center gap-1.5 font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Firmar y Registrar en Expediente {selectedPseudonym}</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-[var(--texto-tenue)] font-mono">
                [Modo solo lectura: rol {currentUser.rol}]
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Previous notes list */}
      <div className="sisap-tarjeta mt-6">
        <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--sep-claro)]">
          Historial de Notas de Evolución en este Expediente ({history.length})
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-6 text-xs text-[var(--texto-tenue)]">
            Aún no hay notas registradas para este expediente.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded bg-[var(--campo)] border border-[var(--sep)] text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sep-claro)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--texto)]">
                      Sesión #{note.sesion}
                    </span>
                    <span className="est-ok uppercase text-[10px]">{note.tipo}</span>
                  </div>
                  <div className="text-[11px] text-[var(--texto-tenue)] font-mono">
                    {note.fecha} a las {note.hora}
                  </div>
                </div>

                <div>
                  <b className="text-[var(--texto)]">Objetivo:</b>{' '}
                  <span className="text-[var(--texto-sec)]">{note.objetivo}</span>
                </div>

                <div className="leading-relaxed">
                  <b className="text-[var(--texto)]">Resumen Clínico:</b>{' '}
                  <span className="text-[var(--texto-sec)]">{note.resumen}</span>
                </div>

                {note.resultado && (
                  <div>
                    <b className="text-[var(--texto)]">Resultado:</b>{' '}
                    <span className="text-[var(--texto-sec)]">{note.resultado}</span>
                  </div>
                )}

                {note.actividades && (
                  <div>
                    <b className="text-[var(--texto)]">Tareas asignadas:</b>{' '}
                    <span className="text-[var(--texto-sec)]">{note.actividades}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--sep)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--texto-tenue)]">
                  <span>
                    Firma: <b>{note.profesional_nombre}</b> ({note.profesional_cedula})
                  </span>
                  {note.proxima_cita && (
                    <span>
                      Próxima cita:{' '}
                      <b className="text-[var(--accion)] font-mono">{note.proxima_cita}</b>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
