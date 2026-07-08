"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMobile } from "~/context/mobile-provider";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { isMobile } = useMobile();
  const pathname = usePathname();

  // Reset scroll to the top on every route change. The home page drives a
  // pinned GSAP/Lenis scroll timeline that hijacks the root scroll, so leaving
  // it via a deep-scrolled CTA otherwise carries that offset into the next
  // page and tucks its content up under the fixed nav.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return <main className={isMobile ? "" : "pt-16"}>{children}</main>;
}
