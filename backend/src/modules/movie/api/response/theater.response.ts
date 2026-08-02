import { Theater } from "../../domain/entity/theater.entity";

export function buildTheaterResponse(theater: Theater, message: string) {
  return {
    success: true,
    message,
    data: theater,
  };
}
