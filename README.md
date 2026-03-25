# 🛡️ CrisisOne: Global Disaster Response & Unified Civic Platform

**CrisisOne** is a mission-critical, production-grade disaster management ecosystem designed for rapid humanitarian response, government transparency, and inclusive civic engagement. Built to bridge the communication gap during emergencies, the platform provides a unified command-and-control interface for authorities while ensuring that even those with accessibility needs or language barriers stay informed.

---

## 🎨 Design Philosophy
CrisisOne adheres to a **Premium, High-Contrast, and Performance-First** aesthetic. 
- **Modern UI**: Leveraging Glassmorphism, subtle micro-animations (Framer Motion), and a curated harmonious color palette.
- **Extreme Inclusivity**: Real-time accessibility controls that transform the entire application's UX instantly.
- **Multilingual Excellence**: A first-class i18n system ensuring "Zero English Overlap" when Marathi or Hindi are selected.

---

## 🌎 Internationalization (i18n) & Regional Reach
CrisisOne is engineered for global scale but localized for the heart of India.
- **Supported Languages**: 🌍 **English**, 🇮🇳 **Hindi**, 🚩 **Marathi**.
- **Unified Logic**: Context-driven language switching that updates the **Navbar, Sidebar, Dashboard Stats, Forms, Tooltips, and Live Tickers** simultaneously.
- **Zero-Bypass i18n**: No hardcoded strings. Every piece of text is mapped via unique JSON keys (`locales/en.json`, `hi.json`, `mr.json`).

---

## ♿ Global Accessibility (a11y) & UX Unification
A dedicated **Accessibility Panel** (floating glassmorphic component) allows users to customize their experience globally:
- **High Contrast Mode**: Enhances readability for visually impaired users.
- **Text Scaling**: Interactive scaling from Small to Large across all UI components.
- **Reduced Motion**: Disables non-essential animations for users with vestibular sensitivities.
- **Unified Theme Control**: Instant Dark/Light mode toggle that persists across sessions via `localStorage`.

---

## 🏗️ Architecture & Technology Stack

### 🚀 Frontend
- **Next.js 16 (App Router)**: Utilizing server-side rendering for speed and security.
- **TypeScript**: Ensuring type safety across complex data flows.
- **Tailwind CSS + CSS Variables**: A robust design system using global tokens for instant theme/a11y switching.
- **Framer Motion**: Smooth transitions and micro-interactions.
- **Lucide & Iconify**: A comprehensive, consistent icon library.

### 🛡️ State & Backend
- **Redux Toolkit**: Centralized state management for authentication, user profiles, and incident data.
- **React Context API**: Lightweight persistence for Language, Theme, and Accessibility settings.
- **Supabase (PostgreSQL + Auth)**: Enterprise-grade database with real-time capabilities and secure authentication.
- **Axios**: Interceptor-based API communication.

### 📊 Intelligence Engine
- **Priority Scoring**: Automatic severity calculation (Low, Medium, High, Critical) based on incident type and impact.
- **Resource Routing**: Logic for agency dispatching and volunteer coordination.

---

## 🔑 Role-Based Access Control (RBAC)
CrisisOne provides 5 distinct personas, each with a tailored dashboard:

| Role | Responsibility | Key Features |
| :--- | :--- | :--- |
| **🛡️ Admin** | System Governance | Performance analytics, sub-admin management, global monitoring. |
| **🚨 Agency** | Emergency Dispatch | Real-time incident response, unit deployment, rescue tracking. |
| **🤝 Volunteer** | Ground Support | Task acceptance, resource distribution, community reporting. |
| **📡 Coordinator** | Information Hub | Strategic resource allocation, agency-volunteer bridging. |
| **👤 Citizen** | Reporting & Safety | High-speed incident reporting, life-safety alerts, status tracking. |

---

## 📁 System Blueprint (`/src`)
```bash
src/
├── app/             # App Router: API routes, pages, and layouts
├── components/      # UI Components (Atomic Design: common, dashboard, auth)
├── contexts/        # Global State: Theme, Language, Accessibility
├── data/            # Static constants and mock datasets
├── hooks/           # Custom React hooks (useLanguage, useTheme)
├── i18n/            # Localization dictionary (EN, HI, MR JSON files)
├── lib/             # Third-party configs (Supabase, Redux setup)
├── store/           # Redux slices (auth, incidents, etc.)
├── types/           # Global TypeScript interfaces
└── templates/       # Redux/Component boilerplate generators
```

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/your-repo/CrisisOne.git
cd CrisisOne
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-app-password
```

### 3. Smooth Testing Flow 🧪
CrisisOne includes a **Smart Testing Bypass** to facilitate rapid evaluation across roles without needing manual database setup or real emails:
- **Role-Specific Emails**: The login form pre-fills unique emails per role (e.g., `admin@CrisisOne.com`, `citizen@CrisisOne.com`).
- **Demo Credentials**: User any password (e.g., `123`) to log in.
- **Gmail Bypass**: Any email ending in `@gmail.com` will trigger an auto-verified test profile creation.

---

## 🛠️ Recent Performance & UX Optimizations
- **In-Memory Testing Loop**: Both `/api/auth/login` and `/api/auth/me` operate on a zero-database-hit logic for test users, preventing 500 errors if service roles are unconfigured.
- **Accessibility Sync**: The `AccessibilityPanel` is now fully integrated with the `ThemeContext`, ensuring a single "Source of Truth" for visual state.
- **Dynamic Localization**: Ticker alerts and dashboard statistics now pull directly from the i18n context, updating in real-time without page refreshes.

---
**CrisisOne** — *Ensuring Rapid Response, Powered by Inclusive Intelligence.*
