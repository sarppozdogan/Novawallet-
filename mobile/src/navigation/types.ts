export type AuthStackParamList = {
  RegisterStart: { phone?: string } | undefined;
  OtpVerify: { phone: string };
  ProfileComplete: { phone: string };
  Login: { phone?: string } | undefined;
};

export type MainStackParamList = {
  Wallets: undefined;
  WalletDetail: { walletId: number };
  Transactions: { walletId: number; walletNumber: string; currencyCode: string };
  TransactionDetail: { transactionId: string };
  TopUp: { walletId?: number };
  TopUpResult: { transactionId: string; referenceCode: string; status: number; walletId: number };
  Withdraw: { walletId?: number };
  WithdrawResult: { transactionId: string; referenceCode: string; status: number; walletId: number };
  P2P: { walletId?: number };
  P2PResult: { transactionId: string; referenceCode: string; status: number; walletId: number };
  BankAccounts: undefined;
  BankAccountDetail: { accountId: number };
  BankAccountCreate: undefined;
};
