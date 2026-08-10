import { TheaterShow } from "./entity/theater-show.entity";
import { Theater } from "./entity/theater.entity";

export function buildTheaterResponse(data: Theater, message: string) {
  const { id, name, city, avatarUrl, address, rating, seatingCapacity } = data;
  return {
    success: true,
    data: { id, name, city, avatarUrl, address, rating, seatingCapacity },
    message,
  };
}

export function buildTheatersListResponse(data: Theater[], message: string) {
  const theaters = data.map((theater) => {
    const { id, name, city, avatarUrl, address, rating, seatingCapacity } =
      theater;
    return { id, name, city, avatarUrl, address, rating, seatingCapacity };
  });
  return {
    success: true,
    message,
    data: {
      theaters,
      totalTheaters: theaters.length,
    },
  };
}

export function buildTheaterShowResponse(
  data: { theater: Theater; shows: TheaterShow[] },
  message: string,
) {
  const { theater, shows } = data;
  const { id, name, city, avatarUrl, address, rating, seatingCapacity } =
    theater;

  const showsList = shows.map((show) => {
    const { id, movie, onDate, startTime, onwardsAmount } = show;
    return { id, movie, onDate, startTime, onwardsAmount };
  });

  return {
    success: true,
    message,
    data: {
      theater: { id, name, city, avatarUrl, address, rating, seatingCapacity },
      shows: showsList,
      totalShow: shows.length,
    },
  };
}
