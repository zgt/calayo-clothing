"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MessagesComponent from "~/app/_components/Messages";
import { useAuth } from "~/context/auth";
import { api } from "~/trpc/react";

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

type Profile = {
  full_name: string | null;
  email: string | null;
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
  profiles: Profile;
};

interface AdminCommissionDetailsProps {
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

export default function AdminCommissionDetails({
  commission,
}: AdminCommissionDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(commission.status);
  const { user } = useAuth();

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

  // tRPC mutation for updating commission status
  const updateStatusMutation = api.commissions.admin.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(`Status updated to ${newStatus}`);
      // Reload the page after a brief delay to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    },
    onError: (error) => {
      console.error("Error updating commission status:", error);
      toast.error("Failed to update status. Please try again.");
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // Handle status update
  const handleStatusUpdate = async () => {
    if (newStatus === commission.status) {
      toast.error("Status is already set to " + newStatus);
      return;
    }

    setIsUpdating(true);

    updateStatusMutation.mutate({
      id: commission.id,
      status: newStatus as
        | "Pending"
        | "Approved"
        | "In Progress"
        | "Completed"
        | "Cancelled",
    });
  };

  // Handle commission deletion
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this commission? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Note: In a real implementation, you'd want to add a DELETE endpoint
      // For now, this is just a placeholder
      toast.error("Deletion functionality not implemented");
      // The actual implementation would look like:
      // const response = await fetch(`/api/admin/commissions/${commission.id}`, {
      //   method: 'DELETE',
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Failed to delete commission');
      // }
      //
      // toast.success('Commission deleted successfully');
      // router.push('/admin/orders');
    } catch (error) {
      console.error("Error deleting commission:", error);
      toast.error("Failed to delete commission. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-purple-700/20 bg-gradient-to-br from-purple-900/30 to-purple-950/80 p-6 shadow-2xl backdrop-blur-sm"
      >
        <h2 className="mb-4 text-xl font-bold text-white">Admin Controls</h2>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="w-full md:w-1/3">
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-purple-200"
            >
              Update Status
            </label>
            <select
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-lg border border-purple-700/30 bg-purple-900/50 px-3 py-2 text-purple-100"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex space-x-3 self-end">
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className="inline-flex items-center rounded-lg bg-purple-700 px-4 py-2 text-white transition-colors hover:bg-purple-600 disabled:pointer-events-none disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <svg
                    className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(`mailto:${commission.profiles.email}`, "_blank")
              }
              className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-white transition-colors hover:bg-emerald-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact Customer
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </motion.div>

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

        {/* Customer Information */}
        <div className="mb-6 rounded-lg border border-emerald-700/30 bg-emerald-900/40 p-4">
          <h3 className="mb-2 text-lg font-medium text-white">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-emerald-200/70">Name:</p>
              <p className="font-medium text-emerald-100">
                {commission.profiles.full_name ?? "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-emerald-200/70">Email:</p>
              <p className="font-medium text-emerald-100">
                {commission.profiles.email ?? "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-emerald-200/70">Customer ID:</p>
              <p className="font-mono text-xs font-medium text-emerald-100">
                {commission.user_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-emerald-200/70">Commission ID:</p>
              <p className="font-mono text-xs font-medium text-emerald-100">
                {commission.id}
              </p>
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
              <button
                onClick={() => setActiveTab("notes")}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "notes" ? "border-emerald-500 text-emerald-400" : "border-transparent text-emerald-300 hover:border-emerald-700/50 hover:text-emerald-200"} `}
              >
                Admin Notes
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

                <div className="space-y-6">
                  <div>
                    <MessagesComponent
                      commissionId={commission.id}
                      currentUserId={user?.id ?? ""}
                      isAdmin={true}
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium text-white">
                      Activity Log
                    </h3>
                    <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/30 p-3">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-emerald-400"></div>
                          <div className="ml-3">
                            <p className="text-sm text-white">
                              Order submitted
                            </p>
                            <p className="text-xs text-emerald-300/70">
                              {formatDate(commission.created_at)}
                            </p>
                          </div>
                        </li>
                        {commission.status !== "pending" && (
                          <li className="flex items-start">
                            <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-blue-400"></div>
                            <div className="ml-3">
                              <p className="text-sm text-white">
                                Status updated to {commission.status}
                              </p>
                              <p className="text-xs text-emerald-300/70">
                                {formatDate(commission.updated_at)}
                              </p>
                            </div>
                          </li>
                        )}
                        {/* Add more activity items as needed */}
                      </ul>
                    </div>
                  </div>
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

          {/* Admin Notes Tab Content */}
          <div className={`py-6 ${activeTab === "notes" ? "block" : "hidden"}`}>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Admin Notes</h3>
              <p className="text-sm text-emerald-200/70">
                Add private notes about this commission that are only visible to
                admins.
              </p>

              <div className="mt-2">
                <textarea
                  rows={6}
                  className="w-full rounded-lg border border-emerald-700/30 bg-emerald-900/40 p-3 text-emerald-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Add notes here..."
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-white transition-colors hover:bg-emerald-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Save Notes
                </button>
              </div>

              <div className="mt-6">
                <h4 className="mb-2 font-medium text-emerald-300">
                  Previous Notes
                </h4>
                <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/30 p-4">
                  <p className="text-emerald-200/70 italic">
                    No previous notes found for this commission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
