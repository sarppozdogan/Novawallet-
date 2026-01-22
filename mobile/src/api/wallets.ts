import { apiRequestWithAuth } from "./client";

export type WalletSummary = {
  id: number;
  walletNumber: string;
  balance: number;
  currencyCode: string;
  isActive: boolean;
};

export async function getWallets(): Promise<WalletSummary[]> {
  return apiRequestWithAuth<WalletSummary[]>("/api/wallets");
}

export async function getWalletById(walletId: number): Promise<WalletSummary> {
  return apiRequestWithAuth<WalletSummary>(`/api/wallets/${walletId}`);
}
