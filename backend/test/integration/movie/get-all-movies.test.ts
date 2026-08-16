import app from "@/app";
import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import MovieFactory from "../../factories/movie.factory";

const API = "/api/movies";

beforeEach(async () => {
  await resetDb();
});

describe("GET /api/movies", () => {
  describe("Success", () => {
    it("should return 200 with an empty list when no movies exist", async () => {
      const res = await request(app).get(API).expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("movies");
      expect(res.body.data).toHaveProperty("totalMovies");
      expect(res.body.data.movies).toEqual([]);
      expect(res.body.data.totalMovies).toBe(0);
    });

    it("should return 200 with a list of all movies and total count", async () => {
      const movie1 = await MovieFactory.createMovie({
        title: "Pushpa: The Rise",
        durationMin: 179,
        language: "Telugu",
        posterUrl: "https://example.com/pushpa.jpg",
      });

      const movie2 = await MovieFactory.createMovie({
        title: "Toxic",
        durationMin: 150,
        language: "Kannada",
        posterUrl: "https://example.com/toxic.jpg",
      });

      const res = await request(app).get(API).expect(200);

      expect(res.body.data.totalMovies).toBe(2);
      expect(res.body.data.movies).toHaveLength(2);

      const movieTitles = res.body.data.movies.map((m: any) => m.title);
      expect(movieTitles).toContain(movie1.title);
      expect(movieTitles).toContain(movie2.title);
    });

    it("should return expected movie properties in list response without overview", async () => {
      const movie = await MovieFactory.createMovie({
        title: "The Odyssey",
        overview: "A long journey home.",
        durationMin: 140,
        language: "English",
        posterUrl: "https://example.com/odyssey.jpg",
      });

      const res = await request(app).get(API).expect(200);

      expect(res.body.data.movies).toHaveLength(1);
      const returnedMovie = res.body.data.movies[0];

      expect(returnedMovie).toHaveProperty("id", movie.id);
      expect(returnedMovie).toHaveProperty("title", movie.title);
      expect(returnedMovie).toHaveProperty("durationMin", movie.durationMin);
      expect(returnedMovie).toHaveProperty("language", movie.language);
      expect(returnedMovie).toHaveProperty("posterUrl", movie.posterUrl);
      expect(returnedMovie).toHaveProperty("releaseDate");
      // Overview should not be present in the summary list
      expect(returnedMovie.overview).toBeUndefined();
    });
  });
});
