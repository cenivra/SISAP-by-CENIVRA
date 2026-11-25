import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types/clinical';
import { ROLES } from '../constants/clinicalConstants';
import { StorageService } from '../services/storageService';
import { generateSalt, hashPasswordPbkdf2, verifyPassword, getCurrentOtpCode } from '../services/cryptoService';
import { ShieldCheck, Lock, AlertCircle, KeyRound, Info, CheckCircle2, ArrowRight, Smartphone, RefreshCw } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: UserAccount) => void;
  appMode?: 'demo' | 'institutional';
  onAppModeChange?: (mode: 'demo' | 'institutional') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  appMode = 'demo',
  onAppModeChange,
}) => {
  const isLockedInstitutional =
    (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_SISAP_DISTRIBUTION ===
    'institutional';
  const effectiveMode: 'demo' | 'institutional' = isLockedInstitutional ? 'institutional' : appMode;
  const users = StorageService.getUsers();
  const [selectedUsername, setSelectedUsername] = useState<string>(
    effectiveMode === 'institutional' ? '' : users[3]?.u || 'psicologo'
  );
  const [password, setPassword] = useState<string>(
    effectiveMode === 'institutional' ? '' : users[3]?.c || 'demo-clinico'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Forced password change modal
  const [userRequiringChange, setUserRequiringChange] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changePasswordError, setChangePasswordError] = useState<string>('');
  const [isSavingNewPassword, setIsSavingNewPassword] = useState<boolean>(false);

  // MFA 2FA State (NOM-024 / ISO-27001)
  const [mfaPendingUser, setMfaPendingUser] = useState<UserAccount | null>(null);
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaError, setMfaError] = useState<string>('');
  const [totpInfo, setTotpInfo] = useState(getCurrentOtpCode());

  useEffect(() => {
    const timer = setInterval(() => {
      setTotpInfo(getCurrentOtpCode());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');

    if (!mfaPendingUser) return;

    const trimmed = mfaCode.trim();
    const mfaAccepted =
      effectiveMode === 'institutional'
        ? trimmed === totpInfo.code
        : trimmed === totpInfo.code || trimmed === '999111' || trimmed === '123456';
    if (mfaAccepted) {
      const user = mfaPendingUser;
      setMfaPendingUser(null);
      setMfaCode('');

      StorageService.logAction({
        usuario: user.u,
        rol: user.rol,
        accion: 'Autenticación Multi-Factor (MFA) Aprobada',
        exp: '—',
        detalles: 'Segundo factor TOTP validado conforme a NOM-024-SSA3-2012.',
      });

      onLoginSuccess(user);
    } else {
      setMfaError('Código de verificación incorrecto o expirado.');
    }
  };

  const activeDemoUser = users.find((u) => u.u === selectedUsername) || users[0];

  const handleUserSelect = (username: string) => {
    setSelectedUsername(username);
    const user = users.find((u) => u.u === username);
    if (user) {
      setPassword(user.c || '');
    }
    setErrorMessage('');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsVerifying(true);

    try {
      const user = users.find((u) => u.u.toLowerCase() === selectedUsername.toLowerCase());
      if (!user) {
        setErrorMessage('Usuario no encontrado en la base de datos.');
        return;
      }

      if (user.activo === false) {
        setErrorMessage('Esta cuenta se encuentra temporalmente suspendida por la administración.');
        return;
      }

      let isValid = false;
      if (user.clave_hash && user.clave_sal) {
        isValid = await verifyPassword(password, user.clave_sal, user.clave_hash);
      } else if (user.c) {
        isValid = password === user.c;
      }

      if (!isValid) {
        setErrorMessage('Contraseña incorrecta.');
        return;
      }

      // Check if user must change password on first login
      if (user.debe_cambiar_clave) {
        setUserRequiringChange(user);
        return;
      }

      // Check MFA requirement (NOM-024 / ISO-27001)
      const secConfig = StorageService.getSecurityConfig();
      if (secConfig.enforceMfaAll || user.mfa_habilitado) {
        setMfaPendingUser(user);
        setMfaCode('');
        setMfaError('');
        return;
      }

      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al autenticar.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForceChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');

    if (newPassword.length < 8) {
      setChangePasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('Las contraseñas no coinciden.');
      return;
    }

    if (!userRequiringChange) return;

    setIsSavingNewPassword(true);
    try {
      const salt = generateSalt(16);
      const hash = await hashPasswordPbkdf2(newPassword, salt);

      StorageService.updateUserPassword(userRequiringChange.u, hash, salt);

      StorageService.logAction({
        usuario: userRequiringChange.u,
        rol: userRequiringChange.rol,
        accion: 'Cambio obligatorio de contraseña completado',
        exp: '—',
        detalles: 'Se derivó nuevo hash PBKDF2 con sal y se desactivó debe_cambiar_clave.',
      });

      const updatedUser = StorageService.getUser(userRequiringChange.u)!;
      setUserRequiringChange(null);
      onLoginSuccess(updatedUser);
    } catch (err: any) {
      setChangePasswordError('Error al cifrar y guardar la nueva contraseña.');
    } finally {
      setIsSavingNewPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 my-8 text-[var(--texto)]">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[var(--accion-fondo)]/20 text-[var(--accion)] rounded">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SISAP by CENIVRA</h1>
            <div className="text-xs text-[var(--texto-tenue)]">
              Sistema de Información y Seguimiento para Trastornos por Uso de Sustancias
            </div>
          </div>
        </div>

        <div className="text-xs text-[var(--texto-sec)] mb-4 pb-3 border-b border-[var(--sep)] flex flex-wrap items-center justify-between gap-2">
          <span>Control de acceso profesional · Gobernanza de datos con separación ontológica de identidad</span>
          {!isLockedInstitutional && onAppModeChange ? (
            <div className="inline-flex rounded border border-[var(--sep)] bg-[var(--fondo)] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  onAppModeChange('demo');
                  setSelectedUsername(users[3]?.u || 'psicologo');
                  setPassword(users[3]?.c || 'demo-clinico');
                  setErrorMessage('');
                }}
                className={`px-2.5 py-1 rounded-sm font-medium transition ${
                  effectiveMode === 'demo'
                    ? 'bg-[var(--accion)] text-white'
                    : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
                }`}
              >
                Modo Evaluación
              </button>
              <button
                type="button"
                onClick={() => {
                  onAppModeChange('institutional');
                  setSelectedUsername('');
                  setPassword('');
                  setErrorMessage('');
                }}
                className={`px-2.5 py-1 rounded-sm font-medium transition ${
                  effectiveMode === 'institutional'
                    ? 'bg-[var(--normal)] text-white'
                    : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
                }`}
              >
                Modo Institucional
              </button>
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded bg-[var(--normal)]/15 text-[var(--normal)] border border-[var(--normal)]/30 font-mono text-[10.5px]">
              MODO INSTITUCIONAL ESTRICTO
            </span>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {effectiveMode === 'demo' ? (
            <div>
              <label className="block text-xs font-medium text-[var(--texto-sec)] mb-1.5">
                Seleccionar Perfil Profesional de Acceso ({users.length} cuentas)
              </label>
              <select
                value={selectedUsername}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="sisap-select font-medium"
              >
                {users.map((user) => {
                  const role = ROLES[user.rol];
                  return (
                    <option key={user.u} value={user.u}>
                      {user.nombre} ({role?.n || user.rol}) — {user.u}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[var(--texto-sec)] mb-1.5">
                Identificador de Cuenta Institucional *
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={selectedUsername}
                onChange={(e) => {
                  setSelectedUsername(e.target.value);
                  setErrorMessage('');
                }}
                className="sisap-input font-medium"
                placeholder="Ingrese su usuario institucional"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[var(--texto-sec)]">Contraseña</label>
              {effectiveMode === 'demo' && activeDemoUser?.c && (
                <span className="text-[11px] text-[var(--texto-tenue)] font-mono">
                  Clave demo: <code className="text-[var(--accion)]">{activeDemoUser.c}</code>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sisap-input pr-10"
                placeholder="Contraseña del profesional"
              />
              <Lock className="w-4 h-4 absolute right-3 top-3 text-[var(--texto-tenue)]" />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-[var(--riesgo)] bg-[var(--riesgo)]/10 p-2.5 rounded border border-[var(--riesgo)]/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {effectiveMode === 'demo' && activeDemoUser ? (
            <div className="p-3 bg-[var(--fondo)] border border-[var(--sep)] rounded text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--texto)]">
                  Capacidades del rol: {ROLES[activeDemoUser.rol]?.n}
                </span>
                <span className="text-[10.5px] font-mono text-[var(--accion)]">
                  {activeDemoUser.cedula || 'Sin cédula registrada'}
                </span>
              </div>
              <p className="text-[var(--texto-sec)] leading-normal">
                {ROLES[activeDemoUser.rol]?.descripcion}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    ROLES[activeDemoUser.rol]?.ve_identidad
                      ? 'text-[var(--normal)] border-[var(--normal)]/30 bg-[var(--normal)]/5'
                      : 'text-[var(--texto-tenue)] border-[var(--sep)]'
                }`}
              >
                {ROLES[activeDemoUser.rol]?.ve_identidad ? '✓ Ve Identidad' : '✗ Identidad Oculta'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  ROLES[activeDemoUser.rol]?.reidentifica
                    ? 'text-[var(--advertencia)] border-[var(--advertencia)]/30 bg-[var(--advertencia)]/5'
                    : 'text-[var(--texto-tenue)] border-[var(--sep)]'
                }`}
              >
                {ROLES[activeDemoUser.rol]?.reidentifica ? '⚠ Reidentifica con bitácora' : '✗ No reidentifica'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  ROLES[activeDemoUser.rol]?.escribe
                    ? 'text-[var(--normal)] border-[var(--normal)]/30 bg-[var(--normal)]/5'
                    : 'text-[var(--texto-tenue)] border-[var(--sep)]'
                }`}
              >
                {ROLES[activeDemoUser.rol]?.escribe ? '✓ Captura Clínica' : '✗ Solo lectura'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  ROLES[activeDemoUser.rol]?.capa_blindada
                    ? 'text-[var(--riesgo)] border-[var(--riesgo)]/30 bg-[var(--riesgo)]/5'
                    : 'text-[var(--texto-tenue)] border-[var(--sep)]'
                }`}
              >
                {ROLES[activeDemoUser.rol]?.capa_blindada ? '★ Capa Blindada' : '✗ Capa Blindada'}
              </span>
            </div>
          </div>
          ) : (
            <div className="p-3 bg-[var(--fondo)] border border-[var(--sep)] rounded text-xs text-[var(--texto-sec)]">
              Sesión en <strong className="text-[var(--texto)]">Modo Institucional</strong>: sin autocompletado de credenciales ni códigos TOTP expuestos en pantalla.
            </div>
          )}

          <button type="submit" disabled={isVerifying} className="sisap-btn w-full py-2.5 text-sm">
            {isVerifying ? 'Verificando Hash Criptográfico...' : 'Ingresar al Sistema Clínico'}
          </button>
        </form>

        {/* Security governance banner */}
        <div className="mt-5 p-3 rounded bg-[var(--campo)] border border-[var(--borde)]/40 text-[11px] text-[var(--texto-sec)] space-y-2">
          <div className="flex items-center gap-1.5 text-[var(--advertencia)] font-medium">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Gobernanza de Cuentas y Políticas de Seguridad</span>
          </div>
          <p className="leading-relaxed">
            Las credenciales se derivan mediante <b>PBKDF2-HMAC-SHA256 con 100,000 iteraciones y sal aleatoria</b>. El atributo <code className="font-mono text-[var(--accion)]">debe_cambiar_clave = 1</code> fuerza al profesional a establecer su propia contraseña confidencial en el primer acceso.
          </p>
        </div>
      </div>

      {/* Modal Obligatorio de Cambio de Contraseña en Primer Ingreso */}
      {userRequiringChange && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--panel)] border-2 border-[var(--advertencia)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2 text-[var(--advertencia)] font-bold">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-base">Cambio Obligatorio de Contraseña</h3>
            </div>
            <p className="text-xs text-[var(--texto-sec)] mb-4 leading-relaxed">
              Por política institucional de seguridad CENIVRA (<code className="font-mono text-[var(--accion)]">debe_cambiar_clave = 1</code>), debe definir una contraseña personal para la cuenta <b>{userRequiringChange.u}</b> ({userRequiringChange.nombre}) antes de acceder al expediente clínico.
            </p>

            <form onSubmit={handleForceChangePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                  Nueva Contraseña Personal (Mínimo 8 caracteres) *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingrese su nueva contraseña..."
                  className="sisap-input"
                />
              </div>

              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Vuelva a escribir la contraseña..."
                  className="sisap-input"
                />
              </div>

              {changePasswordError && (
                <div className="flex items-center gap-2 text-xs text-[var(--riesgo)] bg-[var(--riesgo)]/10 p-2 rounded border border-[var(--riesgo)]/30">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep)] text-[10.5px] text-[var(--texto-tenue)]">
                Su nueva contraseña será protegida de inmediato con una sal criptográfica aleatoria de 16 bytes y procesada con 100,000 iteraciones de PBKDF2.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sep-claro)]">
                <button
                  type="button"
                  onClick={() => setUserRequiringChange(null)}
                  className="sisap-btn-sec"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingNewPassword}
                  className="sisap-btn"
                >
                  {isSavingNewPassword ? 'Cifrando Clave...' : 'Guardar y Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Autenticación Multi-Factor (MFA / TOTP) */}
      {mfaPendingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--panel)] border-2 border-[var(--accion)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2 text-[var(--accion)] font-bold">
              <Smartphone className="w-5 h-5" />
              <h3 className="text-base">Segundo Factor de Autenticación (MFA)</h3>
            </div>
            <p className="text-xs text-[var(--texto-sec)] mb-3 leading-relaxed">
              En cumplimiento con la <b>NOM-024-SSA3-2012</b> y control de acceso estricto, ingrese el código temporal de 6 dígitos para el usuario <b>{mfaPendingUser.u}</b> ({mfaPendingUser.nombre}).
            </p>

            {effectiveMode === 'demo' && (
              <div className="mb-4 p-3 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--texto-tenue)] font-mono">Token TOTP Activo (Evaluación):</span>
                  <span className="text-[11px] font-mono text-[var(--advertencia)]">
                    Renueva en: <b>{totpInfo.secondsRemaining}s</b>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-mono font-bold tracking-widest text-[var(--accion)]">
                    {totpInfo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMfaCode(totpInfo.code)}
                    className="sisap-btn-sec text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Autocompletar Código</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--texto-sec)] mb-1">
                  Código de Seguridad de 6 dígitos *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="sisap-input text-center font-mono text-lg tracking-widest"
                />
              </div>

              {mfaError && (
                <div className="flex items-center gap-2 text-xs text-[var(--riesgo)] bg-[var(--riesgo)]/10 p-2.5 rounded border border-[var(--riesgo)]/30">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mfaError}</span>
                </div>
              )}

              {effectiveMode === 'demo' && (
                <div className="text-[11px] text-[var(--texto-tenue)]">
                  También puede emplear el código de contingencia clínica: <code className="font-mono text-[var(--texto)]">999111</code>.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sep-claro)]">
                <button
                  type="button"
                  onClick={() => {
                    setMfaPendingUser(null);
                    setMfaCode('');
                  }}
                  className="sisap-btn-sec text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="sisap-btn text-xs py-2 px-4">
                  Validar MFA y Acceder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
