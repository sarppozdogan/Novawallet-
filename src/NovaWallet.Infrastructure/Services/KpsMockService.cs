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

        if (string.IsNullOrWhiteSpace(tckn) || tckn.Length != 11 || tckn[0] == '0')
        {
            return Task.FromResult(false);
        }

        if (!tckn.All(char.IsDigit))
        {
            return Task.FromResult(false);
        }

        var digits = tckn.Select(c => c - '0').ToArray();

        var oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        var evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        var digit10 = ((oddSum * 7) - evenSum) % 10;
        if (digit10 < 0)
        {
            digit10 += 10;
        }

        if (digit10 != digits[9])
        {
            return Task.FromResult(false);
        }

        var sumFirst10 = digits.Take(10).Sum();
        var digit11 = sumFirst10 % 10;

        return Task.FromResult(digit11 == digits[10]);
    }
}
