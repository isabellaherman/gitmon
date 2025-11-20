-- AlterTable
ALTER TABLE "event_participants" ADD COLUMN     "lastSyncAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allTimeRank" INTEGER,
ADD COLUMN     "rankUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "weeklyRank" INTEGER;

-- CreateTable
CREATE TABLE "event_commits" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "committedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_commits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_commits_eventId_committedAt_idx" ON "event_commits"("eventId", "committedAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_commits_eventId_sha_key" ON "event_commits"("eventId", "sha");
