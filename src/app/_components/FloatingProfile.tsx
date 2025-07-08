"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "~/context/auth";
import SignIn from "./SignIn";

export default function FloatingProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Get user data helper function
  const getUserData = () => {
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.user_metadata?.full_name as string | undefined,
      email: user.email,
      role: user.role
    };
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error instanceof Error ? error.message : String(error));
    }
  };
  
  // Check if user is admin via server-side API
  useEffect(() => {
    if (user) {
      const checkAdminStatus = async () => {
        try {
          const response = await fetch('/api/auth/admin-check');
          if (response.ok) {
            const data = await response.json() as { isAdmin: boolean };
            setIsAdmin(data.isAdmin);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      };
      
      void checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // If not logged in, show SignIn component in a floating container
  if (!user) {
    return (
      <div className="fixed top-6 right-6 z-40">
        <div className="bg-emerald-900/20 border border-emerald-800/30 backdrop-blur-lg rounded-xl p-4 shadow-lg">
          <SignIn />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-40" id="floating-profile" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 focus:outline-none bg-emerald-900/20 border border-emerald-800/30 backdrop-blur-lg rounded-full p-2 shadow-lg hover:bg-emerald-800/30 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-medium shadow-lg">
          {user.email?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 text-emerald-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      
      {/* Dropdown Menu - Only shown when dropdown is open */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-emerald-900/20 border border-emerald-800/30 backdrop-blur-lg rounded-lg shadow-xl py-1 z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <div className="px-4 py-2 text-sm text-emerald-100 border-b border-emerald-800/30">
            <div className="font-medium">{getUserData()?.name ?? 'User'}</div>
            <div className="text-xs text-emerald-200/60 truncate">{getUserData()?.email}</div>
          </div>
          
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-emerald-100/80 hover:bg-emerald-800/20 hover:text-white transition-colors"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Your Profile
          </Link>
          
          <Link
            href="/profile/settings"
            className="block px-4 py-2 text-sm text-emerald-100/80 hover:bg-emerald-800/20 hover:text-white transition-colors"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          
          {/* Admin Navigation - Only shown if user is admin */}
          {isAdmin && (
            <div className="border-t border-emerald-800/30 pt-1 mt-1">
              <Link
                href="/admin/orders"
                className="flex items-center px-4 py-2 text-sm text-purple-300 hover:bg-purple-800/20 hover:text-white transition-colors"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Admin Dashboard
              </Link>
            </div>
          )}
          
          <div className="border-t border-emerald-800/30 pt-1 mt-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
              role="menuitem"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}