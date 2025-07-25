"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/react";
import InlineEditField from "./InlineEditField";
import { profileValidation } from "~/lib/profile-validation";
import type { ProfileMeasurements } from "../page";

type Profile = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  phone?: string | null;
};

type User = {
  id: string;
  email?: string;
};

interface ProfileSectionProps {
  profile: Profile | null;
  user: User;
  measurements: ProfileMeasurements | null;
}

export default function ProfileSection({
  profile,
  user,
  measurements,
}: ProfileSectionProps) {
  // Form state management
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name ?? "",
    location: profile?.location ?? "",
    phone: profile?.phone ?? "",
    website: profile?.website ?? "",
    bio: profile?.bio ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // tRPC mutations for profile updates with optimistic updates
  const utils = api.useUtils();
  
  const updateProfile = api.profile.updateProfile.useMutation({
    onMutate: async (newData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.profile.getProfile.cancel();
      
      // Snapshot the previous value for rollback
      const previousProfile = utils.profile.getProfile.getData();
      
      // Optimistically update to the new value
      if (previousProfile) {
        utils.profile.getProfile.setData(undefined, {
          ...previousProfile,
          ...newData,
        });
      }
      
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfile) {
        utils.profile.getProfile.setData(undefined, context.previousProfile);
      }
    },
    onSuccess: () => {
      // Reset form state after successful save
      setIsEditing(false);
      setErrors({});
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      void utils.profile.getProfile.invalidate();
    },
  });

  // Validation function using Zod schemas
  const validateField = (field: string, value: string) => {
    try {
      switch (field) {
        case "name":
          profileValidation.name.parse(value);
          break;
        case "location":
          profileValidation.location.parse(value);
          break;
        case "phone":
          profileValidation.phone.parse(value);
          break;
        case "website":
          profileValidation.website.parse(value);
          break;
        case "bio":
          profileValidation.bio.parse(value);
          break;
      }
      return null;
    } catch (error) {
      const zodError = error as { errors?: Array<{ message: string }> };
      return zodError.errors?.[0]?.message ?? `Invalid ${field}`;
    }
  };

  // Form handlers
  const handleStartEdit = () => {
    setIsEditing(true);
    // Reset form data to current profile values
    setFormData({
      name: profile?.name ?? "",
      location: profile?.location ?? "",
      phone: profile?.phone ?? "",
      website: profile?.website ?? "",
      bio: profile?.bio ?? "",
    });
    setErrors({});
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.name ?? "",
      location: profile?.location ?? "",
      phone: profile?.phone ?? "",
      website: profile?.website ?? "",
      bio: profile?.bio ?? "",
    });
    setErrors({});
  };

  const handleSave = async () => {
    // Validate all fields
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;
    
    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value);
      newErrors[field] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    // Check if anything actually changed
    const hasChanges = Object.entries(formData).some(([field, value]) => {
      const currentValue = profile?.[field as keyof typeof profile] ?? "";
      return value !== currentValue;
    });

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProfile.mutateAsync(formData);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Failed to save profile:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Left Column - User Info */}
      <div className="rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-4 shadow-2xl backdrop-blur-xs">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-emerald-900/50">
            {profile?.image ? (
              <Image
                src={profile.image}
                alt={`${profile.name ?? "User"}'s avatar`}
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-emerald-200">
                {profile?.name?.charAt(0) ?? user.email?.charAt(0)}
              </div>
            )}
          </div>
          <div className="mb-2">
            <InlineEditField
              value={isEditing ? formData.name : profile?.name ?? ""}
              onChange={(value) => handleFieldChange("name", value)}
              fieldType="text"
              label="Full Name"
              placeholder="Enter your full name"
              displayClassName="text-xl font-semibold text-center"
              emptyText="New User"
              isLoading={updateProfile.isPending}
              isEditing={isEditing}
              onStartEdit={handleStartEdit}
              error={errors.name}
            />
          </div>
          <p className="text-sm text-emerald-200/70">{user.email}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-emerald-200/70 flex-shrink-0">Location:</span>
            <div className="flex-1 ml-2">
              <InlineEditField
                value={isEditing ? formData.location : profile?.location ?? ""}
                onChange={(value) => handleFieldChange("location", value)}
                fieldType="text"
                label="Location"
                placeholder="Enter your location"
                displayClassName="text-right"
                emptyText="Not specified"
                isLoading={updateProfile.isPending}
                isEditing={isEditing}
                onStartEdit={handleStartEdit}
                error={errors.location}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-emerald-200/70 flex-shrink-0">Phone:</span>
            <div className="flex-1 ml-2">
              <InlineEditField
                value={isEditing ? formData.phone : profile?.phone ?? ""}
                onChange={(value) => handleFieldChange("phone", value)}
                fieldType="tel"
                label="Phone"
                placeholder="Enter your phone number"
                displayClassName="text-right"
                emptyText="Not specified"
                isLoading={updateProfile.isPending}
                isEditing={isEditing}
                onStartEdit={handleStartEdit}
                error={errors.phone}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium text-emerald-200/70 flex-shrink-0">Website:</span>
            <div className="flex-1 ml-2">
              <InlineEditField
                value={isEditing ? formData.website : profile?.website ?? ""}
                onChange={(value) => handleFieldChange("website", value)}
                fieldType="url"
                label="Website"
                placeholder="Enter your website URL"
                displayClassName="text-right"
                emptyText="Not specified"
                isLoading={updateProfile.isPending}
                isEditing={isEditing}
                onStartEdit={handleStartEdit}
                error={errors.website}
              />
            </div>
          </div>
          
          <div className="border-t border-emerald-700/30 pt-3">
            <span className="block font-medium text-emerald-200/70 mb-2">Bio:</span>
            <InlineEditField
              value={isEditing ? formData.bio : profile?.bio ?? ""}
              onChange={(value) => handleFieldChange("bio", value)}
              fieldType="textarea"
              label="Bio"
              placeholder="Tell us about yourself..."
              maxLength={500}
              emptyText="No bio provided."
              isLoading={updateProfile.isPending}
              isEditing={isEditing}
              onStartEdit={handleStartEdit}
              error={errors.bio}
            />
          </div>
          
          {/* Global Save/Cancel Buttons */}
          {isEditing && (
            <div className="border-t border-emerald-700/30 pt-4 mt-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                  className="inline-flex items-center rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:bg-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2 focus:ring-offset-emerald-950/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-800/40 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 focus:ring-offset-emerald-950/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateProfile.isPending ? (
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
                      Saving...
                    </>
                  ) : (
                    <>
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
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center/Right Columns - Measurements & Form */}
      <div className="md:col-span-2">
        <div className="rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-xs">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Your Measurements
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Basic Measurements */}
            <MeasurementGroup title="Basic Measurements">
              <MeasurementItem label="Chest" value={measurements?.chest} />
              <MeasurementItem label="Waist" value={measurements?.waist} />
              <MeasurementItem label="Hips" value={measurements?.hips} />
              <MeasurementItem
                label="Shoulders"
                value={measurements?.shoulders}
              />
              <MeasurementItem label="Length" value={measurements?.length} />
              <MeasurementItem label="Inseam" value={measurements?.inseam} />
            </MeasurementGroup>

            {/* Upper Body Measurements */}
            <MeasurementGroup title="Upper Body">
              <MeasurementItem label="Neck" value={measurements?.neck} />
              <MeasurementItem
                label="Sleeve"
                value={measurements?.sleeve_length}
              />
              <MeasurementItem label="Bicep" value={measurements?.bicep} />
              <MeasurementItem label="Forearm" value={measurements?.forearm} />
              <MeasurementItem label="Wrist" value={measurements?.wrist} />
              <MeasurementItem
                label="Armhole"
                value={measurements?.armhole_depth}
              />
              <MeasurementItem
                label="Back Width"
                value={measurements?.back_width}
              />
              <MeasurementItem
                label="Chest Width"
                value={measurements?.front_chest_width}
              />
            </MeasurementGroup>

            {/* Lower Body Measurements */}
            <MeasurementGroup title="Lower Body">
              <MeasurementItem label="Thigh" value={measurements?.thigh} />
              <MeasurementItem label="Knee" value={measurements?.knee} />
              <MeasurementItem label="Calf" value={measurements?.calf} />
              <MeasurementItem label="Ankle" value={measurements?.ankle} />
              <MeasurementItem label="Rise" value={measurements?.rise} />
              <MeasurementItem label="Outseam" value={measurements?.outseam} />
            </MeasurementGroup>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Full Body Measurements */}
            <MeasurementGroup title="Full Body">
              <MeasurementItem label="Height" value={measurements?.height} />
              <MeasurementItem
                label="Weight"
                value={measurements?.weight}
                unit="lbs"
              />
            </MeasurementGroup>

            {/* Formal Wear */}
            <MeasurementGroup title="Formal Wear">
              <MeasurementItem
                label="Torso Length"
                value={measurements?.torso_length}
              />
              <MeasurementItem
                label="Shoulder Slope"
                value={measurements?.shoulder_slope}
              />
              <TextItem label="Posture" value={measurements?.posture} />
            </MeasurementGroup>

            {/* Preferences */}
            <MeasurementGroup title="Preferences">
              <TextItem label="Size" value={measurements?.size_preference} />
              <TextItem label="Fit" value={measurements?.fit_preference} />
            </MeasurementGroup>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/profile/measurements"
              className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Update Measurements
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper components for measurements display
function MeasurementGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-emerald-700/30 p-3">
      <h3 className="mb-2 text-sm font-medium text-emerald-200">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MeasurementItem({
  label,
  value,
  unit = "in",
}: {
  label: string;
  value?: number | null;
  unit?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-emerald-200/70">{label}:</span>
      <span className="font-medium text-white">
        {value ? `${value} ${unit}` : "—"}
      </span>
    </div>
  );
}

function TextItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-emerald-200/70">{label}:</span>
      <span className="font-medium text-white">{value ?? "—"}</span>
    </div>
  );
}
