namespace NovaWallet.Application.Abstractions.Security;

public interface IPasswordHasher
{
    string GenerateSalt();
    string HashPassword(string password, string salt);
    bool VerifyPassword(string password, string salt, string hash);
}
