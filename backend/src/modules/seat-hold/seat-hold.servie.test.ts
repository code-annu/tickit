import { describe, expect, it, vi, type Mock } from "vitest";
import SeatHoldService from "./seat-hold.service";
import type SeatHoldRepository from "./repository/seat-hold.repository";
import type { SeatHold } from "./entity/seat-hold.entity";
import { SeatHoldError, SeatHoldNotFoundError } from "./error/errors";

// ---------------------------------------------------------------------------
// Mock prisma.$transaction so it just runs the callback with `tx`
// ---------------------------------------------------------------------------
vi.mock("@/core/prisma/prisma.client", () => ({
  prisma: {
    $transaction: vi.fn((cb: (tx: any) => any) => cb({})),
  },
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const mockSeatHold: SeatHold = {
  id: "hold-1",
  showId: "show-1",
  userId: "user-1",
  status: "ACTIVE",
  expiresAt: new Date("2026-08-15T10:08:00Z"),
};

// ---------------------------------------------------------------------------
// Factory for mocked dependencies
// ---------------------------------------------------------------------------
function createMocks() {
  const seatHoldRepo: Record<string, Mock> = {
    findById: vi.fn(),
    lockAndHoldSeats: vi.fn(),
    createHold: vi.fn(),
    createHoldItems: vi.fn(),
  };

  const seatHoldService = new (SeatHoldService as any)(seatHoldRepo);

  return {
    seatHoldService: seatHoldService as SeatHoldService,
    seatHoldRepo: seatHoldRepo as unknown as SeatHoldRepository,
  };
}

// ===========================================================================
// HOLD SEAT
// ===========================================================================
describe("holdSeat", () => {
  const userId = "user-1";
  const showSeatIds = ["seat-uuid-aaa", "seat-uuid-bbb"];
  const holdInput = { showId: "show-1", showSeatIds };

  it("should return SeatHold on successful hold", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    (seatHoldRepo.lockAndHoldSeats as Mock).mockResolvedValue(
      showSeatIds.length,
    );
    (seatHoldRepo.createHold as Mock).mockResolvedValue(mockSeatHold);
    (seatHoldRepo.createHoldItems as Mock).mockResolvedValue({ count: 2 });

    const result = await seatHoldService.holdSeat(userId, holdInput);

    expect(result).toEqual(mockSeatHold);
    expect(seatHoldRepo.lockAndHoldSeats).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ showId: "show-1", showSeatIds }),
    );
    expect(seatHoldRepo.createHold).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId,
        showId: "show-1",
        expiresAt: expect.any(Date),
      }),
    );
    expect(seatHoldRepo.createHoldItems).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        holdId: mockSeatHold.id,
        showSeatIds,
      }),
    );
  });

  it("should throw SeatHoldError when seats cannot be held (count mismatch)", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    // Only 1 of 2 seats was lockable
    (seatHoldRepo.lockAndHoldSeats as Mock).mockResolvedValue(1);

    await expect(
      seatHoldService.holdSeat(userId, holdInput),
    ).rejects.toThrow(SeatHoldError);

    expect(seatHoldRepo.lockAndHoldSeats).toHaveBeenCalled();
    expect(seatHoldRepo.createHold).not.toHaveBeenCalled();
  });

  it("should sort showSeatIds before locking to prevent deadlocks", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    const unsortedIds = ["seat-uuid-zzz", "seat-uuid-aaa", "seat-uuid-mmm"];
    const sortedIds = ["seat-uuid-aaa", "seat-uuid-mmm", "seat-uuid-zzz"];

    (seatHoldRepo.lockAndHoldSeats as Mock).mockResolvedValue(
      unsortedIds.length,
    );
    (seatHoldRepo.createHold as Mock).mockResolvedValue(mockSeatHold);
    (seatHoldRepo.createHoldItems as Mock).mockResolvedValue({ count: 3 });

    await seatHoldService.holdSeat(userId, {
      showId: "show-1",
      showSeatIds: unsortedIds,
    });

    expect(seatHoldRepo.lockAndHoldSeats).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ showSeatIds: sortedIds }),
    );
  });

  it("should propagate errors from seatHoldRepo.lockAndHoldSeats", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    (seatHoldRepo.lockAndHoldSeats as Mock).mockRejectedValue(
      new Error("DB lock error"),
    );

    await expect(
      seatHoldService.holdSeat(userId, holdInput),
    ).rejects.toThrow("DB lock error");
  });

  it("should propagate errors from seatHoldRepo.createHold", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    (seatHoldRepo.lockAndHoldSeats as Mock).mockResolvedValue(
      showSeatIds.length,
    );
    (seatHoldRepo.createHold as Mock).mockRejectedValue(
      new Error("DB create error"),
    );

    await expect(
      seatHoldService.holdSeat(userId, holdInput),
    ).rejects.toThrow("DB create error");
  });

  it("should propagate errors from seatHoldRepo.createHoldItems", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    (seatHoldRepo.lockAndHoldSeats as Mock).mockResolvedValue(
      showSeatIds.length,
    );
    (seatHoldRepo.createHold as Mock).mockResolvedValue(mockSeatHold);
    (seatHoldRepo.createHoldItems as Mock).mockRejectedValue(
      new Error("DB items error"),
    );

    await expect(
      seatHoldService.holdSeat(userId, holdInput),
    ).rejects.toThrow("DB items error");
  });
});

// ===========================================================================
// GET SEAT HOLD BY ID
// ===========================================================================
describe("getSeatHoldById", () => {
  it("should return the seat hold when it exists", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    (seatHoldRepo.findById as Mock).mockResolvedValue(mockSeatHold);

    const result = await seatHoldService.getSeatHoldById("hold-1");

    expect(seatHoldRepo.findById).toHaveBeenCalledWith("hold-1");
    expect(result).toEqual(mockSeatHold);
  });

  it("should throw SeatHoldNotFoundError when seat hold does not exist", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    (seatHoldRepo.findById as Mock).mockResolvedValue(null);

    await expect(
      seatHoldService.getSeatHoldById("nonexistent-id"),
    ).rejects.toThrow(SeatHoldNotFoundError);

    expect(seatHoldRepo.findById).toHaveBeenCalledWith("nonexistent-id");
  });

  it("should propagate errors from seatHoldRepo.findById", async () => {
    const { seatHoldService, seatHoldRepo } = createMocks();
    (seatHoldRepo.findById as Mock).mockRejectedValue(new Error("DB error"));

    await expect(
      seatHoldService.getSeatHoldById("hold-1"),
    ).rejects.toThrow("DB error");
  });
});
