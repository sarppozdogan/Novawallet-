using NovaWallet.Domain.Entities;

namespace NovaWallet.Application.Abstractions.Security;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
