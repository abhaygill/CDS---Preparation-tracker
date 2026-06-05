import React from 'react';
import { Brain, Globe, Users, Target, Shield, BookOpen, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format, parseISO } from 'date-fns';

const SSBModuleCard = ({ title, icon: Icon, description, colorClass, to }) => (
  <Link to={to} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer block transform hover:-translate-y-1">
    <div className={`p-3 rounded-xl inline-block mb-4 ${colorClass}`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
  </Link>
);

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
          title="Psychology" description="TAT, WAT, SRT, SDT practice tracking."
          icon={Brain} colorClass="bg-purple-100 text-purple-600" to="/ssb/psychology"
        />
        <SSBModuleCard 
          title="Interview Officer (IO)" description="PIQ tracking and mock questions."
          icon={Users} colorClass="bg-blue-100 text-blue-600" to="/ssb/interview"
        />
        <SSBModuleCard 
          title="GTO Tasks" description="GD, Lecturette, and outdoor tasks."
          icon={Target} colorClass="bg-orange-100 text-orange-600" to="/ssb/gto"
        />
        <SSBModuleCard 
          title="Current Affairs" description="National and International news."
          icon={Globe} colorClass="bg-teal-100 text-teal-600" to="/ssb/current-affairs"
        />
        <SSBModuleCard 
          title="Defence Awareness" description="Ranks, weapons, and exercises."
          icon={Shield} colorClass="bg-army-100 text-army-600" to="/ssb/defence"
        />
      </div>

      {/* --- MASTER DAILY ACTIVITY LOG --- */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <BookOpen className="text-gray-400" size={24} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Master Daily Log</h3>
        </div>

        <div className="space-y-8">
          {Object.keys(groupedActivities).length === 0 && (
            <p className="text-gray-400 text-center py-10">Your daily SSB logs will appear here once you start practicing.</p>
          )}
          
          {Object.keys(groupedActivities).map(dateStr => (
            <div key={dateStr} className="relative pl-4 md:pl-0">
              {/* Date Header */}
              <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-2 mb-3 z-10">
                <h4 className="text-lg font-bold text-army-600 dark:text-army-400">
                  {format(parseISO(dateStr), 'EEEE, MMMM do, yyyy')}
                </h4>
              </div>

              {/* Day's Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedActivities[dateStr].map(act => (
                  <div key={act.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md
                            ${act.category === 'Psychology' ? 'bg-purple-100 text-purple-700' : 
                              act.category === 'GTO' ? 'bg-orange-100 text-orange-700' :
                              act.category === 'Current Affairs' ? 'bg-teal-100 text-teal-700' :
                              'bg-army-100 text-army-700'}
                        `}>
                            {act.category} • {act.subCategory}
                        </span>
                        <span className="text-xs text-gray-400">{format(parseISO(act.date), 'h:mm a')}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{act.title}</p>
                    {act.quantity && <p className="text-sm text-gray-600 dark:text-gray-400">Completed: {act.quantity} ({act.performance})</p>}
                    {act.notes && <p className="text-xs text-gray-500 italic mt-2 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100">"{act.notes}"</p>}
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
