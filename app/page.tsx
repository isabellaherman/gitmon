"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import SupportCard from "@/components/SupportCard";
import SponsorBar from "@/components/SponsorBar";
import EventPopup from "@/components/EventPopup";

import { monsters, getTypeColor, formatBirthdate, getMonsterById } from "@/lib/monsters";


interface LeaderboardEntry {
  rank: number;
  name: string;
  githubUsername?: string;
  selectedMonsterId: number;
  level: number;
  xp: number;
  rank_title: string;
  stats: {
    commits: number;
    prs: number;
    stars: number;
    streak: number;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'week' | 'all'>('week');
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [totalTrainers, setTotalTrainers] = useState<number>(0);

  useEffect(() => {
    if (session?.user?.email && status === 'authenticated') {
      const now = Date.now();
      const sessionKey = `sync_${session.user.email}`;
      const lastSync = localStorage.getItem(sessionKey);

      if (!lastSync || (now - parseInt(lastSync)) > 10 * 60 * 1000) {
        console.log('[Auto Sync] Performing automatic XP sync...');

        fetch('/api/force-sync', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              console.log('[Auto Sync] XP updated successfully');
              localStorage.setItem(sessionKey, now.toString());
              window.location.reload();
            }
          })
          .catch(err => {
            console.error('[Auto Sync] Failed:', err);
          });
      }
    }
  }, [session, status]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const userId = (session?.user as Record<string, unknown>)?.id as string;
        const userIdParam = userId ? `&userId=${userId}` : '';
        const response = await fetch(`/api/leaderboard?period=${leaderboardPeriod}${userIdParam}`);
        const data = await response.json();

        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardPeriod, session]);

  // Show event popup on page load (only once per session)
  useEffect(() => {
    const hasSeenEventPopup = sessionStorage.getItem('hasSeenEventPopup');

    if (!hasSeenEventPopup) {
      const timer = setTimeout(() => {
        setShowEventPopup(true);
        sessionStorage.setItem('hasSeenEventPopup', 'true');
      }, 1000); // Show popup after 1 second

      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch total trainers count
  useEffect(() => {
    const fetchTotalTrainers = async () => {
      try {
        const response = await fetch('/api/total-trainers');
        const data = await response.json();

        if (data.success) {
          setTotalTrainers(data.count);
        }
      } catch (error) {
        console.error('Error fetching total trainers:', error);
      }
    };

    fetchTotalTrainers();
  }, []);


  const handleSignIn = () => {
    signIn("github");
  };


  const selectedMonsterId = (session?.user as Record<string, unknown>)?.selectedMonsterId as number;
  const selectedMonster = getMonsterById(selectedMonsterId);

  const gitmonSelectedAt = (session?.user as Record<string, unknown>)?.gitmonSelectedAt as Date;


  const currentUserInLeaderboard = leaderboard.find(user =>
    user.name === session?.user?.name ||
    user.githubUsername === session?.user?.email?.split('@')[0]
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SponsorBar />
      <EventPopup
        isOpen={showEventPopup}
        onClose={() => setShowEventPopup(false)}
      />
      <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Minecraftia, monospace' }}>
            GitMon Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Compete with developers worldwide. Open-source GitHub leaderboard.
          </p>

        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            {!session ? (
              <div className="bg-card rounded-xl p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 overflow-hidden relative">
                  <Image
                    src={monsters[Math.floor(Math.random() * monsters.length)].src}
                    alt="GitMon"
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>

                <h3 className="text-xl font-bold mb-2">Start Your Journey!</h3>
                <p className="text-muted-foreground mb-6">
                  Choose your GitMon and start earning XP for every commit, pull request, and contribution.
                </p>

                <div className="flex gap-2">
                  <Button onClick={handleSignIn} size="lg" className="flex-1" style={{ flex: '2' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 0C5.373 0 0 5.373 0 12a12 12 0 008.207 11.385c.6.111.82-.261.82-.58 0-.287-.01-1.046-.016-2.054-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.996.108-.775.42-1.304.763-1.604-2.665-.305-5.466-1.332-5.466-5.932 0-1.31.469-2.38 1.236-3.22-.124-.303-.535-1.527.117-3.182 0 0 1.008-.323 3.3 1.23A11.48 11.48 0 0112 5.8c1.022.005 2.05.138 3.012.403 2.29-1.553 3.296-1.23 3.296-1.23.654 1.655.243 2.879.12 3.182.77.84 1.235 1.91 1.235 3.22 0 4.61-2.804 5.624-5.476 5.921.431.37.816 1.102.816 2.222 0 1.604-.014 2.896-.014 3.293 0 .321.216.696.825.578A12.003 12.003 0 0024 12c0-6.627-5.373-12-12-12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Login with GitHub
                  </Button>

                  <Button
                    onClick={() => router.push('/gitdex')}
                    size="lg"
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
                    style={{ flex: '1', fontFamily: 'Minecraftia, monospace' }}
                  >
                    GITDEX
                  </Button>
                </div>

                <SupportCard />
              </div>
            ) : (
              <div className="bg-card rounded-xl p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <h3 className="text-lg font-bold">Trainer Profile</h3>
                    <button
                      onClick={() => router.push(`/${session.user?.email?.split('@')[0]}`)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title="View full profile"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-5 h-5"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{session.user?.name}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-muted-foreground">GitHub:</span>
                      <span className="font-medium">@{session.user?.email?.split('@')[0]}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GitMon:</span>
                      <span className={selectedMonster ? "text-green-500 font-medium" : "text-yellow-500 font-medium"}>
                        {selectedMonster ? selectedMonster.name.toUpperCase() : "Not selected"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedMonster ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-48 h-48 mx-auto mb-4 relative">
                        <div className="absolute inset-4 rounded-full" style={{
                          background: `radial-gradient(circle, #000 1px, transparent 1px)`,
                          backgroundSize: '8px 8px',
                          maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
                          WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)'
                        }}></div>
                        <Image
                          src={selectedMonster.src}
                          alt={selectedMonster.name}
                          fill
                          className="object-contain relative z-10 scale-110"
                          sizes="128px"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2 mb-3">
                        <h4 className="text-xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>{selectedMonster.name}</h4>
                        <span className="text-lg font-bold text-primary border border-primary/30 bg-primary/10 rounded-full px-2 py-1" style={{ fontFamily: 'Minecraftia, monospace' }}>
                          Lv.{currentUserInLeaderboard?.level || (session?.user as Record<string, unknown>)?.level as number || 1}
                        </span>
                      </div>

                      <div className="flex gap-2 justify-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-medium uppercase ${getTypeColor(selectedMonster.type)}`}>
                          {selectedMonster.type}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          Born {formatBirthdate(gitmonSelectedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">

                      <div className="bg-muted rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-primary">
                          {currentUserInLeaderboard?.xp?.toLocaleString() || ((session?.user as Record<string, unknown>)?.xp as number)?.toLocaleString() || 0} XP
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {leaderboardPeriod === 'week' ? 'This week' : 'All time'}
                        </p>
                      </div>

                      <div className="bg-muted rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-primary">
                          #{currentUserInLeaderboard?.rank || '???'}
                        </p>
                        <p className="text-sm text-muted-foreground">Your rank</p>
                      </div>
                    </div>


                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mb-3"
                        onClick={() => router.push('/docs')}
                      >
                        📋 How it Works
                      </Button>

                      <Button
                        onClick={() => signOut()}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    </div>

                    <SupportCard />
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-6">
                      Choose your GitMon companion to start your coding adventure!
                    </p>

                    <Button
                      onClick={() => router.push("/onboarding")}
                      size="lg"
                      className="w-full mb-4"
                    >
                      Choose Your GitMon →
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mb-3"
                      onClick={() => router.push('/docs')}
                    >
                      📋 How it Works
                    </Button>

                    <Button
                      onClick={() => signOut()}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>Top Trainers</h2>
                    <p className="text-muted-foreground">
                      {leaderboardPeriod === 'week' ? "This week's coding champions" : "All-time coding legends"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setLeaderboardPeriod('week')}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        leaderboardPeriod === 'week'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground hover:bg-muted/80 border-muted'
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => setLeaderboardPeriod('all')}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        leaderboardPeriod === 'all'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground hover:bg-muted/80 border-muted'
                      }`}
                    >
                      All Time
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/gitdex')}
                      className="rounded-full text-xs shadow-green-500/30 hover:shadow-green-500/50 transition-shadow drop-shadow-none"
                      style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)' }}
                    >
                      📚 GITDEX
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://github.com/isabellaherman/gitmon', '_blank')}
                      className="rounded-full text-xs"
                    >
                      ⭐ Star Project
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    created by{" "}
                    <a
                      href="https://x.com/IsabellaHermn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Isabella Herman
                    </a>
                  </span>
                </div>
              </div>

              <div className="p-0 md:p-6">
                {/* Total trainers count - only on desktop - always visible */}
                <div className="hidden md:flex items-center gap-4 bg-muted/30">
                  <div className="flex-1 text-right">
                    <p className="text-xs text-muted-foreground">
                      {totalTrainers.toLocaleString()} TRAINERS
                    </p>
                  </div>
                </div>
                {isLoadingLeaderboard ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No players yet. Be the first to join!</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {leaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${
                        user.rank <= 3
                          ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
                          : 'isCurrentUser' in user && user.isCurrentUser
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className="min-w-8 flex items-center justify-center font-bold text-sm text-muted-foreground">
                        #{user.rank}
                      </div>

                      <div className="flex-1">
                        {/* Desktop layout */}
                        <div className="hidden md:flex items-center gap-2">
                          <a
                            href={`https://github.com/${user.githubUsername || user.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:text-primary transition-colors cursor-pointer hover:underline"
                          >
                            @{user.githubUsername || user.name}
                          </a>
                          <button
                            onClick={() => router.push(`/gitdex?monster=${user.selectedMonsterId}`)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer hover:underline"
                          >
                            {monsters[user.selectedMonsterId]?.name || 'Unknown'}
                          </button>
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            <span className="hidden md:inline">Level {user.level}</span>
                            <span className="md:hidden">Lv. {user.level}</span>
                          </span>
                        </div>
                        {/* Mobile layout - stacked */}
                        <div className="md:hidden space-y-1">
                          <a
                            href={`https://github.com/${user.githubUsername || user.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:text-primary transition-colors cursor-pointer hover:underline block"
                          >
                            @{user.githubUsername || user.name}
                          </a>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {monsters[user.selectedMonsterId]?.name || 'Unknown'}
                            </span>
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              <span className="hidden md:inline">Level {user.level}</span>
                              <span className="md:hidden">Lv. {user.level}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-primary">{user.xp.toLocaleString()} XP</p>
                          {/* Hide commit/PR info on mobile */}
                          <p className="text-xs text-muted-foreground hidden md:block">
                            {user.stats.commits} commits • {user.stats.prs} PRs
                          </p>
                        </div>

                        <div className="w-16 h-16 relative">
                          <Image
                            src={monsters[user.selectedMonsterId]?.src || monsters[0].src}
                            alt={monsters[user.selectedMonsterId]?.name || 'GitMon'}
                            fill
                            className="object-contain"
                            sizes="64px"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}