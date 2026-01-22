using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Models;

public record TopUpRequest(long WalletId, decimal Amount, long BankAccountId, string CurrencyCode = "TRY", string? Description = null);

public record P2PRequest(long SenderWalletId, string ReceiverWalletNumber, decimal Amount, string CurrencyCode = "TRY", string? Description = null);

public record WithdrawRequest(long WalletId, decimal Amount, long BankAccountId, string CurrencyCode = "TRY", string? Description = null);

public record TransactionResult(Guid TransactionId, string ReferenceCode, TransactionStatus Status);

public record TransactionSummary(
    Guid TransactionId,
    TransactionType TransactionType,
    decimal Amount,
    decimal FeeAmount,
    decimal NetTransactionAmount,
    TransactionStatus Status,
    string ReferenceCode,
    DateTime TransactionDate,
    string CurrencyCode,
    bool IsIncoming,
    string? Description,
    string? BankAccountIban);

public record TransactionDetail(
    Guid TransactionId,
    TransactionType TransactionType,
    decimal Amount,
    decimal FeeAmount,
    decimal NetTransactionAmount,
    TransactionStatus Status,
    string ReferenceCode,
    DateTime TransactionDate,
    string CurrencyCode,
    string? SenderWalletNumber,
    string? ReceiverWalletNumber,
    string? Description,
    string? BankAccountIban);
