import React from 'react';
import { Search, BarChart3, MessageSquare, BookOpen, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'search', label: 'HSN Search', icon: Search },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'guide', label: 'About Guide', icon: BookOpen },
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
          fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:block
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl tracking-tight">HSN Nav</span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors duration-150
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={20} className={`mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-slate-950">
          <div className="flex items-center space-x-3">
            <img 
              src="https://picsum.photos/100/100" 
              alt="GOI Logo" 
              className="w-10 h-10 rounded-full border-2 border-slate-700"
            />
            <div>
              <p className="text-sm font-medium text-white">Govt of India</p>
              <p className="text-xs text-slate-400">DPIIT Initiative</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
