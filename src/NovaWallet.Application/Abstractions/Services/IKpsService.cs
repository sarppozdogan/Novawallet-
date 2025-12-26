namespace NovaWallet.Application.Abstractions.Services;

public interface IKpsService
{
    Task<bool> ValidateTcknAsync(string tckn, CancellationToken cancellationToken = default);
}
