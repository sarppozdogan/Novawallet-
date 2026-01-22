using NovaWallet.Domain.Enums;

namespace NovaWallet.Domain.Entities;

public class User
{
    public long Id { get; set; }
    public UserType UserType { get; set; }
    public UserStatus Status { get; set; }
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? Address { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Salt { get; set; } = string.Empty;
    public string? TCKN { get; set; }
    public string? TaxNumber { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<Wallet> Wallets { get; set; } = new List<Wallet>();
    public ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
    public ICollection<PaymentCard> PaymentCards { get; set; } = new List<PaymentCard>();
}
