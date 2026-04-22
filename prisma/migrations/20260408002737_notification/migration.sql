-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_petId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actorId" INTEGER,
ADD COLUMN     "postId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
