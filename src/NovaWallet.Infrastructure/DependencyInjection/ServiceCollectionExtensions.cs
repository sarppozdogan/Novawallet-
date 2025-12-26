using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Security;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;
using NovaWallet.Infrastructure.Persistence;
using NovaWallet.Infrastructure.Seed;
using NovaWallet.Infrastructure.Services;

namespace NovaWallet.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<NovaWalletDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sql => sql.MigrationsAssembly(typeof(NovaWalletDbContext).Assembly.FullName)));

        services.AddScoped<INovaWalletDbContext>(provider => provider.GetRequiredService<NovaWalletDbContext>());

        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.Configure<FeeSettings>(configuration.GetSection("FeeSettings"));
        services.Configure<OtpSettings>(configuration.GetSection("OtpSettings"));
        services.Configure<SystemWalletSettings>(configuration.GetSection("SystemWalletSettings"));

        services.AddScoped<IPasswordHasher, Sha256PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<ISmsGateway, SmsGatewayMock>();
        services.AddScoped<IKpsService, KpsMockService>();
        services.AddScoped<IBankGateway, VirtualBankMock>();
        services.AddScoped<IWalletNumberGenerator, WalletNumberGenerator>();
        services.AddSingleton<IReferenceCodeGenerator, ReferenceCodeGenerator>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<IAuditLogger, AuditLogger>();

        services.AddScoped<NovaWalletDbInitializer>();

        return services;
    }
}
