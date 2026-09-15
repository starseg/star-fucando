-- CreateEnum
CREATE TYPE "AttendanceAwardType" AS ENUM ('INTEGRAL', 'PARCIAL');

-- AlterTable
ALTER TABLE "AttendanceAward" ADD COLUMN     "bonusType" "AttendanceAwardType" NOT NULL DEFAULT 'INTEGRAL';
