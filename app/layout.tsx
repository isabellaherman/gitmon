import type { Metadata } from "next";
import { Silkscreen, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

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
      </head>
      <body
        className={`${silkscreen.variable} ${inter.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
