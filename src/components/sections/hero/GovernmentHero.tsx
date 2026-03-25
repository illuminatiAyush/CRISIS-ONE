import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const GovernmentHero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Subtle background gradient / radial blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Optional grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:[mask-image:linear-gradient(180deg,black,rgba(0,0,0,0))] opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start justify-center text-left">
        
        {/* Subtext Tag */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-500" />
          </span>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-widest">
            {t("hero.badge")}
          </span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6 max-w-4xl">
          {t("hero.title1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">{t("hero.title2")}</span>
        </h1>

        {/* Supporting Subtext */}
        <p className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Primary CTA */}
          <Link
            href="/report"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {t("hero.cta_report")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          {/* Secondary Ghost Button */}
          <Link
            href="/mvp"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2"
          >
            {t("hero.cta_dashboard")}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GovernmentHero;
