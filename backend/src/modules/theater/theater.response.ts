import { injectable } from "inversify";
import { Theater } from "./entity/theater.entity";
import { TheaterShows } from "./entity/theater-shows.entity";

@injectable()
export default class TheaterResponse {
  buildTheaterResponse(theater: Theater) {
    return {
      data: {
        id: theater.id,
        name: theater.name,
        city: theater.city,
        address: theater.address,
        rating: theater.rating,
        avatarUrl: theater.avatarUrl,
        seatingCapacity: theater.seatingCapacity,
      },
    };
  }

  buildTheaterShowsResponse(theaterShows: TheaterShows) {
    return {
      data: theaterShows,
    };
  }
}
