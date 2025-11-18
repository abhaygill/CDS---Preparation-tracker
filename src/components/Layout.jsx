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

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-army-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          <ShieldAlert className="text-army-500" size={28} />
          <h1 className="text-xl font-bold tracking-tight">CDS Tracker</h1>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/timer" icon={Timer} label="Study Timer" />
          <NavItem to="/progress" icon={CheckSquare} label="Progress" />
        </nav>
        
        <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
           <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-army-500">
             {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
             {darkMode ? 'Light Mode' : 'Dark Mode'}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;