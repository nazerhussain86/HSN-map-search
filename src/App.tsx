import React, { useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Sidebar from '@/components/Sidebar';
import SearchPage from '@/pages/SearchPage';
import HSNMapping from '@/pages/HSNMapping';
import ETLProcess from '@/pages/ETLProcess';
import AIAssistant from '@/pages/AIAssistant';
import LoginPage from '@/pages/LoginPage';
import ForgotPassword from '@/pages/ForgotPassword';
import CreateAccount from '@/pages/CreateAccount';
// import { Menu, Workflow } from 'lucide-react';

/* ---------- Track last route ---------- */
const RouteTracker = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (location.pathname !== '/login') {
      localStorage.setItem('LAST_ROUTE', location.pathname);
    }
  }, [location.pathname, isAuthenticated]);

  return null;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  /* ---------- Restore session ---------- */
  useEffect(() => {
    const sessionStr = localStorage.getItem('LOGI_FLOW_SESSION');

    if (!sessionStr) {
      setAuthChecked(true);
      return;
    }

    try {
      const session = JSON.parse(sessionStr);
      if (Date.now() < session.expiresAt) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('LOGI_FLOW_SESSION');
        localStorage.removeItem('LAST_ROUTE');
      }
    } catch {
      localStorage.removeItem('LOGI_FLOW_SESSION');
    } finally {
      setAuthChecked(true);
    }
  }, []);

  /* ---------- Session expiry watcher ---------- */
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionStr = localStorage.getItem('LOGI_FLOW_SESSION');
      if (!sessionStr) return;

      const session = JSON.parse(sessionStr);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem('LOGI_FLOW_SESSION');
        localStorage.removeItem('LAST_ROUTE');
        setIsAuthenticated(false);
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const lastRoute = localStorage.getItem('LAST_ROUTE') || '/search';

  return (
    <Router>
      <RouteTracker isAuthenticated={isAuthenticated} />

      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={lastRoute} replace />
              : <LoginPage onLogin={() => setIsAuthenticated(true)} />
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-account" element={<CreateAccount />} />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen w-full bg-slate-50">
                <Sidebar
                  isMobileOpen={isMobileOpen}
                  setIsMobileOpen={setIsMobileOpen}
                  isCollapsed={isSidebarCollapsed}
                  toggleCollapse={() =>
                    setIsSidebarCollapsed(!isSidebarCollapsed)
                  }
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                  <Routes>
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/landed-cost" element={<HSNMapping />} />
                    <Route path="/etl-process" element={<ETLProcess />} />
                    <Route path="/ai-assistant" element={<AIAssistant />} />
                    <Route path="/*" element={<Navigate to="/search" />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
