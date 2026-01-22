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
};
