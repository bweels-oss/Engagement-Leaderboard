import React from 'react';
import { LayoutDashboard, Settings, FileSpreadsheet } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  return (
    <div className="min-h-screen flex flex-col bg-api-bg">
      {/* Header */}
      <header className="bg-api-accent text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Simple logo block */}
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-api-blue font-bold text-xl">
              A
            </div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              Engagement Challenge <span className="opacity-80 font-normal">Leaderboard</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <button 
              onClick={() => onChangeView('dashboard')}
              className={`p-2 rounded hover:bg-white/10 transition-colors ${currentView === 'dashboard' ? 'bg-white/20' : ''}`}
              title="Dashboard"
            >
              <LayoutDashboard size={20} />
            </button>
            <button 
              onClick={() => onChangeView('settings')}
              className={`p-2 rounded hover:bg-white/10 transition-colors ${currentView === 'settings' ? 'bg-white/20' : ''}`}
              title="Form Ingestion & Settings"
            >
              <Settings size={20} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} APi Group. Internal Use Only.
        </div>
      </footer>
    </div>
  );
};

export default Layout;