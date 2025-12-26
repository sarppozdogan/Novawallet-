using System.Security.Cryptography;
using System.Text;
using NovaWallet.Application.Abstractions.Security;

namespace NovaWallet.Infrastructure.Services;

public class Sha256PasswordHasher : IPasswordHasher
{
    public string GenerateSalt()
    {
        var saltBytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(saltBytes);
    }

    public string HashPassword(string password, string salt)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password + salt);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }

    public bool VerifyPassword(string password, string salt, string hash)
    {
        var computed = HashPassword(password, salt);
        return string.Equals(computed, hash, StringComparison.OrdinalIgnoreCase);
    }
}
