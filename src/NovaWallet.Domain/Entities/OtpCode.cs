namespace NovaWallet.Domain.Entities;

public class OtpCode
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
