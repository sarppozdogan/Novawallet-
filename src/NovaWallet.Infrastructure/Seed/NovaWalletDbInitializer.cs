using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NovaWallet.Application.Abstractions.Security;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;
using NovaWallet.Domain.Entities;
using NovaWallet.Domain.Enums;
using NovaWallet.Infrastructure.Persistence;

namespace NovaWallet.Infrastructure.Seed;

public class NovaWalletDbInitializer
{
    private readonly NovaWalletDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IVirtualIbanGenerator _virtualIbanGenerator;
    private readonly SystemWalletSettings _systemWalletSettings;

    public NovaWalletDbInitializer(
        NovaWalletDbContext dbContext,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider,
        IVirtualIbanGenerator virtualIbanGenerator,
        IOptions<SystemWalletSettings> systemWalletOptions)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
        _virtualIbanGenerator = virtualIbanGenerator;
        _systemWalletSettings = systemWalletOptions.Value;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.MigrateAsync(cancellationToken);
        await SeedSystemWalletAsync(cancellationToken);
        await SeedLimitsAsync(cancellationToken);
        await SeedWalletIbansAsync(cancellationToken);
    }

    private async Task SeedSystemWalletAsync(CancellationToken cancellationToken)
    {
        var systemUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Phone == _systemWalletSettings.SystemUserPhone, cancellationToken);
        if (systemUser is null)
        {
            var salt = _passwordHasher.GenerateSalt();
            systemUser = new User
            {
                Phone = _systemWalletSettings.SystemUserPhone,
                UserType = UserType.Corporate,
                Status = UserStatus.Active,
                PasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString("N"), salt),
                Salt = salt,
                CreatedAt = _dateTimeProvider.UtcNow
            };

            _dbContext.Users.Add(systemUser);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        var systemWallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.WalletNumber == _systemWalletSettings.SystemRevenueWalletNumber, cancellationToken);
        if (systemWallet is null)
        {
            systemWallet = new Wallet
            {
                UserId = systemUser.Id,
                WalletNumber = _systemWalletSettings.SystemRevenueWalletNumber,
                VirtualIban = await _virtualIbanGenerator.GenerateAsync(cancellationToken),
                Balance = 0m,
                CurrencyCode = _systemWalletSettings.CurrencyCode,
                IsActive = true,
                CreatedAt = _dateTimeProvider.UtcNow
            };

            _dbContext.Wallets.Add(systemWallet);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task SeedLimitsAsync(CancellationToken cancellationToken)
    {
        if (await _dbContext.LimitDefinitions.AnyAsync(cancellationToken))
        {
            return;
        }

        var limits = new List<LimitDefinition>
        {
            new() { UserType = UserType.Individual, TransactionType = TransactionType.TopUp, CurrencyCode = "TRY", MaxDailyAmount = 10000m, MaxPerTransaction = 5000m },
            new() { UserType = UserType.Individual, TransactionType = TransactionType.P2P, CurrencyCode = "TRY", MaxDailyAmount = 10000m, MaxPerTransaction = 2500m },
            new() { UserType = UserType.Individual, TransactionType = TransactionType.Withdraw, CurrencyCode = "TRY", MaxDailyAmount = 5000m, MaxPerTransaction = 2500m },
            new() { UserType = UserType.Corporate, TransactionType = TransactionType.TopUp, CurrencyCode = "TRY", MaxDailyAmount = 100000m, MaxPerTransaction = 50000m },
            new() { UserType = UserType.Corporate, TransactionType = TransactionType.P2P, CurrencyCode = "TRY", MaxDailyAmount = 100000m, MaxPerTransaction = 50000m },
            new() { UserType = UserType.Corporate, TransactionType = TransactionType.Withdraw, CurrencyCode = "TRY", MaxDailyAmount = 50000m, MaxPerTransaction = 25000m }
        };

        _dbContext.LimitDefinitions.AddRange(limits);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedWalletIbansAsync(CancellationToken cancellationToken)
    {
        var wallets = await _dbContext.Wallets
            .Where(w => w.VirtualIban == null || w.VirtualIban == string.Empty)
            .ToListAsync(cancellationToken);

        if (wallets.Count == 0)
        {
            return;
        }

        foreach (var wallet in wallets)
        {
            wallet.VirtualIban = await _virtualIbanGenerator.GenerateAsync(cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
