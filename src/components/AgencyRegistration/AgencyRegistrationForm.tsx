'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import AgencyInfoStep from './Steps/AgencyInfoStep';
import DocumentsStep from './Steps/DocumentsStep';
import ReviewStep from './Steps/ReviewStep';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface AgencyRegistrationFormProps {
    initialData?: any;
    onSuccess?: () => void;
}

export default function AgencyRegistrationForm({ initialData, onSuccess }: AgencyRegistrationFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>(initialData ? {
        ...initialData,
        services_offered: typeof initialData.services_offered === 'string'
            ? initialData.services_offered.split(', ')
            : (initialData.services_offered || [])
    } : {});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const totalSteps = 3;

    const handleFieldChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Regex Patterns (matching backend)
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.agency_name) newErrors.agency_name = "Agency Name is required";
            if (!formData.agency_type) newErrors.agency_type = "Agency Type is required";
            if (!formData.team_size) newErrors.team_size = "Team Size is required";
            if (!formData.agency_address) newErrors.agency_address = "Address is required";
            if (!formData.city) newErrors.city = "City is required";
            if (!formData.state) newErrors.state = "State is required";
            if (!formData.pin_code) newErrors.pin_code = "Pincode is required";
            else if (!/^[0-9]{6}$/.test(formData.pin_code)) newErrors.pin_code = "Invalid Pincode (6 digits)";

            if (!formData.services_offered || formData.services_offered.length === 0) {
                newErrors.services_offered = "Select at least one service";
            }
        }

        if (currentStep === 2) {
            if (!formData.owner_phone) newErrors.owner_phone = "Phone number is required";
            else if (!/^[0-9]{10}$/.test(formData.owner_phone)) newErrors.owner_phone = "Invalid Phone (10 digits)";

            if (!formData.owner_aadhaar_masked) newErrors.owner_aadhaar_masked = "Aadhaar info is required";
            else if (!/^[0-9]{4}$/.test(formData.owner_aadhaar_masked)) newErrors.owner_aadhaar_masked = "Enter last 4 digits only";

            if (formData.agency_type === 'NGO') {
                if (!formData.pan) newErrors.pan = "PAN is required";
                else if (!PAN_REGEX.test(formData.pan)) newErrors.pan = "Invalid PAN Format (e.g. ABCDE1234F)";

                if (!formData.ngo_darpan_id) newErrors.ngo_darpan_id = "Darpan ID is required";
                if (!formData.registration_certificate) newErrors.registration_certificate = "Certificate is required";
            }
            if (formData.agency_type === 'Healthcare Responder') {
                if (!formData.clinic_license) newErrors.clinic_license = "Clinic License is required";
            }
            if (formData.agency_type === 'Infrastructure Team') {
                if (!formData.gst) newErrors.gst = "GST is required";
                else if (!GST_REGEX.test(formData.gst)) newErrors.gst = "Invalid GST Format";

                if (!formData.business_reg) newErrors.business_reg = "Business Registration is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => Math.min(prev + 1, totalSteps));
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (typeof formData[key] !== 'object' || formData[key] === null) {
                    data.append(key, String(formData[key]));
                } else if (Array.isArray(formData[key])) {
                    data.append(key, formData[key].join(', '));
                }
            });

            // Append files if they exist (and strictly check if they are File objects)
            if (formData.registration_certificate instanceof File) data.append('registration_certificate', formData.registration_certificate);
            if (formData.clinic_license instanceof File) data.append('clinic_license', formData.clinic_license);
            if (formData.business_reg instanceof File) data.append('business_reg', formData.business_reg);

            // IMPORTANT: Mark as not draft!
            data.append('isDraft', 'false');

            const res = await axios.post('/api/agency/registration', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.reload();
                }
            }

        } catch (err: any) {
            console.error(err);
            const serverMsg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
            const issues = err.response?.data?.issues;

            if (issues && Array.isArray(issues)) {
                setSubmitError(`Validation Errors: ${issues.join(', ')}`);
            } else {
                setSubmitError(serverMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Agency Registration Portal</h1>

            {/* Steps Indicator (Top Horizontal) */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[
                    { n: 1, label: "Agency Details" },
                    { n: 2, label: "Documents" },
                    { n: 3, label: "Review" }
                ].map((s, index) => (
                    <div key={s.n} className="flex-1 flex items-center">
                        <div className={`flex flex-col items-center relative z-10 w-full`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= s.n ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                                {step > s.n ? <Icon icon="mdi:check" /> : s.n}
                            </div>
                            <span className={`mt-2 text-xs font-medium ${step >= s.n ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</span>
                        </div>
                        {index < 2 && (
                            <div className={`flex-1 h-[2px] mx-2 content-[''] mb-6 ${step > s.n ? 'bg-blue-600' : 'bg-slate-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {step === 1 && "Tell us about your organization"}
                        {step === 2 && "Verification Documents"}
                        {step === 3 && "Review Application"}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {step === 1 && "Please provide accurate details to help us verify your agency faster."}
                        {step === 2 && "Upload the required documents based on your agency type."}
                        {step === 3 && "Please review all details carefully before submitting."}
                    </p>
                </div>

                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                        <Icon icon="mdi:alert-circle" className="w-5 h-5" />
                        {submitError}
                    </div>
                )}

                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {step === 1 && <AgencyInfoStep formData={formData} onChange={handleFieldChange} errors={errors} />}
                    {step === 2 && <DocumentsStep formData={formData} onChange={handleFieldChange} errors={errors} />}
                    {step === 3 && <ReviewStep formData={formData} />}
                </motion.div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                    <button
                        onClick={handleBack}
                        className={`px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                        disabled={isSubmitting}
                    >
                        <Icon icon="mdi:arrow-left" className="w-4 h-4" /> Back
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={handleNext}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                        >
                            Next Step <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg shadow-green-200 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            {!isSubmitting && <Icon icon="mdi:check-circle" className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
