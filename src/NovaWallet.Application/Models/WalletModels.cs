namespace NovaWallet.Application.Models;

public record WalletSummary(long Id, string WalletNumber, decimal Balance, string CurrencyCode, bool IsActive);
