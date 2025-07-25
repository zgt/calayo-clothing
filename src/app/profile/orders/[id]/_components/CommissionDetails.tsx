// src/app/profile/orders/[id]/_components/CommissionDetails.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MessagesComponent from "~/app/_components/Messages";
import { Progress } from "~/components/ui/progress";

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
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "approved":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "in progress":
    case "In Progress":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case "completed":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

// Helper function to calculate progress percentage
const getProgressPercentage = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return 0;
    case "approved":
      return 33;
    case "in progress":
      return 66;
    case "completed":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 0;
  }
};

// Helper function to get status step styling for labels
const getStatusStep = (currentStatus: string, stepStatus: string) => {
  const statusOrder = ["pending", "approved", "in progress", "completed"];
  const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());
  const stepIndex = statusOrder.indexOf(stepStatus.toLowerCase());

  if (currentIndex === -1 || stepIndex === -1) return "incomplete";

  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "active";
  return "incomplete";
};

// Helper component for measurements display
const MeasurementItem = ({
  label,
  value,
  unit = "in",
}: {
  label: string;
  value?: number | null;
  unit?: string;
}) => {
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

export default function CommissionDetails({
  commission,
}: CommissionDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");

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
        className="rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-sm"
      >
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-white capitalize">
                {commission.garment_type} Commission
              </h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(commission.status)}`}
              >
                {commission.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-emerald-200/70">
              Submitted on {formatDate(commission.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-md border border-emerald-700/30 bg-emerald-900/50 px-3 py-1 text-sm font-medium text-emerald-200">
              Budget: {commission.budget}
            </span>
            <span className="inline-flex items-center rounded-md border border-emerald-700/30 bg-emerald-900/50 px-3 py-1 text-sm font-medium text-emerald-200">
              Timeline: {commission.timeline}
            </span>
          </div>
        </div>

        {/* Order Status Progress */}
        <div className="mb-8">
          <div className="space-y-4">
            {/* Status Labels */}
            <div className="flex justify-between">
              {["Pending", "Approved", "In Progress", "Completed"].map(
                (step) => {
                  const status = getStatusStep(commission.status, step);
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <span
                        className={`text-xs font-medium ${
                          status === "complete"
                            ? "text-emerald-400"
                            : status === "active"
                              ? "text-white"
                              : "text-emerald-300/50"
                        } `}
                      >
                        {step}
                      </span>
                    </div>
                  );
                },
              )}
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <Progress
                value={getProgressPercentage(commission.status)}
                className="h-3 border border-emerald-700/30 bg-emerald-900/50 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Tabs for navigation */}
        <div>
          <div className="border-b border-emerald-700/30">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("details")}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "details" ? "border-emerald-500 text-emerald-400" : "border-transparent text-emerald-300 hover:border-emerald-700/50 hover:text-emerald-200"} `}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("measurements")}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "measurements" ? "border-emerald-500 text-emerald-400" : "border-transparent text-emerald-300 hover:border-emerald-700/50 hover:text-emerald-200"} `}
              >
                Measurements
              </button>
            </nav>
          </div>

          {/* Details Tab Content */}
          <div
            className={`py-6 ${activeTab === "details" ? "block" : "hidden"}`}
          >
            <div className="prose prose-sm prose-emerald prose-invert max-w-none">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-medium text-white">
                      Commission Details
                    </h3>
                    <p className="whitespace-pre-wrap text-emerald-200/90">
                      {commission.details ?? "No additional details provided."}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium text-white">
                      Order Information
                    </h3>
                    <dl className="grid grid-cols-1 gap-y-3">
                      <div className="flex justify-between">
                        <dt className="text-emerald-200/70">Order ID:</dt>
                        <dd className="font-mono text-sm text-white">
                          {commission.id}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-emerald-200/70">Garment Type:</dt>
                        <dd className="text-white capitalize">
                          {commission.garment_type}
                        </dd>
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
                        <dd className="text-white capitalize">
                          {commission.status}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-emerald-200/70">Submitted:</dt>
                        <dd className="text-white">
                          {formatDate(commission.created_at)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-emerald-200/70">Last Updated:</dt>
                        <dd className="text-white">
                          {formatDate(commission.updated_at)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <MessagesComponent
                    commissionId={commission.id}
                    currentUserId={commission.user_id}
                    isAdmin={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Measurements Tab Content */}
          <div
            className={`py-6 ${activeTab === "measurements" ? "block" : "hidden"}`}
          >
            {commission.commission_measurements ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Upper Body Measurements */}
                <div className="rounded-md border border-emerald-700/30 p-4">
                  <h3 className="mb-3 text-lg font-medium text-white">
                    Upper Body
                  </h3>
                  <div className="space-y-2">
                    {upperBodyMeasurements.map(({ label, key }) => (
                      <MeasurementItem
                        key={key}
                        label={label}
                        value={
                          commission.commission_measurements?.[
                            key as keyof CommissionMeasurements
                          ] as number | null
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Lower Body Measurements */}
                <div className="rounded-md border border-emerald-700/30 p-4">
                  <h3 className="mb-3 text-lg font-medium text-white">
                    Lower Body
                  </h3>
                  <div className="space-y-2">
                    {lowerBodyMeasurements.map(({ label, key }) => (
                      <MeasurementItem
                        key={key}
                        label={label}
                        value={
                          commission.commission_measurements?.[
                            key as keyof CommissionMeasurements
                          ] as number | null
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* General Measurements */}
                <div className="rounded-md border border-emerald-700/30 p-4">
                  <h3 className="mb-3 text-lg font-medium text-white">
                    General
                  </h3>
                  <div className="space-y-2">
                    {generalMeasurements.map(({ label, key, unit }) => (
                      <MeasurementItem
                        key={key}
                        label={label}
                        value={
                          commission.commission_measurements?.[
                            key as keyof CommissionMeasurements
                          ] as number | null
                        }
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
              <div className="py-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-emerald-600/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-emerald-100">
                  No measurements found
                </h3>
                <p className="mt-1 text-emerald-200/70">
                  This commission doesn&apos;t have any associated measurements.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
