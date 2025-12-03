import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SearchPage from './pages/SearchPage';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import About from './pages/About';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'guide':
        return <About />;
      default:
        return <SearchPage />;
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:hidden justify-between flex-shrink-0 z-10">
            <div className="flex items-center font-bold text-slate-900 text-lg">
              HSN Navigator
            </div>
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;