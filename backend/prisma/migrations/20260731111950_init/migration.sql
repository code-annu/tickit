-- CreateTable
CREATE TABLE "movies" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "poster_url" TEXT NOT NULL,
    "released_date" DATE NOT NULL,
    "overview" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theaters" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "theaters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movies_title_idx" ON "movies"("title");

-- CreateIndex
CREATE INDEX "movies_language_idx" ON "movies"("language");

-- CreateIndex
CREATE INDEX "movies_released_date_idx" ON "movies"("released_date");

-- CreateIndex
CREATE INDEX "theaters_city_idx" ON "theaters"("city");

-- CreateIndex
CREATE INDEX "theaters_name_idx" ON "theaters"("name");
