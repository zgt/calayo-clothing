"use client";

import React from "react";

export default function LoadingAnimation() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
}
