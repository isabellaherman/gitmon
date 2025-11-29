'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function FloatingBackButton() {
  const router = useRouter();

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <Button
        onClick={() => router.push('/')}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back
      </Button>
    </div>
  );
}
