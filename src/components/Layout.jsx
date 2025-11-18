import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Timer, CheckSquare, Sun, Moon, ShieldAlert } from 'lucide-react';

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
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
      <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-army-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col md:flex-row">
      
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

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          <ShieldAlert className="text-army-500" size={28} />
          <h1 className="text-xl font-bold tracking-tight">CDS Tracker</h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/timer" icon={Timer} label="Study Timer" />
          <NavItem to="/progress" icon={CheckSquare} label="Progress" />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-army-500 w-full">
             {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
             {darkMode ? 'Light Mode' : 'Dark Mode'}
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-8 pt-20 pb-24 md:pt-8 md:pb-8 overflow-y-auto min-h-screen">
        {children}
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center pb-safe z-20 h-16">
        <NavItem to="/" icon={LayoutDashboard} label="Home" mobile />
        <NavItem to="/timer" icon={Timer} label="Timer" mobile />
        <NavItem to="/progress" icon={CheckSquare} label="Topics" mobile />
      </nav>

    </div>
  );
};

export default Layout;
