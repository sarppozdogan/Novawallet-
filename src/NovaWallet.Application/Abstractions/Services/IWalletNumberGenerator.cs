namespace NovaWallet.Application.Abstractions.Services;

public interface IWalletNumberGenerator
{
    Task<string> GenerateAsync(CancellationToken cancellationToken = default);
}
