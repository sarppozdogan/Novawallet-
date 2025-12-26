namespace NovaWallet.Domain.Entities;

public class Wallet
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string WalletNumber { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string CurrencyCode { get; set; } = "TRY";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
