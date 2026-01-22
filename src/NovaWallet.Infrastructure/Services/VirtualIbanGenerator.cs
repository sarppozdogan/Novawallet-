using System.Text;
using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;

namespace NovaWallet.Infrastructure.Services;

public class VirtualIbanGenerator : IVirtualIbanGenerator
{
    private const string CountryCode = "TR";
    private const int BbanLength = 24;
    private readonly INovaWalletDbContext _dbContext;

    public VirtualIbanGenerator(INovaWalletDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string> GenerateAsync(CancellationToken cancellationToken = default)
    {
        for (var attempt = 0; attempt < 20; attempt++)
        {
            var bban = GenerateRandomDigits(BbanLength);
            var checkDigits = CalculateCheckDigits(CountryCode, bban);
            var iban = $"{CountryCode}{checkDigits}{bban}";

            var exists = await _dbContext.Wallets.AnyAsync(w => w.VirtualIban == iban, cancellationToken);
            if (!exists)
            {
                return iban;
            }
        }

        throw new InvalidOperationException("Unable to generate virtual IBAN.");
    }

    private static string GenerateRandomDigits(int length)
    {
        var buffer = new char[length];
        for (var i = 0; i < length; i++)
        {
            buffer[i] = (char)('0' + Random.Shared.Next(0, 10));
        }

        return new string(buffer);
    }

    private static string CalculateCheckDigits(string countryCode, string bban)
    {
        var rearranged = $"{bban}{countryCode}00";
        var numeric = ConvertToNumeric(rearranged);
        var mod97 = Mod97(numeric);
        var check = 98 - mod97;
        return check.ToString("D2");
    }

    private static string ConvertToNumeric(string input)
    {
        var builder = new StringBuilder(input.Length * 2);
        foreach (var ch in input)
        {
            if (char.IsLetter(ch))
            {
                var value = char.ToUpperInvariant(ch) - 'A' + 10;
                builder.Append(value);
            }
            else
            {
                builder.Append(ch);
            }
        }

        return builder.ToString();
    }

    private static int Mod97(string numeric)
    {
        var remainder = 0;
        foreach (var ch in numeric)
        {
            remainder = (remainder * 10 + (ch - '0')) % 97;
        }

        return remainder;
    }
}
