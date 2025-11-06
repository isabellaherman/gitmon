'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';

const monsters = [
  { id: 0, src: '/monsters/monster-000.png', name: 'Shadrix', type: 'shadow' },
  { id: 1, src: '/monsters/monster-001-png.png', name: 'Fairy', type: 'fire' },
  {
    id: 2,
    src: '/monsters/monster-002-png.png',
    name: 'Crystalix',
    type: 'ice',
  },
  {
    id: 3,
    src: '/monsters/monster-003-png.png',
    name: 'Guarana',
    type: 'grass',
  },
  {
    id: 4,
    src: '/monsters/monster-004-png.png',
    name: 'Volterra',
    type: 'electric',
  },
  {
    id: 5,
    src: '/monsters/monster-005-png.png',
    name: 'Aquarus',
    type: 'water',
  },
  {
    id: 6,
    src: '/monsters/monster-006-png.png',
    name: 'Infernus',
    type: 'fire',
  },
  { id: 7, src: '/monsters/monster-007.png', name: 'Lumenis', type: 'grass' },
  { id: 8, src: '/monsters/monster-008.png', name: 'Spectra', type: 'psychic' },
];

const getTypeColor = (type: string) => {
  const colors = {
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    grass: 'bg-green-500',
    electric: 'bg-yellow-500',
    ice: 'bg-cyan-500',
    psychic: 'bg-purple-500',
    shadow: 'bg-gray-800',
    light: 'bg-yellow-300',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-500';
};

export default function OnboardingPage() {
  const [selectedMonster, setSelectedMonster] = useState<number | null>(null);

  const handleMonsterSelect = (monsterId: number) => {
    setSelectedMonster(monsterId);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (selectedMonster !== null) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ selectedMonsterId: selectedMonster }),
        });

        if (response.ok) {
          window.location.href = '/';
        } else {
          console.error('Failed to save monster selection');
        }
      } catch (error) {
        console.error('Error saving monster selection:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="bg-muted grid h-screen place-items-center overflow-hidden px-4 py-4">
      <div className="w-full max-w-4xl space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Choose your GITMON</h1>
        </div>

        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-4 py-2">
          {monsters.map(monster => (
            <div
              key={monster.id}
              onClick={() => handleMonsterSelect(monster.id)}
              className={`group cursor-pointer p-2 text-center transition-all duration-300 ${
                selectedMonster === monster.id
                  ? 'ring-primary scale-105 shadow-lg ring-2'
                  : 'hover:scale-102'
              } `}
            >
              <div className="relative mx-auto mb-3 h-20 w-20">
                <Image
                  src={monster.src}
                  alt={monster.name}
                  fill
                  className="object-contain transition-transform group-hover:scale-110"
                  sizes="80px"
                />
              </div>
              <p className="text-foreground mb-2 text-sm font-medium">
                {monster.name}
              </p>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium text-white uppercase ${getTypeColor(monster.type)}`}
              >
                {monster.type}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            disabled={selectedMonster === null || isLoading}
            size="lg"
            className="px-8"
          >
            {isLoading
              ? 'Saving...'
              : selectedMonster !== null
                ? `Continue with ${monsters[selectedMonster].name}`
                : 'Choose your GitMon'}
          </Button>
        </div>

        <div className="flex items-center justify-center pt-8">
          <span className="text-muted-foreground text-sm">
            created by{' '}
            <a
              href="https://x.com/IsabellaHermn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Isabella Herman
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}
