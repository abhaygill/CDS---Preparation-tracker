import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Play, Pause, Square, Save, RefreshCw } from 'lucide-react';

const StudyTimer = () => {
  const subjects = useLiveQuery(() => db.subjects.toArray());
  const subtopics = useLiveQuery(() => db.subtopics.toArray());

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);

  // --- Timer Persistence Logic ---
  useEffect(() => {
    // Check if timer was running
    const savedStart = localStorage.getItem('timerStart');
    const savedSeconds = localStorage.getItem('timerSeconds'); // elapsed before last pause
    const savedIsActive = localStorage.getItem('timerIsActive') === 'true';
    const savedSub = localStorage.getItem('timerSubtopic');
    const savedSubj = localStorage.getItem('timerSubject');

    if (savedSubj) setSelectedSubject(parseInt(savedSubj));
    if (savedSub) setSelectedSubtopic(parseInt(savedSub));

    if (savedIsActive && savedStart) {
      setIsActive(true);
      setSessionStart(parseInt(savedStart)); // The original start timestamp
    } else if (savedSeconds) {
      setSeconds(parseInt(savedSeconds));
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      // If active, calculate diff from start (resilient to tab throttling)
      const now = Date.now();
      if (!sessionStart) {
         // First tick
         const start = now - (seconds * 1000);
         setSessionStart(start);
         localStorage.setItem('timerStart', start);
      }
      
      interval = setInterval(() => {
        const current = Date.now();
        const start = parseInt(localStorage.getItem('timerStart') || current);
        setSeconds(Math.floor((current - start) / 1000));
      }, 1000);
      
      localStorage.setItem('timerIsActive', 'true');
    } else {
      clearInterval(interval);
      localStorage.setItem('timerIsActive', 'false');
      localStorage.setItem('timerSeconds', seconds);
      localStorage.removeItem('timerStart');
      setSessionStart(null);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
      if(selectedSubject) localStorage.setItem('timerSubject', selectedSubject);
      if(selectedSubtopic) localStorage.setItem('timerSubtopic', selectedSubtopic);
  }, [selectedSubject, selectedSubtopic]);


  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    localStorage.removeItem('timerStart');
    localStorage.removeItem('timerSeconds');
    localStorage.setItem('timerIsActive', 'false');
  };

  const handleSave = async () => {
    if (seconds < 60) {
      alert("Session too short to save (< 1 min).");
      return;
    }
    if (!selectedSubtopic) {
      alert("Please select a subtopic.");
      return;
    }

    await db.sessions.add({
      subjectId: selectedSubject,
      subtopicId: selectedSubtopic,
      startTime: new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: seconds,
      notes: ''
    });

    handleReset();
    alert("Session Saved!");
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter subtopics based on subject
  const filteredSubtopics = subtopics?.filter(s => s.subjectId === selectedSubject) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Focus Timer</h2>
        <p className="text-gray-500">Select your target and start studying.</p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => { setSelectedSubject(parseInt(e.target.value)); setSelectedSubtopic(''); }}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              disabled={isActive}
            >
              <option value="">Select Subject</option>
              {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtopic</label>
            <select 
              value={selectedSubtopic} 
              onChange={(e) => setSelectedSubtopic(parseInt(e.target.value))}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              disabled={!selectedSubject || isActive}
            >
              <option value="">Select Subtopic</option>
              {filteredSubtopics.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        </div>

        {/* Timer Display */}
        <div className="py-10 text-center">
          <div className="text-8xl font-mono tracking-tighter text-army-500 dark:text-white">
            {formatTime(seconds)}
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {!isActive ? (
              <button onClick={() => setIsActive(true)} className="flex items-center gap-2 px-8 py-3 bg-army-500 hover:bg-army-700 text-white rounded-full text-lg font-semibold transition-transform active:scale-95 shadow-lg shadow-army-500/30">
                <Play size={20} /> Start
              </button>
            ) : (
              <button onClick={() => setIsActive(false)} className="flex items-center gap-2 px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-lg font-semibold transition-transform active:scale-95">
                <Pause size={20} /> Pause
              </button>
            )}
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full transition">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
          <button 
            onClick={handleSave}
            disabled={seconds === 0}
            className="flex items-center gap-2 px-6 py-2 border-2 border-army-500 text-army-500 dark:text-army-100 rounded-lg hover:bg-army-50 dark:hover:bg-army-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} /> Save Session
          </button>
        </div>

      </div>
    </div>
  );
};

export default StudyTimer;