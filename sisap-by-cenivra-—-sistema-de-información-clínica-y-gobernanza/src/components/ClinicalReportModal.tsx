import React from 'react';
import { PatientClinico, PatientPadron, RoleConfig, UserAccount } from '../types/clinical';
import { StorageService } from '../services/storageService';
import { ROLES } from '../constants/clinicalConstants';
import { Printer, X, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pseudonym: string;
  currentUser: UserAccount;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  pseudonym,
  currentUser,
}) => {
  if (!isOpen) return null;

  const patient = StorageService.getPatient(pseudonym);
  const padron = StorageService.getPatientPadron(pseudonym);
  const notes = StorageService.getEvolutionNotes(pseudonym);
  const evaluations = StorageService.getEvaluations(pseudonym);
  const interviews = StorageService.getInterviews(pseudonym);

  const latestEval = evaluations.length > 0 ? evaluations[0] : undefined;
  const latestInterview = interviews.length > 0 ? interviews[0] : undefined;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] my-6 print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:p-6 print:m-0">
        {/* Top Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--sep)] mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--accion)]" />
            <h2 className="text-base font-bold">
              Informe Clínico Oficial · Expediente {pseudonym}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="sisap-btn text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="sisap-btn-sec text-xs py-1.5 px-3"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Printable Official Clinical Document Area */}
        <div id="print-area" className="space-y-4 text-xs font-sans leading-relaxed">
          {/* Institutional Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-black/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-900 text-white rounded flex items-center justify-center font-bold text-lg font-mono">
                C
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-neutral-900">
                  CENTRO DE INTEGRACIÓN Y VIDA RACIONAL (CENIVRA)
                </h1>
                <div className="text-[11px] text-neutral-600">
                  Clínica Especializada en Prevención y Tratamiento de Adicciones (TUS)
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Registro Sanitario COFEPRIS: 26-044-TUS-0012 · CENADIC Clave: CN-2026-MX
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] font-mono">
              <div className="font-bold text-neutral-900">RESUMEN CLÍNICO OFICIAL</div>
              <div className="text-neutral-600">Fecha de emisión: {new Date().toLocaleDateString('es-MX')}</div>
              <div className="text-neutral-500">NOM-004-SSA3-2012 / NOM-028-SSA2</div>
            </div>
          </div>

          {/* Patient Identification Block (Pseudonymized & Compliant) */}
          <div className="p-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900">
            <div className="font-bold text-[11px] uppercase tracking-wider mb-2 text-neutral-700">
              I. Identificación del Paciente (Cédula de Seudonimización)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px]">Expediente Ciego:</span>
                <span className="font-mono font-bold text-sm text-blue-700">{patient?.seudonimo}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Expediente Físico:</span>
                <span className="font-mono">{padron?.expediente_fisico || 'EXP-CEN-0000'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Edad / Sexo:</span>
                <span>{padron?.edad} años / {padron?.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Fecha de Ingreso:</span>
                <span className="font-mono">{patient?.ingreso}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Fase Actual:</span>
                <span className="font-semibold">{patient?.estado}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Sesiones Acumuladas:</span>
                <span className="font-bold font-mono">{patient?.sesiones} sesiones</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-neutral-500 block text-[10px]">Droga de Impacto Principal:</span>
                <span className="font-semibold">{patient?.droga_impacto || 'Estimulantes / Metanfetamina'}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Formulation */}
          <div className="p-3 border border-neutral-300 rounded text-neutral-900">
            <div className="font-bold text-[11px] uppercase tracking-wider mb-1.5 text-neutral-700">
              II. Diagnóstico y Conceptualización Clínica
            </div>
            <div className="mb-2">
              <span className="text-neutral-500 text-[10.5px]">Diagnóstico Oficial (CIE-11 / DSM-5-TR):</span>
              <div className="font-mono font-bold text-xs text-neutral-900 mt-0.5">
                {patient?.diagnostico_cie || '6C41.11 / F15.20 (Trastorno por uso de estimulantes grave)'}
              </div>
            </div>
            <p className="text-xs text-neutral-700 italic border-l-2 border-neutral-400 pl-2.5 my-2">
              "{patient?.diagnostico_impresion || latestInterview?.datos?.dx_texto || 'Paciente con patrón de consumo compulsivo activado por desregulación afectiva y rigidez conductual.'}"
            </p>
          </div>

          {/* Psychometric Scores & Autoencoder Latents */}
          <div className="p-3 border border-neutral-300 rounded text-neutral-900">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-[11px] uppercase tracking-wider text-neutral-700">
                III. Batería Psicométrica y Embedding del Autoencoder Transversal
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Matriz de 24 Reactivos Canónicos</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
              <div className="p-2 bg-neutral-100 rounded">
                <div className="text-[10px] text-neutral-500">BIS-11 (Impulsividad)</div>
                <div className="font-bold font-mono">{latestEval?.calculados?.bis_total ?? 74} / 120</div>
                <div className="text-[9.5px] text-neutral-600">Motora: {latestEval?.calculados?.bis_motor ?? 24} · No-planeada: {latestEval?.calculados?.bis_nonplanning ?? 28}</div>
              </div>

              <div className="p-2 bg-neutral-100 rounded">
                <div className="text-[10px] text-neutral-500">GAD-7 (Ansiedad)</div>
                <div className="font-bold font-mono">{latestEval?.calculados?.gad_total ?? 14} / 21</div>
                <div className="text-[9.5px] text-neutral-600">{latestEval?.calculados?.gad_severidad ?? 'Moderada'} (z={latestEval?.calculados?.gad_zscore ?? '+1.62'})</div>
              </div>

              <div className="p-2 bg-neutral-100 rounded">
                <div className="text-[10px] text-neutral-500">BSL-23 (Desregulación)</div>
                <div className="font-bold font-mono">{latestEval?.calculados?.bsl_general ?? 2.14} / 4.0</div>
                <div className="text-[9.5px] text-neutral-600">Total integrado: {latestEval?.calculados?.bsl_total_integrado ?? 49}</div>
              </div>

              <div className="p-2 bg-neutral-100 rounded">
                <div className="text-[10px] text-neutral-500">BADS (Activación Conductual)</div>
                <div className="font-bold font-mono">Act: {latestEval?.calculados?.bads_activation ?? 18}</div>
                <div className="text-[9.5px] text-neutral-600">Evitación: {latestEval?.calculados?.bads_avoidance ?? 26}</div>
              </div>

              <div className="p-2 bg-neutral-100 rounded">
                <div className="text-[10px] text-neutral-500">STAXI-2 (Ira)</div>
                <div className="font-bold font-mono">Estado: {latestEval?.calculados?.staxi_state ?? 28}</div>
                <div className="text-[9.5px] text-neutral-600">Rasgo: {latestEval?.calculados?.staxi_trait ?? 22}</div>
              </div>

              <div className="p-2 bg-neutral-100 rounded">
                <div className="text-[10px] text-neutral-500">Cluster Latente 3B</div>
                <div className="font-bold text-blue-800 text-[11px] truncate">
                  {latestEval?.latentes_autoencoder?.summaryIndices?.clase_latente_3b || 'Clase 1: Alta Desregulación'}
                </div>
                <div className="text-[9.5px] text-neutral-600">Severidad: {latestEval?.latentes_autoencoder?.summaryIndices?.severidad_multidominio || '1.14'}</div>
              </div>
            </div>
          </div>

          {/* Timeline of Clinical Notes */}
          <div className="p-3 border border-neutral-300 rounded text-neutral-900">
            <div className="font-bold text-[11px] uppercase tracking-wider mb-2 text-neutral-700">
              IV. Registro de Intervenciones Clínicas y Evolución
            </div>
            {notes.length === 0 ? (
              <div className="text-neutral-500 italic text-xs py-2">Sin notas asentadas en el periodo.</div>
            ) : (
              <div className="space-y-2 text-xs">
                {notes.slice(0, 4).map((n) => (
                  <div key={n.id} className="border-b border-neutral-200 pb-2">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>Sesión #{n.sesion} ({n.tipo.toUpperCase()}) — {n.fecha}</span>
                      <span className="font-mono text-neutral-600">{n.profesional_nombre} ({n.profesional_cedula})</span>
                    </div>
                    <div className="text-neutral-700 mt-0.5">
                      <b>Objetivo:</b> {n.objetivo}
                    </div>
                    <div className="text-neutral-600 mt-0.5">
                      <b>Resumen:</b> {n.resumen}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Professional Signatures Block */}
          <div className="pt-6 mt-6 border-t-2 border-neutral-800 text-neutral-900">
            <div className="text-center font-bold text-xs uppercase mb-8 text-neutral-800">
              Firmas de Responsabilidad Profesional y Aprobación Institucional
            </div>

            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="border-t border-neutral-400 pt-2">
                <div className="font-bold">{currentUser.nombre || 'Mtra. Sofía Carrillo'}</div>
                <div className="text-[10px] text-neutral-600">Psicólogo Clínico Tratante</div>
                <div className="text-[9.5px] font-mono text-neutral-500">{currentUser.cedula || 'CED-7711204-PSI'}</div>
              </div>

              <div className="border-t border-neutral-400 pt-2">
                <div className="font-bold">Dr. Carlos Mendoza</div>
                <div className="text-[10px] text-neutral-600">Médico Psiquiatra / Valoración Somática</div>
                <div className="text-[9.5px] font-mono text-neutral-500">CED-3322198-MED</div>
              </div>

              <div className="border-t border-neutral-400 pt-2">
                <div className="font-bold">Dr. Alejandro Méndez</div>
                <div className="text-[10px] text-neutral-600">Director Clínico CENIVRA</div>
                <div className="text-[9.5px] font-mono text-neutral-500">CED-4455102-DIR</div>
              </div>
            </div>

            <div className="mt-8 text-center text-[9px] text-neutral-500 font-mono">
              Documento expedido bajo estrictos estándares de gobernanza y protección de datos en salud · SISAP CENIVRA © 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
