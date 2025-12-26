using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Exceptions;
using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Services;

public class LimitService : ILimitService
{
    private readonly INovaWalletDbContext _dbContext;
    private readonly IDateTimeProvider _dateTimeProvider;

    public LimitService(INovaWalletDbContext dbContext, IDateTimeProvider dateTimeProvider)
    {
        _dbContext = dbContext;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task ValidateAsync(long userId, TransactionType transactionType, decimal amount, CancellationToken cancellationToken = default)
    {
        if (amount <= 0)
        {
            throw new AppException(ErrorCodes.ValidationError, "Amount must be greater than zero.", 400);
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            throw new AppException(ErrorCodes.NotFound, "User not found.", 404);
        }

        var limit = await _dbContext.LimitDefinitions
            .FirstOrDefaultAsync(l => l.UserType == user.UserType && l.TransactionType == transactionType, cancellationToken);

        if (limit is null)
        {
            return;
        }

        if (amount > limit.MaxPerTransaction)
        {
            throw new AppException(ErrorCodes.LimitExceeded, "Per-transaction limit exceeded.", 400);
        }

        var walletIds = await _dbContext.Wallets
            .Where(w => w.UserId == userId)
            .Select(w => w.Id)
            .ToListAsync(cancellationToken);

        if (walletIds.Count == 0)
        {
            throw new AppException(ErrorCodes.NotFound, "Wallet not found.", 404);
        }

        var dayStart = _dateTimeProvider.UtcNow.Date;
        var dailyQuery = _dbContext.Transactions
            .Where(t => t.Status == Domain.Enums.TransactionStatus.Success)
            .Where(t => t.TransactionType == transactionType)
            .Where(t => t.TransactionDate >= dayStart);

        dailyQuery = transactionType switch
        {
            TransactionType.TopUp => dailyQuery.Where(t => t.ReceiverWalletId.HasValue && walletIds.Contains(t.ReceiverWalletId.Value)),
            TransactionType.Withdraw => dailyQuery.Where(t => t.SenderWalletId.HasValue && walletIds.Contains(t.SenderWalletId.Value)),
            _ => dailyQuery.Where(t => t.SenderWalletId.HasValue && walletIds.Contains(t.SenderWalletId.Value))
        };

        var dailyTotal = await dailyQuery.SumAsync(t => t.Amount, cancellationToken);

        if (dailyTotal + amount > limit.MaxDailyAmount)
        {
            throw new AppException(ErrorCodes.LimitExceeded, "Daily limit exceeded.", 400);
        }
    }
}
