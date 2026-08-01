import { injectable } from "inversify";
import {
  TheaterStreaming as PrismaTheaterStreaming,
  Movie as PrismaMovie,
  Theater as PrismaTheater,
} from "@/generated/prisma/client";
import { TheaterStreaming } from "../entity/theater-streaming.entity";

type TheaterStreamingWithTheater = PrismaTheaterStreaming & {
  theater: PrismaTheater;
};

@injectable()
export default class TheaterStreamingMapper {
  toEntity(data: TheaterStreamingWithTheater): TheaterStreaming {
    return {
      id: data.id,
      theater: data.theater,
      onDate: data.onDate,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      onwardsAmount: data.onwardsAmount.toNumber(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
