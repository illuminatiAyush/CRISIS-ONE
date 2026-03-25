import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const GovernmentFooter = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Column 1: Brand & Address */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-serif font-bold text-white mb-4">CrisisOne</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {t("footer.initiative")}
                        </p>
                        <div className="pt-4 space-y-2 text-sm">
                            <div className="flex items-start">
                                <MapPin size={16} className="mr-2 mt-0.5 text-blue-500 shrink-0" />
                                <span>Mumbai, Maharashtra</span>
                            </div>
                            <div className="flex items-center">
                                <Mail size={16} className="mr-2 text-blue-500 shrink-0" />
                                <a href="mailto:contact@crisisone.gov.in" className="hover:text-white transition-colors">contact@crisisone.gov.in</a>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links (Citizen Corner) */}
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 border-b border-slate-800 pb-2 inline-block">
                            {t("footer.citizen_corner")}
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/register" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.register_complaint")}</Link></li>
                            <li><Link href="/track" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.track_status")}</Link></li>
                            <li><Link href="/feedback" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.feedback")}</Link></li>
                            <li><Link href="/faq" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.faq")}</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Compliance & Policy */}
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 border-b border-slate-800 pb-2 inline-block">
                            {t("footer.compliance")}
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/rti" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.rti")}</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.privacy")}</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.terms")}</Link></li>
                            <li><Link href="/sitemap" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span>{t("footer.sitemap")}</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Helpline Card */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h4 className="text-white font-bold mb-2">{t("footer.helpline")}</h4>
                        <p className="text-xs text-slate-400 mb-4">{t("footer.assistance")}</p>
                        <div className="flex items-center space-x-3 text-2xl font-bold text-white font-mono">
                            <Phone className="text-blue-500 text-xl" />
                            <span>1800-11-2025</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center border-t border-slate-700 pt-2 uppercase tracking-widest">{t("footer.toll_free")}</p>
                    </div>

                </div>


                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>{t("footer.copyright")} {t("footer.owned_by")}</p>
                    <div className="mt-2 md:mt-0 flex items-center space-x-2">
                        <span>{t("footer.last_updated")}: <span className="text-slate-400">March 25, 2025</span></span>
                        <span>•</span>
                        <span>{t("footer.visitor_count")}: <span className="text-slate-400 font-mono">24,582,109</span></span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default GovernmentFooter;
