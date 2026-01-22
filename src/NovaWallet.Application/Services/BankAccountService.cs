using Microsoft.EntityFrameworkCore;
using NovaWallet.Application.Abstractions.Persistence;
using NovaWallet.Application.Abstractions.Services;
using NovaWallet.Application.Exceptions;
using NovaWallet.Application.Models;
using NovaWallet.Application.Utilities;
using NovaWallet.Domain.Entities;

namespace NovaWallet.Application.Services;

public class BankAccountService : IBankAccountService
{
    private readonly INovaWalletDbContext _dbContext;
    private readonly IDateTimeProvider _dateTimeProvider;

    public BankAccountService(INovaWalletDbContext dbContext, IDateTimeProvider dateTimeProvider)
    {
        _dbContext = dbContext;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<IReadOnlyList<BankAccountSummary>> GetUserBankAccountsAsync(long userId, bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.BankAccounts.Where(b => b.UserId == userId);
        if (!includeInactive)
        {
            query = query.Where(b => b.IsActive);
        }

        return await query
            .OrderByDescending(b => b.Id)
            .Select(b => new BankAccountSummary(b.Id, b.Iban, b.BankName, b.AccountHolderName, b.IsActive))
            .ToListAsync(cancellationToken);
    }

    public async Task<BankAccountDetail> GetUserBankAccountAsync(long userId, long bankAccountId, CancellationToken cancellationToken = default)
    {
        var account = await _dbContext.BankAccounts
            .Where(b => b.UserId == userId && b.Id == bankAccountId)
            .Select(b => new BankAccountDetail(b.Id, b.Iban, b.BankName, b.AccountHolderName, b.IsActive, b.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        if (account is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Bank account not found.", 404);
        }

        return account;
    }

    public async Task<BankAccountDetail> CreateAsync(long userId, CreateBankAccountRequest request, CancellationToken cancellationToken = default)
    {
        var userExists = await _dbContext.Users.AnyAsync(u => u.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new AppException(ErrorCodes.NotFound, "User not found.", 404);
        }

        if (string.IsNullOrWhiteSpace(request.Iban))
        {
            throw new AppException(ErrorCodes.ValidationError, "IBAN is required.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.BankName))
        {
            throw new AppException(ErrorCodes.ValidationError, "Bank name is required.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.AccountHolderName))
        {
            throw new AppException(ErrorCodes.ValidationError, "Account holder name is required.", 400);
        }

        var bankName = request.BankName.Trim();
        var accountHolderName = request.AccountHolderName.Trim();

        if (bankName.Length > 128)
        {
            throw new AppException(ErrorCodes.ValidationError, "Bank name is too long.", 400);
        }

        if (accountHolderName.Length > 128)
        {
            throw new AppException(ErrorCodes.ValidationError, "Account holder name is too long.", 400);
        }

        var normalizedIban = IbanValidator.Normalize(request.Iban);
        IbanValidator.EnsureValid(normalizedIban);

        var existing = await _dbContext.BankAccounts.FirstOrDefaultAsync(b => b.Iban == normalizedIban, cancellationToken);
        if (existing is not null)
        {
            if (existing.UserId != userId)
            {
                throw new AppException(ErrorCodes.Conflict, "IBAN is already registered.", 409);
            }

            if (!existing.IsActive)
            {
                existing.IsActive = true;
                existing.BankName = bankName;
                existing.AccountHolderName = accountHolderName;
                await _dbContext.SaveChangesAsync(cancellationToken);

                return new BankAccountDetail(existing.Id, existing.Iban, existing.BankName, existing.AccountHolderName, existing.IsActive, existing.CreatedAt);
            }

            throw new AppException(ErrorCodes.Conflict, "Bank account already exists.", 409);
        }

        var account = new BankAccount
        {
            UserId = userId,
            Iban = normalizedIban,
            BankName = bankName,
            AccountHolderName = accountHolderName,
            IsActive = true,
            CreatedAt = _dateTimeProvider.UtcNow
        };

        _dbContext.BankAccounts.Add(account);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new BankAccountDetail(account.Id, account.Iban, account.BankName, account.AccountHolderName, account.IsActive, account.CreatedAt);
    }

    public async Task DeactivateAsync(long userId, long bankAccountId, CancellationToken cancellationToken = default)
    {
        var account = await _dbContext.BankAccounts.FirstOrDefaultAsync(b => b.UserId == userId && b.Id == bankAccountId, cancellationToken);
        if (account is null)
        {
            throw new AppException(ErrorCodes.NotFound, "Bank account not found.", 404);
        }

        if (!account.IsActive)
        {
            return;
        }

        account.IsActive = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
