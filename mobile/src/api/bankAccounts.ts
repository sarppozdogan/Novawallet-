import { apiRequestWithAuth } from "./client";

export type BankAccountSummary = {
  id: number;
  iban: string;
  bankName: string;
  accountHolderName: string;
  isActive: boolean;
};

export async function getBankAccounts(includeInactive = false): Promise<BankAccountSummary[]> {
  const query = includeInactive ? "?includeInactive=true" : "";
  return apiRequestWithAuth<BankAccountSummary[]>(`/api/bank-accounts${query}`);
}
