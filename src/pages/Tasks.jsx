import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format, addDays, isSameDay, isBefore, parseISO, startOfDay } from 'date-fns';
import { Plus, Trash2, CheckCircle, Circle, Calendar, AlertTriangle, Trophy } from 'lucide-react';

const Tasks = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTask, setNewTask] = useState('');
  
  // Alert States
  const [pendingAlert, setPendingAlert] = useState(null); 
  const [appreciationMsg, setAppreciationMsg] = useState(null); // For "Good Job" or "Mission Accomplished"

  // Fetch tasks for the selected date
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const tasksForDay = useLiveQuery(
    () => db.tasks.where('date').equals(formattedDate).toArray(),
    [formattedDate]
  );

  // Fetch ALL overdue tasks for warning logic
  const allTasks = useLiveQuery(() => db.tasks.toArray());

  // --- 1. REMINDER SYSTEM (Checks every 30 mins) ---
  useEffect(() => {
    const checkPending = () => {
      if (!allTasks) return;

      const today = startOfDay(new Date());
      
      // Check 1: Tasks from PAST days that are NOT done
      const overdue = allTasks.filter(t => {
        const tDate = parseISO(t.date);
        return isBefore(tDate, today) && !t.isCompleted;
      });

      if (overdue.length > 0) {
        setPendingAlert(`Warning: You have ${overdue.length} pending tasks from previous days. Clear the backlog, Officer.`);
      }
    };

    // Check immediately on load
    checkPending();

    // Check again every 30 minutes
    const interval = setInterval(checkPending, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [allTasks]);


  // --- 2. ACTIONS ---
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await db.tasks.add({
      date: formattedDate,
      title: newTask,
      isCompleted: false
    });
    setNewTask('');
  };

  const toggleTask = async (task) => {
    const newStatus = !task.isCompleted;
    await db.tasks.update(task.id, { isCompleted: newStatus });

    if (newStatus) {
      // Logic: Check if ALL tasks for today are done
      const pending = tasksForDay.filter(t => !t.isCompleted && t.id !== task.id);
      
      if (pending.length === 0 && tasksForDay.length > 0) {
        // All done!
        setAppreciationMsg({ text: "Mission Accomplished! Day Cleared. 🇮🇳", type: "grand" });
      } else {
        // Single task done
        setAppreciationMsg({ text: "Shabash! Keep pushing.", type: "simple" });
      }

      // Hide message after 3 seconds
      setTimeout(() => setAppreciationMsg(null), 3000);
    }
  };

  const deleteTask = async (id) => {
    if (confirm('Delete this task?')) {
      await db.tasks.delete(id);
    }
  };

  // --- 3. CALENDAR STRIP (Last 15 days + Next 15 days) ---
  const generateCalendarDays = () => {
    const days = [];
    for (let i = -15; i <= 15; i++) {
      days.push(addDays(new Date(), i));
    }
    return days;
  };
  const calendarDays = generateCalendarDays();

  return (
    <div className="pb-24 relative">

      {/* --- SUCCESS POPUP (Appreciation) --- */}
      {appreciationMsg && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold animate-bounce ${
          appreciationMsg.type === 'grand' ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'
        }`}>
          {appreciationMsg.type === 'grand' ? <Trophy size={20} /> : <CheckCircle size={20} />}
          {appreciationMsg.text}
        </div>
      )}

      {/* --- WARNING POPUP (Pending Tasks) --- */}
      {pendingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-sm w-full border-2 border-red-500 shadow-2xl text-center space-y-4">
              <div className="flex justify-center text-red-500"><AlertTriangle size={48} /></div>
              <h3 className="text-xl font-bold text-red-600">Overdue Warning!</h3>
              <p className="text-gray-700 dark:text-gray-300">{pendingAlert}</p>
              <button 
                onClick={() => setPendingAlert(null)}
                className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Roger that, I will complete them.
              </button>
           </div>
        </div>
      )}

      <header className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="text-army-500" /> Daily Schedule
        </h2>
      </header>

      {/* --- CALENDAR STRIP --- */}
      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-6">
        {calendarDays.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          return (
            <button
              key={date.toString()}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl border transition-all ${
                isSelected 
                  ? 'bg-army-500 text-white border-army-500 shadow-lg scale-105' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xs font-medium uppercase">{format(date, 'EEE')}</span>
              <span className={`text-xl font-bold ${isToday && !isSelected ? 'text-army-500' : ''}`}>
                {format(date, 'd')}
              </span>
              {isToday && <span className="w-1 h-1 bg-current rounded-full mt-1"></span>}
            </button>
          );
        })}
      </div>

      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isSameDay(selectedDate, new Date()) ? 'Today\'s Targets' : format(selectedDate, 'EEEE, MMMM do')}
          </h3>
          <p className="text-xs text-gray-500">
            {tasksForDay?.filter(t => t.isCompleted).length || 0} / {tasksForDay?.length || 0} Completed
          </p>
        </div>
      </div>

      {/* --- LIST --- */}
      <div className="space-y-3 mb-20">
        {tasksForDay?.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p>No tasks assigned.</p>
            <p className="text-sm">Add a target below.</p>
          </div>
        )}

        {tasksForDay?.map(task => (
          <div 
            key={task.id}
            className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
              task.isCompleted 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50 opacity-75' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'
            }`}
          >
            <div 
              className="flex items-center gap-4 flex-1 cursor-pointer" 
              onClick={() => toggleTask(task)}
            >
              <div className={`p-1 rounded-full ${task.isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                 {task.isCompleted ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
              </div>
              <span className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {task.title}
              </span>
            </div>
            
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* --- INPUT --- */}
      <div className="fixed bottom-16 left-0 right-0 md:left-64 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-10">
        <form onSubmit={addTask} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add new task..."
            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-army-500"
          />
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className="bg-army-500 hover:bg-army-700 text-white p-3 rounded-xl disabled:opacity-50 transition"
          >
            <Plus size={24} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default Tasks;
