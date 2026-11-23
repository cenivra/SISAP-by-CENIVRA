import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { ClinicalDraft, PatientClinico, UserAccount } from './types/clinical';
import { INITIAL_USERS, ROLES } from './constants/clinicalConstants';
import { StorageService } from './services/storageService';
import { initAuth } from './services/googleDriveService';

// Layout Components
import { Header } from './components/Header';
import { Sidebar, NavScreen } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { TelemetryModal, TelemetryOptInBanner } from './components/TelemetryModal';
import { TelemetryService, installGlobalErrorMonitoring } from './services/telemetryService';

// Views
import { WorkDashboardView } from './components/views/WorkDashboardView';
import { PatientsView } from './components/views/PatientsView';
import { ExploratoryInterviewView } from './components/views/ExploratoryInterviewView';
import { InitialEvaluationView } from './components/views/InitialEvaluationView';
import { FollowUpScalesView } from './components/views/FollowUpScalesView';
import { PsychometricCenterView } from './components/views/PsychometricCenterView';
import { PsychologicalEvolutionView } from './components/views/PsychologicalEvolutionView';
import { FamilySessionView } from './components/views/FamilySessionView';
import { WeeklyNarrativeView } from './components/views/WeeklyNarrativeView';
import { AutoencoderSimulatorView } from './components/views/AutoencoderSimulatorView';
import { AnalysisModelView } from './components/views/AnalysisModelView';
import { IntelligenceEcosystemView } from './components/views/IntelligenceEcosystemView';
import { TraceabilityView } from './components/views/TraceabilityView';
import { BlindLayerView } from './components/views/BlindLayerView';
import { UsersManagementView } from './components/views/UsersManagementView';
import { SqlSchemaView } from './components/views/SqlSchemaView';
import { CybersecurityView } from './components/views/CybersecurityView';

export default function App() {
  // Session & Authentication
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USERS[3]); // Default: Mtra. Sofía Carrillo (psicologo)
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);

  // App Navigation & Selected Patient
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('inicio');
  const [selectedPseudonym, setSelectedPseudonym] = useState<string>('TUS-0007');

  // Governance & Visual Modes
  const [isAnonymousMode, setIsAnonymousMode] = useState<boolean>(false);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  // Drafts & Restoration
  const [draftsCount, setDraftsCount] = useState<number>(StorageService.getDrafts().length);
  const [activeDraftData, setActiveDraftData] = useState<Record<string, string> | undefined>(undefined);

  // Modals & Telemetry Opt-in
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [showTelemetryBanner, setShowTelemetryBanner] = useState<boolean>(!TelemetryService.hasUserDecided());
  const [isTelemetryEnabled, setIsTelemetryEnabled] = useState<boolean>(TelemetryService.isTelemetryEnabled());

  // Initialize theme and Google Auth listener
  useEffect(() => {
    // Theme
    try {
      const savedTheme = localStorage.getItem('sisap_v1_tema');
      if (savedTheme === 'claro') {
        setIsLightMode(true);
        document.body.classList.add('claro');
      } else {
        setIsLightMode(false);
        document.body.classList.remove('claro');
      }
    } catch {}

    const uninstallMonitoring = installGlobalErrorMonitoring();

    // Google Auth listener
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );

    return () => {
      uninstallMonitoring();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Inactivity Auto-Lock (NOM-024-SSA3-2012 / Ciberseguridad)
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: any;
    const secConfig = StorageService.getSecurityConfig();
    const timeoutMs = (secConfig.inactivityTimeoutMinutes || 15) * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        StorageService.logAction({
          usuario: currentUser.u,
          rol: currentUser.rol,
          accion: 'Cierre de sesión automático por inactividad',
          exp: '—',
          detalles: `Terminal bloqueada tras ${secConfig.inactivityTimeoutMinutes} minutos de inactividad conforme a NOM-024.`,
        });
        setCurrentUser(null);
      }, timeoutMs);
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [currentUser]);

  const handleToggleTheme = () => {
    const next = !isLightMode;
    setIsLightMode(next);
    if (next) {
      document.body.classList.add('claro');
      try {
        localStorage.setItem('sisap_v1_tema', 'claro');
      } catch {}
    } else {
      document.body.classList.remove('claro');
      try {
        localStorage.setItem('sisap_v1_tema', 'oscuro');
      } catch {}
    }
  };

  const handleToggleAnonymous = () => {
    setIsAnonymousMode((prev) => !prev);
  };

  const reloadDraftsCount = () => {
    setDraftsCount(StorageService.getDrafts().length);
  };

  const handleResumeDraft = (draft: ClinicalDraft) => {
    setSelectedPseudonym(draft.paciente.replace(' (anónimo)', ''));
    setActiveDraftData(draft.datos);

    // Map screen ID to NavScreen
    let targetScreen: NavScreen = 'inicio';
    if (draft.screen.startsWith('ent')) targetScreen = 'entrevista';
    else if (draft.screen.startsWith('ei') || draft.screen.startsWith('eval')) targetScreen = 'eval_inicial';
    else if (draft.screen.startsWith('seg')) targetScreen = 'seguimiento';
    else if (draft.screen.startsWith('ev')) targetScreen = 'evolucion';
    else if (draft.screen.startsWith('fa')) targetScreen = 'familiar';
    else if (draft.screen.startsWith('nar')) targetScreen = 'narracion';
    else targetScreen = draft.screen as NavScreen;

    setCurrentScreen(targetScreen);
  };

  const handleLogout = () => {
    if (currentUser) {
      StorageService.logAction({
        usuario: currentUser.u,
        rol: currentUser.rol,
        accion: 'Cierre de sesión',
        exp: '—',
      });
    }
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <LoginModal
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          StorageService.logAction({
            usuario: user.u,
            rol: user.rol,
            accion: 'Inicio de sesión con éxito',
            exp: '—',
            detalles: `Ingreso con nivel ${ROLES[user.rol]?.n}.`,
          });
          setCurrentScreen('inicio');
        }}
      />
    );
  }

  const roleConfig = ROLES[currentUser.rol];
  const patients = StorageService.getPatients();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--fondo)] text-[var(--texto)]">
      {/* Telemetry Legal Opt-In Banner (INAI / LFPDPPP) */}
      {showTelemetryBanner && (
        <TelemetryOptInBanner
          onDecided={(accepted) => {
            TelemetryService.markDecided(accepted);
            setIsTelemetryEnabled(accepted);
            setShowTelemetryBanner(false);
          }}
        />
      )}

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        draftsCount={draftsCount}
        isAnonymousMode={isAnonymousMode}
        onToggleAnonymous={handleToggleAnonymous}
        isLightMode={isLightMode}
        onToggleTheme={handleToggleTheme}
        onOpenDrafts={() => setCurrentScreen('inicio')}
        onOpenDriveModal={() => setShowDriveModal(true)}
        onOpenTelemetryModal={() => setShowTelemetryModal(true)}
        isTelemetryEnabled={isTelemetryEnabled}
        googleUser={googleUser}
        onLogout={handleLogout}
      />

      {/* Main Body with Sidebar and Content View */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            setCurrentScreen(screen);
            setActiveDraftData(undefined);
            TelemetryService.trackEvent({
              event_type: 'navigation',
              action: `view_loaded:${screen}`,
              user_role: currentUser.rol,
            });
            if (screen === 'drive') {
              setShowDriveModal(true);
            }
          }}
          roleConfig={roleConfig}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentScreen === 'inicio' && (
            <WorkDashboardView
              currentUser={currentUser}
              patients={patients}
              isAnonymousMode={isAnonymousMode}
              onNavigate={(screen, pat) => {
                if (pat) setSelectedPseudonym(pat);
                setCurrentScreen(screen);
              }}
              onResumeDraft={handleResumeDraft}
              onOpenDriveModal={() => setShowDriveModal(true)}
              onSelectPatient={setSelectedPseudonym}
            />
          )}

          {currentScreen === 'pacientes' && (
            <PatientsView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              onSelectPseudonym={setSelectedPseudonym}
              isAnonymousMode={isAnonymousMode}
              onToggleAnonymous={handleToggleAnonymous}
              onOpenDriveModal={() => setShowDriveModal(true)}
            />
          )}

          {currentScreen === 'entrevista' && (
            <ExploratoryInterviewView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              initialData={activeDraftData}
              onDraftSaved={reloadDraftsCount}
            />
          )}

          {currentScreen === 'centro_psicometrico' && (
            <PsychometricCenterView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              onSelectPseudonym={setSelectedPseudonym}
              isAnonymousMode={isAnonymousMode}
              onNavigate={(screen, pat) => {
                if (pat) setSelectedPseudonym(pat);
                setCurrentScreen(screen);
              }}
            />
          )}

          {currentScreen === 'eval_inicial' && (
            <InitialEvaluationView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              initialData={activeDraftData}
              onDraftSaved={reloadDraftsCount}
              onOpenPsychometricCenter={() => setCurrentScreen('centro_psicometrico')}
            />
          )}

          {currentScreen === 'seguimiento' && (
            <FollowUpScalesView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              initialData={activeDraftData}
              onDraftSaved={reloadDraftsCount}
              onOpenPsychometricCenter={() => setCurrentScreen('centro_psicometrico')}
            />
          )}

          {currentScreen === 'evolucion' && (
            <PsychologicalEvolutionView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              initialData={activeDraftData}
              onDraftSaved={reloadDraftsCount}
            />
          )}

          {currentScreen === 'familiar' && (
            <FamilySessionView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              initialData={activeDraftData}
              onDraftSaved={reloadDraftsCount}
            />
          )}

          {currentScreen === 'narracion' && (
            <WeeklyNarrativeView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
              initialData={activeDraftData}
              onDraftSaved={reloadDraftsCount}
            />
          )}

          {currentScreen === 'ecosistema' && (
            <IntelligenceEcosystemView
              currentUser={currentUser}
              roleConfig={roleConfig}
              selectedPseudonym={selectedPseudonym}
            />
          )}

          {currentScreen === 'simulador' && <AutoencoderSimulatorView />}

          {currentScreen === 'analisis' && (
            <AnalysisModelView currentUser={currentUser} roleConfig={roleConfig} />
          )}

          {currentScreen === 'trazabilidad' && (
            <TraceabilityView
              currentUser={currentUser}
              roleConfig={roleConfig}
              onOpenDriveModal={() => setShowDriveModal(true)}
            />
          )}

          {currentScreen === 'ciberseguridad' && (
            <CybersecurityView currentUser={currentUser} roleConfig={roleConfig} />
          )}

          {currentScreen === 'blindado' && (
            <BlindLayerView currentUser={currentUser} roleConfig={roleConfig} />
          )}

          {currentScreen === 'usuarios' && (
            <UsersManagementView currentUser={currentUser} roleConfig={roleConfig} />
          )}

          {currentScreen === 'sql' && <SqlSchemaView />}
        </main>
      </div>

      {/* Footer */}
      <Footer currentUser={currentUser} googleUser={googleUser} />

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        currentUser={currentUser}
        googleUser={googleUser}
        onAuthChanged={setGoogleUser}
        selectedPseudonym={selectedPseudonym}
      />

      {/* Telemetry Governance & Privacy Modal */}
      <TelemetryModal
        isOpen={showTelemetryModal}
        onClose={() => {
          setShowTelemetryModal(false);
          setIsTelemetryEnabled(TelemetryService.isTelemetryEnabled());
        }}
        currentUserRole={currentUser?.rol}
      />
    </div>
  );
}
