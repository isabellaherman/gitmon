'use client';

import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Analytics />
    </SessionProvider>
  );
}
