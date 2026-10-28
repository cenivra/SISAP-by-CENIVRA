import React, { useState, useEffect } from 'react';
import { FamilyNote, RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  HeartHandshake,
  Save,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface FamilySessionViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
}

export const FamilySessionView: React.FC<FamilySessionViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
}) => {
  const [history, setHistory] = useState<FamilyNote[]>(
    StorageService.getFamilyNotes(selectedPseudonym)
  );

  const nextSesionNo = history.length > 0 ? Math.max(...history.map((n) => n.sesion_no)) + 1 : 1;

  const [formData, setFormData] = useState({
    familiar_nombre: '',
    parentesco: 'Madre',
    sesion_no: nextSesionNo,
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    objetivo: '',
    temas: '',
    psicoeducacion: '',
    narrativa_familiar: '',
    resultado: '',
    acuerdos: '',
    plan_siguiente: '',
    observaciones: '',
    proxima_fecha: '',
    profesional_nombre: currentUser.nombre || currentUser.u,
    profesional_cedula: currentUser.cedula || 'CED-PROF-REGISTRADA',
  });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setHistory(StorageService.getFamilyNotes(selectedPseudonym));
  }, [selectedPseudonym]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFillDemo = () => {
    setFormData({
      ...formData,
      familiar_nombre: 'Laura Morales Salazar',
      parentesco: 'Hermana',
      objetivo: 'Psicoeducación sobre la neurobiología del craving y establecimiento de límites no punitivos.',
      temas: 'Desmitificación de la adicción como falta de voluntad. Análisis de conductas de codependencia y sobreprotección.',
      psicoeducacion: 'Se explicó el ciclo de mantenimiento, la diferencia entre recaída y desliz, y el protocolo de respuesta ante crisis de abstinencia.',
      narrativa_familiar: 'La hermana refiere agotamiento por asumir deudas previas y temor constante a mentiras. Muestra apertura para asistir a grupo de autoayuda para familiares.',
      resultado: 'Disminución notable de la hostilidad inicial. Mayor empatía hacia la sintomatología del usuario.',
      acuerdos: 'No facilitar dinero en efectivo directo. Reportar llamadas sospechosas al equipo clínico. Asistir a la sesión grupal quincenal.',
      plan_siguiente: 'Sesión conjunta usuario-familiar para pactar contrato de convivencia previo a primera salida supervisada.',
      observaciones: 'Familiar con adecuada red de apoyo, clave como coterapeuta en la fase ambulatoria.',
      proxima_fecha: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
  };

  const handleSaveDraft = () => {
    StorageService.saveDraft({
      formulario: `Nota Familiar #${formData.sesion_no}`,
      screen: 'familiar',
      pre: 'fa',
      paciente: selectedPseudonym,
      datos: {
        ...formData,
        sesion_no: formData.sesion_no.toString(),
      },
    });

    setSaveStatus(`Borrador guardado a las ${new Date().toLocaleTimeString('es-MX')}`);
    if (onDraftSaved) onDraftSaved();
  };

  const handleSaveFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familiar_nombre.trim() || !formData.objetivo.trim()) {
      alert('Por favor complete el nombre del familiar y el objetivo de la sesión.');
      return;
    }

    const newNote: FamilyNote = {
      id: `fam-${Date.now()}`,
      expediente: selectedPseudonym,
      familiar_nombre: formData.familiar_nombre,
      parentesco: formData.parentesco,
      sesion_no: formData.sesion_no,
      fecha: formData.fecha,
      hora: formData.hora,
      objetivo: formData.objetivo,
      temas: formData.temas,
      psicoeducacion: formData.psicoeducacion,
      narrativa_familiar: formData.narrativa_familiar,
      resultado: formData.resultado,
      acuerdos: formData.acuerdos,
      plan_siguiente: formData.plan_siguiente,
      observaciones: formData.observaciones,
      proxima_fecha: formData.proxima_fecha,
      profesional_nombre: formData.profesional_nombre,
      profesional_cedula: formData.profesional_cedula,
      creado_en: new Date().toLocaleString('es-MX'),
    };

    StorageService.saveFamilyNote(newNote);

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Registro de Nota de Sesión Familiar',
      exp: selectedPseudonym,
      detalles: `Sesión familiar #${formData.sesion_no} con ${formData.familiar_nombre} (${formData.parentesco}).`,
    });

    setHistory(StorageService.getFamilyNotes(selectedPseudonym));
    setSaveStatus(`Nota familiar registrada con éxito`);
    alert(`Nota de sesión familiar #${formData.sesion_no} registrada.`);

    setFormData((prev) => ({
      ...prev,
      sesion_no: prev.sesion_no + 1,
      familiar_nombre: '',
      objetivo: '',
      temas: '',
      psicoeducacion: '',
      narrativa_familiar: '',
      resultado: '',
      acuerdos: '',
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Nota de Evolución · Entrevista con Familiares
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Registro confidencial de intervenciones sociofamiliares y psicoeducación
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillDemo}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5 text-[var(--accion)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ejemplo de Sesión Familiar</span>
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
            <span className="text-[var(--texto-sec)] mr-1">Responsable:</span>
            <span className="font-medium text-[var(--texto)]">{formData.profesional_nombre}</span>
          </div>
        </div>
        {saveStatus && (
          <span className="text-[var(--normal)] font-mono text-[11px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {saveStatus}
          </span>
        )}
      </div>

      {/* Data Boundary Warning */}
      <div className="p-3 bg-[var(--campo)] border border-[var(--advertencia)]/40 rounded text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[var(--advertencia)]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Frontera Estricta de Datos (Gobernanza Institucional):</span>
        </div>
        <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
          Este registro clínico interno <b>NUNCA se entrega tal cual a la familia</b>. El informe que eventualmente se comparta con los familiares se elabora únicamente a partir de hechos y acuerdos objetivos, protegiendo las notas analíticas del terapeuta y el secreto profesional.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveFinal} className="space-y-4">
        <div className="sisap-captura">
          <h3 className="text-sm font-semibold mb-3">Datos del Familiar y la Sesión</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">No. Sesión Familiar *</label>
              <input
                type="number"
                required
                value={formData.sesion_no}
                onChange={(e) => handleChange('sesion_no', parseInt(e.target.value, 10) || 1)}
                className="sisap-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Nombre del Familiar Entrevistado *</label>
              <input
                type="text"
                required
                value={formData.familiar_nombre}
                onChange={(e) => handleChange('familiar_nombre', e.target.value)}
                placeholder="Nombre completo"
                className="sisap-input"
              />
            </div>
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Parentesco</label>
              <select
                value={formData.parentesco}
                onChange={(e) => handleChange('parentesco', e.target.value)}
                className="sisap-select font-medium"
              >
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Hermano/a">Hermano/a</option>
                <option value="Cónyuge o pareja">Cónyuge o pareja</option>
                <option value="Hijo/a">Hijo/a</option>
                <option value="Tío/a">Tío/a</option>
                <option value="Abuelo/a">Abuelo/a</option>
                <option value="Otro">Otro vínculo significativo</option>
              </select>
            </div>
            <div>
              <label className="block text-[var(--texto-sec)] mb-1">Fecha y Hora</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  className="sisap-input font-mono"
                />
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => handleChange('hora', e.target.value)}
                  className="sisap-input font-mono w-24"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sisap-captura space-y-3">
          <h3 className="text-sm font-semibold mb-1">Desarrollo de la Entrevista Familiar</h3>

          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Objetivo de la Sesión Familiar *
            </label>
            <textarea
              required
              rows={2}
              value={formData.objetivo}
              onChange={(e) => handleChange('objetivo', e.target.value)}
              placeholder="Describa el objetivo a trabajar con la familia..."
              className="sisap-textarea text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Temas Abordados
              </label>
              <textarea
                rows={3}
                value={formData.temas}
                onChange={(e) => handleChange('temas', e.target.value)}
                placeholder="Dinámica familiar, codependencia, límites..."
                className="sisap-textarea text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Psicoeducación Proporcionada a la Familia
              </label>
              <textarea
                rows={3}
                value={formData.psicoeducacion}
                onChange={(e) => handleChange('psicoeducacion', e.target.value)}
                placeholder="Conceptos médicos, neurobiología, reducción de estigma..."
                className="sisap-textarea text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--texto-sec)] mb-1">
              Narrativa Familiar (Información y perspectiva aportada por el familiar)
            </label>
            <textarea
              rows={3}
              value={formData.narrativa_familiar}
              onChange={(e) => handleChange('narrativa_familiar', e.target.value)}
              placeholder="El familiar refiere..."
              className="sisap-textarea text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Resultado de la Sesión
              </label>
              <textarea
                rows={2}
                value={formData.resultado}
                onChange={(e) => handleChange('resultado', e.target.value)}
                placeholder="Disposición del familiar, receptividad..."
                className="sisap-textarea text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Acuerdos y Recomendaciones Establecidos
              </label>
              <textarea
                rows={2}
                value={formData.acuerdos}
                onChange={(e) => handleChange('acuerdos', e.target.value)}
                placeholder="Compromisos mutuos, límites pactados..."
                className="sisap-textarea text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Plan para la Siguiente Sesión
              </label>
              <input
                type="text"
                value={formData.plan_siguiente}
                onChange={(e) => handleChange('plan_siguiente', e.target.value)}
                placeholder="Ej. Sesión conjunta usuario-familiar"
                className="sisap-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--texto-sec)] mb-1">
                Fecha Próxima Sesión Familiar
              </label>
              <input
                type="date"
                value={formData.proxima_fecha}
                onChange={(e) => handleChange('proxima_fecha', e.target.value)}
                className="sisap-input text-xs"
              />
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
                  <span>Guardar Borrador</span>
                </button>
                <button
                  type="submit"
                  className="sisap-btn text-xs py-2 px-3 inline-flex items-center gap-1.5 font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Registrar Nota Familiar en {selectedPseudonym}</span>
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

      {/* History */}
      <div className="sisap-tarjeta mt-6">
        <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--sep-claro)]">
          Historial de Sesiones Familiares ({history.length})
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-6 text-xs text-[var(--texto-tenue)]">
            No se han registrado sesiones familiares para este expediente.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((note) => (
              <div key={note.id} className="p-4 rounded bg-[var(--campo)] border border-[var(--sep)] text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sep-claro)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--texto)]">
                      Sesión Familiar #{note.sesion_no}
                    </span>
                    <span className="text-[11px] text-[var(--accion)]">
                      Familiar: {note.familiar_nombre} ({note.parentesco})
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--texto-tenue)] font-mono">
                    {note.fecha} {note.hora}
                  </div>
                </div>
                <div>
                  <b className="text-[var(--texto)]">Objetivo:</b>{' '}
                  <span className="text-[var(--texto-sec)]">{note.objetivo}</span>
                </div>
                <div>
                  <b className="text-[var(--texto)]">Narrativa del familiar:</b>{' '}
                  <span className="text-[var(--texto-sec)]">{note.narrativa_familiar}</span>
                </div>
                <div>
                  <b className="text-[var(--texto)]">Acuerdos:</b>{' '}
                  <span className="text-[var(--texto-sec)]">{note.acuerdos}</span>
                </div>
                <div className="pt-2 border-t border-[var(--sep)] text-[10px] text-[var(--texto-tenue)]">
                  Firma: {note.profesional_nombre} ({note.profesional_cedula})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
