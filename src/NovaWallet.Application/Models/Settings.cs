namespace NovaWallet.Application.Models;

public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60;
}

public class FeeSettings
{
    public decimal P2pFeeRate { get; set; } = 0.01m;
    public decimal TopUpFeeRate { get; set; } = 0m;
    public decimal WithdrawFeeRate { get; set; } = 0m;
}

public class OtpSettings
{
    public int ExpiryMinutes { get; set; } = 5;
}

public class SystemWalletSettings
{
    public string SystemUserPhone { get; set; } = "0000000000";
    public string SystemRevenueWalletNumber { get; set; } = "NW-000000";
    public string CurrencyCode { get; set; } = "TRY";
}
