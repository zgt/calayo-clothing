"use client";

import Link from "next/link";

export default function SignIn() {
  

  return (
    <div className="flex space-x-3">
      <Link 
        href="/login" 
        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600/80 rounded-md hover:bg-emerald-600 transition-colors duration-200 shadow-sm"
      >
        Log in
      </Link>
    </div>
  );
}