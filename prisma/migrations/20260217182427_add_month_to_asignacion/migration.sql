-- CreateEnum
CREATE TYPE "Month" AS ENUM ('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre');

-- AlterTable
ALTER TABLE "Asignacion" ADD COLUMN     "month" "Month" NOT NULL DEFAULT 'Enero';
