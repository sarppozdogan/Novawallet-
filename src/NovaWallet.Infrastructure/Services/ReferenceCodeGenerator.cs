using NovaWallet.Application.Abstractions.Services;

namespace NovaWallet.Infrastructure.Services;

public class ReferenceCodeGenerator : IReferenceCodeGenerator
{
    public string Generate()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var suffix = Random.Shared.Next(0, 100000).ToString("D5");
        return $"TRX-{timestamp}-{suffix}";
    }
}
