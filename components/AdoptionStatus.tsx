"use client";

import { useState } from "react";

interface AdoptionStatusProps {
  monsterName: string;
  adoptionData?: {
    sponsorName: string;
    sponsorUrl: string;
  };
}

export default function AdoptionStatus({ monsterName, adoptionData }: AdoptionStatusProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);

  if (adoptionData) {
    return (
      <div className="text-center mb-4">
        <p className="text-xs text-green-600" style={{ fontFamily: 'Minecraftia, monospace' }}>
          ADOPTED BY{" "}
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
      <div className="text-center mb-4">
        <button
          onClick={() => setShowSupportModal(true)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline hover:no-underline"
          style={{ fontFamily: 'Minecraftia, monospace' }}
        >
          ADOPT {monsterName.toUpperCase()}
        </button>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Advertise on GitMon</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">OWN A GITMON</h3>
                    <span className="text-green-500 font-semibold text-xl uppercase">$399 LIFETIME</span>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      <b>Sponsor your name, project, or link on dedicated GitMon screens</b>, shown alongside the monster&apos;s stats in places like the Character Selection and GitDex pages.
                    </p>
                    <p>
                      <b>Own its IP:</b> get the rights to that specific character (its name, design, and identity) to use in your own projects, branding, or creative work, including commercial use.
                    </p>
                  </div>
                  <p className="text-blue-500 font-semibold text-sm mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    2/2 slots available
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">RENT A GITMON</h3>
                    <span className="text-green-500 font-semibold text-xl uppercase">$65/MONTHLY</span>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      <b>Sponsor your name, project, or link on dedicated GitMon screens</b>, shown alongside the monster&apos;s stats in places like the Character Selection and GitDex pages.
                    </p>
                  </div>
                  <p className="text-red-500 font-semibold text-sm mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    2/3 slots available
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSupportModal(false)}
                      className="flex-1 px-4 py-2 border border-muted rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => window.open('https://x.com/isahermanx', '_blank')}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-green-500 text-white rounded-lg transition-colors"
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