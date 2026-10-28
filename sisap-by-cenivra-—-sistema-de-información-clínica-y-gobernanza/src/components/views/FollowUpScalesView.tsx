import React, { useState } from 'react';
import { RoleConfig, UserAccount } from '../../types/clinical';
import { SEGUIMIENTO_CATALOGO } from '../../constants/clinicalConstants';
import { StorageService } from '../../services/storageService';
import {
  CalendarCheck2,
  Save,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface FollowUpScalesViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  initialData?: Record<string, string>;
  onDraftSaved?: () => void;
}

export const FollowUpScalesView: React.FC<FollowUpScalesViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  initialData,
  onDraftSaved,
}) => {
  const [activeCadenceIndex, setActiveCadenceIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, string>>(initialData || {});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const activeCadence = SEGUIMIENTO_CATALOGO[activeCadenceIndex];

  const handleStatusChange = (instrumentId: string, status: string) => {
    setFormData((prev) => ({ ...prev, [instrumentId]: status }));
  };

  const handleSaveDraft = () => {
    StorageService.saveDraft({
      formulario: `Seguimiento: ${activeCadence.frecuencia}`,
      screen: 'seguimiento',
      pre: `seg_${activeCadenceIndex}`,
      paciente: selectedPseudonym,
      datos: formData,
    });

    setSaveStatus(`Borrador guardado a las ${new Date().toLocaleTimeString('es-MX')}`);
    if (onDraftSaved) onDraftSaved();
  };

  const handleSaveFinal = () => {
    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: `Aplicación de batería de seguimiento: ${activeCadence.frecuencia}`,
      exp: selectedPseudonym,
      detalles: `Batería completada para el ciclo actual.`,
    });

    setSaveStatus(`Registrado formalmente el ${new Date().toLocaleTimeString('es-MX')}`);
    alert(`Batería ${activeCadence.frecuencia} registrada para el expediente ${selectedPseudonym}.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Instrumentos de Seguimiento Quincenal y Mensual
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Cronograma estandarizado de evaluación continua para prevención de recaídas y monitoreo de cambio
          </div>
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
            <span className="text-[var(--texto-sec)] mr-1">Cadencia actual:</span>
            <span className="font-semibold text-[var(--texto)]">{activeCadence.frecuencia}</span>
          </div>
        </div>
        {saveStatus && (
          <span className="text-[var(--normal)] font-mono text-[11px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {saveStatus}
          </span>
        )}
      </div>

      {/* Cadence selector tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--sep-claro)] pb-2">
        {SEGUIMIENTO_CATALOGO.map((cadence, idx) => {
          const isActive = idx === activeCadenceIndex;
          return (
            <button
              key={cadence.frecuencia}
              onClick={() => setActiveCadenceIndex(idx)}
              className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
                  : 'text-[var(--texto-sec)] hover:bg-[var(--panel)] hover:text-[var(--texto)]'
              }`}
            >
              {cadence.frecuencia}
            </button>
          );
        })}
      </div>

      {/* Active Cadence Checklist */}
      <div className="sisap-captura">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[var(--texto)]">{activeCadence.frecuencia}</h3>
          <p className="text-xs text-[var(--texto-tenue)]">{activeCadence.descripcion}</p>
        </div>

        <div className="space-y-3">
          {activeCadence.instrumentos.map((inst) => {
            const currentStatus = formData[inst.id] || 'Pendiente';
            return (
              <div
                key={inst.id}
                className="p-3 rounded bg-[var(--campo)] border border-[var(--sep)] flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck2 className="w-4 h-4 text-[var(--accion)]" />
                  <div>
                    <div className="font-semibold text-[var(--texto)]">{inst.nombre}</div>
                    <div className="text-[11px] text-[var(--texto-tenue)]">
                      Código: <code>{inst.id}</code> · Tiempo estimado: {inst.duracion}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(inst.id, e.target.value)}
                    className="sisap-select text-xs py-1"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aplicado">✓ Aplicado</option>
                    <option value="No aplica">No aplica</option>
                    <option value="Rehusado">Rehusado</option>
                  </select>

                  <span
                    className={
                      currentStatus === 'Aplicado'
                        ? 'est-ok'
                        : currentStatus === 'Pendiente'
                        ? 'est-pend'
                        : 'est-warn'
                    }
                  >
                    {currentStatus}
                  </span>
                </div>
              </div>
            );
          })}
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
                <span>Guardar Avance</span>
              </button>
              <button
                type="button"
                onClick={handleSaveFinal}
                className="sisap-btn text-xs py-2 px-3 inline-flex items-center gap-1.5 font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Registrar Batería en Expediente {selectedPseudonym}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-[var(--texto-tenue)] font-mono">
              [Modo solo lectura: rol {currentUser.rol}]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
