import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import FileManagerPage from './pages/FileManagerPage';
import CodeEditorPage from './pages/CodeEditorPage';
import DatabasesPage from './pages/DatabasesPage';
import DomainsPage from './pages/DomainsPage';
import TerminalPage from './pages/TerminalPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading DeployX Workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Workspace Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <DashboardPage/>
                </ProtectedLayout>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedLayout>
                  <ProjectsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/file-manager"
              element={
                <ProtectedLayout>
                  <FileManagerPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/code-editor"
              element={
                <ProtectedLayout>
                  <CodeEditorPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/databases"
              element={
                <ProtectedLayout>
                  <DatabasesPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/domains"
              element={
                <ProtectedLayout>
                  <DomainsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/terminal"
              element={
                <ProtectedLayout>
                  <TerminalPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedLayout>
                  <SettingsPage />
                </ProtectedLayout>
              }
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
