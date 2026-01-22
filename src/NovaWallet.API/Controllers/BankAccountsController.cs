using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;

namespace NovaWallet.API.Controllers;

[Authorize]
[Route("api/bank-accounts")]
public class BankAccountsController : ApiControllerBase
{
    private readonly IBankAccountService _bankAccountService;

    public BankAccountsController(IBankAccountService bankAccountService)
    {
        _bankAccountService = bankAccountService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BankAccountSummary>>> GetMyBankAccounts([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var accounts = await _bankAccountService.GetUserBankAccountsAsync(userId, includeInactive, cancellationToken);
        return Ok(accounts);
    }

    [HttpGet("{bankAccountId:long}")]
    public async Task<ActionResult<BankAccountDetail>> GetBankAccount(long bankAccountId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var account = await _bankAccountService.GetUserBankAccountAsync(userId, bankAccountId, cancellationToken);
        return Ok(account);
    }

    [HttpPost]
    public async Task<ActionResult<BankAccountDetail>> Create([FromBody] CreateBankAccountRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var account = await _bankAccountService.CreateAsync(userId, request, cancellationToken);
        return Ok(account);
    }

    [HttpDelete("{bankAccountId:long}")]
    public async Task<ActionResult> Deactivate(long bankAccountId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _bankAccountService.DeactivateAsync(userId, bankAccountId, cancellationToken);
        return Ok(new { deactivated = true });
    }
}
