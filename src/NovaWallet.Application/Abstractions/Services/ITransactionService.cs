using NovaWallet.Application.Models;

namespace NovaWallet.Application.Abstractions.Services;

public interface ITransactionService
{
    Task<TransactionResult> TopUpAsync(TopUpRequest request, string ipAddress, CancellationToken cancellationToken = default);
    Task<TransactionResult> P2PAsync(P2PRequest request, string ipAddress, CancellationToken cancellationToken = default);
    Task<TransactionResult> WithdrawAsync(WithdrawRequest request, string ipAddress, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TransactionSummary>> GetWalletTransactionsAsync(long walletId, CancellationToken cancellationToken = default);
    Task<TransactionDetail> GetTransactionByIdAsync(Guid transactionId, CancellationToken cancellationToken = default);
}
