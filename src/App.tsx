
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import SearchPage from '@/pages/SearchPage';
import Dashboard from '@/pages/Dashboard';
//import AIAssistant from '@/pages/AIAssistant';
///import About from '@/pages/About';
import HSNMapping from '@/pages/HSNMapping';
//import PDFTools from '@/pages/PDFTools';
import ETLProcess from '@/pages/ETLProcess';
import LoginPage from '@/pages/LoginPage';
import ForgotPassword from '@/pages/ForgotPassword';
import CreateAccount from '@/pages/CreateAccount';
import { Menu, Workflow } from 'lucide-react';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const sessionStr = localStorage.getItem('LOGI_FLOW_SESSION');

  if (!sessionStr) return;

  try {
    const session = JSON.parse(sessionStr);

    if (Date.now() < session.expiresAt) {
      setIsAuthenticated(true);
    } else {
      // ❌ expired
      localStorage.removeItem('LOGI_FLOW_SESSION');
      localStorage.removeItem('LAST_ROUTE');
      setIsAuthenticated(false);
    }
  } catch {
    localStorage.removeItem('LOGI_FLOW_SESSION');
  }
  }, []);
useEffect(() => {
  const interval = setInterval(() => {
    const sessionStr = localStorage.getItem('LOGI_FLOW_SESSION');
    if (!sessionStr) return;

    const session = JSON.parse(sessionStr);

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('LOGI_FLOW_SESSION');
      localStorage.removeItem('LAST_ROUTE');
      window.location.href = '/login';
    }
  }, 30_000); // check every 30 sec

  return () => clearInterval(interval);
}, []);
    useEffect(() => {
    if (isAuthenticated && location.pathname !== '/login') {
      localStorage.setItem('LAST_ROUTE', location.pathname);
    }
  }, [location.pathname, isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  const lastRoute = localStorage.getItem('LAST_ROUTE') || '/search';
  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<LoginPage onLogin={handleLogin} />} /> */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={lastRoute} replace /> 
            : <LoginPage onLogin={handleLogin} />
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
                <Sidebar
                  isMobileOpen={isMobileOpen}
                  setIsMobileOpen={setIsMobileOpen}
                  isCollapsed={isSidebarCollapsed}
                  toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
                  <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:hidden flex-shrink-0 z-10 sticky top-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-400 rounded-lg flex items-center justify-center text-white shadow-sm">
                        <Workflow size={20} />
                      </div>
                      <div className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
                        LOGI FLOW
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileOpen(true)}
                      className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                      aria-label="Open sidebar"
                    >
                      <Menu size={24} />
                    </button>
                  </header>
                  <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full h-full pb-10">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/landed-cost" element={<HSNMapping />} />
                        {/* <Route path="/pdf-tools" element={<PDFTools />} /> */}
                        <Route path="/etl-process" element={<ETLProcess />} />
                        {/* <Route path="/ai-assistant" element={<AIAssistant />} /> */}
                        {/* <Route path="/guide" element={<About />} /> */}
                        <Route path="/*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </div>
                  </main>
                </div>
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
