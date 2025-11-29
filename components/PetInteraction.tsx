import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface PetInteractionProps {
  monsterName: string;
  onStreakUpdate?: () => void;
}

interface DailyProgress {
  date: string;
  interactions: { feed: boolean; pet: boolean; play: boolean };
}

export default function PetInteraction({ monsterName, onStreakUpdate }: PetInteractionProps) {
  const { data: session } = useSession();
  const [lastInteraction, setLastInteraction] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const today = new Date().toDateString();

  // Load daily progress from localStorage or initialize
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gitmon-daily-progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's from today, if not reset
        if (parsed.date === today) {
          return parsed;
        }
      }
    }
    return {
      date: today,
      interactions: { feed: false, pet: false, play: false },
    };
  });

  // Save daily progress to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gitmon-daily-progress', JSON.stringify(dailyProgress));
    }
  }, [dailyProgress]);

  // Sync streak with database
  const syncStreakToDatabase = async (newStreak: number, allComplete: boolean) => {
    if (!session?.user?.email || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStreak: newStreak,
          allInteractionsComplete: allComplete,
        }),
      });

      if (response.status === 429) {
        console.warn('Rate limited - please wait before making more requests');
        return;
      }

      // Notify parent component to refresh streak data
      if (onStreakUpdate) {
        onStreakUpdate();
      }
    } catch (error) {
      console.error('Failed to sync streak:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load streak from database on component mount
  useEffect(() => {
    const loadStreak = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch('/api/streak');
        if (response.ok) {
          const data = await response.json();
          setCurrentStreak(data.currentStreak);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load streak:', error);
        setIsLoaded(true);
      }
    };

    loadStreak();
  }, [session]);

  // Check if new day and reset progress
  useEffect(() => {
    if (dailyProgress.date !== today && isLoaded && session?.user?.email) {
      // Reset daily progress for new day and clear localStorage for old date
      const newProgress = {
        date: today,
        interactions: { feed: false, pet: false, play: false },
      };
      setDailyProgress(newProgress);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gitmon-daily-progress', JSON.stringify(newProgress));
      }
    }
  }, [today, dailyProgress.date, isLoaded, session?.user?.email]);

  const handleInteraction = (type: 'feed' | 'pet' | 'play') => {
    // Check if already done today or currently processing
    if (dailyProgress.interactions[type] || isProcessing) return;

    const messages = {
      feed: [
        `${monsterName} happily chomps on the treat!`,
        `${monsterName} loves the snack!`,
        `Nom nom nom! ${monsterName} is satisfied!`,
      ],
      pet: [
        `${monsterName} purrs with contentment!`,
        `${monsterName} nuzzles your hand!`,
        `${monsterName} feels loved!`,
      ],
      play: [
        `${monsterName} bounces around excitedly!`,
        `${monsterName} does a little dance!`,
        `${monsterName} is having so much fun!`,
      ],
    };

    const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];

    // Check if this is the first interaction of the day
    const hadAnyInteraction = Object.values(dailyProgress.interactions).some(Boolean);
    const isFirstInteractionToday = !hadAnyInteraction;

    // Update daily progress
    setDailyProgress(prev => ({
      ...prev,
      interactions: { ...prev.interactions, [type]: true },
    }));

    // If this is the first interaction today, update streak
    if (isFirstInteractionToday) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      syncStreakToDatabase(newStreak, false);
    }

    // Show interaction message
    setLastInteraction(randomMessage);

    // Clear message after 3 seconds
    setTimeout(() => setLastInteraction(null), 3000);
  };

  const anyInteractionDone = Object.values(dailyProgress.interactions).some(Boolean);
  const allInteractionsComplete = Object.values(dailyProgress.interactions).every(Boolean);

  return (
    <div className="space-y-4">
      {/* Interaction Message */}
      {lastInteraction && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center animate-in fade-in duration-300">
          <p className="text-sm text-green-800">{lastInteraction}</p>
        </div>
      )}

      {/* Daily Progress */}
      <div className="text-center text-xs text-muted-foreground">
        {allInteractionsComplete && (
          <span className="text-green-600">{monsterName} will be waiting for you tomorrow.</span>
        )}
      </div>

      {/* Interaction Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleInteraction('feed')}
          disabled={dailyProgress.interactions.feed || isProcessing}
          className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-orange-50 disabled:opacity-50"
        >
          <Image
            src="/pixel assets/feed.png"
            alt="Feed"
            width={24}
            height={24}
            className="pixelated"
          />
          <span className="text-xs">Feed</span>
          <span className="text-xs text-muted-foreground">
            {dailyProgress.interactions.feed ? 'Done' : 'Available'}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleInteraction('pet')}
          disabled={dailyProgress.interactions.pet || isProcessing}
          className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-pink-50 disabled:opacity-50"
        >
          <Image
            src="/pixel assets/pet.png"
            alt="Pet"
            width={24}
            height={24}
            className="pixelated"
          />
          <span className="text-xs">Pet</span>
          <span className="text-xs text-muted-foreground">
            {dailyProgress.interactions.pet ? 'Done' : 'Available'}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleInteraction('play')}
          disabled={dailyProgress.interactions.play || isProcessing}
          className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 disabled:opacity-50"
        >
          <Image
            src="/pixel assets/play.png"
            alt="Play"
            width={24}
            height={24}
            className="pixelated"
          />
          <span className="text-xs">Play</span>
          <span className="text-xs text-muted-foreground">
            {dailyProgress.interactions.play ? 'Done' : 'Available'}
          </span>
        </Button>
      </div>
    </div>
  );
}
