import React from 'react';
import { Icon } from '@iconify/react';
import { INDIAN_STATES } from '@/data/indianStates';

interface AgencyInfoStepProps {
    formData: any;
    onChange: (field: string, value: any) => void;
    errors: Record<string, string>;
}

const AGENCY_TYPES = [
    "Government",
    "Healthcare Responder",
    "NGO",
    "Volunteer Organization",
    "Infrastructure Team"
];

const SERVICES_LIST = [
    "Medical Aid",
    "Search & Rescue",
    "Food Distribution",
    "Shelter Management",
    "Transport",
    "Psychological Support",
    "Debris Removal"
];

export default function AgencyInfoStep({ formData, onChange, errors }: AgencyInfoStepProps) {

    const stateOptions = Object.keys(INDIAN_STATES);
    const cityOptions = formData.state ? INDIAN_STATES[formData.state] || [] : [];

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange('state', e.target.value);
        onChange('city', ''); // Reset city on state change
    };

    const handleServiceToggle = (service: string) => {
        const current = formData.services_offered || [];
        if (current.includes(service)) {
            onChange('services_offered', current.filter((s: string) => s !== service));
        } else {
            onChange('services_offered', [...current, service]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Agency Name */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.agency_name || ''}
                        onChange={(e) => onChange('agency_name', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.agency_name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                        placeholder="e.g. Mumbai Relief Squad"
                    />
                    {errors.agency_name && <p className="text-xs text-red-500 mt-1">{errors.agency_name}</p>}
                </div>

                {/* Agency Type */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Agency Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.agency_type || ''}
                        onChange={(e) => onChange('agency_type', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${errors.agency_type ? 'border-red-300' : 'border-slate-200'}`}
                    >
                        <option value="">Select Type</option>
                        {AGENCY_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    {errors.agency_type && <p className="text-xs text-red-500 mt-1">{errors.agency_type}</p>}
                </div>

                {/* Team Size */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Team Size <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Icon icon="mdi:account-group" className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                        <input
                            type="number"
                            value={formData.team_size || ''}
                            onChange={(e) => onChange('team_size', e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.team_size ? 'border-red-300' : 'border-slate-200'}`}
                            placeholder="0"
                            min="1"
                        />
                    </div>
                    {errors.team_size && <p className="text-xs text-red-500 mt-1">{errors.team_size}</p>}
                </div>

                {/* Address */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Registered Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.agency_address || ''}
                        onChange={(e) => onChange('agency_address', e.target.value)}
                        rows={2}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.agency_address ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="Complete street address"
                    />
                    {errors.agency_address && <p className="text-xs text-red-500 mt-1">{errors.agency_address}</p>}
                </div>

                {/* Agency Description */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Agency Description
                    </label>
                    <textarea
                        value={formData.agency_description || ''}
                        onChange={(e) => onChange('agency_description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Briefly describe your agency's mission and activities..."
                    />
                </div>

                {/* State */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        State <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.state || ''}
                            onChange={handleStateChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none ${errors.state ? 'border-red-300' : 'border-slate-200'}`}
                        >
                            <option value="">Select State</option>
                            {stateOptions.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.city || ''}
                            onChange={(e) => onChange('city', e.target.value)}
                            disabled={!formData.state}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none ${errors.city ? 'border-red-300' : 'border-slate-200'} ${!formData.state ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                        >
                            <option value="">Select City</option>
                            {cityOptions.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>

                {/* Pincode */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        maxLength={6}
                        value={formData.pin_code || ''}
                        onChange={(e) => onChange('pin_code', e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.pin_code ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="000000"
                    />
                    {errors.pin_code && <p className="text-xs text-red-500 mt-1">{errors.pin_code}</p>}
                </div>

                {/* Services Offered */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Services Offered <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {SERVICES_LIST.map(service => (
                            <button
                                key={service}
                                type="button"
                                onClick={() => handleServiceToggle(service)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border text-left flex items-center gap-2 transition-all ${(formData.services_offered || []).includes(service)
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${(formData.services_offered || []).includes(service) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                                    {(formData.services_offered || []).includes(service) && <Icon icon="mdi:check" className="text-white w-3 h-3" />}
                                </div>
                                {service}
                            </button>
                        ))}
                    </div>
                    {errors.services_offered && <p className="text-xs text-red-500 mt-1">{errors.services_offered}</p>}
                </div>

            </div>
        </div>
    );
}
