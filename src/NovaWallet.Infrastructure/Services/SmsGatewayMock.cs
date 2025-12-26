using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;
using NovaWallet.Domain.Entities;

namespace NovaWallet.Infrastructure.Services;

public class SmsGatewayMock : ISmsGateway
{
    private readonly INovaWalletDbContext _dbContext;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly OtpSettings _otpSettings;

    public SmsGatewayMock(INovaWalletDbContext dbContext, IDateTimeProvider dateTimeProvider, IOptions<OtpSettings> otpOptions)
    {
        _dbContext = dbContext;
        _dateTimeProvider = dateTimeProvider;
        _otpSettings = otpOptions.Value;
    }

    public async Task SendOtpAsync(long userId, string phone, CancellationToken cancellationToken = default)
    {
        var code = GenerateCode();
        var otp = new OtpCode
        {
            UserId = userId,
            Phone = phone,
            Code = code,
            CreatedAt = _dateTimeProvider.UtcNow,
            ExpiresAt = _dateTimeProvider.UtcNow.AddMinutes(_otpSettings.ExpiryMinutes),
            IsUsed = false
        };

        _dbContext.OtpCodes.Add(otp);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> VerifyOtpAsync(string phone, string code, CancellationToken cancellationToken = default)
    {
        var now = _dateTimeProvider.UtcNow;

        var otp = await _dbContext.OtpCodes
            .Where(o => o.Phone == phone && o.Code == code && !o.IsUsed && o.ExpiresAt >= now)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (otp is null)
        {
            return false;
        }

        otp.IsUsed = true;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string GenerateCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(4);
        var value = BitConverter.ToUInt32(bytes, 0) % 1000000;
        return value.ToString("D6");
    }
}
