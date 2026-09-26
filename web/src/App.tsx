import React, { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { BackgroundBackdrop } from './components/BackgroundBackdrop';
import { PageLoader } from './components/PageLoader';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded Pages for Route Code-Splitting
const Home = React.lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const About = React.lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Features = React.lazy(() => import('./pages/Features').then((m) => ({ default: m.Features })));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks').then((m) => ({ default: m.HowItWorks })));
const Feedback = React.lazy(() => import('./pages/Feedback').then((m) => ({ default: m.Feedback })));
const Login = React.lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const MonitoringMapPage = React.lazy(() => import('./pages/MonitoringMapPage').then((m) => ({ default: m.MonitoringMapPage })));
const InstitutesList = React.lazy(() => import('./pages/InstitutesList').then((m) => ({ default: m.InstitutesList })));
const InstituteProfile = React.lazy(() => import('./pages/InstituteProfile').then((m) => ({ default: m.InstituteProfile })));
const InspectionsList = React.lazy(() => import('./pages/InspectionsList').then((m) => ({ default: m.InspectionsList })));
const OfficialReview = React.lazy(() => import('./pages/OfficialReview').then((m) => ({ default: m.OfficialReview })));
const CorrectiveActionsPage = React.lazy(() => import('./pages/CorrectiveActionsPage').then((m) => ({ default: m.CorrectiveActionsPage })));
const CCTVPage = React.lazy(() => import('./pages/CCTVPage').then((m) => ({ default: m.CCTVPage })));
const AlertsPage = React.lazy(() => import('./pages/AlertsPage').then((m) => ({ default: m.AlertsPage })));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const BeneficiaryReportsPage = React.lazy(() => import('./pages/BeneficiaryReportsPage').then((m) => ({ default: m.BeneficiaryReportsPage })));
const InspectorWorkspace = React.lazy(() => import('./pages/InspectorWorkspace').then((m) => ({ default: m.InspectorWorkspace })));
const InstituteWorkspace = React.lazy(() => import('./pages/InstituteWorkspace').then((m) => ({ default: m.InstituteWorkspace })));

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <PageLoader message="Authenticating session credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 relative w-full">
      <BackgroundBackdrop />
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <div className="flex-1 flex w-full px-3 sm:px-5 lg:px-6 py-4 gap-5 min-h-0">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 min-w-0 pb-6 space-y-6">
            <Suspense fallback={<PageLoader message="Loading workspace module..." />}>
              {children}
            </Suspense>
            <div className="pt-6">
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 relative w-full">
      <BackgroundBackdrop />
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full">
          <Suspense fallback={<PageLoader message="Loading page assets..." />}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
              <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
              <Route path="/map" element={<PublicLayout><MonitoringMapPage /></PublicLayout>} />
              <Route path="/feedback" element={<PublicLayout><Feedback /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

              {/* Protected Workspace Routes */}
              <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/institutes" element={<ProtectedLayout><InstitutesList /></ProtectedLayout>} />
              <Route path="/institutes/:id" element={<ProtectedLayout><InstituteProfile /></ProtectedLayout>} />
              <Route path="/inspections" element={<ProtectedLayout><InspectionsList /></ProtectedLayout>} />
              <Route path="/official/inspections/:id" element={<ProtectedLayout><OfficialReview /></ProtectedLayout>} />
              <Route path="/corrective-actions" element={<ProtectedLayout><CorrectiveActionsPage /></ProtectedLayout>} />
              <Route path="/cctv" element={<ProtectedLayout><CCTVPage /></ProtectedLayout>} />
              <Route path="/alerts" element={<ProtectedLayout><AlertsPage /></ProtectedLayout>} />
              <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
              <Route path="/beneficiary-reports" element={<ProtectedLayout><BeneficiaryReportsPage /></ProtectedLayout>} />
              <Route path="/audit-logs" element={<Navigate to="/beneficiary-reports" replace />} />

              {/* Field Inspector Routes */}
              <Route path="/inspector/inspections" element={<ProtectedLayout><InspectorWorkspace /></ProtectedLayout>} />
              <Route path="/inspector/inspections/:id" element={<ProtectedLayout><InspectorWorkspace /></ProtectedLayout>} />
              <Route path="/inspector/history" element={<ProtectedLayout><InspectionsList /></ProtectedLayout>} />
              <Route path="/workspace/field-inspector" element={<Navigate to="/inspector/inspections" replace />} />
              <Route path="/workspace/inspector" element={<Navigate to="/inspector/inspections" replace />} />

              {/* Institute Representative Routes */}
              <Route path="/institute/attendance" element={<ProtectedLayout><InstituteWorkspace /></ProtectedLayout>} />
              <Route path="/institute/corrective-actions" element={<ProtectedLayout><InstituteWorkspace /></ProtectedLayout>} />
              <Route path="/workspace/institute" element={<Navigate to="/institute/attendance" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
