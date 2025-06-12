import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Nav from "~/app/_components/Nav";
import { TRPCReactProvider } from "~/trpc/react";
import { SupabaseProvider } from "~/context/supabase-provider";
import { AuthProvider } from "~/context/auth";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/server/uploadthing";

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
          <SupabaseProvider>
            <AuthProvider>
              <NextSSRPlugin
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              <Nav />
              <main className="pt-16">
                {children}
              </main>
              <Toaster />
              <SpeedInsights />
            </AuthProvider>
          </SupabaseProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
