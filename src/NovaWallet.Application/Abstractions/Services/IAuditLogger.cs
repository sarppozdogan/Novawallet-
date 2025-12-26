namespace NovaWallet.Application.Abstractions.Services;

public interface IAuditLogger
{
    Task LogAsync(string action, bool isSuccess, string ipAddress, long? userId = null, string? referenceId = null, string? details = null, CancellationToken cancellationToken = default);
}
