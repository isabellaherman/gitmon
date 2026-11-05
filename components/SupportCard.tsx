'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SupportCard() {
  return (
    <div className="mt-6 pt-6 border-t space-y-4">
      <div className="relative bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 overflow-hidden">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-26 h-26 z-10 opacity-80">
          <Image
            src="/monsters/monster-006-png.png"
            alt=""
            fill
            className="object-contain"
            sizes="104px"
          />
        </div>
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-26 h-26 z-10 opacity-80">
          <Image
            src="/monsters/monster-001-png.png"
            alt=""
            fill
            className="object-contain"
            sizes="104px"
          />
        </div>

        <div className="relative z-20 text-center px-6">
          <h4 className="font-semibold mb-2 text-sm">GitMon is open source</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Built in the open and kept running by sponsors. Want your project next to a GitMon?
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/holders">How sponsorship works</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
