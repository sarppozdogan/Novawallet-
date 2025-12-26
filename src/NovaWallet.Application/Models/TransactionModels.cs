using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Models;

public record TopUpRequest(long WalletId, decimal Amount, string SourceBank, string CurrencyCode = "TRY");

public record P2PRequest(long SenderWalletId, string ReceiverWalletNumber, decimal Amount, string CurrencyCode = "TRY");

public record WithdrawRequest(long WalletId, decimal Amount, string DestinationIban, string CurrencyCode = "TRY");

public record TransactionResult(Guid TransactionId, string ReferenceCode, TransactionStatus Status);

public record TransactionSummary(
    Guid TransactionId,
    TransactionType TransactionType,
    decimal Amount,
    decimal FeeAmount,
    TransactionStatus Status,
    string ReferenceCode,
    DateTime TransactionDate,
    string CurrencyCode,
    bool IsIncoming);

public record TransactionDetail(
    Guid TransactionId,
    TransactionType TransactionType,
    decimal Amount,
    decimal FeeAmount,
    TransactionStatus Status,
    string ReferenceCode,
    DateTime TransactionDate,
    string CurrencyCode,
    string? SenderWalletNumber,
    string? ReceiverWalletNumber);
