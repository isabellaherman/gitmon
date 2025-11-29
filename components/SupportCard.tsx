'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SupportCardProps {
  externalModalOpen?: boolean;
  onExternalModalClose?: () => void;
  hideCard?: boolean; // Hide the visual card, only show modal
}

export default function SupportCard({
  externalModalOpen,
  onExternalModalClose,
  hideCard = false,
}: SupportCardProps = {}) {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const router = useRouter();

  // Listen for global event to open modal
  useEffect(() => {
    const handleOpenSupport = () => {
      setShowSupportModal(true);
    };

    window.addEventListener('openSupportModal', handleOpenSupport);
    return () => window.removeEventListener('openSupportModal', handleOpenSupport);
  }, []);

  const isModalOpen = externalModalOpen || showSupportModal;
  const closeModal = () => {
    if (onExternalModalClose) {
      onExternalModalClose();
    } else {
      setShowSupportModal(false);
    }
  };

  return (
    <>
      {!hideCard && (
        <div className="mt-6 pt-6 border-t space-y-4">
          {/* Mad Monkey Event Banner */}
          <div className="relative p-0.5 rounded-2xl cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
            <div
              className="bg-white rounded-2xl p-3 flex items-center gap-3"
              onClick={() => router.push('/event')}
            >
              {/* Mad Monkey Image - Left side */}
              <div className="w-16 h-16 relative flex-shrink-0">
                <Image
                  src="/events/MadMonkey.png"
                  alt="Mad Monkey"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>

              {/* Banner Content - Right side */}
              <div className="flex-1">
                <div className="mb-1">
                  <span
                    className="text-red-600 text-xs font-bold uppercase"
                    style={{ fontFamily: 'Minecraftia, monospace' }}
                  >
                    🚨 NEW EVENT
                  </span>
                </div>
                <p className="text-sm text-gray-800 font-bold">Mad Monkey is bringing chaos!</p>
              </div>

              {/* Arrow indicator */}
              <div className="text-orange-500 text-lg">→</div>
            </div>
          </div>

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
              <h4 className="font-semibold mb-3 text-sm">Support the project and adopt a GitMon</h4>
              <div className="mb-4">
                <p className="text-green-500 font-semibold text-sm">they need a home :(</p>
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
      )}

      {/* Support Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Support GitMon: Adopt</h2>
              </div>

              <div className="space-y-6">
                <br></br>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">ADOPT A GITMON</h3>
                    <span className="text-green-500 font-semibold text-xl uppercase">
                      $65/MONTHLY
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      <b>
                        Support the project by sponsoring your name, project, or link on dedicated
                        GitMon screens
                      </b>
                      , shown alongside the monster&apos;s stats in places like the Character
                      Selection and GitDex pages.
                    </p>
                  </div>
                  <p
                    className="text-red-500 font-semibold text-sm mt-3"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    2/3 slots available
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">OWN A GITMON</h3>
                    <span className="text-green-500 font-semibold text-xl uppercase">
                      $399 LIFETIME
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      <b>
                        Support the project by sponsoring your name, project, or link on dedicated
                        GitMon screens
                      </b>
                      , shown alongside the monster&apos;s stats in places like the Character
                      Selection and GitDex pages.
                    </p>
                  </div>
                  <p
                    className="text-blue-500 font-semibold text-sm mt-3"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    1/1 slots available
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-3">
                    <Button onClick={closeModal} variant="outline" className="flex-1">
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
