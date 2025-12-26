namespace NovaWallet.Application.Abstractions.Services;

public interface IBankGateway
{
    Task<bool> RequestTopUpAsync(string sourceBank, decimal amount, string currencyCode, string referenceCode, CancellationToken cancellationToken = default);
    Task<bool> RequestWithdrawAsync(string iban, decimal amount, string currencyCode, string referenceCode, CancellationToken cancellationToken = default);
}
