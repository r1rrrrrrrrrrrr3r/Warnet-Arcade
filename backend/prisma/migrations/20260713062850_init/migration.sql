-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "entryFile" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- AlterTable
ALTER TABLE "Game" ADD COLUMN "devComment" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Game" ADD COLUMN "howToPlay" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Game" ADD COLUMN "genre" TEXT NOT NULL DEFAULT 'Arcade';