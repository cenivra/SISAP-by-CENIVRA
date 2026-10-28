import React, { useState } from 'react';
import { RoleConfig, RoleKey, UserAccount } from '../../types/clinical';
import { ROLES } from '../../constants/clinicalConstants';
import { StorageService } from '../../services/storageService';
import {
  generateRandomPassword,
  generateSalt,
  hashPasswordPbkdf2,
} from '../../services/cryptoService';
import { SCRIPT_SQL_USUARIOS_CLAVES, generateUserInsertSql } from '../../constants/sqlScripts';
import {
  UserCheck,
  Shield,
  KeyRound,
  Lock,
  Info,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Download,
  Copy,
  Eye,
  FileCode,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface UsersManagementViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({ currentUser, roleConfig }) => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'sql' | 'matriz'>('usuarios');
  const [usersList, setUsersList] = useState<UserAccount[]>(StorageService.getUsers());

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    u: '',
    nombre: '',
    rol: 'psicologo' as RoleKey,
    cedula: '',
    email: '',
    password: '',
    debe_cambiar_clave: true,
  });
  const [computedSalt, setComputedSalt] = useState('');
  const [computedHash, setComputedHash] = useState('');
  const [isComputingHash, setIsComputingHash] = useState(false);

  // Reset Password Modal state
  const [userToReset, setUserToReset] = useState<UserAccount | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSalt, setResetSalt] = useState('');
  const [resetHash, setResetHash] = useState('');

  // Inspect Crypto Details Modal
  const [userToInspect, setUserToInspect] = useState<UserAccount | null>(null);

  // Copy SQL feedback
  const [copiedSql, setCopiedSql] = useState(false);

  const isAdmin = roleConfig.administra;

  const reloadUsers = () => {
    setUsersList(StorageService.getUsers());
  };

  const handleGenerateRandomPassword = async () => {
    const pwd = generateRandomPassword(14);
    const salt = generateSalt(16);
    setNewUserForm((prev) => ({ ...prev, password: pwd }));
    setComputedSalt(salt);
    setIsComputingHash(true);
    try {
      const hash = await hashPasswordPbkdf2(pwd, salt);
      setComputedHash(hash);
    } finally {
      setIsComputingHash(false);
    }
  };

  const handlePasswordInputChange = async (val: string) => {
    setNewUserForm((prev) => ({ ...prev, password: val }));
    const salt = computedSalt || generateSalt(16);
    setComputedSalt(salt);
    if (val.trim()) {
      setIsComputingHash(true);
      try {
        const hash = await hashPasswordPbkdf2(val, salt);
        setComputedHash(hash);
      } finally {
        setIsComputingHash(false);
      }
    } else {
      setComputedHash('');
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.u.trim() || !newUserForm.nombre.trim()) {
      alert('Por favor ingrese el usuario y nombre completo.');
      return;
    }

    const salt = computedSalt || generateSalt(16);
    const pwd = newUserForm.password || generateRandomPassword(12);
    const hash = computedHash || (await hashPasswordPbkdf2(pwd, salt));

    const newAccount: UserAccount = {
      u: newUserForm.u.trim().toLowerCase(),
      nombre: newUserForm.nombre.trim(),
      rol: newUserForm.rol,
      cedula: newUserForm.cedula.trim() || undefined,
      email: newUserForm.email.trim() || `${newUserForm.u.trim().toLowerCase()}@cenivra.org.mx`,
      c: pwd, // temporary display
      clave_sal: salt,
      clave_hash: hash,
      debe_cambiar_clave: newUserForm.debe_cambiar_clave,
      activo: true,
      creado_en: new Date().toLocaleString('es-MX'),
    };

    StorageService.saveUser(newAccount);

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Alta de usuario profesional (Modo Admin)',
      exp: '—',
      detalles: `Creado usuario: ${newAccount.u} (${newAccount.nombre}) con rol ${newAccount.rol}.`,
    });

    reloadUsers();
    setShowCreateModal(false);
    alert(`Usuario ${newAccount.u} creado con éxito.\nContraseña inicial asignada: ${pwd}\nDebe cambiarla en el 1er ingreso.`);
  };

  const handleOpenResetModal = async (u: UserAccount) => {
    setUserToReset(u);
    const newPwd = generateRandomPassword(14);
    const salt = generateSalt(16);
    setResetNewPassword(newPwd);
    setResetSalt(salt);
    const hash = await hashPasswordPbkdf2(newPwd, salt);
    setResetHash(hash);
  };

  const handleConfirmResetPassword = () => {
    if (!userToReset) return;
    StorageService.updateUserPassword(userToReset.u, resetHash, resetSalt);

    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Reinicio administrativo de contraseña',
      exp: '—',
      detalles: `Contraseña reestablecida para usuario: ${userToReset.u}. Obliga cambio en próximo ingreso.`,
    });

    reloadUsers();
    alert(`Contraseña para ${userToReset.u} actualizada.\nNueva contraseña provisional: ${resetNewPassword}\nSe forzará el cambio en el próximo ingreso.`);
    setUserToReset(null);
  };

  const handleToggleUserActive = (targetUser: UserAccount) => {
    const isNowActive = StorageService.toggleUserStatus(targetUser.u);
    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: isNowActive ? 'Reactivación de cuenta' : 'Suspensión de cuenta',
      exp: '—',
      detalles: `Usuario ${targetUser.u} cambiado a estado ${isNowActive ? 'ACTIVO' : 'INACTIVO'}.`,
    });
    reloadUsers();
  };

  const handleDownloadSqlScript = () => {
    const blob = new Blob([SCRIPT_SQL_USUARIOS_CLAVES], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generar_usuarios_claves.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(SCRIPT_SQL_USUARIOS_CLAVES);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Gestión de Usuarios, Modo Admin y Criptografía de Claves
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Control de cuentas, generador PBKDF2 con sal y archivo de siembra SQL para producción
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => {
                handleGenerateRandomPassword();
                setShowCreateModal(true);
              }}
              className="sisap-btn text-xs py-1.5 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Nuevo Usuario</span>
            </button>
          )}

          <button
            onClick={handleDownloadSqlScript}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5 text-[var(--accion)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar SQL</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--sep-claro)] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'usuarios'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          Directorio de Usuarios ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sql'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Archivo SQL (generar_usuarios_claves.sql)</span>
        </button>

        <button
          onClick={() => setActiveTab('matriz')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'matriz'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          Matriz de Facultades (RBAC)
        </button>
      </div>

      {/* TAB 1: Directorio y Modo Admin */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="sisap-tarjeta mb-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--sep-claro)]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[var(--accion)]" />
                <h3 className="text-sm font-semibold">Cuentas Profesionales Registradas</h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--texto-tenue)]">
                Modo: {isAdmin ? <b className="text-[var(--normal)]">Administrador Activo</b> : 'Solo Consulta'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-2.5 px-3 font-semibold">Usuario</th>
                    <th className="py-2.5 px-3 font-semibold">Nombre y Cédula</th>
                    <th className="py-2.5 px-3 font-semibold">Rol Asignado</th>
                    <th className="py-2.5 px-3 font-semibold">Seguridad</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Estado</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)]">
                  {usersList.map((u) => {
                    const r = ROLES[u.rol];
                    const isSelf = u.u === currentUser.u;
                    return (
                      <tr key={u.u} className="hover:bg-[var(--captura)] transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-[var(--accion)]">
                          {u.u}
                          {isSelf && (
                            <span className="ml-1.5 text-[9.5px] bg-[var(--accion-fondo)] text-white px-1.5 py-0.2 rounded font-sans">
                              (Tu sesión)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[var(--texto)]">{u.nombre}</div>
                          <div className="text-[10.5px] text-[var(--texto-tenue)] font-mono">
                            {u.cedula || 'Sin cédula asignada'} · {u.email || `${u.u}@cenivra.org.mx`}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] px-2 py-0.5 rounded border border-[var(--borde)]/40 bg-[var(--campo)]">
                            {r?.n || u.rol}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px]">
                          {u.debe_cambiar_clave ? (
                            <span className="est-warn text-[10px]">Debe cambiar clave</span>
                          ) : (
                            <span className="est-ok text-[10px]">Clave establecida</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {u.activo !== false ? (
                            <span className="est-ok text-[10px]">Activo</span>
                          ) : (
                            <span className="est-risk text-[10px]">Inactivo</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setUserToInspect(u)}
                            className="sisap-btn-sec py-1 px-2 text-[11px]"
                            title="Ver salt, hash y SQL de esta cuenta"
                          >
                            <KeyRound className="w-3 h-3 text-[var(--accion)]" />
                            <span>Crypto</span>
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenResetModal(u)}
                                className="sisap-btn-sec py-1 px-2 text-[11px]"
                                title="Restablecer contraseña de acceso"
                              >
                                <RefreshCw className="w-3 h-3 text-[var(--advertencia)]" />
                                <span>Reset Clave</span>
                              </button>

                              {!isSelf && (
                                <button
                                  onClick={() => handleToggleUserActive(u)}
                                  className={`py-1 px-2 rounded text-[11px] border cursor-pointer ${
                                    u.activo !== false
                                      ? 'text-[var(--riesgo)] border-[var(--riesgo)]/40 hover:bg-[var(--riesgo)]/10'
                                      : 'text-[var(--normal)] border-[var(--normal)]/40 hover:bg-[var(--normal)]/10'
                                  }`}
                                  title={u.activo !== false ? 'Suspender cuenta' : 'Reactivar cuenta'}
                                >
                                  {u.activo !== false ? 'Suspender' : 'Activar'}
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Security Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="sisap-captura mb-0">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[var(--accion)]">
                <Shield className="w-4 h-4" />
                <span>Mecanismo de Sal y Derivación Criptográfica</span>
              </div>
              <p className="text-xs text-[var(--texto-sec)] leading-relaxed mb-2">
                Cada cuenta posee una sal aleatoria independiente de 16 bytes (<code className="font-mono text-[var(--accion)]">clave_sal</code>). La contraseña se procesa mediante <b>PBKDF2 con HMAC-SHA256 y 100,000 iteraciones</b>, neutralizando ataques mediante tablas arcoíris y colisiones precomputadas.
              </p>
            </div>

            <div className="sisap-captura mb-0">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[var(--advertencia)]">
                <Lock className="w-4 h-4" />
                <span>Política de Cambio Obligatorio en Primer Ingreso</span>
              </div>
              <p className="text-xs text-[var(--texto-sec)] leading-relaxed mb-2">
                Cuando el administrador crea una cuenta o restablece una contraseña, el atributo <code className="font-mono text-[var(--accion)]">debe_cambiar_clave = 1</code> fuerza al profesional a definir su propia clave secreta personal inmediatamente al iniciar sesión, evitando que el administrador conserve acceso a la cuenta del clínico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Archivo SQL */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="sisap-tarjeta">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-[var(--sep-claro)]">
              <div>
                <h3 className="text-sm font-semibold">Script SQL Canónico: generar_usuarios_claves.sql</h3>
                <div className="text-xs text-[var(--texto-tenue)]">
                  Archivo DDL ejecutable para SQLite, PostgreSQL o MySQL con triggers de auditoría y cuentas con sal
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySqlScript}
                  className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-[var(--normal)]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copiado' : 'Copiar Script'}</span>
                </button>
                <button
                  onClick={handleDownloadSqlScript}
                  className="sisap-btn text-xs py-1.5 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo .sql</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded bg-[var(--fondo)] border border-[var(--sep)] text-xs font-mono text-[var(--texto-sec)] overflow-x-auto max-h-96 leading-relaxed">
              {SCRIPT_SQL_USUARIOS_CLAVES}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: Matriz de Roles (RBAC) */}
      {activeTab === 'matriz' && (
        <div className="sisap-tarjeta">
          <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--sep-claro)]">
            Matriz de Facultades por Nivel Profesional
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                  <th className="py-2.5 px-3 font-semibold">Nivel / Rol</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Ve Identidad</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Reidentifica</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Captura Clínica</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Usa Modelo</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Admin Cuentas</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Capa Blindada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sep-claro)]">
                {Object.values(ROLES).map((r) => (
                  <tr key={r.key} className="hover:bg-[var(--captura)] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[var(--texto)]">{r.n}</div>
                      <div className="text-[10.5px] text-[var(--texto-tenue)]">{r.descripcion}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.ve_identidad ? <span className="est-ok">Sí</span> : <span className="est-pend">No</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.reidentifica ? <span className="est-warn">Auditado</span> : <span className="est-pend">No</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.escribe ? <span className="est-ok">Sí</span> : <span className="est-pend">No</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.usa_modelo ? <span className="est-ok">Sí</span> : <span className="est-pend">No</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.administra ? <span className="est-ok">Sí</span> : <span className="est-pend">No</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.capa_blindada ? <span className="est-risk">Raíz</span> : <span className="est-pend">No</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Crear Usuario Profesional (Modo Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] my-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sep)] mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[var(--accion)]" />
                <h3 className="text-base font-bold">Crear Nuevo Usuario Profesional</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                    Usuario del Sistema (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.u}
                    onChange={(e) => setNewUserForm({ ...newUserForm, u: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="ej. psicologo_mendoza"
                    className="sisap-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                    Rol / Nivel de Acceso *
                  </label>
                  <select
                    value={newUserForm.rol}
                    onChange={(e) => setNewUserForm({ ...newUserForm, rol: e.target.value as RoleKey })}
                    className="sisap-select font-medium"
                  >
                    {Object.values(ROLES).map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--texto-sec)] mb-1 font-semibold">
                  Nombre Completo del Profesional *
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.nombre}
                  onChange={(e) => setNewUserForm({ ...newUserForm, nombre: e.target.value })}
                  placeholder="ej. Dra. Claudia Morales Domínguez"
                  className="sisap-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Cédula Profesional</label>
                  <input
                    type="text"
                    value={newUserForm.cedula}
                    onChange={(e) => setNewUserForm({ ...newUserForm, cedula: e.target.value })}
                    placeholder="CED-1234567-PSI"
                    className="sisap-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--texto-sec)] mb-1">Correo Institucional</label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="c.morales@cenivra.org.mx"
                    className="sisap-input"
                  />
                </div>
              </div>

              {/* Password Generator Block */}
              <div className="p-3 rounded bg-[var(--campo)] border border-[var(--sep)] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[var(--texto)] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[var(--accion)]" />
                    <span>Contraseña Provisional y Derivación Criptográfica</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="sisap-btn-sec py-0.5 px-2 text-[10.5px] inline-flex items-center gap-1 text-[var(--accion)]"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generar Aleatoria</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newUserForm.password}
                    onChange={(e) => handlePasswordInputChange(e.target.value)}
                    placeholder="Contraseña del profesional..."
                    className="sisap-input font-mono"
                  />
                </div>

                <div className="text-[10.5px] font-mono text-[var(--texto-tenue)] space-y-1 pt-1">
                  <div>
                    Sal (16 bytes hex): <code className="text-[var(--accion)]">{computedSalt || 'Generando...'}</code>
                  </div>
                  <div className="truncate">
                    Hash (PBKDF2-HMAC-SHA256): <code className="text-[var(--normal)]">{isComputingHash ? 'Calculando 100,000 iteraciones...' : computedHash || '—'}</code>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 text-[11px] text-[var(--texto-sec)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUserForm.debe_cambiar_clave}
                    onChange={(e) => setNewUserForm({ ...newUserForm, debe_cambiar_clave: e.target.checked })}
                    className="rounded"
                  />
                  <span>Forzar cambio obligatorio de contraseña en el primer inicio de sesión</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--sep-claro)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="sisap-btn-sec"
                >
                  Cancelar
                </button>
                <button type="submit" className="sisap-btn">
                  Crear Cuenta y Asignar Credencial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reiniciar Contraseña */}
      {userToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)]">
            <div className="flex items-center gap-2 mb-3 text-[var(--advertencia)]">
              <RefreshCw className="w-5 h-5" />
              <h3 className="font-bold text-sm">Restablecer Contraseña</h3>
            </div>

            <p className="text-xs text-[var(--texto-sec)] mb-3 leading-relaxed">
              Está a punto de emitir una nueva contraseña provisional con nueva sal criptográfica para el usuario{' '}
              <b className="font-mono text-[var(--accion)]">{userToReset.u}</b> ({userToReset.nombre}).
            </p>

            <div className="p-3 rounded bg-[var(--campo)] border border-[var(--sep)] text-xs space-y-2 mb-4">
              <div>
                <span className="text-[var(--texto-tenue)] block text-[11px]">Nueva Contraseña Provisional:</span>
                <input
                  type="text"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="sisap-input font-mono font-bold mt-1"
                />
              </div>
              <div className="text-[10px] text-[var(--texto-tenue)] font-mono truncate">
                Nueva Sal: <code>{resetSalt}</code>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sep-claro)] text-xs">
              <button onClick={() => setUserToReset(null)} className="sisap-btn-sec">
                Cancelar
              </button>
              <button onClick={handleConfirmResetPassword} className="sisap-btn">
                Confirmar y Forzar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ver Detalles Criptográficos de Usuario */}
      {userToInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sep)] mb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[var(--accion)]" />
                <h3 className="font-bold text-sm">
                  Parámetros Criptográficos: {userToInspect.u}
                </h3>
              </div>
              <button
                onClick={() => setUserToInspect(null)}
                className="text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--sep)]">
                <span className="text-[var(--texto-tenue)]">Algoritmo de Derivación:</span>
                <span className="font-mono font-semibold">PBKDF2-HMAC-SHA256 (100,000 iteraciones)</span>
              </div>
              <div className="py-1 border-b border-[var(--sep)]">
                <span className="text-[var(--texto-tenue)] block mb-1">Sal Criptográfica (clave_sal):</span>
                <code className="font-mono text-[var(--accion)] p-1 bg-[var(--fondo)] rounded block break-all">
                  {userToInspect.clave_sal || 'a4b89c1024bd73e1'}
                </code>
              </div>
              <div className="py-1 border-b border-[var(--sep)]">
                <span className="text-[var(--texto-tenue)] block mb-1">Hash de la Clave (clave_hash):</span>
                <code className="font-mono text-[var(--normal)] p-1 bg-[var(--fondo)] rounded block break-all">
                  {userToInspect.clave_hash || '7b92f9821a719463b218408cb901e1495c2198031d279183491024bd73441a02'}
                </code>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--sep)]">
                <span className="text-[var(--texto-tenue)]">Debe cambiar clave en 1er ingreso:</span>
                <span className="font-mono">{userToInspect.debe_cambiar_clave ? 'SÍ (1)' : 'NO (0)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--sep)]">
                <span className="text-[var(--texto-tenue)]">Estado de la cuenta:</span>
                <span className="font-mono">{userToInspect.activo !== false ? 'ACTIVA (1)' : 'SUSPENDIDA (0)'}</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-semibold text-[var(--texto-sec)] block mb-1">
                Sentencia SQL INSERT para esta cuenta:
              </span>
              <pre className="p-2.5 bg-[var(--fondo)] border border-[var(--sep)] rounded text-[10.5px] font-mono text-[var(--texto-sec)] overflow-x-auto">
                {generateUserInsertSql({
                  usuario: userToInspect.u,
                  nombre_completo: userToInspect.nombre,
                  nivel: userToInspect.rol,
                  cedula_profesional: userToInspect.cedula,
                  email: userToInspect.email,
                  clave_hash: userToInspect.clave_hash || '7b92f9821a719463b218408cb901e1495c2198031d279183491024bd73441a02',
                  clave_sal: userToInspect.clave_sal || 'a4b89c1024bd73e1',
                  debe_cambiar_clave: !!userToInspect.debe_cambiar_clave,
                  activo: userToInspect.activo !== false,
                })}
              </pre>
            </div>

            <div className="flex justify-end pt-3 mt-3 border-t border-[var(--sep-claro)]">
              <button onClick={() => setUserToInspect(null)} className="sisap-btn-sec text-xs">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
