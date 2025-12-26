using NovaWallet.Application.Models;

namespace NovaWallet.Application.Abstractions.Services;

public interface IAuthService
{
    Task<RegisterStartResult> RegisterStartAsync(RegisterStartRequest request, string ipAddress, CancellationToken cancellationToken = default);
    Task<bool> VerifyOtpAsync(VerifyOtpRequest request, string ipAddress, CancellationToken cancellationToken = default);
    Task<CompleteProfileResult> CompleteProfileAsync(CompleteProfileRequest request, string ipAddress, CancellationToken cancellationToken = default);
    Task<LoginResult> LoginAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken = default);
}
