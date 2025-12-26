using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Models;

namespace NovaWallet.API.Controllers;

[AllowAnonymous]
[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register/start")]
    public async Task<ActionResult<RegisterStartResult>> RegisterStart([FromBody] RegisterStartRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterStartAsync(request, GetClientIp(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("register/verify-otp")]
    public async Task<ActionResult> VerifyOtp([FromBody] VerifyOtpRequest request, CancellationToken cancellationToken)
    {
        await _authService.VerifyOtpAsync(request, GetClientIp(), cancellationToken);
        return Ok(new { verified = true });
    }

    [HttpPost("register/complete")]
    public async Task<ActionResult<CompleteProfileResult>> CompleteProfile([FromBody] CompleteProfileRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.CompleteProfileAsync(request, GetClientIp(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResult>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, GetClientIp(), cancellationToken);
        return Ok(result);
    }
}
