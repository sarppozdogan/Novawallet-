using NovaWallet.Domain.Enums;

namespace NovaWallet.Domain.Entities;

public class LimitDefinition
{
    public long Id { get; set; }
    public UserType UserType { get; set; }
    public TransactionType TransactionType { get; set; }
    public string CurrencyCode { get; set; } = "TRY";
    public decimal MaxDailyAmount { get; set; }
    public decimal MaxPerTransaction { get; set; }
}
