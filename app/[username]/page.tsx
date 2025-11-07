"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { getMonsterById } from "@/lib/monsters";
import { getGuildById, getGuildTextColor } from "@/data/guilds";
import MonsterDisplay from "@/components/MonsterDisplay";
import UserStats from "@/components/UserStats";
import BadgeWall from "@/components/BadgeSystem";
import GuildSelectionModal from "@/components/GuildSelectionModal";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

interface UserData {
  id: string;
  name?: string;
  email?: string;
  githubUsername?: string;
  selectedMonsterId?: number;
  gitmonSelectedAt?: Date;
  guildId?: string | null;
  level: number;
  xp: number;
  totalCommits: number;
  totalPRs: number;
  currentStreak: number;
  totalStars: number;
  activities: Array<{
    id: string;
    type: string;
    amount: number;
    source?: string;
  }>;
}

async function getUserByUsername(username: string): Promise<UserData | null> {
  try {
    const response = await fetch(`/api/user/${username}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [showGuildModal, setShowGuildModal] = useState(false);

  useEffect(() => {
    const getUsername = async () => {
      const { username: paramUsername } = await params;
      setUsername(paramUsername);
      const userData = await getUserByUsername(paramUsername);
      setUser(userData);
      setLoading(false);
    };
    getUsername();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user || !user.githubUsername) {
    notFound();
  }

  const selectedMonster = getMonsterById(user.selectedMonsterId || null);
  const userGuild = getGuildById(user.guildId || null);
  const isOwnProfile = session?.user?.email === user.email;

  const handleGuildChange = (newGuildId: string | null) => {
    setUser(prev => prev ? { ...prev, guildId: newGuildId } : null);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-80 rounded-lg"></div>
            <h1 className="relative text-4xl font-bold text-white py-4 px-8" style={{ fontFamily: 'Minecraftia, monospace' }}>
              TRAINER PROFILE
            </h1>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Minecraftia, monospace' }}>
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-blue-600 transition-colors cursor-pointer"
            >
              {user.githubUsername}
            </a>
            {userGuild && (
              <>
                <span className="hidden md:inline"> </span>
                <span
                  className={`text-2xl uppercase font-bold cursor-pointer transition-colors ${getGuildTextColor(user.guildId || null)} relative group md:inline block md:mt-0 mt-2`}
                >
                  {userGuild.name}
                </span>
              </>
            )}
            {isOwnProfile && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuildModal(true)}
                  className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                >
                  CHANGE GUILD
                </Button>
              </div>
            )}
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - GitMon & Stats */}
          <div className="bg-card rounded-xl p-6">
            {selectedMonster ? (
              <>
                <div className="mb-6">
                  <MonsterDisplay
                    monster={selectedMonster}
                    level={user.level}
                    birthdate={user.gitmonSelectedAt}
                    size="large"
                  />
                </div>

                <div className="mb-6">
                  <UserStats
                    xp={user.xp}
                    totalCommits={user.totalCommits}
                    totalPRs={user.totalPRs}
                    currentStreak={user.currentStreak}
                    totalStars={user.totalStars}
                  />
                </div>

                {user.activities.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-center">Recent Activity</h5>
                    <div className="space-y-2">
                      {user.activities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{activity.type}</span>
                            <span className="font-bold text-primary">+{activity.amount} XP</span>
                          </div>
                          {activity.source && (
                            <div className="text-xs text-muted-foreground mt-1">{activity.source}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 overflow-hidden relative">
                  <Image
                    src="/monsters/monster-000.png"
                    alt="GitMon"
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">GitMon Not Selected</h3>
                <p className="text-muted-foreground mb-6">
                  This trainer hasn&apos;t chosen their GitMon companion yet!
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Badges */}
          <div className="bg-card rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: 'Minecraftia, monospace' }}>
              Badges & Achievements
            </h3>
            <BadgeWall userData={user} />
          </div>
        </div>

        {/* Guild Selection Modal */}
        <GuildSelectionModal
          isOpen={showGuildModal}
          onClose={() => setShowGuildModal(false)}
          currentGuildId={user.guildId}
          onGuildSelected={handleGuildChange}
        />
      </div>
    </main>
  );
}

// Note: generateMetadata removed since this is now a client component
// SEO can be handled with next/head if needed