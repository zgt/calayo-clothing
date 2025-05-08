"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";

export default function Nav() {
  const pathname = usePathname();
  
  // Check if we're on the login page
  const isLoginPage = pathname === "/login";
  
  // Active link style helper
  const active = (path: string) =>
    path === pathname 
      ? "border-emerald-400 text-white font-medium" 
      : "border-transparent text-emerald-100/80 hover:border-emerald-400/70 hover:text-white";
  
  return (
    <nav className="bg-gradient-to-r from-emerald-900 to-emerald-800 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and Navigation links */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
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
          <button className="ml-4 md:hidden rounded-lg p-2 text-emerald-100 hover:bg-emerald-700/50 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile navigation menu - hidden by default */}
      <div className="hidden md:hidden bg-emerald-800 pb-3">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md ${pathname === "/" ? "bg-emerald-700 text-white" : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"}`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`block px-3 py-2 rounded-md ${pathname === "/about" ? "bg-emerald-700 text-white" : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"}`}
          >
            About
          </Link>
          <Link 
            href="/features" 
            className={`block px-3 py-2 rounded-md ${pathname === "/features" ? "bg-emerald-700 text-white" : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"}`}
          >
            Features
          </Link>
          <Link 
            href="/contact" 
            className={`block px-3 py-2 rounded-md ${pathname === "/contact" ? "bg-emerald-700 text-white" : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"}`}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}