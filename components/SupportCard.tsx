"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SupportCard() {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <div className="mt-6 pt-6 border-t">
        <div className="relative bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6 overflow-hidden">
          {/* Left Monster - Infernus */}
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-26 h-26 z-10">
            <Image
              src="/monsters/monster-006-png.png"
              alt="Infernus"
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>

          {/* Right Monster - Fairy */}
          <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-26 h-26 z-10">
            <Image
              src="/monsters/monster-001-png.png"
              alt="Fairy"
              fill
              className="object-contain"
              sizes="104px"
            />
          </div>

          {/* Card Content */}
          <div className="relative z-20 text-center px-6">
            <h4 className="font-semibold mb-3 text-sm">Support the project and own a GitMon and its IP</h4>
            <div className="mb-4">
              <p className="text-green-500 font-semibold text-sm">2/2 slots available</p>
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
                  <p className="text-orange-500 font-semibold text-sm mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    2/3 slots available
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowSupportModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => window.open('https://x.com/isahermanx', '_blank')}
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