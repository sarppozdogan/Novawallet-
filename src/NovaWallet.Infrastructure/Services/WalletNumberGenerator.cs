using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;

namespace NovaWallet.Infrastructure.Services;

public class WalletNumberGenerator : IWalletNumberGenerator
{
    private readonly INovaWalletDbContext _dbContext;

    public WalletNumberGenerator(INovaWalletDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string> GenerateAsync(CancellationToken cancellationToken = default)
    {
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var candidate = $"NW-{Random.Shared.Next(0, 1000000):D6}";
            var exists = await _dbContext.Wallets.AnyAsync(w => w.WalletNumber == candidate, cancellationToken);
            if (!exists)
            {
                return candidate;
            }
        }

        throw new InvalidOperationException("Unable to generate wallet number.");
    }
}
