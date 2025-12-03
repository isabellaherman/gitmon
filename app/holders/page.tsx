"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSession } from "next-auth/react";
import { Github, Twitter, ArrowLeft, Globe } from "lucide-react";

export default function Holders() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header buttons */}
        <div className="flex justify-between mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => window.open('https://github.com/isabellaherman/gitmon', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors border border-border"
            >
              <Github size={20} />
              <span className="text-sm font-medium">GitHub</span>
            </button>

            <button
              onClick={() => window.open('https://x.com/gitmonsters', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors border border-border"
            >
              <Twitter size={20} />
              <span className="text-sm font-medium">X</span>
            </button>

            <button
              onClick={() => window.open('https://opensea.io/collection/gitmon', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors border border-border"
            >
              <Globe size={20} />
              <span className="text-sm font-medium">OpenSea</span>
            </button>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors border border-border"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Minecraftia, monospace' }}>
            GitMon: Adopt Collection
          </h1>
          <p className="text-muted-foreground">
            Support Open-source softwares and adopt a GitMon today.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Getting Started Group */}
          <div className="bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-primary" style={{ fontFamily: 'Minecraftia, monospace' }}>
              The idea behind Gitmon
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="getting-started-1">
                <AccordionTrigger>What is GitMon?</AccordionTrigger>
                <AccordionContent>
                  GitMon is a passion project aiming to grow into an open-source hub with tools developers actually use every day.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="getting-started-2">
                <AccordionTrigger>Is there any roadmap?</AccordionTrigger>
                <AccordionContent>
                  Yes. Our focus is to grow the community through the GitMon Leaderboard, positioning it as our top-of-funnel experience for developers. At the same time, we are working on an open-source command-line tool that brings useful interactions straight to the terminal and hackathon events.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Earning & Stats Group */}
          <div className="bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-primary" style={{ fontFamily: 'Minecraftia, monospace' }}>
              What do I get for supporting the GitMon project?
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="earning-1">
                <AccordionTrigger>Sponsorship visibility</AccordionTrigger>
                <AccordionContent>
                   Your name, project, or company is associated with the GitMon NFTs you hold on the GitDex, providing sponsor visibility within a highly targeted, niche developer audience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="earning-2">
                <AccordionTrigger>Governance</AccordionTrigger>
                <AccordionContent>
                  Help shape the future of GitMon. Holders can participate in decisions about utilities, features, ecosystem direction, and community growth.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="earning-3">
                <AccordionTrigger>Full IP rights</AccordionTrigger>
                <AccordionContent>
                  You can build and monetize anything with your GitMon (games, merch, stories, whatever you want) with a commercial license. We still keep the original GitMon IP, but you have full freedom to use your character.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="earning-4">
                <AccordionTrigger>Potential revenue participation</AccordionTrigger>
                <AccordionContent>
                  Holders may receive small revenue shares tied to their GitMon if/when we expand into official merch or broader IP initiatives. Our current priority is utility: building great tools for developers and growing the community.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-primary" style={{ fontFamily: 'Minecraftia, monospace' }}>
              About Sponsorship
            </h2>
            <Accordion type="single" collapsible className="w-full">

              <AccordionItem value="advanced-1">
                <AccordionTrigger>How many sponsor slots exist today?</AccordionTrigger>
                <AccordionContent>
                  There are 9 sponsor slots, with one slot linked to each GitMon.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced-2">
                <AccordionTrigger>Will there be new sponsor slots in the future?</AccordionTrigger>
                <AccordionContent>
                  No. The collection is permanently capped at 9 sponsor slots, keeping them scarce and protecting early holders. Even if we create new GitMonsters in the future, they won&apos;t have any sponsor slot tied to them.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced-3">
                <AccordionTrigger>Audience</AccordionTrigger>
                <AccordionContent>
                  GitMon’s community is intentionally developer-focused. Sponsorship is less about mass reach and more about positioning yourself within a very specific and engaged niche.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced-4">
                <AccordionTrigger>Will there be a mint? How many slots per wallet?</AccordionTrigger>
                <AccordionContent>
                  There is no mint. The collection consists of 9 NFTs already deployed. Ideally, we aim for a maximum of 2 per holder to keep distribution healthy and the community more balanced.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  );
}