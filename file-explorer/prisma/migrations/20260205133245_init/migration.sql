-- CreateTable
CREATE TABLE "FileSystemItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FileSystemItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FileSystemItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FileSystemItem_name_parentId_key" ON "FileSystemItem"("name", "parentId");
