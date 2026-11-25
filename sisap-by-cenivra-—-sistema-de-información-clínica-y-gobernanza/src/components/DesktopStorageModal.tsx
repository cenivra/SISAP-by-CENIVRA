import React, { useEffect, useState } from 'react';
import { SisapDesktopBackendInfo, SisapDesktopBackupEntry } from '../types/clinical';
import { PatientApiService } from '../services/patientApiService';
import {
  Database,
  Download,
  FolderOpen,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode2,
} from 'lucide-react';

interface DesktopStorageModalProps {
  onClose: () => void;
}

export const DesktopStorageModal: React.FC<DesktopStorageModalProps> = ({ onClose }) => {
  const desktop = typeof window !== 'undefined' ? window.sisapDesktop : undefined;
  const [info, setInfo] = useState<SisapDesktopBackendInfo | null>(null);
  const [webHealth, setWebHealth] = useState<{ ok: boolean; dbPath?: string; message?: string } | null>(null);
  const [backups, setBackups] = useState<SisapDesktopBackupEntry[]>([]);
  const [logTail, setLogTail] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadState = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const h = await PatientApiService.checkHealth();
      setWebHealth(h);
      if (desktop?.isDesktop) {
        const [backendInfo, list, log] = await Promise.all([
          desktop.getBackendInfo(),
          desktop.listDbBackups ? desktop.listDbBackups() : Promise.resolve([]),
          desktop.readDesktopLog ? desktop.readDesktopLog() : Promise.resolve(''),
        ]);
        setInfo(backendInfo);
        setBackups(list);
        setLogTail(log);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo consultar el almacenamiento local.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadState();
  }, []);

  const handleBackup = async () => {
    if (!desktop?.createDbBackup) return;
    setBusy(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await desktop.createDbBackup();
      setStatusMsg(`Respaldo creado correctamente: ${res.fileName} (${Math.round(res.sizeBytes / 1024)} KB).`);
      const list = await desktop.listDbBackups();
      setBackups(list);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error generando respaldo SQLite.');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenDir = async (target: 'db' | 'backups' | 'logs') => {
    if (!desktop?.openDataDir) return;
    try {
      const res = await desktop.openDataDir(target);
      if (!res.ok && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo abrir la carpeta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl wb-surface shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--sep-claro)] bg-[var(--panel-elev)]">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--accion)]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--texto)]">
                Motor SQLite Local, Persistencia y Respaldos de Escritorio
              </h3>
              <p className="text-[11px] text-[var(--texto-tenue)] font-mono">
                {desktop?.isDesktop
                  ? 'Entorno Nativo Electron Windows · Aislamiento %APPDATA% y Cero Procesos Huérfanos'
                  : 'Entorno Web/Navegador conectado a Loopback Backend'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="sisap-btn-sec p-1.5" aria-label="Cerrar panel de almacenamiento">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Health & Connection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="wb-metric-cell space-y-1">
              <div className="wb-eyebrow">Estado del Backend Local</div>
              <div className="flex items-center gap-1.5 font-mono text-[12px]">
                <CheckCircle2 className={`w-3.5 h-3.5 ${webHealth?.ok ? 'text-[var(--normal)]' : 'text-[var(--riesgo)]'}`} />
                <span className="font-semibold text-[var(--texto)]">
                  {webHealth?.ok ? 'Operativo (Loopback)' : 'Desconectado'}
                </span>
              </div>
              <div className="text-[10.5px] font-mono text-[var(--texto-tenue)] truncate">
                {info ? `${info.apiBase} (Puerto ${info.port})` : PatientApiService.getApiBase()}
              </div>
            </div>

            <div className="wb-metric-cell space-y-1">
              <div className="wb-eyebrow">Base SQLite Activa</div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--texto)] truncate">
                <Database className="w-3.5 h-3.5 text-[var(--info)] shrink-0" />
                <span className="truncate" title={info?.dbFilePath || webHealth?.dbPath || 'No reportada'}>
                  {info?.dbFilePath || webHealth?.dbPath || 'Modo memoria/localStorage sin backend'}
                </span>
              </div>
              <div className="text-[10.5px] text-[var(--texto-tenue)]">
                Las actualizaciones no sobrescriben tu base en AppData.
              </div>
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded border border-[var(--normal)]/40 bg-[var(--normal)]/10 text-[var(--normal)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded border border-[var(--riesgo)]/40 bg-[var(--riesgo)]/10 text-[var(--riesgo)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {desktop?.isDesktop ? (
            <>
              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleBackup} disabled={busy} className="sisap-btn text-xs">
                  <Download className="w-3.5 h-3.5" />
                  <span>Crear Respaldo SQLite Ahora</span>
                </button>
                <button type="button" onClick={() => handleOpenDir('db')} className="sisap-btn-sec text-xs">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Abrir Carpeta BD</span>
                </button>
                <button type="button" onClick={() => handleOpenDir('backups')} className="sisap-btn-sec text-xs">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Abrir Respaldos</span>
                </button>
                <button type="button" onClick={loadState} disabled={busy} className="sisap-btn-sec text-xs ml-auto">
                  <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>

              {/* Backup Inventory */}
              <div className="wb-metric-cell space-y-2">
                <div className="flex items-center justify-between">
                  <span className="wb-eyebrow">Respaldos Locales en %APPDATA% ({backups.length})</span>
                  <span className="text-[10px] font-mono text-[var(--texto-tenue)] truncate max-w-[260px]">
                    {info?.backupDir}
                  </span>
                </div>
                {backups.length === 0 ? (
                  <p className="text-[11px] text-[var(--texto-tenue)]">
                    Aún no hay respaldos manuales generados en esta sesión.
                  </p>
                ) : (
                  <div className="max-h-32 overflow-y-auto divide-y divide-[var(--sep)]">
                    {backups.slice(0, 8).map((b) => (
                      <div key={b.fileName} className="py-1.5 flex items-center justify-between font-mono text-[11px]">
                        <span className="text-[var(--texto)]">{b.fileName}</span>
                        <span className="text-[var(--texto-tenue)] tabular-nums">
                          {Math.round(b.sizeBytes / 1024)} KB · {b.modifiedAt.slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Diagnostics Log */}
              <div className="wb-metric-cell space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="wb-eyebrow flex items-center gap-1">
                    <FileCode2 className="w-3 h-3" /> Bitácora Técnica de Arranque Desktop (Sin PHI)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenDir('logs')}
                    className="text-[10.5px] text-[var(--accion)] hover:underline font-mono cursor-pointer"
                  >
                    Abrir carpeta logs
                  </button>
                </div>
                <pre className="bg-[var(--fondo)] border border-[var(--sep)] rounded p-2 text-[10px] font-mono text-[var(--texto-sec)] max-h-32 overflow-auto whitespace-pre-wrap">
                  {logTail || 'Sin entradas registradas aún.'}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-3 rounded bg-[var(--campo)] border border-[var(--sep)] text-[var(--texto-sec)]">
              Estás utilizando la interfaz mediante navegador web. Cuando abras la aplicación instalada en Windows (.exe),
              aquí podrás generar respaldos SQLite con un clic y abrir directamente tus carpetas seguras en{' '}
              <code className="font-mono text-[var(--accion)]">%APPDATA%\SISAP by CENIVRA</code>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
