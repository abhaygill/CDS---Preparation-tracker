import React from 'react';
import { Brain, Globe, Users, Target, Shield, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format, parseISO } from 'date-fns';

// 1. REFACTORED SSBModuleCard: Enhanced hover effects and dynamic routing
const SSBModuleCard = ({ title, icon: Icon, description, colorClass, to, isScroll }) => {
  const cardClasses = "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer block transform hover:-translate-y-1.5 hover:border-gray-300 dark:hover:border-gray-500 group";
  
  const content = (
    <>
      <div className={`p-3 rounded-xl inline-block mb-4 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </>
  );

  // If it's a scroll link (like Daily Log), we use a standard anchor tag
  if (isScroll) {
    return (
      <a href={to} className={cardClasses}>
        {content}
      </a>
    );
  }

  // Otherwise, use React Router Link
  return (
    <Link to={to} className={cardClasses}>
      {content}
    </Link>
  );
};

const SSBDashboard = () => {
  const activities = useLiveQuery(() => db.ssb_activities.reverse().toArray()) || [];
  
  // Group activities by Date string (YYYY-MM-DD)
  const groupedActivities = activities.reduce((groups, act) => {
    const date = format(parseISO(act.date), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(act);
    return groups;
  }, {});

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="text-army-500" size={32} />
            Services Selection Board
          </h1>
          <p className="text-gray-500 mt-1">Track your OLQs, psych conditioning, and interview readiness.</p>
        </div>
      </div>

      {/* Main Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SSBModuleCard 
          title="Psychology" 
          description="Master TAT, WAT, SRT, and SDT. Log daily practice and review assessor feedback."
          icon={Brain} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" to="/ssb/psychology"
        />
        <SSBModuleCard 
          title="Interview (IO)" 
          description="Draft PIQ answers, anticipate cross-questions, and record mock interview insights."
          icon={Users} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" to="/ssb/interview"
        />
        <SSBModuleCard 
          title="GTO Tasks" 
          description="Track Group Discussions, Lecturette topics, and outdoor task observations."
          icon={Target} colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" to="/ssb/gto"
        />
        <SSBModuleCard 
          title="Current Affairs" 
          description="Stay updated with National, International, Economy, and Govt schemes."
          icon={Globe} colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" to="/ssb/current-affairs"
        />
        <SSBModuleCard 
          title="Defence Awareness" 
          description="Memorize ranks, commands, missiles, aircraft, and military exercises."
          icon={Shield} colorClass="bg-army-100 text-army-600 dark:bg-army-900/30 dark:text-army-400" to="/ssb/defence"
        />
        {/* Added the 6th Card back for UI balance and quick navigation */}
        <SSBModuleCard 
          title="Daily Activity Log" 
          description="Review your complete chronological timeline of all SSB preparation."
          icon={BookOpen} colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300" to="#master-log" isScroll={true}
        />
      </div>

      {/* --- MASTER DAILY ACTIVITY LOG --- */}
      <div id="master-log" className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8 scroll-mt-24">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            <BookOpen className="text-gray-500 dark:text-gray-400" size={24} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Master Daily Log</h3>
        </div>

        <div className="space-y-8">
          {Object.keys(groupedActivities).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                <BookOpen size={32} className="opacity-50" />
              </div>
              <p>Your daily SSB logs will appear here once you start practicing.</p>
            </div>
          )}
          
          {Object.keys(groupedActivities).map(dateStr => (
            <div key={dateStr} className="relative pl-4 md:pl-0">
              {/* Date Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm py-2 mb-3 z-10 border-b border-gray-50 dark:border-gray-700/50">
                <h4 className="text-lg font-bold text-army-600 dark:text-army-400">
                  {format(parseISO(dateStr), 'EEEE, MMMM do, yyyy')}
                </h4>
              </div>

              {/* Day's Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedActivities[dateStr].map(act => (
                  <div key={act.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md
                            ${act.category === 'Psychology' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 
                              act.category === 'GTO' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                              act.category === 'Current Affairs' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' :
                              act.category === 'Defence Awareness' ? 'bg-army-100 text-army-700 dark:bg-army-900/50 dark:text-army-300' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
                        `}>
                            {act.category} • {act.subCategory}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{format(parseISO(act.date), 'h:mm a')}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{act.title}</p>
                    {act.quantity && <p className="text-sm text-gray-600 dark:text-gray-400">Completed: {act.quantity} ({act.performance})</p>}
                    {act.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-2 bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          "{act.notes}"
                        </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SSBDashboard;
