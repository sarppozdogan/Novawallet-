using Microsoft.EntityFrameworkCore;
using NovaWallet.Domain.Entities;

namespace NovaWallet.Infrastructure.Persistence;

public class NovaWalletDbContext : DbContext
{
    public NovaWalletDbContext(DbContextOptions<NovaWalletDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<LimitDefinition> LimitDefinitions => Set<LimitDefinition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(builder =>
        {
            builder.HasIndex(u => u.Phone).IsUnique();
            builder.Property(u => u.Phone).HasMaxLength(20);
            builder.Property(u => u.PasswordHash).HasMaxLength(256);
            builder.Property(u => u.Salt).HasMaxLength(128);
            builder.Property(u => u.TCKN).HasMaxLength(11);
            builder.Property(u => u.TaxNumber).HasMaxLength(20);
        });

        modelBuilder.Entity<Wallet>(builder =>
        {
            builder.HasIndex(w => w.WalletNumber).IsUnique();
            builder.Property(w => w.WalletNumber).HasMaxLength(32);
            builder.Property(w => w.Balance).HasPrecision(19, 4);

            builder.HasOne(w => w.User)
                .WithMany(u => u.Wallets)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transaction>(builder =>
        {
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id).ValueGeneratedOnAdd();
            builder.Property(t => t.Amount).HasPrecision(19, 4);
            builder.Property(t => t.FeeAmount).HasPrecision(19, 4);
            builder.Property(t => t.ReferenceCode).HasMaxLength(64);

            builder.HasOne(t => t.SenderWallet)
                .WithMany()
                .HasForeignKey(t => t.SenderWalletId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.ReceiverWallet)
                .WithMany()
                .HasForeignKey(t => t.ReceiverWalletId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LimitDefinition>(builder =>
        {
            builder.Property(l => l.MaxDailyAmount).HasPrecision(19, 4);
            builder.Property(l => l.MaxPerTransaction).HasPrecision(19, 4);
        });
    }
}
