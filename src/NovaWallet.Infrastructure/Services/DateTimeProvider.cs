using NovaWallet.Application.Abstractions.Services;

namespace NovaWallet.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
