'use client';

/**
 * Incident Report Form - Allows users to report new incidents
 * Features location selection via map integration and real-time validation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useIncidents } from '@/app/hooks/useIncidents';
import { IncidentCategory, IncidentSeverity, Location } from '@/app/types';
import Map from './Map';

interface IncidentReportFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

interface FormData {
  category: IncidentCategory | '';
  severity: IncidentSeverity | '';
  description: string;
  location: Location | null;
  estimatedAffected: string;
}

const categories: IncidentCategory[] = ['Fire', 'Flood', 'Medical', 'Supply', 'Other'];
const severities: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

export default function IncidentReportForm({ onSubmit, onCancel }: IncidentReportFormProps) {
  const { createIncident } = useIncidents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    category: '',
    severity: '',
    description: '',
    location: null,
    estimatedAffected: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Camera Logic
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      // Slight delay to ensure DOM element exists if conditional rendering
      setTimeout(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setErrors(prev => ({ ...prev, camera: 'Could not access camera. Please allow permissions.' }));
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob/file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  // Ensure camera is stopped if component unmounts
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleInputChange = (field: keyof FormData, value: string | Location | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Please select an incident category';
    }

    if (!formData.severity) {
      newErrors.severity = 'Please select severity level';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.location) {
      newErrors.location = 'Please select a location on the map';
    }

    if (formData.estimatedAffected && (isNaN(Number(formData.estimatedAffected)) || Number(formData.estimatedAffected) <= 0)) {
      newErrors.estimatedAffected = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const incidentData = {
        category: formData.category as IncidentCategory,
        severity: formData.severity as IncidentSeverity,
        description: formData.description.trim(),
        location: formData.location!,
        status: 'Reported' as const,
        reporterId: 'anonymous', // Default to anonymous since auth is removed
        estimatedAffected: formData.estimatedAffected ? Number(formData.estimatedAffected) : undefined,
      };

      const success = await createIncident(incidentData, imageFile || undefined);

      if (success) {
        // Reset form
        setFormData({
          category: '',
          severity: '',
          description: '',
          location: null,
          estimatedAffected: '',
        });
        setImageFile(null);
        onSubmit?.();
      } else {
        setErrors({ submit: 'Failed to submit incident report. Please try again.' });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrors({ submit: 'An error occurred while submitting the report.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    handleInputChange('location', location);
    setShowMap(false);
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    const colors = {
      'Low': 'text-green-700 bg-green-100 border-green-200',
      'Medium': 'text-yellow-700 bg-yellow-100 border-yellow-200',
      'High': 'text-orange-700 bg-orange-100 border-orange-200',
      'Critical': 'text-red-700 bg-red-100 border-red-200',
    };
    return colors[severity];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Report Incident</h2>
            <p className="text-sm text-gray-500">Provide details about the emergency situation</p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <span className="text-red-500">*</span> Incident Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleInputChange('category', category)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.category === category
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Severity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <span className="text-red-500">*</span> Severity Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {severities.map((severity) => (
              <motion.button
                key={severity}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleInputChange('severity', severity)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.severity === severity
                  ? `border-current ${getSeverityColor(severity)}`
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
              >
                {severity}
              </motion.button>
            ))}
          </div>
          {errors.severity && (
            <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide detailed information about the incident..."
            className={`block w-full rounded-lg border shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600">{errors.description}</p>
            ) : (
              <p className="text-sm text-gray-500">Minimum 10 characters</p>
            )}
            <p className="text-sm text-gray-400">{formData.description.length}/500</p>
          </div>
        </div>

        {/* Image Input Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachment (Image)
          </label>

          <div className="flex space-x-4 mb-3">
            <button
              type="button"
              onClick={() => {
                setInputMode('upload');
                stopCamera();
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${inputMode === 'upload'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              <Icon icon="mdi:upload" className="w-4 h-4" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('camera');
                // Don't auto-start camera here, let user click "Start Camera" to be intentional
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${inputMode === 'camera'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              <Icon icon="mdi:camera" className="w-4 h-4" />
              Take Photo
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
              <div className="space-y-1 text-center">
                {imageFile ? (
                  <div className="text-sm text-gray-600">
                    <Icon icon="mdi:check-circle" className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <span className="font-medium text-green-600">{imageFile.name}</span>
                    <p className="text-xs text-gray-400 mt-1">Click to change</p>
                  </div>
                ) : (
                  <>
                    <Icon icon="mdi:image-plus" className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-1 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative min-h-[300px] flex flex-col items-center justify-center">
              {!isCameraActive && !imageFile && (
                <div className="text-center p-6">
                  <Icon icon="mdi:camera-outline" className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Icon icon="mdi:camera" className="w-4 h-4" />
                    Start Camera
                  </button>
                </div>
              )}

              {isCameraActive && (
                <div className="relative w-full h-full flex flex-col">
                  {/* Video Stream */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover bg-black"
                  />
                  <div className="p-4 bg-white border-t flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full border-4 border-blue-500 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg"
                      title="Capture Photo"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500"></div>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <Icon icon="mdi:close" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {!isCameraActive && imageFile && inputMode === 'camera' && (
                <div className="w-full relative">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Captured"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4 bg-white border-t flex justify-between items-center">
                    <div className="flex items-center gap-2 text-green-600">
                      <Icon icon="mdi:check-circle" className="w-5 h-5" />
                      <span className="font-medium text-sm">Photo Captured</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        startCamera();
                      }}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>


        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Location
          </label>
          {formData.location ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Icon icon="mdi:map-marker" className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Location Selected</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Lat: {formData.location.lat.toFixed(4)}, Lon: {formData.location.lon.toFixed(4)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className={`w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors ${errors.location
                ? 'border-red-300 text-red-600 hover:border-red-400'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
            >
              <Icon icon="mdi:map-marker-plus" className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Click to select location on map</p>
            </button>
          )}
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Estimated Affected */}
        <div>
          <label htmlFor="estimatedAffected" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated People Affected (Optional)
          </label>
          <input
            type="number"
            id="estimatedAffected"
            min="1"
            value={formData.estimatedAffected}
            onChange={(e) => handleInputChange('estimatedAffected', e.target.value)}
            placeholder="Enter number of people affected"
            className={`block w-full rounded-lg border shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.estimatedAffected ? 'border-red-300' : 'border-gray-300'
              }`}
          />
          {errors.estimatedAffected && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedAffected}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Report'
            )}
          </motion.button>
        </div>
      </form>

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Select Incident Location</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon icon="mdi:close" className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <Map
                  incidents={[]}
                  resources={[]}
                  height="60vh"
                  onLocationSelect={handleLocationSelect}
                  showIncidents={false}
                  showResources={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}