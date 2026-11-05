'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSession } from 'next-auth/react';
import { Github, Twitter, ArrowLeft } from 'lucide-react';

export default function Holders() {
  const { status } = useSession();

  if (status === 'loading') {
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
        <div className="flex flex-wrap gap-3 justify-between mb-8">
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/isabellaherman/gitmon"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors border border-border"
            >
              <Github size={20} />
              <span className="text-sm font-medium">GitHub</span>
            </a>

            <a
              href="https://x.com/gitmonsters"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors border border-border"
            >
              <Twitter size={20} />
              <span className="text-sm font-medium">X</span>
            </a>
          </div>

          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-colors border border-border"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
            style={{ fontFamily: 'Minecraftia, monospace' }}
          >
            Sponsor GitMon
          </h1>
          <p className="text-muted-foreground">
            GitMon is a free, open-source project. Sponsors help keep it running.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Getting Started Group */}
          <div className="bg-card rounded-xl p-6">
            <h2
              className="text-xl font-bold mb-4 text-primary"
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              The idea behind Gitmon
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="getting-started-1">
                <AccordionTrigger>What is GitMon?</AccordionTrigger>
                <AccordionContent>
                  GitMon is a passion project aiming to grow into an open-source hub with tools
                  developers actually use every day.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="getting-started-2">
                <AccordionTrigger>Is there any roadmap?</AccordionTrigger>
                <AccordionContent>
                  Yes. Our focus is to grow the community through the GitMon Leaderboard,
                  positioning it as our top-of-funnel experience for developers. At the same time,
                  we are working on an open-source command-line tool that brings useful interactions
                  straight to the terminal and hackathon events.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-card rounded-xl p-6">
            <h2
              className="text-xl font-bold mb-4 text-primary"
              style={{ fontFamily: 'Minecraftia, monospace' }}
            >
              How sponsorship works
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="sponsor-1">
                <AccordionTrigger>What does a sponsor get?</AccordionTrigger>
                <AccordionContent>
                  Your name, project, or company is shown next to a GitMon on the GitDex, in front
                  of a small, developer-focused audience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sponsor-2">
                <AccordionTrigger>Who owns the GitMon characters?</AccordionTrigger>
                <AccordionContent>
                  The original GitMon characters and art remain part of the GitMon project. Any
                  usage rights that come with a sponsorship are agreed in writing, case by case,
                  before anything is paid. Nothing on this page is a license by itself.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sponsor-3">
                <AccordionTrigger>Is there a marketplace listing?</AccordionTrigger>
                <AccordionContent>
                  Not right now. There is no checkout and no GitMon is currently listed for sale. If
                  you are interested, get in touch and we&apos;ll talk it through.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sponsor-4">
                <AccordionTrigger>How do I get in touch?</AccordionTrigger>
                <AccordionContent>
                  Reach out to{' '}
                  <a
                    href="https://x.com/gitmonsters"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    @gitmonsters
                  </a>{' '}
                  or open a discussion on{' '}
                  <a
                    href="https://github.com/isabellaherman/gitmon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    GitHub
                  </a>
                  . Contributing code, art, or ideas is just as welcome as money.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </main>
  );
}
