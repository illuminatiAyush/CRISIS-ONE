'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface Props {
    data: { name: string; value: number }[];
}

const COLORS: Record<string, string> = {
    'Fire': 'bg-red-500',
    'Flood': 'bg-blue-500',
    'Medical': 'bg-emerald-500',
    'Supply': 'bg-amber-500',
    'Other': 'bg-slate-400'
};

const TEXT_COLORS: Record<string, string> = {
    'Fire': 'text-red-500',
    'Flood': 'text-blue-500',
    'Medical': 'text-emerald-500',
    'Supply': 'text-amber-500',
    'Other': 'text-slate-400'
};

export default function IncidentDensityGrid({ data }: Props) {
    // Flatten data into a list of units for the grid
    const units = data.flatMap(cat =>
        Array(cat.value).fill({ type: cat.name })
    );

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 content-start flex flex-wrap gap-1.5 p-1 overflow-y-auto custom-scrollbar">
                {units.map((unit, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.005, type: 'spring', stiffness: 300, damping: 20 }}
                        className={`w-3 h-3 rounded-sm ${COLORS[unit.type] || 'bg-slate-300'} hover:opacity-80 transition-opacity cursor-help`}
                        title={unit.type}
                    />
                ))}
            </div>
        </div>
    );
}
