'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import SponsorBar from '@/components/SponsorBar';
import MonsterGrid from '@/components/MonsterGrid';
import MonsterDetails from '@/components/MonsterDetails';
import FloatingBackButton from '@/components/FloatingBackButton';

const monsters = [
  { id: 0, src: '/monsters/monster-000.png', name: 'Shadrix', type: 'shadow' },
  { id: 1, src: '/monsters/monster-001-png.png', name: 'Fairy', type: 'fire' },
  { id: 2, src: '/monsters/monster-002-png.png', name: 'Crystalix', type: 'ice' },
  { id: 3, src: '/monsters/monster-003-png.png', name: 'Guarana', type: 'grass' },
  { id: 4, src: '/monsters/monster-004-png.png', name: 'Volterra', type: 'electric' },
  { id: 5, src: '/monsters/monster-005-png.png', name: 'Aquarus', type: 'water' },
  { id: 6, src: '/monsters/monster-006-png.png', name: 'Infernus', type: 'fire' },
  { id: 7, src: '/monsters/monster-007.png', name: 'Lumenis', type: 'grass' },
  { id: 8, src: '/monsters/monster-008.png', name: 'Spectra', type: 'psychic' },
];

export default function GitDexPage() {
  const [selectedMonster, setSelectedMonster] = useState<number>(8);
  const router = useRouter();

  const goToPreviousMonster = () => {
    setSelectedMonster(prev => (prev === 0 ? monsters.length - 1 : prev - 1));
  };

  const goToNextMonster = () => {
    setSelectedMonster(prev => (prev === monsters.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);

      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    }
  }, []);

  return (
    <>
      <SponsorBar />
      <FloatingBackButton />
      <main
        className="min-h-screen lg:min-h-screen bg-background"
        style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 relative">
            <div className="absolute left-0 top-0 hidden md:block">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
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

            <h1
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              GitDex
            </h1>
            <p className="text-muted-foreground">
              Discover all GitMon creatures and their unique abilities
            </p>
          </div>

          {/* Desktop Layout - Two Columns */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8">
            {/* Left Column - Monster Grid */}
            <div className="bg-card rounded-xl p-6">
              <h2
                className="text-xl font-bold mb-6"
                style={{ fontFamily: 'Minecraftia, monospace' }}
              >
                Select a GitMon
              </h2>
              <MonsterGrid
                monsters={monsters}
                selectedMonster={selectedMonster}
                onMonsterSelect={setSelectedMonster}
              />
            </div>

            {/* Right Column - Monster Details */}
            <div className="bg-card rounded-xl p-6">
              <MonsterDetails monster={monsters[selectedMonster]} />
            </div>
          </div>

          {/* Mobile Layout - Single Column with Navigation */}
          <div className="lg:hidden">
            <div className="flex flex-col h-[calc(100vh-140px)] max-h-screen">
              {/* Counter at top */}
              <div className="text-center mb-2 flex-shrink-0">
                <p
                  className="text-xs text-muted-foreground"
                  style={{ fontFamily: 'Minecraftia, monospace' }}
                >
                  {selectedMonster + 1} / {monsters.length}
                </p>
              </div>

              {/* Monster Details - Scrollable area */}
              <div className="bg-card rounded-xl p-4 flex-1 overflow-y-auto min-h-0">
                <MonsterDetails monster={monsters[selectedMonster]} />
              </div>

              {/* Navigation Buttons - Fixed at bottom */}
              <div className="flex items-center justify-between gap-4 mt-4 flex-shrink-0 pb-4">
                <Button
                  onClick={goToPreviousMonster}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 flex-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Previous
                </Button>

                <Button
                  onClick={goToNextMonster}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 flex-1"
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
