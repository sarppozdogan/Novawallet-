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
    private readonly SystemWalletSettings _systemWalletSettings;

    public NovaWalletDbInitializer(
        NovaWalletDbContext dbContext,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider,
        IOptions<SystemWalletSettings> systemWalletOptions)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
        _systemWalletSettings = systemWalletOptions.Value;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.MigrateAsync(cancellationToken);
        await SeedSystemWalletAsync(cancellationToken);
        await SeedLimitsAsync(cancellationToken);
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
            new() { UserType = UserType.Individual, TransactionType = TransactionType.TopUp, MaxDailyAmount = 10000m, MaxPerTransaction = 5000m },
            new() { UserType = UserType.Individual, TransactionType = TransactionType.P2P, MaxDailyAmount = 10000m, MaxPerTransaction = 2500m },
            new() { UserType = UserType.Individual, TransactionType = TransactionType.Withdraw, MaxDailyAmount = 5000m, MaxPerTransaction = 2500m },
            new() { UserType = UserType.Corporate, TransactionType = TransactionType.TopUp, MaxDailyAmount = 100000m, MaxPerTransaction = 50000m },
            new() { UserType = UserType.Corporate, TransactionType = TransactionType.P2P, MaxDailyAmount = 100000m, MaxPerTransaction = 50000m },
            new() { UserType = UserType.Corporate, TransactionType = TransactionType.Withdraw, MaxDailyAmount = 50000m, MaxPerTransaction = 25000m }
        };

        _dbContext.LimitDefinitions.AddRange(limits);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
