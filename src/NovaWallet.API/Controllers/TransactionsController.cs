using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;

namespace NovaWallet.API.Controllers;

[Authorize]
[Route("api/transactions")]
public class TransactionsController : ApiControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly IWalletService _walletService;

    public TransactionsController(ITransactionService transactionService, IWalletService walletService)
    {
        _transactionService = transactionService;
        _walletService = walletService;
    }

    [HttpPost("topup")]
    public async Task<ActionResult<TransactionResult>> TopUp([FromBody] TopUpRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!await IsWalletOwnedAsync(request.WalletId, userId, cancellationToken))
        {
            return NotFound();
        }

        var result = await _transactionService.TopUpAsync(request, GetClientIp(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("p2p")]
    public async Task<ActionResult<TransactionResult>> P2P([FromBody] P2PRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!await IsWalletOwnedAsync(request.SenderWalletId, userId, cancellationToken))
        {
            return NotFound();
        }

        var result = await _transactionService.P2PAsync(request, GetClientIp(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("withdraw")]
    public async Task<ActionResult<TransactionResult>> Withdraw([FromBody] WithdrawRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!await IsWalletOwnedAsync(request.WalletId, userId, cancellationToken))
        {
            return NotFound();
        }

        var result = await _transactionService.WithdrawAsync(request, GetClientIp(), cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransactionSummary>>> GetTransactions([FromQuery] long walletId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (!await IsWalletOwnedAsync(walletId, userId, cancellationToken))
        {
            return NotFound();
        }

        var result = await _transactionService.GetWalletTransactionsAsync(walletId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{transactionId:guid}")]
    public async Task<ActionResult<TransactionDetail>> GetTransaction(Guid transactionId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var detail = await _transactionService.GetTransactionByIdAsync(transactionId, cancellationToken);

        var wallets = await _walletService.GetUserWalletsAsync(userId, cancellationToken);
        var walletNumbers = wallets.Select(w => w.WalletNumber).ToHashSet(StringComparer.OrdinalIgnoreCase);

        if ((detail.SenderWalletNumber is not null && !walletNumbers.Contains(detail.SenderWalletNumber))
            && (detail.ReceiverWalletNumber is not null && !walletNumbers.Contains(detail.ReceiverWalletNumber)))
        {
            return NotFound();
        }

        return Ok(detail);
    }

    private async Task<bool> IsWalletOwnedAsync(long walletId, long userId, CancellationToken cancellationToken)
    {
        var wallets = await _walletService.GetUserWalletsAsync(userId, cancellationToken);
        return wallets.Any(w => w.Id == walletId);
    }
}
