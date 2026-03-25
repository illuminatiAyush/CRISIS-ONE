"use client";

import GovernmentHeader from "@/components/sections/header/GovernmentHeader";
import GovernmentHero from "@/components/sections/hero/GovernmentHero";
import FeaturesSection from "@/components/sections/features/FeaturesSection";
import GovernmentFooter from "@/components/sections/footer/GovernmentFooter";

const HomePage = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors">
      <GovernmentHeader />
      <main>
        <GovernmentHero />
        <FeaturesSection />
      </main>
      <GovernmentFooter />
    </div>
  );
};

export default HomePage;
