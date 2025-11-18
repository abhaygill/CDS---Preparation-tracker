import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

const Progress = () => {
  const subjects = useLiveQuery(() => db.subjects.toArray());
  const subtopics = useLiveQuery(() => db.subtopics.toArray());
  const progressList = useLiveQuery(() => db.progress.toArray());

  const [expandedSubject, setExpandedSubject] = useState(1); 
  const [newTopicName, setNewTopicName] = useState('');
  const [addingToSubject, setAddingToSubject] = useState(null);

  const toggleProgress = async (subtopicId, field, currentValue) => {
    const existing = progressList.find(p => p.subtopicId === subtopicId);
    
    // Haptic feedback for mobile (if supported)
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(5); 
    }

    if (existing) {
      await db.progress.update(existing.id, { [field]: !currentValue });
    } else {
      const subtopic = subtopics.find(s => s.id === subtopicId);
      await db.progress.add({
        subtopicId,
        subjectId: subtopic.subjectId,
        topicCompleted: false, revision1: false, revision2: false, pyqDone: false, finalRevision: false,
        [field]: true 
      });
    }
  };

  const handleAddSubtopic = async (subjectId) => {
    if (!newTopicName.trim()) return;
    await db.subtopics.add({ subjectId, title: newTopicName });
    setNewTopicName('');
    setAddingToSubject(null);
  };

  const deleteSubtopic = async (id) => {
    if(confirm("Delete this subtopic? This cannot be undone.")){
        await db.subtopics.delete(id);
        const p = progressList.find(x => x.subtopicId === id);
        if(p) await db.progress.delete(p.id);
    }
  }

  // Column Headers mapping for cleaner mobile view
  const COLUMNS = [
    { key: 'topicCompleted', label: 'Done' },
    { key: 'revision1', label: 'R1' },
    { key: 'revision2', label: 'R2' },
    { key: 'pyqDone', label: 'PYQ' },
    { key: 'finalRevision', label: 'Final' },
  ];

  return (
    <div className="space-y-6 pb-24"> {/* Added extra padding at bottom for mobile nav */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Syllabus Progress</h2>
      </div>

      {subjects?.map(subject => {
        const subjectSubtopics = subtopics?.filter(s => s.subjectId === subject.id) || [];
        const isExpanded = expandedSubject === subject.id;

        // Progress Calculation
        let totalChecks = subjectSubtopics.length * 5;
        let earnedChecks = 0;
        subjectSubtopics.forEach(s => {
            const p = progressList?.find(x => x.subtopicId === s.id);
            if(p) {
                if(p.topicCompleted) earnedChecks++;
                if(p.revision1) earnedChecks++;
                if(p.revision2) earnedChecks++;
                if(p.pyqDone) earnedChecks++;
                if(p.finalRevision) earnedChecks++;
            }
        });
        const percent = totalChecks === 0 ? 0 : Math.round((earnedChecks / totalChecks) * 100);

        return (
          <div key={subject.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Subject Header - Click to Expand */}
            <div 
              onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition active:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                <h3 className="text-lg font-semibold" style={{color: subject.color}}>{subject.name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-army-500" style={{width: `${percent}%`}}></div>
                </div>
                <span className="text-sm font-mono w-10 text-right">{percent}%</span>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]"> {/* Reduced min-width for better fit */}
                    <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 font-medium">
                      <tr>
                        <th className="px-4 py-3 text-left w-1/3 sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Subtopic</th>
                        {COLUMNS.map(col => (
                            <th key={col.key} className="px-2 py-3 text-center w-12">{col.label}</th>
                        ))}
                        <th className="px-2 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {subjectSubtopics.map(sub => {
                        const p = progressList?.find(x => x.subtopicId === sub.id) || {};
                        return (
                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                            {/* Sticky Column Name */}
                            <td className="px-4 py-4 font-medium text-sm sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                {sub.title}
                            </td>
                            
                            {/* BIGGER TOUCH TARGETS */}
                            {COLUMNS.map(col => (
                              <td 
                                key={col.key} 
                                className="px-1 py-2 text-center cursor-pointer touch-manipulation active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                                onClick={() => toggleProgress(sub.id, col.key, p[col.key])}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                    <input 
                                    type="checkbox" 
                                    checked={!!p[col.key]}
                                    readOnly // We handle click on the TD, so input is readonly
                                    className="w-6 h-6 text-army-500 rounded focus:ring-army-500 border-gray-300 pointer-events-none" 
                                    />
                                </div>
                              </td>
                            ))}

                            <td className="px-2 py-3 text-center">
                                <button onClick={() => deleteSubtopic(sub.id)} className="p-2 text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Subtopic Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    {addingToSubject === subject.id ? (
                        <div className="flex gap-2 flex-col md:flex-row">
                            <input 
                                autoFocus
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                placeholder="Enter subtopic name..." 
                                className="flex-1 p-3 md:p-2 border rounded-lg bg-white dark:bg-gray-800 text-base"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtopic(subject.id)}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => handleAddSubtopic(subject.id)} className="flex-1 px-4 py-2 bg-army-500 text-white rounded-lg">Add</button>
                                <button onClick={() => setAddingToSubject(null)} className="px-4 py-2 text-gray-500">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setAddingToSubject(subject.id)} className="flex items-center gap-2 text-sm text-army-500 font-medium hover:text-army-700 py-2">
                            <Plus size={18} /> Add Subtopic
                        </button>
                    )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Progress;
