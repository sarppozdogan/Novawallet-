using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Exceptions;
using NovaWallet.Application.Models;
using NovaWallet.Domain.Entities;
using NovaWallet.Domain.Enums;

namespace NovaWallet.Application.Services;

public class PaymentCardService : IPaymentCardService
{
    private readonly INovaWalletDbContext _dbContext;
    private readonly IDateTimeProvider _dateTimeProvider;

    public PaymentCardService(INovaWalletDbContext dbContext, IDateTimeProvider dateTimeProvider)
    {
        _dbContext = dbContext;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<IReadOnlyList<PaymentCardSummary>> GetUserCardsAsync(long userId, bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.PaymentCards.Where(c => c.UserId == userId);
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new PaymentCardSummary(c.Id, c.MaskedPan, c.CardHolderName, c.ExpiryMonth, c.ExpiryYear, c.Brand, c.IsActive))
            .ToListAsync(cancellationToken);
    }

    public async Task<PaymentCardDetail> GetUserCardAsync(long userId, long cardId, CancellationToken cancellationToken = default)
    {
        var card = await _dbContext.PaymentCards
            .Where(c => c.UserId == userId && c.Id == cardId)
            .Select(c => new PaymentCardDetail(c.Id, c.MaskedPan, c.CardHolderName, c.ExpiryMonth, c.ExpiryYear, c.Brand, c.IsActive, c.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        if (card is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Card not found.", 404);
        }

        return card;
    }

    public async Task<PaymentCardDetail> CreateAsync(long userId, CreatePaymentCardRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            throw new AppException(ErrorCodes.NotFound, "User not found.", 404);
        }

        if (user.Status == UserStatus.Blocked)
        {
            throw new AppException(ErrorCodes.Unauthorized, "User is blocked.", 403);
        }

        var cardNumber = NormalizeCardNumber(request.CardNumber);
        if (!IsValidCardNumber(cardNumber))
        {
            throw new AppException(ErrorCodes.ValidationError, "Card number is invalid.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.CardHolderName))
        {
            throw new AppException(ErrorCodes.ValidationError, "Card holder name is required.", 400);
        }

        if (request.CardHolderName.Length > 150)
        {
            throw new AppException(ErrorCodes.ValidationError, "Card holder name is too long.", 400);
        }

        if (request.ExpiryMonth is < 1 or > 12)
        {
            throw new AppException(ErrorCodes.ValidationError, "Expiry month is invalid.", 400);
        }

        if (request.ExpiryYear < 2000)
        {
            throw new AppException(ErrorCodes.ValidationError, "Expiry year is invalid.", 400);
        }

        var expiryDate = new DateTime(request.ExpiryYear, request.ExpiryMonth, 1).AddMonths(1).AddDays(-1);
        if (expiryDate < _dateTimeProvider.UtcNow.Date)
        {
            throw new AppException(ErrorCodes.ValidationError, "Card is expired.", 400);
        }

        var token = CreateToken(cardNumber);
        var existing = await _dbContext.PaymentCards
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CardToken == token, cancellationToken);

        if (existing is not null)
        {
            existing.IsActive = true;
            existing.CardHolderName = request.CardHolderName.Trim();
            existing.ExpiryMonth = request.ExpiryMonth;
            existing.ExpiryYear = request.ExpiryYear;
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new PaymentCardDetail(existing.Id, existing.MaskedPan, existing.CardHolderName, existing.ExpiryMonth, existing.ExpiryYear, existing.Brand, existing.IsActive, existing.CreatedAt);
        }

        var card = new PaymentCard
        {
            UserId = userId,
            CardToken = token,
            MaskedPan = MaskCardNumber(cardNumber),
            CardHolderName = request.CardHolderName.Trim(),
            ExpiryMonth = request.ExpiryMonth,
            ExpiryYear = request.ExpiryYear,
            Brand = GetBrand(cardNumber),
            IsActive = true,
            CreatedAt = _dateTimeProvider.UtcNow
        };

        _dbContext.PaymentCards.Add(card);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new PaymentCardDetail(card.Id, card.MaskedPan, card.CardHolderName, card.ExpiryMonth, card.ExpiryYear, card.Brand, card.IsActive, card.CreatedAt);
    }

    public async Task DeactivateAsync(long userId, long cardId, CancellationToken cancellationToken = default)
    {
        var card = await _dbContext.PaymentCards.FirstOrDefaultAsync(c => c.UserId == userId && c.Id == cardId, cancellationToken);
        if (card is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Card not found.", 404);
        }

        card.IsActive = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string NormalizeCardNumber(string cardNumber)
    {
        if (string.IsNullOrWhiteSpace(cardNumber))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(cardNumber.Length);
        foreach (var ch in cardNumber)
        {
            if (char.IsDigit(ch))
            {
                builder.Append(ch);
            }
        }

        return builder.ToString();
    }

    private static bool IsValidCardNumber(string cardNumber)
    {
        if (cardNumber.Length < 12 || cardNumber.Length > 19)
        {
            return false;
        }

        var sum = 0;
        var alternate = false;
        for (var i = cardNumber.Length - 1; i >= 0; i--)
        {
            var digit = cardNumber[i] - '0';
            if (alternate)
            {
                digit *= 2;
                if (digit > 9)
                {
                    digit -= 9;
                }
            }

            sum += digit;
            alternate = !alternate;
        }

        return sum % 10 == 0;
    }

    private static string MaskCardNumber(string cardNumber)
    {
        var last4 = cardNumber.Length >= 4 ? cardNumber[^4..] : cardNumber;
        return $"**** **** **** {last4}";
    }

    private static string CreateToken(string cardNumber)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(cardNumber);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }

    private static string GetBrand(string cardNumber)
    {
        return cardNumber.StartsWith("4", StringComparison.Ordinal) ? "Visa"
            : cardNumber.StartsWith("5", StringComparison.Ordinal) ? "Mastercard"
            : cardNumber.StartsWith("3", StringComparison.Ordinal) ? "Amex"
            : "Card";
    }
}
