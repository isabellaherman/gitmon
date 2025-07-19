

"use client";

import { Button } from "@/components/ui/button";
import { Instagram, X } from "lucide-react";
import Image from "next/image";

const monsters = [
  "/monsters/monster1.png",
  "/monsters/monster2.png",
  "/monsters/monster3.png",
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-muted px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold">Choose your GITMON</h1>

        <div className="flex justify-center gap-6 py-4">
          {monsters.map((src, idx) => (
            <div
              key={idx}
              className="w-24 h-24 rounded-xl bg-background overflow-hidden relative"
            >
              <Image
                src={src}
                alt={`Monster ${idx + 1}`}
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-sm">— more monsters soon —</p>

        <div className="flex justify-center items-center gap-4">
          <span className="text-sm">follow</span>
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