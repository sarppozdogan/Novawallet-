using Microsoft.Extensions.DependencyInjection;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Services;

namespace NovaWallet.Application.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IWalletService, WalletService>();
        services.AddScoped<ITransactionService, TransactionService>();
        services.AddScoped<ILimitService, LimitService>();

        return services;
    }
}
