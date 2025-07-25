"use client";

import { useMobile } from "~/context/mobile-provider";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { isMobile } = useMobile();

  return <main className={isMobile ? "" : "pt-16"}>{children}</main>;
}
