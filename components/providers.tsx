"use client";

import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Analytics />
      </ThemeProvider>
    </SessionProvider>
  );
}