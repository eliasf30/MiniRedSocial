-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "SolicitudAmistad" (
    "id" SERIAL NOT NULL,
    "emisorId" INTEGER NOT NULL,
    "receptorId" INTEGER NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudAmistad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudAmistad_emisorId_receptorId_key" ON "SolicitudAmistad"("emisorId", "receptorId");

-- AddForeignKey
ALTER TABLE "SolicitudAmistad" ADD CONSTRAINT "SolicitudAmistad_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudAmistad" ADD CONSTRAINT "SolicitudAmistad_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
