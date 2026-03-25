import React, { useRef } from 'react';
import { Icon } from '@iconify/react';

interface DocumentsStepProps {
    formData: any;
    onChange: (field: string, value: any) => void;
    errors: Record<string, string>;
}

export default function DocumentsStep({ formData, onChange, errors }: DocumentsStepProps) {

    const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onChange(field, e.target.files[0]);
        }
    };

    const REQUIREMENTS: Record<string, { label: string; field: string; type: 'file' | 'text'; required: boolean }[]> = {
        "NGO": [
            { label: "PAN Card Number", field: "pan", type: "text", required: true },
            { label: "NGO Darpan ID", field: "ngo_darpan_id", type: "text", required: true },
            { label: "Registration Certificate", field: "registration_certificate", type: "file", required: true }
        ],
        "Healthcare Responder": [
            { label: "Clinic/Hospital License", field: "clinic_license", type: "file", required: true },
            { label: "Medical Registration Number", field: "medical_reg_number", type: "text", required: false }
        ],
        "Infrastructure Team": [
            { label: "GST Number", field: "gst", type: "text", required: true },
            { label: "Business Registration Document", field: "business_reg", type: "file", required: true },
            { label: "CIN (Corporate Identity Number)", field: "cin", type: "text", required: false }
        ],
        "Government": [
            { label: "Department ID / Code", field: "dept_id", type: "text", required: false }
        ],
        "Volunteer Organization": []
    };

    const currentRequirements = REQUIREMENTS[formData.agency_type] || [];

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                <Icon icon="mdi:information" className="text-blue-600 w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-blue-800 text-sm">Identity Verification</h4>
                    <p className="text-xs text-blue-600 mt-1">
                        To ensure trust on our platform, we need to verify your agency's credentials.
                        These documents will be reviewed by our admin team.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Common Owner Verification */}
                <div className="col-span-2 border-b pb-4 mb-2">
                    <h3 className="font-medium text-slate-800 mb-4">Representative Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Owner Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.owner_phone || ''}
                                onChange={(e) => onChange('owner_phone', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.owner_phone ? 'border-red-300' : 'border-slate-200'}`}
                                placeholder="10-digit mobile number"
                            />
                            {errors.owner_phone && <p className="text-xs text-red-500 mt-1">{errors.owner_phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Owner Aadhaar (Masked) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.owner_aadhaar_masked || ''}
                                onChange={(e) => onChange('owner_aadhaar_masked', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.owner_aadhaar_masked ? 'border-red-300' : 'border-slate-200'}`}
                                placeholder="XXXX-XXXX-1234 (Last 4 digits only)"
                                maxLength={4}
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Enter only the last 4 digits for verification.</p>
                            {errors.owner_aadhaar_masked && <p className="text-xs text-red-500 mt-1">{errors.owner_aadhaar_masked}</p>}
                        </div>
                    </div>
                </div>

                {/* Dynamic Requirements */}
                {currentRequirements.length > 0 && (
                    <div className="col-span-2">
                        <h3 className="font-medium text-slate-800 mb-4">{formData.agency_type} Specifics</h3>
                        <div className="space-y-4">
                            {currentRequirements.map((req) => (
                                <div key={req.field} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-slate-100 p-3 rounded-lg bg-slate-50/50">
                                    <div className="md:col-span-1 pt-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            {req.label} {req.required && <span className="text-red-500">*</span>}
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        {req.type === 'text' ? (
                                            <input
                                                type="text"
                                                value={formData[req.field] || ''}
                                                onChange={(e) => onChange(req.field, e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none ${errors[req.field] ? 'border-red-300' : 'border-slate-200'}`}
                                                placeholder={`Enter ${req.label}`}
                                            />
                                        ) : (
                                            <div className="relative">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileChange(req.field, e)}
                                                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                          "
                                                    />
                                                    {formData[req.field] && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const file = formData[req.field];
                                                                if (typeof file === 'string') {
                                                                    window.open(file, '_blank');
                                                                } else if (file instanceof File) {
                                                                    const url = URL.createObjectURL(file);
                                                                    window.open(url, '_blank');
                                                                }
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="View Document"
                                                        >
                                                            <Icon icon="mdi:eye" className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                {formData[req.field] && (
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                                                        <Icon icon="mdi:check-circle" />
                                                        <span>File Selected: {formData[req.field].name || 'Document Uploaded'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {errors[req.field] && <p className="text-xs text-red-500 mt-1">{errors[req.field]}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentRequirements.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Icon icon="mdi:file-document-outline" className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                        <p>No additional documents required for {formData.agency_type}</p>
                    </div>
                )}

            </div>
        </div>
    );
}
