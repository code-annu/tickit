export interface Show {
  id: string;
  movie: {
    id: string;
    title: string;
    posterUrl: string;
  };
  theater: {
    id: string;
    name: string;
    address: string;
  };
  onDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  onwardAmount: number;
}
