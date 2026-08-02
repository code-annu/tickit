import { injectable } from "inversify";
import {
  StreamingTheater as PrismaStreamingTheater,
  Theater as PrismaTheater,
} from "@/generated/prisma/client";
import { StreamingTheater } from "../../domain/entity/streaming-theater.entity";

type StreamingTheaterWithTheater = PrismaStreamingTheater & {
  theater: PrismaTheater;
};

@injectable()
export default class StreamingTheaterMapper {
  toEntity(data: StreamingTheaterWithTheater): StreamingTheater {
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
