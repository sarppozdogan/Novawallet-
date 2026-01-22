using NovaWallet.Application.Abstractions.Services;

namespace NovaWallet.Infrastructure.Services;

public class VirtualBankMock : IBankGateway
{
    private const int ApprovalRate = 80;

    public Task<bool> RequestTopUpAsync(string sourceIban, decimal amount, string currencyCode, string referenceCode, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(IsApproved());
    }

    public Task<bool> RequestWithdrawAsync(string destinationIban, decimal amount, string currencyCode, string referenceCode, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(IsApproved());
    }

    private static bool IsApproved()
    {
        var value = Random.Shared.Next(1, 101);
        return value <= ApprovalRate;
    }
}
