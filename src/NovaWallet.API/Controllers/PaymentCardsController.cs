using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;

namespace NovaWallet.API.Controllers;

[Authorize]
[Route("api/cards")]
public class PaymentCardsController : ApiControllerBase
{
    private readonly IPaymentCardService _paymentCardService;

    public PaymentCardsController(IPaymentCardService paymentCardService)
    {
        _paymentCardService = paymentCardService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PaymentCardSummary>>> GetMyCards([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var cards = await _paymentCardService.GetUserCardsAsync(userId, includeInactive, cancellationToken);
        return Ok(cards);
    }

    [HttpGet("{cardId:long}")]
    public async Task<ActionResult<PaymentCardDetail>> GetCard(long cardId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var card = await _paymentCardService.GetUserCardAsync(userId, cardId, cancellationToken);
        return Ok(card);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentCardDetail>> Create([FromBody] CreatePaymentCardRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var card = await _paymentCardService.CreateAsync(userId, request, cancellationToken);
        return Ok(card);
    }

    [HttpDelete("{cardId:long}")]
    public async Task<ActionResult> Deactivate(long cardId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _paymentCardService.DeactivateAsync(userId, cardId, cancellationToken);
        return Ok(new { deactivated = true });
    }
}
