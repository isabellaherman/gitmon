"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SponsorBar from "@/components/SponsorBar";
import MonsterGrid from "@/components/MonsterGrid";
import MonsterDetails from "@/components/MonsterDetails";

const monsters = [
  { id: 0, src: "/monsters/monster-000.png", name: "Shadrix", type: "shadow" },
  { id: 1, src: "/monsters/monster-001-png.png", name: "Fairy", type: "fire" },
  { id: 2, src: "/monsters/monster-002-png.png", name: "Crystalix", type: "ice" },
  { id: 3, src: "/monsters/monster-003-png.png", name: "Guarana", type: "grass" },
  { id: 4, src: "/monsters/monster-004-png.png", name: "Volterra", type: "electric" },
  { id: 5, src: "/monsters/monster-005-png.png", name: "Aquarus", type: "water" },
  { id: 6, src: "/monsters/monster-006-png.png", name: "Infernus", type: "fire" },
  { id: 7, src: "/monsters/monster-007.png", name: "Lumenis", type: "grass" },
  { id: 8, src: "/monsters/monster-008.png", name: "Spectra", type: "psychic" },
];

export default function GitDexPage() {
  const [selectedMonster, setSelectedMonster] = useState<number>(0); // First monster selected by default
  const router = useRouter();

  return (
    <>
      <SponsorBar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 relative">
            {/* Back Button - Positioned absolutely */}
            <div className="absolute left-0 top-0">
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
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back
              </Button>
            </div>

            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Minecraftia, monospace' }}>
              GitDex
            </h1>
            <p className="text-muted-foreground">
              Discover all GitMon creatures and their unique abilities
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Monster Grid */}
            <div className="bg-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Minecraftia, monospace' }}>
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
              <MonsterDetails
                monster={monsters[selectedMonster]}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}