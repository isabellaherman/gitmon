

"use client";

import { Button } from "@/components/ui/button";
import { Instagram, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const monsters = [
  { id: 0, src: "/monsters/monster-000.png", name: "Shadrix" },
  { id: 1, src: "/monsters/monster-001-png.png", name: "Blazewyrm" },
  { id: 2, src: "/monsters/monster-002-png.png", name: "Crystalix" },
  { id: 3, src: "/monsters/monster-003-png.png", name: "Thornspike" },
  { id: 4, src: "/monsters/monster-004-png.png", name: "Volterra" },
  { id: 5, src: "/monsters/monster-005-png.png", name: "Aquarus" },
  { id: 6, src: "/monsters/monster-006-png.png", name: "Infernus" },
  { id: 7, src: "/monsters/monster-007.png", name: "Lumenis" },
  { id: 8, src: "/monsters/monster-008.png", name: "Spectra" },
];

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
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ selectedMonsterId: selectedMonster }),
        });

        if (response.ok) {
          window.location.href = "/";
        } else {
          console.error("Failed to save monster selection");
        }
      } catch (error) {
        console.error("Error saving monster selection:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-muted px-4 py-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Choose your GITMON</h1>
          <p className="text-muted-foreground">Your coding companion for the journey ahead</p>
        </div>

        <div className="grid grid-cols-3 gap-6 py-4 max-w-2xl mx-auto">
          {monsters.map((monster) => (
            <div
              key={monster.id}
              onClick={() => handleMonsterSelect(monster.id)}
              className={`
                group cursor-pointer transition-all duration-300 p-4 rounded-xl
                ${selectedMonster === monster.id
                  ? 'bg-primary/20 ring-2 ring-primary shadow-lg scale-105'
                  : 'bg-background hover:bg-accent hover:scale-102 hover:shadow-md'
                }
              `}
            >
              <div className="w-20 h-20 mx-auto rounded-xl bg-background/50 overflow-hidden relative mb-3">
                <Image
                  src={monster.src}
                  alt={monster.name}
                  fill
                  className="object-contain transition-transform group-hover:scale-110"
                  sizes="80px"
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                {monster.name}
              </p>
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
              ? "Saving..."
              : selectedMonster !== null
                ? `Continue with ${monsters[selectedMonster].name}`
                : 'Choose your GitMon'
            }
          </Button>

          {selectedMonster !== null && (
            <p className="text-sm text-muted-foreground">
              You selected {monsters[selectedMonster].name}! Ready to start your coding adventure?
            </p>
          )}
        </div>

        <div className="flex justify-center items-center gap-4 pt-8">
          <span className="text-sm text-muted-foreground">follow</span>
          <Button size="icon" variant="ghost">
            <X className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Instagram className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </main>
  );
}