using NovaWallet.Domain.Enums;

namespace NovaWallet.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public long? SenderWalletId { get; set; }
    public long? ReceiverWalletId { get; set; }
    public long? BankAccountId { get; set; }
    public long? CardId { get; set; }
    public TransactionType TransactionType { get; set; }
    public decimal Amount { get; set; }
    public decimal FeeAmount { get; set; }
    public decimal NetTransactionAmount { get; set; }
    public string CurrencyCode { get; set; } = "TRY";
    public TransactionStatus Status { get; set; }
    public string ReferenceCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime TransactionDate { get; set; }

    public Wallet? SenderWallet { get; set; }
    public Wallet? ReceiverWallet { get; set; }
    public BankAccount? BankAccount { get; set; }
    public PaymentCard? Card { get; set; }
}
