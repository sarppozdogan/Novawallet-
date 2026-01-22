namespace NovaWallet.Application.Abstractions.Services;

public interface IBankGateway
{
    Task<bool> RequestTopUpAsync(string sourceIban, decimal amount, string currencyCode, string referenceCode, CancellationToken cancellationToken = default);
    Task<bool> RequestWithdrawAsync(string destinationIban, decimal amount, string currencyCode, string referenceCode, CancellationToken cancellationToken = default);
}
