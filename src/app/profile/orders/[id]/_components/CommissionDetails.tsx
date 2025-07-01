// src/app/profile/orders/[id]/_components/CommissionDetails.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MessagesComponent from "~/app/_components/Messages";

type CommissionMeasurements = {
  id: string;
  commission_id: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  length: number | null;
  inseam: number | null;
  shoulders: number | null;
  neck: number | null;
  sleeve_length: number | null;
  bicep: number | null;
  forearm: number | null;
  wrist: number | null;
  armhole_depth: number | null;
  back_width: number | null;
  front_chest_width: number | null;
  thigh: number | null;
  knee: number | null;
  calf: number | null;
  ankle: number | null;
  rise: number | null;
  outseam: number | null;
  height: number | null;
  weight: number | null;
  torso_length: number | null;
  shoulder_slope: number | null;
  posture: string | null;
};

type Commission = {
  id: string;
  status: string;
  garment_type: string;
  budget: string;
  timeline: string;
  details: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  commission_measurements: CommissionMeasurements | null;
};

interface CommissionDetailsProps {
  commission: Commission;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'approved':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'in progress':
    case 'In Progress':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

// Helper function to get status timeline styling
const getStatusStep = (currentStatus: string, stepStatus: string) => {
  const statusOrder = ['pending', 'approved', 'in progress', 'completed', 'cancelled'];
  const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());
  const stepIndex = statusOrder.indexOf(stepStatus.toLowerCase());
  
  if (currentIndex === -1 || stepIndex === -1) return 'incomplete';
  
  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex) return 'active';
  return 'incomplete';
};

// Helper component for measurements display
const MeasurementItem = ({ label, value, unit = "in" }: { label: string; value?: number | null; unit?: string }) => {
  if (value === undefined || value === null) return null;
  
  return (
    <div className="flex justify-between text-sm">
      <span className="text-emerald-200/70">{label}:</span>
      <span className="font-medium text-white">
        {value} {unit}
      </span>
    </div>
  );
};

export default function CommissionDetails({ commission }: CommissionDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');
  
  // Group measurements by body area
  const upperBodyMeasurements = [
    { label: "Chest", key: "chest" },
    { label: "Shoulders", key: "shoulders" },
    { label: "Neck", key: "neck" },
    { label: "Sleeve Length", key: "sleeve_length" },
    { label: "Bicep", key: "bicep" },
    { label: "Forearm", key: "forearm" },
    { label: "Wrist", key: "wrist" },
    { label: "Armhole Depth", key: "armhole_depth" },
    { label: "Back Width", key: "back_width" },
    { label: "Front Chest Width", key: "front_chest_width" },
  ];
  
  const lowerBodyMeasurements = [
    { label: "Waist", key: "waist" },
    { label: "Hips", key: "hips" },
    { label: "Length", key: "length" },
    { label: "Inseam", key: "inseam" },
    { label: "Rise", key: "rise" },
    { label: "Outseam", key: "outseam" },
    { label: "Thigh", key: "thigh" },
    { label: "Knee", key: "knee" },
    { label: "Calf", key: "calf" },
    { label: "Ankle", key: "ankle" },
  ];
  
  const generalMeasurements = [
    { label: "Height", key: "height" },
    { label: "Weight", key: "weight", unit: "lbs" },
    { label: "Torso Length", key: "torso_length" },
    { label: "Shoulder Slope", key: "shoulder_slope" },
  ];
  
  return (
    <div className="space-y-6">
      {/* Commission summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center flex-wrap gap-3">
              <h2 className="text-2xl font-semibold text-white capitalize">
                {commission.garment_type} Commission
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(commission.status)}`}>
                {commission.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-emerald-200/70">
              Submitted on {formatDate(commission.created_at)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-emerald-900/50 text-emerald-200 border border-emerald-700/30">
              Budget: {commission.budget}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-emerald-900/50 text-emerald-200 border border-emerald-700/30">
              Timeline: {commission.timeline}
            </span>
          </div>
        </div>
        
        {/* Order Status Timeline */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-emerald-700/30"></div>
            </div>
            <div className="relative flex justify-between">
              {['Pending', 'Approved', 'In Progress', 'Completed'].map((step) => {
                const status = getStatusStep(commission.status, step);
                return (
                  <div key={step} className="flex items-center">
                    <div 
                      className={`
                        h-5 w-5 rounded-full flex items-center justify-center
                        ${status === 'complete' ? 'bg-emerald-500' : 
                          status === 'active' ? 'border-2 border-emerald-500 bg-emerald-900' : 
                          'border border-emerald-700/50 bg-emerald-900/70'}
                      `}
                    >
                      {status === 'complete' && (
                        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                        </svg>
                      )}
                    </div>
                    <div 
                      className={`
                        mt-0.5 ml-2 min-w-0 flex flex-col
                        ${status === 'complete' ? 'text-emerald-400' : 
                          status === 'active' ? 'text-white' : 
                          'text-emerald-300/50'}
                      `}
                    >
                      <span className="text-xs font-medium">{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Tabs for navigation */}
        <div>
          <div className="border-b border-emerald-700/30">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('details')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'details' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-emerald-300 hover:text-emerald-200 hover:border-emerald-700/50'}
                `}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('measurements')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'measurements' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-emerald-300 hover:text-emerald-200 hover:border-emerald-700/50'}
                `}
              >
                Measurements
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'messages' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-emerald-300 hover:text-emerald-200 hover:border-emerald-700/50'}
                `}
              >
                Messages
              </button>
            </nav>
          </div>
          
          {/* Details Tab Content */}
          <div className={`py-6 ${activeTab === 'details' ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm prose-emerald prose-invert max-w-none">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Commission Details</h3>
                <p className="text-emerald-200/90 whitespace-pre-wrap">
                  {commission.details ?? "No additional details provided."}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Order Information</h3>
                  <dl className="grid grid-cols-1 gap-y-3">
                    <div className="flex justify-between">
                      <dt className="text-emerald-200/70">Order ID:</dt>
                      <dd className="text-white font-mono text-sm">{commission.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-emerald-200/70">Garment Type:</dt>
                      <dd className="text-white capitalize">{commission.garment_type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-emerald-200/70">Budget Range:</dt>
                      <dd className="text-white">{commission.budget}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-emerald-200/70">Timeline:</dt>
                      <dd className="text-white">{commission.timeline}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-emerald-200/70">Status:</dt>
                  <dd className="text-white capitalize">{commission.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-emerald-200/70">Submitted:</dt>
                  <dd className="text-white">{formatDate(commission.created_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-emerald-200/70">Last Updated:</dt>
                  <dd className="text-white">{formatDate(commission.updated_at)}</dd>
                </div>
              </dl>
            </div>
            
            {/* Contact Designer Button */}
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Need Help?</h3>
              <p className="text-emerald-200/70 mb-4">
                Have questions about your commission? Feel free to reach out anytime.
              </p>
              <button 
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 transition-all duration-200"
                onClick={() => window.location.href = "mailto:support@calayoclothing.com"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Designer
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Measurements Tab Content */}
      <div className={`py-6 ${activeTab === 'measurements' ? 'block' : 'hidden'}`}>
        {commission.commission_measurements ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upper Body Measurements */}
            <div className="rounded-md border border-emerald-700/30 p-4">
              <h3 className="text-lg font-medium text-white mb-3">Upper Body</h3>
              <div className="space-y-2">
                {upperBodyMeasurements.map(({ label, key }) => (
                  <MeasurementItem 
                    key={key} 
                    label={label} 
                    value={commission.commission_measurements?.[key as keyof CommissionMeasurements] as number | null} 
                  />
                ))}
              </div>
            </div>
            
            {/* Lower Body Measurements */}
            <div className="rounded-md border border-emerald-700/30 p-4">
              <h3 className="text-lg font-medium text-white mb-3">Lower Body</h3>
              <div className="space-y-2">
                {lowerBodyMeasurements.map(({ label, key }) => (
                  <MeasurementItem 
                    key={key} 
                    label={label} 
                    value={commission.commission_measurements?.[key as keyof CommissionMeasurements] as number | null} 
                  />
                ))}
              </div>
            </div>
            
            {/* General Measurements */}
            <div className="rounded-md border border-emerald-700/30 p-4">
              <h3 className="text-lg font-medium text-white mb-3">General</h3>
              <div className="space-y-2">
                {generalMeasurements.map(({ label, key, unit }) => (
                  <MeasurementItem 
                    key={key} 
                    label={label} 
                    value={commission.commission_measurements?.[key as keyof CommissionMeasurements] as number | null}
                    unit={unit} 
                  />
                ))}
                {commission.commission_measurements?.posture && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-200/70">Posture:</span>
                    <span className="font-medium text-white">
                      {commission.commission_measurements.posture}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-emerald-600/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-emerald-100">No measurements found</h3>
            <p className="mt-1 text-emerald-200/70">
              This commission doesn&apos;t have any associated measurements.
            </p>
          </div>
        )}
      </div>
      <div className={`py-6 ${activeTab === 'messages' ? 'block' : 'hidden'}`}>
        <MessagesComponent 
          commissionId={commission.id} 
          currentUserId={commission.user_id}
          isAdmin={false}
        />
      </div>
    </div>
  </motion.div>
</div>
);
}