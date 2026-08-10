-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('BOOKED', 'HELD', 'AVAILABLE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "last_used_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(3),
    "device_name" TEXT,
    "device_type" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "dob" DATE,
    "gender" "Gender" NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "poster_url" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "released_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theaters" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "seating_capacity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "theaters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theater_seats" (
    "id" UUID NOT NULL,
    "theater_id" UUID NOT NULL,
    "row_name" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "theater_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shows" (
    "id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "theater_id" UUID NOT NULL,
    "on_date" DATE NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "duration" INTEGER NOT NULL,
    "onward_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "shows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "show_seats" (
    "id" UUID NOT NULL,
    "seat_id" UUID NOT NULL,
    "show_id" UUID NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "show_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_user_id_key" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_refresh_token_hash_idx" ON "sessions"("user_id", "refresh_token_hash");

-- CreateIndex
CREATE INDEX "profiles_full_name_idx" ON "profiles"("full_name");

-- CreateIndex
CREATE INDEX "movies_language_idx" ON "movies"("language");

-- CreateIndex
CREATE INDEX "theaters_city_idx" ON "theaters"("city");

-- CreateIndex
CREATE INDEX "theater_seats_theater_id_idx" ON "theater_seats"("theater_id");

-- CreateIndex
CREATE UNIQUE INDEX "theater_seats_theater_id_row_name_seat_number_key" ON "theater_seats"("theater_id", "row_name", "seat_number");

-- CreateIndex
CREATE INDEX "shows_movie_id_idx" ON "shows"("movie_id");

-- CreateIndex
CREATE INDEX "shows_theater_id_idx" ON "shows"("theater_id");

-- CreateIndex
CREATE INDEX "shows_on_date_idx" ON "shows"("on_date");

-- CreateIndex
CREATE INDEX "shows_theater_id_on_date_idx" ON "shows"("theater_id", "on_date");

-- CreateIndex
CREATE INDEX "show_seats_show_id_idx" ON "show_seats"("show_id");

-- CreateIndex
CREATE INDEX "show_seats_seat_id_idx" ON "show_seats"("seat_id");

-- CreateIndex
CREATE INDEX "show_seats_status_idx" ON "show_seats"("status");

-- CreateIndex
CREATE UNIQUE INDEX "show_seats_show_id_seat_id_key" ON "show_seats"("show_id", "seat_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theater_seats" ADD CONSTRAINT "theater_seats_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shows" ADD CONSTRAINT "shows_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shows" ADD CONSTRAINT "shows_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "theater_seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
