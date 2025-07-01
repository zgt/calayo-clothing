"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";

export default function Nav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if we're on the login page
  const isLoginPage = pathname === "/login";
  
  // Active link style helper
  const active = (path: string) =>
    path === pathname 
      ? "border-emerald-400 text-white font-medium" 
      : "border-transparent text-emerald-100/80 hover:border-emerald-400/70 hover:text-white";
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 backdrop-blur-md shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and Navigation links */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/nested_green_Cs.svg"
              alt="Calayo Clothing Logo"
              width={32}
              height={32}
              className="text-emerald-800"
            />
            <span className="ml-2 text-xl font-bold text-white">Calayo Clothing</span>
          </Link>

          {/* Navigation links */}
          <ul className="hidden md:flex items-center space-x-6">
            <li className={`border-b-2 py-2 transition-colors duration-200 ${active("/")}`}>
              <Link href="/" className="px-1">Home</Link>
            </li>
            <li className={`border-b-2 py-2 transition-colors duration-200 ${active("/commissions")}`}>
              <Link href="/commissions" className="px-1">Commissions</Link>
            </li>
            <li className={`border-b-2 py-2 transition-colors duration-200 ${active("/features")}`}>
              <Link href="/features" className="px-1">Features</Link>
            </li>
            <li className={`border-b-2 py-2 transition-colors duration-200 ${active("/about")}`}>
              <Link href="/about" className="px-1">About me</Link>
            </li>
          </ul>
        </div>

        {/* Right side - Profile */}
        <div className="flex items-center">
          {!isLoginPage && (
            <div className="flex items-center">
              <ProfileDropdown />
            </div>
          )}
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="ml-4 md:hidden rounded-lg p-2 text-emerald-100 hover:bg-emerald-700/50 hover:text-white"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-emerald-800/30 backdrop-blur-md pb-3`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md ${
              pathname === "/" 
                ? "bg-emerald-700 text-white" 
                : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/commissions" 
            className={`block px-3 py-2 rounded-md ${
              pathname === "/commissions" 
                ? "bg-emerald-700 text-white" 
                : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Commissions
          </Link>
          <Link 
            href="/features" 
            className={`block px-3 py-2 rounded-md ${
              pathname === "/features" 
                ? "bg-emerald-700 text-white" 
                : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link 
            href="/about" 
            className={`block px-3 py-2 rounded-md ${
              pathname === "/about" 
                ? "bg-emerald-700 text-white" 
                : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About me
          </Link>
        </div>
      </div>
    </nav>
  );
}