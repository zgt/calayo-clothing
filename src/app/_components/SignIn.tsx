"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  
  const handleSignIn = () => {
    router.push("/login");
  };
  
  return (
    <div className="flex space-x-3">
      <Link 
        href="/login" 
        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600/80 rounded-md hover:bg-emerald-600 transition-colors duration-200 shadow-sm"
      >
        Log in
      </Link>
      <Link 
        href="/signup" 
        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md hover:from-emerald-600 hover:to-teal-600 transition-colors duration-200 shadow-sm"
      >
        Sign up
      </Link>
    </div>
  );
}