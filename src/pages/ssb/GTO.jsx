import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Target, Plus, Trash2, Edit2, Check, MessageSquareWarning, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const GTO = () => {
  // --- STATE FOR ACTIVITY LOG ---
  const [subCategory, setSubCategory] = useState('GD');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // --- STATE FOR FEEDBACK ---
  const [feedbackText, setFeedbackText] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editFeedbackText, setEditFeedbackText] = useState('');

  // --- QUERIES ---
  const activities = useLiveQuery(() => db.ssb_activities.where('category').equals('GTO').reverse().toArray()) || [];
  const feedbacks = useLiveQuery(() => db.ssb_feedback.where('category').equals('GTO').reverse().toArray()) || [];

  // --- DERIVED STATS ---
  const stats = {
    GD: activities.filter(a => a.subCategory === 'GD').length,
    Lecturette: activities.filter(a => a.subCategory === 'Lecturette').length,
    Outdoor: activities.filter(a => a.subCategory === 'Outdoor Task').length,
  };

  // --- HANDLERS ---
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!topic) return;
    await db.ssb_activities.add({
      date: new Date().toISOString(),
      category: 'GTO',
      subCategory,
      title: topic,
      notes: `Duration: ${duration ? duration + ' mins' : 'N/A'}. ${notes}`,
    });
    setTopic('');
    setDuration('');
    setNotes('');
  };

  const handleDeleteActivity = async (id) => {
    if (confirm("Delete this practice log?")) await db.ssb_activities.delete(id);
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    await db.ssb_feedback.add({ category: 'GTO', date: new Date().toISOString(), text: feedbackText });
    setFeedbackText('');
  };

  const handleUpdateFeedback = async (id) => {
    await db.ssb_feedback.update(id, { text: editFeedbackText });
    setEditingFeedbackId(null);
  };

  const handleDeleteFeedback = async (id) => {
    if (confirm("Delete this feedback?")) await db.ssb_feedback.delete(id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link to="/ssb" className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="text-orange-500" size={28} /> GTO Tracker
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{key}</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVITY LOG */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={20} className="text-orange-500"/> Log GTO Practice</h3>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Task Type</label>
                  <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                    <option value="GD">Group Discussion</option>
                    <option value="Lecturette">Lecturette</option>
                    <option value="Outdoor Task">Outdoor Task (PGT/HGT/IO)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Topic / Task Name</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Brain Drain in India" required className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Duration (Mins)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"/>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Points / Observations</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Gave 3 valid points, but hesitated initially..." className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"/>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition">
                <Plus size={20} /> Save GTO Log
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold mb-4">GTO Practice History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {activities.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No tasks logged yet.</p>}
              {activities.map(act => (
                <div key={act.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full uppercase font-bold text-gray-600 dark:text-gray-300">{act.subCategory}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white mt-1">{act.title}</h4>
                    {act.notes && <p className="text-xs text-gray-500 mt-1 italic">{act.notes}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{format(parseISO(act.date), 'MMM do, yyyy')}</p>
                  </div>
                  <button onClick={() => handleDeleteActivity(act.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MASTER FEEDBACK */}
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-900/50 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-500">
              <MessageSquareWarning size={20} /> Master Feedback
            </h3>
            <p className="text-xs text-yellow-700/70 dark:text-yellow-500/70 mb-4">Log feedback regarding group dynamics, voice modulation, and logic.</p>
            <form onSubmit={handleAddFeedback} className="mb-4 flex flex-col gap-2">
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="e.g. Need to project voice louder in GDs..." className="w-full p-3 rounded-xl border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-gray-800 text-sm resize-none h-24 focus:ring-2 focus:ring-yellow-500 focus:outline-none"/>
              <button type="submit" disabled={!feedbackText.trim()} className="py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition">Save Feedback</button>
            </form>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {feedbacks.map(fb => (
                <div key={fb.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm relative group">
                  {editingFeedbackId === fb.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea value={editFeedbackText} onChange={(e) => setEditFeedbackText(e.target.value)} className="w-full p-2 text-sm border rounded bg-gray-50 dark:bg-gray-900" />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateFeedback(fb.id)} className="p-1 text-green-600 bg-green-100 rounded"><Check size={14}/></button>
                        <button onClick={() => setEditingFeedbackId(null)} className="p-1 text-gray-600 bg-gray-200 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{fb.text}</p>
                      <p className="text-[10px] text-yellow-600/60 dark:text-yellow-500/60 mt-2">{format(parseISO(fb.date), 'MMM do, yyyy')}</p>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200">
                        <button onClick={() => { setEditingFeedbackId(fb.id); setEditFeedbackText(fb.text); }} className="p-1 text-gray-500 hover:text-blue-500"><Edit2 size={12}/></button>
                        <button onClick={() => handleDeleteFeedback(fb.id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={12}/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GTO;
