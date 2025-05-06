"use client";

// src/app/profile/_components/ProfileForm.tsx
import { useState } from "react";
import { createClient } from "~/utils/supabase/client";

type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  phone?: string | null;
  [key: string]: unknown; // For other potential fields
};

type User = {
  id: string;
  email?: string;
};

interface ProfileFormProps {
  profile: Profile | null;
  user: User;
}

export default function ProfileForm({ profile, user }: ProfileFormProps) {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name ?? "",
    location: profile?.location ?? "",
    phone: profile?.phone ?? "",
    website: profile?.website ?? "",
    bio: profile?.bio ?? "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      // If profile doesn't exist yet, create it
      if (!profile) {
        const { error } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email,
              ...formData
            }
          ]);
          
        if (error) throw error;
      } else {
        // Otherwise update the existing profile
        const { error } = await supabase
          .from("profiles")
          .update(formData)
          .eq("id", user.id);
          
        if (error) throw error;
      }
      
      setMessage({
        text: "Profile updated successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        text: "Failed to update profile. Please try again.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      if (message.type === "success") {
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message.text && (
        <div 
          className={`rounded-md p-3 ${
            message.type === "success" 
              ? "bg-emerald-900/50 text-emerald-200 border border-emerald-700/30" 
              : "bg-red-900/50 text-red-200 border border-red-700/30"
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-emerald-200">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-3 py-2 text-emerald-100 placeholder:text-emerald-600/50 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-emerald-200">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-3 py-2 text-emerald-100 placeholder:text-emerald-600/50 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-emerald-200">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-3 py-2 text-emerald-100 placeholder:text-emerald-600/50 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
      
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-emerald-200">
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-3 py-2 text-emerald-100 placeholder:text-emerald-600/50 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-emerald-200">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-3 py-2 text-emerald-100 placeholder:text-emerald-600/50 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 focus:ring-offset-emerald-950/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}