namespace NovaWallet.Application.Models;

public record CreatePaymentCardRequest(
    string CardNumber,
    string CardHolderName,
    int ExpiryMonth,
    int ExpiryYear);

public record PaymentCardSummary(
    long Id,
    string MaskedPan,
    string CardHolderName,
    int ExpiryMonth,
    int ExpiryYear,
    string Brand,
    bool IsActive);

public record PaymentCardDetail(
    long Id,
    string MaskedPan,
    string CardHolderName,
    int ExpiryMonth,
    int ExpiryYear,
    string Brand,
    bool IsActive,
    DateTime CreatedAt);
