-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "seat_status" AS ENUM ('AVAILABLE', 'HELD', 'BOOKED');

-- CreateEnum
CREATE TYPE "seat_hold_status" AS ENUM ('ACTIVE', 'EXPIRED', 'RELEASED', 'CONVERTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "avatar_url" TEXT,
    "dob" DATE,
    "gender" "Gender" NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "device_name" VARCHAR(150),
    "device_type" VARCHAR(50),
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "overview" TEXT NOT NULL,
    "release_date" DATE NOT NULL,
    "language" VARCHAR(50) NOT NULL,
    "poster_url" TEXT NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theaters" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avatar_url" TEXT NOT NULL,
    "seating_capacity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "theaters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" UUID NOT NULL,
    "theater_id" UUID NOT NULL,
    "row_name" VARCHAR(10) NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shows" (
    "id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "theater_id" UUID NOT NULL,
    "on_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "shows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "show_seats" (
    "id" UUID NOT NULL,
    "seat_id" UUID NOT NULL,
    "show_id" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "seat_status" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "show_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_holds" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "show_id" UUID NOT NULL,
    "status" "seat_hold_status" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "seat_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_hold_items" (
    "id" UUID NOT NULL,
    "hold_id" UUID NOT NULL,
    "show_seat_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "seat_hold_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_city_idx" ON "users"("city");

-- CreateIndex
CREATE INDEX "users_is_email_verified_idx" ON "users"("is_email_verified");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_user_id_key" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "movies_release_date_idx" ON "movies"("release_date");

-- CreateIndex
CREATE INDEX "movies_language_idx" ON "movies"("language");

-- CreateIndex
CREATE INDEX "theaters_city_idx" ON "theaters"("city");

-- CreateIndex
CREATE INDEX "seats_theater_id_idx" ON "seats"("theater_id");

-- CreateIndex
CREATE UNIQUE INDEX "seats_theater_id_row_name_seat_number_key" ON "seats"("theater_id", "row_name", "seat_number");

-- CreateIndex
CREATE INDEX "shows_movie_id_idx" ON "shows"("movie_id");

-- CreateIndex
CREATE INDEX "shows_theater_id_idx" ON "shows"("theater_id");

-- CreateIndex
CREATE INDEX "shows_on_date_idx" ON "shows"("on_date");

-- CreateIndex
CREATE INDEX "shows_movie_id_theater_id_on_date_idx" ON "shows"("movie_id", "theater_id", "on_date");

-- CreateIndex
CREATE INDEX "show_seats_show_id_idx" ON "show_seats"("show_id");

-- CreateIndex
CREATE INDEX "show_seats_status_idx" ON "show_seats"("status");

-- CreateIndex
CREATE UNIQUE INDEX "show_seats_seat_id_show_id_key" ON "show_seats"("seat_id", "show_id");

-- CreateIndex
CREATE INDEX "seat_holds_user_id_idx" ON "seat_holds"("user_id");

-- CreateIndex
CREATE INDEX "seat_holds_show_id_idx" ON "seat_holds"("show_id");

-- CreateIndex
CREATE INDEX "seat_holds_status_idx" ON "seat_holds"("status");

-- CreateIndex
CREATE INDEX "seat_holds_expires_at_idx" ON "seat_holds"("expires_at");

-- CreateIndex
CREATE INDEX "seat_hold_items_hold_id_idx" ON "seat_hold_items"("hold_id");

-- CreateIndex
CREATE INDEX "seat_hold_items_show_seat_id_idx" ON "seat_hold_items"("show_seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "seat_hold_items_hold_id_show_seat_id_key" ON "seat_hold_items"("hold_id", "show_seat_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shows" ADD CONSTRAINT "shows_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shows" ADD CONSTRAINT "shows_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_holds" ADD CONSTRAINT "seat_holds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_holds" ADD CONSTRAINT "seat_holds_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold_items" ADD CONSTRAINT "seat_hold_items_hold_id_fkey" FOREIGN KEY ("hold_id") REFERENCES "seat_holds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_hold_items" ADD CONSTRAINT "seat_hold_items_show_seat_id_fkey" FOREIGN KEY ("show_seat_id") REFERENCES "show_seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
