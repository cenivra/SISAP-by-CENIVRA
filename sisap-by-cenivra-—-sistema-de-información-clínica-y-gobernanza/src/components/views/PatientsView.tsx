import React, { useState, useEffect } from 'react';
import { PatientClinico, PatientPadron, RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  PatientApiService,
  PatientSearchResult,
  PatientDuplicateCheck,
  ClinicalRecordPayload,
} from '../../services/patientApiService';
import {
  Users,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  AlertTriangle,
  FolderOpen,
  CloudUpload,
  Activity,
  HeartHandshake,
  BookOpen,
  CheckCircle,
  Clock,
  Search,
  Database,
  AlertCircle,
} from 'lucide-react';

interface PatientsViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  onSelectPseudonym: (pseudonym: string) => void;
  isAnonymousMode: boolean;
  onToggleAnonymous: () => void;
  onOpenDriveModal: () => void;
}

function maskName(name: string): string {
  if (!name) return '—';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => (part.length <= 2 ? `${part[0]}*` : `${part[0]}${'*'.repeat(Math.min(part.length - 1, 4))}`))
    .join(' ');
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  onSelectPseudonym,
  isAnonymousMode,
  onToggleAnonymous,
  onOpenDriveModal,
}) => {
  const [patients, setPatients] = useState<PatientClinico[]>(StorageService.getPatients());
  const [padronList, setPadronList] = useState<PatientPadron[]>(StorageService.getPadron());
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showReidentModal, setShowReidentModal] = useState(false);
  const [reidentJustification, setReidentJustification] = useState('');
  const [unmaskedPatient, setUnmaskedPatient] = useState<string | null>(null);

  // Backend SQL status and data
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [backendDbPath, setBackendDbPath] = useState<string | null>(null);
  const [activeSqlRecord, setActiveSqlRecord] = useState<ClinicalRecordPayload | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Duplicate warning state in modal
  const [duplicateMatches, setDuplicateMatches] = useState<PatientDuplicateCheck[]>([]);
  const [confirmDuplicateCreation, setConfirmDuplicateCreation] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);

  // New patient form state
  const [newPatientForm, setNewPatientForm] = useState({
    nombre_completo: '',
    curp: '',
    expediente_fisico: '',
    fecha_nacimiento: '1995-06-15',
    edad: 31,
    sexo: 'M' as 'M' | 'F' | 'Otro',
    contacto_emergencia: '',
    telefono_emergencia: '',
    ingreso: new Date().toISOString().split('T')[0],
    estado: 'Residencial' as PatientClinico['estado'],
    droga_impacto: 'Metanfetamina / Estimulantes',
    diagnostico_cie: '6C41.11 / F15.20 (Dependencia de estimulantes)',
  });

  // Check health on mount
  useEffect(() => {
    let isMounted = true;
    PatientApiService.checkHealth().then((res) => {
      if (isMounted) {
        setBackendOnline(res.ok);
        if (res.dbPath) setBackendDbPath(res.dbPath);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch SQL record when selected pseudonym changes
  useEffect(() => {
    if (!backendOnline || !selectedPseudonym) return;

    let isMounted = true;
    PatientApiService.getPatientRecord(selectedPseudonym)
      .then((record) => {
        if (isMounted) setActiveSqlRecord(record);
      })
      .catch(() => {
        if (isMounted) setActiveSqlRecord(null);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPseudonym, backendOnline]);

  const reloadData = () => {
    setPatients(StorageService.getPatients());
    setPadronList(StorageService.getPadron());
  };

  const currentPatient = patients.find((p) => p.seudonimo === selectedPseudonym) || patients[0];
  const currentPadron = padronList.find((p) => p.seudonimo === selectedPseudonym) || padronList[0];

  // Notes and history
  const notes = StorageService.getEvolutionNotes(selectedPseudonym);
  const evaluations = StorageService.getEvaluations(selectedPseudonym);

  // Search handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchError('El criterio de búsqueda debe tener al menos 2 caracteres.');
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setSearchError(null);
    setIsSearching(true);
    setHasSearched(true);

    try {
      if (backendOnline) {
        const results = await PatientApiService.searchPatients(query);
        setSearchResults(results);
      } else {
        // Fallback local search
        const norm = query.toLowerCase();
        const matches = padronList
          .filter(
            (p) =>
              p.nombre_completo.toLowerCase().includes(norm) ||
              (p.curp && p.curp.toLowerCase().includes(norm)) ||
              p.seudonimo.toLowerCase().includes(norm)
          )
          .slice(0, 10)
          .map((p) => {
            const clin = patients.find((c) => c.seudonimo === p.seudonimo);
            return {
              patient_id: p.seudonimo,
              pseudonym: p.seudonimo,
              nombre_completo: p.nombre_completo,
              estado: clin?.estado || 'Residencial',
              actualizado_en: p.creado_en,
              es_dato_prueba: 0,
            };
          });
        setSearchResults(matches);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al buscar pacientes';
      setSearchError(msg);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFromSearch = async (res: PatientSearchResult) => {
    // Explicit user selection (never auto-select on ambiguity)
    onSelectPseudonym(res.pseudonym);
    setUnmaskedPatient(null);

    // If backend online, fetch the full clinical record
    if (backendOnline) {
      try {
        const rec = await PatientApiService.getPatientRecord(res.patient_id);
        setActiveSqlRecord(rec);
      } catch {
        // Fallback gracefully
      }
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.nombre_completo.trim()) {
      alert('Por favor ingrese el nombre completo del paciente para el padrón.');
      return;
    }

    setIsSubmittingPatient(true);

    // Duplicate check if backend is online and user hasn't explicitly confirmed
    if (backendOnline && !confirmDuplicateCreation) {
      try {
        const duplicates = await PatientApiService.checkDuplicates(
          newPatientForm.nombre_completo,
          newPatientForm.curp
        );
        if (duplicates.length > 0) {
          setDuplicateMatches(duplicates);
          setIsSubmittingPatient(false);
          return;
        }
      } catch {
        // Continue if duplicate endpoint fails
      }
    }

    try {
      // 1. Save in SQL backend if connected
      let assignedPseudonym = '';
      if (backendOnline) {
        try {
          const apiRes = await PatientApiService.createPatient(
            {
              nombre_completo: newPatientForm.nombre_completo,
              curp: newPatientForm.curp,
              expediente_fisico: newPatientForm.expediente_fisico,
              fecha_nacimiento: newPatientForm.fecha_nacimiento,
              edad: newPatientForm.edad,
              sexo: newPatientForm.sexo,
              estado: newPatientForm.estado,
              contacto_emergencia: newPatientForm.contacto_emergencia,
              telefono_emergencia: newPatientForm.telefono_emergencia,
            },
            confirmDuplicateCreation
          );
          assignedPseudonym = apiRes.patient.pseudonym;
        } catch (apiErr: unknown) {
          const errorObj = apiErr as { isDuplicate?: boolean; message?: string };
          if (errorObj.isDuplicate) {
            const duplicates = await PatientApiService.checkDuplicates(
              newPatientForm.nombre_completo,
              newPatientForm.curp
            );
            setDuplicateMatches(duplicates);
            setIsSubmittingPatient(false);
            return;
          }
        }
      }

      // 2. Synchronize with local storage
      const created = StorageService.createNewPatient({
        ...newPatientForm,
        creado_por: currentUser.u,
      });

      const finalPseudonym = assignedPseudonym || created.clinico.seudonimo;

      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Alta de nuevo paciente y generación de seudónimo',
        exp: finalPseudonym,
        detalles: `Asignado seudónimo: ${finalPseudonym}. Identidad resguardada en padrón SQL.`,
      });

      reloadData();
      onSelectPseudonym(finalPseudonym);
      setShowNewPatientModal(false);
      setDuplicateMatches([]);
      setConfirmDuplicateCreation(false);
      setNewPatientForm({
        nombre_completo: '',
        curp: '',
        expediente_fisico: '',
        fecha_nacimiento: '1995-06-15',
        edad: 31,
        sexo: 'M',
        contacto_emergencia: '',
        telefono_emergencia: '',
        ingreso: new Date().toISOString().split('T')[0],
        estado: 'Residencial',
        droga_impacto: 'Metanfetamina / Estimulantes',
        diagnostico_cie: '6C41.11 / F15.20 (Dependencia de estimulantes)',
      });

      alert(`Paciente registrado con éxito.\nSeudónimo asignado: ${finalPseudonym}`);
    } finally {
      setIsSubmittingPatient(false);
    }
  };

  const handlePerformReidentification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reidentJustification.trim()) {
      alert('Debe especificar una justificación clínica o legal para levantar la reserva de identidad.');
      return;
    }

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Reidentificación de identidad',
      exp: selectedPseudonym,
      motivo: reidentJustification,
      detalles: `Nombre consultado en padrón: ${currentPadron?.nombre_completo}`,
    });

    setUnmaskedPatient(selectedPseudonym);
    setShowReidentModal(false);
    setReidentJustification('');
  };

  const handleUpdateStatus = (newStatus: PatientClinico['estado']) => {
    if (!currentPatient) return;
    const updated = { ...currentPatient, estado: newStatus, ultima_actualizacion: new Date().toLocaleString('es-MX') };
    StorageService.savePatient(updated);
    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Cambio de fase clínica',
      exp: currentPatient.seudonimo,
      detalles: `Nuevo estado: ${newStatus}`,
    });
    reloadData();
  };

  const canUnmask = roleConfig.reidentifica;
  const isUnmasked = unmaskedPatient === selectedPseudonym && !isAnonymousMode;
  const isFixtureData = activeSqlRecord?.patient?.es_dato_prueba === 1;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header & Connectivity Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">Padrón y Ficha del Paciente</h2>
            {backendOnline === true && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--normal)]/15 text-[var(--normal)] border border-[var(--normal)]/30">
                <Database className="w-3 h-3" />
                SQLite Local Activo (127.0.0.1:8080)
              </span>
            )}
            {backendOnline === false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--advertencia)]/15 text-[var(--advertencia)] border border-[var(--advertencia)]/30">
                <AlertCircle className="w-3 h-3" />
                Modo Navegador (Servicio Local Desconectado)
              </span>
            )}
          </div>
          <div className="text-xs text-[var(--texto-tenue)]">
            Separación estructural estricta entre Identidad (Padrón SQL) y Datos Clínicos (Expediente Ciego)
          </div>
        </div>

        <div className="flex items-center gap-2">
          {roleConfig.escribe && (
            <button
              onClick={() => {
                setDuplicateMatches([]);
                setConfirmDuplicateCreation(false);
                setShowNewPatientModal(true);
              }}
              className="sisap-btn text-xs py-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrar Paciente</span>
            </button>
          )}

          <button
            onClick={onOpenDriveModal}
            className="sisap-btn-sec text-xs py-1.5 text-[var(--accion)]"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Respaldar en Drive</span>
          </button>
        </div>
      </div>

      {/* Synthetic Fixture Indicator Banner */}
      {isFixtureData && (
        <div className="p-2.5 rounded bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/30 text-xs text-[var(--advertencia)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <b>AVISO DE CONTROL:</b> Este expediente corresponde a un <b>DATO DE PRUEBA SINTÉTICO (FIXTURE)</b>.
              No contiene información de pacientes reales ni debe emplearse para inferencia clínica.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--advertencia)]/20">
            ES_DATO_PRUEBA = 1
          </span>
        </div>
      )}

      {/* Search Bar Section */}
      <div className="sisap-tarjeta p-3.5">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--texto-tenue)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar paciente por nombre o CURP (mínimo 2 caracteres)..."
              className="sisap-input pl-9 text-xs w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="sisap-btn text-xs py-1.5 px-4 inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setHasSearched(false);
                  setSearchError(null);
                }}
                className="sisap-btn-sec text-xs py-1.5 px-3"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        {searchError && (
          <div className="mt-2 text-xs text-[var(--error)] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Search Results Display */}
        {hasSearched && (
          <div className="mt-3 pt-3 border-t border-[var(--sep)]">
            <div className="text-[11px] font-semibold text-[var(--texto-sec)] mb-2 flex items-center justify-between">
              <span>Coincidencias encontradas ({searchResults.length}) · Selección explícita requerida:</span>
              <span className="text-[10px] text-[var(--texto-tenue)]">
                Consulta parametrizada (sin enumeración total)
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 text-center rounded bg-[var(--campo)] border border-[var(--sep)] text-xs text-[var(--texto-tenue)] space-y-2">
                <div>No se encontraron coincidencias para "{searchQuery}".</div>
                {roleConfig.escribe && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewPatientForm({
                        ...newPatientForm,
                        nombre_completo: searchQuery,
                      });
                      setDuplicateMatches([]);
                      setConfirmDuplicateCreation(false);
                      setShowNewPatientModal(true);
                    }}
                    className="sisap-btn-sec text-xs py-1 px-3 text-[var(--accion)] inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Registrar nuevo paciente con este nombre</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--sep)] text-[var(--texto-tenue)] text-[10px] uppercase font-mono">
                      <th className="py-1.5 px-2">Seudónimo</th>
                      <th className="py-1.5 px-2">Nombre en Padrón</th>
                      <th className="py-1.5 px-2">Estado</th>
                      <th className="py-1.5 px-2">Tipo</th>
                      <th className="py-1.5 px-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sep)]">
                    {searchResults.map((res) => {
                      const isCurrent = res.pseudonym === selectedPseudonym;
                      const displayName =
                        isAnonymousMode
                          ? '[Protegido en vista anónima]'
                          : roleConfig.ve_identidad || roleConfig.reidentifica
                          ? res.nombre_completo
                          : maskName(res.nombre_completo);

                      return (
                        <tr
                          key={res.patient_id}
                          className={`hover:bg-[var(--campo)] transition-colors ${
                            isCurrent ? 'bg-[var(--captura)]' : ''
                          }`}
                        >
                          <td className="py-2 px-2 font-mono font-bold text-[var(--accion)]">
                            {res.pseudonym}
                          </td>
                          <td className="py-2 px-2 text-[var(--texto)]">
                            {displayName}
                          </td>
                          <td className="py-2 px-2 text-[var(--texto-sec)]">
                            {res.estado}
                          </td>
                          <td className="py-2 px-2">
                            {res.es_dato_prueba === 1 ? (
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-[var(--advertencia)]/20 text-[var(--advertencia)]">
                                TEST/FIXTURE
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono text-[var(--texto-tenue)]">
                                REGULAR
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              onClick={() => handleSelectFromSearch(res)}
                              className={`py-1 px-2.5 rounded text-xs transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-[var(--accion)] text-[var(--foco-texto)] font-semibold'
                                  : 'sisap-btn-sec'
                              }`}
                            >
                              {isCurrent ? 'Expediente Activo' : 'Seleccionar Expediente'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Patient selector pills bar */}
      <div className="p-3 bg-[var(--panel)] border border-[var(--sep-claro)] rounded flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-[var(--texto-sec)] whitespace-nowrap">
          Expedientes Recientes:
        </label>
        <div className="flex flex-wrap gap-2 flex-1">
          {patients.map((p) => {
            const isSelected = p.seudonimo === selectedPseudonym;
            return (
              <button
                key={p.seudonimo}
                onClick={() => {
                  onSelectPseudonym(p.seudonimo);
                  setUnmaskedPatient(null);
                }}
                className={`px-3 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--captura)] text-[var(--accion)] border-[var(--accion)] font-bold shadow-xs'
                    : 'bg-[var(--campo)] text-[var(--texto-sec)] border-[var(--borde)] hover:text-[var(--texto)]'
                }`}
              >
                {isAnonymousMode ? `EXP-${p.seudonimo.slice(-4)}` : p.seudonimo}
                <span className="ml-1.5 text-[10px] text-[var(--texto-tenue)] font-sans">
                  ({p.estado})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Governance & Identity Banner */}
      <div className="sisap-tarjeta">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-[var(--sep-claro)]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--accion)]" />
            <h3 className="text-sm font-semibold">Identificación y Reserva de Datos</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAnonymous}
              className="sisap-btn-sec py-1 px-2.5 text-xs inline-flex items-center gap-1"
            >
              {isAnonymousMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isAnonymousMode ? 'Desactivar Modo Anónimo' : 'Activar Modo Anónimo'}</span>
            </button>

            {canUnmask && !isUnmasked && !isAnonymousMode && (
              <button
                onClick={() => setShowReidentModal(true)}
                className="sisap-btn py-1 px-2.5 text-xs bg-[var(--advertencia)] text-[var(--foco-texto)] font-semibold inline-flex items-center gap-1"
                title="Levantar reserva de identidad dejando registro en bitácora inmutable WORM"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Recuperar Nombre Real (Auditado)</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)]">Seudónimo (viaja con el expediente):</span>
              <span className="font-mono font-bold text-[var(--accion)]">{currentPatient?.seudonimo}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)]">Nombre Completo (vive en padrón SQL):</span>
              <span className="font-semibold">
                {isAnonymousMode ? (
                  <span className="text-[var(--texto-tenue)] font-mono">[Oculto en vista anónima]</span>
                ) : isUnmasked ? (
                  <span className="text-[var(--normal)] font-bold">{currentPadron?.nombre_completo}</span>
                ) : canUnmask ? (
                  <span className="text-[var(--advertencia)] font-mono">
                    (Reservado · Requiere reidentificación justificada)
                  </span>
                ) : (
                  <span className="text-[var(--texto-tenue)] font-mono">
                    (Acceso no autorizado para rol {currentUser.rol})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)]">Expediente Físico en Archivo:</span>
              <span className="font-mono">{currentPadron?.expediente_fisico || 'EXP-CEN-0000'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)]">CURP / Identificador Oficial:</span>
              <span className="font-mono">
                {isUnmasked ? currentPadron?.curp || 'No registrado' : '******************'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)]">Contacto de Emergencia:</span>
              <span>
                {isUnmasked
                  ? `${currentPadron?.contacto_emergencia || '—'} (${currentPadron?.telefono_emergencia || '—'})`
                  : 'Protegido por padrón'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)]">Registro en Padrón:</span>
              <span>{currentPadron?.creado_en} por {currentPadron?.creado_por}</span>
            </div>
          </div>
        </div>

        {isUnmasked && (
          <div className="mt-3 p-2.5 rounded bg-[var(--normal)]/10 border border-[var(--normal)]/30 text-xs text-[var(--normal)] flex items-center justify-between">
            <span>
              ✓ Identidad unmasked temporalmente en esta sesión. La acción ha sido registrada en la Bitácora de Acceso (WORM inmutable).
            </span>
            <button
              onClick={() => setUnmaskedPatient(null)}
              className="underline text-[11px] text-[var(--texto-sec)] hover:text-[var(--texto)]"
            >
              Volver a enmascarar
            </button>
          </div>
        )}
      </div>

      {/* Clinical Dossier Fields */}
      <div className="sisap-captura">
        <h3 className="text-sm font-semibold mb-1">Parámetros Clínicos del Expediente</h3>
        <div className="text-xs text-[var(--texto-tenue)] mb-4">
          Datos clínicos desvinculados de la identidad personal conforme a normatividad sanitaria.
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-[11px] text-[var(--texto-sec)] mb-1">Fecha de Ingreso</label>
            <input
              type="text"
              readOnly
              value={currentPatient?.ingreso || ''}
              className="sisap-input font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--texto-sec)] mb-1">Fase / Estado de Atención</label>
            <select
              value={currentPatient?.estado}
              disabled={!roleConfig.escribe}
              onChange={(e) => handleUpdateStatus(e.target.value as any)}
              className="sisap-select text-xs font-medium"
            >
              <option value="En desintoxicación">En desintoxicación</option>
              <option value="Residencial">Residencial</option>
              <option value="Ambulatorio">Ambulatorio</option>
              <option value="Seguimiento">Seguimiento</option>
              <option value="Alta por objetivos">Alta por objetivos</option>
              <option value="Baja voluntaria">Baja voluntaria</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[var(--texto-sec)] mb-1">Sesiones Registradas</label>
            <input
              type="text"
              readOnly
              value={`${currentPatient?.sesiones || 0} sesiones`}
              className="sisap-input font-mono text-xs text-center"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--texto-sec)] mb-1">Edad / Sexo</label>
            <input
              type="text"
              readOnly
              value={`${currentPadron?.edad} años / Sexo: ${currentPadron?.sexo}`}
              className="sisap-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
          <div>
            <label className="block text-[11px] text-[var(--texto-sec)] mb-1">Droga de Impacto Principal</label>
            <input
              type="text"
              readOnly
              value={currentPatient?.droga_impacto || 'No especificada'}
              className="sisap-input text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--texto-sec)] mb-1">Diagnóstico Formal (CIE-11 / DSM-5)</label>
            <input
              type="text"
              readOnly
              value={currentPatient?.diagnostico_cie || 'Pendiente de asignación médica'}
              className="sisap-input text-xs font-mono text-[var(--accion)]"
            />
          </div>
        </div>

        {currentPatient?.diagnostico_impresion && (
          <div className="mt-3 p-3 bg-[var(--campo)] rounded border border-[var(--sep)] text-xs">
            <span className="text-[var(--texto-tenue)] font-semibold block mb-1">
              Impresión diagnóstica y conceptualización clínica:
            </span>
            <p className="text-[var(--texto)] leading-relaxed italic">
              "{currentPatient.diagnostico_impresion}"
            </p>
          </div>
        )}
      </div>

      {/* Clinical Dossier History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evolution Notes Timeline */}
        <div className="sisap-tarjeta mb-0">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--sep-claro)]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accion)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Notas de Evolución ({notes.length})
              </h3>
            </div>
            <span className="text-[11px] text-[var(--texto-tenue)] font-mono">
              Exp: {selectedPseudonym}
            </span>
          </div>

          {notes.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--texto-tenue)]">
              No hay notas de evolución registradas para este expediente.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {notes.map((n) => (
                <div key={n.id} className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--texto)]">
                      Sesión #{n.sesion} · {n.tipo.toUpperCase()}
                    </span>
                    <span className="text-[10.5px] text-[var(--texto-tenue)] font-mono">
                      {n.fecha} {n.hora}
                    </span>
                  </div>
                  <div className="text-[var(--texto-sec)]">
                    <b className="text-[var(--texto)]">Objetivo:</b> {n.objetivo}
                  </div>
                  <div className="text-[var(--texto-sec)] leading-relaxed">
                    <b className="text-[var(--texto)]">Resumen:</b> {n.resumen}
                  </div>
                  <div className="pt-1 border-t border-[var(--sep)] flex justify-between text-[10px] text-[var(--texto-tenue)]">
                    <span>Firma: {n.profesional_nombre}</span>
                    <span className="font-mono">{n.profesional_cedula}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Psychometric Evaluations & Autoencoder Status */}
        <div className="sisap-tarjeta mb-0">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--sep-claro)]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--normal)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Batería Psicométrica y Escalas ({evaluations.length})
              </h3>
            </div>
            <span className="est-ok text-[10px]">6 Escalas</span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-[var(--campo)] border border-[var(--sep)] flex justify-between items-center">
                <span>BIS-11 (Impulsividad):</span>
                <span className={currentPatient?.escalas?.BIS_11 ? 'est-ok' : 'est-pend'}>
                  {currentPatient?.escalas?.BIS_11 ? '✓ Capturada' : 'Pendiente'}
                </span>
              </div>
              <div className="p-2 rounded bg-[var(--campo)] border border-[var(--sep)] flex justify-between items-center">
                <span>BSL-23 (Límite):</span>
                <span className={currentPatient?.escalas?.BSL_23 ? 'est-ok' : 'est-pend'}>
                  {currentPatient?.escalas?.BSL_23 ? '✓ Capturada' : 'Pendiente'}
                </span>
              </div>
              <div className="p-2 rounded bg-[var(--campo)] border border-[var(--sep)] flex justify-between items-center">
                <span>GAD-7 (Ansiedad):</span>
                <span className={currentPatient?.escalas?.GAD_7 ? 'est-ok' : 'est-pend'}>
                  {currentPatient?.escalas?.GAD_7 ? '✓ Capturada' : 'Pendiente'}
                </span>
              </div>
              <div className="p-2 rounded bg-[var(--campo)] border border-[var(--sep)] flex justify-between items-center">
                <span>STAXI-2 (Ira):</span>
                <span className={currentPatient?.escalas?.STAXI_2 ? 'est-ok' : 'est-pend'}>
                  {currentPatient?.escalas?.STAXI_2 ? '✓ Capturada' : 'Pendiente'}
                </span>
              </div>
              <div className="p-2 rounded bg-[var(--campo)] border border-[var(--sep)] flex justify-between items-center">
                <span>BADS (Activación):</span>
                <span className={currentPatient?.escalas?.BADS ? 'est-ok' : 'est-pend'}>
                  {currentPatient?.escalas?.BADS ? '✓ Capturada' : 'Pendiente'}
                </span>
              </div>
              <div className="p-2 rounded bg-[var(--campo)] border border-[var(--sep)] flex justify-between items-center">
                <span>EROS (Recompensa):</span>
                <span className={currentPatient?.escalas?.EROS ? 'est-ok' : 'est-pend'}>
                  {currentPatient?.escalas?.EROS ? '✓ Capturada' : 'Pendiente'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs space-y-1">
            <span className="text-[var(--texto-tenue)] font-semibold block">Vectores del Autoencoder:</span>
            <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
              Las 6 escalas integran los 24 reactivos de entrada del modelo canónico. Inferencia clínica desactivada en fase local de auditoría.
            </p>
          </div>
        </div>
      </div>

      {/* New Patient Registration Modal with Duplicate Prevention */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sep)] mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[var(--accion)]" />
                <h3 className="text-base font-bold">Alta de Nuevo Paciente · Separación de Padrón</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewPatientModal(false);
                  setDuplicateMatches([]);
                  setConfirmDuplicateCreation(false);
                }}
                className="text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ×
              </button>
            </div>

            {/* Duplicate Matches Warning Alert */}
            {duplicateMatches.length > 0 && (
              <div className="mb-4 p-3 rounded bg-[var(--advertencia)]/15 border border-[var(--advertencia)]/40 text-xs text-[var(--advertencia)] space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Atención: Se detectaron registros coincidentes en la base de datos</span>
                </div>
                <p className="text-[11px] text-[var(--texto)]">
                  Los siguientes pacientes ya existen con nombre o CURP similar:
                </p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {duplicateMatches.map((m) => (
                    <div
                      key={m.patient_id}
                      className="p-1.5 rounded bg-[var(--campo)] border border-[var(--sep)] text-[11px] flex justify-between items-center text-[var(--texto)]"
                    >
                      <span>
                        <b className="font-mono text-[var(--accion)]">{m.pseudonym}</b> — {m.nombre_completo}
                        {m.coincide_curp && <span className="ml-1 text-[var(--error)] font-bold">(CURP coincide)</span>}
                      </span>
                      <span className="text-[10px] text-[var(--texto-tenue)]">({m.estado})</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-2 border-t border-[var(--advertencia)]/30 text-[11px] font-semibold text-[var(--texto)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmDuplicateCreation}
                    onChange={(e) => setConfirmDuplicateCreation(e.target.checked)}
                    className="accent-[var(--advertencia)]"
                  />
                  <span>
                    Confirmo explícitamente que deseo registrar este expediente a pesar de la coincidencia detectada.
                  </span>
                </label>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div className="p-3 rounded bg-[var(--campo)] border border-[var(--borde)]/40 text-[11px] text-[var(--texto-sec)]">
                <b>Regla de Gobernanza:</b> El nombre completo y datos de contacto quedarán almacenados <i>exclusivamente</i> en la tabla reservada del <b>Padrón SQL</b>. El sistema creará un seudónimo secuencial (<code className="font-mono text-[var(--accion)]">TUS-00XX</code>) con el que operará todo el personal clínico.
              </div>

              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-medium">
                  Nombre Completo del Paciente (Dato Protegido) *
                </label>
                <input
                  type="text"
                  required
                  value={newPatientForm.nombre_completo}
                  onChange={(e) => {
                    setNewPatientForm({ ...newPatientForm, nombre_completo: e.target.value });
                    if (duplicateMatches.length > 0) {
                      setDuplicateMatches([]);
                      setConfirmDuplicateCreation(false);
                    }
                  }}
                  placeholder="Ej. Francisco Javier Morales Ruiz"
                  className="sisap-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">CURP</label>
                  <input
                    type="text"
                    value={newPatientForm.curp}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, curp: e.target.value.toUpperCase() })}
                    placeholder="MORF850214HDFRL01"
                    className="sisap-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Expediente Físico del Centro</label>
                  <input
                    type="text"
                    value={newPatientForm.expediente_fisico}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, expediente_fisico: e.target.value })}
                    placeholder="EXP-CEN-2026-0025"
                    className="sisap-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={newPatientForm.fecha_nacimiento}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, fecha_nacimiento: e.target.value })}
                    className="sisap-input"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Edad</label>
                  <input
                    type="number"
                    value={newPatientForm.edad}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, edad: parseInt(e.target.value, 10) || 0 })}
                    className="sisap-input"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Sexo</label>
                  <select
                    value={newPatientForm.sexo}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, sexo: e.target.value as any })}
                    className="sisap-select"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Familiar de Contacto</label>
                  <input
                    type="text"
                    value={newPatientForm.contacto_emergencia}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, contacto_emergencia: e.target.value })}
                    placeholder="Nombre y parentesco"
                    className="sisap-input"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Teléfono de Emergencia</label>
                  <input
                    type="text"
                    value={newPatientForm.telefono_emergencia}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, telefono_emergencia: e.target.value })}
                    placeholder="55-1234-5678"
                    className="sisap-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Fase Inicial</label>
                  <select
                    value={newPatientForm.estado}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, estado: e.target.value as any })}
                    className="sisap-select"
                  >
                    <option value="En desintoxicación">En desintoxicación</option>
                    <option value="Residencial">Residencial</option>
                    <option value="Ambulatorio">Ambulatorio</option>
                    <option value="Seguimiento">Seguimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Droga de Impacto Principal</label>
                  <input
                    type="text"
                    value={newPatientForm.droga_impacto}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, droga_impacto: e.target.value })}
                    className="sisap-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--sep-claro)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPatientModal(false);
                    setDuplicateMatches([]);
                    setConfirmDuplicateCreation(false);
                  }}
                  className="sisap-btn-sec"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPatient || (duplicateMatches.length > 0 && !confirmDuplicateCreation)}
                  className="sisap-btn"
                >
                  {isSubmittingPatient
                    ? 'Registrando...'
                    : duplicateMatches.length > 0
                    ? 'Confirmar y Crear Registro'
                    : 'Crear Registro en Padrón y Expediente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-identification Authorization Modal */}
      {showReidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)]">
            <div className="flex items-center gap-2 mb-3 text-[var(--advertencia)]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Levantamiento de Reserva de Identidad</h3>
            </div>

            <p className="text-xs text-[var(--texto-sec)] mb-3 leading-relaxed">
              Está solicitando consultar el nombre real del paciente vinculado al expediente ciego{' '}
              <b className="font-mono text-[var(--accion)]">{selectedPseudonym}</b>.
            </p>

            <div className="p-2.5 rounded bg-[var(--fondo)] border border-[var(--sep)] text-[11px] text-[var(--texto-tenue)] mb-4">
              Por disposición de gobernanza, toda reidentificación es registrada de forma inmutable en la{' '}
              <b>Bitácora de Acceso (WORM inmutable)</b> con su usuario (<code className="text-[var(--accion)]">{currentUser.u}</code>), nivel, fecha y motivo asentado.
            </div>

            <form onSubmit={handlePerformReidentification} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                  Justificación Clínica / Legal (Obligatoria):
                </label>
                <textarea
                  required
                  rows={3}
                  value={reidentJustification}
                  onChange={(e) => setReidentJustification(e.target.value)}
                  placeholder="Ej. Entrevista diagnóstica de primera vez con usuario y coterapeuta familiar / Elaboración de informe médico de egreso."
                  className="sisap-textarea text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sep-claro)]">
                <button
                  type="button"
                  onClick={() => setShowReidentModal(false)}
                  className="sisap-btn-sec text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="sisap-btn text-xs bg-[var(--advertencia)] text-[var(--foco-texto)] font-semibold"
                >
                  Asentar en Bitácora y Mostrar Nombre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
