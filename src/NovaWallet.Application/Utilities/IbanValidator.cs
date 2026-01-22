using NovaWallet.Application.Exceptions;

namespace NovaWallet.Application.Utilities;

public static class IbanValidator
{
    public static string Normalize(string iban)
    {
        return iban.Replace(" ", string.Empty).ToUpperInvariant();
    }

    public static void EnsureValid(string iban)
    {
        if (string.IsNullOrWhiteSpace(iban))
        {
            throw new AppException(ErrorCodes.ValidationError, "IBAN is required.", 400);
        }

        var normalized = Normalize(iban);
        if (!normalized.StartsWith("TR", StringComparison.OrdinalIgnoreCase) || normalized.Length != 26)
        {
            throw new AppException(ErrorCodes.ValidationError, "IBAN format is invalid.", 400);
        }

        if (!normalized.Skip(2).All(char.IsDigit))
        {
            throw new AppException(ErrorCodes.ValidationError, "IBAN format is invalid.", 400);
        }
    }
}
