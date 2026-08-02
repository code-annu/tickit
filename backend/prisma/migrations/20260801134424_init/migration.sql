/*
  Warnings:

  - You are about to drop the `theater_streamings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "theater_seat_inventory" DROP CONSTRAINT "theater_seat_inventory_streaming_id_fkey";

-- DropForeignKey
ALTER TABLE "theater_streamings" DROP CONSTRAINT "theater_streamings_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "theater_streamings" DROP CONSTRAINT "theater_streamings_theater_id_fkey";

-- DropTable
DROP TABLE "theater_streamings";

-- CreateTable
CREATE TABLE "streaming_theaters" (
    "id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "theater_id" UUID NOT NULL,
    "on_date" DATE NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "duration" INTEGER NOT NULL,
    "onwards_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "streaming_theaters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "streaming_theaters_movie_id_idx" ON "streaming_theaters"("movie_id");

-- CreateIndex
CREATE INDEX "streaming_theaters_theater_id_idx" ON "streaming_theaters"("theater_id");

-- CreateIndex
CREATE INDEX "streaming_theaters_on_date_idx" ON "streaming_theaters"("on_date");

-- CreateIndex
CREATE UNIQUE INDEX "streaming_theaters_theater_id_on_date_start_time_key" ON "streaming_theaters"("theater_id", "on_date", "start_time");

-- AddForeignKey
ALTER TABLE "streaming_theaters" ADD CONSTRAINT "streaming_theaters_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaming_theaters" ADD CONSTRAINT "streaming_theaters_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theater_seat_inventory" ADD CONSTRAINT "theater_seat_inventory_streaming_id_fkey" FOREIGN KEY ("streaming_id") REFERENCES "streaming_theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
