using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Domain.Entities;

namespace NovaWallet.Infrastructure.Persistence;

public class NovaWalletDbContext : DbContext, INovaWalletDbContext
{
    public NovaWalletDbContext(DbContextOptions<NovaWalletDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<PaymentCard> PaymentCards => Set<PaymentCard>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<LimitDefinition> LimitDefinitions => Set<LimitDefinition>();
    public DbSet<OtpCode> OtpCodes => Set<OtpCode>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(builder =>
        {
            builder.HasIndex(u => u.Phone).IsUnique();
            builder.HasIndex(u => u.TCKN).IsUnique().HasFilter("[TCKN] IS NOT NULL");
            builder.HasIndex(u => u.TaxNumber).IsUnique().HasFilter("[TaxNumber] IS NOT NULL");
            builder.Property(u => u.Phone).HasMaxLength(20);
            builder.Property(u => u.Name).HasMaxLength(100);
            builder.Property(u => u.Surname).HasMaxLength(100);
            builder.Property(u => u.Address).HasMaxLength(512);
            builder.Property(u => u.PasswordHash).HasMaxLength(256);
            builder.Property(u => u.Salt).HasMaxLength(128);
            builder.Property(u => u.TCKN).HasMaxLength(11);
            builder.Property(u => u.TaxNumber).HasMaxLength(20);
        });

        modelBuilder.Entity<Wallet>(builder =>
        {
            builder.HasIndex(w => w.WalletNumber).IsUnique();
            builder.Property(w => w.WalletNumber).HasMaxLength(32);
            builder.HasIndex(w => w.VirtualIban).IsUnique();
            builder.Property(w => w.VirtualIban).HasMaxLength(34);
            builder.Property(w => w.Balance).HasPrecision(19, 4);
            builder.Property(w => w.CurrencyCode).HasMaxLength(3);

            builder.HasOne(w => w.User)
                .WithMany(u => u.Wallets)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BankAccount>(builder =>
        {
            builder.HasIndex(b => b.Iban).IsUnique();
            builder.Property(b => b.Iban).HasMaxLength(34);
            builder.Property(b => b.BankName).HasMaxLength(128);
            builder.Property(b => b.AccountHolderName).HasMaxLength(128);

            builder.HasOne(b => b.User)
                .WithMany(u => u.BankAccounts)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transaction>(builder =>
        {
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id)
                .ValueGeneratedOnAdd()
                .HasDefaultValueSql("NEWID()");
            builder.Property(t => t.Amount).HasPrecision(19, 4);
            builder.Property(t => t.FeeAmount).HasPrecision(19, 4);
            builder.Property(t => t.NetTransactionAmount).HasPrecision(19, 4);
            builder.Property(t => t.CurrencyCode).HasMaxLength(3);
            builder.Property(t => t.ReferenceCode).HasMaxLength(64);
            builder.Property(t => t.Description).HasMaxLength(512);
            builder.HasIndex(t => t.ReferenceCode).IsUnique();

            builder.HasOne(t => t.SenderWallet)
                .WithMany()
                .HasForeignKey(t => t.SenderWalletId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.ReceiverWallet)
                .WithMany()
                .HasForeignKey(t => t.ReceiverWalletId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.BankAccount)
                .WithMany()
                .HasForeignKey(t => t.BankAccountId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.Card)
                .WithMany()
                .HasForeignKey(t => t.CardId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PaymentCard>(builder =>
        {
            builder.HasIndex(c => c.CardToken).IsUnique();
            builder.Property(c => c.CardToken).HasMaxLength(128);
            builder.Property(c => c.MaskedPan).HasMaxLength(32);
            builder.Property(c => c.CardHolderName).HasMaxLength(150);
            builder.Property(c => c.Brand).HasMaxLength(32);

            builder.HasOne(c => c.User)
                .WithMany(u => u.PaymentCards)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LimitDefinition>(builder =>
        {
            builder.Property(l => l.MaxDailyAmount).HasPrecision(19, 4);
            builder.Property(l => l.MaxPerTransaction).HasPrecision(19, 4);
            builder.Property(l => l.CurrencyCode).HasMaxLength(3);
            builder.HasIndex(l => new { l.UserType, l.TransactionType, l.CurrencyCode }).IsUnique();
        });

        modelBuilder.Entity<OtpCode>(builder =>
        {
            builder.Property(o => o.Phone).HasMaxLength(20);
            builder.Property(o => o.Code).HasMaxLength(6);
            builder.HasIndex(o => o.Phone);

            builder.HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(builder =>
        {
            builder.Property(a => a.Action).HasMaxLength(64);
            builder.Property(a => a.IpAddress).HasMaxLength(64);
            builder.Property(a => a.ReferenceId).HasMaxLength(64);
            builder.Property(a => a.Details).HasMaxLength(512);

            builder.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
