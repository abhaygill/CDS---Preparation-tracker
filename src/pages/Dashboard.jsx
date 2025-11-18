import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, exportData, importData } from '../lib/db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, isSameDay, differenceInDays } from 'date-fns';
import { Download, Upload, Flame, Clock, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];
  const subtopics = useLiveQuery(() => db.subtopics.toArray());
  const progress = useLiveQuery(() => db.progress.toArray());

  // --- Analytics Logic ---
  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  
  const todaySessions = sessions.filter(s => isSameDay(new Date(s.startTime), new Date()));
  const todayMinutes = Math.round(todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

  // Streak Logic
  const calculateStreak = () => {
    if (!sessions.length) return 0;
    const daysMap = new Set(sessions.map(s => format(new Date(s.startTime), 'yyyy-MM-dd')));
    let streak = 0;
    let checkDate = new Date();
    
    // Check today
    if (daysMap.has(format(checkDate, 'yyyy-MM-dd'))) streak++;
    else {
        // If haven't studied today, check if studied yesterday to keep streak alive
        checkDate = subDays(checkDate, 1);
        if (!daysMap.has(format(checkDate, 'yyyy-MM-dd'))) return 0;
        streak++;
    }

    while (true) {
        checkDate = subDays(checkDate, 1);
        if (daysMap.has(format(checkDate, 'yyyy-MM-dd'))) streak++;
        else break;
    }
    return streak;
  };

  // Chart Data Prep
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), d));
    return {
      name: format(d, 'EEE'),
      minutes: Math.round(daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)
    };
  });

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
          <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            <Download size={16} /> Export
          </button>
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition">
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
              <h3 className="text-3xl font-bold mt-1">{totalHours} <span className="text-base font-normal text-gray-400">hrs</span></h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-500 font-medium">{todayMinutes} mins</span> today
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Current Streak</p>
              <h3 className="text-3xl font-bold mt-1">{calculateStreak()} <span className="text-base font-normal text-gray-400">days</span></h3>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
              <Flame size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Consistency is key to CDS success.
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

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
          <h3 className="font-semibold mb-4">Last 7 Days (Minutes)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff'}} 
                cursor={{fill: 'transparent'}}
              />
              <Bar dataKey="minutes" fill="#5c7c51" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <h3 className="font-semibold mb-4">Recent Sessions</h3>
          <div className="overflow-y-auto h-60 space-y-3">
            {sessions.slice().reverse().slice(0, 10).map(session => (
              <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                <div>
                  <div className="font-medium">{subtopics?.find(t => t.id === session.subtopicId)?.title || 'Unknown Topic'}</div>
                  <div className="text-xs text-gray-500">{format(new Date(session.startTime), 'MMM d, h:mm a')}</div>
                </div>
                <div className="font-mono font-semibold text-army-500">
                  {Math.round(session.durationSeconds / 60)}m
                </div>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-gray-400 text-center py-4">No sessions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;