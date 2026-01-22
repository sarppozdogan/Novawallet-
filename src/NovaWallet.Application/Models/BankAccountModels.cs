namespace NovaWallet.Application.Models;

public record CreateBankAccountRequest(string Iban, string BankName, string AccountHolderName);

public record BankAccountSummary(
    long Id,
    string Iban,
    string BankName,
    string AccountHolderName,
    bool IsActive);

public record BankAccountDetail(
    long Id,
    string Iban,
    string BankName,
    string AccountHolderName,
    bool IsActive,
    DateTime CreatedAt);
