namespace NovaWallet.Application.Abstractions.Services;

public interface IVirtualIbanGenerator
{
    Task<string> GenerateAsync(CancellationToken cancellationToken = default);
}
