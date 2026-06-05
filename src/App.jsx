// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudyTimer from './pages/StudyTimer';
import Progress from './pages/Progress';
import Tasks from './pages/Tasks';
import SSBDashboard from './pages/SSBDashboard'; // <-- ADD THIS IMPORT
import Psychology from './pages/ssb/Psychology';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timer" element={<StudyTimer />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/ssb" element={<SSBDashboard />} /> {/* <-- ADD THIS ROUTE */}
          <Route path="/ssb/psychology" element={<Psychology />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
