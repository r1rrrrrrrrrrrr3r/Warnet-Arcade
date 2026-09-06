-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "devComment" TEXT NOT NULL DEFAULT '',
    "howToPlay" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "genre" TEXT NOT NULL DEFAULT 'Arcade',
    "entryFile" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Game" ("coverImage", "createdAt", "description", "devComment", "engine", "entryFile", "featured", "genre", "howToPlay", "id", "published", "slug", "title", "updatedAt") SELECT "coverImage", "createdAt", "description", "devComment", "engine", "entryFile", "featured", "genre", "howToPlay", "id", "published", "slug", "title", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
