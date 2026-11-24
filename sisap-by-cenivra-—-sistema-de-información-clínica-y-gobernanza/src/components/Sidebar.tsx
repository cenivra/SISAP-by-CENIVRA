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
  BrainCircuit,
  ClipboardCheck,
  Scale,
} from 'lucide-react';

export type NavScreen =
  | 'inicio'
  | 'centro_psicometrico'
  | 'ecosistema'
  | 'apoyo_decisiones'
  | 'pacientes'
  | 'entrevista'
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
  requiresAdmin?: boolean;
  requiresBlindLayer?: boolean;
  requiresDrive?: boolean;
}

interface NavGroup {
  title: string;
  requiresAdminGroup?: boolean;
  items: NavItem[];
}

interface SidebarProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  roleConfig: RoleConfig;
}

export const SCREEN_LABELS: Record<NavScreen, string> = {
  inicio: 'Central de trabajo',
  pacientes: 'Padrón y expedientes',
  entrevista: 'Entrevista exploratoria',
  centro_psicometrico: 'Centro psicométrico',
  seguimiento: 'Seguimiento longitudinal',
  evolucion: 'Nota de evolución',
  familiar: 'Nota de sesión familiar',
  narracion: 'Narrativa semanal',
  ecosistema: 'Inteligencia funcional',
  apoyo_decisiones: 'Apoyo a decisiones',
  analisis: 'Gestión de modelos',
  simulador: 'Arquitectura y artefactos',
  trazabilidad: 'Auditoría',
  usuarios: 'Usuarios y permisos',
  ciberseguridad: 'Configuración y seguridad',
  drive: 'Almacenamiento en Drive',
  sql: 'Mantenimiento SQL',
  blindado: 'Capa blindada modelo',
};

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, roleConfig }) => {
  const groups: NavGroup[] = [
    {
      title: 'A. TRABAJO CLÍNICO',
      items: [
        {
          id: 'inicio',
          label: 'Central de trabajo',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'pacientes',
          label: 'Padrón y expedientes',
          icon: <Users className="w-4 h-4" />,
        },
        {
          id: 'entrevista',
          label: 'Entrevista exploratoria',
          icon: <FileSpreadsheet className="w-4 h-4" />,
        },
        {
          id: 'centro_psicometrico',
          label: 'Centro psicométrico',
          icon: <ClipboardCheck className="w-4 h-4" />,
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
          label: 'Narrativa semanal',
          icon: <BookOpen className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'B. SEGUIMIENTO Y ANÁLISIS',
      items: [
        {
          id: 'seguimiento',
          label: 'Seguimiento longitudinal',
          icon: <CalendarCheck2 className="w-4 h-4" />,
        },
        {
          id: 'ecosistema',
          label: 'Inteligencia funcional',
          icon: <BrainCircuit className="w-4 h-4" />,
        },
        {
          id: 'apoyo_decisiones',
          label: 'Apoyo a decisiones',
          icon: <Scale className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'C. ADMINISTRACIÓN Y GOBERNANZA',
      requiresAdminGroup: true,
      items: [
        {
          id: 'analisis',
          label: 'Gestión de modelos',
          icon: <Layers className="w-4 h-4" />,
          requiresAdmin: true,
        },
        {
          id: 'simulador',
          label: 'Arquitectura y artefactos',
          icon: <Cpu className="w-4 h-4" />,
          requiresAdmin: true,
        },
        {
          id: 'trazabilidad',
          label: 'Auditoría',
          icon: <History className="w-4 h-4" />,
          requiresAdmin: true,
        },
        {
          id: 'usuarios',
          label: 'Usuarios y permisos',
          icon: <UserCheck className="w-4 h-4" />,
          requiresAdmin: true,
        },
        {
          id: 'ciberseguridad',
          label: 'Configuración y seguridad',
          icon: <ShieldCheck className="w-4 h-4" />,
          requiresAdmin: true,
        },
        {
          id: 'drive',
          label: 'Almacenamiento en Drive',
          icon: <Cloud className="w-4 h-4" />,
          requiresAdmin: true,
          requiresDrive: true,
        },
        {
          id: 'sql',
          label: 'Mantenimiento SQL',
          icon: <Database className="w-4 h-4" />,
          requiresAdmin: true,
        },
        {
          id: 'blindado',
          label: 'Capa blindada modelo',
          icon: <ShieldAlert className="w-4 h-4 text-[var(--riesgo)]" />,
          requiresBlindLayer: true,
        },
      ],
    },
  ];

  return (
    <aside className="w-58 shrink-0 bg-[var(--panel)] border-r border-[var(--sep)] flex flex-col h-full overflow-y-auto select-none">
      <nav className="p-2.5 space-y-5">
        {groups.map((group, gIdx) => {
          if (group.requiresAdminGroup && !roleConfig.administra && !roleConfig.capa_blindada) {
            return null;
          }

          const visibleItems = group.items.filter((item) => {
            if (item.requiresAdmin && !roleConfig.administra) return false;
            if (item.requiresBlindLayer && !roleConfig.capa_blindada) return false;
            if (item.requiresDrive && !roleConfig.exportar_drive) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-0.5">
              <div className="px-2.5 pb-1 text-[10.5px] font-semibold tracking-wider text-[var(--texto-tenue)] uppercase">
                {group.title}
              </div>
              {visibleItems.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] rounded-[var(--r)] text-left transition-colors cursor-pointer border-l-2 ${
                      isActive
                        ? 'bg-[var(--captura)] text-[var(--texto)] font-semibold border-[var(--accion)]'
                        : 'border-transparent text-[var(--texto-sec)] hover:bg-[var(--panel-elev)] hover:text-[var(--texto)]'
                    }`}
                  >
                    <span className={isActive ? 'text-[var(--accion)] shrink-0' : 'text-[var(--texto-tenue)] shrink-0'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
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
