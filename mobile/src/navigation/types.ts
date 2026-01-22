export type AuthStackParamList = {
  RegisterStart: { phone?: string } | undefined;
  OtpVerify: { phone: string };
  ProfileComplete: { phone: string };
  Login: { phone?: string } | undefined;
};
