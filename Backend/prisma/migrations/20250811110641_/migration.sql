-- CreateIndex
CREATE INDEX "Mensaje_emisorId_receptorId_idx" ON "Mensaje"("emisorId", "receptorId");

-- CreateIndex
CREATE INDEX "Mensaje_receptorId_emisorId_idx" ON "Mensaje"("receptorId", "emisorId");
