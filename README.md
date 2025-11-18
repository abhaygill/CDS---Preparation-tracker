# 🎯 CDS Preparation Tracker

A production-ready, **Offline-First** Progressive Web Application (PWA) designed to help aspirants prepare for the **Combined Defence Services (CDS)** examination.

Built with **React**, **Vite**, and **IndexedDB**, this app provides a robust study ecosystem without requiring an internet connection or a backend server.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Dexie.js-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🚀 Key Features

### 📊 Mission Dashboard
- **Real-time Analytics:** Tracks total study hours, daily streaks, and syllabus completion percentage.
- **Visual Charts:** Weekly study trends and activity logging.
- **Quick Actions:** Immediate access to timer and data management.

### ⏱️ Tactical Study Timer
- **Resilient Timer:** Continues tracking even if the browser tab is closed or refreshed (uses timestamp deltas).
- **Modes:** Supports Pomodoro, Deep Work, and Custom sessions.
- **Session Logging:** automatically saves duration, subject, and subtopic to the local database.

### ✅ Syllabus Tracker (CDS Specific)
- **Pre-Seeded Data:** Comes loaded with standard CDS topics (Maths, English, GK).
- **Granular Progress:** Track 5 stages per topic: *Topic Completed → Rev 1 → Rev 2 → PYQs → Final Revision*.
- **Dynamic Management:** Add, rename, or delete subtopics as per your study plan.

### 🔒 Data Privacy & Persistence
- **Offline-First:** All data is stored locally in the browser using **IndexedDB** (via Dexie.js).
- **Zero Latency:** No server round-trips; instant UI updates.
- **Data Portability:** Full JSON **Export/Import** functionality to backup data or move it between devices.

---

## 🛠️ Tech Stack

* **Frontend Framework:** [React](https://reactjs.org/) (Vite)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Dark Mode enabled)
* **Local Database:** [Dexie.js](https://dexie.org/) (Wrapper for IndexedDB)
* **Charts:** [Recharts](https://recharts.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Routing:** React Router DOM

---

## 💻 Installation & Setup

Clone the repository and install dependencies:

```bash
# 1. Clone the repo
git clone [https://github.com/your-username/cds-tracker.git](https://github.com/your-username/cds-tracker.git)

# 2. Navigate to directory
cd cds-tracker

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev
