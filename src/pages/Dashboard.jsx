import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, exportData, importData } from '../lib/db';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend // <--- ADDED PIE CHART IMPORTS
} from 'recharts';
import { 
  format, subDays, isSameDay, startOfMonth, endOfMonth, 
  eachDayOfInterval, subMonths, addMonths, parseISO, differenceInCalendarDays 
} from 'date-fns';
import { 
  Download, Upload, Flame, Clock, BookOpen, ChevronLeft, ChevronRight, 
  Calendar, Trophy, PieChart as PieChartIcon, ArrowLeft 
} from 'lucide-react';

// Colors for the drill-down topic chart
const TOPIC_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const Dashboard = () => {
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];
  const subjects = useLiveQuery(() => db.subjects.toArray());
  const subtopics = useLiveQuery(() => db.subtopics.toArray());
  const progress = useLiveQuery(() => db.progress.toArray());

  const [chartView, setChartView] = useState('weekly'); 
  const [exploreMonth, setExploreMonth] = useState(new Date());
  
  // --- NEW: PIE CHART STATE ---
  const [selectedPieSubject, setSelectedPieSubject] = useState(null); // null = show subjects, ID = show topics

  // --- HELPERS ---
  const formatDuration = (totalMinutes) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs} Hrs ${mins} Mins`;
    if (hrs > 0) return `${hrs} Hrs`;
    return `${mins} Mins`;
  };

  // --- ANALYTICS ---
  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalHrs = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);
  const totalTimeDisplay = totalHrs > 0 ? `${totalHrs} Hrs ${totalMins} Mins` : `${totalMins} Mins`;
  
  const todaySessions = sessions.filter(s => isSameDay(new Date(s.startTime), new Date()));
  const todayMinutes = Math.round(todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

  // --- STREAK LOGIC ---
  const getUniqueDays = () => {
      const days = new Set(sessions.map(s => format(new Date(s.startTime), 'yyyy-MM-dd')));
      return [...days].sort();
  };
  const sortedUniqueDays = getUniqueDays();

  const calculateCurrentStreak = () => {
    if (!sortedUniqueDays.length) return 0;
    let streak = 0;
    let checkDate = new Date();
    
    if (sortedUniqueDays.includes(format(checkDate, 'yyyy-MM-dd'))) streak++;
    else {
        checkDate = subDays(checkDate, 1);
        if (!sortedUniqueDays.includes(format(checkDate, 'yyyy-MM-dd'))) return 0; 
        streak++;
    }

    while (true) {
        checkDate = subDays(checkDate, 1);
        if (sortedUniqueDays.includes(format(checkDate, 'yyyy-MM-dd'))) streak++;
        else break;
    }
    return streak;
  };

  const calculateHighestStreak = () => {
    if (!sortedUniqueDays.length) return 0;
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 0; i < sortedUniqueDays.length - 1; i++) {
        const date1 = parseISO(sortedUniqueDays[i]);
        const date2 = parseISO(sortedUniqueDays[i+1]);
        
        if (differenceInCalendarDays(date2, date1) === 1) {
            currentStreak++;
        } else {
            currentStreak = 1; 
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
    }
    return maxStreak;
  };

  // --- BAR CHART DATA ---
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), d));
    return {
      name: format(d, 'EEE'),
      fullDate: format(d, 'MMM d'),
      minutes: Math.round(daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)
    };
  });

  const getMonthlyData = () => {
    const start = startOfMonth(exploreMonth);
    const end = endOfMonth(exploreMonth);
    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), day));
      return {
        name: format(day, 'd'),
        fullDate: format(day, 'MMM d'),
        minutes: Math.round(daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)
      };
    });
  };

  const chartData = chartView === 'weekly' ? weeklyData : getMonthlyData();

  const maxMinutes = Math.max(0, ...chartData.map(d => d.minutes));
  const maxHourCap = Math.max(1, Math.ceil(maxMinutes / 60));
  const maxDomainValue = maxHourCap * 60; 
  const yAxisTicks = [];
  for (let i = 0; i <= maxHourCap; i++) {
    yAxisTicks.push(i * 60);
  }

  // --- NEW: PIE CHART DATA LOGIC ---
  // Level 1: Subjects
  const subjectPieData = subjects?.map(subj => {
    const subjSessions = sessions.filter(s => s.subjectId === subj.id);
    const totalMins = Math.round(subjSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
    return { id: subj.id, name: subj.name, value: totalMins, color: subj.color || '#5c7c51' };
  }).filter(d => d.value > 0) || [];

  // Level 2: Topics (if a subject is selected)
  const topicPieData = selectedPieSubject ? subtopics?.filter(t => t.subjectId === selectedPieSubject).map((topic, index) => {
    const topicSessions = sessions.filter(s => s.subtopicId === topic.id);
    const totalMins = Math.round(topicSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
    return { id: topic.id, name: topic.title, value: totalMins, color: TOPIC_COLORS[index % TOPIC_COLORS.length] };
  }).filter(d => d.value > 0) : [];

  const activePieData = selectedPieSubject ? topicPieData : subjectPieData;
  const activePieSubjectName = selectedPieSubject ? subjects?.find(s => s.id === selectedPieSubject)?.name : '';

  const fileInputRef = React.useRef();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mission Overview</h2>
          <p className="text-gray-500">Track your preparation status.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
            <Download size={16} /> Export
          </button>
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
            <Upload size={16} /> Import
          </button>
          <input type="file" ref={fileInputRef} onChange={(e) => importData(e.target.files[0])} className="hidden" accept=".json" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Total Study Time</p>
              <h3 className="text-2xl font-bold mt-1 text-army-700 dark:text-white">{totalTimeDisplay}</h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-500 font-medium">{formatDuration(todayMinutes)}</span> today
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Current Streak</p>
              <h3 className="text-3xl font-bold mt-1">{calculateCurrentStreak()} <span className="text-base font-normal text-gray-400">days</span></h3>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
              <Flame size={24} />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-lg text-xs font-bold border border-yellow-200 dark:border-yellow-900">
                <Trophy size={14} />
                <span>Best: {calculateHighestStreak()} days</span>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Topics Covered</p>
              <h3 className="text-3xl font-bold mt-1">
                {progress ? progress.filter(p => p.topicCompleted).length : 0} 
                <span className="text-base font-normal text-gray-400"> / {subtopics?.length || 0}</span>
              </h3>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
              <BookOpen size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Based on 'Topic Completed' checks.
          </div>
        </div>
      </div>

      {/* --- ROW 2: BAR CHART & ACTIVITY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BAR CHART SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-80 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            {chartView === 'weekly' ? (
               <h3 className="font-bold text-gray-800 dark:text-gray-200">Study Frequency</h3>
            ) : (
               <div className="flex items-center gap-2">
                  <button onClick={() => setExploreMonth(subMonths(exploreMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft size={16} /></button>
                  <span className="font-bold text-army-600 dark:text-army-400 min-w-[100px] text-center">{format(exploreMonth, 'MMM yyyy')}</span>
                  <button onClick={() => setExploreMonth(addMonths(exploreMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight size={16} /></button>
               </div>
            )}
            <button 
                onClick={() => {
                    if (chartView === 'weekly') { setChartView('monthly'); setExploreMonth(new Date()); } 
                    else { setChartView('weekly'); }
                }}
                className="text-xs font-bold text-army-500 hover:bg-army-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded border border-army-200 dark:border-gray-600 transition-colors flex items-center gap-1"
            >
                {chartView === 'weekly' ? <>Explore <Calendar size={12}/></> : 'Back to Weekly'}
            </button>
          </div>

          <div className="flex-1 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} interval={chartView === 'monthly' ? 2 : 0} />
                <YAxis type="number" domain={[0, maxDomainValue]} tick={{fontSize: 10}} axisLine={false} tickLine={false} ticks={yAxisTicks} tickFormatter={(val) => val === 0 ? '0' : `${val / 60}`} interval={0} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-xl">
                                <p className="font-bold mb-1">{data.fullDate}</p>
                                <p>Study: {formatDuration(data.minutes)}</p>
                            </div>
                        );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="minutes" fill="#5c7c51" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="space-y-6 h-80 flex flex-col">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 overflow-hidden flex flex-col">
                <h3 className="font-semibold mb-4 flex-shrink-0">Recent Sessions</h3>
                <div className="overflow-y-auto flex-1 space-y-3 pr-1 custom-scrollbar">
                    {sessions.slice().reverse().map(session => (
                    <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                        <div>
                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                {subtopics?.find(t => t.id === session.subtopicId)?.title || 'Unknown Topic'}
                            </div>
                            <div className="text-[10px] text-gray-500">
                                {format(new Date(session.startTime), 'MMM d, h:mm a')}
                            </div>
                        </div>
                        <div className="font-mono font-semibold text-army-500 whitespace-nowrap ml-2">
                            {Math.round(session.durationSeconds / 60) < 60 
                                ? `${Math.round(session.durationSeconds / 60)}m`
                                : formatDuration(Math.round(session.durationSeconds / 60)).replace('Hrs', 'h').replace('Mins', 'm')
                            }
                        </div>
                    </div>
                    ))}
                    {sessions.length === 0 && <p className="text-gray-400 text-center py-4 text-xs">No sessions recorded yet.</p>}
                </div>
            </div>
        </div>

      </div>

      {/* --- ROW 3: NEW PIE CHART SECTION --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
        
        <div className="w-full flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <PieChartIcon className="text-army-500" size={24} />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {selectedPieSubject ? `Topic Breakdown: ${activePieSubjectName}` : 'Subject Distribution'}
                </h3>
            </div>
            {selectedPieSubject && (
                <button 
                    onClick={() => setSelectedPieSubject(null)}
                    className="flex items-center gap-1 text-xs font-bold text-army-500 hover:bg-army-50 dark:hover:bg-gray-700 px-3 py-1.5 rounded transition"
                >
                    <ArrowLeft size={14} /> Back to Subjects
                </button>
            )}
        </div>

        {activePieData.length === 0 ? (
            <div className="py-20 text-gray-400 text-sm">Not enough data to generate chart. Start studying!</div>
        ) : (
            <div className="w-full h-80 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activePieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={selectedPieSubject ? 60 : 0} // Donut shape for topics, solid for subjects
                            outerRadius={110}
                            paddingAngle={2}
                            onClick={(data) => {
                                // Only drill down if we are currently looking at subjects
                                if (!selectedPieSubject) setSelectedPieSubject(data.id);
                            }}
                            cursor={!selectedPieSubject ? "pointer" : "default"}
                        >
                            {activePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-gray-900 text-white text-xs p-3 rounded shadow-xl border border-gray-700">
                                            <p className="font-bold text-sm mb-1">{data.name}</p>
                                            <p className="text-gray-300">Time: <span className="text-army-400 font-bold">{formatDuration(data.value)}</span></p>
                                            {!selectedPieSubject && <p className="text-[10px] text-gray-500 mt-2 italic">Click slice to explore topics</p>}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
