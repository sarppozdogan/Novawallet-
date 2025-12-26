namespace NovaWallet.Domain.Entities;

public class AuditLog
{
    public long Id { get; set; }
    public long? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string? ReferenceId { get; set; }
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
