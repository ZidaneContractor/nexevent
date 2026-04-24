NexEvent
NexEvent is a centralized campus ecosystem designed to bridge the gap between student engagement and administrative management. It replaces scattered social media announcements and manual paperwork with a streamlined, data-driven platform.

📌 The Problem
Information Fragmentation: Events are lost in the "noise" of WhatsApp and Instagram.

Proxy Attendance: Manual sign-in sheets are easily "gamed" by students.

Admin Burden: Club organizers waste hours manually creating participation reports for faculty approval.

✨ Key Features
Unified Event Feed: A single, searchable "Source of Truth" for all campus activities (Technical, Cultural, Sports).

Geofenced QR Check-in: A secure "Self-Check-in" system where students scan an event-side QR code. Location-based validation ensures students are physically present.

Automated PDF Reporting: One-click generation of participation reports, formatted for college administrative requirements.

Organizer Dashboard: A private workspace for club leads to manage registrations, view live attendance analytics, and export data.

🛠️ Tech Stack
Frontend: Next.js (App Router, TypeScript)

Styling: Tailwind CSS

Backend & Database: Supabase (PostgreSQL, Auth, Storage)

Validation: Browser Geolocation API + Haversine Distance Logic

🚀 Getting Started
First, clone the repository:

Bash
git clone https://github.com/ZidaneContractor/nexevent.git
Install dependencies:

Bash
npm install
Run the development server:

Bash
npm run dev
Open http://localhost:3000 with your browser to see the result.

🗺️ Roadmap
[ ] Setup Supabase Schema (Events, Users, Attendance)

[ ] Build Home Page Event Feed

[ ] Implement Geofencing Validation Logic

[ ] Develop PDF Export Functionality

[ ] Launch "Organizer Mode" for Club Leads
