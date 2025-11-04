-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "githubUsername" TEXT,
    "githubId" INTEGER,
    "githubBio" TEXT,
    "githubLocation" TEXT,
    "githubCompany" TEXT,
    "githubBlog" TEXT,
    "githubTwitter" TEXT,
    "githubFollowers" INTEGER NOT NULL DEFAULT 0,
    "githubFollowing" INTEGER NOT NULL DEFAULT 0,
    "githubCreatedAt" DATETIME,
    "avgCommitsPerWeek" REAL NOT NULL DEFAULT 0,
    "selectedMonsterId" INTEGER,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastXpUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyXp" INTEGER NOT NULL DEFAULT 0,
    "weeklyXp" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalPRs" INTEGER NOT NULL DEFAULT 0,
    "totalStars" INTEGER NOT NULL DEFAULT 0,
    "totalRepos" INTEGER NOT NULL DEFAULT 0,
    "languagesUsed" TEXT
);
INSERT INTO "new_users" ("currentStreak", "dailyXp", "email", "emailVerified", "githubId", "githubUsername", "id", "image", "languagesUsed", "lastXpUpdate", "level", "longestStreak", "name", "onboardingCompleted", "selectedMonsterId", "totalCommits", "totalPRs", "totalRepos", "totalStars", "weeklyXp", "xp") SELECT "currentStreak", "dailyXp", "email", "emailVerified", "githubId", "githubUsername", "id", "image", "languagesUsed", "lastXpUpdate", "level", "longestStreak", "name", "onboardingCompleted", "selectedMonsterId", "totalCommits", "totalPRs", "totalRepos", "totalStars", "weeklyXp", "xp" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
