import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, 
  isBefore, parseISO, startOfDay 
} from 'date-fns';
import { 
  Plus, Trash2, CheckCircle, Circle, Calendar as CalendarIcon, 
  AlertTriangle, Trophy, ChevronLeft, ChevronRight, MapPin, X 
} from 'lucide-react';

const Tasks = () => {
  // Default to Today
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [showCalendar, setShowCalendar] = useState(false); 
  const [newTask, setNewTask] = useState('');
  
  // Alert States
  const [overdueTasks, setOverdueTasks] = useState([]); // NOW STORES THE ACTUAL TASKS
  const [appreciationMsg, setAppreciationMsg] = useState(null);

  // --- DATABASE QUERIES ---
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  const tasksForDay = useLiveQuery(
    () => db.tasks.where('date').equals(formattedDate).toArray(),
    [formattedDate]
  );

  const allTasks = useLiveQuery(() => db.tasks.toArray());

  // --- REMINDERS & GHOST TASK DETECTION ---
  useEffect(() => {
    const checkPending = () => {
      if (!allTasks) return;
      
      // "Today" at 00:00:00 hours
      const today = startOfDay(new Date());
      
      // Find tasks strictly BEFORE today that are NOT done
      const foundOverdue = allTasks.filter(t => {
        const taskDate = parseISO(t.date);
        return isBefore(taskDate, today) && !t.isCompleted;
      });

      setOverdueTasks(foundOverdue);
    };

    checkPending();
  }, [allTasks]);


  // --- CALENDAR LOGIC ---
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayString = format(day, 'yyyy-MM-dd');
        
        const hasTasks = allTasks?.some(t => t.date === dayString && !t.isCompleted);
        const isCompletedDay = allTasks?.some(t => t.date === dayString && t.isCompleted) && !hasTasks;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`relative h-10 w-full flex items-center justify-center cursor-pointer rounded-full transition-all duration-200
              ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}
              ${isSelected ? 'bg-army-500 text-white font-bold shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              ${isToday && !isSelected ? 'border border-army-500 text-army-500' : ''}
            `}
            onClick={() => {
                setSelectedDate(cloneDay);
                setShowCalendar(false); 
                if(!isSameMonth(cloneDay, currentMonth)) setCurrentMonth(cloneDay);
            }}
          >
            <span className="text-sm">{format(day, 'd')}</span>
            <div className="absolute bottom-1 flex gap-0.5">
                {hasTasks && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></div>}
                {isCompletedDay && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-green-500'}`}></div>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  // --- ACTIONS ---
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await db.tasks.add({ date: formattedDate, title: newTask, isCompleted: false });
    setNewTask('');
  };

  const toggleTask = async (task) => {
    const newStatus = !task.isCompleted;
    await db.tasks.update(task.id, { isCompleted: newStatus });
    if (newStatus) {
      const pending = tasksForDay.filter(t => !t.isCompleted && t.id !== task.id);
      if (pending.length === 0 && tasksForDay.length > 0) {
        setAppreciationMsg({ text: "Day Cleared! Outstanding.", type: "grand" });
      } else {
        setAppreciationMsg({ text: "Good kill.", type: "simple" });
      }
      setTimeout(() => setAppreciationMsg(null), 3000);
    }
  };

  const deleteTask = async (id) => {
    // No confirmation for quick cleanup of ghosts
    await db.tasks.delete(id);
  };


  return (
    <div className="pb-32 relative max-w-2xl mx-auto">

      {/* --- APPRECIATION POPUP --- */}
      {appreciationMsg && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold animate-bounce ${
          appreciationMsg.type === 'grand' ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'
        }`}>
          {appreciationMsg.type === 'grand' ? <Trophy size={20} /> : <CheckCircle size={20} />}
          {appreciationMsg.text}
        </div>
      )}
      
      {/* --- NEW: OVERDUE TASKS MANAGER --- */}
      {overdueTasks.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
                <AlertTriangle size={18} />
                <h3>{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Found</h3>
            </div>
            <p className="text-xs text-red-600/70 mb-3">These tasks are from past dates. Clear them to reset your status.</p>
            
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {overdueTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</span>
                            <span className="text-[10px] text-gray-400">{format(parseISO(task.date), 'MMM do, yyyy')}</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => toggleTask(task)} 
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded bg-green-50/50" 
                                title="Mark Done"
                            >
                                <CheckCircle size={16} />
                            </button>
                            <button 
                                onClick={() => deleteTask(task.id)} 
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded bg-red-50/50" 
                                title="Delete Forever"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-6 pt-2">
        <div>
            <h1 className="text-5xl font-bold text-army-500 tracking-tighter">
                {format(selectedDate, 'd')}
            </h1>
            <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                {format(selectedDate, 'MMMM, EEEE')}
            </h2>
            {isSameDay(selectedDate, new Date()) && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-army-100 dark:bg-army-900/30 text-army-600 text-[10px] font-bold rounded uppercase">
                    Today
                </span>
            )}
        </div>

        <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm border
                ${showCalendar 
                    ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' 
                    : 'bg-army-500 text-white border-army-500 hover:bg-army-600'
                }`}
        >
            {showCalendar ? <X size={18}/> : <CalendarIcon size={18} />}
            {showCalendar ? 'Close' : 'Calendar'}
        </button>
      </div>

      {/* --- EXPANDABLE CALENDAR --- */}
      {showCalendar && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronLeft size={20}/></button>
                <span className="font-bold text-gray-700 dark:text-gray-200">{format(currentMonth, 'MMMM yyyy')}</span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronRight size={20}/></button>
            </div>
            
            <div className="grid grid-cols-7 mb-2">
                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-xs text-gray-400 font-bold">{d}</div>)}
            </div>
            
            {renderCalendar()}
            
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                <button onClick={() => { setSelectedDate(new Date()); setCurrentMonth(new Date()); setShowCalendar(false); }} className="text-xs font-bold text-army-500 hover:underline">
                    Jump to Today
                </button>
            </div>
        </div>
      )}

      {/* --- TASK LIST --- */}
      <div className="space-y-3 mb-24">
        {tasksForDay?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-3">
                <MapPin size={24} className="opacity-50"/>
            </div>
            <p className="font-medium text-sm">No operations planned.</p>
          </div>
        )}

        {tasksForDay?.map(task => (
          <div 
            key={task.id}
            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              task.isCompleted 
                ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-army-200'
            }`}
          >
            <div 
              className="flex items-center gap-4 flex-1 cursor-pointer select-none" 
              onClick={() => toggleTask(task)}
            >
              <div className={`transform transition-transform active:scale-90 ${task.isCompleted ? 'text-green-500' : 'text-gray-300 group-hover:text-army-500'}`}>
                 {task.isCompleted ? <CheckCircle size={26} className="fill-current" /> : <Circle size={26} strokeWidth={1.5} />}
              </div>
              <span className={`font-medium text-base transition-all ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {task.title}
              </span>
            </div>
            
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* --- ADD INPUT --- */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-[var(--sidebar-width)] p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 z-10 transition-[left] duration-300">
        <form onSubmit={addTask} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New mission objective..."
            className="flex-1 px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-army-500 shadow-sm"
          />
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className="bg-army-500 hover:bg-army-600 text-white px-5 rounded-xl disabled:opacity-50 transition active:scale-95 shadow-lg shadow-army-500/20"
          >
            <Plus size={24} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default Tasks;
