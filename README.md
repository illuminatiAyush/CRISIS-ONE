# CrisisOne 🛡️

**CrisisOne** is a production-grade, minimal crisis-tech platform built for rapid disaster response and civilian safety. It provides real-time reporting, agency coordination, and intelligent resource management.

## 🚀 Key Features

- **Crisis Intelligence & Priority Scoring**: Automatic severity analysis and routing.
- **Agency Assignment**: Haversine-based smart routing to the nearest responders.
- **Multilingual Support**: Available in English, Hindi, and Marathi.
- **Global Accessibility**: WCAG-compliant high-contrast, motion-reduction, and font-scaling controls.
- **Real-time Map**: Heatmaps and radius-based alerts for actionable intelligence.

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Realtime, Auth)
- **Analytics**: Crisis Engine (Priority Scoring & Clustering)
- **State Management**: Redux Toolkit & React Context

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Create a `.env` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Dashboard**:
   Open `http://localhost:3000` in your browser.

## 🎯 Hackathon Deployment

CrisisOne is designed for hackathon excellence with pre-filled demo credentials and evaluator-optimized UI paths. Use the **Accessibility Panel** (bottom right) to see the platform's inclusivity in action.
