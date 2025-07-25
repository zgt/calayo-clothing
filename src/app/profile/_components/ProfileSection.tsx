"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProfileForm from "./ProfileForm";
import type { ProfileMeasurements } from "../page";

type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
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

export default function ProfileSection({ profile, user, measurements }: ProfileSectionProps) {
  const [showProfileForm, setShowProfileForm] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Left Column - User Info */}
      <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-xs p-4 shadow-2xl border border-emerald-700/20">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-emerald-900/50">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={`${profile.full_name ?? 'User'}'s avatar`}
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-emerald-200">
                {profile?.full_name?.charAt(0) ?? user.email?.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-white">{profile?.full_name ?? "New User"}</h2>
          <p className="text-sm text-emerald-200/70">{user.email}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-emerald-200/70">Location:</span>
            <span className="text-white">{profile?.location ?? "Not specified"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-emerald-200/70">Phone:</span>
            <span className="text-white">{profile?.phone ?? "Not specified"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-emerald-200/70">Website:</span>
            <span className="text-white">{profile?.website ?? "Not specified"}</span>
          </div>
          <div className="border-t border-emerald-700/30 pt-3">
            <span className="block font-medium text-emerald-200/70">Bio:</span>
            <p className="mt-1 text-white">{profile?.bio ?? "No bio provided."}</p>
          </div>
          <div className="pt-3 text-center">
            <button
              onClick={() => setShowProfileForm(prev => !prev)}
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 focus:ring-offset-emerald-950/50 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Center/Right Columns - Measurements & Form */}
      <div className="md:col-span-2">
        <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-xs p-6 shadow-2xl border border-emerald-700/20">
          <h2 className="mb-4 text-xl font-semibold text-white">Your Measurements</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Basic Measurements */}
            <MeasurementGroup title="Basic Measurements">
              <MeasurementItem label="Chest" value={measurements?.chest} />
              <MeasurementItem label="Waist" value={measurements?.waist} />
              <MeasurementItem label="Hips" value={measurements?.hips} />
              <MeasurementItem label="Shoulders" value={measurements?.shoulders} />
              <MeasurementItem label="Length" value={measurements?.length} />
              <MeasurementItem label="Inseam" value={measurements?.inseam} />
            </MeasurementGroup>
            
            {/* Upper Body Measurements */}
            <MeasurementGroup title="Upper Body">
              <MeasurementItem label="Neck" value={measurements?.neck} />
              <MeasurementItem label="Sleeve" value={measurements?.sleeve_length} />
              <MeasurementItem label="Bicep" value={measurements?.bicep} />
              <MeasurementItem label="Forearm" value={measurements?.forearm} />
              <MeasurementItem label="Wrist" value={measurements?.wrist} />
              <MeasurementItem label="Armhole" value={measurements?.armhole_depth} />
              <MeasurementItem label="Back Width" value={measurements?.back_width} />
              <MeasurementItem label="Chest Width" value={measurements?.front_chest_width} />
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
              <MeasurementItem label="Weight" value={measurements?.weight} unit="lbs" />
            </MeasurementGroup>
            
            {/* Formal Wear */}
            <MeasurementGroup title="Formal Wear">
              <MeasurementItem label="Torso Length" value={measurements?.torso_length} />
              <MeasurementItem label="Shoulder Slope" value={measurements?.shoulder_slope} />
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
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Update Measurements
            </Link>
          </div>
        </div>
        
        {/* Profile Form */}
        {showProfileForm && (
          <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
            <h2 className="mb-4 text-xl font-semibold text-white">Edit Profile</h2>
            <ProfileForm profile={profile} user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components for measurements display
function MeasurementGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-emerald-700/30 p-3">
      <h3 className="mb-2 text-sm font-medium text-emerald-200">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

function MeasurementItem({ label, value, unit = "in" }: { label: string; value?: number | null; unit?: string }) {
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
      <span className="font-medium text-white">
        {value ?? "—"}
      </span>
    </div>
  );
} 