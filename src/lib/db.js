import Dexie from 'dexie';

export const db = new Dexie('CDSTrackerDB');

// Schema Definition
db.version(1).stores({
  subjects: '++id, name, color',
  subtopics: '++id, subjectId, title', 
  progress: '++id, subtopicId, subjectId', 
  sessions: '++id, subjectId, subtopicId, startTime, endTime, durationSeconds',
  tasks: '++id, date, title, isCompleted', // <--- ADD THIS LINE ONLY
  settings: 'key'
});

// Seed Data
const SEED_DATA = {
  subjects: [
    { id: 1, name: 'Mathematics', color: '#ef4444' }, // Red
    { id: 2, name: 'General Knowledge', color: '#3b82f6' }, // Blue
    { id: 3, name: 'English', color: '#10b981' } // Green
  ],
  subtopics: [
    // Math
    { subjectId: 1, title: 'Arithmetic' }, { subjectId: 1, title: 'Algebra' },
    { subjectId: 1, title: 'Trigonometry' }, { subjectId: 1, title: 'Geometry' },
    { subjectId: 1, title: 'Mensuration' }, { subjectId: 1, title: 'Number System' },
    { subjectId: 1, title: 'Statistics' }, { subjectId: 1, title: 'Time-Speed-Distance' },
    // GK
    { subjectId: 2, title: 'Indian Polity' }, { subjectId: 2, title: 'Indian Economy' },
    { subjectId: 2, title: 'Geography - Physical' }, { subjectId: 2, title: 'Modern History' },
    { subjectId: 2, title: 'Current Affairs' }, { subjectId: 2, title: 'Defence Awareness' },
    // English
    { subjectId: 3, title: 'Reading Comprehension' }, { subjectId: 3, title: 'Spotting Errors' },
    { subjectId: 3, title: 'Synonyms & Antonyms' }, { subjectId: 3, title: 'Idioms & Phrases' }
  ]
};

// Initialize DB
db.on('populate', () => {
  db.subjects.bulkAdd(SEED_DATA.subjects);
  db.subtopics.bulkAdd(SEED_DATA.subtopics);
});

// --- Cloud Hooks (Placeholders for future backend) ---
// export const syncToCloud = async () => { console.log("Cloud sync not implemented"); };
// export const fetchFromCloud = async () => { console.log("Cloud fetch not implemented"); };

// --- Export/Import Utilities ---
export const exportData = async () => {
  const allData = {
    timestamp: new Date().toISOString(),
    subjects: await db.subjects.toArray(),
    subtopics: await db.subtopics.toArray(),
    progress: await db.progress.toArray(),
    sessions: await db.sessions.toArray(),
  };
  const blob = new Blob([JSON.stringify(allData)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cds_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

export const importData = async (file) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      await db.transaction('rw', db.subjects, db.subtopics, db.progress, db.sessions, async () => {
        await db.subjects.clear(); await db.subjects.bulkAdd(data.subjects);
        await db.subtopics.clear(); await db.subtopics.bulkAdd(data.subtopics);
        await db.progress.clear(); await db.progress.bulkAdd(data.progress);
        await db.sessions.clear(); await db.sessions.bulkAdd(data.sessions);
      });
      window.location.reload();
    } catch (err) {
      alert("Invalid Backup File");
    }
  };
  reader.readAsText(file);
};
