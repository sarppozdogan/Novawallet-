using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using NovaWallet.Application.Exceptions;

namespace NovaWallet.API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected long GetUserId()
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrWhiteSpace(subject) || !long.TryParse(subject, out var userId))
        {
            throw new AppException(ErrorCodes.Unauthorized, "Invalid token.", 401);
        }

        return userId;
    }

    protected string GetClientIp()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
