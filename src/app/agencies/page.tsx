"use client";

import React from "react";
import GovernmentHeader from "@/components/sections/header/GovernmentHeader";
import GovernmentFooter from "@/components/sections/footer/GovernmentFooter";
import { MapPin, Award, ShieldCheck, Zap } from "lucide-react";

interface Agency {
    id: number;
    name: string;
    type: string;
    location: string;
    description: string;
    score: number;
    badges: string[];
}

const agencies: Agency[] = [
    {
        id: 1,
        name: "National Disaster Response Force (NDRF)",
        type: "Central Agency",
        location: "New Delhi, HQ",
        description: "Specialized force for the purpose of specialist response to a threatening disaster situation or disaster.",
        score: 98,
        badges: ["Quick Responder", "High Resource", "Elite Force"],
    },
    {
        id: 2,
        name: "Rapid Relief Foundation",
        type: "NGO",
        location: "Mumbai, Maharashtra",
        description: "Dedicated to providing immediate food and medical aid during urban floods and structural collapses.",
        score: 92,
        badges: ["Community Hero", "Medical Expert"],
    },
    {
        id: 3,
        name: "Fire & Safety Wing - South",
        type: "State Dept",
        location: "Chennai, Tamil Nadu",
        description: "Primary responders for fire incidents and chemical hazards in the southern industrial belt.",
        score: 89,
        badges: ["Hazard Specialist"],
    },
    {
        id: 4,
        name: "Himalayan Rescue Corp",
        type: "Private Agency",
        location: "Dehradun, Uttarakhand",
        description: "Focused on high-altitude rescue operations and landslide debris clearance.",
        score: 95,
        badges: ["Most Resource Supplier", "Terrain Expert", "Quick Responder"],
    },
    {
        id: 5,
        name: "Coastal Guard Volunteers",
        type: "Community Group",
        location: "Kochi, Kerala",
        description: "Local fishermen and divers trained for sea rescue and flood evacuation.",
        score: 88,
        badges: ["Local Expert", "Marine Safety"],
    },
];

const Badge = ({ text }: { text: string }) => {
    let colorClass = "bg-slate-100 text-slate-600";
    let Icon = ShieldCheck;

    if (text === "Quick Responder") {
        colorClass = "bg-orange-100 text-orange-700 border-orange-200";
        Icon = Zap;
    } else if (text === "Most Resource Supplier" || text === "High Resource") {
        colorClass = "bg-blue-100 text-blue-700 border-blue-200";
        Icon = Award;
    } else if (text === "Elite Force") {
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
        Icon = Award;
    }

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${colorClass} mr-2 mb-2`}>
            <Icon size={12} className="mr-1" />
            {text}
        </span>
    )
};

const AgenciesPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <GovernmentHeader />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 font-serif mb-3">Registered Response Agencies</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        A directory of verified government, private, and non-profit agencies dedicated to disaster management and relief.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agencies.map((agency) => (
                        <div key={agency.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Score Indicator */}
                            <div className="absolute top-4 right-4 flex flex-col items-center">
                                <div className={`text-xl font-bold ${agency.score >= 90 ? 'text-green-600' : 'text-blue-600'}`}>
                                    {agency.score}
                                </div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest">Score</div>
                            </div>

                            <div className="mb-4 pr-12">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                                    {agency.type}
                                </span>
                                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                    {agency.name}
                                </h3>
                            </div>

                            <div className="flex items-center text-sm text-slate-500 mb-4">
                                <MapPin size={16} className="mr-1 text-slate-400" />
                                {agency.location}
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-grow">
                                {agency.description}
                            </p>

                            <div className="border-t border-slate-100 pt-4 mt-auto">
                                <div className="flex flex-wrap">
                                    {agency.badges.map((badge, idx) => (
                                        <Badge key={idx} text={badge} />
                                    ))}
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
            </main>

            <GovernmentFooter />
        </div>
    );
};

export default AgenciesPage;
