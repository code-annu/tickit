import { PaymentTransaction as PrismaPaymentTransaction } from "@/generated/prisma";
import { injectable } from "inversify";
import { PaymentTransaction } from "../entity/payment-transaction.entity";

@injectable()
export default class PaymentTransactionMapper {
  toEntity(txn: PrismaPaymentTransaction): PaymentTransaction {
    return {
      id: txn.id,
      status: txn.status,
      totalAmount: txn.totalAmount.toNumber(),
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
    };
  }
}
