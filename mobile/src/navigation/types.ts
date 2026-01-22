export type AuthStackParamList = {
  RegisterStart: { phone?: string; tckn?: string } | undefined;
  OtpVerify: { phone: string; tckn?: string };
  ProfileComplete: { phone: string; tckn?: string };
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
  Cards: undefined;
  CardDetail: { cardId: number };
  CardCreate: undefined;
};
