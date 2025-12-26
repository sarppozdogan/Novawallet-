using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NovaWallet.Infrastructure.Persistence;

public class NovaWalletDbContextFactory : IDesignTimeDbContextFactory<NovaWalletDbContext>
{
    public NovaWalletDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("NOVA_DB_CONNECTION")
            ?? "Server=.;Database=NovaWalletDb;Trusted_Connection=True;TrustServerCertificate=True;";

        var optionsBuilder = new DbContextOptionsBuilder<NovaWalletDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new NovaWalletDbContext(optionsBuilder.Options);
    }
}
