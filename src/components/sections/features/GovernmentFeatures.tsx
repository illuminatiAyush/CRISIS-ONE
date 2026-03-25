"use client";

import React from "react";
import { AlertTriangle, BarChart3, Users, FileText, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import Link from "next/link";

const FeatureCard = ({ icon: Icon, title, desc, link, colorClass }: any) => (
    <Link href={link || "#"} className="group block bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-blue-400 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
        <div className="flex items-start space-x-4 relative z-10">
            <div className={`p-3 rounded-md ${colorClass} bg-opacity-10 text-opacity-100 shrink-0`}>
                <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-blue-800 transition-colors">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{desc}</p>
                <div className="text-xs font-semibold text-blue-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity -ml-1">
                    <span className="mr-1">Access Service</span>
                    <ArrowRight size={12} />
                </div>
            </div>
        </div>
    </Link>
);

const GovernmentFeatures = () => {
    return (
        <section className="py-16 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 font-serif">
                        Citizen Services & Tools
                    </h2>
                    <p className="text-slate-500 text-sm max-w-2xl mx-auto">
                        Access transparent reporting tools, real-time data analytics, and emergency resources provided by the Ministry.
                    </p>
                    <div className="w-24 h-1 bg-blue-900 mx-auto mt-6 rounded-full"></div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <FeatureCard
                        icon={AlertTriangle}
                        title="Report Incident"
                        desc="File complaints about infrastructure failures, corruption, or delays with geo-tagged evidence."
                        colorClass="bg-red-600 text-red-600"
                        link="/report"
                    />

                    <FeatureCard
                        icon={BarChart3}
                        title="Live Analytics"
                        desc="View real-time dashboards on fund utilization, project status, and contractor performance."
                        colorClass="bg-blue-600 text-blue-600"
                        link="/analytics"
                    />

                    <FeatureCard
                        icon={ShieldCheck}
                        title="Public Audits"
                        desc="Participate in community-led verifications of completed government projects."
                        colorClass="bg-emerald-600 text-emerald-600"
                        link="/audits"
                    />

                    <FeatureCard
                        icon={Users}
                        title="Volunteer Network"
                        desc="Join the 'CrisisOne Sahayak' force to assist in disaster relief and on-ground verification."
                        colorClass="bg-orange-600 text-orange-600"
                        link="/volunteer"
                    />

                    <FeatureCard
                        icon={FileText}
                        title="RTI Filing"
                        desc="Submit Right to Information requests directly through the aligned portal."
                        colorClass="bg-slate-600 text-slate-600"
                        link="/rti"
                    />

                    <FeatureCard
                        icon={PhoneCall}
                        title="Emergency Help"
                        desc="Direct line to disaster response teams for immediate assistance (SOS)."
                        colorClass="bg-indigo-600 text-indigo-600"
                        link="/sos"
                    />

                    {/* Quick Info Block (Typical Text Heavy Govt Block) */}
                    <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-center">
                        <h4 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wide border-b border-slate-100 pb-2">Latest Notifications</h4>
                        <ul className="space-y-2 text-xs text-slate-600">
                            <li className="flex items-start">
                                <span className="text-orange-500 mr-2">NEW</span>
                                Updated guidelines for flood relief distribution 2025.
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">INFO</span>
                                Tender opened for Bridges Project in Sector 4.
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">DONE</span>
                                Audit completed for Highway 44 Restoration.
                            </li>
                        </ul>
                        <Link href="#" className="text-blue-700 text-xs font-bold mt-3 hover:underline">View All Notifications →</Link>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default GovernmentFeatures;
