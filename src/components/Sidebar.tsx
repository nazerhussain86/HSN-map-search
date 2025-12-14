import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {    X, Calculator,  Workflow, Database, ChevronLeft, ChevronRight, Search,MessageSquare } from 'lucide-react';
//BarChart3, MessageSquare, BookOpen , FileText
interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const menuItems = [
    // { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'search', path: '/search', label: 'HSN Search', icon: Search },
    { id: 'landed-cost', path: '/landed-cost', label: 'Landed Cost', icon: Calculator },
    { id: 'etl-process', path: '/etl-process', label: 'ETL Process', icon: Database },
    // { id: 'pdf-tools', path: '/pdf-tools', label: 'PDF Tools', icon: FileText },
    { id: 'ai-assistant', path: '/ai-assistant', label: 'AI Assistant', icon: MessageSquare },
    // { id: 'guide', path: '/guide', label: 'About Guide', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full bg-slate-900 text-white transition-all duration-300 ease-in-out
          lg:static lg:block flex-shrink-0 flex flex-col
          ${isMobileOpen ? 'translate-x-0 w-80 sm:w-64 max-w-[80%]' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        <div className={`flex items-center h-16 px-4 bg-slate-950 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Workflow size={20} />
            </div>
            {/* Logo Text */}
            <span className={`font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              LOGI FLOW
            </span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 transition-opacity duration-200">Menu</p>}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center p-3 text-sm font-medium rounded-lg transition-colors duration-150
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'} ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex justify-end px-4 py-2">
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
