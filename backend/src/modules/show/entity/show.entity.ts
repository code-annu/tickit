export interface Show {
  readonly id: string;
  readonly onDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly basePrice: number;
  readonly movie: { readonly id: string; readonly title: string };
  readonly theater: { readonly id: string; readonly address: string };
}
