# 🧠 Fehrist

**Fehrist** is an AI-powered to-do and focus application designed to help users plan, organize, and complete tasks through guided, distraction-free sessions.

Built around the principles of simplicity and focus, Fehrist uses rule-based AI logic to transform everyday task lists into actionable, balanced plans — helping users start easy, stay consistent, and finish strong.

---

## ✨ Core Features

- **Task Management** — Add, edit, and delete lightweight tasks with minimal details.  
- **AI-Generated Plans** — Automatically order tasks based on difficulty, priority, and energy balance.  
- **Focus Sessions** — Work through your plan one step at a time with an integrated timer.  
- **Explainable AI** — Every plan comes with a short paragraph explaining its reasoning.  
- **Guest or Logged-In Use** — Continue as a guest or log in with Google/Apple to save data.  
- **Minimal Interface** — Designed to promote flow and reduce cognitive load.  
- **Dark Mode** — Optional focus-friendly theme for long sessions.

---

## 🧰 Tech Stack

### Frontend
- **Next.js (TypeScript)** – Modern React framework for app and routing.  
- **Tailwind CSS + shadcn/ui** – Styled, accessible components.  
- **Zustand** – Lightweight state management (for session and task states).  
- **Framer Motion** – Smooth micro-animations for transitions.  
- **Supabase Auth SDK** – Google and Apple SSO authentication.  
- **Deployment:** Vercel (`fehrist.app`)

### Backend
- **FastAPI (Python 3.11)** – High-performance API framework.  
- **SQLModel + PostgreSQL (Supabase)** – ORM and managed database.  
- **pydantic-settings** – Environment and config management.  
- **AI Logic (Rule-Based)** – Symbolic planner in `ai_service.py`.  
- **Deployment:** Render (Web Service, auto-kept alive by UptimeRobot)

### Infrastructure
- **Supabase** – Auth + managed PostgreSQL database.  
- **CI/CD** – GitHub Actions (linting, type checks).  
- **Monitoring** – Render logs + Supabase dashboard.

---

## 🚀 Project Goals

- Simplify productivity — no complex projects or boards.
- Keep users in flow — one task at a time.
- Explain the “why” — every plan is transparent.
- End sessions cleanly — progress is emphasized, not history.

---

## 🧩 Future Enhancements

- Productivity analytics  
- Smart reminders  
- Voice input  
- Offline sync  

---

**Fehrist** – *Plan simply. Focus deeply.*