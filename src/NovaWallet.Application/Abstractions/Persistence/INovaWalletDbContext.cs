using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using NovaWallet.Domain.Entities;

namespace NovaWallet.Application.Abstractions.Persistence;

public interface INovaWalletDbContext
{
    DbSet<User> Users { get; }
    DbSet<Wallet> Wallets { get; }
    DbSet<Transaction> Transactions { get; }
    DbSet<LimitDefinition> LimitDefinitions { get; }
    DbSet<OtpCode> OtpCodes { get; }
    DbSet<AuditLog> AuditLogs { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
