-- AlterTable
ALTER TABLE "mensagem" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text',
ALTER COLUMN "text" DROP NOT NULL;
