-- DropIndex
DROP INDEX "User_email_key";

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "semana" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "presidenteId" TEXT,
    "presidenteReunionId" TEXT,
    "lectorReunionId" TEXT,
    "oracionFinalVMId" TEXT,
    "oracionFinalPublicaId" TEXT,

    CONSTRAINT "Asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesoroBibliaItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minutos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "encargadoId" TEXT,

    CONSTRAINT "TesoroBibliaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeamosMejoresItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minutos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "encargadoId" TEXT,

    CONSTRAINT "SeamosMejoresItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NuestraVidaItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minutos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "encargadoId" TEXT,

    CONSTRAINT "NuestraVidaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asignacion_parentId_idx" ON "Asignacion"("parentId");

-- CreateIndex
CREATE INDEX "Asignacion_presidenteId_idx" ON "Asignacion"("presidenteId");

-- CreateIndex
CREATE INDEX "Asignacion_presidenteReunionId_idx" ON "Asignacion"("presidenteReunionId");

-- CreateIndex
CREATE INDEX "Asignacion_lectorReunionId_idx" ON "Asignacion"("lectorReunionId");

-- CreateIndex
CREATE INDEX "Asignacion_oracionFinalVMId_idx" ON "Asignacion"("oracionFinalVMId");

-- CreateIndex
CREATE INDEX "Asignacion_oracionFinalPublicaId_idx" ON "Asignacion"("oracionFinalPublicaId");

-- CreateIndex
CREATE INDEX "TesoroBibliaItem_asignacionId_idx" ON "TesoroBibliaItem"("asignacionId");

-- CreateIndex
CREATE INDEX "TesoroBibliaItem_encargadoId_idx" ON "TesoroBibliaItem"("encargadoId");

-- CreateIndex
CREATE INDEX "SeamosMejoresItem_asignacionId_idx" ON "SeamosMejoresItem"("asignacionId");

-- CreateIndex
CREATE INDEX "SeamosMejoresItem_encargadoId_idx" ON "SeamosMejoresItem"("encargadoId");

-- CreateIndex
CREATE INDEX "NuestraVidaItem_asignacionId_idx" ON "NuestraVidaItem"("asignacionId");

-- CreateIndex
CREATE INDEX "NuestraVidaItem_encargadoId_idx" ON "NuestraVidaItem"("encargadoId");

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Asignacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_presidenteId_fkey" FOREIGN KEY ("presidenteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_presidenteReunionId_fkey" FOREIGN KEY ("presidenteReunionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_lectorReunionId_fkey" FOREIGN KEY ("lectorReunionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_oracionFinalVMId_fkey" FOREIGN KEY ("oracionFinalVMId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_oracionFinalPublicaId_fkey" FOREIGN KEY ("oracionFinalPublicaId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesoroBibliaItem" ADD CONSTRAINT "TesoroBibliaItem_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "Asignacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesoroBibliaItem" ADD CONSTRAINT "TesoroBibliaItem_encargadoId_fkey" FOREIGN KEY ("encargadoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeamosMejoresItem" ADD CONSTRAINT "SeamosMejoresItem_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "Asignacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeamosMejoresItem" ADD CONSTRAINT "SeamosMejoresItem_encargadoId_fkey" FOREIGN KEY ("encargadoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NuestraVidaItem" ADD CONSTRAINT "NuestraVidaItem_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "Asignacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NuestraVidaItem" ADD CONSTRAINT "NuestraVidaItem_encargadoId_fkey" FOREIGN KEY ("encargadoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
