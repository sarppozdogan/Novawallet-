using NovaWallet.Domain.Enums;

namespace NovaWallet.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public long? SenderWalletId { get; set; }
    public long? ReceiverWalletId { get; set; }
    public TransactionType TransactionType { get; set; }
    public decimal Amount { get; set; }
    public decimal FeeAmount { get; set; }
    public TransactionStatus Status { get; set; }
    public string ReferenceCode { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }

    public Wallet? SenderWallet { get; set; }
    public Wallet? ReceiverWallet { get; set; }
}
