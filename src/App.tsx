import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavBar } from './components/TopNavBar';
import { BottomNavBar } from './components/BottomNavBar';
import { Footer } from './components/Footer';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { TelemedicinePage } from './pages/TelemedicinePage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ApiDiagnosticsPage } from './pages/ApiDiagnosticsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProfileManagementModal } from './components/ProfileManagementModal';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { CheckCircle2 } from 'lucide-react';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';

const MainContent: React.FC = () => {
  const {
    currentPage,
    toastMessage,
    accessibility,
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isSqlSchemaModalOpen,
    setIsSqlSchemaModalOpen,
    updateUserProfile,
  } = useApp();

  const renderPage = () => {
    // CRITICAL SECURITY REQUIREMENT:
    // If the user is NOT authenticated, NEVER show any dashboard or application features.
    // The ONLY view accessible is the Login / Authentication screen.
    if (!currentUser) {
      switch (currentPage) {
        case 'patient-login':
          return <LoginPage initialMode="patient" />;
        case 'doctor-login':
          return <LoginPage initialMode="doctor" />;
        case 'admin-login':
          return <LoginPage initialMode="doctor" />;
        case 'login':
        default:
          return <LoginPage initialMode="role-select" />;
      }
    }

    // Role-specific routing for Authenticated Users
    switch (currentUser.role) {
      case 'patient': {
        switch (currentPage) {
          case 'ai-assistant':
            return <AIAssistantPage />;
          case 'facilities':
            return <FacilitiesPage />;
          case 'appointments':
            return <AppointmentsPage />;
          case 'my-appointments':
            return <MyAppointmentsPage />;
          case 'telemedicine':
            return <TelemedicinePage />;
          case 'emergency':
            return <EmergencyPage />;
          case 'patient-profile':
          case 'profile':
            return <PatientProfilePage />;
          case 'notifications':
            return <NotificationsPage />;
          case 'patient-dashboard':
          case 'records':
          default:
            return (
              <ProtectedRoute allowedRoles={['patient', 'admin']} portalName="Patient Portal">
                <PatientDashboardPage />
              </ProtectedRoute>
            );
        }
      }

      case 'doctor': {
        switch (currentPage) {
          case 'facilities':
            return <FacilitiesPage />;
          case 'telemedicine':
            return <TelemedicinePage />;
          case 'doctor-dashboard':
          default:
            return (
              <ProtectedRoute allowedRoles={['doctor', 'admin']} portalName="Doctor Clinical Portal">
                <DoctorDashboardPage />
              </ProtectedRoute>
            );
        }
      }

      case 'admin': {
        switch (currentPage) {
          case 'api-diagnostics':
            return <ApiDiagnosticsPage />;
          case 'admin-dashboard':
          default:
            return (
              <ProtectedRoute allowedRoles={['admin']} portalName="Public Health Administration">
                <AdminDashboardPage />
              </ProtectedRoute>
            );
        }
      }

      default:
        return <LoginPage initialMode="role-select" />;
    }
  };

  if (!currentUser) {
    return (
      <div
        id="gramaarogya-root-app"
        className={`min-h-screen flex flex-col transition-colors duration-200 ${
          accessibility.highContrast
            ? 'bg-black text-white'
            : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
        } ${
          accessibility.fontSize === 'large'
            ? 'text-lg'
            : accessibility.fontSize === 'xlarge'
            ? 'text-xl'
            : 'text-sm'
        }`}
      >
        <LoginPage
          initialMode={
            currentPage === 'doctor-login'
              ? 'doctor'
              : 'patient'
          }
        />

        {/* Floating Global Toast Notification */}
        {toastMessage && (
          <div
            id="global-toast-notification"
            className="fixed bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="gramaarogya-root-app"
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        accessibility.highContrast
          ? 'bg-black text-white'
          : 'bg-[#F8FAF9] dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      } ${
        accessibility.fontSize === 'large'
          ? 'text-lg'
          : accessibility.fontSize === 'xlarge'
          ? 'text-xl'
          : 'text-sm'
      }`}
    >
      {/* 1. Desktop Top Navigation Bar (Shows active role and verified services) */}
      <TopNavBar />

      {/* 2. Main Page Content Body (Role-Protected Dashboard & Features) */}
      <main className="flex-1 pb-20 lg:pb-6">{renderPage()}</main>

      {/* 3. Government Footer */}
      <Footer />

      {/* 4. Mobile Bottom Navigation Bar */}
      <BottomNavBar />

      {/* 5. Modals for Profile Management & SQL Architecture */}
      <ProfileManagementModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onSave={updateUserProfile}
      />

      <SqlSchemaModal
        isOpen={isSqlSchemaModalOpen}
        onClose={() => setIsSqlSchemaModalOpen(false)}
      />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div
          id="global-toast-notification"
          className="fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs font-bold"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
