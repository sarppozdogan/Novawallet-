namespace NovaWallet.Application.Models;

public record WalletSummary(long Id, string WalletNumber, string? VirtualIban, decimal Balance, string CurrencyCode, bool IsActive);
