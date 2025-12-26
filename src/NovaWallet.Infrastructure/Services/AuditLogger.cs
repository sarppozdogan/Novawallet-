using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Domain.Entities;

namespace NovaWallet.Infrastructure.Services;

public class AuditLogger : IAuditLogger
{
    private readonly INovaWalletDbContext _dbContext;
    private readonly IDateTimeProvider _dateTimeProvider;

    public AuditLogger(INovaWalletDbContext dbContext, IDateTimeProvider dateTimeProvider)
    {
        _dbContext = dbContext;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task LogAsync(string action, bool isSuccess, string ipAddress, long? userId = null, string? referenceId = null, string? details = null, CancellationToken cancellationToken = default)
    {
        var log = new AuditLog
        {
            Action = action,
            IsSuccess = isSuccess,
            IpAddress = ipAddress,
            UserId = userId,
            ReferenceId = referenceId,
            Details = details,
            CreatedAt = _dateTimeProvider.UtcNow
        };

        _dbContext.AuditLogs.Add(log);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
