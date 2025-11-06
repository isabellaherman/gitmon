'use client';

import { useState } from 'react';

interface AdoptionStatusProps {
  monsterName: string;
  adoptionData?: {
    sponsorName: string;
    sponsorUrl: string;
  };
}

export default function AdoptionStatus({
  monsterName,
  adoptionData,
}: AdoptionStatusProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);

  if (adoptionData) {
    return (
      <div className="mb-4 text-center">
        <p
          className="text-xs text-green-600"
          style={{ fontFamily: 'Minecraftia, monospace' }}
        >
          ADOPTED BY{' '}
          <a
            href={adoptionData.sponsorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {adoptionData.sponsorName}
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-center">
        <button
          onClick={() => setShowSupportModal(true)}
          className="text-muted-foreground hover:text-primary text-xs underline transition-colors hover:no-underline"
          style={{ fontFamily: 'Minecraftia, monospace' }}
        >
          ADOPT {monsterName.toUpperCase()}
        </button>
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
                    <button
                      onClick={() => setShowSupportModal(false)}
                      className="border-muted hover:bg-muted/50 flex-1 rounded-lg border px-4 py-2 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() =>
                        window.open('https://x.com/isahermanx', '_blank')
                      }
                      className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-green-500"
                    >
                      SUPPORT OPEN SOURCE
                    </button>
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
