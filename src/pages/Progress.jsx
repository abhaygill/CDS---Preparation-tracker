import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

const Progress = () => {
  const subjects = useLiveQuery(() => db.subjects.toArray());
  const subtopics = useLiveQuery(() => db.subtopics.toArray());
  const progressList = useLiveQuery(() => db.progress.toArray());

  const [expandedSubject, setExpandedSubject] = useState(1); // Default expand Math
  const [newTopicName, setNewTopicName] = useState('');
  const [addingToSubject, setAddingToSubject] = useState(null);

  // Toggle Checkbox Logic
  const toggleProgress = async (subtopicId, field, currentValue) => {
    const existing = progressList.find(p => p.subtopicId === subtopicId);
    if (existing) {
      await db.progress.update(existing.id, { [field]: !currentValue });
    } else {
      // Create new progress record if doesn't exist
      const subtopic = subtopics.find(s => s.id === subtopicId);
      await db.progress.add({
        subtopicId,
        subjectId: subtopic.subjectId,
        topicCompleted: false, revision1: false, revision2: false, pyqDone: false, finalRevision: false,
        [field]: true // Set the clicked one to true
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
        // cleanup progress
        const p = progressList.find(x => x.subtopicId === id);
        if(p) await db.progress.delete(p.id);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Syllabus Progress</h2>
      </div>

      {subjects?.map(subject => {
        const subjectSubtopics = subtopics?.filter(s => s.subjectId === subject.id) || [];
        const isExpanded = expandedSubject === subject.id;

        // Calculate subject %
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
            <div 
              onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                <h3 className="text-lg font-semibold" style={{color: subject.color}}>{subject.name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full bg-army-500" style={{width: `${percent}%`}}></div>
                </div>
                <span className="text-sm font-mono w-10">{percent}%</span>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 font-medium">
                      <tr>
                        <th className="px-6 py-3 text-left w-1/3">Subtopic</th>
                        <th className="px-4 py-3 text-center">Topic Done</th>
                        <th className="px-4 py-3 text-center">Rev 1</th>
                        <th className="px-4 py-3 text-center">Rev 2</th>
                        <th className="px-4 py-3 text-center">PYQs</th>
                        <th className="px-4 py-3 text-center">Final</th>
                        <th className="px-4 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {subjectSubtopics.map(sub => {
                        const p = progressList?.find(x => x.subtopicId === sub.id) || {};
                        return (
                          // FIXED: Dark mode hover is now gray-700/50 instead of invalid gray-750
                          // This ensures white text stays visible on dark background
                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-sm">{sub.title}</td>
                            {['topicCompleted', 'revision1', 'revision2', 'pyqDone', 'finalRevision'].map(field => (
                              <td key={field} className="px-4 py-3 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={!!p[field]}
                                  onChange={() => toggleProgress(sub.id, field, p[field])}
                                  className="w-5 h-5 text-army-500 rounded focus:ring-army-500 border-gray-300 cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                                <button onClick={() => deleteSubtopic(sub.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={16} />
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
                        <div className="flex gap-2 max-w-md">
                            <input 
                                autoFocus
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                placeholder="Enter subtopic name..." 
                                className="flex-1 p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtopic(subject.id)}
                            />
                            <button onClick={() => handleAddSubtopic(subject.id)} className="px-4 py-2 bg-army-500 text-white rounded">Add</button>
                            <button onClick={() => setAddingToSubject(null)} className="px-4 py-2 text-gray-500">Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setAddingToSubject(subject.id)} className="flex items-center gap-2 text-sm text-army-500 font-medium hover:text-army-700">
                            <Plus size={16} /> Add Subtopic
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
