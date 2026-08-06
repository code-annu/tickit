export interface MovieShow {
  id: string;
  theater: {
    id: string;
    name: string;
    city: string;
    address: string;
    avatarUrl: string;
    rating: number;
  };
  onDate: Date;
  startTime: Date;
  onwardsPrice: number;
}
