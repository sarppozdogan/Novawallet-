using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Exceptions;
using NovaWallet.Application.Models;

namespace NovaWallet.Application.Services;

public class WalletService : IWalletService
{
    private readonly INovaWalletDbContext _dbContext;

    public WalletService(INovaWalletDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<WalletSummary>> GetUserWalletsAsync(long userId, CancellationToken cancellationToken = default)
    {
        var wallets = await _dbContext.Wallets
            .Where(w => w.UserId == userId)
            .OrderBy(w => w.Id)
            .Select(w => new WalletSummary(w.Id, w.WalletNumber, w.VirtualIban, w.Balance, w.CurrencyCode, w.IsActive))
            .ToListAsync(cancellationToken);

        return wallets;
    }

    public async Task<WalletSummary> GetWalletByIdAsync(long walletId, CancellationToken cancellationToken = default)
    {
        var wallet = await _dbContext.Wallets
            .Where(w => w.Id == walletId)
            .Select(w => new WalletSummary(w.Id, w.WalletNumber, w.VirtualIban, w.Balance, w.CurrencyCode, w.IsActive))
            .FirstOrDefaultAsync(cancellationToken);

        if (wallet is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Wallet not found.", 404);
        }

        return wallet;
    }
}
