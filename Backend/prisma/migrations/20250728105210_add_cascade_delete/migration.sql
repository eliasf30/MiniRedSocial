-- DropForeignKey
ALTER TABLE "verificacionEmail" DROP CONSTRAINT "verificacionEmail_usuarioId_fkey";

-- AddForeignKey
ALTER TABLE "verificacionEmail" ADD CONSTRAINT "verificacionEmail_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
