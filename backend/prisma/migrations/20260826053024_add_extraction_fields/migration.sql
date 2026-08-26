-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL DEFAULT 'STUDY_MATERIAL',
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "extractedText" TEXT,
    "extractionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "extractionError" TEXT,
    "extractedAt" DATETIME,
    "pageCount" INTEGER,
    "characterCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "schoolClassId" TEXT,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    CONSTRAINT "Document_schoolClassId_fkey" FOREIGN KEY ("schoolClassId") REFERENCES "SchoolClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("chapterId", "createdAt", "documentType", "extractedText", "fileName", "filePath", "fileSize", "fileType", "id", "processed", "schoolClassId", "subjectId", "title", "topicId", "updatedAt") SELECT "chapterId", "createdAt", "documentType", "extractedText", "fileName", "filePath", "fileSize", "fileType", "id", "processed", "schoolClassId", "subjectId", "title", "topicId", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE INDEX "Document_title_idx" ON "Document"("title");
CREATE INDEX "Document_fileType_idx" ON "Document"("fileType");
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");
CREATE INDEX "Document_schoolClassId_idx" ON "Document"("schoolClassId");
CREATE INDEX "Document_subjectId_idx" ON "Document"("subjectId");
CREATE INDEX "Document_chapterId_idx" ON "Document"("chapterId");
CREATE INDEX "Document_topicId_idx" ON "Document"("topicId");
CREATE INDEX "Document_extractionStatus_idx" ON "Document"("extractionStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
