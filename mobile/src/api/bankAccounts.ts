import { apiRequestWithAuth } from "./client";

export type BankAccountSummary = {
  id: number;
  iban: string;
  bankName: string;
  accountHolderName: string;
  isActive: boolean;
};

export type BankAccountDetail = BankAccountSummary & {
  createdAt: string;
};

export async function getBankAccounts(includeInactive = false): Promise<BankAccountSummary[]> {
  const query = includeInactive ? "?includeInactive=true" : "";
  return apiRequestWithAuth<BankAccountSummary[]>(`/api/bank-accounts${query}`);
}

export async function getBankAccountById(accountId: number): Promise<BankAccountDetail> {
  return apiRequestWithAuth<BankAccountDetail>(`/api/bank-accounts/${accountId}`);
}

export async function createBankAccount(payload: {
  iban: string;
  bankName: string;
  accountHolderName: string;
}): Promise<BankAccountDetail> {
  return apiRequestWithAuth<BankAccountDetail>("/api/bank-accounts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function deactivateBankAccount(accountId: number): Promise<void> {
  await apiRequestWithAuth<void>(`/api/bank-accounts/${accountId}`, {
    method: "DELETE"
  });
}
