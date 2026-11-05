'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { monsters, getTypeColor } from '@/lib/monsters';

export default function OnboardingPage() {
  const [selectedMonster, setSelectedMonster] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (selectedMonster === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedMonsterId: selectedMonster }),
      });

      if (response.ok) {
        window.location.href = '/';
        return;
      }
      setError('Could not save your choice. Please try again.');
    } catch {
      setError('Could not save your choice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selected = selectedMonster !== null ? monsters[selectedMonster] : null;

  return (
    // Column layout: header, scrollable grid, and a footer that always stays on screen
    // (fixes the Continue button falling below the fold at 125–135% display scaling).
    <main className="h-dvh flex flex-col bg-muted">
      <header className="shrink-0 px-4 pt-6 pb-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">Choose your GitMon</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a partner. It grows as you ship code on GitHub.
        </p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
        <div
          role="radiogroup"
          aria-label="GitMon"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pb-2"
        >
          {monsters.map(monster => {
            const isSelected = selectedMonster === monster.id;
            return (
              <button
                key={monster.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedMonster(monster.id)}
                className={`group rounded-xl border-2 p-3 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-transparent bg-card/60 hover:border-primary/40 hover:bg-card'
                }`}
              >
                <div className="w-20 h-20 mx-auto relative mb-2">
                  <Image
                    src={monster.src}
                    alt={monster.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                    sizes="80px"
                  />
                </div>
                <p className="text-sm font-medium text-foreground mb-2">
                  {isSelected ? '✓ ' : ''}
                  {monster.name}
                </p>
                <span
                  className={`px-2 py-1 rounded-full text-white text-xs font-medium uppercase ${getTypeColor(monster.type)}`}
                >
                  {monster.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="shrink-0 border-t bg-muted/95 backdrop-blur px-4 py-4 text-center space-y-2">
        <Button
          onClick={handleContinue}
          disabled={selected === null || isLoading}
          size="lg"
          className="px-8 w-full max-w-sm"
        >
          {isLoading
            ? 'Saving...'
            : selected
              ? `Continue with ${selected.name}`
              : 'Select a GitMon'}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-muted-foreground">
          created by{' '}
          <a
            href="https://x.com/IsabellaHermn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Isabella Herman
          </a>
        </p>
      </footer>
    </main>
  );
}
