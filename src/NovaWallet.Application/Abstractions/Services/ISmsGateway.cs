namespace NovaWallet.Application.Abstractions.Services;

public interface ISmsGateway
{
    Task SendOtpAsync(long userId, string phone, CancellationToken cancellationToken = default);
    Task<bool> VerifyOtpAsync(string phone, string code, CancellationToken cancellationToken = default);
}
