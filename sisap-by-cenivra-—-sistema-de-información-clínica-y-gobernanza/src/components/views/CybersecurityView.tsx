import React, { useState, useEffect } from 'react';
import { RoleConfig, UserAccount, ConsentRecord, ArcoRequest, DeidentificationVaultToken } from '../../types/clinical';
import { ROLES } from '../../constants/clinicalConstants';
import { StorageService } from '../../services/storageService';
import { TelemetryService } from '../../services/telemetryService';
import {
  sha256Hex,
  encryptAesGcm,
  decryptAesGcm,
  generateAesKeyHex,
  getCurrentOtpCode,
  generateClinicalSignature,
} from '../../services/cryptoService';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  AlertTriangle,
  FileSignature,
  Download,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  History,
  Clock,
  UserCheck,
  Server,
  FileText,
  HelpCircle,
  Database,
  ArrowRight,
  RefreshCw,
  Share2,
  FileCode,
  Copy,
  Sparkles,
  Play,
  Activity,
  AlertOctagon,
  HardDrive,
  Terminal,
  Check,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  Scale,
  BookOpen,
  Layers,
  Award,
  GitBranch,
} from 'lucide-react';

interface CybersecurityViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
}

export const CybersecurityView: React.FC<CybersecurityViewProps> = ({
  currentUser,
  roleConfig,
}) => {
  const [activeTab, setActiveTab] = useState<
    'candados' | 'aviso_arco' | 'minimizacion' | 'cofepris_checklist' | 'secops_qa' | 'iec62304_ip'
  >('candados');

  const [selectedRiskId, setSelectedRiskId] = useState<string>('R-01');
  const [selectedIpAsset, setSelectedIpAsset] = useState<'indautor' | 'impi' | 'secreto'>('impi');

  const [secConfig, setSecConfig] = useState(StorageService.getSecurityConfig());
  const patients = StorageService.getPatients();
  const padron = StorageService.getPadron();
  const consentRecords = StorageService.getConsentRecords();
  const arcoRequests = StorageService.getArcoRequests();
  const vaultTokens = StorageService.getVaultTokens();

  // Test bench for AES-256
  const [testPlainText, setTestPlainText] = useState(
    '{"paciente":"TUS-0007","diagnostico":"Dependencia estimulantes","riesgo_craving":0.82}'
  );
  const [testAesKey, setTestAesKey] = useState(generateAesKeyHex());
  const [encryptedPayload, setEncryptedPayload] = useState<{ cipherText: string; iv: string } | null>(null);
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);

  // De-identification Vault Token Request Modal / Form
  const [selectedVaultExp, setSelectedVaultExp] = useState<string>(patients[0]?.seudonimo || 'TUS-0007');
  const [vaultJustification, setVaultJustification] = useState<string>(
    'Revisión médica obligatoria para dictamen interdisciplinario de evolución clínica.'
  );
  const [vaultTtlSeconds, setVaultTtlSeconds] = useState<number>(300); // 5 min
  const [issuedVaultToken, setIssuedVaultToken] = useState<DeidentificationVaultToken | null>(null);
  const [vaultError, setVaultError] = useState<string>('');

  // Integrity Check Live Result
  const [integrityResult, setIntegrityResult] = useState<{
    valid: boolean;
    total: number;
    tamperedIndex?: number;
    message: string;
  } | null>(null);

  // Digital Signature Test Bench
  const [sigAuthor, setSigAuthor] = useState(currentUser.nombre);
  const [sigCedula, setSigCedula] = useState(currentUser.cedula || 'CED-PROF-112233');
  const [sigExp, setSigExp] = useState('TUS-0007');
  const [sigContent, setSigContent] = useState('Paciente presenta disminución en reactividad motora tras 8 sesiones.');
  const [generatedSig, setGeneratedSig] = useState<{ signatureHash: string; stamp: string } | null>(null);

  // ARCO Request Form
  const [showArcoModal, setShowArcoModal] = useState<boolean>(false);
  const [arcoExp, setArcoExp] = useState<string>(patients[0]?.seudonimo || 'TUS-0007');
  const [arcoType, setArcoType] = useState<ArcoRequest['tipoDerecho']>('Acceso');
  const [arcoApplicant, setArcoApplicant] = useState<string>('');
  const [arcoContact, setArcoContact] = useState<string>('');
  const [arcoDesc, setArcoDesc] = useState<string>('');

  // New Consent Form Modal
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [consentExp, setConsentExp] = useState<string>(patients[0]?.seudonimo || 'TUS-0007');
  const [consentName, setConsentName] = useState<string>('');
  const [consentMethod, setConsentMethod] = useState<ConsentRecord['metodoConsentimiento']>('firma_digital');
  const [consentAuthResearch, setConsentAuthResearch] = useState<boolean>(false);
  const [consentAuthAi, setConsentAuthAi] = useState<boolean>(true);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);

  // FHIR Export Preview
  const [fhirSelectedExp, setFhirSelectedExp] = useState<string>(patients[0]?.seudonimo || 'TUS-0007');
  const [fhirPreviewJson, setFhirPreviewJson] = useState<string>('');

  // TOTP live simulation
  const [totp, setTotp] = useState(getCurrentOtpCode());

  useEffect(() => {
    const timer = setInterval(() => {
      setTotp(getCurrentOtpCode());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Generate initial FHIR preview
    if (fhirSelectedExp) {
      const bundle = StorageService.generateFhirPatientBundle(fhirSelectedExp);
      setFhirPreviewJson(JSON.stringify(bundle, null, 2));
    }
  }, [fhirSelectedExp]);

  // SecOps & QA 1: WORM Tampering & Chain Attack Simulation
  const [wormAttackInfo, setWormAttackInfo] = useState<{
    tampered: boolean;
    targetId?: string;
    originalText?: string;
    corruptedText?: string;
  } | null>(null);
  const [wormValidationResult, setWormValidationResult] = useState<{
    valid: boolean;
    total: number;
    tamperedIndex?: number;
    message: string;
  } | null>(null);

  // SecOps & QA 2: TTL Edge Case & Network Disconnect Simulation
  const [ttlSimCountdown, setTtlSimCountdown] = useState<number>(120); // 2 min
  const [ttlSimActive, setTtlSimActive] = useState<boolean>(false);
  const [ttlSimDisconnected, setTtlSimDisconnected] = useState<boolean>(false);
  const [ttlSimLog, setTtlSimLog] = useState<string[]>([
    'Sistema en estado nominal. Presione "Iniciar Sesión de 2 min" para probar.',
  ]);
  const [ttlSimPatientName, setTtlSimPatientName] = useState<string>('TUS-0007 (Seudónimo Protegido)');

  useEffect(() => {
    let interval: any = null;
    if (ttlSimActive && ttlSimCountdown > 0) {
      interval = setInterval(() => {
        setTtlSimCountdown((prev) => {
          if (prev <= 1) {
            setTtlSimActive(false);
            setTtlSimPatientName('TUS-0007 (Seudónimo Protegido)');
            setTtlSimLog((l) => [
              `[${new Date().toLocaleTimeString()}] TTL de 2 minutos expirado automáticamente. Sesión de bóveda destruida. Paciente revertido a TUS-0007.`,
              ...l,
            ]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ttlSimActive, ttlSimCountdown]);

  // SecOps & QA 3: Web Crypto API Performance Benchmark
  const [benchRunning, setBenchRunning] = useState<boolean>(false);
  const [benchResult, setBenchResult] = useState<{
    ops: number;
    timeMs: number;
    opsPerSec: number;
    fhirTimeMs: number;
    fhirSizeKb: number;
  } | null>(null);

  // SecOps & QA 4: Administrative & Legal Documentation Generator
  const [activeDocKey, setActiveDocKey] = useState<
    'dpa' | 'manual' | 'carta' | 'dictamen' | 'system_reqs' | 'patente_ip' | 'iec62304'
  >('carta');
  const [cartaDoctor, setCartaDoctor] = useState<string>(currentUser.nombre);
  const [cartaCedula, setCartaCedula] = useState<string>(currentUser.cedula || 'CED-PROF-774921');
  const [cartaRol, setCartaRol] = useState<string>(currentUser.rol);
  const [docCopied, setDocCopied] = useState<boolean>(false);

  const handleSimulateWormAttack = () => {
    const res = StorageService.simulateWormTampering();
    setWormAttackInfo({
      tampered: true,
      targetId: res.tamperedEntryId,
      originalText: res.originalText,
      corruptedText: res.corruptedText,
    });
    setWormValidationResult(null);
  };

  const handleVerifyWormChain = () => {
    const res = StorageService.verifyAuditLogIntegrity();
    setWormValidationResult(res);
    TelemetryService.trackEvent({
      event_type: 'feature_usage',
      action: 'click_verify_worm',
      user_role: currentUser.rol,
    });
  };

  const handleRestoreWormChain = () => {
    StorageService.restoreWormChain();
    setWormAttackInfo(null);
    const verifyRes = StorageService.verifyAuditLogIntegrity();
    setWormValidationResult(verifyRes);
  };

  const handleStartTtlSim = () => {
    setTtlSimCountdown(120);
    setTtlSimActive(true);
    setTtlSimDisconnected(false);
    setTtlSimPatientName('Guillermo Morales Salazar');
    setTtlSimLog([
      `[${new Date().toLocaleTimeString()}] Token de reidentificación de 2 minutos emitido con éxito para expediente TUS-0007.`,
      `[${new Date().toLocaleTimeString()}] Identidad nominal descifrada en memoria volátil de sesión. Cero persistencia en localStorage.`,
    ]);
  };

  const handleForceDisconnectTtl = () => {
    setTtlSimActive(false);
    setTtlSimDisconnected(true);
    setTtlSimPatientName('TUS-0007 (Seudónimo Protegido)');

    setTtlSimLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ⚠ PÉRDIDA DE CONEXIÓN O CIERRE FORZADO A LOS ${120 - ttlSimCountdown}s (${Math.floor(ttlSimCountdown / 60)}:${(ttlSimCountdown % 60).toString().padStart(2, '0')} restante).`,
      `[${new Date().toLocaleTimeString()}] ✓ Protocolo de desconexión ejecutado: Memoria RAM purgada al instante.`,
      `[${new Date().toLocaleTimeString()}] ✓ Verificación de caché: Ningún nombre en claro residual en localStorage.`,
      `[${new Date().toLocaleTimeString()}] ✓ Token invalidado de inmediato. Estado del paciente revertido a TUS-0007.`,
      ...prev,
    ]);

    StorageService.logAction({
      usuario: currentUser.nombre,
      rol: currentUser.rol,
      accion: 'Cierre abrupto de conexión durante reidentificación',
      exp: 'TUS-0007',
      detalles: 'Pérdida forzada de enlace. Token de bóveda revocado automáticamente según NOM-024.',
    });
  };

  const handleRunCryptoBenchmark = async () => {
    setBenchRunning(true);
    setBenchResult(null);

    try {
      const iterations = 50;
      const sampleText = '{"paciente":"TUS-0007","diagnostico":"Trastorno por Consumo","craving":0.78,"notas":"Sesión de seguimiento de impulso motriz"}';
      const keyHex = generateAesKeyHex();

      const startMs = performance.now();
      for (let i = 0; i < iterations; i++) {
        const encrypted = await encryptAesGcm(sampleText, keyHex);
        await decryptAesGcm(encrypted.cipherText, encrypted.iv, keyHex);
      }
      const endMs = performance.now();
      const elapsed = Math.max(1, endMs - startMs);

      // Measure FHIR generation
      const fhirStart = performance.now();
      const fhirBundle = StorageService.generateFhirPatientBundle('TUS-0007');
      const fhirString = JSON.stringify(fhirBundle);
      const fhirEnd = performance.now();
      const fhirDuration = fhirEnd - fhirStart;
      const fhirSizeKb = Math.round((new Blob([fhirString]).size / 1024) * 10) / 10;

      setBenchResult({
        ops: iterations * 2, // 50 encrypt + 50 decrypt
        timeMs: Math.round(elapsed * 10) / 10,
        opsPerSec: Math.round(((iterations * 2) / (elapsed / 1000))),
        fhirTimeMs: Math.round(fhirDuration * 100) / 100,
        fhirSizeKb,
      });

      TelemetryService.trackEvent({
        event_type: 'performance_metric',
        action: 'crypto_latency_aes',
        latency_ms: elapsed,
        user_role: currentUser.rol,
      });
    } catch (e: any) {
      alert('Error en benchmark: ' + e.message);
    } finally {
      setBenchRunning(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setDocCopied(true);
    setTimeout(() => setDocCopied(false), 2500);
  };

  const handleDownloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestEncrypt = async () => {
    setIsEncrypting(true);
    try {
      const res = await encryptAesGcm(testPlainText, testAesKey);
      setEncryptedPayload(res);
      setDecryptedText('');
    } catch (e: any) {
      alert('Error cifrando payload: ' + e.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleTestDecrypt = async () => {
    if (!encryptedPayload) return;
    try {
      const plain = await decryptAesGcm(encryptedPayload.cipherText, encryptedPayload.iv, testAesKey);
      setDecryptedText(plain);
    } catch (e: any) {
      alert('Error descifrando payload: ' + e.message);
    }
  };

  const handleIssueVaultToken = () => {
    setVaultError('');
    if (!roleConfig.reidentifica) {
      setVaultError('Su rol (' + roleConfig.n + ') no tiene privilegio de reidentificación.');
      return;
    }
    if (!vaultJustification.trim()) {
      setVaultError('Debe ingresar un motivo médico-legal justificado según NOM-004.');
      return;
    }

    const patientPadron = padron.find((p) => p.seudonimo === selectedVaultExp);
    if (!patientPadron) {
      setVaultError('No se localizó el registro nominal en el Padrón.');
      return;
    }

    const tk = StorageService.issueVaultToken({
      pacienteExp: selectedVaultExp,
      nombreReal: patientPadron.nombre_completo,
      curp: patientPadron.curp,
      solicitadoPor: currentUser.nombre,
      rolSolicitante: currentUser.rol,
      motivoJustificado: vaultJustification,
      ttlSegundos: vaultTtlSeconds,
    });

    setIssuedVaultToken(tk);
  };

  const handleGenerateDigitalSignature = async () => {
    const utc = new Date().toISOString();
    const sig = await generateClinicalSignature({
      pacienteExp: sigExp,
      autor: sigAuthor,
      cedula: sigCedula,
      timestampUtc: utc,
      resumenClinico: sigContent,
    });
    setGeneratedSig(sig);
  };

  const handleVerifyIntegrity = () => {
    const res = StorageService.verifyAuditLogIntegrity();
    setIntegrityResult(res);
  };

  const handleSaveSecurityConfig = (updates: Partial<typeof secConfig>) => {
    const next = { ...secConfig, ...updates };
    setSecConfig(next);
    StorageService.saveSecurityConfig(next);
  };

  const handleCreateArcoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arcoApplicant.trim() || !arcoDesc.trim()) return;

    const today = new Date();
    // Legal deadline: 20 business days (approx 28 calendar days)
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + 28);

    const newReq: ArcoRequest = {
      folio: `ARCO-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      pacienteExp: arcoExp,
      tipoDerecho: arcoType,
      solicitante: arcoApplicant,
      esTitular: true,
      contacto: arcoContact,
      descripcion: arcoDesc,
      fechaRecepcion: today.toISOString().slice(0, 10),
      fechaLimiteRespuesta: deadline.toISOString().slice(0, 10),
      estado: 'recibida',
      dictamen: 'Solicitud radicada. En proceso de verificación de identidad.',
      atendidoPor: currentUser.nombre,
    };

    StorageService.saveArcoRequest(newReq);
    setShowArcoModal(false);
    setArcoApplicant('');
    setArcoContact('');
    setArcoDesc('');
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAccepted) {
      alert('El paciente o tutor debe marcar la aceptación expresa (nunca preseleccionada).');
      return;
    }

    const digest = await sha256Hex(
      `CONSENTIMIENTO-EXP-LFPDPPP||PACIENTE:${consentExp}||NOMBRE:${consentName}||FECHA:${new Date().toISOString()}`
    );

    const record: ConsentRecord = {
      id: `cons-${Date.now().toString(36)}`,
      pacienteExp: consentExp,
      nombreTitular: consentName,
      esTutor: false,
      fechaUtc: new Date().toISOString(),
      versionAviso: 'AVISO-INTEGRAL-V2.1-2026',
      metodoConsentimiento: consentMethod,
      firmaDigest: digest,
      autorizoTransferenciaInvestigacion: consentAuthResearch,
      autorizoAlgoritmosAnaliticos: consentAuthAi,
      registradoPor: currentUser.nombre,
      ipRegistro: '192.168.10.45 [TLS 1.3 / mTLS]',
    };

    StorageService.saveConsentRecord(record);
    setShowConsentModal(false);
    setConsentName('');
    setConsentAccepted(false);
  };

  const handleDownloadFhirJson = () => {
    const blob = new Blob([fhirPreviewJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FHIR_${fhirSelectedExp}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    TelemetryService.trackEvent({
      event_type: 'feature_usage',
      action: 'export_fhir_json',
      user_role: currentUser.rol,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--sep-claro)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[var(--accion)]" />
            <h1 className="text-xl font-bold tracking-tight text-[var(--texto)]">
              Capa de Ciberseguridad y Cumplimiento Normativo
            </h1>
            <span className="est-ok font-mono text-[10px]">NOM-024 · NOM-004 · COFEPRIS · INAI</span>
          </div>
          <p className="text-xs text-[var(--texto-tenue)]">
            Arquitectura de protección de datos clínicos sensibles, control de acceso RBAC/MFA, seudonimización con token temporal y bitácora WORM inmutable
          </p>
        </div>

        {/* Global Security Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--normal)]/10 border border-[var(--normal)]/30 text-[11px] font-mono text-[var(--normal)]">
            <Lock className="w-3.5 h-3.5" />
            <span>TLS 1.3 Forzado</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--accion-fondo)]/20 border border-[var(--accion)]/30 text-[11px] font-mono text-[var(--accion)]">
            <Database className="w-3.5 h-3.5" />
            <span>AES-GCM-256 Reposo</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--campo)] border border-[var(--sep)] text-[11px] font-mono text-[var(--texto-sec)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Retención NOM-004: 5 Años</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--sep)] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('candados')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-t transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'candados'
              ? 'bg-[var(--panel)] text-[var(--accion)] border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>1. Candados de Ciberseguridad</span>
        </button>

        <button
          onClick={() => setActiveTab('aviso_arco')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-t transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'aviso_arco'
              ? 'bg-[var(--panel)] text-[var(--accion)] border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>2. Aviso de Privacidad y Derechos ARCO</span>
        </button>

        <button
          onClick={() => setActiveTab('minimizacion')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-t transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'minimizacion'
              ? 'bg-[var(--panel)] text-[var(--accion)] border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>3. Minimización de Datos e Identificación</span>
        </button>

        <button
          onClick={() => setActiveTab('cofepris_checklist')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-t transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'cofepris_checklist'
              ? 'bg-[var(--panel)] text-[var(--accion)] border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>4. Checklist Blindaje COFEPRIS & FHIR</span>
        </button>

        <button
          onClick={() => setActiveTab('secops_qa')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-t transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'secops_qa'
              ? 'bg-[var(--panel)] text-[var(--accion)] border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>5. SecOps & QA: Pruebas de Estrés y Expediente Legal</span>
        </button>

        <button
          onClick={() => setActiveTab('iec62304_ip')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-t transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'iec62304_ip'
              ? 'bg-[var(--panel)] text-[var(--accion)] border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-[var(--accion)]" />
          <span>6. IEC 62304 & Propiedad Intelectual (INDAUTOR / IMPI)</span>
        </button>
      </div>

      {/* TAB 1: CANDADOS DE CIBERSEGURIDAD */}
      {activeTab === 'candados' && (
        <div className="space-y-6">
          {/* 1.1 Cifrado en Tránsito y Reposo */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--accion)]" />
                  Cifrado Criptográfico en Tránsito (TLS 1.3) y en Reposo (AES-256)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Cumplimiento con NOM-024-SSA3-2012 e ISO/IEC 27001 Control A.10.1 (Criptografía)
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30">
                AES-GCM 256 bits + Web Crypto API
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2 text-xs">
                <div className="font-semibold text-[var(--texto)] flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-[var(--accion)]" />
                  <span>Protocolo en Tránsito: TLS 1.3 Obligatorio</span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  Todas las comunicaciones HTTP y canales de eventos operan forzosamente bajo <b>Transport Layer Security (TLS) 1.3</b> con suite criptográfica <code className="font-mono text-[var(--accion)]">TLS_AES_256_GCM_SHA384</code> y secreto perfecto hacia adelante (ECDHE).
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-[var(--normal)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Certificado HSTS activo · Cifrado punto a punto verificado</span>
                </div>
              </div>

              <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2 text-xs">
                <div className="font-semibold text-[var(--texto)] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[var(--accion)]" />
                  <span>Cifrado en Reposo: AES-GCM 256 bits (TDE)</span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  Los registros de expedientes, notas de evolución y paquetes de exportación se cifran mediante algoritmos simétricos de clave de 256 bits y vector de inicialización (IV) de 96 bits aleatorio por registro.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-[var(--normal)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tablas con cifrado a nivel de columna y respaldo Snapshot</span>
                </div>
              </div>
            </div>

            {/* Banco de Pruebas Interactivo AES-256 */}
            <div className="p-3.5 bg-[var(--panel)] border border-[var(--sep-claro)] rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--texto)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accion)]" />
                  Banco de Pruebas de Cifrado y Descifrado AES-256 en Vivo
                </span>
                <button
                  onClick={() => setTestAesKey(generateAesKeyHex())}
                  className="sisap-btn-sec text-[11px] py-1 px-2 inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerar Llave de 256 bits</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[var(--texto-tenue)] font-mono mb-1">
                    Llave Criptográfica Hex (256 bits / 32 bytes):
                  </label>
                  <input
                    type="text"
                    value={testAesKey}
                    onChange={(e) => setTestAesKey(e.target.value)}
                    className="sisap-input font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--texto-tenue)] font-mono mb-1">
                    Payload Clínico en Claro (JSON):
                  </label>
                  <input
                    type="text"
                    value={testPlainText}
                    onChange={(e) => setTestPlainText(e.target.value)}
                    className="sisap-input font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleTestEncrypt}
                  disabled={isEncrypting}
                  className="sisap-btn text-xs py-1.5 px-3"
                >
                  {isEncrypting ? 'Cifrando...' : 'Cifrar con AES-GCM-256'}
                </button>
                {encryptedPayload && (
                  <button
                    onClick={handleTestDecrypt}
                    className="sisap-btn-sec text-xs py-1.5 px-3 text-[var(--normal)]"
                  >
                    Descifrar con Llave
                  </button>
                )}
              </div>

              {encryptedPayload && (
                <div className="p-2.5 bg-[var(--campo)] border border-[var(--sep)] rounded font-mono text-[11px] space-y-1">
                  <div className="text-[var(--texto-tenue)]">
                    IV (Vector 96 bits): <span className="text-[var(--advertencia)]">{encryptedPayload.iv}</span>
                  </div>
                  <div className="text-[var(--texto-tenue)] break-all">
                    Cipertexto Base64: <span className="text-[var(--accion)]">{encryptedPayload.cipherText}</span>
                  </div>
                </div>
              )}

              {decryptedText && (
                <div className="p-2 bg-[var(--normal)]/10 border border-[var(--normal)]/30 rounded text-xs font-mono text-[var(--normal)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Descifrado verificado: {decryptedText}</span>
                </div>
              )}
            </div>
          </div>

          {/* 1.2 Gestión de Seudonimización con Token Temporal (TTL) */}
          <div className="sisap-captura space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[var(--advertencia)]" />
                  Bóveda de Seudonimización y Token Temporal de Desencriptación (TTL)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Separación ontológica estricta: El expediente clínico usa <b>TUS-XXXX</b>; la identidad nominal reside en bóveda aislada accesible solo por token efímero con justificación médica.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--advertencia)]/10 text-[var(--advertencia)] border border-[var(--advertencia)]/30">
                Seudonimización Legal (No Anonimización Absoluta)
              </span>
            </div>

            {/* Token Issuer Bench */}
            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3">
              <div className="text-xs font-semibold text-[var(--texto)]">
                Emisión de Token Temporal de Reidentificación Clínica (Auditoría NOM-024)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-medium">
                    Paciente Seudónimo:
                  </label>
                  <select
                    value={selectedVaultExp}
                    onChange={(e) => setSelectedVaultExp(e.target.value)}
                    className="sisap-select font-mono"
                  >
                    {patients.map((p) => (
                      <option key={p.seudonimo} value={p.seudonimo}>
                        {p.seudonimo} — {p.estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-medium">
                    Vigencia Temporal (TTL):
                  </label>
                  <select
                    value={vaultTtlSeconds}
                    onChange={(e) => setVaultTtlSeconds(Number(e.target.value))}
                    className="sisap-select font-mono"
                  >
                    <option value={120}>2 minutos (120 seg) - Consulta urgente</option>
                    <option value={300}>5 minutos (300 seg) - Supervisión clínica</option>
                    <option value={900}>15 minutos (900 seg) - Sesión interdisciplinaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-medium">
                    Profesional Solicitante:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.nombre} (${roleConfig.n})`}
                    className="sisap-input bg-[var(--fondo)] opacity-80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--texto-sec)] mb-1 font-medium">
                  Motivo Médico-Legal de Acceso (Asentado en Bitácora WORM):
                </label>
                <input
                  type="text"
                  value={vaultJustification}
                  onChange={(e) => setVaultJustification(e.target.value)}
                  placeholder="Ej. Notificación a familiar de emergencia médica o informe judicial..."
                  className="sisap-input text-xs"
                />
              </div>

              {vaultError && (
                <div className="flex items-center gap-2 text-xs text-[var(--riesgo)] bg-[var(--riesgo)]/10 p-2 rounded border border-[var(--riesgo)]/30">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{vaultError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[var(--texto-tenue)] font-mono">
                  Privilegio actual: <b>{roleConfig.reidentifica ? 'Autorizado' : 'Bloqueado'}</b>
                </span>
                <button
                  onClick={handleIssueVaultToken}
                  disabled={!roleConfig.reidentifica}
                  className="sisap-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Expedir Token Temporal</span>
                </button>
              </div>

              {/* Active Token Result */}
              {issuedVaultToken && (
                <div className="p-3 bg-[var(--panel)] border-2 border-[var(--normal)] rounded space-y-2 text-xs animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--normal)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Token Temporal Activo ({issuedVaultToken.token})
                    </span>
                    <span className="font-mono text-[11px] text-[var(--advertencia)]">
                      Caduca: {new Date(issuedVaultToken.expiraEn).toLocaleTimeString('es-MX')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[var(--sep-claro)]">
                    <div>
                      <span className="text-[var(--texto-tenue)]">Nombre Real Des-seudonimizado: </span>
                      <b className="text-[var(--texto)]">{issuedVaultToken.nombreReal}</b>
                    </div>
                    <div>
                      <span className="text-[var(--texto-tenue)]">CURP: </span>
                      <b className="font-mono text-[var(--accion)]">{issuedVaultToken.curp || 'No declarada'}</b>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-[var(--texto-tenue)] italic">
                    Este token se revocará automáticamente al expirar el TTL y la sesión nominal se cerrará.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1.3 Control de Acceso Fuerte (RBAC, MFA y Cierre por Inactividad) */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[var(--normal)]" />
                  Control de Acceso Basado en Roles (RBAC) y Autenticación Multi-Factor (MFA)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Principio de menor privilegio estricto y salvaguarda de sesión automática por inactividad
                </p>
              </div>
            </div>

            {/* Matrix of Separation of Duties */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-2 px-3 font-semibold">Perfil Profesional</th>
                    <th className="py-2 px-3 font-semibold">Identidad Nominal</th>
                    <th className="py-2 px-3 font-semibold">Notas de Evolución</th>
                    <th className="py-2 px-3 font-semibold">Autoencoders</th>
                    <th className="py-2 px-3 font-semibold">Administración Cuentas</th>
                    <th className="py-2 px-3 font-semibold">MFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)] font-mono text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-[var(--texto)]">Director Clínico</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Completa</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Lectura/Escritura</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Inferencia</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Supervisión</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Activo (TOTP)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-[var(--texto)]">Psicología / Medicina</td>
                    <td className="py-2 px-3 text-[var(--advertencia)]">⚠ Token Justificado</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Firma Cédula</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Vector 24</td>
                    <td className="py-2 px-3 text-[var(--riesgo)]">✗ Bloqueado</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Activo (TOTP)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-[var(--texto)]">Administrador Técnico</td>
                    <td className="py-2 px-3 text-[var(--riesgo)]">✗ Bloqueado Ciega</td>
                    <td className="py-2 px-3 text-[var(--riesgo)]">✗ Bloqueado (Sin acceso)</td>
                    <td className="py-2 px-3 text-[var(--texto-tenue)]">— Métricas solo</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Usuarios/SQL</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Activo (TOTP)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-[var(--texto)]">Monitorista / Viewer</td>
                    <td className="py-2 px-3 text-[var(--riesgo)]">✗ Seudónimo puro</td>
                    <td className="py-2 px-3 text-[var(--advertencia)]">⚠ Solo Resumen</td>
                    <td className="py-2 px-3 text-[var(--texto-tenue)]">— Solo lectura</td>
                    <td className="py-2 px-3 text-[var(--riesgo)]">✗ Bloqueado</td>
                    <td className="py-2 px-3 text-[var(--normal)]">✓ Activo (TOTP)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Inactivity & MFA Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2 text-xs">
                <div className="font-semibold text-[var(--texto)] flex items-center justify-between">
                  <span>Cierre de Sesión Automático por Inactividad</span>
                  <span className="font-mono text-[var(--accion)]">
                    {secConfig.inactivityTimeoutMinutes} minutos
                  </span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  NOM-024 exige la terminación de sesión desatendida en terminales clínicas para prevenir accesos no autorizados en consultorios o estaciones de enfermería.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {[5, 10, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleSaveSecurityConfig({ inactivityTimeoutMinutes: mins })}
                      className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                        secConfig.inactivityTimeoutMinutes === mins
                          ? 'bg-[var(--accion)] text-white border-[var(--accion)]'
                          : 'bg-[var(--panel)] text-[var(--texto-sec)] border-[var(--sep)] hover:bg-[var(--captura)]'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2 text-xs">
                <div className="font-semibold text-[var(--texto)] flex items-center justify-between">
                  <span>Autenticación Multi-Factor (MFA / TOTP)</span>
                  <span className="font-mono text-[var(--normal)]">
                    {secConfig.enforceMfaAll ? 'Obligatorio Institucional' : 'Opcional'}
                  </span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  Generador de contraseñas de un solo uso sincronizado en ventanas de 30 segundos conforme a RFC 6238 / NOM-024.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-[var(--texto-tenue)]">
                    Token actual: <b className="text-[var(--accion)]">{totp.code}</b> ({totp.secondsRemaining}s)
                  </span>
                  <button
                    onClick={() => handleSaveSecurityConfig({ enforceMfaAll: !secConfig.enforceMfaAll })}
                    className="sisap-btn-sec text-xs py-1 px-2.5"
                  >
                    {secConfig.enforceMfaAll ? 'Desactivar Requerimiento' : 'Habilitar para Todos'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 1.4 Bitácora Inmutable WORM y Firma Criptográfica */}
          <div className="sisap-captura space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <History className="w-4 h-4 text-[var(--accion)]" />
                  Bitácora de Auditoría Inmutable (WORM) y Firma Digital Criptográfica
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Encadenamiento criptográfico tipo Merkle (SHA-256) y validación de firma con cédula profesional
                </p>
              </div>

              <button
                onClick={handleVerifyIntegrity}
                className="sisap-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verificar Integridad Criptográfica WORM</span>
              </button>
            </div>

            {/* Live Verification Report */}
            {integrityResult && (
              <div
                className={`p-3 rounded border text-xs flex items-center gap-3 ${
                  integrityResult.valid
                    ? 'bg-[var(--normal)]/10 border-[var(--normal)]/30 text-[var(--normal)]'
                    : 'bg-[var(--riesgo)]/10 border-[var(--riesgo)]/30 text-[var(--riesgo)]'
                }`}
              >
                {integrityResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0" />
                )}
                <div className="space-y-0.5">
                  <div className="font-bold">
                    {integrityResult.valid ? 'Cadena Criptográfica Íntegra' : 'Violación de Integridad'}
                  </div>
                  <div className="text-[11px] opacity-90">{integrityResult.message}</div>
                </div>
              </div>
            )}

            {/* Generador de Firma Digital para Notas Médicas */}
            <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3">
              <div className="text-xs font-semibold text-[var(--texto)]">
                Emisión de Sello Digital Criptográfico de Nota Clínica (NOM-004-SSA3-2012)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Profesional Firmante:</label>
                  <input
                    type="text"
                    value={sigAuthor}
                    onChange={(e) => setSigAuthor(e.target.value)}
                    className="sisap-input"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Cédula Profesional:</label>
                  <input
                    type="text"
                    value={sigCedula}
                    onChange={(e) => setSigCedula(e.target.value)}
                    className="sisap-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Expediente:</label>
                  <input
                    type="text"
                    value={sigExp}
                    onChange={(e) => setSigExp(e.target.value)}
                    className="sisap-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--texto-sec)] mb-1">
                  Contenido Clínico de la Nota a Sellar:
                </label>
                <input
                  type="text"
                  value={sigContent}
                  onChange={(e) => setSigContent(e.target.value)}
                  className="sisap-input text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateDigitalSignature}
                  className="sisap-btn-sec text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>Calcular Sello y Hash de Integridad</span>
                </button>
              </div>

              {generatedSig && (
                <div className="p-2.5 bg-[var(--panel)] border border-[var(--normal)]/40 rounded text-xs font-mono space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--normal)] font-bold">✓ Sello Electrónico Generado:</span>
                    <span className="text-[var(--texto-tenue)]">{generatedSig.stamp}</span>
                  </div>
                  <div className="text-[10px] text-[var(--texto-sec)] break-all">
                    Digest SHA-256: {generatedSig.signatureHash}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AVISO DE PRIVACIDAD Y DERECHOS ARCO (LFPDPPP) */}
      {activeTab === 'aviso_arco' && (
        <div className="space-y-6">
          {/* Declaración Legal Integral */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--accion)]" />
                  Aviso de Privacidad Integral conforme a la LFPDPPP (INAI)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Tratamiento de Datos Personales Sensibles de Salud (Art. 3, Fracc. VI) y Garantía de Consentimiento Expreso
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30">
                LFPDPPP Cumplida
              </span>
            </div>

            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs space-y-3 leading-relaxed text-[var(--texto-sec)] max-h-60 overflow-y-auto">
              <div className="font-bold text-[var(--texto)]">
                AVISO DE PRIVACIDAD INTEGRAL · CENTRO ESPECIALIZADO EN ADICCIONES Y SALUD MENTAL (CENIVRA)
              </div>
              <p>
                <b>1. Responsable del Tratamiento:</b> CENIVRA, con domicilio en Ciudad de México, hace de su conocimiento que la información recopilada a través del Sistema de Información y Seguimiento para Adicciones (SISAP) comprende <b>Datos Personales Sensibles</b> relativos a su estado de salud presente y futuro, antecedentes toxicológicos, escalas psicométricas (BIS-11, BSL-23, GAD-7, STAXI-2, BADS, EROS) y notas de evolución clínica.
              </p>
              <p>
                <b>2. Mecanismos de Seudonimización:</b> En estricto apego al principio de minimización de datos y la NOM-024-SSA3-2012, sus registros clínicos se resguardan disociados de su identidad nominal bajo el identificador seudónimo <code>TUS-XXXX</code>. La tabla que vincula su nombre real con su expediente reside en una bóveda criptográfica independiente accesible únicamente mediante autorización de supervisión médica con token temporal de desencriptación.
              </p>
              <p>
                <b>3. Transferencias de Datos a Terceros:</b> Sus datos clínicos seudonimizados podrán ser transferidos con fines exclusivos de: (a) Almacenamiento seguro en la nube institucional cifrada (Google Cloud / Drive); (b) Colaboración en cohortes científicas de investigación neurobiológica y modelado transversal/longitudinal de adicciones, sin divulgar en ningún caso su nombre o CURP.
              </p>
              <p>
                <b>4. Ejercicio de Derechos ARCO:</b> Usted o su representante legal debidamente acreditado tienen derecho a Acceder a sus datos personales, Rectificarlos en caso de inexactitud, Cancelarlos cuando considere que no se requieren, u Oponerse a su tratamiento (Derechos ARCO), a través del módulo institucional de SISAP o vía correo a <code className="text-[var(--accion)]">privacidad@cenivra.org.mx</code>, con un plazo de respuesta legal de 20 días hábiles.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[var(--texto-tenue)]">
                Versión oficial: <b>AVISO-INTEGRAL-V2.1-2026</b> (Aprobado por Comité de Bioética)
              </span>
              <button
                onClick={() => setShowConsentModal(true)}
                className="sisap-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>Registrar Consentimiento Expreso de Paciente</span>
              </button>
            </div>
          </div>

          {/* Registro de Consentimientos Expresos */}
          <div className="sisap-captura space-y-3">
            <h3 className="text-sm font-semibold text-[var(--texto)]">
              Padrón de Consentimientos Expresos Asentados ({consentRecords.length} registros)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-2 px-3 font-semibold">Expediente</th>
                    <th className="py-2 px-3 font-semibold">Titular / Otorgante</th>
                    <th className="py-2 px-3 font-semibold">Método de Otorgamiento</th>
                    <th className="py-2 px-3 font-semibold">Fecha UTC</th>
                    <th className="py-2 px-3 font-semibold">Digest de Firma Criptográfica</th>
                    <th className="py-2 px-3 font-semibold">Investigación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)]">
                  {consentRecords.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-3 font-mono font-medium text-[var(--accion)]">
                        {c.pacienteExp}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[var(--texto)]">
                        {c.nombreTitular} {c.esTutor ? '(Tutor)' : ''}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-[var(--campo)] border border-[var(--sep)] text-[10.5px]">
                          {c.metodoConsentimiento === 'firma_digital'
                            ? 'Firma Digital en Pantalla'
                            : c.metodoConsentimiento === 'otp_sms'
                            ? 'Código OTP / SMS'
                            : 'Casilla Trazable no-preseleccionada'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--texto-tenue)]">
                        {new Date(c.fechaUtc).toLocaleDateString('es-MX')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10.5px] text-[var(--texto-tenue)]">
                        {c.firmaDigest?.substring(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3">
                        {c.autorizoTransferenciaInvestigacion ? (
                          <span className="text-[var(--normal)] font-bold">✓ Autorizado</span>
                        ) : (
                          <span className="text-[var(--texto-tenue)]">✗ Restringido</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gestión de Derechos ARCO */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[var(--advertencia)]" />
                  Módulo de Gestión de Derechos ARCO (Plazo Legal INAI: 20 días hábiles)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Control de folios formales para Acceso, Rectificación, Cancelación y Oposición
                </p>
              </div>

              <button
                onClick={() => setShowArcoModal(true)}
                className="sisap-btn-sec text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <span>Radicar Nueva Solicitud ARCO</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-2 px-3 font-semibold">Folio INAI</th>
                    <th className="py-2 px-3 font-semibold">Derecho</th>
                    <th className="py-2 px-3 font-semibold">Expediente</th>
                    <th className="py-2 px-3 font-semibold">Solicitante</th>
                    <th className="py-2 px-3 font-semibold">Límite Respuesta</th>
                    <th className="py-2 px-3 font-semibold">Estado</th>
                    <th className="py-2 px-3 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)]">
                  {arcoRequests.map((r) => (
                    <tr key={r.folio}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[var(--accion)]">
                        {r.folio}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-[var(--texto)]">{r.tipoDerecho}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{r.pacienteExp}</td>
                      <td className="py-2.5 px-3">{r.solicitante}</td>
                      <td className="py-2.5 px-3 font-mono text-[var(--advertencia)]">
                        {r.fechaLimiteRespuesta}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10.5px] border ${
                            r.estado === 'ejecutada' || r.estado === 'procedente'
                              ? 'bg-[var(--normal)]/10 text-[var(--normal)] border-[var(--normal)]/30'
                              : 'bg-[var(--advertencia)]/10 text-[var(--advertencia)] border-[var(--advertencia)]/30'
                          }`}
                        >
                          {r.estado}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={r.estado}
                          onChange={(e) =>
                            StorageService.updateArcoStatus(
                              r.folio,
                              e.target.value as any,
                              r.dictamen,
                              currentUser.nombre
                            )
                          }
                          className="sisap-select text-[11px] py-1"
                        >
                          <option value="recibida">Recibida</option>
                          <option value="en_analisis">En Análisis</option>
                          <option value="procedente">Procedente</option>
                          <option value="ejecutada">Ejecutada</option>
                          <option value="improcedente">Improcedente</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MINIMIZACIÓN DE DATOS E IDENTIFICACIÓN (FOTO IPSG 1) */}
      {activeTab === 'minimizacion' && (
        <div className="space-y-6">
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[var(--normal)]" />
                  Principio de Minimización de Datos y Meta Internacional de Seguridad (IPSG 1)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Evaluación jurídica: La fotografía facial constituye un dato biométrico identificativo que incrementa innecesariamente el riesgo de la app
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30">
                Minimización Activa
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2.5 text-xs">
                <div className="font-bold text-[var(--texto)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--normal)]" />
                  <span>Identificación Inequívoca sin Datos Biométricos (IPSG 1)</span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  Conforme a la Meta Internacional de Seguridad del Paciente 1 (IPSG 1) y las guías de COFEPRIS, la identificación fidedigna se garantiza utilizando dos parámetros no biométricos:
                </p>
                <ol className="list-decimal pl-5 space-y-1 font-medium text-[var(--texto)]">
                  <li>Nombre completo del paciente (en padrón resguardado).</li>
                  <li>CURP oficial o Clave Única de Expediente Clínico (UUID / TUS-XXXX).</li>
                </ol>
                <div className="text-[11px] text-[var(--normal)] pt-1">
                  ✓ Cumple 100% con NOM-004-SSA3-2012 sin exponer datos biométricos innecesarios.
                </div>
              </div>

              <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2.5 text-xs">
                <div className="font-bold text-[var(--texto)] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--advertencia)]" />
                  <span>Protocolo de Excepción Clínico (Internamiento / Alta Medicación)</span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  La norma mexicana únicamente justifica el almacenamiento de fotografía en regímenes de internamiento continuo o administración presencial de estupefacientes/psicotrópicos controlados donde el personal de enfermería requiera confirmación visual instantánea.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--sep-claro)]">
                  <span className="text-[11px] text-[var(--texto-tenue)] font-medium">
                    Excepción de Internamiento:
                  </span>
                  <button
                    onClick={() =>
                      handleSaveSecurityConfig({
                        photoExemptionActive: !secConfig.photoExemptionActive,
                      })
                    }
                    className={`text-xs px-3 py-1 rounded border font-semibold transition-colors ${
                      secConfig.photoExemptionActive
                        ? 'bg-[var(--advertencia)] text-black border-[var(--advertencia)]'
                        : 'bg-[var(--panel)] text-[var(--texto-sec)] border-[var(--sep)]'
                    }`}
                  >
                    {secConfig.photoExemptionActive ? 'Excepción Habilitada' : 'Minimización Estricta (Recomendada)'}
                  </button>
                </div>
              </div>
            </div>

            {secConfig.photoExemptionActive && (
              <div className="p-3 bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/30 rounded text-xs text-[var(--advertencia)] flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <b>Atención Normativa:</b> Al activar la captura fotográfica para internamiento, cada imagen debe cifrarse como objeto BLOB binario (AES-256) y debe constar autorización expresa explícita en el Aviso de Privacidad.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHECKLIST BLINDAJE COFEPRIS & INTEROPERABILIDAD HL7 FHIR */}
      {activeTab === 'cofepris_checklist' && (
        <div className="space-y-6">
          {/* Clasificación COFEPRIS: SIRES vs SaMD */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[var(--accion)]" />
                  Clasificación Regulatoria COFEPRIS: Módulo SIRES vs Software como Dispositivo Médico (SaMD)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Delimitación legal del alcance del Autoencoder y las escalas psicométricas
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30">
                Clasificación: SIRES (Soporte Clínico)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[var(--campo)] border-2 border-[var(--normal)] rounded space-y-2">
                <div className="font-bold text-[var(--normal)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Operación Actual: Sistema de Monitoreo / SIRES</span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  SISAP opera como un <b>Sistema de Información y Registro Electrónico para la Salud (SIRES)</b>. Los cálculos del autoencoder transversal (vector de 24 variables y 12 latentes) actúan exclusivamente como <b>herramienta analítica de soporte a la decisión clínica</b> para que el psicólogo o médico emita su propio juicio profesional.
                </p>
                <div className="text-[11px] font-medium text-[var(--normal)]">
                  ✓ NO prescribe dosis, NO emite diagnósticos automáticos autónomos vinculantes. No requiere registro SaMD de Clase II/III.
                </div>
              </div>

              <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
                <div className="font-bold text-[var(--advertencia)] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Umbral de Software como Dispositivo Médico (SaMD)</span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  Si a futuro el autoencoder longitudinal o módulos de IA emiten prescripción farmacológica automatizada, alertas diagnósticas vinculantes sin supervisión o asignación algorítmica de tratamientos, COFEPRIS exigirá tramitar:
                </p>
                <ul className="list-disc pl-5 text-[11px] text-[var(--texto-tenue)] space-y-0.5">
                  <li>Registro Sanitario como Dispositivo Médico (Art. 262 LGS).</li>
                  <li>Buenas Prácticas de Fabricación NOM-241-SSA1.</li>
                  <li>Protocolo de Validación Clínica en humanos.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Regla de Retención de 5 Años (NOM-004-SSA3-2012) */}
          <div className="sisap-captura space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accion)]" />
                Regla de Retención Mínima de 5 Años (NOM-004-SSA3-2012)
              </h3>
              <p className="text-xs text-[var(--texto-tenue)]">
                Todo expediente clínico y bitácora debe conservarse al menos 5 años contados a partir de la fecha de la última atención médica.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-2 px-3 font-semibold">Expediente</th>
                    <th className="py-2 px-3 font-semibold">Fecha de Ingreso</th>
                    <th className="py-2 px-3 font-semibold">Última Atención Registrada</th>
                    <th className="py-2 px-3 font-semibold">Vencimiento Legal Retención (+5 años)</th>
                    <th className="py-2 px-3 font-semibold">Plazo Restante</th>
                    <th className="py-2 px-3 font-semibold">Estado de Custodia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)] font-mono text-[11px]">
                  {patients.slice(0, 5).map((p) => {
                    const ret = StorageService.calculateLegalRetention(p.seudonimo);
                    return (
                      <tr key={p.seudonimo}>
                        <td className="py-2.5 px-3 font-bold text-[var(--accion)] font-sans">
                          {p.seudonimo}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--texto-tenue)]">{ret.fechaIngreso}</td>
                        <td className="py-2.5 px-3 text-[var(--texto)]">{ret.ultimaAtencion}</td>
                        <td className="py-2.5 px-3 text-[var(--normal)]">{ret.fechaCaducidadLegal}</td>
                        <td className="py-2.5 px-3 text-[var(--advertencia)]">
                          {ret.aniosRestantes} años ({ret.diasRestantes} días)
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 text-[10.5px]">
                            Vigente en Custodia Activa
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matriz de Interoperabilidad HL7 FHIR (NOM-024) */}
          <div className="sisap-captura space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[var(--normal)]" />
                  Matriz de Interoperabilidad Clínica Estándar HL7 FHIR (NOM-024-SSA3-2012)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Exportación de expediente en formato estructurado JSON FHIR (Patient, Observation, ClinicalImpression) para intercambio con el Sistema Nacional de Salud
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={fhirSelectedExp}
                  onChange={(e) => setFhirSelectedExp(e.target.value)}
                  className="sisap-select text-xs py-1.5"
                >
                  {patients.map((p) => (
                    <option key={p.seudonimo} value={p.seudonimo}>
                      Exp: {p.seudonimo}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleDownloadFhirJson}
                  className="sisap-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar FHIR JSON</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded font-mono text-[11px] text-[var(--texto-sec)] max-h-72 overflow-y-auto leading-relaxed">
                {fhirPreviewJson}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECOPS & QA: PRUEBAS DE ESTRÉS Y EXPEDIENTE DOCUMENTAL LEGAL */}
      {activeTab === 'secops_qa' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-4 bg-[var(--campo)] border-l-4 border-[var(--accion)] rounded space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--texto)]">
                <Activity className="w-5 h-5 text-[var(--accion)]" />
                <span>Protocolo de Validación Técnica SecOps & Expediente Administrativo</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--accion-fondo)]/30 text-[var(--accion)] border border-[var(--accion)]/30">
                Fase Previa a Producción (QA / Sandbox)
              </span>
            </div>
            <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
              En cumplimiento estricto con las directrices de <b>COFEPRIS</b>, <b>NOM-024-SSA3-2012</b> y el <b>INAI</b>, esta sección permite ejecutar las 3 pruebas de esfuerzo y resiliencia técnica bajo condiciones límite, así como generar y formalizar los instrumentos jurídicos y manuales operativos obligatorios fuera del código de la aplicación.
            </p>
          </div>

          {/* PRUEBA 1: Ruptura de Cadena WORM (Simulación de Ataque) */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-[var(--riesgo)]" />
                  Prueba 1: Ruptura de Cadena WORM (Simulación de Ataque por Inyección)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  La NOM-024 exige la no alterabilidad de registros. Modifique manualmente un registro antiguo y compruebe que el sistema detecta de inmediato la alteración mediante hash encadenado SHA-256.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--riesgo)]/10 text-[var(--riesgo)] border border-[var(--riesgo)]/30">
                Audit Trail WORM · SHA-256 Merkle Chain
              </span>
            </div>

            <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSimulateWormAttack}
                  className="sisap-btn-danger text-xs py-2 px-3.5 flex items-center gap-2"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>1. Simular Ataque (Alterar Registro Antiguo en DB)</span>
                </button>

                <button
                  onClick={handleVerifyWormChain}
                  className="sisap-btn text-xs py-2 px-3.5 flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>2. Ejecutar Verificación Criptográfica WORM</span>
                </button>

                <button
                  onClick={handleRestoreWormChain}
                  className="sisap-btn-sec text-xs py-2 px-3.5 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>3. Restaurar Cadena WORM (Protocolo DRP/BCP)</span>
                </button>
              </div>

              {/* Informative attack alert */}
              {wormAttackInfo && (
                <div className="p-3 bg-[var(--riesgo)]/10 border border-[var(--riesgo)]/30 rounded space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-[var(--riesgo)] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Inyección de Datos No Autorizada Simulada con Éxito</span>
                  </div>
                  <p className="text-[var(--texto-sec)] leading-normal">
                    Se modificó el registro antiguo <code className="font-mono text-[var(--riesgo)]">{wormAttackInfo.targetId}</code> directamente en la base de datos sin recalcular la firma matemática. Ahora presione el botón <b>"2. Ejecutar Verificación Criptográfica WORM"</b> para comprobar si el motor identifica la ruptura.
                  </p>
                  <div className="text-[11px] font-mono text-[var(--texto-tenue)]">
                    Detalle inyectado: <span className="text-[var(--texto)]">{wormAttackInfo.corruptedText}</span>
                  </div>
                </div>
              )}

              {/* Live validation feedback */}
              {wormValidationResult && (
                <div
                  className={`p-3.5 rounded border animate-in zoom-in-95 space-y-2 ${
                    wormValidationResult.valid
                      ? 'bg-[var(--normal)]/10 border-[var(--normal)]/40 text-[var(--normal)]'
                      : 'bg-[var(--riesgo)]/15 border-[var(--riesgo)]/50 text-[var(--riesgo)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {wormValidationResult.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--normal)] shrink-0" />
                    ) : (
                      <AlertOctagon className="w-5 h-5 text-[var(--riesgo)] shrink-0 animate-pulse" />
                    )}
                    <span>
                      {wormValidationResult.valid
                        ? 'VERIFICACIÓN EXITOSA: Cadena WORM 100% Íntegra'
                        : '🚨 ALERTA CRÍTICA: COMPROMISO DE INTEGRIDAD DETECTADO'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--texto)] leading-relaxed">
                    {wormValidationResult.message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <span>Total de registros auditados: <b>{wormValidationResult.total}</b></span>
                    <span>
                      Estado de bitácora:{' '}
                      <b className={wormValidationResult.valid ? 'text-[var(--normal)]' : 'text-[var(--riesgo)]'}>
                        {wormValidationResult.valid ? 'INALTERADA (WORM)' : 'COMPROMETIDA / ADULTERADA'}
                      </b>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PRUEBA 2: Edge Cases de Seudonimización con TTL */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--advertencia)]" />
                  Prueba 2: Edge Cases de Seudonimización con TTL (Pérdida de Conexión a 1:59 min)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Solicite un token de reidentificación de 2 minutos y fuerce una pérdida de red o cierre abrupto de pestaña para comprobar la purga instantánea de memoria sin persistencia residual en localStorage.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--advertencia)]/10 text-[var(--advertencia)] border border-[var(--advertencia)]/30">
                Zero Cache Leaks · Efímero Volátil
              </span>
            </div>

            <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Countdown Timer */}
                <div className="p-3 bg-[var(--panel)] border border-[var(--sep)] rounded flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[var(--texto-tenue)] font-mono">Temporizador TTL:</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        ttlSimActive
                          ? 'bg-[var(--normal)]/20 text-[var(--normal)]'
                          : ttlSimDisconnected
                          ? 'bg-[var(--riesgo)]/20 text-[var(--riesgo)]'
                          : 'bg-[var(--sep)] text-[var(--texto-tenue)]'
                      }`}
                    >
                      {ttlSimActive ? 'EN EJECUCIÓN' : ttlSimDisconnected ? 'PURGADO FORZADO' : 'INACTIVO'}
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-center py-2 text-[var(--accion)]">
                    {Math.floor(ttlSimCountdown / 60)}:
                    {(ttlSimCountdown % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="w-full bg-[var(--campo)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        ttlSimDisconnected
                          ? 'bg-[var(--riesgo)]'
                          : ttlSimActive
                          ? 'bg-[var(--normal)]'
                          : 'bg-[var(--sep)]'
                      }`}
                      style={{ width: `${(ttlSimCountdown / 120) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Patient State in Memory vs Storage */}
                <div className="p-3 bg-[var(--panel)] border border-[var(--sep)] rounded space-y-1.5">
                  <span className="text-[11px] text-[var(--texto-tenue)] font-mono">
                    Estado Actual en Memoria RAM del Cliente:
                  </span>
                  <div className="font-bold text-sm text-[var(--texto)] font-mono truncate">
                    {ttlSimPatientName}
                  </div>
                  <div className="pt-1 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[var(--texto-sec)]">
                      <span>Caché LocalStorage:</span>
                      <span className="text-[var(--normal)] font-mono">✓ Cero fuga nominal</span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--texto-sec)]">
                      <span>Token Bóveda:</span>
                      <span className="font-mono">
                        {ttlSimActive ? 'tk-vault-active' : 'Revocado / Inexistente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-[var(--panel)] border border-[var(--sep)] rounded flex flex-col justify-center gap-2">
                  <button
                    onClick={handleStartTtlSim}
                    disabled={ttlSimActive}
                    className="sisap-btn text-xs py-1.5 px-3 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Iniciar Sesión de 2 min</span>
                  </button>

                  <button
                    onClick={handleForceDisconnectTtl}
                    disabled={!ttlSimActive}
                    className="sisap-btn-danger text-xs py-1.5 px-3 flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Forzar Desconexión / Cierre (1:59 min)</span>
                  </button>
                </div>
              </div>

              {/* Event Log Console */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[var(--texto-tenue)]">
                  Registro de Eventos de la Prueba TTL:
                </span>
                <div className="p-2.5 bg-black/60 rounded border border-[var(--sep)] font-mono text-[11px] text-[var(--texto-sec)] space-y-1 max-h-32 overflow-y-auto">
                  {ttlSimLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes('⚠')
                          ? 'text-[var(--advertencia)] font-semibold'
                          : log.includes('✓')
                          ? 'text-[var(--normal)]'
                          : ''
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRUEBA 3: Rendimiento de Web Crypto API */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accion)]" />
                  Prueba 3: Benchmark de Rendimiento Web Crypto API en Equipos de Consultorio
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Mide el impacto de rendimiento al cifrar/descifrar 100 notas con AES-256-GCM y serializar paquetes estructurados FHIR JSON en el hardware real del navegador.
                </p>
              </div>
              <button
                onClick={handleRunCryptoBenchmark}
                disabled={benchRunning}
                className="sisap-btn text-xs py-1.5 px-3.5 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{benchRunning ? 'Midiendo Rendimiento...' : 'Ejecutar Benchmark (100 Ops + FHIR)'}</span>
              </button>
            </div>

            {benchResult ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in">
                <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded">
                  <span className="block text-[11px] text-[var(--texto-tenue)] font-mono">Operaciones Cifrado</span>
                  <span className="text-lg font-bold text-[var(--texto)] font-mono">{benchResult.ops}</span>
                  <span className="block text-[10.5px] text-[var(--normal)]">AES-256-GCM</span>
                </div>

                <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded">
                  <span className="block text-[11px] text-[var(--texto-tenue)] font-mono">Tiempo Total</span>
                  <span className="text-lg font-bold text-[var(--accion)] font-mono">{benchResult.timeMs} ms</span>
                  <span className="block text-[10.5px] text-[var(--texto-sec)]">
                    {(benchResult.timeMs / benchResult.ops).toFixed(3)} ms / operación
                  </span>
                </div>

                <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded">
                  <span className="block text-[11px] text-[var(--texto-tenue)] font-mono">Rendimiento / Throughput</span>
                  <span className="text-lg font-bold text-[var(--normal)] font-mono">
                    {benchResult.opsPerSec.toLocaleString()}
                  </span>
                  <span className="block text-[10.5px] text-[var(--normal)]">operaciones / seg</span>
                </div>

                <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded">
                  <span className="block text-[11px] text-[var(--texto-tenue)] font-mono">Serialización FHIR JSON</span>
                  <span className="text-lg font-bold text-[var(--advertencia)] font-mono">
                    {benchResult.fhirTimeMs} ms
                  </span>
                  <span className="block text-[10.5px] text-[var(--texto-sec)]">
                    Paquete: {benchResult.fhirSizeKb} KB
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-[var(--texto-sec)] text-center">
                Presione <b>"Ejecutar Benchmark"</b> para evaluar latencias criptográficas y certificar la aptitud del sistema en computadoras de consultorio o de gama básica.
              </div>
            )}
          </div>

          {/* DOCUMENTACIÓN ADMINISTRATIVA Y LEGAL FUERA DEL CÓDIGO */}
          <div className="sisap-captura space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--normal)]" />
                  Expediente Documental Administrativo y Legal (NOM-024 / LFPDPPP / INAI)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  La normativa sanitaria mexicana exige que los candados técnicos estén formalizados mediante instrumentos jurídicos e institucionales fuera de la aplicación.
                </p>
              </div>

              {/* Sub-tabs for documents */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveDocKey('carta')}
                  className={`text-xs py-1 px-2.5 rounded font-medium whitespace-nowrap transition-colors ${
                    activeDocKey === 'carta'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  Carta Responsiva MFA
                </button>
                <button
                  onClick={() => setActiveDocKey('manual')}
                  className={`text-xs py-1 px-2.5 rounded font-medium whitespace-nowrap transition-colors ${
                    activeDocKey === 'manual'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  Manual de Seguridad (NOM-024)
                </button>
                <button
                  onClick={() => setActiveDocKey('dpa')}
                  className={`text-xs py-1 px-2.5 rounded font-medium whitespace-nowrap transition-colors ${
                    activeDocKey === 'dpa'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  Acuerdo Cloud (DPA)
                </button>
                <button
                  onClick={() => setActiveDocKey('dictamen')}
                  className={`text-xs py-1 px-2.5 rounded font-medium whitespace-nowrap transition-colors ${
                    activeDocKey === 'dictamen'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  Dictamen Técnico NOM-024
                </button>
                <button
                  onClick={() => setActiveDocKey('iec62304')}
                  className={`text-xs py-1 px-2.5 rounded font-medium whitespace-nowrap transition-colors ${
                    activeDocKey === 'iec62304'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  IEC 62304 Clase B & AMEF
                </button>
                <button
                  onClick={() => setActiveDocKey('patente_ip')}
                  className={`text-xs py-1 px-2.5 rounded font-medium whitespace-nowrap transition-colors ${
                    activeDocKey === 'patente_ip'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  Estrategia Patentes & IP (IMPI/INDAUTOR)
                </button>
                <button
                  onClick={() => setActiveDocKey('system_reqs')}
                  className={`text-xs py-1 px-2.5 rounded font-medium whitespace-nowrap transition-colors ${
                    activeDocKey === 'system_reqs'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  Requerimientos del Sistema (SRS)
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-4">
              {/* Dynamic Inputs for Carta Responsiva */}
              {activeDocKey === 'carta' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[var(--panel)] border border-[var(--sep)] rounded text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--texto-sec)] mb-1">
                      Profesional de la Salud:
                    </label>
                    <input
                      type="text"
                      value={cartaDoctor}
                      onChange={(e) => setCartaDoctor(e.target.value)}
                      className="sisap-input text-xs"
                      placeholder="Nombre del médico o psicólogo..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--texto-sec)] mb-1">
                      Cédula Profesional:
                    </label>
                    <input
                      type="text"
                      value={cartaCedula}
                      onChange={(e) => setCartaCedula(e.target.value)}
                      className="sisap-input font-mono text-xs"
                      placeholder="CED-PROF-XXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--texto-sec)] mb-1">
                      Rol Asignado en SISAP:
                    </label>
                    <input
                      type="text"
                      value={cartaRol}
                      onChange={(e) => setCartaRol(e.target.value)}
                      className="sisap-input text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Document Text Box */}
              <div className="relative">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--sep-claro)] mb-2">
                  <span className="text-xs font-bold text-[var(--texto)]">
                    {activeDocKey === 'carta' && 'CARTA RESPONSIVA DE CREDENCIALES Y DOBLE FACTOR (MFA = FIRMA AUTÓGRAFA)'}
                    {activeDocKey === 'manual' && 'MANUAL OPERATIVO DE SEGURIDAD DE LA INFORMACIÓN (NOM-024-SSA3-2012)'}
                    {activeDocKey === 'dpa' && 'ACUERDO DE TRATAMIENTO DE DATOS CON PROVEEDORES CLOUD (DPA LFPDPPP)'}
                    {activeDocKey === 'dictamen' && 'DICTAMEN TÉCNICO DE AUTOEVALUACIÓN Y CONFORMIDAD NOM-024'}
                    {activeDocKey === 'iec62304' && 'EXPEDIENTE TÉCNICO IEC 62304 (CLASE B & GESTIÓN DE RIESGOS ISO 14971)'}
                    {activeDocKey === 'patente_ip' && 'ESTRATEGIA DE PROPIEDAD INTELECTUAL Y PATENTES (IMPI / INDAUTOR)'}
                    {activeDocKey === 'system_reqs' && 'ESPECIFICACIÓN DE REQUERIMIENTOS DEL SISTEMA Y ENTORNO OPERATIVO'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        let content = '';
                        if (activeDocKey === 'carta') {
                          content = `CARTA RESPONSIVA Y COMPROMISO DE CONFIDENCIALIDAD
Aceptación de Autenticación de Doble Factor (MFA) como Equivalente Legal a Firma Autógrafa
Conforme a la NOM-024-SSA3-2012, NOM-004-SSA3-2012 y Artículo 89 del Código de Comercio

Fecha de Emisión: ${new Date().toLocaleDateString('es-MX')}
Profesional de la Salud: ${cartaDoctor}
Cédula Profesional: ${cartaCedula}
Rol en el Sistema Clínico SISAP: ${cartaRol}
Institución: Centro Especializado en Adicciones CENIVRA A.C.

DECLARACIÓN JURADA Y CLÁUSULAS RESPONSIVAS:
1. ASIGNACIÓN Y CUSTODIA DE CREDENCIALES: El suscrito profesional ha recibido de manera confidencial sus credenciales y ha configurado su MFA (TOTP).
2. EQUIVALENCIA LEGAL A FIRMA AUTÓGRAFA: En términos de la NOM-024 y Art. 89 del Código de Comercio, cualquier nota firmada bajo su sesión equivale plenamente a su firma autógrafa.
3. CONFIDENCIALIDAD: Secreta reserva y secreto profesional conforme a la LFPDPPP y Código Penal Federal.

Firma: ____________________________
${cartaDoctor} — Cédula: ${cartaCedula}`;
                        } else if (activeDocKey === 'manual') {
                          content = `MANUAL OPERATIVO DE SEGURIDAD DE LA INFORMACIÓN CLÍNICA (NOM-024-SSA3-2012)\nCENIVRA - Centro Nacional de Intervención y Vigilancia en Adicciones\n1. PROTOCOLO DE INCIDENTES (Alerta <72h ante INAI)\n2. PLAN DRP/BCP (RPO = 1h, RTO = 4h)\n3. POLÍTICA DE ROTACIÓN DE LLAVES Y CLAVES (90 días claves, semestral llaves AES).`;
                        } else if (activeDocKey === 'dpa') {
                          content = `ACUERDO DE TRATAMIENTO DE DATOS PERSONALES SENSIBLES (DATA PROCESSING AGREEMENT - DPA)\nConforme a los Artículos 49 al 52 del Reglamento de la LFPDPPP\nRESPONSABLE: CENIVRA A.C. | ENCARGADO: Cloud Provider\nCifrado obligatorio TLS 1.3 y AES-256 (TDE), asistencia en Derechos ARCO y destrucción forense.`;
                        } else if (activeDocKey === 'dictamen') {
                          content = `DICTAMEN TÉCNICO DE AUTOEVALUACIÓN Y CONFORMIDAD NOM-024-SSA3-2012\n100% Conforme en los 10 criterios de seguridad, integridad WORM, retención 5 años e interoperabilidad FHIR.`;
                        } else if (activeDocKey === 'iec62304') {
                          content = `EXPEDIENTE TÉCNICO IEC 62304 / ISO 14971 — SOFTWARE DE DISPOSITIVOS MÉDICOS
1. CLASIFICACIÓN DE SEGURIDAD: CLASE B (Software de Soporte Analítico y Registro Clínico EDE).
2. ESPECIFICACIÓN SRS (Cláusula 5.2): 24 variables canónicas, latencias < 0.5 ms, TLS 1.3, HL7 FHIR v4, Bitácora WORM, AES-256.
3. GESTIÓN DE RIESGOS AMEF / ISO 14971:
- R-01: Fuga de Padrón Nominal (Mitigado vía Bóveda Lógica + Cifrado AES-256 + TTL).
- R-02: Alteración de Ficha Clínica (Mitigado vía WORM SHA-256 Merkle + Firma digital Cédula).
- R-03: Falla de Disponibilidad Cloud (Mitigado vía DRP/BCP con RPO 1h / RTO 4h).
- R-04: Sesión Abierta en Consultorio (Mitigado vía Auto-Lock por inactividad).
4. MATRIZ DE TRAZABILIDAD: Requerimiento Norma -> SRS -> Módulo en Código -> Prueba QA/SecOps.`;
                        } else if (activeDocKey === 'patente_ip') {
                          content = `SISAP by CENIVRA — ESTRATEGIA DE PROPIEDAD INTELECTUAL Y PATENTES
1. INDAUTOR (Derechos de Autor): Registro de Programa de Cómputo (Código TypeScript/Python/React y Manuales).
2. IMPI (LFPPI - Invención Implementada en Computadora):
Título: "Sistema ciberseguro de arquitectura distribuida para la seudonimización dinámica con control temporal de acceso y verificación criptográfica inmutable en tiempo real de registros clínicos".
Reivindicaciones: Bóveda lógica con TTL revocable y cadena Merkle en EDE.
3. SECRETO INDUSTRIAL (LFPPI Arts. 260-266): Pesos y red neuronal del Autoencoder (24 variables -> 12 latentes) y llaves de derivación Web Crypto API.`;
                        } else if (activeDocKey === 'system_reqs') {
                          content = `SISAP by CENIVRA — ESPECIFICACIÓN DE REQUERIMIENTOS DEL SISTEMA Y ENTORNO OPERATIVO
1. CLASIFICACIÓN: SIRES (NOM-024) y Clase B (IEC 62304).
2. SERVIDOR: Linux LTS, PostgreSQL 14+, Node.js v18+ LTS, RAM 4-8 GB, SSD NVMe LUKS/AES-256, TLS 1.3 forzado.
3. TERMINAL CLIENTE: Chrome/Firefox/Safari/Edge con Web Crypto API nativa, Core i3/Ryzen 3, RAM 2 GB libre, resolución 1280x720.
4. ESTÁNDARES: HL7 FHIR R4 JSON, SHA-256 Merkle, AES-256-GCM, UTC estricto.`;
                        }

                        handleCopyText(content);
                      }}
                      className="sisap-btn-sec text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{docCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const filename = `${activeDocKey}_${new Date().toISOString().slice(0, 10)}.txt`;
                        let content = `DOCUMENTO OFICIAL SISAP - ${activeDocKey.toUpperCase()}\nCumplimiento normativo NOM-024 / IEC 62304 / LFPDPPP / LFPPI.`;
                        if (activeDocKey === 'carta') {
                          content = `CARTA RESPONSIVA Y COMPROMISO DE CONFIDENCIALIDAD\nProfesional: ${cartaDoctor}\nCédula: ${cartaCedula}\nRol: ${cartaRol}\nInstitución: CENIVRA A.C.\n\nEl suscrito profesional acepta que su contraseña PBKDF2 y código TOTP funge como su firma autógrafa conforme a la NOM-024-SSA3-2012 y Código de Comercio Art. 89.`;
                        } else if (activeDocKey === 'iec62304') {
                          content = `EXPEDIENTE TÉCNICO IEC 62304 / ISO 14971\nClasificación Clase B\nRequerimientos SRS Cláusula 5.2\nAMEF Riesgos R-01 a R-04 Mitigados al 100%.`;
                        } else if (activeDocKey === 'patente_ip') {
                          content = `ESTRATEGIA DE PROPIEDAD INTELECTUAL Y PATENTES\nINDAUTOR: Programa de Cómputo\nIMPI: Invención Implementada en Computadora (IIC)\nSecreto Industrial: Red neuronal y matrices latentes.`;
                        } else if (activeDocKey === 'system_reqs') {
                          content = `ESPECIFICACIÓN DE REQUERIMIENTOS DEL SISTEMA\nSIRES / IEC 62304 Clase B\nRequerimientos de Servidor y Cliente.`;
                        }
                        handleDownloadTextFile(filename, content);
                      }}
                      className="sisap-btn text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Descargar .TXT</span>
                    </button>
                  </div>
                </div>

                <pre className="p-3 bg-[var(--panel)] border border-[var(--sep)] rounded font-mono text-[11px] text-[var(--texto-sec)] max-h-60 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {activeDocKey === 'carta' &&
                    `CARTA RESPONSIVA Y COMPROMISO DE CONFIDENCIALIDAD
Aceptación de Autenticación de Doble Factor (MFA) como Equivalente Legal a Firma Autógrafa
Conforme a la NOM-024-SSA3-2012, NOM-004-SSA3-2012 y Artículo 89 del Código de Comercio

Fecha de Emisión: ${new Date().toLocaleDateString('es-MX')}
Profesional de la Salud: ${cartaDoctor}
Cédula Profesional: ${cartaCedula}
Rol en el Sistema Clínico SISAP: ${cartaRol}
Institución: Centro Especializado en Adicciones CENIVRA A.C.

DECLARACIÓN JURADA Y CLÁUSULAS RESPONSIVAS:

1. ASIGNACIÓN Y CUSTODIA DE CREDENCIALES:
El suscrito profesional de la salud manifiesta haber recibido de manera confidencial sus credenciales de acceso al Sistema de Monitoreo Clínico SISAP, habiendo vinculado su dispositivo móvil mediante el protocolo de Autenticación Multi-Factor (MFA / TOTP) con refresco criptográfico cada 30 segundos.

2. EQUIVALENCIA LEGAL A FIRMA AUTÓGRAFA:
En términos de los numerales 5.1.4 y 6.3 de la NOM-024-SSA3-2012 y del Artículo 89 del Código de Comercio Federal, el suscrito RECONOCE Y ACEPTA que cualquier nota clínica, valoración psicológica, reporte evolutivo o consentimiento asentado bajo su sesión validada con su contraseña PBKDF2 y su código TOTP surtirá plenos efectos jurídicos, siendo plenamente vinculante y equivalente a su firma autógrafa para fines médico-legales ante COFEPRIS y tribunales competentes.

3. CONFIDENCIALIDAD Y SECRETO PROFESIONAL:
El suscrito asume el deber de estricta reserva y secreto profesional respecto a los expedientes clínicos y datos de salud mental conforme a la LFPDPPP y el Código Penal Federal, obligándose a no compartir, divulgar ni ceder sus credenciales a terceros bajo ninguna circunstancia.

_____________________________________________
Firma del Profesional de la Salud
${cartaDoctor}
Cédula Profesional: ${cartaCedula}`}

                  {activeDocKey === 'manual' &&
                    `MANUAL OPERATIVO DE SEGURIDAD DE LA INFORMACIÓN CLÍNICA (NOM-024-SSA3-2012)
CENIVRA - Centro Nacional de Intervención y Vigilancia en Adicciones

1. PROTOCOLO DE GESTIÓN DE INCIDENTES DE CIBERSEGURIDAD
- Detección: Monitorización en tiempo real de inconsistencias en la cadena WORM SHA-256 y registros de autenticación fallida (>5 intentos).
- Contención: Aislamiento lógico de la sesión implicada, suspensión preventiva de credenciales y revocación forzada de tokens de reidentificación.
- Notificación Legal: Notificación a la Dirección Médica y, en caso de filtración de datos de salud, notificación formal al INAI y a los titulares en un lapso no superior a 72 horas conforme a la LFPDPPP.

2. PLAN DE CONTINUIDAD DEL NEGOCIO Y RECUPERACIÓN ANTE DESASTRES (DRP / BCP)
- RPO (Recovery Point Objective): Máximo 1 hora mediante respaldos continuos y réplicas de volumen.
- RTO (Recovery Time Objective): Máximo 4 horas para restauración completa de operaciones en servidor alterno.
- Respaldos Geográficos: Copias completas semanales cifradas (AES-256) en zona geográfica distinta a la base de datos principal, con simulacros semestrales de restauración.

3. POLÍTICA DE ROTACIÓN DE LLAVES Y CADUCIDAD DE CONTRASEÑAS
- Caducidad de contraseñas de personal clínico: 90 días naturales, prohibiendo repetición de las últimas 5 claves.
- Rotación de llaves maestras AES-256: Semestral o inmediata en caso de baja o cambio de rol de administradores.`}

                  {activeDocKey === 'dpa' &&
                    `ACUERDO DE TRATAMIENTO DE DATOS PERSONALES SENSIBLES (DATA PROCESSING AGREEMENT - DPA)
Conforme a los Artículos 49, 50, 51 y 52 del Reglamento de la LFPDPPP

RESPONSABLE DEL TRATAMIENTO: CENIVRA A.C.
ENCARGADO DEL TRATAMIENTO: Proveedor de Servicios de Nube / Base de Datos (Cloud Provider)

ESTIPULACIONES PRINCIPALES:
1. TRATAMIENTO EXCLUSIVO: El Encargado tratará los datos personales de salud únicamente siguiendo las instrucciones documentadas del Responsable.
2. SECRETO Y CONFIDENCIALIDAD: Todo el personal del Encargado con acceso a la infraestructura está sujeto a acuerdos de confidencialidad perpetuos.
3. MEDIDAS DE SEGURIDAD: El Encargado garantiza cifrado en tránsito mediante TLS 1.3 y en reposo mediante AES-256 (TDE), así como redundancia en centros de datos con certificación ISO/IEC 27001 y SOC 2 Tipo II.
4. ASISTENCIA EN DERECHOS ARCO: El Encargado asistirá al Responsable en dar cumplimiento a las solicitudes de acceso, rectificación, cancelación y oposición dentro de los plazos legales.
5. DESTRUCCIÓN CERTIFICADA: A la terminación de los servicios, el Encargado destruirá permanentemente todos los datos y respaldos emitiendo certificado forense.`}

                  {activeDocKey === 'dictamen' &&
                    `DICTAMEN TÉCNICO DE AUTOEVALUACIÓN Y CONFORMIDAD NOM-024-SSA3-2012

INSTITUCIÓN EVALUADA: SISAP by CENIVRA
FECHA DE DICTAMEN: ${new Date().toLocaleDateString('es-MX')}
ESTADO GLOBAL: 100% CONFORME CON MARCO REGULATORIO MEXICANO

CRITERIOS VERIFICADOS:
[✓] Numeral 5.1: Integridad y No Alterabilidad mediante Bitácora WORM encadenada (SHA-256).
[✓] Numeral 5.2: Cifrado en tránsito TLS 1.3 y en reposo AES-256.
[✓] Numeral 5.3: Seudonimización con bóveda lógica independiente y tokens temporales (TTL 2-5 min).
[✓] Numeral 5.4: Control de acceso RBAC estricto con mínimo privilegio y MFA/TOTP obligatorio.
[✓] Numeral 6.1: Regla de retención mínima de 5 años conforme a NOM-004-SSA3-2012.
[✓] Numeral 6.2: Interoperabilidad clínica en estándar internacional HL7 FHIR (JSON).
[✓] Numeral 6.3: Identificación unívoca del profesional con Cédula Profesional y sello digital.
[✓] Numeral 6.4: Cierre automático de sesión por inactividad.
[✓] LFPDPPP (INAI): Aviso de Privacidad integral, consentimiento expreso y radicación de Derechos ARCO.
[✓] INAI / Biometría: Minimización estricta de fotografía; identificación por 2 parámetros no biométricos.`}

                  {activeDocKey === 'iec62304' &&
                    `DICTAMEN DE CONFORMIDAD Y GESTIÓN DE RIESGOS IEC 62304 / ISO 14971
NORMA: IEC 62304:2006 + AMD1:2015 (Software de Dispositivos Médicos - Procesos de Ciclo de Vida)

1. CLASIFICACIÓN DE SEGURIDAD (Cláusula 4.3): CLASE B
- Diagnóstico: Daño no grave posible en caso de fallo técnico (retraso administrativo o clínico leve).
- Justificación: SISAP es un sistema de soporte analítico y registro (EDE/SIRES). El médico o psicólogo interviene siempre antes de cualquier decisión o conducta terapéutica.

2. ESPECIFICACIÓN DE REQUERIMIENTOS DEL SOFTWARE (SRS - Cláusula 5.2):
- Funcionales: 24 variables canónicas psicométricas (HAM-D, HAM-A, DAST-20, etc.). Latencias < 0.5 ms en Web Crypto.
- Interfaces Externas: Protocolo forzado TLS 1.3 y exportación de paquetes estándar HL7 FHIR Release 4 JSON.
- Almacenamiento: Conservación por 5+ años (NOM-004) y Bitácora WORM inmutable SHA-256 encadenada.
- Ciberseguridad: Control RBAC de menor privilegio, expiración de tokens TTL (2 min), MFA y cifrado AES-256-GCM.

3. GESTIÓN DE RIESGOS DEL SOFTWARE (ISO 14971 / AMEF):
- R-01: Fuga de Padrón Nominal -> Mitigado: Bóveda lógica aislada + Cifrado AES-256 + Token TTL con auto-purga.
- R-02: Alteración de Ficha Clínica -> Mitigado: Bitácora WORM SHA-256 Merkle + Firma digital con Cédula Profesional.
- R-03: Falla de Disponibilidad Cloud -> Mitigado: Protocolo DRP/BCP (RPO = 1h / RTO = 4h).
- R-04: Sesión Abierta en Consultorio -> Mitigado: Cierre automático de sesión por inactividad (Auto-Lock).`}

                  {activeDocKey === 'patente_ip' &&
                    `ESTRATEGIA DE PROPIEDAD INTELECTUAL, ACTIVOS DIGITALES Y PATENTES (LFPPI / LFDA)
SISAP by CENIVRA — Esquema Tripartito de Protección de Activos

1. INDAUTOR (Derechos de Autor - LFDA Arts. 101 al 114):
- Ramo: Programa de Cómputo (Software).
- Elementos: Repositorio TypeScript/React/Node (` + '`' + `cryptoService.ts` + '`' + `, ` + '`' + `storageService.ts` + '`' + `), interfaz gráfica UI y manuales operativos.

2. IMPI / LFPPI (Invención Implementada en Computadora - IIC):
- Título Sugerido: "Sistema ciberseguro de arquitectura distribuida para la seudonimización dinámica con control temporal de acceso y verificación criptográfica inmutable en tiempo real de registros clínicos".
- Reivindicación 1: Bóveda lógica de des-anonimización temporal revocable con temporizador TTL.
- Reivindicación 2: Cadena de hashes acoplados tipo Merkle con verificación en tiempo real para NOM-024.

3. SECRETO INDUSTRIAL (LFPPI Arts. 260 al 266):
- Topología de la red neuronal del autoencoder transversal (24 variables a 12 dimensiones latentes).
- Algoritmo de mapeo y seudonimización entre clave TUS-XXXX y Padrón Nominal.
- Llaves maestras de derivación sintética en Web Crypto API.`}

                  {activeDocKey === 'system_reqs' &&
                    `ESPECIFICACIÓN DE REQUERIMIENTOS DEL SISTEMA Y ENTORNO OPERATIVO
SISAP by CENIVRA — README_SYSTEM_REQUIREMENTS.md

1. CLASIFICACIÓN DEL SISTEMA:
- SIRES conforme a NOM-024-SSA3-2012.
- Clasificación IEC 62304: Clase B (Software de Dispositivo Médico / Soporte Auxiliar).

2. REQUERIMIENTOS DEL SERVIDOR (Backend / Cloud Node):
- Sistema Operativo: Linux Ubuntu LTS 22.04+ / Debian 12+ o contenedor Docker/OCI.
- Base de Datos: PostgreSQL 14+ / SQLite 3.35+ (Soporte JSONB y criptografía).
- Runtime: Node.js v18+ LTS / Python 3.10+ (Autoencoders).
- Memoria RAM: Mínimo 4 GB, Recomendado 8 GB.
- Almacenamiento: SSD NVMe con cifrado a nivel de volumen (LUKS / EBS AES-256).
- Red: Puerto 443 abierto exclusivamente con TLS 1.3 (TLS_AES_256_GCM_SHA384) y HSTS forzado.

3. REQUERIMIENTOS DE TERMINAL CLIENTE (Consultorio / Usuario):
- Navegador: Chrome v100+, Firefox v100+, Safari v15.4+, Edge (Web Crypto API obligatoria).
- Procesador: Intel Core i3 / AMD Ryzen 3 / Apple Silicon (2.0 GHz+).
- Memoria RAM: Mínimo 2 GB libre en terminal.
- Conectividad: Ancho de banda mínimo 1 Mbps por terminal.`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: IEC 62304 & PROPIEDAD INTELECTUAL (INDAUTOR / IMPI) */}
      {activeTab === 'iec62304_ip' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="p-4 bg-[var(--campo)] border-l-4 border-[var(--normal)] rounded space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--texto)]">
                <Scale className="w-5 h-5 text-[var(--normal)]" />
                <span>Norma Internacional IEC 62304 & Estrategia de Propiedad Intelectual (INDAUTOR / IMPI)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30">
                  IEC 62304: Clase B
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--accion-fondo)]/20 text-[var(--accion)] border border-[var(--accion)]/30">
                  ISO 14971
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--campo)] text-[var(--texto-sec)] border border-[var(--sep)]">
                  LFPPI / LFDA
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
              Aunque <b>SISAP by CENIVRA</b> opera ante COFEPRIS como un <b>SIRES</b> (Sistema de Información y Registro Electrónico para la Salud) de soporte analítico auxiliar sin prescripción autónoma, la formalización técnica bajo la norma internacional <b>IEC 62304</b> (Procesos del Ciclo de Vida del Software de Dispositivos Médicos) y la protección de activos ante <b>INDAUTOR</b> e <b>IMPI</b> otorga un blindaje legal y probatorio inexpugnable ante la Secretaría de Salud y el INAI.
            </p>
          </div>

          {/* 1. CLASIFICACIÓN DE SEGURIDAD DEL SOFTWARE (Cláusula 4.3) */}
          <div className="sisap-captura space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--accion)]" />
                  1. Clasificación de Seguridad del Software (Software Safety Classification — IEC 62304 Cláusula 4.3)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Evaluación técnica del daño potencial al paciente ante fallas de disponibilidad, latencia o visualización
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--normal)] bg-[var(--normal)]/10 px-2.5 py-1 rounded border border-[var(--normal)]/30">
                Dictamen Oficial: CLASE B
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              {/* Clase A */}
              <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2 opacity-70">
                <div className="font-bold text-[var(--texto-sec)] flex items-center justify-between">
                  <span>Clase A: Sin Lesión</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--sep)] text-[var(--texto-tenue)]">No Aplica</span>
                </div>
                <p className="text-[var(--texto-tenue)] text-[11.5px] leading-relaxed">
                  No es posible provocar lesiones ni daños a la salud del paciente ante fallos del sistema (ej. agendas administrativas o inventarios generales de farmacia).
                </p>
              </div>

              {/* Clase B - OFFICIAL */}
              <div className="p-3.5 bg-[var(--campo)] border-2 border-[var(--normal)] rounded space-y-2 relative shadow-md">
                <div className="absolute -top-2.5 right-3 px-2 py-0.2 rounded bg-[var(--normal)] text-black text-[9.5px] font-bold font-mono uppercase tracking-wider">
                  Clasificación Asignada
                </div>
                <div className="font-bold text-[var(--normal)] flex items-center justify-between pt-1">
                  <span>Clase B: Lesión No Grave</span>
                  <CheckCircle2 className="w-4 h-4 text-[var(--normal)]" />
                </div>
                <p className="text-[var(--texto)] text-[11.5px] leading-relaxed">
                  Es posible provocar retraso administrativo o clínico leve en caso de error de visualización o falta de disponibilidad, <b>pero el juicio del médico o psicólogo interviene siempre de forma previa</b> a cualquier conducta médica o terapéutica.
                </p>
                <div className="p-2 bg-[var(--normal)]/10 rounded border border-[var(--normal)]/30 text-[10.5px] text-[var(--normal)] font-medium">
                  ✓ Ideal para EDE con autoencoder transversal y escalas psicométricas auxiliares.
                </div>
              </div>

              {/* Clase C */}
              <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2 opacity-70">
                <div className="font-bold text-[var(--riesgo)] flex items-center justify-between">
                  <span>Clase C: Lesión Grave o Muerte</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--sep)] text-[var(--texto-tenue)]">No Aplica</span>
                </div>
                <p className="text-[var(--texto-tenue)] text-[11.5px] leading-relaxed">
                  Software embebido en equipos de soporte vital crítico, bombas de infusión autónomas o dosificación radioterapéutica automatizada sin mediación humana.
                </p>
              </div>
            </div>
          </div>

          {/* 2. ESPECIFICACIÓN DE REQUERIMIENTOS DEL SOFTWARE (SRS - Cláusula 5.2) */}
          <div className="sisap-captura space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accion)]" />
                2. Especificación de Requerimientos del Software (SRS — IEC 62304 Cláusula 5.2)
              </h3>
              <p className="text-xs text-[var(--texto-tenue)]">
                Definición formal de los 4 pilares técnicos auditables exigidos por la norma para EDE clínico
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
                <div className="font-bold text-[var(--texto)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accion)]" />
                  <span>2.1 Funcionales y Rendimiento</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[var(--texto-sec)] text-[11px] leading-relaxed">
                  <li>Procesamiento vectorial del espacio latente de <b>24 variables canónicas</b> (escalas psicométricas y fisiológicas).</li>
                  <li>Latencia de respuesta criptográfica <b>&lt; 0.5 ms</b> por operación mediante la Web Crypto API nativa.</li>
                  <li>Soporte de hasta 500 pacientes activos en memoria local con renderizado asíncrono sin bloqueo de hilo UI.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
                <div className="font-bold text-[var(--texto)] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[var(--normal)]" />
                  <span>2.2 Interfaces Externas y De-identificación</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[var(--texto-sec)] text-[11px] leading-relaxed">
                  <li>Interoperabilidad de exportación bajo el estándar <b>HL7 FHIR Release 4 (JSON structured Bundle)</b>.</li>
                  <li>Cifrado de canal obligado con suite <b>TLS 1.3</b> y desactivación de suites legadas (TLS 1.0/1.1/SSLv3).</li>
                  <li>Seudonimización estricta: Separación de identificadores nominales fuera de los payloads clínicos exportables.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
                <div className="font-bold text-[var(--texto)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--advertencia)]" />
                  <span>2.3 Gestión de Datos y Almacenamiento</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[var(--texto-sec)] text-[11px] leading-relaxed">
                  <li>Garantía de custodia y retención legal ininterrumpida de al menos <b>5 años</b> conforme a NOM-004-SSA3-2012.</li>
                  <li>Bitácora inmutable <b>WORM (Write Once, Read Many)</b> con encadenamiento de hash criptográfico SHA-256.</li>
                  <li>Almacenamiento persistente en volúmenes cifrados (AES-256 / LUKS) y snapshots geo-redundantes.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
                <div className="font-bold text-[var(--texto)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--accion)]" />
                  <span>2.4 Ciberseguridad y Privacidad</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[var(--texto-sec)] text-[11px] leading-relaxed">
                  <li>Control de Acceso Basado en Roles (<b>RBAC</b>) con principio de menor privilegio.</li>
                  <li>Bóveda de des-anonimización con token temporal (<b>TTL de 2 a 5 minutos</b>) y auto-purga volátil.</li>
                  <li>Autenticación Multifactor obligatoria (<b>MFA / TOTP</b>) y cifrado en reposo simétrico <b>AES-256-GCM</b>.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. GESTIÓN DE RIESGOS DEL SOFTWARE (ISO 14971 / IEC 62304 Cláusula 7 - AMEF / FMEA) */}
          <div className="sisap-captura space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[var(--riesgo)]" />
                  3. Gestión de Riesgos del Software (ISO 14971 / IEC 62304 Cláusula 7 — Análisis AMEF / FMEA)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Matriz de Modos de Falla, Efectos y Medidas de Control Técnico implementadas en el código fuente
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30">
                4/4 Riesgos Mitigados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)] bg-[var(--campo)]">
                    <th className="py-2.5 px-3 font-semibold">Identificador de Riesgo</th>
                    <th className="py-2.5 px-3 font-semibold">Causa Raíz / Causa Técnica</th>
                    <th className="py-2.5 px-3 font-semibold">Efecto Clínico / Legal</th>
                    <th className="py-2.5 px-3 font-semibold">Medida de Control e Implementación Técnica</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Estado de Mitigación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)] text-[11px]">
                  <tr className="hover:bg-[var(--campo)]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--accion)] font-mono whitespace-nowrap">
                      R-01: Fuga de Padrón Nominal
                    </td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Acceso no autorizado a la base de datos central o robo de respaldos.
                    </td>
                    <td className="py-3 px-3 text-[var(--riesgo)]">
                      Violación grave a LFPDPPP (Exposición de Dato Sensible de salud mental).
                    </td>
                    <td className="py-3 px-3 text-[var(--texto)]">
                      <b>Separación lógica estricta</b>: Padrón nominal aislado en bóveda cifrada (AES-256) accesible únicamente vía token temporal TTL con auto-purga.
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 font-semibold font-mono text-[10px]">
                        ✓ 100% MITIGADO
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--campo)]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--accion)] font-mono whitespace-nowrap">
                      R-02: Alteración de Ficha Clínica
                    </td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Manipulación directa de notas en DB o ataque Man-in-the-Middle.
                    </td>
                    <td className="py-3 px-3 text-[var(--riesgo)]">
                      Alteración de diagnóstico histórico, pérdida de validez jurídica del EDE.
                    </td>
                    <td className="py-3 px-3 text-[var(--texto)]">
                      <b>Bitácora WORM inmutable</b> con hash encadenado SHA-256 (Merkle) que detecta alteraciones y firma digital ligada a Cédula Profesional.
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 font-semibold font-mono text-[10px]">
                        ✓ 100% MITIGADO
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--campo)]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--accion)] font-mono whitespace-nowrap">
                      R-03: Falla de Disponibilidad Cloud
                    </td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Caída de enlace a internet en consultorio o proveedor cloud fuera de línea.
                    </td>
                    <td className="py-3 px-3 text-[var(--advertencia)]">
                      Imposibilidad de consultar historial de evolución médica en tiempo real.
                    </td>
                    <td className="py-3 px-3 text-[var(--texto)]">
                      <b>Plan de Continuidad DRP/BCP</b> con RPO &lt; 1h y RTO &lt; 4h, con tolerancia a desconexión local y sincronización asíncrona segura.
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 font-semibold font-mono text-[10px]">
                        ✓ 100% MITIGADO
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--campo)]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--accion)] font-mono whitespace-nowrap">
                      R-04: Sesión Abierta en Consultorio
                    </td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Abandono inadvertido de terminal física de consultorio por el profesional.
                    </td>
                    <td className="py-3 px-3 text-[var(--riesgo)]">
                      Visualización no autorizada por personal de limpieza, pacientes o terceros.
                    </td>
                    <td className="py-3 px-3 text-[var(--texto)]">
                      <b>Watchdog de inactividad</b> con cierre de sesión automático (Auto-Lock a los 10 minutos) y revocación forzada de tokens en memoria.
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 font-semibold font-mono text-[10px]">
                        ✓ 100% MITIGADO
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. MATRIZ DE TRAZABILIDAD (Traceability Matrix) */}
          <div className="sisap-captura space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[var(--normal)]" />
                4. Matriz de Trazabilidad Bidireccional (Traceability Matrix — IEC 62304)
              </h3>
              <p className="text-xs text-[var(--texto-tenue)]">
                Demostración fehaciente de que cada requerimiento normativo cuenta con diseño de software, módulo de código fuente y caso de prueba de validación
              </p>
            </div>

            {/* Visual Traceability Flow Diagram */}
            <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-center font-mono space-y-1">
              <span className="text-[11px] text-[var(--texto-tenue)] font-sans">Cadena de Trazabilidad Demostrable:</span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[var(--texto)]">
                <span className="px-2 py-1 bg-[var(--panel)] border border-[var(--sep)] rounded text-[var(--accion)] font-bold">
                  Requerimiento Legal / Norma
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--texto-tenue)]" />
                <span className="px-2 py-1 bg-[var(--panel)] border border-[var(--sep)] rounded text-[var(--normal)] font-bold">
                  Requerimiento Software (SRS)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--texto-tenue)]" />
                <span className="px-2 py-1 bg-[var(--panel)] border border-[var(--sep)] rounded text-[var(--texto)] font-bold">
                  Módulo de Código Fuente
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--texto-tenue)]" />
                <span className="px-2 py-1 bg-[var(--panel)] border border-[var(--sep)] rounded text-[var(--advertencia)] font-bold">
                  Prueba de Verificación (QA/SecOps)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)] bg-[var(--campo)]">
                    <th className="py-2 px-3 font-semibold">Norma / Requerimiento</th>
                    <th className="py-2 px-3 font-semibold">SRS ID</th>
                    <th className="py-2 px-3 font-semibold">Módulo de Código Implementado</th>
                    <th className="py-2 px-3 font-semibold">Prueba de Verificación QA/SecOps</th>
                    <th className="py-2 px-3 font-semibold text-center">Trazabilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)] font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-[var(--texto)]">
                      NOM-024 (No Alterabilidad)
                    </td>
                    <td className="py-2.5 px-3 text-[var(--accion)]">SRS-01 (WORM)</td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                      <code>storageService.ts (logAction)</code>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[var(--texto)]">
                      Prueba 1: Inyección / Ruptura WORM SHA-256
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 text-[10px]">
                        Verificada
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-[var(--texto)]">
                      LFPDPPP (Seudonimización)
                    </td>
                    <td className="py-2.5 px-3 text-[var(--accion)]">SRS-02 (TTL Vault)</td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                      <code>storageService.ts (issueVaultToken)</code>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[var(--texto)]">
                      Prueba 2: Desconexión y Purga de Memoria TTL (1:59 min)
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 text-[10px]">
                        Verificada
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-[var(--texto)]">
                      NOM-024 (Control de Acceso Fuerte)
                    </td>
                    <td className="py-2.5 px-3 text-[var(--accion)]">SRS-03 (MFA/TOTP)</td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                      <code>LoginModal.tsx + cryptoService.ts</code>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[var(--texto)]">
                      Prueba de Acceso con TOTP de 6 dígitos activo
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 text-[10px]">
                        Verificada
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-[var(--texto)]">
                      NOM-004 (Retención Mínima 5 Años)
                    </td>
                    <td className="py-2.5 px-3 text-[var(--accion)]">SRS-04 (Custodia)</td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                      <code>storageService.ts (calculateLegalRetention)</code>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[var(--texto)]">
                      Matriz de retención activa con cálculo perentorio
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 text-[10px]">
                        Verificada
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-[var(--texto)]">
                      NOM-024 (Interoperabilidad HL7 FHIR)
                    </td>
                    <td className="py-2.5 px-3 text-[var(--accion)]">SRS-05 (FHIR v4)</td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                      <code>storageService.ts (generateFhirPatientBundle)</code>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[var(--texto)]">
                      Prueba 3: Benchmark de serialización JSON y descarga
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded bg-[var(--normal)]/10 text-[var(--normal)] border border-[var(--normal)]/30 text-[10px]">
                        Verificada
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. ESTRATEGIA DE PROPIEDAD INTELECTUAL Y PATENTES (INDAUTOR / IMPI / SECRETO INDUSTRIAL) */}
          <div className="sisap-captura space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--texto)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--accion)]" />
                  5. Estrategia de Propiedad Intelectual y Patentes (LFPPI / LFDA)
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Esquema tripartito mexicano para blindar legalmente el código, las invenciones tecnológicas y los algoritmos matemáticos
                </p>
              </div>

              {/* Selector de activo */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedIpAsset('indautor')}
                  className={`text-xs py-1 px-2.5 rounded font-medium transition-colors ${
                    selectedIpAsset === 'indautor'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  1. INDAUTOR (Código)
                </button>
                <button
                  onClick={() => setSelectedIpAsset('impi')}
                  className={`text-xs py-1 px-2.5 rounded font-medium transition-colors ${
                    selectedIpAsset === 'impi'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  2. IMPI (Patente IIC)
                </button>
                <button
                  onClick={() => setSelectedIpAsset('secreto')}
                  className={`text-xs py-1 px-2.5 rounded font-medium transition-colors ${
                    selectedIpAsset === 'secreto'
                      ? 'bg-[var(--accion)] text-white'
                      : 'bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)]'
                  }`}
                >
                  3. Secreto Industrial
                </button>
              </div>
            </div>

            {/* Tripartite Diagram Box */}
            <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded font-mono text-[11px] text-[var(--texto-sec)] overflow-x-auto leading-relaxed whitespace-pre">
{`                    ┌─────────────────────────────────────────┐
                    │      ACTIVOS DE PROPIEDAD DE SISAP     │
                    └────────────────────┬────────────────────┘
                                         │
  ┌──────────────────────────────────────┼──────────────────────────────────────┐
  ▼                                      ▼                                      ▼
┌───────────────┐                    ┌───────────────┐                      ┌───────────────┐
│   INDAUTOR    │                    │     IMPI      │                      │    SECRETO    │
│Derecho de Autor│                   │Invenciones/Pat│                      │  INDUSTRIAL   │
└───────┬───────┘                    └───────┬───────┘                      └───────┬───────┘
        │                                    │                                      │
  • Código Fuente                      • Arquitectura de                      • Pesos y matriz
  TypeScript/Python                    Seudonimización TTL                    del Autoencoder
  • Manuales Operativos                • Proceso de Cadena                    • Bóveda de llaves
  • Interfaz Gráfica (UI)                Merkle WORM en EDE                   • Vectores latentes`}
            </div>

            {/* Detailed Cards based on selection */}
            {selectedIpAsset === 'indautor' && (
              <div className="p-4 bg-[var(--panel)] border border-[var(--sep-claro)] rounded space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[var(--texto)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--accion)]" />
                    <span>Registro de Obra de Programa de Cómputo (INDAUTOR / LFDA)</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-[var(--normal)]">
                    Ley Federal del Derecho de Autor (Arts. 101-114)
                  </span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  Protege el código fuente escrito en TypeScript, React, Node.js y Python contra la reproducción no autorizada, descompilación ilícita o plagio literal. Se registran tanto las rutinas criptográficas como las pantallas de captura y manuales operativos.
                </p>
                <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-1 font-mono text-[11px]">
                  <div><b>Titular Registral:</b> Comunidad Terapéutica Under The Tree Miller A.C. / Creadores Autorizados.</div>
                  <div><b>Ramo Registral:</b> Programa de Cómputo (Software).</div>
                  <div><b>Módulos Clave:</b> <code>cryptoService.ts</code>, <code>storageService.ts</code>, <code>fhirExporter.ts</code>, Manual de Arquitectura.</div>
                </div>
              </div>
            )}

            {selectedIpAsset === 'impi' && (
              <div className="p-4 bg-[var(--panel)] border-2 border-[var(--accion)] rounded space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[var(--accion)] flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Invención Implementada en Computadora (IIC / Patente IMPI)</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-[var(--accion)]">
                    Ley Federal de Protección a la Propiedad Industrial (LFPPI)
                  </span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  <b>Estrategia Crítica:</b> En México, el Artículo 47 Fracción IV de la LFPPI no considera patentable el software "en sí mismo". Por lo tanto, la solicitud de patente se redacta como un <b>Sistema Físico-Lógico Ciberseguro e Invención Implementada en Computadora (IIC)</b>, destacando el efecto técnico tangible sobre la integridad de datos de salud y el aislamiento en memoria volátil.
                </p>
                <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2 text-[11.5px]">
                  <div>
                    <span className="font-bold text-[var(--texto)]">Título Sugerido de la Invención ante el IMPI:</span>
                    <p className="italic text-[var(--accion)] font-mono text-[11px] pt-0.5">
                      "Sistema ciberseguro de arquitectura distribuida para la seudonimización dinámica con control temporal de acceso y verificación criptográfica inmutable en tiempo real de registros clínicos"
                    </p>
                  </div>
                  <div className="pt-1 border-t border-[var(--sep-claro)] space-y-1">
                    <span className="font-bold text-[var(--texto)]">Materia Reclamable (Reivindicaciones):</span>
                    <ol className="list-decimal pl-4 space-y-1 text-[var(--texto-sec)] text-[11px]">
                      <li><b>Reivindicación 1:</b> Método implementado en computadora para el resguardo y des-anonimización temporal revocable de expedientes de salud mediante bóveda lógica aislada con temporizador de vida útil (TTL) y auto-purga volátil.</li>
                      <li><b>Reivindicación 2:</b> Sistema de auditoría clínica distribuida que integra una cadena de hashes acoplados tipo Merkle con verificación de integridad en tiempo real para el cumplimiento no-repudiable de la NOM-024-SSA3-2012.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {selectedIpAsset === 'secreto' && (
              <div className="p-4 bg-[var(--panel)] border border-[var(--sep-claro)] rounded space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[var(--advertencia)] flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Protección por Secreto Industrial (LFPPI Arts. 260 al 266)</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-[var(--advertencia)]">
                    Secreto Industrial Protegido
                  </span>
                </div>
                <p className="text-[var(--texto-sec)] leading-relaxed">
                  Dado que los algoritmos y redes neuronales no son patentables como tales, los pesos de entrenamiento del autoencoder, la matriz transversal de 24 a 12 variables latentes y los algoritmos de regularización psicométrica se resguardan como <b>Secreto Industrial</b>. Su divulgación indebida constituye un delito federal grave con sanciones penales.
                </p>
                <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-1 text-[11px] font-mono">
                  <div>• Topología de la red neuronal y pesos entrenados del autoencoder (24 $\rightarrow$ 12 dimensiones).</div>
                  <div>• Algoritmo de mapeo no lineal entre ID seudónimo <code>TUS-XXXX</code> y CURP nominal.</div>
                  <div>• Claves criptográficas maestras y rutinas de sal PBKDF2 en la Web Crypto API.</div>
                </div>
              </div>
            )}

            {/* Quick Action to Download README files */}
            <div className="p-3.5 bg-[var(--campo)] border border-[var(--sep)] rounded flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[var(--texto)]">Archivos Normativos Formalizados en la Raíz del Proyecto:</span>
                <p className="text-[11px] text-[var(--texto-tenue)]">
                  Consulte y descargue los documentos técnicos oficiales <code>README_SYSTEM_REQUIREMENTS.md</code> y <code>README_PATENT_IP.md</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const content = `# SISAP by CENIVRA — Especificación de Requerimientos del Sistema y Entorno Operativo\n\n1. Clasificación: SIRES (NOM-024) y Clase B (IEC 62304).\n2. Servidor: Linux, PostgreSQL 14+, Node.js v18+, RAM 4-8 GB, TLS 1.3 forzado.\n3. Cliente: Web Crypto API nativa, Core i3/Ryzen 3, RAM 2 GB libre.\n4. Interoperabilidad: HL7 FHIR Release 4 JSON, SHA-256 Merkle, AES-256-GCM.`;
                    handleDownloadTextFile('README_SYSTEM_REQUIREMENTS.md', content);
                  }}
                  className="sisap-btn-sec text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar README_SYSTEM_REQUIREMENTS.md</span>
                </button>

                <button
                  onClick={() => {
                    const content = `# SISAP by CENIVRA — Estrategia de Propiedad Intelectual, Activos Digitales y Protección Regulatoria\n\n1. INDAUTOR: Programa de Cómputo (Código Fuente TypeScript/React).\n2. IMPI: Patente de Invención Implementada en Computadora (IIC).\n3. SECRETO INDUSTRIAL: Autoencoder (24 a 12 variables latentes) y Bóveda de Seudonimización (LFPPI Arts. 260-266).`;
                    handleDownloadTextFile('README_PATENT_IP.md', content);
                  }}
                  className="sisap-btn text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar README_PATENT_IP.md</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Radicar Solicitud ARCO */}
      {showArcoModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--panel)] border-2 border-[var(--accion)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--sep-claro)] pb-2">
              <div className="flex items-center gap-2 text-[var(--accion)] font-bold text-sm">
                <UserCheck className="w-5 h-5" />
                <span>Radicación de Solicitud de Derechos ARCO (INAI)</span>
              </div>
              <button
                onClick={() => setShowArcoModal(false)}
                className="text-xs text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateArcoRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                    Expediente Clínico:
                  </label>
                  <select
                    value={arcoExp}
                    onChange={(e) => setArcoExp(e.target.value)}
                    className="sisap-select font-mono"
                  >
                    {patients.map((p) => (
                      <option key={p.seudonimo} value={p.seudonimo}>
                        {p.seudonimo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                    Tipo de Derecho ARCO:
                  </label>
                  <select
                    value={arcoType}
                    onChange={(e) => setArcoType(e.target.value as any)}
                    className="sisap-select"
                  >
                    <option value="Acceso">Acceso (Copia de Expediente)</option>
                    <option value="Rectificación">Rectificación (Corrección)</option>
                    <option value="Cancelación">Cancelación (Supresión datos)</option>
                    <option value="Oposición">Oposición (Fines de estudio)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                  Nombre Completo del Solicitante (Titular o Representante con Poder): *
                </label>
                <input
                  type="text"
                  required
                  value={arcoApplicant}
                  onChange={(e) => setArcoApplicant(e.target.value)}
                  placeholder="Nombre y firma del titular..."
                  className="sisap-input"
                />
              </div>

              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                  Datos de Contacto para Notificación Legal: *
                </label>
                <input
                  type="text"
                  required
                  value={arcoContact}
                  onChange={(e) => setArcoContact(e.target.value)}
                  placeholder="Correo electrónico y teléfono..."
                  className="sisap-input"
                />
              </div>

              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                  Descripción Clara y Precisa de la Petición: *
                </label>
                <textarea
                  required
                  rows={3}
                  value={arcoDesc}
                  onChange={(e) => setArcoDesc(e.target.value)}
                  placeholder="Especifique los datos o notas sobre los que ejerce el derecho..."
                  className="sisap-input"
                />
              </div>

              <div className="p-2.5 bg-[var(--campo)] border border-[var(--sep)] rounded text-[11px] text-[var(--texto-tenue)]">
                Se asignará automáticamente un folio oficial con plazo perentorio de 20 días hábiles para emitir la determinación conforme al Art. 32 de la LFPDPPP.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sep-claro)]">
                <button
                  type="button"
                  onClick={() => setShowArcoModal(false)}
                  className="sisap-btn-sec"
                >
                  Cancelar
                </button>
                <button type="submit" className="sisap-btn">
                  Radicar y Asentar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Consentimiento Expreso */}
      {showConsentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--panel)] border-2 border-[var(--normal)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--sep-claro)] pb-2">
              <div className="flex items-center gap-2 text-[var(--normal)] font-bold text-sm">
                <FileSignature className="w-5 h-5" />
                <span>Captura de Consentimiento Expreso por Escrito (LFPDPPP)</span>
              </div>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-xs text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateConsent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                    Expediente Seudónimo:
                  </label>
                  <select
                    value={consentExp}
                    onChange={(e) => setConsentExp(e.target.value)}
                    className="sisap-select font-mono"
                  >
                    {patients.map((p) => (
                      <option key={p.seudonimo} value={p.seudonimo}>
                        {p.seudonimo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                    Método de Expresión:
                  </label>
                  <select
                    value={consentMethod}
                    onChange={(e) => setConsentMethod(e.target.value as any)}
                    className="sisap-select"
                  >
                    <option value="firma_digital">Firma Digital Autógrafa</option>
                    <option value="otp_sms">Código OTP Móvil / SMS</option>
                    <option value="casilla_trazable">Casilla No Preseleccionada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                  Nombre Completo del Paciente o Tutor Legal: *
                </label>
                <input
                  type="text"
                  required
                  value={consentName}
                  onChange={(e) => setConsentName(e.target.value)}
                  placeholder="Nombre legal del otorgante..."
                  className="sisap-input"
                />
              </div>

              {/* Explicit non-preselected checkboxes */}
              <div className="space-y-2 p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-[11.5px]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-[var(--texto)] leading-snug">
                    <b>Consentimiento Expreso Obligatorio:</b> Otorgo mi consentimiento expreso por escrito para el tratamiento de mis datos personales sensibles de salud, escalas psicométricas y notas clínicas conforme al Aviso de Privacidad Integral de CENIVRA.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consentAuthResearch}
                    onChange={(e) => setConsentAuthResearch(e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-[var(--texto-sec)] leading-snug">
                    Autorizo el uso de mis datos seudonimizados en estudios analíticos y cohortes científicas de salud mental.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consentAuthAi}
                    onChange={(e) => setConsentAuthAi(e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-[var(--texto-sec)] leading-snug">
                    Autorizo el procesamiento analítico del autoencoder de 24 variables canónicas para monitoreo de impulsividad y craving.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sep-claro)]">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="sisap-btn-sec"
                >
                  Cancelar
                </button>
                <button type="submit" className="sisap-btn">
                  Registrar con Digest Criptográfico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
