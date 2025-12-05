import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SearchPage from '../SearchPage';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import About from './pages/About';
import LandedCostCalculator from './pages/LandedCostCalculator';
//import PDFTools from './pages/PDFTools';
import ETLProcess from './pages/ETLProcess';
import { Menu, Workflow } from 'lucide-react';

const App: React.FC = () => {
  // State to manage the active view (simulating routing)
  const [activeTab, setActiveTab] = useState('search');
  
  // State to manage mobile sidebar visibility
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Function to render the correct page component based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'landed-cost':
        return <LandedCostCalculator />;
      //case 'pdf-tools':
        //return <PDFTools />;
      case 'etl-process':
        return <ETLProcess />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'guide':
        return <About />;
      default:
        return <SearchPage />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Mobile Header (Visible only on small screens) */}
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

        {/* Scrollable Page Content */}
        <main className={`flex-1 overflow-y-auto ${activeTab === 'etl-process' ? 'p-0' : 'p-4 lg:p-8'} scroll-smooth`}>
          <div className={`max-w-7xl mx-auto w-full h-full ${activeTab === 'etl-process' ? '' : 'pb-10'}`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;