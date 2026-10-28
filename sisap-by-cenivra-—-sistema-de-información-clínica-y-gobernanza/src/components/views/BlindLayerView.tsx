import React, { useEffect } from 'react';
import { RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import { ShieldAlert, Lock, CheckCircle2, AlertTriangle, ShieldCheck, FileKey } from 'lucide-react';

interface BlindLayerViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
}

export const BlindLayerView: React.FC<BlindLayerViewProps> = ({ currentUser, roleConfig }) => {
  const isAuthorized = roleConfig.capa_blindada;

  useEffect(() => {
    if (!isAuthorized) {
      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Intento de acceso no autorizado a Capa Blindada',
        exp: '—',
        detalles: `Acceso bloqueado en capa de lógica por falta de privilegio capa_blindada.`,
      });
    }
  }, [isAuthorized, currentUser]);

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-[var(--panel)] border border-[var(--riesgo)]/40 rounded space-y-4 animate-in fade-in">
        <div className="flex items-center gap-3 text-[var(--riesgo)]">
          <ShieldAlert className="w-8 h-8" />
          <div>
            <h2 className="text-base font-bold">Capa Blindada del Modelo · Acceso Denegado</h2>
            <div className="text-xs text-[var(--texto-tenue)]">
              Módulo restringido estrictamente para el rol Superadministración
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
          Su perfil actual (<b>{roleConfig.n}</b>) no dispone de los privilegios criptográficos para acceder a los artefactos neuronales, pesos de capas latentes ni scripts de entrenamiento.
        </p>

        <div className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-[11px] text-[var(--texto-tenue)] font-mono">
          Este intento ha sido asentado de manera irrevocable en la Bitácora de Acceso con su identificador de usuario ({currentUser.u}), marca temporal y rol.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Capa Blindada del Modelo · Área de Superadministración
          </h2>
          <span className="est-ok font-mono text-[10px]">Autenticado: Nivel Raíz</span>
        </div>
        <div className="text-xs text-[var(--texto-tenue)]">
          Estructura interna de autoencoders, topología latente y análisis de protección de propiedad intelectual
        </div>
      </div>

      {/* Model Artifacts Locations */}
      <div className="sisap-captura">
        <h3 className="text-sm font-semibold mb-2">Inventario de Componentes Blindados</h3>
        <p className="text-xs text-[var(--texto-tenue)] mb-4">
          Artefactos de inferencia excluidos intencionalmente del repositorio público:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                <th className="py-2 px-3 font-semibold">Componente</th>
                <th className="py-2 px-3 font-semibold">Ruta / Resguardo</th>
                <th className="py-2 px-3 font-semibold">Estado en Producto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sep-claro)]">
              <tr>
                <td className="py-2.5 px-3 font-medium">Artefacto del Autoencoder</td>
                <td className="py-2.5 px-3 font-mono text-[var(--accion)]">_LOCAL_NO_VERSIONADO/modelo_autoencoder/encoder.h5</td>
                <td className="py-2.5 px-3"><span className="est-warn">Fuera de Git</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Orden de las 24 Columnas</td>
                <td className="py-2.5 px-3 font-mono text-[var(--accion)]">nombres_variables.txt</td>
                <td className="py-2.5 px-3"><span className="est-ok">Disponible en Frontend</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Parámetros de Normalización</td>
                <td className="py-2.5 px-3 font-mono text-[var(--accion)]">parametros_normalizacion.csv</td>
                <td className="py-2.5 px-3"><span className="est-risk">En auditoría (baremo)</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Mapeo de 12 Latentes a Dominios</td>
                <td className="py-2.5 px-3 font-mono text-[var(--accion)]">mapeo_dominios.rds</td>
                <td className="py-2.5 px-3"><span className="est-warn">No declarado en paper</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Code Protection Strategies Comparison */}
      <div className="sisap-tarjeta">
        <h3 className="text-sm font-semibold mb-2">
          Análisis de Protección de Código Fuente y Algoritmos
        </h3>
        <p className="text-xs text-[var(--texto-tenue)] mb-4 leading-relaxed">
          Evaluación técnica sobre cómo evitar la extracción no autorizada de la lógica del modelo si la aplicación se distribuye a centros externos:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                <th className="py-2 px-3 font-semibold">Técnica</th>
                <th className="py-2 px-3 font-semibold">Mecanismo de Resguardo</th>
                <th className="py-2 px-3 font-semibold">Nivel de Fortaleza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sep-claro)]">
              <tr>
                <td className="py-2.5 px-3 font-semibold">PyInstaller Simple</td>
                <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                  Empaqueta el intérprete con bytecode (.pyc). Se descompila en minutos con unpyc37.
                </td>
                <td className="py-2.5 px-3"><span className="est-risk">Débil</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Cython en Módulo del Modelo</td>
                <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                  Compila la matemática y la inferencia a código binario nativo (.pyd/.so en C/C++).
                </td>
                <td className="py-2.5 px-3"><span className="est-ok">Alta</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Nuitka Full-Program</td>
                <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                  Traduce todo el árbol de Python a C y crea un ejecutable independiente de un solo archivo.
                </td>
                <td className="py-2.5 px-3"><span className="est-ok">Alta</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Inferencia en Servidor Cloud</td>
                <td className="py-2.5 px-3 text-[var(--texto-sec)]">
                  El cliente solo envía el vector anónimo; el modelo reside y ejecuta en infraestructura privada CENIVRA.
                </td>
                <td className="py-2.5 px-3"><span className="est-ok">Infranqueable (Total)</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-[var(--texto-sec)]">
          <b>Conclusión de arquitectura:</b> Un software instalado localmente en el equipo de un tercero puede ser inspeccionado mediante ingeniería inversa con suficiente tiempo y memoria. La arquitectura más segura para CENIVRA a mediano plazo es mantener los pesos en un microservicio server-side privado, o compilar los módulos neurálgicos con Cython/Nuitka.
        </div>
      </div>
    </div>
  );
};
