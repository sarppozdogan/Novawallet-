using NovaWallet.Application.Models;

namespace NovaWallet.Application.Abstractions.Services;

public interface IPaymentCardService
{
    Task<IReadOnlyList<PaymentCardSummary>> GetUserCardsAsync(long userId, bool includeInactive = false, CancellationToken cancellationToken = default);
    Task<PaymentCardDetail> GetUserCardAsync(long userId, long cardId, CancellationToken cancellationToken = default);
    Task<PaymentCardDetail> CreateAsync(long userId, CreatePaymentCardRequest request, CancellationToken cancellationToken = default);
    Task DeactivateAsync(long userId, long cardId, CancellationToken cancellationToken = default);
}
