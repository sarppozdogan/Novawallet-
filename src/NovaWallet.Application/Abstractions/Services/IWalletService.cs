using NovaWallet.Application.Models;

namespace NovaWallet.Application.Abstractions.Services;

public interface IWalletService
{
    Task<IReadOnlyList<WalletSummary>> GetUserWalletsAsync(long userId, CancellationToken cancellationToken = default);
    Task<WalletSummary> GetWalletByIdAsync(long walletId, CancellationToken cancellationToken = default);
}
