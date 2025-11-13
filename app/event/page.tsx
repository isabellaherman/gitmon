"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import SponsorBar from "@/components/SponsorBar";
import FloatingBackButton from "@/components/FloatingBackButton";
import MadMonkeyHealthBar from "@/components/MadMonkeyHealthBar";

export default function EventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [commits, setCommits] = useState<
    Array<{
      username: string;
      sha: string;
      message: string;
      repoName: string;
      committedAt: string;
      createdAt: string;
    }>
  >([]);
  const [isCommitsOpen, setIsCommitsOpen] = useState(true);
  const [isBattleLogOpen, setIsBattleLogOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalCommits: 0,
    commitsLast24h: 0,
    lastSyncAt: null as string | null,
    eventStartDate: "",
    eventEndDate: "",
    currentDate: "",
  });

  // Check if user already joined when session loads
  useEffect(() => {
    const checkParticipation = async () => {
      if (!session?.user?.email) return;

      setIsCheckingParticipation(true);
      try {
        const response = await fetch(
          "/api/check-event-participation?eventId=first-community-event"
        );
        const data = await response.json();

        if (data.success) {
          setHasJoined(data.hasJoined);
        }
      } catch (error) {
        console.error("Error checking participation:", error);
      } finally {
        setIsCheckingParticipation(false);
      }
    };

    if (status === "authenticated") {
      checkParticipation();
    }
  }, [session, status]);

  // Fetch participant count
  useEffect(() => {
    const fetchParticipantCount = async () => {
      try {
        const response = await fetch(
          "/api/event-participants-count?eventId=first-community-event"
        );
        const data = await response.json();

        if (data.success) {
          setParticipantCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching participant count:", error);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchParticipantCount();
  }, [hasJoined]); // Refetch when user joins

  // Fetch commits from database
  const fetchCommits = async () => {
    try {
      const response = await fetch("/api/event-commits");
      const data = await response.json();

      if (data.success) {
        setCommits(data.commits || []);
        setStats(data.stats || {});
        console.log("Commits loaded:", data.total);
        console.log("Stats:", data.stats);
      }
    } catch (error) {
      console.error("Error fetching commits:", error);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, []);

  const handleSyncCommits = async () => {
    setIsSyncing(true);

    try {
      // Trigger sync for ALL participants
      const syncResponse = await fetch("/api/sync-event-commits", {
        method: "POST",
      });
      const syncData = await syncResponse.json();

      if (syncData.success) {
        console.log("🔴 [DEBUG] Sync completed:", syncData);
        console.log("🔴 [DEBUG] Current time:", new Date().toISOString());
        console.log("🔴 [DEBUG] Message:", syncData.message);
        console.log("🔴 [DEBUG] Stats:", syncData.stats);
        // Refresh the commit list
        await fetchCommits();
      } else {
        console.error("🔴 [DEBUG] Sync failed:", syncData.error);
        console.error("🔴 [DEBUG] Full response:", syncData);
      }
    } catch (error) {
      console.error("Error syncing commits:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!session) {
      router.push("/");
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch("/api/join-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: "first-community-event",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasJoined(true);
      } else {
        console.error("Failed to join event:", data.error);
      }
    } catch (error) {
      console.error("Error joining event:", error);
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
                onClick={() => router.push("/")}
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
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back
              </Button>
            </div>

            {/* Warning - Centered */}
            <div className="text-center mb-0">
              <span
                className="text-red-600 text-xs font-bold"
                style={{ fontFamily: "Minecraftia, monospace" }}
              >
                EVENT IN BETA TEST
              </span>
            </div>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-80 rounded-lg"></div>
              <h1
                className="relative text-4xl font-bold text-white py-4 px-8"
                style={{ fontFamily: "Minecraftia, monospace" }}
              >
                DEFEAT MAD MONKEY!
              </h1>
            </div>
            {/* Mad Monkey Health Bar */}
            <div className="mb-8">
              <MadMonkeyHealthBar
                totalCommits={commits.length}
                maxHp={10000}
                damagePerCommit={20}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-xl p-6 text-center">
              {/* 3 Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column - Empty for now */}
                <div className="hidden lg:block">{/* Reserved space */}</div>

                {/* Center Column - Mad Monkey */}
                <div className="flex flex-col items-center">
                  <div className="w-80 h-80 mb-6">
                    <Image
                      src="/events/MadMonkey.png"
                      alt="Mad Monkey"
                      width={320}
                      height={320}
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>

                {/* Right Column - Battle Log */}
                <div className="lg:text-left">
                  <div className="bg-muted/30 rounded-lg p-4 h-96">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setIsBattleLogOpen(!isBattleLogOpen)}
                        className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity text-green-500"
                        style={{ fontFamily: "Minecraftia, monospace" }}
                      >
                        <span
                          className={`transform transition-transform ${
                            isBattleLogOpen ? "rotate-90" : ""
                          }`}
                        >
                          {">"}
                        </span>
                        BATTLE LOG
                      </button>
                      <Button
                        onClick={handleSyncCommits}
                        disabled={isSyncing}
                        variant="default"
                        size="sm"
                        className="text-xs"
                      >
                        {isSyncing ? "SYNCING..." : "SYNC ALL"}
                      </Button>
                    </div>

                    <div className="h-64 overflow-y-auto text-sm space-y-1">
                      {commits.length > 0 ? (
                        commits.map((commit, index) => {
                          const committedAt = new Date(commit.committedAt);
                          const timeAgo = Math.floor(
                            (Date.now() - committedAt.getTime()) /
                              (1000 * 60 * 60)
                          );
                          const damage = 20; // Fixed damage for v1

                          return (
                            <div
                              key={`${commit.sha}-${index}`}
                              className="text-xs py-0.5"
                            >
                              <span className="text-muted-foreground">
                                [
                                {timeAgo > 24
                                  ? `${Math.floor(timeAgo / 24)}d`
                                  : `${timeAgo}h`}{" "}
                                ago]
                              </span>
                              <span className="ml-2">
                                <span className="text-gray-600">
                                  @{commit.username}
                                </span>
                                <span className="mx-1">hit Mad Monkey</span>
                                <span className="ml-1 text-orange-600 font-bold">
                                  ({damage})
                                </span>
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-muted-foreground py-8 text-xs">
                          <div>No battle activity yet</div>
                          <div className="mt-2">
                            Click SYNC ALL to start tracking hits!
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center pt-2 border-t mt-2">
                      <span className="text-orange-400 text-xs font-bold">
                        warning: battle system still in beta and may have
                        inaccuracies.{" "}
                        <a
                          href="https://github.com/isabellaherman/gitmon/issues/11"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline hover:text-blue-700"
                        >
                          check issues
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Below (Login/Join states) */}
              <div className="mt-8">
                {!session ? (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">
                      Help us defeat Mad Monkey
                    </h2>
                    <div className="mb-4">
                      <span
                        className="text-green-600 text-sm font-bold"
                        style={{ fontFamily: "Minecraftia, monospace" }}
                      >
                        {isLoadingCount
                          ? "LOADING..."
                          : `${participantCount.toLocaleString()} TRAINERS JOINED`}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      You need to be logged in with GitHub to participate in
                      this community event.
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
                    <h2
                      className="text-2xl font-bold text-green-500"
                      style={{ fontFamily: "Minecraftia, monospace" }}
                    >
                      JOINED SUCCESSFULLY!
                    </h2>
                    <div className="mb-4">
                      <span
                        className="text-green-600 text-sm font-bold"
                        style={{ fontFamily: "Minecraftia, monospace" }}
                      >
                        {isLoadingCount
                          ? "LOADING..."
                          : `${participantCount.toLocaleString()} TRAINERS JOINED`}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      You&apos;ve successfully joined the GitMon 1st Community
                      Event! <br />
                      Keep coding and stay tuned for more details about the boss
                      battle.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your participation has been recorded and you&apos;ll be
                      eligible for special badges when the system launches.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">
                      Help us defeat Mad Monkey
                    </h2>
                    <div className="mb-4">
                      <span
                        className="text-green-600 text-sm font-bold"
                        style={{ fontFamily: "Minecraftia, monospace" }}
                      >
                        {isLoadingCount
                          ? "LOADING..."
                          : `${participantCount.toLocaleString()} TRAINERS JOINED`}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      Welcome,{" "}
                      <strong>@{session.user?.email?.split("@")[0]}</strong>!{" "}
                      <br />
                      Join thousands of developers in our first community event.
                    </p>
                    <Button
                      onClick={handleJoinEvent}
                      disabled={isJoining}
                      size="lg"
                      className="px-12 py-4 text-xl font-bold"
                      style={{ fontFamily: "Minecraftia, monospace" }}
                    >
                      {isJoining ? "JOINING..." : "JOIN"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      By joining, your participation will be recorded for future
                      badge rewards.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Debug Info Section - Optional collapsible section */}
            <div className="mt-8 bg-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setIsCommitsOpen(!isCommitsOpen)}
                  className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity text-blue-500"
                  style={{ fontFamily: "Minecraftia, monospace" }}
                >
                  <span
                    className={`transform transition-transform ${
                      isCommitsOpen ? "rotate-90" : ""
                    }`}
                  >
                    {">"}
                  </span>
                  DEBUG INFO
                </button>
              </div>

              {isCommitsOpen && (
                <div className="space-y-4">
                  {/* Debug Info */}
                  <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-xs">
                    <div className="font-bold">
                      🔴 DEBUG - EVENT DATE RANGE:
                    </div>
                    <div className="mt-1">
                      <strong>Current Time:</strong>{" "}
                      {stats.currentDate || new Date().toISOString()}
                    </div>
                    <div>
                      <strong>Event Start (Nov 12, 2025):</strong>{" "}
                      {stats.eventStartDate || "2025-11-12T00:00:00.000Z"}
                    </div>
                    <div>
                      <strong>Event End (Nov 30, 2025):</strong>{" "}
                      {stats.eventEndDate || "2025-11-30T23:59:59.999Z"}
                    </div>
                    {stats.lastSyncAt && (
                      <div>
                        <strong>Last Sync:</strong> {stats.lastSyncAt}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-red-600">
                      <strong>Search Query Format:</strong> author:username
                      committer-date:2025-11-12..2025-11-30
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {stats.totalParticipants}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Participants
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {stats.totalCommits}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Commits
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-purple-600">
                        {stats.commitsLast24h}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last 24h
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-xs text-muted-foreground">
                        Last Sync
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.lastSyncAt
                          ? new Date(stats.lastSyncAt).toLocaleTimeString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Event Details</h3>
                <p className="text-sm text-muted-foreground">
                  Our first community event brings together developers from
                  around the world to tackle challenges together.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Participants will receive exclusive badges and recognition in
                  the upcoming badge system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
