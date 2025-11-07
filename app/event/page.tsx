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
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-500"
                    >
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
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