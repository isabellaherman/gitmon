"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { guilds, Guild } from "@/data/guilds";

interface GuildSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGuildId?: string | null;
  onGuildSelected: (guildId: string | null) => void;
}

export default function GuildSelectionModal({
  isOpen,
  onClose,
  currentGuildId,
  onGuildSelected
}: GuildSelectionModalProps) {
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(currentGuildId || null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleGuildSelect = (guildId: string | null) => {
    setSelectedGuildId(guildId);
  };

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guildId: selectedGuildId }),
      });

      if (response.ok) {
        onGuildSelected(selectedGuildId);
        onClose();
        window.location.reload(); // Refresh to show updated guild
      } else {
        console.error('Failed to update guild');
        // You could add error handling/toast here
      }
    } catch (error) {
      console.error('Error updating guild:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl max-w-lg w-full mx-auto relative shadow-2xl border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="text-center">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
              SELECT YOUR GUILD
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Choose a guild to represent your coding journey
            </p>
          </div>
        </div>

        {/* Guild Options */}
        <div className="p-6 space-y-3">
          {/* No Guild Option */}
          <div
            onClick={() => handleGuildSelect(null)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${
              selectedGuildId === null
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-muted-foreground/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-400">No Guild</h3>
                <p className="text-sm text-muted-foreground">Stay independent</p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                {selectedGuildId === null && (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                )}
              </div>
            </div>
          </div>

          {/* Guild Options */}
          {guilds.filter(guild => guild.id !== 'default').map((guild) => (
            <div
              key={guild.id}
              onClick={() => handleGuildSelect(guild.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                selectedGuildId === guild.id
                  ? 'border-primary bg-primary/10'
                  : 'border-muted hover:border-muted-foreground/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="font-bold uppercase"
                    style={{ color: guild.color, fontFamily: 'Minecraftia, monospace' }}
                  >
                    {guild.name}
                  </h3>
                  {guild.link !== '#' && (
                    <a
                      href={guild.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Guild →
                    </a>
                  )}
                </div>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                  {selectedGuildId === guild.id && (
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={isUpdating || selectedGuildId === currentGuildId}
          >
            {isUpdating ? 'Updating...' : 'Confirm Selection'}
          </Button>
        </div>
      </div>
    </div>
  );
}