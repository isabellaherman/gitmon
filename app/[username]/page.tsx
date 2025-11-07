import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { monsters, getMonsterById, getTypeTextColor } from "@/lib/monsters";
import { getGuildById, getGuildTextColor } from "@/data/guilds";
import { checkAndUpdateContributorStatus } from "@/lib/contributor-checker";
import MonsterDisplay from "@/components/MonsterDisplay";
import UserStats from "@/components/UserStats";
import BadgeWall from "@/components/BadgeSystem";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getUserByUsername(username: string) {
  const user = await prisma.user.findFirst({
    where: {
      githubUsername: {
        equals: username,
        mode: "insensitive",
      },
    },
    include: {
      activities: {
        orderBy: {
          earnedAt: "desc",
        },
        take: 5,
      },
      eventParticipations: true,
    },
  });

  return user;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user || !user.githubUsername) {
    notFound();
  }

  const selectedMonster = getMonsterById(user.selectedMonsterId);
  const userGuild = getGuildById(user.guildId);

  // Check and update contributor status in the background
  if (user.githubUsername) {
    checkAndUpdateContributorStatus(user.githubUsername).catch(console.error);
  }

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
                {" "}
                <span
                  className={`text-2xl uppercase font-bold cursor-pointer transition-colors ${getGuildTextColor(user.guildId)} relative group`}
                >
                  {userGuild.name}
                  <span className="absolute top-full left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Guild system coming soon!
                  </span>
                </span>
              </>
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
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      title: "Trainer not found - GitMon",
    };
  }

  return {
    title: `${user.name || user.githubUsername} - GitMon Profile`,
    description: `Check out ${user.name || user.githubUsername}'s GitMon profile. Level ${user.level}, ${user.xp} XP total.`,
  };
}