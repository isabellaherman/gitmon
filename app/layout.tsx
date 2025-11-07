import type { Metadata } from "next";
import { Silkscreen, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import SupportCard from "@/components/SupportCard";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/minecraftia" rel="stylesheet" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body
        className={`${silkscreen.variable} ${inter.variable} antialiased`}
      >
        <Providers>
          {children}
          {/* Global SupportCard for modal trigger - only modal shows, not the card content */}
          <SupportCard hideCard={true} />
        </Providers>
      </body>
    </html>
  );
}
