-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "bossMaxHp" INTEGER NOT NULL DEFAULT 10000,
    "bossCurrentHp" INTEGER NOT NULL DEFAULT 10000,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_logs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "damageDealt" INTEGER NOT NULL DEFAULT 0,
    "commitSha" TEXT,
    "repoName" TEXT,
    "metadata" JSONB,

    CONSTRAINT "battle_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_activity_cache" (
    "eventId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "lastCommitSha" TEXT,
    "lastActivity" TIMESTAMP(3),
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalDamage" INTEGER NOT NULL DEFAULT 0,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_activity_cache_pkey" PRIMARY KEY ("eventId","username")
);

-- CreateIndex
CREATE INDEX "battle_logs_eventId_timestamp_idx" ON "battle_logs"("eventId", "timestamp");

-- AddForeignKey
ALTER TABLE "battle_logs" ADD CONSTRAINT "battle_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
