import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Users, Plus, Trash2, Edit2, Check, MessageSquareWarning, HelpCircle, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Interview = () => {
  // --- STATE FOR Q&A BANK ---
  const [topicCategory, setTopicCategory] = useState('Personal/Family');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingQAId, setEditingQAId] = useState(null);
  const [editAnswer, setEditAnswer] = useState('');
  
  // --- STATE FOR FILTERING ---
  const [filterCategory, setFilterCategory] = useState('All');

  // --- STATE FOR FEEDBACK ---
  const [feedbackText, setFeedbackText] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editFeedbackText, setEditFeedbackText] = useState('');

  // --- QUERIES ---
  const qaBank = useLiveQuery(() => db.ssb_io_prep.where('type').equals('QA').reverse().toArray()) || [];
  const feedbacks = useLiveQuery(() => db.ssb_feedback.where('category').equals('IO').reverse().toArray()) || [];

  // --- DYNAMIC CATEGORIES ---
  // Combine default categories with any custom ones saved in the database
  const defaultCategories = [
    'Personal/Family', 'Education', 'Hobbies/Interests', 
    'Achievements', 'Strengths/Weaknesses', 'Defence/Current Affairs'
  ];
  const allCategories = Array.from(new Set([...defaultCategories, ...qaBank.map(qa => qa.topicCategory)]));

  // --- FILTER LOGIC ---
  const filteredQABank = filterCategory === 'All' 
    ? qaBank 
    : qaBank.filter(qa => qa.topicCategory === filterCategory);

  // --- HANDLERS FOR Q&A ---
  const handleAddQA = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    // Determine the final category to save
    const finalCategory = isCustomCategory ? customCategoryInput.trim() : topicCategory;
    if (!finalCategory) return;

    await db.ssb_io_prep.add({
      type: 'QA',
      topicCategory: finalCategory,
      question,
      answer,
      date: new Date().toISOString()
    });
    
    // Reset form
    setQuestion('');
    setAnswer('');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setTopicCategory(finalCategory); // Set the dropdown back to whatever they just added/used
  };

  const handleUpdateQA = async (id) => {
    await db.ssb_io_prep.update(id, { answer: editAnswer });
    setEditingQAId(null);
  };

  const handleDeleteQA = async (id) => {
    if (confirm("Delete this Q&A?")) await db.ssb_io_prep.delete(id);
  };

  // --- HANDLERS FOR FEEDBACK ---
  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    await db.ssb_feedback.add({ category: 'IO', date: new Date().toISOString(), text: feedbackText });
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
            <Users className="text-blue-500" size={28} /> Interview Prep (IO)
          </h1>
        </div>
      </div>
        <Link to="/ssb/piq" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-sm">
           <FileText size={18} /> Open Master PIQ
        </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PIQ & Q&A BANK */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><HelpCircle size={20} className="text-blue-500"/> Draft PIQ Answers</h3>
            <form onSubmit={handleAddQA} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* DYNAMIC CATEGORY SELECTOR */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">PIQ Category</label>
                  {isCustomCategory ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={customCategoryInput} 
                        onChange={e => setCustomCategoryInput(e.target.value)} 
                        placeholder="Type new category name..." 
                        required 
                        className="w-full p-2.5 rounded-lg border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        type="button" 
                        onClick={() => { setIsCustomCategory(false); setCustomCategoryInput(''); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <select 
                      value={topicCategory} 
                      onChange={e => {
                        if (e.target.value === 'CUSTOM') setIsCustomCategory(true);
                        else setTopicCategory(e.target.value);
                      }} 
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                    >
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="CUSTOM" className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30">
                        + Add Custom Category...
                      </option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Anticipated Question</label>
                  <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. Why did your marks drop in 12th?" required className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Your Drafted Answer / Bullet Points</label>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Draft an honest, convincing answer..." className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 h-24 resize-none"/>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition">
                <Plus size={20} /> Add to Q&A Bank
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            {/* UPDATED HEADER WITH DYNAMIC FILTER DROPDOWN */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-lg font-bold">My Interview Q&A Bank</h3>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                <Filter size={14} className="text-gray-400" />
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-blue-600 dark:text-blue-400 outline-none cursor-pointer py-1"
                >
                  <option value="All">All Categories (Recent First)</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {filteredQABank.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                  {filterCategory === 'All' ? 'No questions drafted yet.' : `No questions drafted for ${filterCategory} yet.`}
                </p>
              )}
              {filteredQABank.map(qa => (
                <div key={qa.id} className="bg-blue-50/50 dark:bg-gray-900 p-4 rounded-xl border border-blue-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-1 rounded uppercase font-bold">{qa.topicCategory}</span>
                      <h4 className="font-bold text-gray-900 dark:text-white mt-2">Q: {qa.question}</h4>
                    </div>
                    <button onClick={() => handleDeleteQA(qa.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                  
                  {editingQAId === qa.id ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 h-24" />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateQA(qa.id)} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-bold">Save</button>
                        <button onClick={() => setEditingQAId(null)} className="px-3 py-1 bg-gray-300 text-black rounded text-xs font-bold">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 relative group">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"><span className="font-bold text-gray-900 dark:text-gray-400">Ans:</span> {qa.answer || "No answer drafted yet."}</p>
                      <button onClick={() => { setEditingQAId(qa.id); setEditAnswer(qa.answer); }} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-blue-500 p-1 bg-white dark:bg-gray-800 rounded shadow border"><Edit2 size={14}/></button>
                    </div>
                  )}
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
            <p className="text-xs text-yellow-700/70 dark:text-yellow-500/70 mb-4">Log feedback from Mock Interviews or self-analysis.</p>
            <form onSubmit={handleAddFeedback} className="mb-4 flex flex-col gap-2">
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="e.g. Need to smile more when answering stressful questions..." className="w-full p-3 rounded-xl border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-gray-800 text-sm resize-none h-24 focus:ring-2 focus:ring-yellow-500 focus:outline-none"/>
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

export default Interview;
