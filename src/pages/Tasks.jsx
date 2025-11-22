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
  AlertTriangle, Trophy, ChevronLeft, ChevronRight, MapPin 
} from 'lucide-react';

const Tasks = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Controls which month is visible
  const [newTask, setNewTask] = useState('');
  
  // Alert States
  const [pendingAlert, setPendingAlert] = useState(null); 
  const [appreciationMsg, setAppreciationMsg] = useState(null);

  // --- DATABASE QUERIES ---
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // 1. Get tasks for selected date
  const tasksForDay = useLiveQuery(
    () => db.tasks.where('date').equals(formattedDate).toArray(),
    [formattedDate]
  );

  // 2. Get ALL tasks to:
  //    a) Check overdue
  //    b) Show dots on calendar for days with tasks
  const allTasks = useLiveQuery(() => db.tasks.toArray());

  // --- CALENDAR GENERATION LOGIC ---
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        // Check if this day has tasks (for the dot indicator)
        const dayString = format(day, 'yyyy-MM-dd');
        const hasTasks = allTasks?.some(t => t.date === dayString && !t.isCompleted);
        const isCompletedDay = allTasks?.some(t => t.date === dayString && t.isCompleted) && !hasTasks;

        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={`relative h-14 w-full flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all duration-200
              ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}
              ${isSelected ? 'bg-army-500 text-white shadow-lg transform scale-105 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              ${isToday && !isSelected ? 'border border-army-500 text-army-500' : ''}
            `}
            onClick={() => {
                setSelectedDate(cloneDay);
                // If user clicks a date in next/prev month, switch view to that month
                if(!isSameMonth(cloneDay, currentMonth)) {
                    setCurrentMonth(cloneDay);
                }
            }}
          >
            <span className="text-sm">{formattedDate}</span>
            
            {/* DOT INDICATORS */}
            <div className="flex gap-0.5 mt-1 h-1.5">
                {hasTasks && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></div>
                )}
                {isCompletedDay && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-green-500'}`}></div>
                )}
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
    return <div className="mb-4">{rows}</div>;
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const jumpToToday = () => {
      const today = new Date();
      setSelectedDate(today);
      setCurrentMonth(today);
  }

  // --- REMINDER & ACTIONS LOGIC (Same as before) ---
  useEffect(() => {
    const checkPending = () => {
      if (!allTasks) return;
      const today = startOfDay(new Date());
      const overdue = allTasks.filter(t => {
        const tDate = parseISO(t.date);
        return isBefore(tDate, today) && !t.isCompleted;
      });
      if (overdue.length > 0) {
        setPendingAlert(`Warning: You have ${overdue.length} pending tasks from previous days.`);
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [allTasks]);

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
        setAppreciationMsg({ text: "Mission Accomplished! Day Cleared. 🇮🇳", type: "grand" });
      } else {
        setAppreciationMsg({ text: "Shabash! Target Neutralized.", type: "simple" });
      }
      setTimeout(() => setAppreciationMsg(null), 3000);
    }
  };

  const deleteTask = async (id) => {
    if (confirm('Delete this task?')) await db.tasks.delete(id);
  };


  return (
    <div className="pb-32 relative max-w-4xl mx-auto">

      {/* POPUPS (Appreciation & Warning) */}
      {appreciationMsg && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold animate-bounce ${
          appreciationMsg.type === 'grand' ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'
        }`}>
          {appreciationMsg.type === 'grand' ? <Trophy size={20} /> : <CheckCircle size={20} />}
          {appreciationMsg.text}
        </div>
      )}

      {pendingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-sm w-full border-2 border-red-500 shadow-2xl text-center space-y-4">
              <div className="flex justify-center text-red-500"><AlertTriangle size={48} /></div>
              <h3 className="text-xl font-bold text-red-600">Overdue Warning!</h3>
              <p className="text-gray-700 dark:text-gray-300">{pendingAlert}</p>
              <button onClick={() => setPendingAlert(null)} className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">
                Roger that, I will complete them.
              </button>
           </div>
        </div>
      )}

      {/* --- CALENDAR HEADER --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="text-army-500" size={24}/>
                {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
                <button onClick={jumpToToday} className="p-2 text-xs font-bold text-army-500 hover:bg-army-50 dark:hover:bg-gray-700 rounded-lg mr-2 border border-army-200">
                    TODAY
                </button>
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <ChevronLeft size={20}/>
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <ChevronRight size={20}/>
                </button>
            </div>
        </div>

        {/* WEEKDAY NAMES */}
        <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {day}
                </div>
            ))}
        </div>

        {/* CALENDAR GRID */}
        {renderCalendar()}
      </div>

      {/* --- SELECTED DAY HEADER --- */}
      <div className="flex justify-between items-end mb-4 px-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {isSameDay(selectedDate, new Date()) ? 'Today\'s Targets' : format(selectedDate, 'EEEE, MMM do')}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {tasksForDay?.filter(t => t.isCompleted).length || 0} / {tasksForDay?.length || 0} Completed
          </p>
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <div className="space-y-3 mb-20 px-1">
        {tasksForDay?.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex justify-center mb-2 opacity-50"><MapPin size={32}/></div>
            <p className="font-medium">No missions assigned.</p>
            <p className="text-xs mt-1">Add a target for this date below.</p>
          </div>
        )}

        {tasksForDay?.map(task => (
          <div 
            key={task.id}
            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
              task.isCompleted 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50 opacity-75' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
            }`}
          >
            <div 
              className="flex items-center gap-4 flex-1 cursor-pointer select-none" 
              onClick={() => toggleTask(task)}
            >
              <div className={`p-1 rounded-full transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-300 group-hover:text-army-500'}`}>
                 {task.isCompleted ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
              </div>
              <span className={`font-medium transition-all ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
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
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-[var(--sidebar-width)] p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-10 transition-[left] duration-300 ease-in-out">
        <form onSubmit={addTask} className="max-w-3xl mx-auto flex gap-2 shadow-lg rounded-xl">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={`Add task for ${format(selectedDate, 'MMM do')}...`}
            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-army-500"
          />
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className="bg-army-500 hover:bg-army-700 text-white px-5 rounded-xl disabled:opacity-50 transition active:scale-95"
          >
            <Plus size={24} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default Tasks;
