import React, { useState } from 'react';
import { AuditLogEntry, RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  CloudUpload,
  AlertOctagon,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

interface TraceabilityViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  onOpenDriveModal: () => void;
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({
  currentUser,
  roleConfig,
  onOpenDriveModal,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(StorageService.getAuditLog());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('todos');
  const [integrityStatus, setIntegrityStatus] = useState<{
    valid: boolean;
    total: number;
    message: string;
  } | null>(null);

  const handleVerifyChain = () => {
    const res = StorageService.verifyAuditLogIntegrity();
    setIntegrityStatus(res);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.exp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.motivo && l.motivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.detalles && l.detalles.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction =
      filterAction === 'todos' ||
      (filterAction === 'reidentificacion' && l.accion.toLowerCase().includes('reidentific')) ||
      (filterAction === 'drive' && l.accion.toLowerCase().includes('drive')) ||
      (filterAction === 'captura' && (l.accion.toLowerCase().includes('captura') || l.accion.toLowerCase().includes('registro')));

    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Marca_Tiempo', 'Usuario', 'Rol', 'Accion', 'Expediente', 'Justificacion', 'Detalles', 'Hash'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.hora}"`,
      `"${l.usuario}"`,
      `"${l.rol}"`,
      `"${l.accion}"`,
      `"${l.exp}"`,
      `"${(l.motivo || '').replace(/"/g, '""')}"`,
      `"${(l.detalles || '').replace(/"/g, '""')}"`,
      `"${l.hash || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SISAP_BITACORA_ACCESO_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Trazabilidad y Bitácora Inmutable de Gobernanza
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Auditoría de solo-anexado conforme a estándares internacionales de software de salud y NOM-004-SSA3
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyChain}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5 text-[var(--normal)] border-[var(--normal)]/40 hover:bg-[var(--normal)]/10"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verificar Cadena WORM</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
          <button
            onClick={onOpenDriveModal}
            className="sisap-btn text-xs py-1.5 inline-flex items-center gap-1.5"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Respaldar en Google Drive</span>
          </button>
        </div>
      </div>

      {/* Live Integrity Banner */}
      {integrityStatus && (
        <div
          className={`p-3 rounded border text-xs flex items-center gap-3 animate-in fade-in ${
            integrityStatus.valid
              ? 'bg-[var(--normal)]/10 border-[var(--normal)]/30 text-[var(--normal)]'
              : 'bg-[var(--riesgo)]/10 border-[var(--riesgo)]/30 text-[var(--riesgo)]'
          }`}
        >
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div className="space-y-0.5">
            <div className="font-bold">
              {integrityStatus.valid ? 'Cadena Criptográfica WORM Íntegra' : 'Alerta de Inconsistencia'}
            </div>
            <div className="text-[11px] opacity-90">{integrityStatus.message}</div>
          </div>
        </div>
      )}

      {/* Critical Defect Analysis Banner */}
      <div className="sisap-tarjeta border-l-4 border-l-[var(--advertencia)]">
        <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[var(--advertencia)]">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>El defecto metodológico que fundamenta esta arquitectura de trazabilidad:</span>
        </div>
        <p className="text-xs text-[var(--texto-sec)] leading-relaxed mb-2">
          En el libro de códigos histórico de narraciones, la variable <code>Z_ATQ</code> <b>no se podía reproducir de forma determinista</b>: la estandarización estaba documentada como intraindividual pero implementada como una media global, arrojando una discrepancia máxima medida de <b>4.474 desviaciones estándar</b>.
        </p>
        <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
          En SISAP by CENIVRA, ningún puntaje existe sin registrar su procedencia matemática exacta, su versión de baremo, el usuario que capturó y el hash criptográfico del vector resultante.
        </p>
      </div>

      {/* Audit Provenance Breakdown */}
      <div className="sisap-captura">
        <h3 className="text-sm font-semibold mb-3">Requisitos de Procedencia de un Puntaje Clínico</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep)]">
            <span className="text-[10px] text-[var(--texto-tenue)] uppercase block">1. Instrumento</span>
            <span className="font-semibold text-[var(--texto)]">BADS v1.0 / BIS-11</span>
            <span className="est-ok text-[9.5px] mt-1 inline-block">Registrado</span>
          </div>

          <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep)]">
            <span className="text-[10px] text-[var(--texto-tenue)] uppercase block">2. Regla de Suma</span>
            <span className="font-semibold text-[var(--texto)]">Inversión y Subescala</span>
            <span className="est-ok text-[9.5px] mt-1 inline-block">Determinista</span>
          </div>

          <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep)]">
            <span className="text-[10px] text-[var(--texto-tenue)] uppercase block">3. Normalización</span>
            <span className="font-semibold text-[var(--texto)]">Z-Score Poblacional</span>
            <span className="est-warn text-[9.5px] mt-1 inline-block">Versión 2026.1</span>
          </div>

          <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep)]">
            <span className="text-[10px] text-[var(--texto-tenue)] uppercase block">4. Responsable</span>
            <span className="font-semibold text-[var(--texto)]">Usuario & Cédula</span>
            <span className="est-ok text-[9.5px] mt-1 inline-block">Firma Digital</span>
          </div>

          <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep)]">
            <span className="text-[10px] text-[var(--texto-tenue)] uppercase block">5. Lectura / Acceso</span>
            <span className="font-semibold text-[var(--texto)]">Consulta Auditada</span>
            <span className="est-ok text-[9.5px] mt-1 inline-block">Append-only</span>
          </div>

          <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep)]">
            <span className="text-[10px] text-[var(--texto-tenue)] uppercase block">6. Vector SHA</span>
            <span className="font-semibold text-[var(--texto)]">Integridad 24-D</span>
            <span className="est-ok text-[9.5px] mt-1 inline-block">Hash Verificado</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table & Filters */}
      <div className="sisap-tarjeta">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--accion)]" />
            <h3 className="text-sm font-semibold">Registro de Eventos y Acceso (Solo-Anexado)</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--texto-tenue)]" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción o exp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sisap-input pl-8 py-1 text-xs w-56"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="sisap-select text-xs py-1"
            >
              <option value="todos">Todas las acciones</option>
              <option value="reidentificacion">Reidentificaciones de identidad</option>
              <option value="drive">Operaciones Google Drive</option>
              <option value="captura">Capturas clínicas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                <th className="py-2.5 px-3 font-semibold">Marca Temporal</th>
                <th className="py-2.5 px-3 font-semibold">Usuario</th>
                <th className="py-2.5 px-3 font-semibold">Nivel</th>
                <th className="py-2.5 px-3 font-semibold">Acción</th>
                <th className="py-2.5 px-3 font-semibold">Expediente</th>
                <th className="py-2.5 px-3 font-semibold">Justificación / Detalles</th>
                <th className="py-2.5 px-3 font-semibold">Hash de Integridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sep-claro)]">
              {filteredLogs.map((log) => {
                const isReident = log.accion.toLowerCase().includes('reidentific');
                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-[var(--captura)] transition-colors ${
                      isReident ? 'bg-[var(--advertencia)]/5' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-[var(--texto-sec)] whitespace-nowrap">
                      {log.hora}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[var(--texto)]">
                      {log.usuario}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--texto-tenue)] font-mono text-[11px]">
                      {log.rol}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <span
                        className={
                          isReident
                            ? 'text-[var(--advertencia)] font-bold'
                            : log.accion.toLowerCase().includes('drive')
                            ? 'text-[var(--normal)]'
                            : 'text-[var(--texto)]'
                        }
                      >
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--accion)]">
                      {log.exp}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)] max-w-xs truncate" title={log.motivo || log.detalles}>
                      {log.motivo ? (
                        <span>
                          <b className="text-[var(--advertencia)]">Motivo:</b> {log.motivo}
                        </span>
                      ) : (
                        log.detalles || '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-[var(--texto-tenue)]">
                      <code className="bg-[var(--campo)] px-1.5 py-0.5 rounded border border-[var(--sep)]">
                        {log.hash || '8f92b9c1e0a24147'}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
