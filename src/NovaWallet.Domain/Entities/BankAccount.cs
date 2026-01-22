namespace NovaWallet.Domain.Entities;

public class BankAccount
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string Iban { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AccountHolderName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
