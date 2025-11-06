'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';

export default function SupportCard() {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <div className="mt-6 border-t pt-6">
        <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6">
          {/* Left Monster - Infernus */}
          <div className="absolute top-1/2 -left-6 z-10 h-26 w-26 -translate-y-1/2 transform">
            <Image
              src="/monsters/monster-006-png.png"
              alt="Infernus"
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>

          {/* Right Monster - Fairy */}
          <div className="absolute top-1/2 -right-6 z-10 h-26 w-26 -translate-y-1/2 transform">
            <Image
              src="/monsters/monster-001-png.png"
              alt="Fairy"
              fill
              className="object-contain"
              sizes="104px"
            />
          </div>

          {/* Card Content */}
          <div className="relative z-20 px-6 text-center">
            <h4 className="mb-3 text-sm font-semibold">
              Support the project and own a GitMon and its IP
            </h4>
            <div className="mb-4">
              <p className="text-sm font-semibold text-green-500">
                2/2 slots available
              </p>
            </div>

            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => setShowSupportModal(true)}
            >
              Let&apos;s Go
            </Button>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Advertise on GitMon</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">OWN A GITMON</h3>
                    <span className="text-xl font-semibold text-green-500 uppercase">
                      $399 LIFETIME
                    </span>
                  </div>
                  <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                    <p>
                      <b>
                        Sponsor your name, project, or link on dedicated GitMon
                        screens
                      </b>
                      , shown alongside the monster&apos;s stats in places like
                      the Character Selection and GitDex pages.
                    </p>
                    <p>
                      <b>Own its IP:</b> get the rights to that specific
                      character (its name, design, and identity) to use in your
                      own projects, branding, or creative work, including
                      commercial use.
                    </p>
                  </div>
                  <p
                    className="mt-3 text-sm font-semibold text-blue-500"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    2/2 slots available
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">RENT A GITMON</h3>
                    <span className="text-xl font-semibold text-green-500 uppercase">
                      $65/MONTHLY
                    </span>
                  </div>
                  <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                    <p>
                      <b>
                        Sponsor your name, project, or link on dedicated GitMon
                        screens
                      </b>
                      , shown alongside the monster&apos;s stats in places like
                      the Character Selection and GitDex pages.
                    </p>
                  </div>
                  <p
                    className="mt-3 text-sm font-semibold text-red-500"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    1/3 slots available
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowSupportModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() =>
                        window.open('https://x.com/isahermanx', '_blank')
                      }
                      className="flex-1 bg-blue-500 hover:bg-green-500"
                    >
                      SUPPORT OPEN SOURCE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
