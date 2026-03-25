import React from 'react';

interface ReviewStepProps {
    formData: any;
}

export default function ReviewStep({ formData }: ReviewStepProps) {

    const InfoRow = ({ label, value }: { label: string, value: any }) => (
        <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="text-sm text-slate-800 font-semibold text-right max-w-[60%] truncate">{value || '-'}</span>
        </div>
    );

    return (
        <div className="space-y-8">

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700">Agency Information</h3>
                </div>
                <div className="px-6 py-2">
                    <InfoRow label="Agency Name" value={formData.agency_name} />
                    <InfoRow label="Type" value={formData.agency_type} />
                    <InfoRow label="Team Size" value={formData.team_size} />
                    <InfoRow label="City" value={formData.city} />
                    <InfoRow label="Pincode" value={formData.pin_code} />
                    <InfoRow label="Primary Address" value={formData.agency_address} />
                </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700">Services & Operations</h3>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                        {formData.services_offered?.length > 0 ? (
                            formData.services_offered.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                    {s}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 text-sm">No services selected</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700">Verification Details</h3>
                </div>
                <div className="px-6 py-2">
                    <InfoRow label="Owner Phone" value={formData.owner_phone} />
                    <InfoRow label="Owner Aadhaar (Last 4)" value={formData.owner_aadhaar_masked ? `XXXX-XXXX-${formData.owner_aadhaar_masked}` : '-'} />

                    {formData.pan && <InfoRow label="PAN" value={formData.pan} />}
                    {formData.ngo_darpan_id && <InfoRow label="NGO Darpan ID" value={formData.ngo_darpan_id} />}
                    {formData.gst && <InfoRow label="GST Number" value={formData.gst} />}
                    {formData.cin && <InfoRow label="CIN" value={formData.cin} />}
                    {formData.medical_reg_number && <InfoRow label="Medical Reg. No." value={formData.medical_reg_number} />}

                    <div className="py-3 mt-2">
                        <span className="text-sm text-slate-500 font-medium block mb-2">Attached Documents</span>
                        <div className="space-y-2">
                            {formData.registration_certificate && <div className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded border border-green-200">Registration Certificate Attached</div>}
                            {formData.clinic_license && <div className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded border border-green-200">Clinic License Attached</div>}
                            {formData.business_reg && <div className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded border border-green-200">Business Registration Attached</div>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                <input type="checkbox" className="mt-1" />
                <p>I hereby declare that all the information provided above is true and correct to the best of my knowledge.</p>
            </div>

        </div>
    );
}
