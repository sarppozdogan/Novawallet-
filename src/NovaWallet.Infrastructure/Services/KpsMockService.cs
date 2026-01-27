using NovaWallet.Application.Abstractions.Services;

namespace NovaWallet.Infrastructure.Services;

public class KpsMockService : IKpsService
{
    public Task<bool> ValidateIdentityAsync(string tckn, string name, string surname, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(surname))
        {
            return Task.FromResult(false);
        }

        if (string.IsNullOrWhiteSpace(tckn) || tckn.Length != 11)
        {
            return Task.FromResult(false);
        }

        if (!tckn.All(char.IsDigit))
        {
            return Task.FromResult(false);
        }

        var digits = tckn.Select(c => c - '0').ToArray();

        var sumFirst10 = digits.Take(10).Sum();
        var digit11 = sumFirst10 % 10;

        return Task.FromResult(digit11 == digits[10]);
    }
}
