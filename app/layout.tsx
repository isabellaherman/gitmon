import type { Metadata } from 'next';

import { Inter, Silkscreen } from 'next/font/google';

import { Providers } from '@/components/providers';

import './globals.css';

const silkscreen = Silkscreen({
  variable: '--font-silkscreen',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GitMon - Level Up Your Code',
  description: 'Gamify your coding journey with GitMon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/minecraftia"
          rel="stylesheet"
        />
      </head>
      <body className={`${silkscreen.variable} ${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
