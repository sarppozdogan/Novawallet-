using NovaWallet.Application.Models;

namespace NovaWallet.Application.Abstractions.Services;

public interface IBankAccountService
{
    Task<IReadOnlyList<BankAccountSummary>> GetUserBankAccountsAsync(long userId, bool includeInactive = false, CancellationToken cancellationToken = default);
    Task<BankAccountDetail> GetUserBankAccountAsync(long userId, long bankAccountId, CancellationToken cancellationToken = default);
    Task<BankAccountDetail> CreateAsync(long userId, CreateBankAccountRequest request, CancellationToken cancellationToken = default);
    Task DeactivateAsync(long userId, long bankAccountId, CancellationToken cancellationToken = default);
}
