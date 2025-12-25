using NovaWallet.Domain.Enums;

namespace NovaWallet.Domain.Entities;

public class User
{
    public long Id { get; set; }
    public UserType UserType { get; set; }
    public UserStatus Status { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Salt { get; set; } = string.Empty;
    public string? TCKN { get; set; }
    public string? TaxNumber { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<Wallet> Wallets { get; set; } = new List<Wallet>();
}
