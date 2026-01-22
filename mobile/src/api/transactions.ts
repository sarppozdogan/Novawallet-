import { apiRequestWithAuth } from "./client";

export type TransactionSummary = {
  transactionId: string;
  transactionType: number;
  amount: number;
  feeAmount: number;
  netTransactionAmount: number;
  status: number;
  referenceCode: string;
  transactionDate: string;
  currencyCode: string;
  isIncoming: boolean;
  description?: string | null;
  bankAccountIban?: string | null;
};

export type TransactionDetail = {
  transactionId: string;
  transactionType: number;
  amount: number;
  feeAmount: number;
  netTransactionAmount: number;
  status: number;
  referenceCode: string;
  transactionDate: string;
  currencyCode: string;
  senderWalletNumber?: string | null;
  receiverWalletNumber?: string | null;
  description?: string | null;
  bankAccountIban?: string | null;
};

export type TopUpRequest = {
  walletId: number;
  amount: number;
  bankAccountId: number;
  currencyCode: string;
  description?: string | null;
};

export type TransactionResult = {
  transactionId: string;
  referenceCode: string;
  status: number;
};

export async function getTransactions(walletId: number): Promise<TransactionSummary[]> {
  return apiRequestWithAuth<TransactionSummary[]>(`/api/transactions?walletId=${walletId}`);
}

export async function getTransactionById(transactionId: string): Promise<TransactionDetail> {
  return apiRequestWithAuth<TransactionDetail>(`/api/transactions/${transactionId}`);
}

export async function topUp(payload: TopUpRequest): Promise<TransactionResult> {
  return apiRequestWithAuth<TransactionResult>("/api/transactions/topup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
