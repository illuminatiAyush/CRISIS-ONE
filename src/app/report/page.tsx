"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, FileText, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate upload and AI generation
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 py-12 sm:py-20 transition-colors">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {isSuccess ? (
          // RESULT CARD
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight mb-2">Report submitted successfully</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              Your submission has been reviewed by our AI engine and dispatched to the relevant authorities for immediate action.
            </p>

            {/* Generated Complaint */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generated Complaint
                </span>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-200/50 dark:border-amber-800/50">
                  Infrastructure
                </span>
              </div>
              
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <p><strong>Incident ID:</strong> #CVC-8942-X</p>
                <p><strong>Analysis:</strong> Uploaded evidence indicates a severe infrastructure hazard requiring urgent public works intervention.</p>
                <p><strong>User Notes:</strong> {description || "No additional notes provided."}</p>
                <p><strong>Status:</strong> Dispatched to Municipal Response Team Alpha.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setDescription("");
                setIsSuccess(false);
              }}
              className="mt-8 w-full py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-semibold text-sm transition-all shadow-sm"
            >
              Report Another Issue
            </button>
          </div>
        ) : (
          // UPLOAD CARD
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Report an Issue
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Upload a photo and provide a brief description. Our system will analyze the image and automatically route it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Upload Box (Dashed Border) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Photo Evidence
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="text-center px-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Click or drag & drop to upload
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        PNG, JPG, HEIC up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Large pothole right outside the main library entrance."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!file || isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 dark:disabled:bg-blue-600/30 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
