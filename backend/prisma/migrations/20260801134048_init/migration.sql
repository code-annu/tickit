-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('BOOKED', 'HELD', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CAPTURED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('FAILED', 'SUCCESS');

-- CreateTable
CREATE TABLE "theater_seats" (
    "id" UUID NOT NULL,
    "theater_id" UUID NOT NULL,
    "seat_number" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "theater_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theater_seat_inventory" (
    "id" UUID NOT NULL,
    "seat_id" UUID NOT NULL,
    "streaming_id" UUID NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "theater_seat_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_bookings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "seat_inventory_id" UUID NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "transaction_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "movie_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "theater_seats_theater_id_idx" ON "theater_seats"("theater_id");

-- CreateIndex
CREATE UNIQUE INDEX "theater_seats_theater_id_seat_number_key" ON "theater_seats"("theater_id", "seat_number");

-- CreateIndex
CREATE INDEX "theater_seat_inventory_streaming_id_idx" ON "theater_seat_inventory"("streaming_id");

-- CreateIndex
CREATE INDEX "theater_seat_inventory_seat_id_idx" ON "theater_seat_inventory"("seat_id");

-- CreateIndex
CREATE INDEX "theater_seat_inventory_status_idx" ON "theater_seat_inventory"("status");

-- CreateIndex
CREATE UNIQUE INDEX "theater_seat_inventory_streaming_id_seat_id_key" ON "theater_seat_inventory"("streaming_id", "seat_id");

-- CreateIndex
CREATE INDEX "payment_transactions_user_id_idx" ON "payment_transactions"("user_id");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "movie_bookings_user_id_idx" ON "movie_bookings"("user_id");

-- CreateIndex
CREATE INDEX "movie_bookings_seat_inventory_id_idx" ON "movie_bookings"("seat_inventory_id");

-- CreateIndex
CREATE INDEX "movie_bookings_transaction_id_idx" ON "movie_bookings"("transaction_id");

-- CreateIndex
CREATE INDEX "movie_bookings_status_idx" ON "movie_bookings"("status");

-- AddForeignKey
ALTER TABLE "theater_seats" ADD CONSTRAINT "theater_seats_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theater_seat_inventory" ADD CONSTRAINT "theater_seat_inventory_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "theater_seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theater_seat_inventory" ADD CONSTRAINT "theater_seat_inventory_streaming_id_fkey" FOREIGN KEY ("streaming_id") REFERENCES "theater_streamings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_bookings" ADD CONSTRAINT "movie_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_bookings" ADD CONSTRAINT "movie_bookings_seat_inventory_id_fkey" FOREIGN KEY ("seat_inventory_id") REFERENCES "theater_seat_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_bookings" ADD CONSTRAINT "movie_bookings_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
