-- CreateTable
CREATE TABLE "theater_streamings" (
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

    CONSTRAINT "theater_streamings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "theater_streamings_movie_id_idx" ON "theater_streamings"("movie_id");

-- CreateIndex
CREATE INDEX "theater_streamings_theater_id_idx" ON "theater_streamings"("theater_id");

-- CreateIndex
CREATE INDEX "theater_streamings_on_date_idx" ON "theater_streamings"("on_date");

-- CreateIndex
CREATE UNIQUE INDEX "theater_streamings_theater_id_on_date_start_time_key" ON "theater_streamings"("theater_id", "on_date", "start_time");

-- AddForeignKey
ALTER TABLE "theater_streamings" ADD CONSTRAINT "theater_streamings_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theater_streamings" ADD CONSTRAINT "theater_streamings_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
