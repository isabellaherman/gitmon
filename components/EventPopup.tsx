'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

interface EventPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventPopup({ isOpen, onClose }: EventPopupProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleJoinEvent = () => {
    router.push('/event');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl max-w-md w-full mx-auto relative shadow-2xl border">
        {/* Content */}
        <div className="p-6 text-center">
          {/* Warning */}
          <div className="mb-4">
            <span
              className="text-red-600 text-xs font-bold"
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              WARNING
            </span>
          </div>

          {/* Title */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-80 rounded-lg"></div>
            <h1
              className="relative text-2xl md:text-3xl font-bold text-white py-3 px-4"
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              CALLING ALL GIT TRAINERS!
            </h1>
          </div>

          {/* Monster Image */}
          <div className="w-40 h-40 mx-auto mb-4">
            <Image
              src="/events/MadMonkey.png"
              alt="Mad Monkey"
              width={160}
              height={160}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              The <strong>Mad Monkey</strong> has emerged bringing chaos to the GitMon realm
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 items-center">
            <Button onClick={onClose} variant="outline" size="sm">
              Cancel
            </Button>

            <Button
              onClick={handleJoinEvent}
              size="lg"
              className="flex-1 px-8 py-3 text-lg font-bold"
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              JOIN EVENT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
