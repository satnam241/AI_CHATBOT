-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Chat_guestId_idx" ON "Chat"("guestId");
