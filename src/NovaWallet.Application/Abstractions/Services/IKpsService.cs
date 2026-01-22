namespace NovaWallet.Application.Abstractions.Services;

public interface IKpsService
{
    Task<bool> ValidateIdentityAsync(string tckn, string name, string surname, CancellationToken cancellationToken = default);
}
