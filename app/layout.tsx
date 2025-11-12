import type { Metadata } from "next";
import { Silkscreen, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import SupportCard from "@/components/SupportCard";
import { ThemeToggle } from "@/components/ThemeToggle";

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitMon - Open Source Coding Leaderboard",
  description: "GitMon transforms your GitHub activity into an open source game. Climb the leaderboard, evolve your GitMons, and compete to become the ultimate developer!",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

const themeInitializer = `(() => {
  try {
    const storageKey = "gitmon-theme";
    const stored = window.localStorage.getItem(storageKey);
    const supportsMatchMedia = typeof window.matchMedia === "function";
    const prefersDark = supportsMatchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (error) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.cdnfonts.com/css/minecraftia" rel="stylesheet" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body
        className={`${silkscreen.variable} ${inter.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <Providers>
          <ThemeToggle className="fixed right-4 top-4 z-50 shadow-sm" />
          {children}
          {/* Global SupportCard for modal trigger - only modal shows, not the card content */}
          <SupportCard hideCard={true} />
        </Providers>
      </body>
    </html>
  );
}
