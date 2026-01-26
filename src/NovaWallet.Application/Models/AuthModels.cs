using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Models;

public record RegisterStartRequest(string Phone);

public record RegisterStartResult(long UserId, UserStatus Status);

public record VerifyOtpRequest(string Phone, string Code);

public record CompleteProfileRequest(
    string Phone,
    UserType UserType,
    string Password,
    string? Name,
    string? Surname,
    string? Address,
    DateTime? DateOfBirth,
    string? Tckn,
    string? TaxNumber,
    string CurrencyCode = "TRY");

public record CompleteProfileResult(long UserId, long WalletId, string WalletNumber, string CurrencyCode);

public record LoginRequest(string Phone, string Password);

public record LoginResult(bool IsSuccess, bool RequiresProfileCompletion, string? Token, long? UserId);
