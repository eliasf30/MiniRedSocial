-- DropForeignKey
ALTER TABLE "Mensaje" DROP CONSTRAINT "Mensaje_emisorId_fkey";

-- DropForeignKey
ALTER TABLE "Mensaje" DROP CONSTRAINT "Mensaje_receptorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_autorId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudAmistad" DROP CONSTRAINT "SolicitudAmistad_emisorId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudAmistad" DROP CONSTRAINT "SolicitudAmistad_receptorId_fkey";

-- AddForeignKey
ALTER TABLE "SolicitudAmistad" ADD CONSTRAINT "SolicitudAmistad_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudAmistad" ADD CONSTRAINT "SolicitudAmistad_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
