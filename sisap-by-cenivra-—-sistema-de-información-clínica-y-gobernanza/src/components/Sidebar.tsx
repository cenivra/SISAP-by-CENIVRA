import React from 'react';
import { RoleConfig } from '../types/clinical';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Activity,
  CalendarCheck2,
  FileSignature,
  HeartHandshake,
  BookOpen,
  Cpu,
  History,
  Cloud,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Database,
  Layers,
} from 'lucide-react';

export type NavScreen =
  | 'inicio'
  | 'pacientes'
  | 'entrevista'
  | 'eval_inicial'
  | 'seguimiento'
  | 'evolucion'
  | 'familiar'
  | 'narracion'
  | 'simulador'
  | 'analisis'
  | 'trazabilidad'
  | 'drive'
  | 'ciberseguridad'
  | 'blindado'
  | 'usuarios'
  | 'sql';

interface NavItem {
  id: NavScreen;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: 'ok' | 'warn' | 'risk' | 'pend';
  requiresAdmin?: boolean;
  requiresBlindLayer?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  roleConfig: RoleConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, roleConfig }) => {
  const groups: NavGroup[] = [
    {
      title: 'TRABAJO CLÍNICO',
      items: [
        {
          id: 'inicio',
          label: 'Central de trabajo',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'pacientes',
          label: 'Padrón y Pacientes',
          icon: <Users className="w-4 h-4" />,
          badge: 'Gobernanza',
        },
      ],
    },
    {
      title: 'CAPTURA CLÍNICA',
      items: [
        {
          id: 'entrevista',
          label: 'Entrevista exploratoria',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          badge: '14 módulos',
        },
        {
          id: 'eval_inicial',
          label: 'Evaluación inicial',
          icon: <Activity className="w-4 h-4" />,
          badge: '6 escalas',
          badgeColor: 'ok',
        },
        {
          id: 'seguimiento',
          label: 'Seguimiento quincenal',
          icon: <CalendarCheck2 className="w-4 h-4" />,
        },
        {
          id: 'evolucion',
          label: 'Nota de evolución',
          icon: <FileSignature className="w-4 h-4" />,
        },
        {
          id: 'familiar',
          label: 'Nota de sesión familiar',
          icon: <HeartHandshake className="w-4 h-4" />,
        },
        {
          id: 'narracion',
          label: 'Narración semanal V1.0',
          icon: <BookOpen className="w-4 h-4" />,
          badge: '8 preg.',
        },
      ],
    },
    {
      title: 'ANÁLISIS Y MODELOS',
      items: [
        {
          id: 'simulador',
          label: 'Simulador Autoencoder',
          icon: <Cpu className="w-4 h-4" />,
          badge: 'Sintético',
          badgeColor: 'warn',
        },
        {
          id: 'analisis',
          label: 'Arquitectura y Pesos',
          icon: <Layers className="w-4 h-4" />,
          badge: 'Teórico',
        },
        {
          id: 'trazabilidad',
          label: 'Trazabilidad y Bitácora',
          icon: <History className="w-4 h-4" />,
          badge: 'Audit',
        },
        {
          id: 'drive',
          label: 'Google Drive Sync',
          icon: <Cloud className="w-4 h-4" />,
          badge: 'Cloud',
          badgeColor: 'ok',
        },
      ],
    },
    {
      title: 'CIBERSEGURIDAD Y NORMATIVA',
      items: [
        {
          id: 'ciberseguridad',
          label: 'Ciberseguridad y NOMs',
          icon: <ShieldCheck className="w-4 h-4 text-[var(--normal)]" />,
          badge: 'NOM-024',
          badgeColor: 'ok',
        },
        {
          id: 'blindado',
          label: 'Capa blindada modelo',
          icon: <ShieldAlert className="w-4 h-4 text-[var(--riesgo)]" />,
          badge: 'Superadmin',
          badgeColor: 'warn',
          requiresBlindLayer: true,
        },
      ],
    },
    {
      title: 'ADMINISTRACIÓN Y GOBERNANZA',
      items: [
        {
          id: 'usuarios',
          label: 'Modo Admin · Usuarios',
          icon: <UserCheck className="w-4 h-4" />,
          badge: 'PBKDF2',
          badgeColor: 'ok',
        },
        {
          id: 'sql',
          label: 'Esquemas y Scripts SQL',
          icon: <Database className="w-4 h-4" />,
          badge: 'DDL',
        },
      ],
    },
  ];

  return (
    <aside className="w-58 shrink-0 bg-[var(--panel)] border-r border-[var(--sep-claro)] flex flex-col h-full overflow-y-auto">
      <nav className="p-2 space-y-4">
        {groups.map((group, gIdx) => {
          // Filter items based on role
          const visibleItems = group.items.filter((item) => {
            if (item.requiresBlindLayer && !roleConfig.capa_blindada) {
              return false;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-[var(--texto-tenue)] uppercase">
                {group.title}
              </div>
              {visibleItems.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-[var(--r)] text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--captura)] text-[var(--texto)] font-medium border-l-3 border-[var(--accion)]'
                        : 'text-[var(--texto-sec)] hover:bg-[var(--captura)] hover:text-[var(--texto)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={isActive ? 'text-[var(--accion)]' : 'text-[var(--texto-tenue)]'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border ${
                          item.badgeColor === 'ok'
                            ? 'text-[var(--normal)] border-[var(--normal)]/40 bg-[var(--normal)]/10'
                            : item.badgeColor === 'risk'
                            ? 'text-[var(--riesgo)] border-[var(--riesgo)]/40 bg-[var(--riesgo)]/10'
                            : item.badgeColor === 'warn'
                            ? 'text-[var(--advertencia)] border-[var(--advertencia)]/40 bg-[var(--advertencia)]/10'
                            : 'text-[var(--texto-tenue)] border-[var(--borde)]/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
