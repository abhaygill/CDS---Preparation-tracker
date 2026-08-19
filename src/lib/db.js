import Dexie from 'dexie';

export const db = new Dexie('CDSTrackerDB');

// --- VERSION 1 (Keep exactly as it was for upgrade compatibility) ---
db.version(1).stores({
  subjects: '++id, name, color',
  subtopics: '++id, subjectId, title', 
  progress: '++id, subtopicId, subjectId', 
  sessions: '++id, subjectId, subtopicId, startTime, endTime, durationSeconds',
  tasks: '++id, date, title, isCompleted',
  settings: 'key'
});

// --- VERSION 2 (Added SSB tracking tables) ---
db.version(4).stores({
  subjects: '++id, name, color',
  subtopics: '++id, subjectId, title', 
  progress: '++id, subtopicId, subjectId', 
  sessions: '++id, subjectId, subtopicId, startTime, endTime, durationSeconds',
  tasks: '++id, date, title, isCompleted',
  settings: 'key',
  
  // --- NEW SSB TABLES ---
  ssb_activities: '++id, date, category, subCategory, title', 
  ssb_feedback: '++id, category, date', 
  ssb_io_prep: '++id, type',
  ssb_piq: 'id'
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

// --- Export/Import Utilities (UPDATED to include Tasks & SSB) ---
export const exportData = async () => {
  const allData = {
    timestamp: new Date().toISOString(),
    subjects: await db.subjects.toArray(),
    subtopics: await db.subtopics.toArray(),
    progress: await db.progress.toArray(),
    sessions: await db.sessions.toArray(),
    tasks: await db.tasks.toArray(), // Fixed: Added tasks
    ssb_activities: await db.ssb_activities.toArray(), // Added SSB
    ssb_feedback: await db.ssb_feedback.toArray(),     // Added SSB
    ssb_io_prep: await db.ssb_io_prep.toArray(), 
    ssb_piq: await db.ssb_piq.toArray(),// Added SSB
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
      
      // Define all tables we are writing to
      const tables = [
        db.subjects, db.subtopics, db.progress, db.sessions, db.tasks,
        db.ssb_activities, db.ssb_feedback, db.ssb_io_prep, db.ssb_piq
      ];
      
      await db.transaction('rw', tables, async () => {
        if(data.subjects) { await db.subjects.clear(); await db.subjects.bulkAdd(data.subjects); }
        if(data.subtopics) { await db.subtopics.clear(); await db.subtopics.bulkAdd(data.subtopics); }
        if(data.progress) { await db.progress.clear(); await db.progress.bulkAdd(data.progress); }
        if(data.sessions) { await db.sessions.clear(); await db.sessions.bulkAdd(data.sessions); }
        if(data.tasks) { await db.tasks.clear(); await db.tasks.bulkAdd(data.tasks); }
        
        if(data.ssb_activities) { await db.ssb_activities.clear(); await db.ssb_activities.bulkAdd(data.ssb_activities); }
        if(data.ssb_feedback) { await db.ssb_feedback.clear(); await db.ssb_feedback.bulkAdd(data.ssb_feedback); }
        if(data.ssb_io_prep) { await db.ssb_io_prep.clear(); await db.ssb_io_prep.bulkAdd(data.ssb_io_prep); }
        if(data.ssb_piq) { await db.ssb_piq.clear(); await db.ssb_piq.bulkAdd(data.ssb_piq); }
      });
      window.location.reload();
    } catch (err) {
      alert("Invalid Backup File");
      console.error(err);
    }
  };
  reader.readAsText(file);
};
