namespace NovaWallet.Application.Abstractions.Services;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
