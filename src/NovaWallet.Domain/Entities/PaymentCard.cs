namespace NovaWallet.Domain.Entities;

public class PaymentCard
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string CardToken { get; set; } = string.Empty;
    public string MaskedPan { get; set; } = string.Empty;
    public string CardHolderName { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string Brand { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
