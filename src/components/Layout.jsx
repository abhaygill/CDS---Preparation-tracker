import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Timer, CheckSquare, ListTodo, 
  Sun, Moon, ShieldAlert, ChevronLeft, ChevronRight 
} from 'lucide-react';
import MotivationPopup from './MotivationPopup';

const Layout = ({ children }) => {
  // Theme State
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  
  // Sidebar Collapse State (Persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');

  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Toggle Sidebar Handler
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  const NavItem = ({ to, icon: Icon, label, mobile }) => {
    const isActive = location.pathname === to;
    
    // Mobile Bottom Nav Item Styles
    if (mobile) {
      return (
        <Link to={to} className={`flex flex-col items-center justify-center w-full py-2 ${isActive ? 'text-army-500' : 'text-gray-500 dark:text-gray-400'}`}>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">{label}</span>
        </Link>
      );
    }

    // Desktop Sidebar Item Styles
    return (
      <Link 
        to={to} 
        title={isCollapsed ? label : ''} // Tooltip when collapsed
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive ? 'bg-army-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
          ${isCollapsed ? 'justify-center' : ''} 
        `}
      >
        <Icon size={20} />
        {/* Hide text if collapsed */}
        {!isCollapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col md:flex-row">
      
      <MotivationPopup />

      {/* --- MOBILE TOP HEADER --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-army-500" size={24} />
          <h1 className="text-lg font-bold tracking-tight">CDS Tracker</h1>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-500 dark:text-gray-400">
          {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
      </header>

      {/* --- DESKTOP SIDEBAR (Collapsible) --- */}
      <aside 
        className={`hidden md:flex bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Sidebar Header */}
        <div className={`p-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 h-20 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
                <ShieldAlert className="text-army-500 flex-shrink-0" size={28} />
                {!isCollapsed && <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">CDS Tracker</h1>}
            </div>
            
            {/* Toggle Button (Only visible when expanded, or we can place it differently) */}
            {!isCollapsed && (
                <button onClick={toggleSidebar} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <ChevronLeft size={20} />
                </button>
            )}
        </div>

        {/* Toggle Button for Collapsed State (Centered) */}
        {isCollapsed && (
            <button onClick={toggleSidebar} className="mx-auto mt-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 mb-2">
                <ChevronRight size={20} />
            </button>
        )}

        {/* Nav Items */}
        <nav className="p-3 space-y-2 flex-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/tasks" icon={ListTodo} label="Tasks" />
          <NavItem to="/timer" icon={Timer} label="Study Timer" />
          <NavItem to="/progress" icon={CheckSquare} label="Progress" />
        </nav>
        
        {/* Dark Mode Toggle Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           <button 
            onClick={() => setDarkMode(!darkMode)} 
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-army-500 w-full transition-colors
                ${isCollapsed ? 'justify-center' : ''}
            `}
           >
             {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
             {!isCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-8 pt-20 pb-24 md:pt-8 md:pb-8 overflow-y-auto min-h-screen">
        {children}
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between px-6 items-center pb-safe z-20 h-16">
        <NavItem to="/" icon={LayoutDashboard} label="Home" mobile />
        <NavItem to="/tasks" icon={ListTodo} label="Tasks" mobile />
        <NavItem to="/timer" icon={Timer} label="Timer" mobile />
        <NavItem to="/progress" icon={CheckSquare} label="Topics" mobile />
      </nav>

    </div>
  );
};

export default Layout;
