import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Shield, Plus, Trash2, MessageSquareWarning, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Defence = () => {
  const [subCategory, setSubCategory] = useState('Ranks & Commands');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const activities = useLiveQuery(() => db.ssb_activities.where('category').equals('Defence Awareness').reverse().toArray()) || [];
  const feedbacks = useLiveQuery(() => db.ssb_feedback.where('category').equals('Defence Awareness').reverse().toArray()) || [];

  const totalTopics = activities.length;
  const totalMins = activities.reduce((acc, curr) => {
      const match = curr.notes?.match(/Duration: (\d+) mins/);
      return acc + (match ? parseInt(match[1]) : 0);
  }, 0);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!topic) return;
    await db.ssb_activities.add({
      date: new Date().toISOString(), category: 'Defence Awareness', subCategory, title: topic,
      notes: `Duration: ${duration ? duration : '0'} mins. ${notes}`,
    });
    setTopic(''); setDuration(''); setNotes('');
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    await db.ssb_feedback.add({ category: 'Defence Awareness', date: new Date().toISOString(), text: feedbackText });
    setFeedbackText('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link to="/ssb" className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="text-army-500" size={28} /> Defence Awareness
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 text-sm font-bold uppercase">Topics Covered</p>
          <p className="text-3xl font-bold text-army-600 mt-1">{totalTopics}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 text-sm font-bold uppercase">Total Study Time</p>
          <p className="text-3xl font-bold text-army-600 mt-1">{Math.floor(totalMins/60)}h {totalMins%60}m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={20} className="text-army-500"/> Log Study Session</h3>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                  <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900">
                    <option value="Ranks & Commands">Ranks & Commands</option>
                    <option value="Missiles & Aircraft">Missiles & Aircraft</option>
                    <option value="Military Exercises">Military Exercises</option>
                    <option value="Defence Tech">Defence Tech</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Topic Name</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} required className="w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Mins Studied</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required className="w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900"/>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Key Takeaways</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2.5 rounded-lg border bg-gray-50 dark:bg-gray-900"/>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-army-600 hover:bg-army-700 text-white rounded-xl font-bold transition">Save Defence Log</button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Topic History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {activities.map(act => (
                <div key={act.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] bg-army-100 text-army-700 px-2 py-0.5 rounded-full font-bold">{act.subCategory}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white mt-1">{act.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{format(parseISO(act.date), 'MMM do, yyyy')}</p>
                  </div>
                  <button onClick={async () => { if(confirm('Delete?')) await db.ssb_activities.delete(act.id); }} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEEDBACK ENGINE */}
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-200 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-800"><MessageSquareWarning size={20} /> Master Feedback</h3>
            <form onSubmit={handleAddFeedback} className="mb-4 flex flex-col gap-2">
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="w-full p-3 rounded-xl border border-yellow-300 bg-white text-sm h-24"/>
              <button type="submit" disabled={!feedbackText.trim()} className="py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition">Save Feedback</button>
            </form>
            <div className="flex-1 overflow-y-auto space-y-3">
              {feedbacks.map(fb => (
                <div key={fb.id} className="bg-white p-3 rounded-xl border border-yellow-200 shadow-sm relative group">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{fb.text}</p>
                  <button onClick={async () => await db.ssb_feedback.delete(fb.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Defence;
