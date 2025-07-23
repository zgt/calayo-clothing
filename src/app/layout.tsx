import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import Nav from "~/app/_components/Nav";
import FloatingProfile from "~/app/_components/FloatingProfile";
import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/context/better-auth";
import { MobileProvider } from "~/context/mobile-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/server/uploadthing";
import ShaderGradientBackground from "./_components/ShaderGradient";
import MainContent from "./_components/MainContent";

export const metadata: Metadata = {
  title: "Calayo Clothing",
  description: "Custom made clothing for your unique style",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            <MobileProvider>
              <NextSSRPlugin
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              <Nav />
              <FloatingProfile />
              <ShaderGradientBackground />
              <MainContent>{children}</MainContent>
              <Toaster />
              <SpeedInsights />
            </MobileProvider>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
