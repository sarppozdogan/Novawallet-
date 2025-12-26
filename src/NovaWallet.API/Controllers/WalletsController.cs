using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;

namespace NovaWallet.API.Controllers;

[Authorize]
[Route("api/wallets")]
public class WalletsController : ApiControllerBase
{
    private readonly IWalletService _walletService;

    public WalletsController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<WalletSummary>>> GetMyWallets(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var wallets = await _walletService.GetUserWalletsAsync(userId, cancellationToken);
        return Ok(wallets);
    }

    [HttpGet("{walletId:long}")]
    public async Task<ActionResult<WalletSummary>> GetWallet(long walletId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var wallets = await _walletService.GetUserWalletsAsync(userId, cancellationToken);
        var wallet = wallets.FirstOrDefault(w => w.Id == walletId);
        if (wallet is null)
        {
            return NotFound();
        }

        return Ok(wallet);
    }
}
