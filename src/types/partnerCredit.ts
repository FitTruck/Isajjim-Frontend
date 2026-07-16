export interface ChargeReadyResponse {
  orderId: string;
  orderName: string;
  amount: number;
  creditAmount: number;
  clientKey: string;
  successUrl: string;
  failUrl: string;
}

export interface ChargeConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface ChargeConfirmResponse {
  orderId: string;
  chargedCredit: number;
  balance: number;
  approvedAt: string;
}

export interface BalanceResponse {
  balance: number;
}

export type CreditTransactionType = 'CHARGE' | 'CONSUME' | 'REFUND';

export interface CreditTransaction {
  transactionId: number;
  type: CreditTransactionType;
  creditAmount: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: number;
  createdDate: string;
}

export interface CreditTransactionPage {
  content: CreditTransaction[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
