"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import SponsorBar from "@/components/SponsorBar";
import FloatingBackButton from "@/components/FloatingBackButton";

export default function EventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [battleLogs, setBattleLogs] = useState<any[]>([]);
  const [isRefreshingBattle, setIsRefreshingBattle] = useState(false);
  const [isBattleLogOpen, setIsBattleLogOpen] = useState(true);

  // Check if user already joined when session loads
  useEffect(() => {
    const checkParticipation = async () => {
      if (!session?.user?.email) return;

      setIsCheckingParticipation(true);
      try {
        const response = await fetch('/api/check-event-participation?eventId=first-community-event');
        const data = await response.json();

        if (data.success) {
          setHasJoined(data.hasJoined);
        }
      } catch (error) {
        console.error('Error checking participation:', error);
      } finally {
        setIsCheckingParticipation(false);
      }
    };

    if (status === 'authenticated') {
      checkParticipation();
    }
  }, [session, status]);

  // Fetch participant count
  useEffect(() => {
    const fetchParticipantCount = async () => {
      try {
        const response = await fetch('/api/event-participants-count?eventId=first-community-event');
        const data = await response.json();

        if (data.success) {
          setParticipantCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching participant count:', error);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchParticipantCount();
  }, [hasJoined]); // Refetch when user joins

  // Fetch battle logs for everyone
  useEffect(() => {
    const fetchBattleLogs = async () => {
      try {
        const response = await fetch('/api/battle-refresh');
        const data = await response.json();

        if (data.success) {
          setBattleLogs(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching battle logs:', error);
      }
    };

    fetchBattleLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefreshBattle = async () => {
    setIsRefreshingBattle(true);

    try {
      // First, trigger a refresh
      const refreshResponse = await fetch('/api/battle-refresh', {
        method: 'POST'
      });
      const refreshData = await refreshResponse.json();

      if (refreshData.success) {
        // Then fetch updated logs
        const logsResponse = await fetch('/api/battle-refresh');
        const logsData = await logsResponse.json();

        if (logsData.success) {
          setBattleLogs(logsData.data || []);
        }
      }
    } catch (error) {
      console.error('Error refreshing battle logs:', error);
    } finally {
      setIsRefreshingBattle(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!session) {
      router.push('/');
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch('/api/join-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'first-community-event'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasJoined(true);
      } else {
        console.error('Failed to join event:', data.error);
      }
    } catch (error) {
      console.error('Error joining event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  if (status === "loading" || isCheckingParticipation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SponsorBar />
      <FloatingBackButton />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 relative">
            {/* Back Button - Hidden on mobile */}
            <div className="absolute left-0 top-0 hidden md:block">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back
              </Button>
            </div>

            {/* Warning - Centered */}
            <div className="text-center mb-0">
              <span className="text-red-600 text-xs font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
                WARNING
              </span>
            </div>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-80 rounded-lg"></div>
              <h1 className="relative text-4xl font-bold text-white py-4 px-8" style={{ fontFamily: 'Minecraftia, monospace' }}>
                CALLING ALL GIT TRAINERS!
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              This is a message for all GitTrainers. Please, do not .ignore
            </p>
            <p className="text-black-foreground text-lg">
              The <b>Mad Monkey</b> has emerged from the void, and now chaos is coming to the gitmon realm.
            </p>

            
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl p-0 text-center">
              {/* Event Visual/Icon */}
              <div className="w-100 h-100 mx-auto mb-6">
                <Image
                  src="/events/MadMonkey.png"
                  alt="Mad Monkey"
                  width={192}
                  height={192}
                  className="object-contain w-full h-full"
                />
              </div>

              {!session ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Help us defeat Mad Monkey</h2>
                  <div className="mb-4">
                    <span className="text-green-600 text-sm font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
                      {isLoadingCount ? 'LOADING...' : `${participantCount.toLocaleString()} TRAINERS JOINED`}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    You need to be logged in with GitHub to participate in this community event.
                  </p>
                  <Button
                    onClick={() => signIn("github")}
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    Login with GitHub
                  </Button>
                </div>
              ) : hasJoined ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-green-500" style={{ fontFamily: 'Minecraftia, monospace' }}>
                    JOINED SUCCESSFULLY!
                  </h2>
                  <div className="mb-4">
                    <span className="text-green-600 text-sm font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
                      {isLoadingCount ? 'LOADING...' : `${participantCount.toLocaleString()} TRAINERS JOINED`}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    You&apos;ve successfully joined the GitMon 1st Community Event! <br/>
                    Keep coding and stay tuned for more details about the boss battle.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your participation has been recorded and you&apos;ll be eligible for special badges when the system launches.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Help us defeat Mad Monkey</h2>
                  <div className="mb-4">
                    <span className="text-green-600 text-sm font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
                      {isLoadingCount ? 'LOADING...' : `${participantCount.toLocaleString()} TRAINERS JOINED`}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Welcome, <strong>@{session.user?.email?.split('@')[0]}</strong>! <br/>
                    Join thousands of developers in our first community event.
                  </p>
                  <Button
                    onClick={handleJoinEvent}
                    disabled={isJoining}
                    size="lg"
                    className="px-12 py-4 text-xl font-bold"
                    style={{ fontFamily: 'Minecraftia, monospace' }}
                  >
                    {isJoining ? 'JOINING...' : 'JOIN'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    By joining, your participation will be recorded for future badge rewards.
                  </p>
                </div>
              )}
            </div>

            {/* Battle Log Section - Available for everyone */}
            <div className="mt-8 bg-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setIsBattleLogOpen(!isBattleLogOpen)}
                    className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity text-green-500"
                    style={{ fontFamily: 'Minecraftia, monospace' }}
                  >
                    <span className={`transform transition-transform ${isBattleLogOpen ? 'rotate-90' : ''}`}>
                      {'>'}
                    </span>
                    BATTLE LOG
                  </button>
                  <Button
                    onClick={handleRefreshBattle}
                    disabled={isRefreshingBattle}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {isRefreshingBattle ? 'REFRESHING...' : 'REFRESH'}
                  </Button>
                </div>

                {isBattleLogOpen && (
                  <>
                    <div className="p-4 text-sm max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {battleLogs.length > 0 ? (
                          battleLogs.map((log, index) => {
                            const now = new Date();
                            const logTime = new Date(log.timestamp);
                            const diffMs = now.getTime() - logTime.getTime();
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                            let timeAgo;
                            if (diffHours > 0) {
                              timeAgo = `${diffHours}h ago`;
                            } else if (diffMins > 0) {
                              timeAgo = `${diffMins}m ago`;
                            } else {
                              timeAgo = 'now';
                            }

                            // Extract damage from message (new format: "@username dealt 25 damage to MadMonkey")
                            const damageMatch = log.message.match(/dealt (\d+) damage/);
                            const damage = damageMatch ? damageMatch[1] : '0';
                            const usernameMatch = log.message.match(/@(\w+)/);
                            const username = usernameMatch ? usernameMatch[1] : 'unknown';

                            return (
                              <div key={log.id || index} className="text-foreground">
                                <span className="text-muted-foreground">{timeAgo}</span> @{username} dealt <span className="text-red-500 font-bold">{damage} damage</span> to MadMonkey
                              </div>
                            );
                          })
                        ) : (
                          <>
                            <div className="text-muted-foreground">🔄 Click REFRESH to load battle logs...</div>
                            <div className="text-muted-foreground text-xs mt-2">
                              Battle logs show real commits from event participants
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-red-600 text-xs font-bold" style={{ fontFamily: 'Minecraftia, monospace' }}>
                        MAD MONKEY HP: {Math.max(0, 10000 - (battleLogs.length * 25)).toLocaleString()} / 10,000
                      </span>
                    </div>
                  </>
                )}
              </div>

            {/* Event Info */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Event Details</h3>
                <p className="text-sm text-muted-foreground">
                  Our first community event brings together developers from around the world to tackle challenges together.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Participants will receive exclusive badges and recognition in the upcoming badge system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}