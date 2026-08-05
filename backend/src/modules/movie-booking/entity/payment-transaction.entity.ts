export interface PaymentTransaction {
  id: string;
  status: PaymentTransactionStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentTransactionStatus =
  | "PENDING"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED";
