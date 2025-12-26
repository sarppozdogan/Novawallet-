using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Abstractions.Services;

public interface ILimitService
{
    Task ValidateAsync(long userId, TransactionType transactionType, decimal amount, CancellationToken cancellationToken = default);
}
