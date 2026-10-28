import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  googleSignIn,
  logoutGoogle,
  uploadClinicalFileToDrive,
  listDriveClinicalFiles,
  deleteDriveClinicalFile,
  DriveFileInfo,
} from '../services/googleDriveService';
import { StorageService } from '../services/storageService';
import { UserAccount } from '../types/clinical';
import { ConfirmationModal } from './ConfirmationModal';
import {
  Cloud,
  CloudUpload,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Database,
  Lock,
  Archive,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ESQUEMA_SQL_CENIVRA } from '../constants/clinicalConstants';
import { SCRIPT_SQL_USUARIOS_CLAVES } from '../constants/sqlScripts';
import { AutoencoderEngine } from '../services/autoencoderEngine';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  googleUser: FirebaseUser | null;
  onAuthChanged: (user: FirebaseUser | null) => void;
  selectedPseudonym?: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  googleUser,
  onAuthChanged,
  selectedPseudonym = 'TUS-0007',
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DriveFileInfo | null>(null);

  const fetchFiles = async () => {
    if (!googleUser) return;
    setLoading(true);
    try {
      const files = await listDriveClinicalFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'err', text: err.message || 'Error al listar archivos de Google Drive.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && googleUser) {
      fetchFiles();
    }
  }, [isOpen, googleUser]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onAuthChanged(res.user);
        StorageService.logAction({
          usuario: currentUser.u,
          rol: currentUser.rol,
          accion: 'Vinculación de cuenta Google Drive',
          exp: '—',
          detalles: `Usuario de Google: ${res.user.email}`,
        });
        setStatusMessage({ type: 'ok', text: `Conectado exitosamente con ${res.user.email}` });
        setTimeout(() => fetchFiles(), 500);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'err', text: err.message || 'No se pudo completar la autenticación con Google.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutGoogle();
      onAuthChanged(null);
      setDriveFiles([]);
      setStatusMessage({ type: 'ok', text: 'Sesión de Google Drive cerrada.' });
    } catch (err: any) {
      setStatusMessage({ type: 'err', text: err.message || 'Error al cerrar sesión.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPatientDossier = async () => {
    if (!googleUser) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const payload = StorageService.generatePatientDossierPayload(selectedPseudonym);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `EXPEDIENTE_${selectedPseudonym}_${timestamp}.json`;

      const file = await uploadClinicalFileToDrive(fileName, payload, 'application/json');

      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Exportación de expediente a Google Drive',
        exp: selectedPseudonym,
        detalles: `Archivo creado en Drive: ${fileName} (ID: ${file.id})`,
      });

      setStatusMessage({
        type: 'ok',
        text: `Expediente ${selectedPseudonym} respaldado exitosamente en Google Drive: ${fileName}`,
      });
      await fetchFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'err', text: err.message || 'Error al exportar expediente a Drive.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportResearchDataset = async () => {
    if (!googleUser) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const payload = StorageService.generateAnonymizedDatasetPayload();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `DATASET_INVESTIGACION_ANONIMO_${timestamp}.json`;

      const file = await uploadClinicalFileToDrive(fileName, payload, 'application/json');

      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Exportación de dataset de investigación a Google Drive',
        exp: 'COHORTE-TUS',
        detalles: `Dataset anónimo respaldado: ${fileName} (ID: ${file.id})`,
      });

      setStatusMessage({
        type: 'ok',
        text: `Dataset anonimizado de investigación guardado en Drive: ${fileName}`,
      });
      await fetchFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'err', text: err.message || 'Error al exportar dataset a Drive.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportFullSystemBackup = async () => {
    if (!googleUser) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const fullPackage = {
        sistema: 'SISAP by CENIVRA',
        version: '1.0 Producción Clínica & Gobernanza',
        fecha_respaldo: new Date().toISOString(),
        generado_por: {
          usuario: currentUser.u,
          nombre: currentUser.nombre,
          rol: currentUser.rol,
        },
        base_datos_clinica: {
          pacientes_clinicos: StorageService.getPatients(),
          padron_identidad: StorageService.getPadron(),
          evaluaciones_iniciales_6_escalas: StorageService.getEvaluations(),
          notas_evolucion_soap: StorageService.getEvolutionNotes(),
          notas_sesion_familiar: StorageService.getFamilyNotes(),
          narraciones_semanales_v1: StorageService.getWeeklyNarratives(),
          entrevistas_exploratorias: StorageService.getInterviews(),
          usuarios_cuentas: StorageService.getUsers(),
          bitacora_auditoria_inmutable: StorageService.getAuditLog(),
        },
        motor_autoencoder: {
          pesos_matriz_24x12: AutoencoderEngine.getActiveWeights(),
          parametros_normalizacion: AutoencoderEngine.getActiveNormalizationParams(),
          es_personalizado: AutoencoderEngine.hasCustomWeights(),
        },
        esquemas_sql: {
          esquema_cenivra_canonico: ESQUEMA_SQL_CENIVRA,
          generar_usuarios_claves: SCRIPT_SQL_USUARIOS_CLAVES,
        },
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const jsonFileName = `SISAP_CENIVRA_RESPALDO_TOTAL_${timestamp}.json`;
      const sqlFileName = `ESQUEMA_SQL_CENIVRA_${timestamp}.sql`;

      await uploadClinicalFileToDrive(
        jsonFileName,
        JSON.stringify(fullPackage, null, 2),
        'application/json'
      );

      await uploadClinicalFileToDrive(sqlFileName, ESQUEMA_SQL_CENIVRA, 'text/sql');

      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Respaldo Institucional Total a Google Drive',
        exp: 'SISTEMA-ROOT',
        detalles: `Subido paquete completo: ${jsonFileName} y ${sqlFileName}`,
      });

      setStatusMessage({
        type: 'ok',
        text: `¡Respaldo Total del Sistema guardado exitosamente en tu Google Drive! (${jsonFileName})`,
      });
      await fetchFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'err', text: err.message || 'Error al exportar respaldo total a Drive.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const target = fileToDelete;
    setFileToDelete(null);
    setLoading(true);
    try {
      await deleteDriveClinicalFile(target.id);
      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Eliminación de archivo en Google Drive',
        exp: '—',
        detalles: `Archivo eliminado: ${target.name} (ID: ${target.id})`,
      });
      setStatusMessage({ type: 'ok', text: `Archivo "${target.name}" eliminado de Google Drive.` });
      await fetchFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'err', text: err.message || 'Error al eliminar archivo en Drive.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--sep)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--accion-fondo)]/20 text-[var(--accion)] rounded">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Google Drive · Respaldo y Gobernanza Cloud</h2>
              <div className="text-xs text-[var(--texto-tenue)]">
                Carpeta: <code className="text-[var(--accion)]">SISAP CENIVRA - Expedientes Clínicos</code>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--texto-tenue)] hover:text-[var(--texto)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-3 rounded mb-4 text-xs flex items-center gap-2 border ${
              statusMessage.type === 'ok'
                ? 'bg-[var(--normal)]/10 text-[var(--normal)] border-[var(--normal)]/30'
                : 'bg-[var(--riesgo)]/10 text-[var(--riesgo)] border-[var(--riesgo)]/30'
            }`}
          >
            {statusMessage.type === 'ok' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-[var(--texto-tenue)] hover:text-[var(--texto)]"
            >
              ×
            </button>
          </div>
        )}

        {/* Auth section */}
        {!googleUser ? (
          <div className="sisap-captura space-y-3">
            <h3 className="font-semibold text-sm">Vincular almacenamiento en la nube</h3>
            <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
              Para habilitar la exportación institucional de expedientes, copias de seguridad de la base de datos y paquetes de datos anonimizados para investigación clínica, inicie sesión con su cuenta de Google.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '18px', height: '18px' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium">
                    {loading ? 'Conectando...' : 'Iniciar sesión con Google'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active connection card */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--campo)] border border-[var(--sep)] rounded">
              <div className="flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full border border-[var(--borde)]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--accion-fondo)] text-white flex items-center justify-center font-bold text-xs">
                    {googleUser.email ? googleUser.email[0].toUpperCase() : 'G'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold">{googleUser.displayName || googleUser.email}</div>
                  <div className="text-[11px] text-[var(--texto-tenue)] font-mono">{googleUser.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchFiles}
                  disabled={loading}
                  className="sisap-btn-sec py-1 px-2.5 text-xs"
                  title="Actualizar lista de archivos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refrescar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="sisap-btn-sec py-1 px-2.5 text-xs text-[var(--riesgo)]"
                >
                  Desconectar
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sisap-tarjeta p-3.5 space-y-2 mb-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--texto)]">
                  <FileText className="w-4 h-4 text-[var(--accion)]" />
                  <span>Expediente: {selectedPseudonym}</span>
                </div>
                <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                  Exporta el expediente completo del paciente (intervenciones, escalas, notas y análisis) en JSON estructurado.
                </p>
                <button
                  type="button"
                  onClick={handleExportPatientDossier}
                  disabled={loading}
                  className="sisap-btn w-full text-xs py-1.5"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Exportar Expediente a Drive</span>
                </button>
              </div>

              <div className="sisap-tarjeta p-3.5 space-y-2 mb-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--texto)]">
                  <Database className="w-4 h-4 text-[var(--normal)]" />
                  <span>Dataset Anónimo de Cohorte</span>
                </div>
                <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                  Genera matriz desidentificada con vectores de 24 columnas, diagnósticos y evolución para investigación.
                </p>
                <button
                  type="button"
                  onClick={handleExportResearchDataset}
                  disabled={loading}
                  className="sisap-btn-sec w-full text-xs py-1.5 text-[var(--normal)] border-[var(--normal)]/40 hover:bg-[var(--normal)]/10"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Exportar Dataset a Drive</span>
                </button>
              </div>

              {/* Full System Backup to Google Drive */}
              <div className="col-span-1 sm:col-span-2 sisap-tarjeta p-3.5 space-y-2 mb-0 bg-[var(--accion-fondo)]/10 border border-[var(--accion)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accion)]">
                    <Archive className="w-4 h-4" />
                    <span>Respaldo Total del Sistema (Base de Datos, Esquemas SQL y Pesos del Autoencoder)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--normal)] font-bold">1-Clic</span>
                </div>
                <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                  Sube directamente a tu Google Drive el archivo maestro <code>SISAP_CENIVRA_RESPALDO_TOTAL.json</code> (con pacientes, evaluaciones de 6 escalas, notas SOAP, bitácora inmutable y pesos del modelo) junto con el script <code>ESQUEMA_SQL_CENIVRA.sql</code>.
                </p>
                <button
                  type="button"
                  onClick={handleExportFullSystemBackup}
                  disabled={loading}
                  className="sisap-btn w-full text-xs py-2 font-bold inline-flex items-center justify-center gap-2"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>Subir Respaldo Total del Sistema a mi Google Drive</span>
                </button>
              </div>
            </div>

            {/* Files List */}
            <div className="sisap-captura mb-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--texto-sec)]">
                  Archivos en la carpeta de Drive ({driveFiles.length})
                </h3>
              </div>

              {driveFiles.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--texto-tenue)]">
                  {loading ? 'Cargando archivos desde Google Drive...' : 'No hay expedientes exportados en esta carpeta aún.'}
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto divide-y divide-[var(--sep-claro)]">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="py-2 px-1 flex items-center justify-between gap-3 text-xs hover:bg-[var(--panel)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[var(--accion)] shrink-0" />
                        <div className="truncate">
                          <div className="font-mono text-xs truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-[10px] text-[var(--texto-tenue)]">
                            {file.createdTime ? new Date(file.createdTime).toLocaleString('es-MX') : '—'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sisap-btn-sec p-1 text-[var(--accion)]"
                            title="Abrir en Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setFileToDelete(file)}
                          className="sisap-btn-danger p-1"
                          title="Eliminar de Google Drive (requiere confirmación)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 mt-4 border-t border-[var(--sep-claro)]">
          <button type="button" onClick={onClose} className="sisap-btn-sec">
            Cerrar
          </button>
        </div>
      </div>

      {/* Explicit User Confirmation Dialog for Destructive Operations (MANDATORY per Workspace Skill) */}
      <ConfirmationModal
        isOpen={!!fileToDelete}
        title="¿Eliminar archivo de Google Drive?"
        message={`Está a punto de eliminar permanentemente el archivo "${fileToDelete?.name}" de su cuenta de Google Drive. Esta acción no se puede deshacer.`}
        details={fileToDelete ? `ID: ${fileToDelete.id}` : undefined}
        confirmLabel="Sí, eliminar archivo"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={confirmDeleteFile}
        onCancel={() => setFileToDelete(null)}
      />
    </div>
  );
};
