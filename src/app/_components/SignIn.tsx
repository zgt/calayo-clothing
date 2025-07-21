"use client";

import Link from "next/link";

export default function SignIn() {
  return (
    <div className="flex space-x-3">
      <Link
        href="/login"
        className="rounded-md bg-emerald-600/80 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-emerald-600"
      >
        Log in
      </Link>
    </div>
  );
}
