import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Globe, Users, Target, Shield, BookOpen } from 'lucide-react';

const SSBModuleCard = ({ title, icon: Icon, description, colorClass, to }) => (
     <Link to={to} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer block">
       <div className={`p-3 rounded-xl inline-block mb-4 ${colorClass}`}>
         <Icon size={28} />
       </div>
       <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
       <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
     </Link>
   );

const SSBDashboard = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="text-army-500" size={32} />
            Services Selection Board
          </h1>
          <p className="text-gray-500 mt-1">Do you have it in you? Track your OLQs and preparation.</p>
        </div>
      </div>

      {/* Main Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SSBModuleCard 
          title="Psychology" 
          description="TAT, WAT, SRT, SDT practice and performance tracking."
          icon={Brain}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          to="/ssb/psychology" // <--- WE ADDED THIS
        />
        <SSBModuleCard 
          title="Interview Officer (IO)" 
          description="PIQ tracking, mock questions, and feedback storage."
          icon={Users}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          to="/ssb/interview" // <--- ADDED THIS
        />
        <SSBModuleCard 
          title="GTO Tasks" 
          description="GD, Lecturette, and outdoor task observations."
          icon={Target}
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          to="/ssb/gto" // <--- ADDED THIS
        />
        <SSBModuleCard 
          title="Current Affairs" 
          description="National, International, and Defence news tracking."
          icon={Globe}
          colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
          to="#" // <--- ADDED THIS
        />
        <SSBModuleCard 
          title="Defence Awareness" 
          description="Ranks, commands, weapons, and military exercises."
          icon={Shield}
          colorClass="bg-army-100 text-army-600 dark:bg-army-900/30 dark:text-army-400"
          to="#" // <--- ADDED THIS
        />
        <SSBModuleCard 
          title="Daily Activity Log" 
          description="View your complete daily timeline of SSB preparation."
          icon={BookOpen}
          colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          to="#" // <--- ADDED THIS
        />
      </div>

      {/* Analytics Preview Shell (To be built later) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
        <h3 className="text-lg font-bold mb-4">Recent Feedback & Activity</h3>
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
          Phase 2: Analytics & Log Engine will load here...
        </div>
      </div>

    </div>
  );
};

export default SSBDashboard;
